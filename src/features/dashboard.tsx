import React from 'react';
import { Users, Trophy, Check, Award, UserPlus, TrendingUp, TrendingDown, Activity, ArrowRight } from '../icons';
import { TrendCompositionChart } from '../components/charts';
import { Card, StatCard } from '../components/ui';
import { NAVY, ROYAL, GOLD, SUCCESS, DANGER, WARNING } from '../lib/theme';
import { todayISO } from '../lib/dates';
import { statsFor, clubTrendSeries, clubTrendInsights, sessionsForToday, dayBreakdown } from '../lib/attendance';

export function AttendanceTrend({ attendance, sessions, students, goToAnalytics }) {
  const [granularity, setGranularity] = React.useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const series = React.useMemo(() => clubTrendSeries(attendance, granularity), [attendance, granularity]);
  const insights = React.useMemo(() => clubTrendInsights(attendance, sessions, students, series), [attendance, sessions, students, series]);

  const withData = series.filter((p) => p.total > 0);
  const totalRecords = series.reduce((s, p) => s + p.total, 0);
  const avgRate = totalRecords ? Math.round((series.reduce((s, p) => s + p.rate * p.total, 0) / totalRecords) * 10) / 10 : 0;

  // Same "later half vs earlier half" delta the insights use, surfaced as a chip.
  let delta = null;
  if (withData.length >= 2) {
    const half = Math.ceil(withData.length / 2);
    const earlier = withData.slice(0, half).reduce((s, p) => s + p.rate, 0) / half;
    const later = withData.slice(half).reduce((s, p) => s + p.rate, 0) / (withData.length - half);
    delta = Math.round((later - earlier) * 10) / 10;
  }
  const best = withData.length ? withData.reduce((a, b) => (b.rate > a.rate ? b : a)) : null;
  const worst = withData.length ? withData.reduce((a, b) => (b.rate < a.rate ? b : a)) : null;

  const statCellCls = 'rounded-xl p-3 min-w-0';
  const statLabelCls = 'text-[10px] text-[var(--ack-muted)] mt-0.5';

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
          Attendance Trends
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--ack-surface-2)' }}>
            {(['weekly', 'monthly', 'yearly'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition"
                style={granularity === g ? { background: ROYAL, color: '#fff' } : { color: '#6B7280' }}
              >
                {g}
              </button>
            ))}
          </div>
          {goToAnalytics && (
            <button onClick={goToAnalytics} className="text-xs font-semibold flex items-center gap-1 shrink-0" style={{ color: ROYAL }}>
              Full analytics <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className={statCellCls} style={{ background: 'var(--ack-surface-2)' }}>
          <p className="text-lg font-extrabold" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
            {avgRate}%
          </p>
          <p className={statLabelCls}>Average rate</p>
        </div>
        <div className={statCellCls} style={{ background: 'var(--ack-surface-2)' }}>
          <div className="flex items-center gap-1">
            {delta !== null && delta > 0.4 && <TrendingUp size={15} color={SUCCESS} />}
            {delta !== null && delta < -0.4 && <TrendingDown size={15} color={DANGER} />}
            {delta !== null && delta >= -0.4 && delta <= 0.4 && <Activity size={15} color="#6B7280" />}
            <p
              className="text-lg font-extrabold"
              style={{
                color: delta !== null && delta > 0.4 ? SUCCESS : delta !== null && delta < -0.4 ? DANGER : 'var(--ack-heading)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {delta === null ? '—' : delta > 0 ? `+${delta}` : delta}
            </p>
          </div>
          <p className={statLabelCls}>Trend vs earlier</p>
        </div>
        <div className={statCellCls} style={{ background: 'var(--ack-surface-2)' }}>
          <p className="text-sm font-extrabold truncate" style={{ color: SUCCESS }}>
            {best ? best.label : '—'}
          </p>
          <p className={statLabelCls}>{best ? `Best period · ${best.rate}%` : 'Best period'}</p>
        </div>
        <div className={statCellCls} style={{ background: 'var(--ack-surface-2)' }}>
          <p className="text-sm font-extrabold truncate" style={{ color: DANGER }}>
            {worst ? worst.label : '—'}
          </p>
          <p className={statLabelCls}>{worst ? `Weakest period · ${worst.rate}%` : 'Weakest period'}</p>
        </div>
      </div>

      <TrendCompositionChart data={series} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-[var(--ack-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SUCCESS }} />
          Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: WARNING }} />
          Late
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: DANGER }} />
          Absent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full" style={{ background: ROYAL }} />
          Rate (late = ½)
        </span>
        <span className="ml-auto font-semibold" style={{ color: 'var(--ack-heading)' }}>
          {totalRecords} marks
        </span>
      </div>

      {insights.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--ack-border)] space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ins.tint}1A` }}>
                <ins.icon size={12} color={ins.tint} />
              </span>
              <p className="text-xs leading-snug" style={{ color: 'var(--ack-text)' }}>
                {ins.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function greetingFor() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function Dashboard({ profile, students, attendance, achievements, sessions, goToTab, push }) {
  // Current-member stats only — former members (left_at set) drop out of the
  // average attendance and absence alerts, but their history still counts in
  // the dated trend charts (AttendanceTrend filters on dates, not students).
  const activeStudents = students.filter((s) => !s.left_at);
  const todayRecs = attendance.filter((a) => a.date === todayISO());
  const presentToday = todayRecs.filter((r) => r.status === 'present').length;
  const avgAttendance = activeStudents.length
    ? Math.round(activeStudents.reduce((s, st) => s + statsFor(st.id, attendance).presentPct, 0) / activeStudents.length)
    : 0;
  const todaysSessions = sessionsForToday(sessions);

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <p className="text-xs text-[var(--ack-muted)] mb-0.5">{greetingFor()},</p>
      <h1 className="text-xl font-extrabold mb-4 ack-grad-text" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {profile.name || 'Coach'}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Users} label="Total Students" value={activeStudents.length} tint={ROYAL} />
        <StatCard icon={Check} label="Present Today" value={presentToday} tint={SUCCESS} />
        <StatCard icon={TrendingUp} label="Avg. Attendance (late = half)" value={`${avgAttendance}%`} tint={ROYAL} />
        <StatCard icon={Trophy} label="Achievements" value={achievements.length} tint={GOLD} />
      </div>

      <AttendanceTrend attendance={attendance} sessions={sessions} students={activeStudents} goToAnalytics={() => goToTab('analytics')} />

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
            Today's Sessions
          </p>
          <button onClick={() => push('manageSessions')} className="text-xs font-semibold" style={{ color: ROYAL }}>
            Manage
          </button>
        </div>
        <div className="space-y-2">
          {todaysSessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                  {s.name}
                </p>
                <p className="text-xs text-[var(--ack-muted)]">{s.time}</p>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={
                  s.computedStatus === 'Completed'
                    ? { background: `${SUCCESS}1A`, color: SUCCESS }
                    : { background: `${WARNING}1A`, color: WARNING }
                }
              >
                {s.computedStatus}
              </span>
            </div>
          ))}
          {todaysSessions.length === 0 && <p className="text-xs text-[var(--ack-muted)]">No practice scheduled for today.</p>}
        </div>
      </Card>

      <p className="font-bold text-sm mb-2" style={{ color: 'var(--ack-heading)' }}>
        Quick Actions
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Student', icon: UserPlus, tint: ROYAL, action: () => goToTab('students', { addStudent: true }) },
          { label: 'Mark Attendance', icon: Check, tint: SUCCESS, action: () => goToTab('attendance') },
          { label: 'New Tournament', icon: Trophy, tint: GOLD, action: () => goToTab('achievements', { newTournament: true }) },
          { label: 'Top Players', icon: Award, tint: NAVY, action: () => goToTab('analytics') },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className="rounded-2xl p-4 flex flex-col items-start gap-3 text-left shadow-sm active:scale-[0.98] transition"
            style={{ background: `${a.tint}0F` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: a.tint }}>
              <a.icon size={17} color="#fff" />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--ack-heading)' }}>
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DaySummaryBar({ attendance, date, sessionId, totalStudents }) {
  const b = dayBreakdown(attendance, date, sessionId);
  return (
    <Card className="p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold" style={{ color: 'var(--ack-heading)' }}>
          Day Summary
        </p>
        <span className="text-lg font-extrabold" style={{ color: ROYAL, fontFamily: 'Poppins, sans-serif' }}>
          {b.rate}%
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-sm font-bold" style={{ color: SUCCESS }}>
            {b.present}
          </p>
          <p className="text-[10px] text-[var(--ack-muted)]">Present</p>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: DANGER }}>
            {b.absent}
          </p>
          <p className="text-[10px] text-[var(--ack-muted)]">Absent</p>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: WARNING }}>
            {b.late}
          </p>
          <p className="text-[10px] text-[var(--ack-muted)]">Late</p>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--ack-heading)' }}>
            {totalStudents - b.total}
          </p>
          <p className="text-[10px] text-[var(--ack-muted)]">Not marked</p>
        </div>
      </div>
    </Card>
  );
}
