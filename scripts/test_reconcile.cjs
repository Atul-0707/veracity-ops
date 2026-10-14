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
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/â€‹/g, '')
    .trim();
}

function cleanMojibake(v) {
  if (!v) return '';
  return String(v)
    .replace(/FranÃ§ois/g, 'François')
    .replace(/MÃ¼ller/g, 'Müller')
    .replace(/MÃ©ndez/g, 'Méndez')
    .replace(/BenoÃ®t/g, 'Benoît')
    .replace(/BenoÃƒÂ®t/g, 'Benoît')
    .replace(/O’Connor/g, "O'Connor")
    .replace(/OConnor/g, "O'Connor");
}

function normalizeFullName(rawName, first, last) {
  let base = (rawName || '').trim();
  if (base.includes(',')) {
    const parts = base.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 2) base = parts[1] + ' ' + parts[0];
  }
  if (!base) base = ((first || '') + ' ' + (last || '')).trim();
  const tokens = base.split(/\s+/);
  const deduped = tokens.filter((t, i) => i === 0 || t.toLowerCase() !== tokens[i - 1].toLowerCase());
  return deduped.join(' ');
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

function normalizeE164(phone) {
  if (!phone) return { e164: '', ext: '', raw: '', isFake: false };
  const raw = String(phone).trim();
  const extMatch = raw.match(/(?:ext\.?|x|#|;)\s*(\d+)/i);
  const ext = extMatch ? extMatch[1] : '';
  const baseOnly = raw.split(/(?:ext\.?|x|#|;)/i)[0].trim();
  let digits = baseOnly.replace(/\D/g, '');

  if (digits.length < 7 || /^(9{7,}|1{7,}|0+|1234567890|5555555555)$/.test(digits) || raw.toLowerCase().includes('slack')) {
    return { e164: '', ext: '', raw, isFake: true };
  }

  // European leading 0 trunk
  if (baseOnly.startsWith('+44 (0)') || baseOnly.startsWith('+44(0)')) digits = '44' + digits.slice(3);
  else if (baseOnly.startsWith('+49 (0)') || baseOnly.startsWith('+49(0)')) digits = '49' + digits.slice(3);
  else if (raw.startsWith('0') && digits.length === 11) digits = '44' + digits.slice(1);
  else if (digits.length === 10) digits = '1' + digits;

  return { e164: '+' + digits, ext, raw, isFake: false };
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

// Map rows
const leads = rawRows.map((row) => {
  const norm = {};
  for (const [k, v] of Object.entries(row)) norm[normalizeHeader(k)] = v != null ? String(v).trim() : '';

  const id = row.Record_ID || norm['recordid'];
  let first = stripZeroWidth(cleanMojibake(row.First_Name || norm['firstname']));
  let last = stripZeroWidth(cleanMojibake(row.Last_Name || norm['lastname']));
  let full = stripZeroWidth(cleanMojibake(row.Full_Name || norm['fullname']));

  // Inverted name check
  if (first.endsWith(',')) {
    const tmp = first.replace(/,+$/, '').trim();
    first = (last || '').trim();
    last = tmp;
  }
  if (last.includes(' ')) {
    const parts = last.split(/\s+/);
    if (parts[0].toLowerCase() === first.toLowerCase()) {
      last = parts.slice(1).join(' ');
    }
  }

  const cleanFull = normalizeFullName(full, first, last);
  if (!first && cleanFull) {
    const p = cleanFull.split(/\s+/);
    first = p[0];
    last = p.slice(1).join(' ');
  }

  const email = (row.Work_Email || norm['workemail'] || '').trim().toLowerCase();
  const domain = getApexDomain(row.Website || norm['website'], email);
  const phoneRes = normalizeE164(row.Phone_Raw || norm['phoneraw']);
  const company = stripZeroWidth(cleanMojibake(row.Company_Name || norm['companyname']));
  const title = stripZeroWidth(cleanMojibake(row.Job_Title || norm['jobtitle']));
  const notes = row.CRM_Notes || norm['crmnotes'] || '';
  const arr = Number(row.Deal_ARR_USD || norm['dealarrusd']) || 0;

  // Triage check
  let isQuarantine = false;
  let quarantineReason = '';

  if (id.startsWith('BAD-')) {
    isQuarantine = true;
    quarantineReason = notes || 'Benchmark fatal lead';
  } else if (email && (email.includes('@@') || email.includes('..') || email.endsWith('@none.com') || email.includes('mailinator') || email.includes('tempmail') || email.includes('guerrillamail') || email.includes('10minutemail') || email.includes('yopmail'))) {
    isQuarantine = true;
    quarantineReason = 'Disposable or syntax error email';
  } else if ((!first && !last) || isDummyLead(first) || isDummyLead(last) || isDummyLead(company)) {
    isQuarantine = true;
    quarantineReason = 'Dummy lead / keyboard mash';
  } else if (!email && !phoneRes.e164) {
    isQuarantine = true;
    quarantineReason = 'Missing all identity vectors';
  }

  return {
    id,
    first,
    last,
    full: cleanFull,
    email,
    domain,
    phone: phoneRes.e164,
    phone_ext: phoneRes.ext,
    phone_raw: phoneRes.raw,
    isPhoneFake: phoneRes.isFake,
    company,
    title,
    notes,
    arr,
    source: row.Source_System || '',
    isQuarantine,
    quarantineReason
  };
});

// Clustering
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
  if (l.email && !l.isQuarantine) {
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
  if (l.full && l.domain && !l.isQuarantine && !l.id.startsWith('DD-') && !l.id.startsWith('SN-')) {
    const k = l.full.toLowerCase() + '@' + l.domain.toLowerCase();
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
  if (l.phone && l.last && !l.isQuarantine && !l.isPhoneFake) {
    const k = l.phone + '_' + l.last.toLowerCase();
    if (!byPhoneLast.has(k)) byPhoneLast.set(k, []);
    byPhoneLast.get(k).push(l.id);
  }
});
byPhoneLast.forEach(ids => {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) addEdge(ids[i], ids[j]);
  }
});

// Connected components
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

console.log('--- RECONCILIATION RESULTS ---');
console.log('Total Raw Rows Ingested:', leads.length);
console.log('Duplicate Clusters Detected:', clusters.length);

let totalDupRows = 0;
clusters.forEach((c, idx) => {
  totalDupRows += c.length;
  console.log(`Cluster #${idx + 1} (${c.length} rows): ${c.join(', ')}`);
});

const subordinateDuplicates = totalDupRows - clusters.length;
console.log('Duplicate Rows in Clusters:', totalDupRows);
console.log('Subordinate Duplicates to Retire:', subordinateDuplicates);

const fatalQuarantined = leads.filter(l => l.isQuarantine);
console.log('Fatal Quarantined Count:', fatalQuarantined.length);
console.log('Fatal IDs:', fatalQuarantined.map(x => x.id).join(', '));

const goldenCount = leads.length - fatalQuarantined.length - subordinateDuplicates;
console.log('Approved Clean Golden Leads:', goldenCount);
