import React from 'react';
import { Calendar, Trophy, Check, Clock, AlertTriangle, TrendingUp, PieChartIcon } from '../icons';
import { DonutChart, TrendBarChart } from '../components/charts';
import { Avatar, BeltBadge, Card, StatCard, inputCls } from '../components/ui';
import { ROYAL, GOLD, SUCCESS, DANGER, WARNING } from '../lib/theme';
import { todayISO } from '../lib/dates';
import { displayName } from '../lib/identity';
import {
  attendanceYears,
  attendanceBreakdown,
  periodRange,
  formatPeriodLabel,
  dailyRateSeries,
  monthlyRateSeriesForYear,
  monthlyRateSeriesRolling,
  yearlyRateSeries,
  ABSENCE_ALERT_DAYS,
  studentAbsenceStatus,
} from '../lib/attendance';

export const DAILY_RANGE_OPTIONS = [
  { id: 7, label: '7D' },
  { id: 14, label: '14D' },
  { id: 30, label: '30D' },
];

export function AnalyticsView({ students, attendance, sessions, achievements, eventRegistrations, openStudent }) {
  const years: string[] = React.useMemo(() => attendanceYears(attendance), [attendance]);
  const [year, setYear] = React.useState('all');
  const [sessionId, setSessionId] = React.useState('all');
  const [dailyRange, setDailyRange] = React.useState(14);
  const [period, setPeriod] = React.useState('day');
  const [anchorDate, setAnchorDate] = React.useState(todayISO());
  const [playerMetric, setPlayerMetric] = React.useState('medals');

  // Year + session filtered slice — drives the daily/monthly trend charts
  // and the per-student needs-attention / top-performer lists.
  const scoped = React.useMemo(
    () =>
      attendance.filter(
        (a) => (year === 'all' || a.date.startsWith(year)) && (sessionId === 'all' || (a.session_id || null) === sessionId)
      ),
    [attendance, year, sessionId]
  );

  // Only the session filter applies here — "all years" is the whole point
  // of this chart, so the year dropdown shouldn't collapse it to one bar.
  const sessionScoped = React.useMemo(
    () => attendance.filter((a) => sessionId === 'all' || (a.session_id || null) === sessionId),
    [attendance, sessionId]
  );

  // Independent Day/Week/Month/Year/All picker for the breakdown pie chart
  // and the stat row above it — separate from the year filter above so you
  // can look at, say, just today's breakdown without losing the trend
  // charts' year context.
  const periodScoped = React.useMemo(() => {
    const range = period === 'all' ? null : periodRange(period, anchorDate);
    return attendance.filter(
      (a) => (sessionId === 'all' || (a.session_id || null) === sessionId) && (!range || (a.date >= range.start && a.date <= range.end))
    );
  }, [attendance, sessionId, period, anchorDate]);

  const breakdown = React.useMemo(() => attendanceBreakdown(periodScoped), [periodScoped]);
  const daily = React.useMemo(() => dailyRateSeries(scoped, dailyRange), [scoped, dailyRange]);
  const monthly = React.useMemo(
    () => (year === 'all' ? monthlyRateSeriesRolling(scoped) : monthlyRateSeriesForYear(scoped, year)),
    [scoped, year]
  );
  const yearly = React.useMemo(() => yearlyRateSeries(sessionScoped), [sessionScoped]);

  // Top Players — ranked by real data only: medals won (Gold first, then
  // Silver, then Bronze), attendance rate in the current filter, or number of
  // events entered. No synthetic scores, no weights.
  const topPlayers = React.useMemo(() => {
    const rows = students.map((s) => {
      const my = achievements.filter((a) => a.student_id === s.id);
      const medals = {
        Gold: my.filter((a) => a.placement === 'Gold').length,
        Silver: my.filter((a) => a.placement === 'Silver').length,
        Bronze: my.filter((a) => a.placement === 'Bronze').length,
      };
      const att = attendanceBreakdown(scoped.filter((a) => a.student_id === s.id));
      const entries = eventRegistrations.filter((r) => r.student_id === s.id).length;
      return { student: s, medals, medalsTotal: medals.Gold + medals.Silver + medals.Bronze, att, entries };
    });
    const sorters = {
      medals: (a, b) =>
        b.medals.Gold - a.medals.Gold ||
        b.medals.Silver - a.medals.Silver ||
        b.medals.Bronze - a.medals.Bronze ||
        b.medalsTotal - a.medalsTotal,
      attendance: (a, b) => b.att.rate - a.att.rate || b.att.total - a.att.total,
      participation: (a, b) => b.entries - a.entries || b.medalsTotal - a.medalsTotal,
    };
    return rows
      .filter((r) => playerMetric !== 'attendance' || r.att.total > 0)
      .sort(sorters[playerMetric])
      .slice(0, 10);
  }, [students, scoped, achievements, eventRegistrations, playerMetric]);

  // Needs Attention flags long absence streaks (2+ weeks since last seen),
  // not just a low attendance percentage — deliberately ignores the year
  // filter (only the session filter) since "how long has it been" is a
  // question about right now, not about whichever year happens to be picked.
  const needsAttention = React.useMemo(() => {
    const today = todayISO();
    return students
      .map((s) => ({ student: s, status: studentAbsenceStatus(sessionScoped, s.id, today) }))
      .filter((r) => r.status && r.status.days > ABSENCE_ALERT_DAYS)
      .sort((a, b) => b.status.days - a.status.days)
      .slice(0, 6);
  }, [students, sessionScoped]);

  const selectCls = 'text-xs font-semibold rounded-full px-3 py-1.5 border border-[var(--ack-border)] bg-[var(--ack-card)] shrink-0';

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <h1
        className="text-xl font-extrabold mb-4 flex items-center gap-2"
        style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}
      >
        <PieChartIcon size={20} color={ROYAL} /> Analytics
      </h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls} style={{ color: 'var(--ack-heading)' }}>
          <option value="all">All Time</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className={selectCls}
          style={{ color: 'var(--ack-heading)' }}
        >
          <option value="all">All Sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Calendar} label="Records" value={breakdown.total} tint={ROYAL} />
        <StatCard icon={TrendingUp} label="Attendance Rate" value={`${breakdown.rate}%`} tint={SUCCESS} />
        <StatCard icon={Check} label="Present" value={breakdown.present} tint={SUCCESS} />
        <StatCard icon={Clock} label="Late" value={breakdown.late} tint={WARNING} />
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold" style={{ color: 'var(--ack-heading)' }}>
            Attendance Breakdown
          </h2>
          <div className="flex gap-1">
            {[
              ['day', 'Day'],
              ['week', 'Week'],
              ['month', 'Month'],
              ['year', 'Year'],
              ['all', 'All'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPeriod(id)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={
                  period === id ? { background: ROYAL, color: '#fff' } : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {period !== 'all' && (
          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              className={`${inputCls} flex-1`}
              value={anchorDate}
              max={todayISO()}
              onChange={(e) => setAnchorDate(e.target.value)}
            />
            <span className="text-[11px] text-[var(--ack-muted)] whitespace-nowrap shrink-0">{formatPeriodLabel(period, anchorDate)}</span>
          </div>
        )}
        {breakdown.total === 0 ? (
          <p className="text-xs text-[var(--ack-muted)] text-center py-8">
            No attendance records for this {period === 'all' ? 'filter' : period} yet.
          </p>
        ) : (
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <DonutChart
              segments={[
                { key: 'present', value: breakdown.present, color: SUCCESS },
                { key: 'late', value: breakdown.late, color: WARNING },
                { key: 'absent', value: breakdown.absent, color: DANGER },
              ]}
              centerLabel={`${breakdown.rate}%`}
              centerSub={`${breakdown.total} records`}
            />
            <div className="space-y-2.5">
              {[
                { label: 'Present', value: breakdown.present, color: SUCCESS },
                { label: 'Late', value: breakdown.late, color: WARNING },
                { label: 'Absent', value: breakdown.absent, color: DANGER },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                  <span className="font-semibold w-14" style={{ color: 'var(--ack-heading)' }}>
                    {row.label}
                  </span>
                  <span className="text-[var(--ack-muted)]">
                    {row.value} · {breakdown.total ? Math.round((row.value / breakdown.total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: 'var(--ack-heading)' }}>
            Daily Attendance Rate
          </h2>
          <div className="flex gap-1">
            {DAILY_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDailyRange(opt.id)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={
                  dailyRange === opt.id
                    ? { background: ROYAL, color: '#fff' }
                    : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <TrendBarChart data={daily} color={ROYAL} barMinWidth={dailyRange === 30 ? 34 : dailyRange === 14 ? 46 : 60} />
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ack-heading)' }}>
          Monthly Attendance Rate {year !== 'all' ? `— ${year}` : '(rolling 12 months)'}
        </h2>
        <TrendBarChart data={monthly} color="#1F5EFF" barMinWidth={52} />
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ack-heading)' }}>
          Overall Attendance — All Years
        </h2>
        <TrendBarChart data={yearly} color={GOLD} barMinWidth={64} />
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-1.5" style={{ color: 'var(--ack-heading)' }}>
            <AlertTriangle size={14} color={DANGER} /> Needs Attention
          </h2>
          <p className="text-[10px] text-[var(--ack-muted)] mb-3">Not seen at practice in 2+ weeks</p>
          {needsAttention.length === 0 ? (
            <p className="text-xs text-[var(--ack-muted)]">Nobody's on a long absence streak right now.</p>
          ) : (
            <div className="space-y-2.5">
              {needsAttention.map((r) => (
                <button key={r.student.id} onClick={() => openStudent(r.student.id)} className="w-full flex items-center gap-2.5 text-left">
                  <Avatar name={displayName(r.student)} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--ack-heading)' }}>
                      {displayName(r.student)}
                    </p>
                    <p className="text-[10px] text-[var(--ack-muted)] truncate">
                      {r.status.lastAttended ? `Last seen ${r.status.lastAttended}` : 'Never attended'}
                    </p>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: DANGER }}>
                    {Math.floor(r.status.days / 7)}w {r.status.days % 7}d
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-1.5" style={{ color: 'var(--ack-heading)' }}>
            <Trophy size={14} color={GOLD} /> Top Players
          </h2>
          <p className="text-[10px] text-[var(--ack-muted)] mb-2">Ranked by real results — medals, attendance, or participation</p>
          <div className="flex gap-1 mb-3">
            {[
              ['medals', 'Medals'],
              ['attendance', 'Attendance'],
              ['participation', 'Participation'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPlayerMetric(id)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={
                  playerMetric === id
                    ? { background: ROYAL, color: '#fff' }
                    : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
          {topPlayers.length === 0 ? (
            <p className="text-xs text-[var(--ack-muted)]">Not enough data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topPlayers.map((r, i) => (
                <button key={r.student.id} onClick={() => openStudent(r.student.id)} className="w-full flex items-center gap-2.5 text-left">
                  <span className="w-5 text-xs font-extrabold shrink-0" style={{ color: i < 3 ? GOLD : 'var(--ack-muted)' }}>
                    #{i + 1}
                  </span>
                  <Avatar name={displayName(r.student)} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--ack-heading)' }}>
                      {displayName(r.student)}
                    </p>
                    <p className="text-[10px] text-[var(--ack-muted)] truncate">
                      {playerMetric === 'medals' &&
                        `${r.medals.Gold}G · ${r.medals.Silver}S · ${r.medals.Bronze}B · ${r.att.rate}% attendance`}
                      {playerMetric === 'attendance' && `${r.att.rate}% · ${r.att.total} marks in range`}
                      {playerMetric === 'participation' &&
                        `${r.entries} events entered · ${r.medalsTotal} medal${r.medalsTotal === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <BeltBadge belt={r.student.belt} small />
                  <span className="text-xs font-bold shrink-0" style={{ color: playerMetric === 'medals' ? GOLD : SUCCESS }}>
                    {playerMetric === 'medals' ? r.medalsTotal : playerMetric === 'attendance' ? `${r.att.rate}%` : r.entries}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Notifications are derived client-side (latest achievements + the most
// recent session's absentees) — there's no table for them, so "unread" is
// tracked with a last-seen timestamp: anything dated after that counts as
// unread on the bell badge, and visiting the screen marks everything seen.
