import { Calendar, Clock, AlertTriangle, TrendingUp, TrendingDown, Activity } from '../icons';
import { ROYAL, SUCCESS, DANGER, WARNING } from './theme';
import { ymd, todayISO } from './dates';
import { AttendanceRecord, Session, Student, AttendanceSummary, AttendanceBreakdown, TrendDatum } from '../types';
import React from 'react';

// Attendance math shared across the app. Every rate keeps one convention:
// "late" counts as half credit toward the headline attendance number, while
// the strict present-only number is kept alongside where it matters.

export function statsFor(studentId: string, attendance: AttendanceRecord[]): AttendanceSummary {
  const recs = attendance.filter((a) => a.student_id === studentId);
  const total = recs.length;
  const present = recs.filter((r) => r.status === 'present').length;
  const absent = recs.filter((r) => r.status === 'absent').length;
  const late = recs.filter((r) => r.status === 'late').length;
  const presentPct = total ? Math.round(((present + late * 0.5) / total) * 1000) / 10 : 0;
  const presentOnlyPct = total ? Math.round((present / total) * 1000) / 10 : 0;
  return {
    total,
    present,
    absent,
    late,
    presentPct,
    presentOnlyPct,
    rate: presentPct,
    absentPct: total ? Math.round((absent / total) * 1000) / 10 : 0,
    latePct: total ? Math.round((late / total) * 1000) / 10 : 0,
  };
}

export function monthlySeries(studentId: string, attendance: AttendanceRecord[]): { month: string; rate: number }[] {
  const recs = attendance.filter((a) => a.student_id === studentId);
  const byMonth: Record<string, { present: number; total: number }> = {};
  recs.forEach((r) => {
    const m = r.date.slice(0, 7);
    byMonth[m] = byMonth[m] || { present: 0, total: 0 };
    byMonth[m].total += 1;
    if (r.status === 'present') byMonth[m].present += 1;
  });
  return Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, v]) => ({ month: month.slice(5), rate: Math.round((v.present / v.total) * 100) }));
}

// Per-period present/late/absent composition for the Dashboard trend chart.
// Periods with no records come back with total 0 so the chart renders them
// as gaps instead of fake zeros. Weekly = last 7 days, monthly = last 6
// months, yearly = every year with data (max 6). All rates keep the "late
// counts as half credit" convention.
export function clubTrendSeries(attendance: AttendanceRecord[], granularity: 'weekly' | 'monthly' | 'yearly'): TrendDatum[] {
  const now = new Date();
  if (granularity === 'weekly') {
    const out: TrendDatum[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      out.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        ...attendanceBreakdown(attendance.filter((a) => a.date === ymd(d))),
      });
    }
    return out;
  }
  if (granularity === 'yearly') {
    return [...attendanceYears(attendance)]
      .sort((a, b) => a.localeCompare(b))
      .slice(-6)
      .map((y) => ({ label: y, ...attendanceBreakdown(attendance.filter((a) => a.date.startsWith(y))) }));
  }
  const byMonth: Record<string, AttendanceRecord[]> = {};
  attendance.forEach((r) => {
    const m = r.date.slice(0, 7);
    (byMonth[m] = byMonth[m] || []).push(r);
  });
  return Object.keys(byMonth)
    .sort()
    .slice(-6)
    .map((m) => ({ label: MONTH_LABELS[Number(m.slice(5)) - 1], ...attendanceBreakdown(byMonth[m]) }));
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface InsightRow {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tint: string;
  text: string;
}

// Auto-generated insights for the Dashboard trend card — the "what should I
// actually do about this" layer on top of the raw chart. Returns up to 4
// { icon, tint, text } rows, most actionable first.
export function clubTrendInsights(
  attendance: AttendanceRecord[],
  sessions: Session[],
  students: Student[],
  series: TrendDatum[]
): InsightRow[] {
  const out: InsightRow[] = [];
  const withData = series.filter((p) => p.total > 0);

  // 1 — Direction of travel: later half of the range vs the earlier half.
  if (withData.length >= 2) {
    const half = Math.ceil(withData.length / 2);
    const earlier = withData.slice(0, half).reduce((s, p) => s + p.rate, 0) / half;
    const later = withData.slice(half).reduce((s, p) => s + p.rate, 0) / (withData.length - half);
    const delta = Math.round((later - earlier) * 10) / 10;
    if (delta > 0.4)
      out.push({ icon: TrendingUp, tint: SUCCESS, text: `Attendance is improving — up ${delta} pts versus the earlier period` });
    else if (delta < -0.4)
      out.push({
        icon: TrendingDown,
        tint: DANGER,
        text: `Attendance is slipping — down ${Math.abs(delta)} pts versus the earlier period`,
      });
    else out.push({ icon: Activity, tint: '#6B7280', text: 'Attendance has held steady across these periods' });
  }

  // 2 — Session comparison, only when multiple sessions actually have data.
  if (sessions.length >= 2) {
    const perSession = sessions
      .map((s) => ({
        s,
        ...attendanceBreakdown(attendance.filter((a) => (a.session_id || null) === s.id)),
      }))
      .filter((x) => x.total > 0)
      .sort((a, b) => b.rate - a.rate);
    if (perSession.length >= 2) {
      const top = perSession[0],
        bottom = perSession[perSession.length - 1];
      const diff = Math.round((top.rate - bottom.rate) * 10) / 10;
      if (diff >= 3)
        out.push({ icon: Clock, tint: ROYAL, text: `${top.s.title} draws stronger turnout than ${bottom.s.title} (+${diff} pts)` });
    }
  }

  // 3 — Day-of-week pattern across all data.
  const dowRates = DAY_NAMES.map((name, dow) => {
    const b = attendanceBreakdown(attendance.filter((a) => new Date(a.date + 'T00:00:00').getDay() === dow));
    return { name, ...b };
  }).filter((x) => x.total > 0);
  if (dowRates.length >= 2) {
    const best = dowRates.reduce((a, b) => (b.rate > a.rate ? b : a));
    out.push({ icon: Calendar, tint: SUCCESS, text: `${best.name}s are your highest-attendance day (${best.rate}%)` });
  }

  // 4 — Punctuality: share of all marks that were "late".
  if (attendance.length > 0) {
    const lateShare = Math.round((attendance.filter((r) => r.status === 'late').length / attendance.length) * 1000) / 10;
    if (lateShare >= 5)
      out.push({ icon: Clock, tint: WARNING, text: `${lateShare}% of all marks are "late" — punctuality could be tightened` });
  }

  // 5 — Absence streaks: students not seen in 2+ weeks.
  if (students.length > 0) {
    const today = todayISO();
    const atRisk = students.filter((s) => {
      const st = studentAbsenceStatus(attendance, s.id, today);
      return st && st.days > ABSENCE_ALERT_DAYS;
    });
    if (atRisk.length > 0)
      out.push({
        icon: AlertTriangle,
        tint: DANGER,
        text: `${atRisk.length} student${atRisk.length === 1 ? '' : 's'} haven't been seen in 2+ weeks — worth a follow-up`,
      });
  }

  return out.slice(0, 4);
}

// ----------------------------------------------------------------------------
// Analytics helpers — pure functions over the attendance array, all keeping
// the same "late counts as half credit" convention as statsFor/dayBreakdown.
// ----------------------------------------------------------------------------
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Distinct years present in the attendance data, most recent first — powers
// the year filter on the Analytics screen.
export function attendanceYears(attendance: AttendanceRecord[]): string[] {
  const years = new Set(attendance.map((a) => a.date.slice(0, 4)));
  return Array.from(years).sort((a, b) => b.localeCompare(a)) as string[];
}

// Present/late/absent breakdown for whatever slice of attendance records is
// passed in — the caller does any year/session filtering beforehand.
export function attendanceBreakdown(attendance: AttendanceRecord[]): AttendanceBreakdown {
  const total = attendance.length;
  const present = attendance.filter((r) => r.status === 'present').length;
  const late = attendance.filter((r) => r.status === 'late').length;
  const absent = attendance.filter((r) => r.status === 'absent').length;
  const rate = total ? Math.round(((present + late * 0.5) / total) * 1000) / 10 : 0;
  return { total, present, late, absent, rate };
}

// Resolves a "period" (day/week/month/year) plus an anchor date into an
// inclusive [start, end] ISO date range — powers the Attendance Breakdown
// pie chart's Day/Week/Month/Year picker. Week runs Monday–Sunday.
export function periodRange(period: string, anchorIso: string): { start: string; end: string } | null {
  const d = new Date(anchorIso + 'T00:00:00');
  if (period === 'day') return { start: anchorIso, end: anchorIso };
  if (period === 'week') {
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: ymd(start), end: ymd(end) };
  }
  if (period === 'month') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start: ymd(start), end: ymd(end) };
  }
  if (period === 'year') return { start: `${d.getFullYear()}-01-01`, end: `${d.getFullYear()}-12-31` };
  return null; // 'all'
}

// Human-readable label for the currently selected period, shown next to the
// date picker (e.g. "Week of 11–17 Aug 2026").
export function formatPeriodLabel(period: string, anchorIso: string): string {
  const d = new Date(anchorIso + 'T00:00:00');
  if (period === 'day') return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  if (period === 'week') {
    const range = periodRange('week', anchorIso);
    const s = new Date(range!.start + 'T00:00:00'),
      e = new Date(range!.end + 'T00:00:00');
    const startStr = s.toLocaleDateString('en-US', { day: 'numeric', month: s.getMonth() === e.getMonth() ? undefined : 'short' });
    const endStr = e.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Week of ${startStr}–${endStr}`;
  }
  if (period === 'month') return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (period === 'year') return String(d.getFullYear());
  return 'All Time';
}

// One point per calendar day for the last `numDays` days (today inclusive).
export function dailyRateSeries(attendance: AttendanceRecord[], numDays: number): TrendDatum[] {
  const now = new Date();
  const out: TrendDatum[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = ymd(d);
    const b = attendanceBreakdown(attendance.filter((a) => a.date === iso));
    out.push({ label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), rate: b.rate, total: b.total });
  }
  return out;
}

// Jan-Dec rate for one specific calendar year.
export function monthlyRateSeriesForYear(attendance: AttendanceRecord[], year: string): TrendDatum[] {
  return MONTH_LABELS.map((label, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
    const b = attendanceBreakdown(attendance.filter((a) => a.date.startsWith(prefix)));
    return { label, rate: b.rate, total: b.total };
  });
}

// Rolling last 12 calendar months, used when no specific year is selected.
export function monthlyRateSeriesRolling(attendance: AttendanceRecord[]): TrendDatum[] {
  const now = new Date();
  const out: TrendDatum[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const b = attendanceBreakdown(attendance.filter((a) => a.date.startsWith(prefix)));
    out.push({ label: `${MONTH_LABELS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, rate: b.rate, total: b.total });
  }
  return out;
}

// One bar per year the club has any attendance data for — the all-time
// overall trend, unaffected by the year filter (only by the session filter).
export function yearlyRateSeries(attendance: AttendanceRecord[]): TrendDatum[] {
  const years = [...attendanceYears(attendance)].sort((a, b) => a.localeCompare(b));
  return years.map((y) => {
    const b = attendanceBreakdown(attendance.filter((a) => a.date.startsWith(y)));
    return { label: y, rate: b.rate, total: b.total };
  });
}

export const ABSENCE_ALERT_DAYS = 14;

// How long it's been since a student last showed up as present/late — used
// to flag long absence streaks rather than just a low attendance percentage
// (a student with one absence out of one session isn't "needs attention" the
// way someone who hasn't shown up in a month is). Returns null for students
// with no attendance records at all in the given slice.
export function studentAbsenceStatus(
  attendance: AttendanceRecord[],
  studentId: string,
  todayIso: string
): { days: number; lastAttended: string | null } | null {
  const recs = attendance.filter((a) => a.student_id === studentId);
  if (recs.length === 0) return null;
  const attendedDates = recs
    .filter((r) => r.status === 'present' || r.status === 'late')
    .map((r) => r.date)
    .sort();
  const lastAttended = attendedDates.length ? attendedDates[attendedDates.length - 1] : null;
  // Never attended a single session: count the streak from their earliest
  // record so a long-absent brand-new student still surfaces.
  const since = lastAttended || recs.map((r) => r.date).sort()[0];
  const days = Math.round((new Date(todayIso).getTime() - new Date(since).getTime()) / 86400000);
  return { days, lastAttended };
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function sessionsForDate(sessions: Session[], dateISO: string): (Session & { computedStatus: string })[] {
  const d = new Date(dateISO + 'T00:00:00');
  const dow = d.getDay();
  const isToday = dateISO === todayISO();
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return sessions
    .filter((s) => s.days.includes(dow))
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((s) => ({ ...s, computedStatus: !isToday || s.time <= hhmm ? 'Completed' : 'Upcoming' }));
}

export function sessionsForToday(sessions: Session[]): (Session & { computedStatus: string })[] {
  return sessionsForDate(sessions, todayISO());
}

// Day-level breakdown for a given date (+ optional session filter) — powers
// the "analyze each day" attendance view.
export function dayBreakdown(attendance: AttendanceRecord[], dateISO: string, sessionId?: string): AttendanceBreakdown {
  const recs = attendance.filter((a) => a.date === dateISO && (sessionId === undefined || (a.session_id || null) === (sessionId || null)));
  const present = recs.filter((r) => r.status === 'present').length;
  const absent = recs.filter((r) => r.status === 'absent').length;
  const late = recs.filter((r) => r.status === 'late').length;
  const total = recs.length;
  const rate = total ? Math.round(((present + late * 0.5) / total) * 1000) / 10 : 0;
  return { total, present, absent, late, rate };
}
