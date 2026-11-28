import React from 'react';
import { ArrowLeft } from '../icons';
import { NAVY, ROYAL, beltStyle, LEVEL_STYLE } from '../lib/theme';
import { initials } from '../lib/identity';
import { generateQrMatrix } from '../lib/qr';

export function Avatar({ name, size = 44, photo = undefined }) {
  if (photo) {
    return <img src={photo} alt={name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${ROYAL}, ${NAVY})`, color: '#fff', fontSize: size * 0.36 }}
    >
      {initials(name) || '?'}
    </div>
  );
}

export function BeltBadge({ belt, small = false }) {
  const s = beltStyle(belt);
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: s.bg, color: s.fg, borderColor: s.border }}
    >
      {belt}
    </span>
  );
}

export function LevelBadge({ level }) {
  const c = LEVEL_STYLE[level]?.color || '#9CA3AF';
  return (
    <span className="inline-flex items-center rounded-full text-[10px] font-bold px-2 py-0.5 text-white" style={{ background: c }}>
      {level}
    </span>
  );
}

export function Card({ children, className = '', style = undefined }) {
  return (
    <div
      className={`bg-[var(--ack-card)] border border-[var(--ack-glass-border)] rounded-[22px] shadow-[0_8px_32px_rgba(11,31,58,0.08)] ack-lift ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${tint}1A` }}>
        <Icon size={18} color={tint} />
      </div>
      <div>
        <p className="text-xl font-extrabold" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
          {value}
        </p>
        <p className="text-[11px] leading-snug min-h-[28px] text-[var(--ack-muted)]">{label}</p>
      </div>
    </Card>
  );
}

export function PrimaryButton({
  children,
  onClick,
  style = undefined,
  className = '',
  type = 'button' as 'button' | 'submit' | 'reset',
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm active:scale-[0.98] transition disabled:opacity-40 ${className}`}
      style={{ background: ROYAL, ...style }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-[var(--ack-muted)] mb-1">{label}</label>
      {children}
    </div>
  );
}
export const inputCls =
  'w-full min-w-0 border border-[var(--ack-border)] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-[var(--ack-card)] text-[var(--ack-heading)]';

export function Modal({ title, onClose, children, wide = false, required = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-[var(--ack-card)] w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} rounded-t-[24px] sm:rounded-[24px] max-h-[92vh] overflow-y-auto shadow-2xl`}
      >
        <div className="sticky top-0 bg-[var(--ack-card)]/95 backdrop-blur flex items-center gap-2 px-3 py-3 border-b border-[var(--ack-border)] rounded-t-[24px]">
          {required ? (
            <h3
              className="font-bold text-[15px] flex-1 truncate text-center pr-8"
              style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}
            >
              {title}
            </h3>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex items-center gap-1 pl-1.5 pr-2.5 py-1.5 rounded-full active:scale-90 transition shrink-0"
              >
                <ArrowLeft size={17} color={ROYAL} />
                <span className="text-sm font-semibold" style={{ color: ROYAL }}>
                  Back
                </span>
              </button>
              <h3
                className="font-bold text-[15px] flex-1 truncate text-center pr-8"
                style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}
              >
                {title}
              </h3>
            </>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xl"
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
    >
      <Card className="w-full max-w-sm p-5">
        <h3 className="font-bold text-[15px] mb-1" style={{ color: 'var(--ack-heading)' }}>
          {title}
        </h3>
        <p className="text-sm text-[var(--ack-muted)] mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[var(--ack-border)] text-[var(--ack-text)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#FF3B30' }}
          >
            {confirmLabel}
          </button>
        </div>
      </Card>
    </div>
  );
}

export function ProgressRing({ percent, size = 64, stroke = 6, color = ROYAL, track = 'var(--ack-border)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold" style={{ fontSize: size * 0.24, color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}

export function QRCode({ value, size = 160 }) {
  const matrix = React.useMemo(() => generateQrMatrix(value), [value]);
  const modules = matrix.length;
  const quiet = 2;
  const total = modules + quiet * 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${total} ${total}`} style={{ background: '#fff', borderRadius: 8 }}>
      {matrix.map((row, r) =>
        row.map((v, c) => (v ? <rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width={1.02} height={1.02} fill={NAVY} /> : null))
      )}
    </svg>
  );
}
