import React from 'react';
import { Search, Check, X, Clock, ArrowLeft, Download, Trash2, ChevronLeft, ChevronRight, Camera, QrCode, AlertTriangle, Zap, List } from '../icons';
import { Avatar, BeltBadge, Card, PrimaryButton, Field, inputCls, Modal, ConfirmDialog, ProgressRing } from '../components/ui';
import { QRScannerModal } from '../components/QRScannerModal';
import { ROYAL, SUCCESS, DANGER, WARNING } from '../lib/theme';
import { ymd, todayISO, ackDateParts, ACK_TZ } from '../lib/dates';
import { displayName } from '../lib/identity';
import { WEEKDAY_LABELS, sessionsForDate, dayBreakdown } from '../lib/attendance';
import { downloadCSV } from '../lib/csv';

// The attendance record for one student on one date (+ optional session) —
// module-level so the views' memos stay dependency-clean.
function findRec(attendance, date, sessionId, studentId) {
  return attendance.find((a) => a.student_id === studentId && a.date === date && (a.session_id || null) === (sessionId || null));
}

// ─────────────────────────────────────────────────────────────────────────────
// AutoScanScreen
// Full-screen continuous QR scanner that marks students Present immediately.
// No confirmation step. Shows instant feedback for 1.5 s then resumes.
// Duplicate protection: checks the in-memory attendance array before writing
// (fast), and the DB UNIQUE constraint is the final safety net.
// ─────────────────────────────────────────────────────────────────────────────
export function AutoScanScreen({ students, attendance, sessions, date, sessionId, onMark, onClose, currentUser }) {
  // Last scan result shown as the feedback banner
  const [lastScan, setLastScan] = React.useState<{
    name: string;
    status: 'marked' | 'duplicate' | 'unknown' | 'error';
    msg: string;
  } | null>(null);

  // Present | Late toggle — user picks which status to auto-mark
  const [markMode, setMarkMode] = React.useState<'present' | 'late'>('present');
  const markModeRef = React.useRef<'present' | 'late'>('present');
  // useLayoutEffect keeps the ref in sync after every render, before any paint
  React.useLayoutEffect(() => { markModeRef.current = markMode; });

  // Per-session present count — recomputed live from the attendance prop
  const presentCount = React.useMemo(
    () => attendance.filter(
      a => a.date === date &&
           (a.session_id || null) === (sessionId || null) &&
           (a.status === 'present' || a.status === 'late')
    ).length,
    [attendance, date, sessionId]
  );

  const sessionLabel = React.useMemo(() => {
    if (!sessionId) return 'General';
    const s = sessions.find(s => s.id === sessionId);
    return s ? s.name : 'Session';
  }, [sessions, sessionId]);

  // Ref so the rAF scan callback always reads the freshest attendance without
  // causing the QRScannerModal to remount (its effect only re-runs on prop changes).
  const attendanceRef = React.useRef(attendance);
  React.useEffect(() => { attendanceRef.current = attendance; }, [attendance]);

  // Keep a stable ref to handleScanned so QRScannerModal's onDetectedRef
  // always has the latest closure without the camera effect ever re-running.
  const handleScannedRef = React.useRef<(text: string) => Promise<void>>(async () => {});

  // Vibration helper (silent on unsupported devices)
  function vibrate(pattern: number[]) {
    try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
  }

  // Update the ref every render so it always closes over current props/state
  handleScannedRef.current = async (text: string) => {
    const activeStudents = students.filter(s => !s.left_at);
    const student = activeStudents.find(
      s => s.admission_id?.toLowerCase() === text.trim().toLowerCase()
    );

    if (!student) {
      try { navigator.vibrate?.([80, 60, 80]); } catch { /* ignore */ }
      setLastScan({ name: text, status: 'unknown', msg: 'Student not found' });
      return;
    }

    // Check for duplicate using the latest attendance snapshot
    const existing = attendanceRef.current.find(
      a => a.student_id === student.id &&
           a.date === date &&
           (a.session_id || null) === (sessionId || null)
    );

    if (existing) {
      const statusLabel = existing.status === 'present' ? 'Present' : existing.status === 'late' ? 'Late' : 'Absent';
      try { navigator.vibrate?.([40]); } catch { /* ignore */ }
      setLastScan({
        name: displayName(student),
        status: 'duplicate',
        msg: `Already marked ${statusLabel}`,
      });
      return;
    }

    try {
      const statusToMark = markModeRef.current;
      await onMark({
        student_id: student.id,
        date,
        session_id: sessionId || null,
        status: statusToMark,
        marked_by: currentUser?.id ?? null,
        notes: null,
      });
      try { navigator.vibrate?.([60]); } catch { /* ignore */ }
      setLastScan({
        name: displayName(student),
        status: 'marked',
        msg: statusToMark === 'late' ? 'Marked Late' : 'Attendance Marked Successfully',
      });
    } catch {
      try { navigator.vibrate?.([80, 60, 80, 60, 80]); } catch { /* ignore */ }
      setLastScan({
        name: displayName(student),
        status: 'error',
        msg: 'Network error — try again',
      });
    }
  };

  // Stable wrapper passed to QRScannerModal — never changes identity
  const handleScanned = React.useCallback((text: string) => {
    return handleScannedRef.current(text);
  }, []);

  const clearLastScan = React.useCallback(() => setLastScan(null), []);

  // Feedback colours
  const feedbackStyle: Record<string, { bg: string; text: string; border: string }> = {
    marked:    { bg: 'rgba(52,199,89,0.15)',  text: '#34C759', border: 'rgba(52,199,89,0.35)' },
    duplicate: { bg: 'rgba(255,204,0,0.15)',  text: '#FFD60A', border: 'rgba(255,204,0,0.35)' },
    unknown:   { bg: 'rgba(255,59,48,0.15)',  text: '#FF3B30', border: 'rgba(255,59,48,0.35)' },
    error:     { bg: 'rgba(255,59,48,0.15)',  text: '#FF3B30', border: 'rgba(255,59,48,0.35)' },
  };

  return (
    <>
      {/* Continuous QR scanner — fixed inset-0 z-50 */}
      <QRScannerModal
        onDetected={handleScanned}
        onClose={onClose}
        continuous
        cooldownMs={1800}
        title={`Auto Mark · ${sessionLabel} · ${date}`}
      />

      {/* HUD — z-[60] renders above the scanner's z-50 */}
      <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-2 p-4 pointer-events-none">

        {/* Mode toggle + present counter — same row */}
        <div className="flex items-center justify-between gap-2">

          {/* Present / Late toggle */}
          <div
            className="flex rounded-full p-0.5 pointer-events-auto"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <button
              onClick={() => setMarkMode('present')}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition"
              style={markMode === 'present'
                ? { background: SUCCESS, color: '#fff' }
                : { color: 'rgba(255,255,255,0.5)' }}
            >
              Present
            </button>
            <button
              onClick={() => setMarkMode('late')}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition"
              style={markMode === 'late'
                ? { background: WARNING, color: '#fff' }
                : { color: 'rgba(255,255,255,0.5)' }}
            >
              Late
            </button>
          </div>

          {/* Marked counter pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <Check size={14} color={SUCCESS} />
            <span style={{ color: SUCCESS }}>{presentCount}</span>
            <span className="text-white/60">marked</span>
          </div>
        </div>

        {/* Scan feedback banner */}
        {lastScan && (
          <FeedbackBanner
            name={lastScan.name}
            msg={lastScan.msg}
            style={feedbackStyle[lastScan.status]}
            onExpire={clearLastScan}
          />
        )}
      </div>
    </>
  );
}

// Feedback banner that auto-dismisses after 1.5 s
function FeedbackBanner({
  name, msg, style, onExpire,
}: {
  name: string;
  msg: string;
  style: { bg: string; text: string; border: string };
  onExpire: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onExpire, 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, msg]);

  return (
    <div
      className="rounded-2xl px-4 py-3 pointer-events-auto"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <p className="font-bold text-base" style={{ color: style.text, fontFamily: 'Poppins, sans-serif' }}>
        {name}
      </p>
      <p className="text-sm text-white/80">{msg}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CompactSummary — inline attendance stats strip with progress ring
// Replaces the old DaySummaryBar; much shorter vertical footprint
// ─────────────────────────────────────────────────────────────────────────────
function CompactSummary({ attendance, date, sessionId, totalStudents }) {
  const b = dayBreakdown(attendance, date, sessionId);
  const notMarked = totalStudents - b.total;
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-3"
      style={{ background: 'var(--ack-card)', border: '1px solid var(--ack-glass-border)' }}
    >
      <ProgressRing percent={b.rate} size={52} stroke={5} color={ROYAL} />
      <div className="flex flex-1 justify-between min-w-0">
        {[
          { label: 'Present', value: b.present, color: SUCCESS },
          { label: 'Absent',  value: b.absent,  color: DANGER },
          { label: 'Late',    value: b.late,     color: WARNING },
          { label: 'Unmarked', value: notMarked, color: 'var(--ack-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-extrabold" style={{ color, fontFamily: 'Poppins, sans-serif' }}>{value}</span>
            <span className="text-[9px] font-medium text-[var(--ack-muted)] leading-none">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Status badge pill used on student row cards
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    present: { label: 'Present', bg: `${SUCCESS}1A`, color: SUCCESS },
    absent:  { label: 'Absent',  bg: `${DANGER}1A`,  color: DANGER },
    late:    { label: 'Late',    bg: `${WARNING}1A`,  color: WARNING },
  };
  const s = map[status] ?? { label: status, bg: 'var(--ack-surface-2)', color: 'var(--ack-muted)' };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function AttendanceView({ students, attendance, sessions, onMark, onRemoveMark, onMarkAllAbsent, currentUser, readOnly = false }) {
  const [date, setDate] = React.useState(todayISO());
  const dateSessions = React.useMemo(() => sessionsForDate(sessions, date), [sessions, date]);
  const [sessionId, setSessionId] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [notes, setNotes] = React.useState('');
  const [pendingStatus, setPendingStatus] = React.useState(null);
  const [showCodeEntry, setShowCodeEntry] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [showAutoScan, setShowAutoScan] = React.useState(false);
  const [codeInput, setCodeInput] = React.useState('');
  const [codeError, setCodeError] = React.useState('');
  const [scanError, setScanError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [confirmBulkAbsent, setConfirmBulkAbsent] = React.useState(false);
  const [bulkBusy, setBulkBusy] = React.useState(false);

  React.useEffect(() => {
    setSessionId(dateSessions.length === 1 ? dateSessions[0].id : null);
  }, [dateSessions, date, sessions]);

  const activeStudents = React.useMemo(() => students.filter((s) => !s.left_at), [students]);
  const filtered = activeStudents.filter(
    (s) => displayName(s).toLowerCase().includes(query.toLowerCase()) || s.admission_id.toLowerCase().includes(query.toLowerCase())
  );
  const existingRec = selected ? findRec(attendance, date, sessionId, selected.id) : null;
  const sessionLabel = sessionId ? dateSessions.find((s) => s.id === sessionId)?.name || 'Session' : 'General';
  const isToday = date === todayISO();
  const unmarked = React.useMemo(
    () => activeStudents.filter((s) => !findRec(attendance, date, sessionId, s.id)),
    [activeStudents, attendance, date, sessionId]
  );

  async function confirm() {
    if (!selected || !pendingStatus) return;
    setBusy(true);
    try {
      await onMark({ student_id: selected.id, date, session_id: sessionId || null, status: pendingStatus, marked_by: currentUser.id, notes: notes || null });
      setSelected(null); setPendingStatus(null); setNotes('');
    } finally { setBusy(false); }
  }

  async function removeMark() {
    if (!selected || !existingRec) return;
    setBusy(true);
    try {
      await onRemoveMark(existingRec.id);
      setConfirmRemove(false); setSelected(null); setPendingStatus(null); setNotes('');
    } finally { setBusy(false); }
  }

  async function confirmMarkAllAbsent() {
    setBulkBusy(true);
    try {
      await onMarkAllAbsent({ date, session_id: sessionId || null, studentIds: unmarked.map((s) => s.id), marked_by: currentUser.id });
      setConfirmBulkAbsent(false);
    } finally { setBulkBusy(false); }
  }

  function lookupByAdmissionId(code) {
    return activeStudents.find((s) => s.admission_id.toLowerCase() === code.trim().toLowerCase()) || null;
  }

  function submitCode() {
    const match = lookupByAdmissionId(codeInput);
    if (!match) { setCodeError('No student found with that admission ID.'); return; }
    setSelected(match); setShowCodeEntry(false); setCodeInput(''); setCodeError('');
  }

  function handleScanned(text) {
    const match = lookupByAdmissionId(text);
    setShowScanner(false);
    if (!match) { setScanError(`No student found for "${text}".`); return; }
    setScanError(''); setSelected(match);
  }

  function shiftDate(deltaDays: number) {
    // Parse date as Colombo midnight, shift by delta, re-format in Colombo TZ
    const [y, m, d] = date.split('-').map(Number);
    const colomboMidnight = new Date(Date.UTC(y, m - 1, d));
    colomboMidnight.setUTCDate(colomboMidnight.getUTCDate() + deltaDays);
    const p = ackDateParts(colomboMidnight);
    setDate(`${p.y}-${p.m}-${p.day}`);
  }

  // ── Format date for display — in Colombo TZ so it matches todayISO() ──
  const displayDate = React.useMemo(() => {
    const [y, m, d] = date.split('-').map(Number);
    const utcDate = new Date(Date.UTC(y, m - 1, d));
    return utcDate.toLocaleDateString('en-GB', {
      timeZone: ACK_TZ,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [date]);

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-5 pt-4 pb-28 sm:pb-8">

      {/* ── Auto Scan full-screen overlay ── */}
      {showAutoScan && (
        <AutoScanScreen
          students={students} attendance={attendance} sessions={sessions}
          date={date} sessionId={sessionId} onMark={onMark}
          onClose={() => setShowAutoScan(false)} currentUser={currentUser}
        />
      )}

      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
          Attendance
        </h1>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={() => setShowAutoScan(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold text-white"
              style={{ background: SUCCESS }}
            >
              <Zap size={12} /> Auto Scan
            </button>
          )}
          <button
            onClick={() => downloadCSV(
              `ack-attendance-${date}.csv`,
              ['Date', 'Session', 'Admission ID', 'Student', 'Status', 'Notes', 'Marked By'],
              [...attendance]
                .sort((a, b) => (b.date + (b.session_id || '')).localeCompare(a.date + (a.session_id || '')))
                .map((a) => {
                  const st = students.find((s) => s.id === a.student_id);
                  const sn = sessions.find((s) => s.id === a.session_id)?.name || '';
                  return [a.date, sn, st?.admission_id ?? '', st ? displayName(st) : '', a.status, a.notes, a.marked_by];
                })
            )}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-semibold"
            style={{ background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }}
          >
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* ── Date navigator ── */}
      <div
        className="flex items-center gap-2 mb-3 p-1 rounded-2xl"
        style={{ background: 'var(--ack-card)', border: '1px solid var(--ack-glass-border)' }}
      >
        <button
          onClick={() => shiftDate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition"
          style={{ background: 'var(--ack-surface-2)' }}
        >
          <ChevronLeft size={16} color="var(--ack-heading)" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-sm font-semibold text-center" style={{ color: 'var(--ack-heading)' }}>{displayDate}</span>
          {!isToday && (
            <button
              onClick={() => setDate(todayISO())}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${ROYAL}18`, color: ROYAL }}
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => shiftDate(1)}
          disabled={isToday}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-90 transition"
          style={{ background: 'var(--ack-surface-2)' }}
        >
          <ChevronRight size={16} color="var(--ack-heading)" />
        </button>
      </div>

      {/* ── Session tabs ── */}
      {dateSessions.length > 0 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5 -mx-1 px-1">
          {dateSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSessionId(s.id)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition"
              style={sessionId === s.id
                ? { background: ROYAL, color: '#fff' }
                : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }}
            >
              {s.name} · {s.time}
            </button>
          ))}
          <button
            onClick={() => setSessionId(null)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition"
            style={sessionId === null
              ? { background: ROYAL, color: '#fff' }
              : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }}
          >
            General
          </button>
        </div>
      )}
      {dateSessions.length === 0 && (
        <p className="text-[11px] text-[var(--ack-muted)] mb-3">
          No sessions scheduled — marking attendance generally for this date.
        </p>
      )}

      {/* ── Compact attendance summary ── */}
      <CompactSummary
        attendance={attendance} date={date}
        sessionId={sessionId} totalStudents={activeStudents.length}
      />

      {/* ── Search + manual scan row ── */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ack-muted)] pointer-events-none" />
          <input
            className={`${inputCls} pl-8 pr-3 h-9 text-sm`}
            placeholder="Name or admission ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold text-white shrink-0"
          style={{ background: ROYAL }}
        >
          <Camera size={13} /> Manual
        </button>
        <button
          onClick={() => setShowCodeEntry(true)}
          className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold shrink-0"
          style={{ background: 'var(--ack-surface-2)', color: 'var(--ack-heading)' }}
        >
          <QrCode size={13} />
        </button>
      </div>
      {scanError && (
        <p className="text-xs mb-2 px-1" style={{ color: DANGER }}>{scanError}</p>
      )}

      {/* Manual QR scanner — one-shot mode */}
      {showScanner && <QRScannerModal onDetected={handleScanned} onClose={() => setShowScanner(false)} />}

      {/* Enter code modal */}
      {showCodeEntry && (
        <Modal title="Enter Admission ID" onClose={() => { setShowCodeEntry(false); setCodeError(''); }}>
          <p className="text-xs text-[var(--ack-muted)] mb-3">
            Scan the student's QR code with any app, then paste the code here.
          </p>
          <Field label="Admission ID">
            <input
              className={inputCls}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. ACK-2026-001"
              autoCapitalize="characters"
              onKeyDown={(e) => e.key === 'Enter' && submitCode()}
            />
          </Field>
          {codeError && <p className="text-xs mb-3" style={{ color: DANGER }}>{codeError}</p>}
          <PrimaryButton onClick={submitCode} className="w-full">Find Student</PrimaryButton>
        </Modal>
      )}

      {/* ── Student list ── */}
      {!selected && (
        <div className="space-y-1.5 mt-1">
          {filtered.map((s) => {
            const rec = findRec(attendance, date, sessionId, s.id);
            return (
              <button
                key={s.id}
                onClick={() => { setSelected(s); setPendingStatus(rec?.status ?? null); setNotes(rec?.notes ?? ''); }}
                className="w-full text-left"
              >
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors active:scale-[0.99]"
                  style={{ background: 'var(--ack-card)', border: '1px solid var(--ack-glass-border)' }}
                >
                  <Avatar name={displayName(s)} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] leading-tight truncate" style={{ color: 'var(--ack-heading)' }}>
                      {displayName(s)}
                    </p>
                    <p className="text-[10px] text-[var(--ack-muted)] mt-0.5">{s.admission_id} · {s.belt?.split(' ')[0]}</p>
                  </div>
                  {rec
                    ? <StatusBadge status={rec.status} />
                    : <span className="text-[10px] font-medium text-[var(--ack-muted)] whitespace-nowrap">Not marked</span>
                  }
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--ack-muted)] py-10 text-center">No students found.</p>
          )}
          {/* ── Bulk absent — moved to bottom, visually separated ── */}
          {!readOnly && unmarked.length > 0 && (
            <div className="pt-4 border-t border-[var(--ack-border)] mt-4">
              <button
                onClick={() => setConfirmBulkAbsent(true)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
                style={{ borderColor: `${DANGER}50`, color: DANGER, background: `${DANGER}08` }}
              >
                <AlertTriangle size={13} /> Mark {unmarked.length} unmarked as absent
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Mark attendance panel ── */}
      {selected && !readOnly && (
        <div
          className="rounded-2xl mt-2"
          style={{ background: 'var(--ack-card)', border: '1px solid var(--ack-glass-border)' }}
        >
          {/* Back + student info */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[var(--ack-border)]">
            <button
              onClick={() => { setSelected(null); setPendingStatus(null); setNotes(''); }}
              className="text-[var(--ack-muted)] active:scale-90 transition shrink-0"
            >
              <ArrowLeft size={18} color={ROYAL} />
            </button>
            <Avatar name={displayName(selected)} size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--ack-heading)' }}>
                {displayName(selected)}
              </p>
              <p className="text-[10px] text-[var(--ack-muted)]">{selected.admission_id} · {sessionLabel} · {date}</p>
            </div>
            {existingRec && <StatusBadge status={existingRec.status} />}
          </div>

          <div className="p-4">
            {/* Status buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {([
                { key: 'present', label: 'Present', icon: <Check size={16} />, color: SUCCESS },
                { key: 'absent',  label: 'Absent',  icon: <X    size={16} />, color: DANGER },
                { key: 'late',    label: 'Late',     icon: <Clock size={16} />, color: WARNING },
              ] as const).map(({ key, label, icon, color }) => (
                <button
                  key={key}
                  onClick={() => setPendingStatus(key)}
                  className="py-3 rounded-xl flex flex-col items-center gap-1 font-semibold text-xs transition"
                  style={
                    pendingStatus === key
                      ? { background: color, color: '#fff' }
                      : { background: `${color}18`, color }
                  }
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Notes */}
            <Field label="Notes (optional)">
              <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            {/* Confirm */}
            <PrimaryButton onClick={confirm} disabled={!pendingStatus || busy} className="w-full mb-2">
              {busy ? 'Saving…' : 'Confirm'}
            </PrimaryButton>

            {/* Remove mark */}
            {existingRec && (
              <button
                onClick={() => setConfirmRemove(true)}
                disabled={busy}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
                style={{ borderColor: `${DANGER}50`, color: DANGER }}
              >
                <Trash2 size={13} /> Remove this mark
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      {confirmRemove && (
        <ConfirmDialog
          title="Remove attendance mark?"
          message={`This clears ${selected ? displayName(selected) : ''}'s "${existingRec?.status}" mark for ${date}. Cannot be undone.`}
          confirmLabel="Remove"
          onCancel={() => setConfirmRemove(false)}
          onConfirm={removeMark}
        />
      )}
      {confirmBulkAbsent && (
        <ConfirmDialog
          title="Mark all unmarked as absent?"
          message={`${unmarked.length} student${unmarked.length === 1 ? '' : 's'} have no record for "${sessionLabel}" on ${date}. They will all be marked Absent. Anyone already marked is untouched.`}
          confirmLabel={bulkBusy ? 'Marking…' : 'Mark Absent'}
          onCancel={() => setConfirmBulkAbsent(false)}
          onConfirm={confirmMarkAllAbsent}
        />
      )}
    </div>
  );
}



export function ManageSessionsModal({ sessions, onAdd, onDelete, onClose }) {
  const [title, setTitle] = React.useState('');
  const [time, setTime] = React.useState('06:30');
  const [days, setDays] = React.useState([]);
  const [sessionError, setSessionError] = React.useState('');
  const [sessionBusy, setSessionBusy] = React.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);

  React.useEffect(() => {
    if (confirmDeleteId && !sessions.find((s: any) => s.id === confirmDeleteId)) {
      setConfirmDeleteId(null);
    }
  }, [sessions, confirmDeleteId]);

  function toggleDay(d) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function submit() {
    if (!title || days.length === 0) return;
    setSessionBusy(true);
    setSessionError('');
    try {
      await onAdd({ name: title, time, days });
      setTitle('');
      setTime('06:30');
      setDays([]);
    } catch (e: any) {
      setSessionError(e.message || 'Could not add session. Please try again.');
    } finally {
      setSessionBusy(false);
    }
  }

  const toDelete = sessions.find((s) => s.id === confirmDeleteId);

  return (
    <Modal title="Manage Practice Sessions" onClose={onClose} wide>
      <p className="text-xs text-[var(--ack-muted)] mb-3">Add a recurring practice session and pick which days it runs.</p>
      <Field label="Session name">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Morning Practice" />
      </Field>
      <Field label="Time">
        <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
      </Field>
      <Field label="Repeats on">
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAY_LABELS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className="w-9 h-9 rounded-full text-[11px] font-bold transition"
              style={
                days.includes(i) ? { background: ROYAL, color: '#fff' } : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
              }
            >
              {d[0]}
            </button>
          ))}
        </div>
      </Field>
      {sessionError && <p className="text-xs text-red-600 mb-2">{sessionError}</p>}
      <PrimaryButton onClick={submit} disabled={sessionBusy || !title || days.length === 0} className="w-full mb-4">
        {sessionBusy ? 'Adding…' : 'Add session'}
      </PrimaryButton>
      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-[var(--ack-surface-2)] rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                {s.name}
              </p>
              <p className="text-[11px] text-[var(--ack-muted)]">
                {s.time} · {s.days.map((d) => WEEKDAY_LABELS[d]).join(', ')}
              </p>
            </div>
            <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 rounded-lg" style={{ color: DANGER }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-xs text-[var(--ack-muted)] text-center py-4">No practice sessions added yet.</p>}
      </div>
      {toDelete && (
        <ConfirmDialog
          title="Remove this session?"
          message={`Remove "${toDelete.name}" (${toDelete.time}) — it won't appear on the Dashboard anymore.`}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={async () => {
            if (toDelete) await onDelete(toDelete.id);
            setConfirmDeleteId(null);
          }}
        />
      )}
    </Modal>
  );
}
