import { describe, it, expect } from 'vitest';
import { AttendanceRecord, Session, Student } from '../../types';
import {
  statsFor,
  monthlySeries,
  attendanceYears,
  attendanceBreakdown,
  periodRange,
  dailyRateSeries,
  monthlyRateSeriesForYear,
  studentAbsenceStatus,
  sessionsForDate,
  dayBreakdown,
  clubTrendSeries,
  ABSENCE_ALERT_DAYS,
} from '../attendance';

const rec = (id: string, student_id: string, date: string, status: AttendanceRecord['status'], session_id?: string): AttendanceRecord => ({
  id,
  student_id,
  date,
  status,
  session_id: session_id ?? null,
});

describe('statsFor', () => {
  it('counts late as half credit toward the rate', () => {
    const records = [
      rec('a', 's1', '2026-08-01', 'present'),
      rec('b', 's1', '2026-08-02', 'present'),
      rec('c', 's1', '2026-08-03', 'late'),
      rec('d', 's1', '2026-08-04', 'absent'),
    ];
    const st = statsFor('s1', records);
    expect(st.total).toBe(4);
    expect(st.presentPct).toBe(62.5);
    expect(st.presentOnlyPct).toBe(50);
    expect(st.absentPct).toBe(25);
    expect(st.latePct).toBe(25);
  });

  it('zeroes out for a student with no records', () => {
    expect(statsFor('s9', [])).toEqual({
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      presentPct: 0,
      presentOnlyPct: 0,
      absentPct: 0,
      latePct: 0,
      rate: 0,
    });
  });
});

describe('monthlySeries', () => {
  it('groups by month, sorts ascending, keeps the last 6 months', () => {
    const records = [
      rec('a', 's1', '2026-01-10', 'present'),
      rec('b', 's1', '2026-01-20', 'late'),
      rec('c', 's1', '2026-02-05', 'present'),
    ];
    expect(monthlySeries('s1', records)).toEqual([
      { month: '01', rate: 50 }, // present/total — no late half-credit here
      { month: '02', rate: 100 },
    ]);
  });
});

describe('attendanceYears / attendanceBreakdown', () => {
  it('returns distinct years, most recent first', () => {
    const records = [
      rec('a', 's1', '2026-01-01', 'present'),
      rec('b', 's1', '2025-06-01', 'present'),
      rec('c', 's1', '2024-06-01', 'present'),
      rec('d', 's1', '2026-03-01', 'present'),
    ];
    expect(attendanceYears(records)).toEqual(['2026', '2025', '2024']);
  });

  it('computes the present+half-late rate', () => {
    const records = [
      rec('a', 's1', '2026-01-01', 'present'),
      rec('b', 's1', '2026-01-02', 'present'),
      rec('c', 's1', '2026-01-03', 'late'),
      rec('d', 's1', '2026-01-04', 'absent'),
    ];
    expect(attendanceBreakdown(records)).toEqual({ total: 4, present: 2, late: 1, absent: 1, rate: 62.5 });
  });
});

describe('periodRange', () => {
  it('finds the Monday–Sunday week around a Wednesday anchor', () => {
    expect(periodRange('week', '2026-08-12')).toEqual({ start: '2026-08-10', end: '2026-08-16' });
  });

  it('treats Sunday as the end of the previous week', () => {
    expect(periodRange('week', '2026-08-16')).toEqual({ start: '2026-08-10', end: '2026-08-16' });
  });

  it('handles day, month, year and all', () => {
    expect(periodRange('day', '2026-08-15')).toEqual({ start: '2026-08-15', end: '2026-08-15' });
    expect(periodRange('month', '2026-08-15')).toEqual({ start: '2026-08-01', end: '2026-08-31' });
    expect(periodRange('year', '2026-08-15')).toEqual({ start: '2026-01-01', end: '2026-12-31' });
    expect(periodRange('all', '2026-08-15')).toBeNull();
  });
});

describe('dailyRateSeries / monthlyRateSeriesForYear', () => {
  it('produces one point per day for the window', () => {
    const series = dailyRateSeries([rec('a', 's1', '2026-08-13', 'present')], 3);
    expect(series).toHaveLength(3);
    expect(series.every((p) => typeof p.rate === 'number' && typeof p.total === 'number')).toBe(true);
  });

  it('builds 12 labeled months for a year', () => {
    const series = monthlyRateSeriesForYear([rec('a', 's1', '2026-01-05', 'present')], '2026');
    expect(series).toHaveLength(12);
    expect(series[0]).toEqual({ label: 'Jan', rate: 100, total: 1 });
    expect(series[1]).toEqual({ label: 'Feb', rate: 0, total: 0 });
  });
});

describe('studentAbsenceStatus', () => {
  it('measures days since the last attended date', () => {
    const records = [rec('a', 's1', '2026-08-05', 'present'), rec('b', 's1', '2026-08-10', 'late')];
    expect(studentAbsenceStatus(records, 's1', '2026-08-15')).toEqual({ days: 5, lastAttended: '2026-08-10' });
  });

  it('counts the streak from the earliest record when never attended', () => {
    const records = [rec('a', 's1', '2026-07-25', 'absent')];
    const st = studentAbsenceStatus(records, 's1', '2026-08-15');
    expect(st!.days).toBe(21);
    expect(st!.lastAttended).toBeNull();
  });

  it('returns null for students with no records', () => {
    expect(studentAbsenceStatus([], 's9', '2026-08-15')).toBeNull();
  });

  it('flags streaks longer than the alert threshold', () => {
    const st = studentAbsenceStatus([rec('a', 's1', '2026-07-20', 'present')], 's1', '2026-08-15');
    expect(st!.days).toBeGreaterThan(ABSENCE_ALERT_DAYS);
  });
});

describe('sessionsForDate', () => {
  const sessions: Session[] = [
    { id: 's1', title: 'Evening', time: '18:00', days: [3, 5] },
    { id: 's2', title: 'Morning', time: '08:00', days: [3] },
    { id: 's3', title: 'Saturday', time: '09:00', days: [6] },
  ];

  it('filters by day of week and sorts by time', () => {
    const out = sessionsForDate(sessions, '2026-08-12'); // Wednesday
    expect(out.map((s) => s.id)).toEqual(['s2', 's1']);
  });

  it('marks sessions on past dates as Completed', () => {
    const out = sessionsForDate(sessions, '2026-08-12');
    expect(out.every((s) => s.computedStatus === 'Completed')).toBe(true);
  });
});

describe('dayBreakdown', () => {
  it('filters by date and optional session', () => {
    const records = [
      rec('a', 's1', '2026-08-12', 'present', 's1'),
      rec('b', 's1', '2026-08-12', 'late', 's1'),
      rec('c', 's1', '2026-08-12', 'present'),
      rec('d', 's1', '2026-08-13', 'present', 's1'),
    ];
    expect(dayBreakdown(records, '2026-08-12', 's1')).toEqual({ total: 2, present: 1, late: 1, absent: 0, rate: 75 });
    expect(dayBreakdown(records, '2026-08-12')).toEqual({ total: 3, present: 2, late: 1, absent: 0, rate: 83.3 });
  });
});

describe('clubTrendSeries', () => {
  it('groups monthly data with short month labels', () => {
    const records = [rec('a', 's1', '2026-01-05', 'present'), rec('b', 's1', '2026-02-05', 'present')];
    const series = clubTrendSeries(records, 'monthly');
    expect(series.map((p) => p.label)).toEqual(['Jan', 'Feb']);
    expect(series[0].rate).toBe(100);
  });

  it('keeps 7 daily points in weekly mode', () => {
    expect(clubTrendSeries([], 'weekly')).toHaveLength(7);
  });
});

describe('roster helpers typing sanity', () => {
  it('accepts the real student shape used by views', () => {
    const students: Student[] = [{ id: 's1', name: 'Kamal', full_name: 'Kamal Perera', belt: 'Blue (5th Kyu)' }];
    expect(students[0].belt).toBe('Blue (5th Kyu)');
  });
});
