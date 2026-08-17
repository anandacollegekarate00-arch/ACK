import { BELTS } from './/theme';
import { todayISO } from './/dates';

export function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- CSV import -----------------------------------------------------
// RFC-4180-ish parser: quoted fields, escaped quotes, \r\n or \n, BOM.
export function parseCSV(text) {
  const rows = [];
  let row = [],
    field = '',
    inQuotes = false;
  const s = String(text || '').replace(/^\ufeff/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

// Header matching is tolerant: case/space/punctuation-insensitive, plus
// common synonyms, so exports from this app and hand-made sheets both work.
export function normHeaderToken(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export const CSV_HEADER_MAP = {
  name: ['name', 'displayname', 'shortname', 'studentname'],
  full_name: ['fullname', 'fulllegalname', 'legalname'],
  dob: ['dob', 'dateofbirth', 'birthdate', 'birthday'],
  belt: ['belt', 'kyu', 'rank', 'beltrank'],
  grade: ['grade', 'class', 'gradeclass', 'schoolgrade'],
  join_date: ['joindate', 'datejoined', 'enrolldate', 'enrollmentdate', 'registrationdate'],
  birth_cert_no: ['birthcertno', 'birthcertificate', 'birthcertificateno'],
  nic: ['nic', 'postalid', 'nicpostalid'],
  school_admission_no: ['schooladmissionno', 'schooladmissionnumber', 'schooladmission'],
  association_admission_no: ['associationadmissionno', 'associationadmissionnumber', 'associationadmission', 'assocadmissionno'],
  guardian_name: ['guardianname', 'parentname', 'guardian', 'parentguardianname'],
  guardian_phone: ['guardianphone', 'phone', 'phonenumber', 'guardianphonenumber', 'mobile'],
  guardian_whatsapp: ['guardianwhatsapp', 'whatsapp', 'guardianwhatsappnumber'],
  guardian_email: ['guardianemail', 'email', 'emailaddress', 'guardianemailaddress'],
  guardian_address: ['guardianaddress', 'address'],
};
// Recognised but not imported â€” the database trigger assigns admission IDs.
export const CSV_IGNORED_HEADERS = ['admissionid', 'admissionno', 'admissionnumber', 'admission'];

export function normalizeISODate(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const [, dd, mm, yyRaw] = m;
    let yy = yyRaw;
    if (yy.length === 2) yy = '20' + yy;
    const y = Number(yy),
      mo = Number(mm),
      d = Number(dd);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100)
      return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }
  return '';
}

export function normalizeBelt(v) {
  const s = String(v || '').trim();
  if (!s) return null;
  const n = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/^(black|blackbelt|1stdan|dan\d*|shodan)/.test(n)) return 'Black';
  let word = s.split(/\s+/)[0].toLowerCase();
  if (word === 'grey') word = 'yellow';
  return (
    BELTS.find((b) => b.toLowerCase().replace(/[^a-z0-9]/g, '') === n) || BELTS.find((b) => b.toLowerCase().split(' ')[0] === word) || null
  );
}

// Maps CSV rows to student records. Returns { valid, skipped } where skipped
// is [{ row, name, reason }] â€” row numbers are 1-based file lines.
export function csvToStudents(headers, rows, roster) {
  const idx = {};
  headers.forEach((h, i) => {
    const t = normHeaderToken(h);
    if (!t || CSV_IGNORED_HEADERS.includes(t)) return;
    for (const [key, aliases] of Object.entries(CSV_HEADER_MAP)) {
      if (aliases.includes(t)) {
        idx[key] = i;
        break;
      }
    }
  });
  const rosterKeys = new Set(roster.map((s) => normHeaderToken(s.full_name || s.name)));
  const valid = [],
    skipped = [];
  const seen = new Set();
  rows.forEach((cells, ri) => {
    const get = (k) => {
      const i = idx[k];
      return i === undefined ? '' : String(cells[i] ?? '').trim();
    };
    const name = get('name') || get('full_name');
    const dob = normalizeISODate(get('dob'));
    const reason = [];
    if (!name) reason.push('missing name');
    if (!dob) reason.push('missing/invalid date of birth');
    const key = normHeaderToken(get('full_name') || name);
    if (key && rosterKeys.has(key)) reason.push('already in roster');
    if (key && seen.has(key)) reason.push('duplicate in file');
    if (reason.length) {
      skipped.push({ row: ri + 2, name: name || '(no name)', reason: reason.join(', ') });
      return;
    }
    seen.add(key);
    valid.push({
      name,
      full_name: get('full_name') || null,
      dob,
      belt: normalizeBelt(get('belt')) || 'White (10th Kyu)',
      grade: get('grade') || null,
      join_date: normalizeISODate(get('join_date')) || todayISO(),
      birth_cert_no: get('birth_cert_no') || null,
      nic: get('nic') || null,
      school_admission_no: get('school_admission_no') || null,
      association_admission_no: get('association_admission_no') || null,
      guardian_name: get('guardian_name') || null,
      guardian_phone: get('guardian_phone') || null,
      guardian_whatsapp: get('guardian_whatsapp') || null,
      guardian_email: get('guardian_email') || null,
      guardian_address: get('guardian_address') || null,
    });
  });
  return { valid, skipped };
}
