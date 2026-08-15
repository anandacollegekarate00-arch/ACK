import React from 'react';
import { Trophy, Bell } from '../icons';
import { Card } from '../components/ui';
import { GOLD, DANGER } from '../lib/theme';
import { displayName } from '../lib/identity';

export function computeNotifications(students, attendance, achievements) {
  const items = [];
  // Former members (left_at) don't get absence nudges — they've left the
  // club, so a stale absent mark from their last days shouldn't nag the coach.
  const activeIds = new Set(students.filter((s) => !s.left_at).map((s) => s.id));
  function studentName(id) {
    return displayName(students.find((s) => s.id === id)) || 'A student';
  }
  [...achievements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
    .forEach((a) => {
      items.push({
        id: `ach-${a.id}`,
        type: 'Achievement',
        icon: Trophy,
        tint: GOLD,
        text: `${studentName(a.student_id)} logged ${a.title}${a.placement ? ' — ' + a.placement : ''}`,
        date: a.date,
      });
    });
  const recentDate = attendance.length ? [...attendance].sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
  if (recentDate) {
    attendance
      .filter((a) => a.date === recentDate && a.status === 'absent' && activeIds.has(a.student_id))
      .forEach((a) => {
        items.push({
          id: `abs-${a.id}`,
          type: 'Attendance',
          icon: Bell,
          tint: DANGER,
          text: `${studentName(a.student_id)} was absent on ${a.date}`,
          date: a.date,
        });
      });
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}

export function NotificationsView({ students, attendance, achievements }) {
  const [filter, setFilter] = React.useState('All');

  React.useEffect(() => {
    // Visiting the screen marks everything as seen (including items that
    // arrive while it's open — the next render picks them up as read).
    localStorage.setItem('ack-notifications-seen', String(Date.now()));
  }, []);

  const items = computeNotifications(students, attendance, achievements);
  const filtered = filter === 'All' ? items : items.filter((i) => i.type === filter);

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <h1 className="text-xl font-extrabold mb-4" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
        Notifications
      </h1>
      <div className="flex gap-2 mb-4">
        {['All', 'Achievement', 'Attendance'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={
              filter === f
                ? { background: 'var(--ack-heading)', color: '#fff' }
                : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
            }
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((n) => (
          <Card key={n.id} className="p-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${n.tint}1A` }}>
              <n.icon size={16} color={n.tint} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--ack-text)]">{n.text}</p>
              <p className="text-[11px] text-[var(--ack-muted)] mt-0.5">{n.date}</p>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--ack-muted)] py-10 text-center">
            Nothing here yet — notifications appear as attendance and achievements are logged.
          </p>
        )}
      </div>
    </div>
  );
}
