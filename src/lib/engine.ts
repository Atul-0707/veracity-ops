import type { DataRecord, TriageStatus } from './types';

const DISPOSABLE_DOMAINS = ['test.test', 'mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com'];
const FAKE_PHONE_PATTERNS = [/^0+$/, /^9{10}$/, /^1{10}$/, /^12345/, /^\d{1,4}$/];
const SENTINEL_VALUES = ['NULL', 'N/A', 'null', 'n/a', 'na', 'NA', '', 'TBD', 'tbd', '???', 'none', 'NONE'];

function isSentinel(value: string | null | undefined): boolean {
  if (!value) return true;
  return SENTINEL_VALUES.includes(value.trim());
}

function capitalizeName(name: string): string {
  if (!name) return name;
  const parts = name.trim().toLowerCase().split(/[\s_-]+/);
  return parts
    .map((p) => {
      if (p.length === 0) return p;
      if (p.includes("'")) {
        return p.replace(/([a-z])'([a-z])/g, (_, a, b) => `${a}'${b.toUpperCase()}`);
      }
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(' ');
}

function repairMojibake(value: string): string {
  const mojibakeMap: Record<string, string> = {
    'Ã¢Â­': 'María',
    'GarcÃ­a': 'García',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Â¢': '',
    'â€™': "'",
    'â€œ': '"',
    'â€': '"',
  };
  let result = value;
  for (const [bad, good] of Object.entries(mojibakeMap)) {
    result = result.split(bad).join(good);
  }
  return result;
}

function defangEmail(email: string): string {
  return email
    .replace(/[~`#^*!]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/@@+/g, '@')
    .trim()
    .toLowerCase();
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.length < 7) return '[PURGED]';
  if (cleaned.startsWith('+1')) return `+1 ${cleaned.slice(1)}`;
  if (cleaned.startsWith('1') && cleaned.length === 11) return `+${cleaned}`;
  if (cleaned.length === 10) return `+1 ${cleaned}`;
  if (cleaned.startsWith('+')) return cleaned;
  return `+${cleaned}`;
}

function isFakePhone(phone: string): boolean {
  return FAKE_PHONE_PATTERNS.some((p) => p.test(phone.replace(/[^0-9]/g, '')));
}

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1] || '';
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function stripZeroWidthBytes(value: string): string {
  return value.replace(/[\u200B-\u200F\uFEFF\u00A0]/g, '').trim();
}

const FREEMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'mail.com'];

export function extractDomain(email: string | null | undefined): string | null {
  if (!email || !email.includes('@')) return null;
  const parts = email.split('@');
  return parts[1] ? parts[1].toLowerCase().trim() : null;
}

export function inferCompanyFromDomain(domain: string | null | undefined): string | null {
  if (!domain || FREEMAIL_DOMAINS.includes(domain)) return null;
  const mainPart = domain.split('.')[0];
  if (!mainPart || mainPart.length < 2) return null;
  return capitalizeName(mainPart);
}

export function classifySeniorityTier(title: string | null | undefined): 'Tier 1: Decision Maker' | 'Tier 2: Influencer' | 'Tier 3: Contributor' {
  if (!title) return 'Tier 3: Contributor';
  const t = title.toLowerCase();
  if (/\b(c[a-z]o|chief|president|vp|vice president|director|head of|founder|partner|owner)\b/.test(t)) {
    return 'Tier 1: Decision Maker';
  }
  if (/\b(manager|lead|supervisor|principal|architect|strategist|senior|sr)\b/.test(t)) {
    return 'Tier 2: Influencer';
  }
  return 'Tier 3: Contributor';
}

export function classifyDepartment(title: string | null | undefined): 'Executive' | 'Sales & RevOps' | 'Marketing' | 'Engineering / IT' | 'Finance / Legal' | 'General' {
  if (!title) return 'General';
  const t = title.toLowerCase();
  if (/\b(ceo|founder|president|coo|chief executive|owner|partner)\b/.test(t)) return 'Executive';
  if (/\b(sales|account executive|ae|sdr|bdr|revops|revenue|business development|commercial)\b/.test(t)) return 'Sales & RevOps';
  if (/\b(marketing|growth|content|seo|brand|demand|cmo)\b/.test(t)) return 'Marketing';
  if (/\b(engineer|developer|software|it|devops|data|cto|architect|tech)\b/.test(t)) return 'Engineering / IT';
  if (/\b(finance|cfo|accountant|controller|audit|legal|counsel)\b/.test(t)) return 'Finance / Legal';
  return 'General';
}

export function isPureInteger(val: string | null | undefined): boolean {
  if (!val) return false;
  return /^\d+$/.test(String(val).trim());
}

export function isOrganizationEntity(val: string | null | undefined): boolean {
  if (!val) return false;
  return /\b(inc|incorporated|llc|ltd|limited|corp|corporation|co|company|association|assoc|clinic|bank|foundation|services|enterprises|holdings|group|trust|agency|university|school|dept|department)\b/i.test(val);
}

export function isValidJobTitle(val: string | null | undefined): boolean {
  if (!val) return false;
  const trimmed = String(val).trim();
  if (/^\d+$/.test(trimmed)) return false; // Reject pure numbers like 62
  if (trimmed.length < 2) return false;
  return true;
}

export function normalizeCompanyForDedup(name: string | null | undefined): string {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"\\]/g, ' ')
    .replace(/\b(inc|incorporated|llc|ltd|limited|corp|corporation|co|company|association|assoc|group|holdings|services|enterprises|organization)\b/gi, ' ')
    .replace(/\b(and|&)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface CleansedRecord {
  record_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  country: string | null;
  region: string | null;
  first_name_clean: string | null;
  last_name_clean: string | null;
  email_clean: string | null;
  phone_clean: string | null;
  company_clean: string | null;
  job_title_clean: string | null;
  domain?: string | null;
  seniority_tier?: string | null;
  department?: string | null;
  inferred_company?: boolean;
  entity_type?: 'individual' | 'organization';
  triage_status: TriageStatus;
  quarantine_reason: string | null;
  flag_tags: string[];
  health_score: number;
  is_duplicate: boolean;
  duplicate_cluster_id?: string | null;
  duplicate_type?: 'email' | 'phone_lastname' | 'entity' | null;
  match_score?: number | null;
}

export function cleanseRecord(raw: {
  record_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  country?: string | null;
  region?: string | null;
}): CleansedRecord {
  const flags: string[] = [];
  let triage: TriageStatus = 'clean';
  let quarantineReason: string | null = null;
  let healthScore = 100;

  const firstName = raw.first_name ? repairMojibake(stripZeroWidthBytes(raw.first_name)) : null;
  const lastName = raw.last_name ? repairMojibake(stripZeroWidthBytes(raw.last_name)) : null;
  const email = raw.email ? defangEmail(stripZeroWidthBytes(raw.email)) : null;
  const phone = raw.phone ? stripZeroWidthBytes(raw.phone) : null;
  const company = raw.company ? repairMojibake(stripZeroWidthBytes(raw.company)) : null;
  const jobTitle = raw.job_title ? repairMojibake(stripZeroWidthBytes(raw.job_title)) : null;
  const country = raw.country || null;
  const region = raw.region || null;

  // Determine if record is an Organization Entity or Individual Lead
  const isOrg = Boolean(
    (company && isOrganizationEntity(company)) ||
    (!firstName && !lastName && company)
  );
  const entityType: 'individual' | 'organization' = isOrg ? 'organization' : 'individual';

  // Clean name
  const firstNameClean = isSentinel(firstName) ? null : capitalizeName(firstName);
  const lastNameClean = isSentinel(lastName) ? null : capitalizeName(lastName);
  if (!firstNameClean && !lastNameClean) {
    if (entityType === 'individual') {
      flags.push('MISSING_NAME');
      healthScore -= 25;
    }
  }

  // Clean email
  let emailClean = email;
  if (email && !isSentinel(email)) {
    emailClean = defangEmail(email);
    if (!isValidEmail(emailClean)) {
      flags.push('INVALID_EMAIL');
      healthScore -= 20;
    }
    if (isDisposableEmail(emailClean)) {
      flags.push('DISPOSABLE_EMAIL');
      triage = 'quarantined';
      quarantineReason = 'Disposable email domain';
      healthScore -= 40;
    }
  } else {
    if (entityType === 'individual') {
      flags.push('MISSING_EMAIL');
      healthScore -= 15;
    }
  }

  // Clean phone
  let phoneClean = phone;
  if (phone && !isSentinel(phone)) {
    if (isFakePhone(phone)) {
      flags.push('FAKE_PHONE');
      phoneClean = '[PURGED]';
      triage = 'quarantined';
      quarantineReason = quarantineReason || 'Fake phone number';
      healthScore -= 35;
    } else {
      phoneClean = normalizePhone(phone);
      flags.push('FORMATTED');
    }
  } else {
    phoneClean = null;
  }

  // Strict Identity Boundary Check (Layer 4: Honest Health Scoring)
  if (entityType === 'individual' && (!email || isSentinel(email)) && (!phone || isSentinel(phone))) {
    flags.push('MISSING_IDENTITY_KEYS');
    triage = 'quarantined';
    quarantineReason = quarantineReason || 'Missing all contact identity vectors: no email or phone provided';
    healthScore = Math.min(healthScore, 25);
  }

  if (entityType === 'organization' && !company) {
    flags.push('MISSING_ENTITY_NAME');
    triage = 'quarantined';
    quarantineReason = quarantineReason || 'Missing organization entity name';
    healthScore = Math.min(healthScore, 20);
  }

  // Clean company & job title with strict semantic type guards
  const companyClean = isSentinel(company) ? null : capitalizeName(company);
  let jobTitleClean: string | null = null;
  if (jobTitle && !isSentinel(jobTitle)) {
    if (!isValidJobTitle(jobTitle)) {
      flags.push('SEMANTIC_TYPE_VIOLATION');
      triage = 'quarantined';
      quarantineReason = 'Invalid job title: numeric or corrupted format detected';
      healthScore -= 25;
      jobTitleClean = null;
    } else {
      jobTitleClean = capitalizeName(jobTitle);
    }
  }

  // Enrich & Segment (Domain extraction, company auto-association, ICP tiering)
  const domain = extractDomain(emailClean);
  let finalCompanyClean = companyClean;
  let inferredCompany = false;
  if (!finalCompanyClean && domain) {
    const inferred = inferCompanyFromDomain(domain);
    if (inferred) {
      finalCompanyClean = inferred;
      inferredCompany = true;
      flags.push('COMPANY_INFERRED');
    }
  }

  const seniorityTier = jobTitleClean
    ? classifySeniorityTier(jobTitleClean)
    : (entityType === 'organization' ? 'Corporate Entity' : null);
  const department = jobTitleClean
    ? classifyDepartment(jobTitleClean)
    : (entityType === 'organization' ? 'Enterprise / Institutional' : null);

  if (flags.length === 0 || (flags.length === 1 && flags[0] === 'FORMATTED')) {
    triage = 'clean';
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    record_id: raw.record_id,
    first_name: firstName,
    last_name: lastName,
    email: raw.email,
    phone: raw.phone,
    company: raw.company,
    job_title: raw.job_title,
    country,
    region,
    first_name_clean: firstNameClean,
    last_name_clean: lastNameClean,
    email_clean: emailClean,
    phone_clean: phoneClean,
    company_clean: finalCompanyClean,
    job_title_clean: jobTitleClean,
    domain,
    seniority_tier: seniorityTier,
    department,
    inferred_company: inferredCompany,
    entity_type: entityType,
    triage_status: triage,
    quarantine_reason: quarantineReason,
    flag_tags: flags,
    health_score: healthScore,
    is_duplicate: false,
  };
}

export function detectDuplicates(records: CleansedRecord[]): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const byEmail = new Map<string, string[]>();
  const byPhoneLast = new Map<string, string[]>();
  const byCompany = new Map<string, string[]>();

  for (const r of records) {
    if (r.email_clean && !r.email_clean.includes('[PURGED]')) {
      const key = r.email_clean.toLowerCase();
      if (!byEmail.has(key)) byEmail.set(key, []);
      byEmail.get(key)!.push(r.record_id);
    }
    if (r.phone_clean && !r.phone_clean.includes('[PURGED]') && r.last_name_clean) {
      const key = `${r.phone_clean}_${r.last_name_clean.toLowerCase()}`;
      if (!byPhoneLast.has(key)) byPhoneLast.set(key, []);
      byPhoneLast.get(key)!.push(r.record_id);
    }
    const compNorm = normalizeCompanyForDedup(r.company_clean || r.company);
    if (compNorm && compNorm.length >= 3) {
      if (!byCompany.has(compNorm)) byCompany.set(compNorm, []);
      byCompany.get(compNorm)!.push(r.record_id);
    }
  }

  for (const [key, ids] of byEmail) {
    if (ids.length > 1) clusters.set(`email:${key}`, ids);
  }
  for (const [key, ids] of byPhoneLast) {
    if (ids.length > 1) clusters.set(`phone_lastname:${key}`, ids);
  }
  for (const [key, ids] of byCompany) {
    if (ids.length > 1) clusters.set(`company:${key}`, ids);
  }

  return clusters;
}

export interface ClusterGroup {
  clusterId: string;
  clusterName: string;
  matchType: 'email' | 'phone_lastname' | 'entity';
  matchScore: number;
  records: DataRecord[];
}

/**
 * Groups DataRecords into duplicate clusters across all 3 matching vectors (Email, Phone+Name, Entity).
 * Feeds directly into Tab 3: Merge Duplicates Studio.
 */
export function groupRecordsIntoClusters(records: DataRecord[]): ClusterGroup[] {
  const clusters: ClusterGroup[] = [];
  const assigned = new Set<string>();

  const addCluster = (
    groupRecs: DataRecord[],
    matchType: 'email' | 'phone_lastname' | 'entity',
    clusterName: string,
    score: number
  ) => {
    const unassigned = groupRecs.filter((r) => !assigned.has(r.id));
    if (unassigned.length > 1) {
      unassigned.forEach((r) => assigned.add(r.id));
      clusters.push({
        clusterId: `cluster-${clusters.length + 1}`,
        clusterName,
        matchType,
        matchScore: score,
        records: unassigned,
      });
    }
  };

  // 1. Vector A: Email Match
  const byEmail = new Map<string, DataRecord[]>();
  for (const r of records) {
    if (r.email_clean && !r.email_clean.includes('[PURGED]')) {
      const k = r.email_clean.toLowerCase();
      if (!byEmail.has(k)) byEmail.set(k, []);
      byEmail.get(k)!.push(r);
    }
  }
  for (const [email, recs] of byEmail) {
    if (recs.length > 1) {
      const name = recs[0].first_name_clean ? `${recs[0].first_name_clean} ${recs[0].last_name_clean || ''}`.trim() : email;
      addCluster(recs, 'email', name, 99.4);
    }
  }

  // 2. Vector B: Phone + Last Name Match
  const byPhoneLast = new Map<string, DataRecord[]>();
  for (const r of records) {
    if (r.phone_clean && !r.phone_clean.includes('[PURGED]') && r.last_name_clean) {
      const k = `${r.phone_clean}_${r.last_name_clean.toLowerCase()}`;
      if (!byPhoneLast.has(k)) byPhoneLast.set(k, []);
      byPhoneLast.get(k)!.push(r);
    }
  }
  for (const [, recs] of byPhoneLast) {
    if (recs.length > 1) {
      const name = `${recs[0].first_name_clean || ''} ${recs[0].last_name_clean || ''}`.trim();
      addCluster(recs, 'phone_lastname', name || 'Matching Phone & Name', 95.8);
    }
  }

  // 3. Vector C: Company / Borrower Entity Match (Fuzzy legal suffix normalized)
  const byCompany = new Map<string, DataRecord[]>();
  for (const r of records) {
    const compNorm = normalizeCompanyForDedup(r.company_clean || r.company);
    if (compNorm && compNorm.length >= 3) {
      if (!byCompany.has(compNorm)) byCompany.set(compNorm, []);
      byCompany.get(compNorm)!.push(r);
    }
  }
  for (const [, recs] of byCompany) {
    if (recs.length > 1) {
      const entityName = recs[0].company_clean || recs[0].company || 'Corporate Entity';
      addCluster(recs, 'entity', entityName, 97.5);
    }
  }

  return clusters;
}

export function calculateHealthScore(records: CleansedRecord[]): number {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => sum + r.health_score, 0);
  return Math.round((total / records.length) * 100) / 100;
}

export function calculateSdrHoursSaved(quarantinedCount: number): number {
  const minutesPerBadRecord = 6;
  return Math.round((quarantinedCount * minutesPerBadRecord) / 60 * 100) / 100;
}

export function calculatePayrollSaved(hoursSaved: number, hourlyRate = 35): number {
  return Math.round(hoursSaved * hourlyRate * 100) / 100;
}

export interface RawLeadRow {
  record_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  country: string;
  region: string;
}

export const SAMPLE_LEAD_DATA: RawLeadRow[] = [
  { record_id: 'REC-00201', first_name: 'JENNIFER', last_name: 'WALSH', email: 'j.walsh@@@meridian.com', phone: '(312) 555-0188', company: 'meridian partners', job_title: 'vp sales', country: 'US', region: 'Midwest' },
  { record_id: 'REC-00202', first_name: 'tom', last_name: 'zheng', email: 'tom.zheng@cloudify.io', phone: '415-555-0177', company: 'Cloudify', job_title: 'cto', country: 'US', region: 'West' },
  { record_id: 'REC-00203', first_name: 'NULL', last_name: 'NULL', email: 'contact@tempmail.com', phone: '0000000000', company: '', job_title: '', country: 'US', region: 'Northeast' },
  { record_id: 'REC-00204', first_name: 'alexis', last_name: 'thompson', email: 'alexis.t@northstar.com', phone: '+1 212-555-0199', company: 'NorthStar Capital', job_title: 'Managing Director', country: 'US', region: 'Northeast' },
  { record_id: 'REC-00205', first_name: 'pierre', last_name: 'dubois', email: 'pierre.dubois@entreprise.fr', phone: '+33 1 42 86 33 22', company: 'Entreprise SAS', job_title: 'Directeur Commercial', country: 'FR', region: 'EMEA' },
  { record_id: 'REC-00206', first_name: 'tom', last_name: 'zheng', email: 'tom.zheng@cloudify.io', phone: '415-555-0177', company: 'Cloudify Inc', job_title: 'Chief Technology Officer', country: 'US', region: 'West' },
  { record_id: 'REC-00207', first_name: 'KAREN', last_name: 'mitchell', email: '~k.mitchell@healthlink~', phone: '555.666.7777', company: 'healthlink systems', job_title: 'CFO', country: 'US', region: 'South' },
  { record_id: 'REC-00208', first_name: 'raj', last_name: 'patel', email: 'raj.patel@logisticsltd.com', phone: '+44 20 7946 0821', company: 'Logistics Ltd', job_title: 'Head of Operations', country: 'UK', region: 'EMEA' },
  { record_id: 'REC-00209', first_name: 'amanda', last_name: 'cruz', email: 'amanda.cruz@vantage.com', phone: '305-555-0144', company: 'Vantage Group', job_title: 'SVP Strategy', country: 'US', region: 'South' },
  { record_id: 'REC-00210', first_name: '', last_name: '', email: 'test@10minutemail.com', phone: '123', company: 'N/A', job_title: 'N/A', country: 'US', region: 'West' },
  { record_id: 'REC-00211', first_name: 'olivia', last_name: 'bennett', email: 'olivia.bennett@summit.org', phone: '+1 646-555-0133', company: 'Summit Foundation', job_title: 'Executive Director', country: 'US', region: 'Northeast' },
  { record_id: 'REC-00212', first_name: 'marcus', last_name: 'goldberg', email: 'm.goldberg@summit.org', phone: '+1 646-555-0133', company: 'Summit Foundation', job_title: 'Board Chair', country: 'US', region: 'Northeast' },
];
