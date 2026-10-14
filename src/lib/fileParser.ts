import * as XLSX from 'xlsx';
import type { DataRecord } from './types';
import { cleanseRecord, detectDuplicates, isPureInteger, type RawLead } from './engine';

export interface DomainProfile {
  profile: 'CRM_LEADS' | 'FINANCIAL_PORTFOLIO' | 'GENERIC';
  label: string;
  confidence: number;
  alienIndicators: string[];
  crmIndicators: string[];
}

export interface ParseResult {
  records: DataRecord[];
  totalOriginalRows: number;
  processedRows: number;
  wasSliced: boolean;
  filename: string;
  domainProfile: DomainProfile;
  headers: string[];
  detectedColumnsCount: number;
}

/**
 * Normalizes header keys to standard lowercase alphanumeric strings for fuzzy matching.
 */
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Profiles the raw column headers before parsing to prevent context-blind schema collisions.
 */
export function profileDatasetDomain(headers: string[]): DomainProfile {
  const normalized = headers.map((h) => normalizeHeader(h));

  const financialTokens = [
    'loannumber', 'loan', 'sba', 'naics', 'forgiveness', 'proceed',
    'lender', 'borrower', 'franchise', 'jobsreported', 'payroll'
  ];
  const crmTokens = [
    'email', 'phone', 'lead', 'contact', 'jobtitle', 'salesforce', 'hubspot'
  ];

  const foundFinancial = headers.filter((_, i) =>
    financialTokens.some((t) => normalized[i].includes(t))
  );
  const foundCrm = headers.filter((_, i) =>
    crmTokens.some((t) => normalized[i].includes(t))
  );

  if (foundFinancial.length >= 3) {
    return {
      profile: 'FINANCIAL_PORTFOLIO',
      label: 'Federal Financial / Loan Portfolio',
      confidence: Math.min(99, 65 + foundFinancial.length * 4),
      alienIndicators: foundFinancial,
      crmIndicators: foundCrm,
    };
  }

  if (foundCrm.length >= 2) {
    return {
      profile: 'CRM_LEADS',
      label: 'B2B Sales CRM Contact List',
      confidence: Math.min(98, 70 + foundCrm.length * 5),
      alienIndicators: [],
      crmIndicators: foundCrm,
    };
  }

  return {
    profile: 'GENERIC',
    label: 'Standard Enterprise Master Dataset',
    confidence: 80,
    alienIndicators: foundFinancial,
    crmIndicators: foundCrm,
  };
}

/**
 * Maps arbitrary CSV / Excel columns into a standardized RawLead object with semantic boundaries.
 */
function mapRowToRawLead(row: Record<string, any>, idx: number): RawLead {
  const normalizedRow: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    normalizedRow[normalizeHeader(k)] = v != null ? String(v).trim() : '';
  }

  const findVal = (patterns: string[], excludePatterns: string[] = []): string => {
    for (const [k, v] of Object.entries(normalizedRow)) {
      if (
        patterns.some((p) => k.includes(p)) &&
        !excludePatterns.some((ep) => k.includes(ep))
      ) {
        return v;
      }
    }
    return '';
  };

  // 1. Primary Record ID: Prioritize LoanNumber, RecordID, UUID
  const idVal =
    findVal(['loannumber', 'loan_number', 'recordid', 'leadid', 'id', 'uuid', 'record']) ||
    `REC-${String(idx + 1).padStart(5, '0')}`;

  // 2. Organization / Entity Mapping: Borrower, Company, Account
  const companyVal = findVal([
    'borrowername', 'borrower', 'businessname', 'companyname', 'company',
    'organization', 'account', 'firm', 'vendor', 'entity', 'client'
  ]);

  // 3. Human Name Split: Exclude borrower/company/business/lender headers from name mapping
  let firstName = findVal(['firstname', 'fname', 'first'], ['borrower', 'company', 'business', 'lender']);
  let lastName = findVal(['lastname', 'lname', 'last'], ['borrower', 'company', 'business', 'lender']);

  // Explicit Contact Name only (Never treat BorrowerName as a person's full name)
  const fullName = findVal(
    ['contactname', 'personname', 'customername', 'fullname', 'repname', 'leadname'],
    ['borrower', 'company', 'business', 'lender']
  );

  if (!firstName && !lastName && fullName) {
    const parts = fullName.split(/\s+/);
    if (parts.length === 1) {
      firstName = parts[0];
      lastName = '';
    } else {
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }
  }

  // 4. Job Title: Strictly exclude counts like JobsReported
  let rawJobTitle = findVal(
    ['jobtitle', 'job_title', 'designation', 'occupation', 'position', 'role'],
    ['jobsreported', 'jobcount', 'jobtotal', 'borrower', 'company']
  );
  if (!rawJobTitle) {
    rawJobTitle = findVal(
      ['title'],
      ['jobsreported', 'jobcount', 'jobtotal', 'borrower', 'company', 'franchise', 'lender']
    );
  }
  // Semantic Type Guard: Integer values (e.g. 62) are invalid job titles
  const jobTitle = isPureInteger(rawJobTitle) ? '' : rawJobTitle;

  return {
    record_id: idVal,
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    email: findVal(['email', 'mail', 'e_mail']) || undefined,
    phone: findVal(['phone', 'mobile', 'tel', 'cell']) || undefined,
    company: companyVal || undefined,
    job_title: jobTitle || undefined,
    country: findVal(['country', 'nation']) || 'US',
    region: findVal(['borrowerstate', 'projectstate', 'state', 'region', 'territory', 'province']) || undefined,
  };
}

/**
 * Parses any uploaded File (.csv, .xlsx, .xls) in-browser.
 * Enforces pre-ingestion domain fingerprinting and the strict 500-record diagnostic ceiling.
 */
export async function parseUploadedSpreadsheet(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const isCsv = file.name.toLowerCase().endsWith('.csv');

  // Ultra-fast line count scanner for CSVs without parsing cell objects
  let totalOriginalRows = 0;
  if (isCsv) {
    const bytes = new Uint8Array(arrayBuffer);
    let count = 0;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 10) count++;
    }
    totalOriginalRows = Math.max(0, count - 1); // exclude header
  }

  // Parse only up to 501 rows with SheetJS to protect browser main-thread event loop from freezing
  const workbook = XLSX.read(arrayBuffer, { type: 'array', sheetRows: 501 });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // For Excel files, read total rows from worksheet range metadata if available
  if (!isCsv && worksheet['!ref']) {
    const match = worksheet['!ref'].match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (match) {
      totalOriginalRows = Math.max(0, parseInt(match[4], 10) - parseInt(match[2], 10));
    }
  }

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (totalOriginalRows === 0) {
    totalOriginalRows = rawRows.length;
  }

  // Extract raw column headers
  const rawHeaders: string[] = [];
  if (rawRows.length > 0) {
    rawHeaders.push(...Object.keys(rawRows[0]));
  }

  // Pre-Ingestion Domain Fingerprint
  const domainProfile = profileDatasetDomain(rawHeaders);

  const wasSliced = totalOriginalRows > 500;
  const targetRows = rawRows.slice(0, 500);

  // Cleanse each record with semantic validation
  const cleansed = targetRows.map((row, idx) => {
    const rawLead = mapRowToRawLead(row, idx);
    return cleanseRecord(rawLead);
  });

  // Multi-Vector Duplicate Clustering (Email, Phone+Name, Company/Entity)
  const dupClusters = detectDuplicates(cleansed);
  for (const [clusterKey, ids] of dupClusters) {
    const isCompany = clusterKey.startsWith('company:');
    const isPhone = clusterKey.startsWith('phone_lastname:');
    const matchType = isCompany ? 'entity' : (isPhone ? 'phone_lastname' : 'email');
    const score = isCompany ? 97.5 : (isPhone ? 95.8 : 99.4);

    ids.forEach((id, idx) => {
      const r = cleansed.find((x) => x.record_id === id);
      if (r) {
        r.is_duplicate = true;
        r.duplicate_cluster_id = clusterKey;
        r.duplicate_type = matchType;
        r.match_score = score;
        if (!r.flag_tags.includes('DUPLICATE')) {
          r.flag_tags.push('DUPLICATE');
        }
        // Subordinate duplicate is quarantined for Golden Record review
        if (idx > 0) {
          r.triage_status = 'quarantined';
          r.quarantine_reason = `Duplicate ${matchType === 'entity' ? 'entity' : 'contact'} conflict: matches record ${ids[0]}`;
          r.health_score = Math.max(25, r.health_score - 30);
        }
      }
    });
  }

  const records: DataRecord[] = cleansed.map((r) => ({
    id: `rec-${r.record_id}-${Math.random().toString(36).slice(2, 7)}`,
    batch_run_id: `run-${Date.now()}`,
    workspace_id: 'demo-sandbox',
    record_id: r.record_id,
    first_name: r.first_name,
    last_name: r.last_name,
    email: r.email,
    phone: r.phone,
    company: r.company,
    job_title: r.job_title,
    country: r.country,
    region: r.region,
    first_name_clean: r.first_name_clean,
    last_name_clean: r.last_name_clean,
    email_clean: r.email_clean,
    phone_clean: r.phone_clean,
    company_clean: r.company_clean,
    job_title_clean: r.job_title_clean,
    domain: r.domain,
    seniority_tier: r.seniority_tier,
    department: r.department,
    inferred_company: r.inferred_company,
    entity_type: r.entity_type,
    triage_status: r.triage_status,
    quarantine_reason: r.quarantine_reason,
    flag_tags: r.flag_tags,
    health_score: r.health_score,
    is_duplicate: r.is_duplicate,
    duplicate_cluster_id: r.duplicate_cluster_id || null,
    duplicate_type: r.duplicate_type || null,
    match_score: r.match_score || null,
    dataset_domain: domainProfile.profile,
    created_at: new Date().toISOString(),
  }));

  return {
    records,
    totalOriginalRows,
    processedRows: records.length,
    wasSliced,
    filename: file.name,
    domainProfile,
    headers: rawHeaders,
    detectedColumnsCount: rawHeaders.length,
  };
}
