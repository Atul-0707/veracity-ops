import type { DataRecord, TriageStatus } from './types';

export interface RawLead {
  record_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  country?: string | null;
  region?: string | null;
  domain?: string | null;
  notes?: string | null;
  deal_arr?: string | number | null;
}

const DISPOSABLE_DOMAINS = ['test.test', 'mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com', 'yopmail.com', 'example.com'];
const FAKE_PHONE_PATTERNS = [
  /^0+$/,
  /^9{7,}$/,
  /^1{7,}$/,
  /^5{7,}$/,
  /^12345/,
  /^1112223333$/,
  /^\d{1,6}$/
];
const SENTINEL_VALUES = ['NULL', 'N/A', 'null', 'n/a', 'na', 'NA', '', 'TBD', 'tbd', '???', 'none', 'NONE', 'unknown', 'UNKNOWN'];

function isSentinel(value: string | null | undefined): boolean {
  if (!value) return true;
  return SENTINEL_VALUES.includes(value.trim());
}

export function defangFormula(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^([=@]|[-+](?![0-9\s()\-.]+$))/i.test(trimmed)) {
    return `'${trimmed}`;
  }
  return value;
}

export function isDummyLead(val: string | null | undefined): boolean {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  if (/^(asdf|qwerty|zxcv|1234|qwer|lkjh|poiu)/i.test(v)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{6,}$/i.test(v)) return true;
  if (v === 'test user' || v === 'test company' || v === 'tester') return true;
  if (v.includes('mickey mouse')) return true;
  return false;
}

function capitalizeName(name: string | null | undefined): string | null {
  if (!name) return null;
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
    'Ã¼': 'ü',
    'Ã§': 'ç',
    'Ã®': 'î',
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

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (isFakePhone(trimmed)) return '[PURGED]';

  const extMatch = trimmed.match(/(?:ext\.?|x|#|;)\s*(\d+)/i);
  const ext = extMatch ? extMatch[1] : null;
  const baseOnly = trimmed.split(/(?:ext\.?|x|#|;)/i)[0].trim();

  let cleaned = baseOnly.replace(/[^0-9+]/g, '');
  if (cleaned.length < 7) return '[PURGED]';

  cleaned = cleaned.replace(/^\+([0-9]{2,3})0([0-9]+)$/, '+$1$2');

  let formatted = '';
  if (cleaned.startsWith('+1')) {
    formatted = `+1 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    formatted = `+1 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    formatted = `+1 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    formatted = `+44 ${cleaned.slice(1)}`;
  } else if (cleaned.startsWith('+')) {
    formatted = cleaned;
  } else {
    formatted = `+${cleaned}`;
  }

  return ext ? `${formatted} ext ${ext}` : formatted;
}

export function getBasePhoneForMatching(phone: string | null | undefined): string | null {
  if (!phone || phone.includes('[PURGED]')) return null;
  const baseOnly = phone.split(/(?:ext\.?|x|#|;)/i)[0].trim();
  const digits = baseOnly.replace(/\D/g, '');
  if (digits.length < 7) return null;
  if (isFakePhone(digits)) return null;
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function isFakePhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '');
  return FAKE_PHONE_PATTERNS.some((p) => p.test(digits));
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
  notes?: string | null;
  deal_arr?: string | number | null;
}

export function cleanseRecord(raw: RawLead): CleansedRecord {
  const flags: string[] = [];
  let triage: TriageStatus = 'clean';
  let quarantineReason: string | null = null;
  let healthScore = 100;

  // Formula injection check across all fields
  const formulaFields = [raw.first_name, raw.last_name, raw.job_title, raw.company, raw.notes];
  if (formulaFields.some((v) => v && /^([=@]|[-+](?![0-9\s()\-.]+$))/i.test(String(v).trim()))) {
    flags.push('SECURITY_SANITIZED');
  }

  const firstName = raw.first_name ? defangFormula(repairMojibake(stripZeroWidthBytes(raw.first_name))) : null;
  const lastName = raw.last_name ? defangFormula(repairMojibake(stripZeroWidthBytes(raw.last_name))) : null;
  const email = raw.email ? defangEmail(stripZeroWidthBytes(raw.email)) : null;
  const phone = raw.phone ? stripZeroWidthBytes(raw.phone) : null;
  const company = raw.company ? defangFormula(repairMojibake(stripZeroWidthBytes(raw.company))) : null;
  const jobTitle = raw.job_title ? defangFormula(repairMojibake(stripZeroWidthBytes(raw.job_title))) : null;
  const notes = raw.notes ? defangFormula(raw.notes) : null;
  const dealArr = raw.deal_arr != null ? raw.deal_arr : null;
  const country = raw.country || null;
  const region = raw.region || null;

  // Check for dummy lead / keyboard mash patterns (Strict fatal quarantine)
  if (
    isDummyLead(firstName) ||
    isDummyLead(lastName) ||
    isDummyLead(company) ||
    isDummyLead(jobTitle) ||
    (email && isDummyLead(email.split('@')[0]))
  ) {
    flags.push('SYNTHETIC_PLACEHOLDER');
    triage = 'quarantined';
    quarantineReason = 'Synthetic placeholder or keyboard mash detected';
    healthScore = Math.min(healthScore, 20);
  }

  // Determine if record is an Organization Entity or Individual Lead
  const isOrg = !firstName && !lastName && Boolean(company);
  const entityType: 'individual' | 'organization' = isOrg ? 'organization' : 'individual';

  // Clean name
  const firstNameClean = isSentinel(firstName) || !firstName ? null : capitalizeName(firstName);
  const lastNameClean = isSentinel(lastName) || !lastName ? null : capitalizeName(lastName);
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
  const companyClean = isSentinel(company) || !company ? null : capitalizeName(company);
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
  const domain = extractDomain(emailClean) || raw.domain || null;
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
    first_name: firstName || null,
    last_name: lastName || null,
    email: raw.email || null,
    phone: raw.phone || null,
    company: raw.company || null,
    job_title: raw.job_title || null,
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
    notes,
    deal_arr: dealArr,
  };
}

export function detectDuplicates(records: CleansedRecord[]): Map<string, string[]> {
  const adj = new Map<string, Set<string>>();
  records.forEach((r) => adj.set(r.record_id, new Set<string>()));

  const addEdge = (id1: string, id2: string) => {
    if (id1 === id2) return;
    adj.get(id1)?.add(id2);
    adj.get(id2)?.add(id1);
  };

  // Vector A: Email
  const byEmail = new Map<string, string[]>();
  for (const r of records) {
    if (r.email_clean && !r.email_clean.includes('[PURGED]')) {
      const em = r.email_clean.toLowerCase();
      if (!byEmail.has(em)) byEmail.set(em, []);
      byEmail.get(em)!.push(r.record_id);
    }
  }
  for (const [, ids] of byEmail) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  // Vector B: Base Phone + Last Name
  const byPhoneLast = new Map<string, string[]>();
  for (const r of records) {
    const basePhone = getBasePhoneForMatching(r.phone_clean || r.phone);
    if (basePhone && r.last_name_clean) {
      const key = `${basePhone}_${r.last_name_clean.toLowerCase()}`;
      if (!byPhoneLast.has(key)) byPhoneLast.set(key, []);
      byPhoneLast.get(key)!.push(r.record_id);
    }
  }
  for (const [, ids] of byPhoneLast) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  // Vector C: Composite Name + Company (Strictly requires same person at same company)
  const byNameComp = new Map<string, string[]>();
  for (const r of records) {
    const compNorm = normalizeCompanyForDedup(r.company_clean || r.company);
    if (r.entity_type === 'individual' && r.first_name_clean && r.last_name_clean && compNorm) {
      const key = `${r.first_name_clean.toLowerCase()}_${r.last_name_clean.toLowerCase()}@${compNorm}`;
      if (!byNameComp.has(key)) byNameComp.set(key, []);
      byNameComp.get(key)!.push(r.record_id);
    } else if (r.entity_type === 'organization' && compNorm && compNorm.length >= 3) {
      if (!byNameComp.has(compNorm)) byNameComp.set(compNorm, []);
      byNameComp.get(compNorm)!.push(r.record_id);
    }
  }
  for (const [, ids] of byNameComp) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  const visited = new Set<string>();
  const clusters = new Map<string, string[]>();
  let clusterIdx = 1;

  for (const id of adj.keys()) {
    if (!visited.has(id)) {
      const comp: string[] = [];
      const queue = [id];
      visited.add(id);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        comp.push(curr);
        for (const neighbor of adj.get(curr) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      if (comp.length > 1) {
        const recs = comp.map(rid => records.find(x => x.record_id === rid)).filter(Boolean) as CleansedRecord[];
        const emailRec = recs.find(x => x.email_clean);
        const clusterKey = emailRec?.email_clean ? `email:${emailRec.email_clean}` : `cluster:${clusterIdx++}`;
        clusters.set(clusterKey, comp);
      }
    }
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

export function groupRecordsIntoClusters(records: DataRecord[]): ClusterGroup[] {
  const clusters: ClusterGroup[] = [];
  const adj = new Map<string, Set<string>>();
  records.forEach((r) => adj.set(r.id, new Set<string>()));

  const addEdge = (id1: string, id2: string) => {
    if (id1 === id2) return;
    adj.get(id1)?.add(id2);
    adj.get(id2)?.add(id1);
  };

  // Vector A: Email
  const byEmail = new Map<string, string[]>();
  for (const r of records) {
    if (r.email_clean && !r.email_clean.includes('[PURGED]')) {
      const em = r.email_clean.toLowerCase();
      if (!byEmail.has(em)) byEmail.set(em, []);
      byEmail.get(em)!.push(r.id);
    }
  }
  for (const [, ids] of byEmail) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  // Vector B: Base Phone + Last Name
  const byPhoneLast = new Map<string, string[]>();
  for (const r of records) {
    const basePhone = getBasePhoneForMatching(r.phone_clean || r.phone);
    if (basePhone && r.last_name_clean) {
      const key = `${basePhone}_${r.last_name_clean.toLowerCase()}`;
      if (!byPhoneLast.has(key)) byPhoneLast.set(key, []);
      byPhoneLast.get(key)!.push(r.id);
    }
  }
  for (const [, ids] of byPhoneLast) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  // Vector C: Composite Name + Company
  const byNameComp = new Map<string, string[]>();
  for (const r of records) {
    const compNorm = normalizeCompanyForDedup(r.company_clean || r.company);
    if (r.entity_type === 'individual' && r.first_name_clean && r.last_name_clean && compNorm) {
      const key = `${r.first_name_clean.toLowerCase()}_${r.last_name_clean.toLowerCase()}@${compNorm}`;
      if (!byNameComp.has(key)) byNameComp.set(key, []);
      byNameComp.get(key)!.push(r.id);
    } else if (r.entity_type === 'organization' && compNorm && compNorm.length >= 3) {
      if (!byNameComp.has(compNorm)) byNameComp.set(compNorm, []);
      byNameComp.get(compNorm)!.push(r.id);
    }
  }
  for (const [, ids] of byNameComp) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  const visited = new Set<string>();
  let clusterCount = 1;
  for (const id of adj.keys()) {
    if (!visited.has(id)) {
      const compIds: string[] = [];
      const queue = [id];
      visited.add(id);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        compIds.push(curr);
        for (const neighbor of adj.get(curr) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      if (compIds.length > 1) {
        const groupRecs = compIds.map(cid => records.find(x => x.id === cid)).filter(Boolean) as DataRecord[];
        const name = groupRecs[0].first_name_clean
          ? `${groupRecs[0].first_name_clean} ${groupRecs[0].last_name_clean || ''}`.trim()
          : (groupRecs[0].company_clean || 'Duplicate Group');
        const hasEmailMatch = groupRecs.filter(x => x.email_clean).length > 1;
        const matchType = hasEmailMatch ? 'email' : 'phone_lastname';
        const score = hasEmailMatch ? 99.4 : 95.8;
        clusters.push({
          clusterId: `cluster-${clusterCount++}`,
          clusterName: name,
          matchType,
          matchScore: score,
          records: groupRecs,
        });
      }
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
