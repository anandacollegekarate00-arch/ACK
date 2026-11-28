import { Home, Users, Calendar, Trophy, User, Bell, ArrowLeft, PieChartIcon } from '../icons';
import { Avatar } from './/ui';

export function GlassHeader({ title, subtitle = undefined, avatarName, avatarPhoto, onAvatarClick, onBellClick, unread, onBack }) {
  return (
    <div
      className="sticky top-0 z-30 backdrop-blur-2xl bg-[var(--ack-card)]/75 border-b border-[var(--ack-glass-border)] px-4 sm:px-5 py-3.5 flex items-center gap-3 safe-top"
      style={{ boxShadow: '0 8px 32px rgba(11,31,58,0.07)' }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[var(--ack-card)] shadow flex items-center justify-center shrink-0 active:scale-90 transition"
        >
          <ArrowLeft size={17} color="var(--ack-heading)" />
        </button>
      ) : (
        <img src="/logos/crest.png" alt="Ananda College crest" className="w-6 h-6 object-contain shrink-0" draggable={false} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-extrabold leading-tight truncate ack-grad-text" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-[var(--ack-muted)]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {onBellClick && (
          <button
            onClick={onBellClick}
            className="relative w-9 h-9 rounded-full bg-[var(--ack-card)] shadow flex items-center justify-center active:scale-90 transition"
          >
            <Bell size={16} color="var(--ack-heading)" />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: '#FF3B30' }} />}
          </button>
        )}
        {onAvatarClick && (
          <button onClick={onAvatarClick} className="active:scale-90 transition">
            <Avatar name={avatarName} photo={avatarPhoto} size={38} />
          </button>
        )}
      </div>
    </div>
  );
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ tab, setTab }) {
  return (
    <div
      className="fixed bottom-3 left-3 right-3 sm:sticky sm:top-0 sm:h-screen sm:w-20 sm:left-0 sm:right-auto sm:bottom-auto z-40 bg-[var(--ack-card)] backdrop-blur-2xl border border-[var(--ack-glass-border)] sm:border-r sm:border-t-0 sm:border-b-0 rounded-[26px] sm:rounded-none flex sm:flex-col justify-around sm:justify-start sm:pt-8 sm:gap-6 shadow-[0_16px_48px_rgba(11,31,58,0.16)] sm:shadow-none safe-bottom"
      style={{ animation: 'navSlideUp .5s cubic-bezier(.22,1,.36,1) both' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 sm:py-0 flex-1 sm:flex-none"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition"
              style={{
                background: active ? '#1F5EFF' : 'transparent',
                boxShadow: active ? '0 6px 18px rgba(31,94,255,.35)' : 'none',
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <Icon size={18} color={active ? '#fff' : '#9CA3AF'} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: active ? '#1F5EFF' : '#9CA3AF' }}>
              {item.label}
            </span>
          </button>
        );
      })}
      <style>{`@keyframes navSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
