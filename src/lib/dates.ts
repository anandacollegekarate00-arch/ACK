// Formats a Date using its LOCAL calendar fields (no UTC conversion) —
// unlike `d.toISOString().slice(0,10)`, which silently rolls the date back
// a day for any timezone ahead of UTC (e.g. Sri Lanka, UTC+5:30). Every
// place in this app that needs "today" or does date-shifting arithmetic
// should go through this, not toISOString.
export function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "Today" in the club's own timezone (Asia/Colombo, UTC+5:30, no DST).
// Using the device clock breaks on phones whose timezone is set to something
// else — the app would mark attendance for the wrong date. Part of the
// (year, month, day) is formatted from a formatter forced to Asia/Colombo;
// there's no offset math involved, so DST quirks can't corrupt the date.
export const ACK_TZ = 'Asia/Colombo';
export const ackDateParts = (d) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ACK_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value || '';
  return { y: get('year'), m: get('month'), day: get('day') };
};

export function todayISO() {
  const p = ackDateParts(new Date());
  return `${p.y}-${p.m}-${p.day}`;
}
