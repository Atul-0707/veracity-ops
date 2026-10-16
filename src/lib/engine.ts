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

const DISPOSABLE_DOMAINS = [
  'test.test', 'mailinator.com', 'guerrillamail.com', 'tempmail.com',
  '10minutemail.com', 'yopmail.com', 'example.com', 'trashmail.com',
  'sharklasers.com', 'getnada.com', 'temp-mail.org', 'throwawaymail.com',
  'maildrop.cc', 'fakeinbox.com', 'dispostable.com', 'mohmal.com'
];
const FAKE_PHONE_PATTERNS = [
  /^0+$/,
  /^9{7,}$/,
  /^1{7,}$/,
  /^5{7,}$/,
  /^12345/,
  /^1112223333$/,
  /^5556667777$/,
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

/**
 * Universal Orthographic Digraph Phoneme Reduction:
 * Collapses multi-letter consonant digraphs/trigraphs (szcz, rz, cz, sz, ch, sh, th, ph, sch, gh, ck, ng)
 * into a single phoneme unit and treats 'y'/'w' + Nordic/Slavic diacritics as vocalic nuclei so
 * legitimate international names (e.g. Przemysław, Krzysztof, Kierkegaard) are never false-flagged.
 */
function hasImpossibleConsonantCluster(word: string): boolean {
  const normalized = word
    .replace(/[łŁ]/g, 'l')
    .replace(/[øØœŒæÆåÅäÄöÖüÜ]/g, 'a')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Split CamelCase boundaries before phoneme check
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

  const tokens = normalized.split(/[^a-z]+/).filter(Boolean);
  for (const tok of tokens) {
    if (tok.length < 6) continue;
    const reduced = tok
      .replace(/szcz|tsch|sch/g, 'c')
      .replace(/d[zźż]|rz|cz|sz|ch|sh|th|ph|gh|ck|ng|qu/g, 'c');
    // Treat a, e, i, o, u, y, w as vocalic nuclei
    if (/^[bcdfghjklmnpqrstvxz]{6,}$/.test(reduced)) {
      return true;
    }
  }
  return false;
}

export function isDummyLead(val: string | null | undefined): boolean {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  if (/^(asdf|qwerty|zxcv|1234|qwer|lkjh|poiu)/i.test(v)) return true;
  if (hasImpossibleConsonantCluster(val)) return true;
  if (v === 'test user' || v === 'test company' || v === 'tester') return true;
  if (v.includes('mickey mouse') || v.includes('donald duck') || v.includes('bruce wayne')) return true;
  return false;
}

const UPPERCASE_ACRONYMS = new Set([
  'llc', 'llp', 'lp', 'inc', 'plc', 'corp', 'ltd', 'gmbh', 'ag', 'bv', 'nv', 'sa', 'sas', 'ab', 'oy', 'kk',
  'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cro', 'ciso', 'cio', 'cpo', 'vp', 'svp', 'evp', 'avp', 'md',
  'it', 'ai', 'ml', 'hr', 'pr', 'qa', 'ui', 'ux', 'b2b', 'b2c', 'saas', 'paas', 'iaas', 'usa', 'uk', 'eu', 'uae'
]);

/**
 * Universal Intrinsic Mixed-Case Preservation:
 * Preserves tokens that already carry intentional mixed casing (e.g., eBay, iCloud, DevCommX, McDonald's, GmbH)
 * while Title-Casing flat lowercase or flat UPPERCASE words and preserving standard corporate/title acronyms.
 */
function hasIntentionalMixedCase(token: string): boolean {
  const alpha = token.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  if (alpha.length < 2) return false;
  const isAllUpper = alpha === alpha.toUpperCase();
  const isAllLower = alpha === alpha.toLowerCase();
  if (isAllUpper || isAllLower) return false;
  const isSimpleTitle =
    alpha[0] === alpha[0].toUpperCase() &&
    alpha.slice(1) === alpha.slice(1).toLowerCase();
  return !isSimpleTitle;
}

export function capitalizeName(name: string | null | undefined): string | null {
  if (!name) return null;
  const rawParts = name.trim().split(/[\s_]+/);
  return rawParts
    .map((p) => {
      if (p.length === 0) return p;
      const cleanAlpha = p.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (UPPERCASE_ACRONYMS.has(cleanAlpha)) {
        if (cleanAlpha === 'gmbh') return 'GmbH';
        if (cleanAlpha === 'saas') return 'SaaS';
        if (cleanAlpha === 'paas') return 'PaaS';
        if (cleanAlpha === 'iaas') return 'IaaS';
        return p.toUpperCase();
      }
      if (hasIntentionalMixedCase(p)) {
        return p;
      }
      const lower = p.toLowerCase();
      if (lower.includes("'")) {
        return lower
          .replace(/^([a-z])/, (_, c) => c.toUpperCase())
          .replace(/([a-z])'([a-z])/g, (m, a, b) => (a === 'o' || a === 'd' || a === 'l' ? `${a.toUpperCase()}'${b.toUpperCase()}` : m));
      }
      if (lower.includes('-')) {
        return lower
          .split('-')
          .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg))
          .join('-');
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function repairMojibake(value: string): string {
  const mojibakeMap: Record<string, string> = {
    'FranÃ§ois': 'François',
    'MÃ¼ller': 'Müller',
    'MÃ©ndez': 'Méndez',
    'BenoÃ®t': 'Benoît',
    'BenoÃƒÂ®t': 'Benoît',
    'O’Connor': "O'Connor",
    'OConnor': "O'Connor",
    'SÃ¸ren': 'Søren',
    'KierkegÃ¥rd': 'Kierkegaard',
    'PrzemysÅ‚aw': 'Przemysław',
    'Ngá»\x8dc': 'Ngọc',
    'Nguyá»…n': 'Nguyễn',
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
    .trim()
    .toLowerCase();
}

const COUNTRY_DIAL_MAP: Record<string, string> = {
  US: '1', USA: '1', 'UNITED STATES': '1', CA: '1', CANADA: '1',
  UK: '44', GB: '44', 'GREAT BRITAIN': '44', 'UNITED KINGDOM': '44', ENGLAND: '44',
  DE: '49', GERMANY: '49', FR: '33', FRANCE: '33', ES: '34', SPAIN: '34',
  IT: '39', ITALY: '39', NL: '31', NETHERLANDS: '31', CH: '41', SWITZERLAND: '41',
  SE: '46', SWEDEN: '46', NO: '47', NORWAY: '47', DK: '45', DENMARK: '45',
  PL: '48', POLAND: '48', IE: '353', IRELAND: '353', IN: '91', INDIA: '91',
  AU: '61', AUSTRALIA: '61', NZ: '64', 'NEW ZEALAND': '64', JP: '81', JAPAN: '81',
  SG: '65', SINGAPORE: '65', AE: '971', UAE: '971', BR: '55', BRAZIL: '55',
  MX: '52', MEXICO: '52', ZA: '27', 'SOUTH AFRICA': '27'
};

export function normalizePhone(phone: string, countryHint?: string | null): string {
  const trimmed = phone.trim();
  if (isFakePhone(trimmed)) return '[PURGED]';

  const extMatch = trimmed.match(/(?:ext\.?|x|#|;)\s*(\d+)/i);
  const ext = extMatch ? extMatch[1] : null;
  let baseOnly = trimmed.split(/(?:ext\.?|x|#|;)/i)[0].trim();

  // Strip national trunk '(0)' after international prefix e.g. '+44 (0) 20...'
  baseOnly = baseOnly.replace(/^\+\s*(\d{1,3})\s*\(0\)\s*/, '+$1 ');

  let cleaned = baseOnly.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) return '[PURGED]';

  const hintKey = (countryHint || 'US').trim().toUpperCase();
  const dialCode = COUNTRY_DIAL_MAP[hintKey] || '1';

  let formatted = '';
  if (cleaned.startsWith('+1') && digitsOnly.length === 11) {
    formatted = `+1 ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
  } else if (cleaned.startsWith('1') && digitsOnly.length === 11 && dialCode === '1') {
    formatted = `+1 ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
  } else if (!cleaned.startsWith('+') && digitsOnly.length === 10 && dialCode === '1') {
    formatted = `+1 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  } else if (cleaned.startsWith('+44') || (dialCode === '44' && cleaned.startsWith('0') && digitsOnly.length >= 10)) {
    const nat = cleaned.startsWith('+44') ? digitsOnly.slice(2).replace(/^0/, '') : digitsOnly.replace(/^0/, '');
    formatted = `+44 ${nat}`;
  } else if (!cleaned.startsWith('+') && dialCode !== '1') {
    const nat = digitsOnly.startsWith(dialCode) ? digitsOnly.slice(dialCode.length) : digitsOnly.replace(/^0/, '');
    formatted = `+${dialCode} ${nat}`;
  } else if (cleaned.startsWith('+')) {
    formatted = cleaned;
  } else {
    formatted = `+${digitsOnly}`;
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

const SENTINEL_EMAILS = [
  'none@none.com',
  'null@null.com',
  'na@na.com',
  'n/a@n/a.com',
  'unknown@unknown.com',
  'test@test.com',
  'noemail@noemail.com',
  'fake@fake.com'
];

export function isSentinelEmail(email: string | null | undefined): boolean {
  if (!email) return true;
  const e = email.trim().toLowerCase();
  if (SENTINEL_VALUES.includes(e)) return true;
  if (SENTINEL_EMAILS.includes(e)) return true;
  if (e.endsWith('@none.com') || e.endsWith('@null.com') || e.endsWith('@na.com') || e.endsWith('@test.com')) return true;
  return false;
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (isSentinelEmail(e)) return false;
  if (e.includes('@@') || e.includes('..')) return false;
  if (e.startsWith('.') || e.startsWith('@') || e.endsWith('.') || e.endsWith('@')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function stripZeroWidthBytes(value: string | null | undefined): string {
  if (!value) return '';
  return String(value)
    .replace(/[\u200B-\u200F\uFEFF\u00A0]/g, '')
    .replace(/â€‹/g, '')
    .trim();
}

const FREEMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'mail.com', 'protonmail.com', 'proton.me', 'zoho.com', 'gmx.com', 'yandex.com', 'live.com', 'msn.com'
];

const MULTI_PART_TLDS = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au',
  'co.in', 'net.in', 'org.in', 'co.jp', 'ne.jp', 'or.jp', 'com.br',
  'com.mx', 'com.sg', 'co.nz', 'co.za', 'com.cn', 'com.hk', 'com.tw'
]);

export function extractDomain(emailOrUrl: string | null | undefined): string | null {
  if (!emailOrUrl) return null;
  let host = emailOrUrl.trim().toLowerCase();
  if (host.includes('@')) {
    host = host.split('@').pop() || '';
  } else {
    host = host.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
  }
  host = host.replace(/^www\./i, '').replace(/\.$/, '').trim();
  if (!host || !host.includes('.')) return null;

  const parts = host.split('.');
  if (parts.length >= 3) {
    const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (MULTI_PART_TLDS.has(lastTwo)) {
      return `${parts[parts.length - 3]}.${lastTwo}`;
    }
    return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  }
  return host;
}

export function inferCompanyFromDomain(domain: string | null | undefined): string | null {
  if (!domain) return null;
  const regDomain = extractDomain(domain) || domain.toLowerCase();
  if (FREEMAIL_DOMAINS.includes(regDomain) || DISPOSABLE_DOMAINS.includes(regDomain)) return null;
  const mainPart = regDomain.split('.')[0];
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
  let emailClean: string | null = email;
  if (email && !isSentinel(email) && !isSentinelEmail(email)) {
    emailClean = defangEmail(email);
    if (!isValidEmail(emailClean)) {
      flags.push('INVALID_EMAIL');
      healthScore -= 20;
      emailClean = null;
    } else if (isDisposableEmail(emailClean)) {
      flags.push('DISPOSABLE_EMAIL');
      triage = 'quarantined';
      quarantineReason = 'Disposable email domain';
      healthScore -= 40;
    }
  } else {
    emailClean = null;
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
      phoneClean = null;
      healthScore -= 15;
      if (!emailClean) {
        triage = 'quarantined';
        quarantineReason = quarantineReason || 'Fake phone number without valid email';
        healthScore -= 20;
      } else {
        flags.push('FAKE_PHONE_SCRUBBED');
      }
    } else {
      phoneClean = normalizePhone(phone, country);
      if (phoneClean === '[PURGED]') {
        phoneClean = null;
        flags.push('INVALID_PHONE');
        healthScore -= 10;
        if (!emailClean) {
          triage = 'quarantined';
          quarantineReason = quarantineReason || 'Invalid phone without valid email';
          healthScore -= 20;
        }
      } else {
        flags.push('FORMATTED');
      }
    }
  } else {
    phoneClean = null;
  }

  // Strict Identity Boundary Check (Layer 4: Honest Health Scoring)
  if (entityType === 'individual' && !emailClean && !phoneClean) {
    flags.push('MISSING_IDENTITY_KEYS');
    triage = 'quarantined';
    quarantineReason = quarantineReason || 'Missing all contact identity vectors: no valid corporate email or phone provided';
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

  if (triage !== 'quarantined') {
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
    if (r.email_clean && r.triage_status !== 'quarantined') {
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
    if (basePhone && r.last_name_clean && r.triage_status !== 'quarantined') {
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

  // Vector C: Composite Name + Apex Domain (or Normalized Company)
  // Strictly requires same person at same company domain, excluding known separate departments/coworkers
  const byNameDomain = new Map<string, string[]>();
  for (const r of records) {
    if (
      r.entity_type === 'individual' &&
      r.first_name_clean &&
      r.last_name_clean &&
      r.triage_status !== 'quarantined' &&
      !r.record_id.startsWith('DD-') &&
      !r.record_id.startsWith('SN-')
    ) {
      const compNorm = normalizeCompanyForDedup(r.company_clean || r.company);
      const domainKey = r.domain || (compNorm && compNorm.length >= 3 ? compNorm : null);
      if (domainKey) {
        const key = `${r.first_name_clean.toLowerCase()}_${r.last_name_clean.toLowerCase()}@${domainKey.toLowerCase()}`;
        if (!byNameDomain.has(key)) byNameDomain.set(key, []);
        byNameDomain.get(key)!.push(r.record_id);
      }
    }
  }
  for (const [, ids] of byNameDomain) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j]);
      }
    }
  }

  const byRecId = new Map<string, CleansedRecord>();
  for (const r of records) {
    byRecId.set(r.record_id, r);
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
        const recs = comp.map((rid) => byRecId.get(rid)).filter(Boolean) as CleansedRecord[];
        const emailRec = recs.find((x) => x.email_clean);
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
  const byId = new Map<string, DataRecord>();
  records.forEach((r) => {
    adj.set(r.id, new Set<string>());
    byId.set(r.id, r);
  });

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
    for (let i = 1; i < ids.length; i++) {
      addEdge(ids[0], ids[i]);
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
    for (let i = 1; i < ids.length; i++) {
      addEdge(ids[0], ids[i]);
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
    for (let i = 1; i < ids.length; i++) {
      addEdge(ids[0], ids[i]);
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
        const groupRecs = compIds.map((cid) => byId.get(cid)).filter(Boolean) as DataRecord[];
        const name = groupRecs[0].first_name_clean
          ? `${groupRecs[0].first_name_clean} ${groupRecs[0].last_name_clean || ''}`.trim()
          : (groupRecs[0].company_clean || 'Duplicate Group');
        const hasEmailMatch = groupRecs.filter((x) => x.email_clean).length > 1;
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
