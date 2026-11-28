import { Home, Users, Calendar, Trophy, User, Bell, ArrowLeft, PieChartIcon } from '../icons';
import { Avatar } from './/ui';

export function GlassHeader({ title, subtitle = undefined, avatarName, avatarPhoto, onAvatarClick, onBellClick, unread, onBack }) {
  return (
    <div
      className="sticky top-0 z-30 ack-glass-blur bg-[var(--ack-card)]/80 border-b border-[var(--ack-glass-border)] px-4 sm:px-5 py-3 flex items-center gap-3 safe-top"
      style={{ boxShadow: '0 1px 0 var(--ack-glass-border)' }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[var(--ack-surface-2)] flex items-center justify-center shrink-0 active:scale-90 no-press transition-transform"
        >
          <ArrowLeft size={17} color="var(--ack-heading)" />
        </button>
      ) : (
        <img src="/logos/crest.png" alt="Ananda College crest" className="w-6 h-6 object-contain shrink-0" draggable={false} />
      )}
      <div className="flex-1 min-w-0">
        {/* Plain heading in light mode; gradient only in dark mode via .ack-grad-text */}
        <p className="text-[17px] font-bold leading-tight truncate ack-grad-text" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-[var(--ack-muted)]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onBellClick && (
          <button
            onClick={onBellClick}
            className="relative w-9 h-9 rounded-full bg-[var(--ack-surface-2)] flex items-center justify-center active:scale-90 no-press transition-transform"
          >
            <Bell size={16} color="var(--ack-heading)" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: '#FF3B30' }} />
            )}
          </button>
        )}
        {onAvatarClick && (
          <button onClick={onAvatarClick} className="active:scale-90 no-press transition-transform">
            <Avatar name={avatarName} photo={avatarPhoto} size={36} />
          </button>
        )}
      </div>
    </div>
  );
}

export const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Home',         icon: Home },
  { id: 'students',     label: 'Students',     icon: Users },
  { id: 'attendance',   label: 'Attendance',   icon: Calendar },
  { id: 'achievements', label: 'Awards',       icon: Trophy },
  { id: 'analytics',    label: 'Analytics',    icon: PieChartIcon },
  { id: 'profile',      label: 'Profile',      icon: User },
];

export function BottomNav({ tab, setTab }) {
  return (
    <div
      className="fixed bottom-2 left-2 right-2 sm:sticky sm:top-0 sm:h-screen sm:w-[72px] sm:left-0 sm:right-auto sm:bottom-auto z-40 ack-glass-blur bg-[var(--ack-card)]/90 border border-[var(--ack-glass-border)] sm:border-r sm:border-t-0 sm:border-b-0 sm:border-l-0 rounded-[22px] sm:rounded-none flex sm:flex-col justify-around sm:justify-start sm:pt-6 sm:gap-1 safe-bottom"
      style={{ boxShadow: '0 2px 20px rgba(11,31,58,0.10)' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="no-press flex flex-col items-center justify-center gap-1 py-2 sm:py-3 flex-1 sm:flex-none sm:w-full transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
              style={{
                background: active ? 'rgba(31,94,255,0.12)' : 'transparent',
              }}
            >
              <Icon size={17} color={active ? '#1F5EFF' : 'var(--ack-muted)'} />
            </div>
            <span
              className="text-[9px] font-semibold tracking-wide"
              style={{ color: active ? '#1F5EFF' : 'var(--ack-muted)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
