import { todayISO } from './/dates';

// Turns a WhatsApp/phone number into a synthetic email address so it can be
// used as a Supabase Auth login ID — Supabase requires an email-shaped
// identifier even though the parent only ever sees/uses the phone number.
export function phoneToParentEmail(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits ? `${digits}@parent.anandakarateclub.local` : '';
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Client-side preview of the next admission ID. The real ID is assigned by
// the database trigger (see database-schema.sql: assign_admission_id) so two
// coaches can't ever claim the same number; this only shows the coach a
// reasonable preview before the row is saved.
export function generateAdmissionId(roster, joinDateISO) {
  const year = (joinDateISO || todayISO()).slice(0, 4);
  const countThisYear = roster.filter((s) => s.admission_id?.includes(`ACK-${year}-`)).length;
  return `ACK-${year}-${String(countThisYear + 1).padStart(3, '0')}`;
}

// "Name" (short) is the account/display identifier used everywhere in the
// app; "Full name" is legal-detail info shown only on the profile. Falls
// back to full_name for any student added before this field existed.
export function displayName(student) {
  return (student && (student.name || student.full_name)) || 'Unnamed';
}
