import * as XLSX from 'xlsx';
import type { DataRecord } from './types';
import { cleanseRecord, detectDuplicates, isPureInteger, type RawLead, type CleansedRecord } from './engine';

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
    // Pass 1: exact match
    for (const [k, v] of Object.entries(normalizedRow)) {
      if (
        patterns.some((p) => k === p) &&
        !excludePatterns.some((ep) => k.includes(ep))
      ) {
        if (v) return v;
      }
    }
    // Pass 2: substring match
    for (const [k, v] of Object.entries(normalizedRow)) {
      if (
        patterns.some((p) => k.includes(p)) &&
        !excludePatterns.some((ep) => k.includes(ep))
      ) {
        if (v) return v;
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
  let lastName = findVal(
    ['lastname', 'lname', 'last'],
    ['borrower', 'company', 'business', 'lender', 'fullname', 'repname', 'contactname', 'personname']
  );

  // If first name has a trailing comma (e.g. "Vacca," or "Chatterjee,"), it was inverted in source export
  if (firstName && firstName.endsWith(',')) {
    const actualLast = firstName.replace(/,+$/, '').trim();
    const actualFirst = (lastName || '').trim();
    firstName = actualFirst;
    lastName = actualLast;
  }

  // Explicit Contact Name only (Never treat BorrowerName as a person's full name)
  const fullName = findVal(
    ['contactname', 'personname', 'customername', 'fullname', 'repname', 'leadname'],
    ['borrower', 'company', 'business', 'lender']
  );

  if (!firstName && !lastName && fullName) {
    if (fullName.includes(',')) {
      const parts = fullName.split(',').map((p) => p.trim());
      lastName = parts[0];
      firstName = parts.slice(1).join(' ');
    } else {
      const parts = fullName.split(/\s+/);
      if (parts.length === 1) {
        firstName = parts[0];
        lastName = '';
      } else {
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }
    }
  }

  // Prevent duplicated first name in last name (e.g. "Miller" vs "David Miller")
  if (firstName && lastName) {
    const lParts = lastName.split(/\s+/);
    if (lParts.length > 1 && lParts[0].toLowerCase() === firstName.toLowerCase()) {
      lastName = lParts.slice(1).join(' ');
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

  // 5. Website domain extraction
  const rawWebsite = findVal(['website', 'domain', 'url', 'webpage', 'homepage']);
  let websiteDomain = '';
  if (rawWebsite) {
    try {
      let cleanUrl = rawWebsite.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }
      const parsedUrl = new URL(cleanUrl);
      websiteDomain = parsedUrl.hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      websiteDomain = rawWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
    }
  }

  const rawNotes = findVal(['notes', 'crmnotes', 'crm_notes', 'comment', 'description']);
  const rawDealArr = findVal(['dealarr', 'arr', 'deal_arr_usd', 'deal_value', 'revenue', 'amount']);

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
    domain: websiteDomain || undefined,
    notes: rawNotes || undefined,
    deal_arr: rawDealArr || undefined,
  };
}

export function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && i + 1 < len && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export async function streamParseCsv(
  file: File,
  maxRowsToIngest = 50000
): Promise<{ rawRows: Record<string, any>[]; rawHeaders: string[]; totalRows: number }> {
  let headers: string[] | null = null;
  const rawRows: Record<string, any>[] = [];
  let leftover = '';
  let lineCount = 0;

  // Modern browsers support file.stream() for non-blocking memory-safe streaming
  if (typeof (file as any).stream === 'function') {
    const reader = (file as any).stream().getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = leftover + decoder.decode(value, { stream: true });
      const lines = chunkText.split(/\r?\n/);
      leftover = lines.pop() || '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (!headers) {
          headers = parseCsvLine(line);
          continue;
        }

        lineCount++;
        if (rawRows.length < maxRowsToIngest) {
          const cells = parseCsvLine(line);
          const rowObj: Record<string, any> = {};
          const colLimit = Math.min(headers.length, cells.length);
          for (let c = 0; c < colLimit; c++) {
            rowObj[headers[c]] = cells[c] ?? '';
          }
          rawRows.push(rowObj);
        }

        // Yield to browser event loop every 2,500 lines so the UI stays 60fps responsive
        if (lineCount % 2500 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    }

    if (leftover.trim()) {
      const line = leftover.trim();
      if (!headers) {
        headers = parseCsvLine(line);
      } else {
        lineCount++;
        if (rawRows.length < maxRowsToIngest) {
          const cells = parseCsvLine(line);
          const rowObj: Record<string, any> = {};
          const colLimit = Math.min(headers.length, cells.length);
          for (let c = 0; c < colLimit; c++) {
            rowObj[headers[c]] = cells[c] ?? '';
          }
          rawRows.push(rowObj);
        }
      }
    }
  } else {
    // Slicing fallback for older browser engines
    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
    let offset = 0;
    while (offset < file.size) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const textChunk = leftover + (await slice.text());
      offset += CHUNK_SIZE;
      const lines = textChunk.split(/\r?\n/);
      leftover = lines.pop() || '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (!headers) {
          headers = parseCsvLine(line);
          continue;
        }

        lineCount++;
        if (rawRows.length < maxRowsToIngest) {
          const cells = parseCsvLine(line);
          const rowObj: Record<string, any> = {};
          const colLimit = Math.min(headers.length, cells.length);
          for (let c = 0; c < colLimit; c++) {
            rowObj[headers[c]] = cells[c] ?? '';
          }
          rawRows.push(rowObj);
        }

        if (lineCount % 2500 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    }

    if (leftover.trim()) {
      const line = leftover.trim();
      if (!headers) {
        headers = parseCsvLine(line);
      } else {
        lineCount++;
        if (rawRows.length < maxRowsToIngest) {
          const cells = parseCsvLine(line);
          const rowObj: Record<string, any> = {};
          const colLimit = Math.min(headers.length, cells.length);
          for (let c = 0; c < colLimit; c++) {
            rowObj[headers[c]] = cells[c] ?? '';
          }
          rawRows.push(rowObj);
        }
      }
    }
  }

  return {
    rawRows,
    rawHeaders: headers || [],
    totalRows: lineCount,
  };
}

/**
 * Parses any uploaded File (.csv, .xlsx, .xls) in-browser.
 * Enforces pre-ingestion domain fingerprinting with non-blocking streaming.
 */
export async function parseUploadedSpreadsheet(file: File): Promise<ParseResult> {
  const isCsv = file.name.toLowerCase().endsWith('.csv');

  let rawRows: Record<string, any>[] = [];
  let rawHeaders: string[] = [];
  let totalOriginalRows = 0;
  let wasSliced = false;

  if (isCsv) {
    // Ultra-fast streaming parse with 0 XLSX overhead and zero browser freeze
    const csvData = await streamParseCsv(file, 50000);
    rawRows = csvData.rawRows;
    rawHeaders = csvData.rawHeaders;
    totalOriginalRows = csvData.totalRows;
    wasSliced = csvData.totalRows > rawRows.length;
  } else {
    // Binary Excel file (.xlsx, .xls)
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Protect against formula evaluation truncation (e.g. DDE command injections starting with =)
    for (const cellAddress in worksheet) {
      if (cellAddress[0] === '!') continue;
      const cell = worksheet[cellAddress];
      if (cell && cell.f && (cell.v === undefined || cell.v === null || cell.v === '')) {
        cell.v = '=' + cell.f;
        cell.t = 's';
      }
    }

    rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    totalOriginalRows = rawRows.length;
    if (rawRows.length > 0) {
      rawHeaders.push(...Object.keys(rawRows[0]));
    }
    wasSliced = false;
  }

  // Pre-Ingestion Domain Fingerprint
  const domainProfile = profileDatasetDomain(rawHeaders);
  const targetRows = rawRows;

  // Cleanse all records with non-blocking event-loop yields every 2,500 rows so the browser UI never freezes
  const cleansed: CleansedRecord[] = [];
  const CHUNK_SIZE = 2500;
  for (let i = 0; i < targetRows.length; i++) {
    if (i > 0 && i % CHUNK_SIZE === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const rawLead = mapRowToRawLead(targetRows[i], i);
    cleansed.push(cleanseRecord(rawLead));
  }

  // Multi-Vector Duplicate Clustering (Email, Phone+Name, Company/Entity) with O(1) index lookup
  const dupClusters = detectDuplicates(cleansed);
  const byRecordId = new Map<string, CleansedRecord>();
  for (const c of cleansed) {
    byRecordId.set(c.record_id, c);
  }
  for (const [clusterKey, ids] of dupClusters) {
    const isCompany = clusterKey.startsWith('company:');
    const isPhone = clusterKey.startsWith('phone_lastname:');
    const matchType = isCompany ? 'entity' : (isPhone ? 'phone_lastname' : 'email');
    const score = isCompany ? 97.5 : (isPhone ? 95.8 : 99.4);

    const clusterRecs = ids.map((id) => byRecordId.get(id)).filter(Boolean) as CleansedRecord[];
    if (clusterRecs.length === 0) continue;

    // Identify Golden Master Record: prioritize legacy CRM (SF- or REC-), or earliest ingested
    const master = clusterRecs.find((r) => r.record_id.startsWith('SF-') || r.record_id.startsWith('REC-')) || clusterRecs[0];

    // Field-level Survivorship across cluster:
    // 1. Phone survivorship: inherit valid normalized E.164 phone from modern member if master phone is missing/purged
    if (!master.phone_clean || master.phone_clean.includes('[PURGED]')) {
      const donorPhone = clusterRecs.find((r) => r.phone_clean && !r.phone_clean.includes('[PURGED]'));
      if (donorPhone) {
        master.phone_clean = donorPhone.phone_clean;
        master.phone = donorPhone.phone || donorPhone.phone_clean;
      }
    }

    // 2. Job Title survivorship: inherit promoted/senior modern job title from 2026 sources if present
    const modernTitleDonor = clusterRecs.find((r) => {
      const t = (r.job_title_clean || r.job_title || '').toLowerCase();
      return (r.record_id.startsWith('AP-') || r.record_id.startsWith('EV-')) &&
        (t.includes('vp') || t.includes('ceo') || t.includes('chief') || t.includes('head') || t.includes('director') || t.includes('founder'));
    });
    if (modernTitleDonor && modernTitleDonor.job_title_clean) {
      master.job_title_clean = modernTitleDonor.job_title_clean;
      master.job_title = modernTitleDonor.job_title || modernTitleDonor.job_title_clean;
    }

    // 3. Email survivorship: inherit valid email from any member if master's email is missing
    if (!master.email_clean) {
      const donorEmail = clusterRecs.find((r) => r.email_clean);
      if (donorEmail) {
        master.email_clean = donorEmail.email_clean;
        master.email = donorEmail.email || donorEmail.email_clean;
      }
    }

    // 4. Deal ARR survivorship: pick max ARR across cluster
    let maxArr = 0;
    for (const r of clusterRecs) {
      const val = Number(r.deal_arr) || 0;
      if (val > maxArr) maxArr = val;
    }
    if (maxArr > 0) {
      master.deal_arr = maxArr;
    }

    // 5. CRM Notes survivorship: coalesce critical deal notes & GDPR opt-outs
    const noteParts: string[] = [];
    clusterRecs.forEach((r) => {
      if (r.notes && !noteParts.includes(r.notes)) {
        noteParts.push(r.notes);
      }
    });
    if (noteParts.length > 0) {
      master.notes = noteParts.join(' | ');
    }

    // Mark master record
    master.is_duplicate = true;
    master.duplicate_cluster_id = clusterKey;
    master.duplicate_type = matchType;
    master.match_score = score;
    (master as any).is_golden_master = true;
    (master as any).is_subordinate = false;
    master.triage_status = 'clean';
    if (!master.flag_tags.includes('DUPLICATE')) master.flag_tags.push('DUPLICATE');
    if (!master.flag_tags.includes('GOLDEN_RECORD_SYNTHESIZED')) master.flag_tags.push('GOLDEN_RECORD_SYNTHESIZED');

    // Mark subordinate duplicates
    clusterRecs.forEach((r) => {
      if (r.record_id !== master.record_id) {
        r.is_duplicate = true;
        r.duplicate_cluster_id = clusterKey;
        r.duplicate_type = matchType;
        r.match_score = score;
        (r as any).is_golden_master = false;
        (r as any).is_subordinate = true;
        r.triage_status = 'quarantined'; // Flagged for duplicate review
        r.quarantine_reason = `Duplicate ${matchType === 'entity' ? 'entity' : 'contact'} conflict: coalesced into Golden Record ${master.record_id}`;
        if (!r.flag_tags.includes('DUPLICATE')) r.flag_tags.push('DUPLICATE');
        if (!r.flag_tags.includes('DUPLICATE_SUBORDINATE_RETIRED')) r.flag_tags.push('DUPLICATE_SUBORDINATE_RETIRED');
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
    is_golden_master: (r as any).is_golden_master || false,
    is_subordinate: (r as any).is_subordinate || false,
    match_score: r.match_score || null,
    dataset_domain: domainProfile.profile,
    notes: r.notes || null,
    deal_arr: r.deal_arr != null ? r.deal_arr : null,
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
