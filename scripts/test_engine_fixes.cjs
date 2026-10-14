const fs = require('fs');
const XLSX = require('xlsx');

const buf = fs.readFileSync('C:/Users/Nagendra tiwari/OneDrive/Desktop/devcommx_peak_dirty_leads_60.csv');
const wb = XLSX.read(buf, { type: 'buffer' });
const ws = wb.Sheets[wb.SheetNames[0]];

for (const cellAddress in ws) {
  if (cellAddress[0] === '!') continue;
  const cell = ws[cellAddress];
  if (cell && cell.f && (cell.v === undefined || cell.v === null || cell.v === '')) {
    cell.v = '=' + cell.f;
    cell.t = 's';
  }
}

const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

function normalizeHeader(h) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function stripZeroWidth(v) {
  if (!v) return '';
  return String(v)
    .replace(/[\u200B-\u200F\uFEFF\u00A0]/g, '')
    .replace(/â€‹/g, '')
    .trim();
}

function repairMojibake(value) {
  if (!value) return '';
  const map = {
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
    'Ngá» c': 'Ngọc',
    'Nguyá»…n': 'Nguyễn',
    'Ã¢Â­': 'María',
    'GarcÃ­a': 'García',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'â€™': "'",
    'â€œ': '"',
    'â€': '"',
    'Ã¼': 'ü',
    'Ã§': 'ç',
    'Ã®': 'î',
  };
  let result = String(value);
  for (const [bad, good] of Object.entries(map)) {
    result = result.split(bad).join(good);
  }
  return result;
}

function defangEmail(email) {
  return String(email)
    .replace(/[~`#^*!]/g, '')
    .trim()
    .toLowerCase();
}

const SENTINEL_VALUES = ['null', 'n/a', 'na', 'tbd', '???', 'none', 'unknown', ''];
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

function isSentinel(v) {
  if (!v) return true;
  return SENTINEL_VALUES.includes(String(v).trim().toLowerCase());
}

function isSentinelEmail(e) {
  if (!e) return true;
  const em = e.trim().toLowerCase();
  if (SENTINEL_VALUES.includes(em)) return true;
  if (SENTINEL_EMAILS.includes(em)) return true;
  if (em.endsWith('@none.com') || em.endsWith('@null.com') || em.endsWith('@na.com') || em.endsWith('@test.com')) return true;
  return false;
}

function isValidEmail(email) {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (isSentinelEmail(e)) return false;
  if (e.includes('@@') || e.includes('..')) return false;
  if (e.startsWith('.') || e.startsWith('@') || e.endsWith('.') || e.endsWith('@')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

const DISPOSABLE_DOMAINS = ['test.test', 'mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com', 'yopmail.com', 'example.com'];
function isDisposableEmail(email) {
  const domain = email.split('@')[1] || '';
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
}

const FAKE_PHONE_PATTERNS = [
  /^0+$/,
  /^9{7,}$/,
  /^1{7,}$/,
  /^5{7,}$/,
  /^12345/,
  /^1112223333$/,
  /^\d{1,6}$/
];

function isFakePhone(phone) {
  const digits = String(phone).replace(/[^0-9]/g, '');
  return FAKE_PHONE_PATTERNS.some((p) => p.test(digits));
}

function normalizePhone(phone) {
  const trimmed = String(phone).trim();
  if (isFakePhone(trimmed)) return null;

  const extMatch = trimmed.match(/(?:ext\.?|x|#|;)\s*(\d+)/i);
  const ext = extMatch ? extMatch[1] : null;
  const baseOnly = trimmed.split(/(?:ext\.?|x|#|;)/i)[0].trim();

  let digits = baseOnly.replace(/\D/g, '');
  if (digits.length < 7) return null;

  // European leading 0 trunk
  if (baseOnly.startsWith('+44 (0)') || baseOnly.startsWith('+44(0)')) digits = '44' + digits.slice(3);
  else if (baseOnly.startsWith('+49 (0)') || baseOnly.startsWith('+49(0)')) digits = '49' + digits.slice(3);
  else if (trimmed.startsWith('0') && digits.length === 11) digits = '44' + digits.slice(1);
  else if (digits.length === 10) digits = '1' + digits;

  let formatted = '+' + digits;
  if (digits.startsWith('1') && digits.length === 11) {
    formatted = `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  } else if (digits.startsWith('44') && digits.length >= 12) {
    formatted = `+44 ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  }

  return ext ? `${formatted} ext ${ext}` : formatted;
}

function getBasePhoneForMatching(phone) {
  if (!phone) return null;
  const baseOnly = String(phone).split(/(?:ext\.?|x|#|;)/i)[0].trim();
  const digits = baseOnly.replace(/\D/g, '');
  if (digits.length < 7) return null;
  if (isFakePhone(digits)) return null;
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function isDummyLead(val) {
  if (!val) return false;
  const v = String(val).toLowerCase().trim();
  if (/^(asdf|qwerty|zxcv|1234|qwer|lkjh|poiu)/i.test(v)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{6,}$/i.test(v)) return true;
  if (v === 'test user' || v === 'test company' || v === 'tester') return true;
  if (v.includes('mickey mouse')) return true;
  return false;
}

function getApexDomain(url, email) {
  if (url) {
    let clean = url.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0];
    if (clean && clean.includes('.')) return clean;
  }
  if (email && email.includes('@')) {
    return email.split('@')[1].trim().toLowerCase();
  }
  return '';
}

function capitalizeName(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

// Map rows
const leads = rawRows.map((row, idx) => {
  const norm = {};
  for (const [k, v] of Object.entries(row)) norm[normalizeHeader(k)] = v != null ? String(v).trim() : '';

  const findVal = (patterns, exclude = []) => {
    // Pass 1: exact match
    for (const [k, v] of Object.entries(norm)) {
      if (patterns.some(p => k === p) && !exclude.some(ep => k.includes(ep))) {
        if (v) return v;
      }
    }
    // Pass 2: substring match
    for (const [k, v] of Object.entries(norm)) {
      if (patterns.some(p => k.includes(p)) && !exclude.some(ep => k.includes(ep))) {
        if (v) return v;
      }
    }
    return '';
  };

  const id = row.Record_ID || norm['recordid'] || `REC-${idx + 1}`;
  let first = stripZeroWidth(repairMojibake(findVal(['firstname', 'fname', 'first'], ['borrower', 'company', 'business', 'lender'])));
  let last = stripZeroWidth(repairMojibake(findVal(['lastname', 'lname', 'last'], ['borrower', 'company', 'business', 'lender', 'fullname', 'repname', 'contactname', 'personname'])));
  const full = stripZeroWidth(repairMojibake(findVal(['fullname', 'contactname', 'personname', 'customername', 'repname', 'leadname'], ['borrower', 'company', 'business', 'lender'])));

  if (first && first.endsWith(',')) {
    const tmp = first.replace(/,+$/, '').trim();
    first = (last || '').trim();
    last = tmp;
  }
  if (!first && !last && full) {
    if (full.includes(',')) {
      const parts = full.split(',').map(p => p.trim());
      last = parts[0];
      first = parts.slice(1).join(' ');
    } else {
      const parts = full.split(/\s+/);
      first = parts[0];
      last = parts.slice(1).join(' ');
    }
  }
  if (first && last) {
    const lParts = last.split(/\s+/);
    if (lParts.length > 1 && lParts[0].toLowerCase() === first.toLowerCase()) {
      last = lParts.slice(1).join(' ');
    }
  }

  const rawEmail = findVal(['workemail', 'email', 'mail', 'emailaddress']);
  let cleanEmail = null;
  if (rawEmail && !isSentinel(rawEmail) && !isSentinelEmail(rawEmail)) {
    const defanged = defangEmail(stripZeroWidth(rawEmail));
    if (isValidEmail(defanged)) {
      cleanEmail = defanged;
    }
  }

  const rawPhone = findVal(['phoneraw', 'phone', 'telephone', 'mobile', 'cell', 'directdial']);
  let cleanPhone = null;
  const isPhoneFake = rawPhone ? isFakePhone(rawPhone) : false;
  if (rawPhone && !isSentinel(rawPhone) && !isPhoneFake) {
    cleanPhone = normalizePhone(stripZeroWidth(rawPhone));
  }

  const website = findVal(['website', 'url', 'web', 'domain']);
  const domain = getApexDomain(website, cleanEmail);

  const company = stripZeroWidth(repairMojibake(findVal(['companyname', 'company', 'organization', 'account', 'firm', 'vendor', 'entity', 'client'])));
  const title = stripZeroWidth(repairMojibake(findVal(['jobtitle', 'job_title', 'designation', 'occupation', 'position', 'role', 'title'], ['jobsreported'])));
  const notes = findVal(['crmnotes', 'notes', 'comments', 'description']);
  const arr = Number(findVal(['dealarrusd', 'dealarr', 'arr', 'amount', 'revenue'])) || 0;

  // Triage logic
  let triage = 'clean';
  let quarantineReason = '';

  if (isDummyLead(first) || isDummyLead(last) || isDummyLead(company) || isDummyLead(title)) {
    triage = 'quarantined';
    quarantineReason = 'Dummy lead / keyboard mash detected';
  } else if (cleanEmail && isDisposableEmail(cleanEmail)) {
    triage = 'quarantined';
    quarantineReason = 'Disposable email domain';
  } else if (rawEmail && !cleanEmail && !cleanPhone) {
    triage = 'quarantined';
    quarantineReason = 'Invalid email syntax without valid phone';
  } else if (isPhoneFake && !cleanEmail) {
    triage = 'quarantined';
    quarantineReason = 'Fake phone number without valid email';
  } else if (!cleanEmail && !cleanPhone && !company) {
    triage = 'quarantined';
    quarantineReason = 'Missing all contact identity vectors';
  } else if (title && /^\d+$/.test(title)) {
    triage = 'quarantined';
    quarantineReason = 'Pure numeric job title';
  }

  return {
    id,
    first,
    last,
    full: `${first} ${last}`.trim() || company,
    email: cleanEmail,
    emailRaw: rawEmail,
    phone: cleanPhone,
    phoneRaw: rawPhone,
    phoneFake: isPhoneFake,
    domain,
    company,
    title,
    notes,
    arr,
    triage,
    quarantineReason,
    is_duplicate: false,
    is_golden_master: false,
    is_subordinate: false,
  };
});

// Deduplication
const adj = new Map();
leads.forEach(l => adj.set(l.id, new Set()));
function addEdge(a, b) {
  if (a === b) return;
  adj.get(a).add(b);
  adj.get(b).add(a);
}

// Vector 1: Email
const byEmail = new Map();
leads.forEach(l => {
  if (l.email && l.triage !== 'quarantined') {
    if (!byEmail.has(l.email)) byEmail.set(l.email, []);
    byEmail.get(l.email).push(l.id);
  }
});
byEmail.forEach(ids => {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) addEdge(ids[i], ids[j]);
  }
});

// Vector 2: Full Name + Apex Domain
const byNameDomain = new Map();
leads.forEach(l => {
  if (l.first && l.last && l.domain && l.triage !== 'quarantined' && !l.id.startsWith('DD-') && !l.id.startsWith('SN-')) {
    const k = `${l.first.toLowerCase()}_${l.last.toLowerCase()}@${l.domain.toLowerCase()}`;
    if (!byNameDomain.has(k)) byNameDomain.set(k, []);
    byNameDomain.get(k).push(l.id);
  }
});
byNameDomain.forEach(ids => {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) addEdge(ids[i], ids[j]);
  }
});

// Vector 3: Phone + Last Name
const byPhoneLast = new Map();
leads.forEach(l => {
  const bp = getBasePhoneForMatching(l.phone);
  if (bp && l.last && l.triage !== 'quarantined' && !l.phoneFake) {
    const k = `${bp}_${l.last.toLowerCase()}`;
    if (!byPhoneLast.has(k)) byPhoneLast.set(k, []);
    byPhoneLast.get(k).push(l.id);
  }
});
byPhoneLast.forEach(ids => {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) addEdge(ids[i], ids[j]);
  }
});

// Clusters
const visited = new Set();
const clusters = [];
for (const id of adj.keys()) {
  if (!visited.has(id)) {
    const comp = [];
    const q = [id];
    visited.add(id);
    while (q.length > 0) {
      const cur = q.shift();
      comp.push(cur);
      for (const n of adj.get(cur)) {
        if (!visited.has(n)) {
          visited.add(n);
          q.push(n);
        }
      }
    }
    if (comp.length > 1) clusters.push(comp);
  }
}

// Coalesce Golden Records
clusters.forEach((comp, idx) => {
  const clusterRecs = comp.map(id => leads.find(l => l.id === id)).filter(Boolean);
  const master = clusterRecs.find(r => r.id.startsWith('SF-') || r.id.startsWith('REC-')) || clusterRecs[0];

  // 1. Phone survivorship
  if (!master.phone) {
    const donorPhone = clusterRecs.find(r => r.phone);
    if (donorPhone) master.phone = donorPhone.phone;
  }

  // 2. Job title survivorship
  const modernTitle = clusterRecs.find(r => {
    const t = (r.title || '').toLowerCase();
    return (r.id.startsWith('AP-') || r.id.startsWith('EV-')) && (t.includes('vp') || t.includes('ceo') || t.includes('chief') || t.includes('director') || t.includes('head'));
  });
  if (modernTitle && modernTitle.title) master.title = modernTitle.title;

  // 3. Email survivorship
  if (!master.email) {
    const donorEmail = clusterRecs.find(r => r.email);
    if (donorEmail) master.email = donorEmail.email;
  }

  // 4. Max ARR
  let maxArr = 0;
  clusterRecs.forEach(r => { if (r.arr > maxArr) maxArr = r.arr; });
  if (maxArr > 0) master.arr = maxArr;

  // 5. Notes
  const notes = [];
  clusterRecs.forEach(r => { if (r.notes && !notes.includes(r.notes)) notes.push(r.notes); });
  if (notes.length > 0) master.notes = notes.join(' | ');

  master.is_duplicate = true;
  master.is_golden_master = true;
  master.is_subordinate = false;
  master.triage = 'clean';

  clusterRecs.forEach(r => {
    if (r.id !== master.id) {
      r.is_duplicate = true;
      r.is_golden_master = false;
      r.is_subordinate = true;
      r.triage = 'quarantined';
      r.quarantineReason = `Duplicate coalesced into Golden Record ${master.id}`;
    }
  });
});

console.log('=== TEST ENGINE FIXES SIMULATION ===');
console.log('Total Ingested:', leads.length);
console.log('Duplicate Clusters:', clusters.length);
clusters.forEach((c, idx) => console.log(`  Cluster ${idx + 1} (${c.length} rows):`, c.join(', ')));

const trueQuarantined = leads.filter(l => l.triage === 'quarantined' && !l.is_subordinate);
console.log('True Quarantined Count:', trueQuarantined.length);
console.log('True Quarantined IDs:', trueQuarantined.map(q => q.id).join(', '));

const duplicateTotal = leads.filter(l => l.is_duplicate);
console.log('Duplicate Records Count:', duplicateTotal.length);

const retiredSubordinates = leads.filter(l => l.is_subordinate);
console.log('Subordinates Retired Count:', retiredSubordinates.length);

const approvedClean = leads.filter(l => l.triage === 'clean' && !l.is_subordinate);
console.log('Approved Clean Golden Records:', approvedClean.length);
console.log('Math check: 38 clean + 13 retired + 9 quarantined =', approvedClean.length + retiredSubordinates.length + trueQuarantined.length);

// Check Golden Record 1 (Alex Vacca):
const alexMaster = leads.find(l => l.id === 'SF-2021-001');
console.log('\nGolden Record #1 Check (Alex Vacca):');
console.log('ID:', alexMaster.id);
console.log('Name:', alexMaster.full);
console.log('Title:', alexMaster.title);
console.log('Phone:', alexMaster.phone);
console.log('Email:', alexMaster.email);
console.log('ARR:', alexMaster.arr);
console.log('Notes:', alexMaster.notes);
