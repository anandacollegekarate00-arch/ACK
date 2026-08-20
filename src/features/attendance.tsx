import React from 'react';
import { Search, Check, X, Clock, ArrowLeft, Download, Trash2, ChevronLeft, ChevronRight, Camera, QrCode, AlertTriangle } from '../icons';
import { Avatar, BeltBadge, Card, PrimaryButton, Field, inputCls, Modal, ConfirmDialog } from '../components/ui';
import { QRScannerModal } from '../components/QRScannerModal';
import { ROYAL, SUCCESS, DANGER, WARNING } from '../lib/theme';
import { ymd, todayISO } from '../lib/dates';
import { displayName } from '../lib/identity';
import { WEEKDAY_LABELS, sessionsForDate } from '../lib/attendance';
import { downloadCSV } from '../lib/csv';
import { DaySummaryBar } from './/dashboard';

// The attendance record for one student on one date (+ optional session) —
// module-level so the views' memos stay dependency-clean.
function findRec(attendance, date, sessionId, studentId) {
  return attendance.find((a) => a.student_id === studentId && a.date === date && (a.session_id || null) === (sessionId || null));
}

export function AttendanceView({ students, attendance, sessions, onMark, onRemoveMark, onMarkAllAbsent, currentUser }) {
  const [date, setDate] = React.useState(todayISO());
  const dateSessions = React.useMemo(() => sessionsForDate(sessions, date), [sessions, date]);
  const [sessionId, setSessionId] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [notes, setNotes] = React.useState('');
  const [pendingStatus, setPendingStatus] = React.useState(null);
  const [showCodeEntry, setShowCodeEntry] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
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

  // Former members (left_at set) no longer take part in attendance marking —
  // they can't collect absent marks anymore, but their history stays intact.
  const activeStudents = React.useMemo(() => students.filter((s) => !s.left_at), [students]);
  const filtered = activeStudents.filter(
    (s) => displayName(s).toLowerCase().includes(query.toLowerCase()) || s.admission_id.toLowerCase().includes(query.toLowerCase())
  );
  const existingRec = selected ? findRec(attendance, date, sessionId, selected.id) : null;
  const sessionLabel = sessionId ? dateSessions.find((s) => s.id === sessionId)?.name || 'Session' : 'General (no session picked)';
  const isToday = date === todayISO();
  const unmarked = React.useMemo(
    () => activeStudents.filter((s) => !findRec(attendance, date, sessionId, s.id)),
    [activeStudents, attendance, date, sessionId]
  );

  async function confirm() {
    if (!selected || !pendingStatus) return;
    setBusy(true);
    try {
      await onMark({
        student_id: selected.id,
        date,
        session_id: sessionId || null,
        status: pendingStatus,
        marked_by: currentUser.id,
        notes: notes || null,
      });
      setSelected(null);
      setPendingStatus(null);
      setNotes('');
    } finally {
      setBusy(false);
    }
  }

  async function removeMark() {
    if (!selected || !existingRec) return;
    setBusy(true);
    try {
      await onRemoveMark(existingRec.id);
      setConfirmRemove(false);
      setSelected(null);
      setPendingStatus(null);
      setNotes('');
    } finally {
      setBusy(false);
    }
  }

  async function confirmMarkAllAbsent() {
    setBulkBusy(true);
    try {
      await onMarkAllAbsent({ date, session_id: sessionId || null, studentIds: unmarked.map((s) => s.id), marked_by: currentUser.id });
      setConfirmBulkAbsent(false);
    } finally {
      setBulkBusy(false);
    }
  }

  function lookupByAdmissionId(code) {
    const match = activeStudents.find((s) => s.admission_id.toLowerCase() === code.trim().toLowerCase());
    return match || null;
  }

  function submitCode() {
    const match = lookupByAdmissionId(codeInput);
    if (!match) {
      setCodeError('No student found with that admission ID.');
      return;
    }
    setSelected(match);
    setShowCodeEntry(false);
    setCodeInput('');
    setCodeError('');
  }

  function handleScanned(text) {
    const match = lookupByAdmissionId(text);
    setShowScanner(false);
    if (!match) {
      setScanError(`Scanned "${text}" but no student has that admission ID.`);
      return;
    }
    setScanError('');
    setSelected(match);
  }

  function shiftDate(deltaDays) {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    setDate(ymd(d));
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
          Mark Attendance
        </h1>
        <button
          onClick={() =>
            downloadCSV(
              `ack-attendance-${todayISO()}.csv`,
              ['Date', 'Session', 'Admission ID', 'Student', 'Status', 'Notes', 'Marked By'],
              [...attendance]
                .sort((a, b) => (b.date + (b.session_id || '')).localeCompare(a.date + (a.session_id || '')))
                .map((a) => {
                  const st = students.find((s) => s.id === a.student_id);
                  const sn = sessions.find((s) => s.id === a.session_id)?.name || '';
                  return [a.date, sn, st ? st.admission_id : '', st ? displayName(st) : '', a.status, a.notes, a.marked_by];
                })
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
          style={{ background: 'var(--ack-surface-2)', color: 'var(--ack-heading)' }}
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => shiftDate(-1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--ack-surface-2)' }}
        >
          <ChevronLeft size={16} color="var(--ack-heading)" />
        </button>
        <input type="date" className={`${inputCls} flex-1`} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        <button
          onClick={() => shiftDate(1)}
          disabled={isToday}
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-30"
          style={{ background: 'var(--ack-surface-2)' }}
        >
          <ChevronRight size={16} color="var(--ack-heading)" />
        </button>
      </div>
      {!isToday && (
        <p className="text-[11px] text-[var(--ack-muted)] mb-3">Viewing a past date — you can still add, change, or remove marks here.</p>
      )}

      <DaySummaryBar attendance={attendance} date={date} sessionId={sessionId} totalStudents={activeStudents.length} />

      {unmarked.length > 0 && (
        <button
          onClick={() => setConfirmBulkAbsent(true)}
          className="w-full mb-3 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
          style={{ borderColor: DANGER, color: DANGER }}
        >
          <AlertTriangle size={14} /> Mark all {unmarked.length} unmarked as absent
        </button>
      )}

      {dateSessions.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {dateSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSessionId(s.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={
                sessionId === s.id
                  ? { background: ROYAL, color: '#fff' }
                  : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
              }
            >
              {s.name} · {s.time}
            </button>
          ))}
          <button
            onClick={() => setSessionId(null)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={
              sessionId === null ? { background: ROYAL, color: '#fff' } : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
            }
          >
            General
          </button>
        </div>
      )}
      {dateSessions.length === 0 && (
        <p className="text-[11px] text-[var(--ack-muted)] mb-3">
          No practice sessions were scheduled that day — attendance is marked generally for the date. Add sessions from the Dashboard.
        </p>
      )}

      <div className="relative mb-2">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ack-muted)]" />
        <input className={`${inputCls} pl-9 pr-36`} placeholder="Search student" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg active:scale-95 transition text-white"
            style={{ background: ROYAL }}
          >
            <Camera size={13} /> Scan
          </button>
          <button
            onClick={() => setShowCodeEntry(true)}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg active:scale-95 transition"
            style={{ background: 'var(--ack-surface-2)', color: ROYAL }}
          >
            <QrCode size={13} /> Code
          </button>
        </div>
      </div>
      {scanError && <p className="text-xs text-red-600 mb-2">{scanError}</p>}

      {showScanner && <QRScannerModal onDetected={handleScanned} onClose={() => setShowScanner(false)} />}

      {showCodeEntry && (
        <Modal
          title="Enter Admission ID"
          onClose={() => {
            setShowCodeEntry(false);
            setCodeError('');
          }}
        >
          <p className="text-xs text-[var(--ack-muted)] mb-3">
            Scan the student's QR ID with any QR scanner app, then paste or type the code it gives you here.
          </p>
          <Field label="Admission ID">
            <input
              className={inputCls}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. ACK-2026-001"
              autoCapitalize="characters"
            />
          </Field>
          {codeError && <p className="text-xs text-red-600 mb-3">{codeError}</p>}
          <PrimaryButton onClick={submitCode} className="w-full">
            Find Student
          </PrimaryButton>
        </Modal>
      )}

      {!selected && (
        <div className="space-y-2 mt-3">
          {filtered.map((s) => {
            const rec = findRec(attendance, date, sessionId, s.id);
            return (
              <button key={s.id} onClick={() => setSelected(s)} className="w-full text-left">
                <Card className="p-3 flex items-center gap-3">
                  <Avatar name={displayName(s)} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--ack-heading)' }}>
                      {displayName(s)}
                    </p>
                    <p className="text-[11px] text-[var(--ack-muted)]">{s.admission_id}</p>
                  </div>
                  <BeltBadge belt={s.belt} small />
                  {rec && (
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: rec.status === 'present' ? SUCCESS : rec.status === 'late' ? WARNING : DANGER }}
                    >
                      {rec.status}
                    </span>
                  )}
                </Card>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-[var(--ack-muted)] py-10 text-center">No students found.</p>}
        </div>
      )}

      {selected && (
        <Card className="p-4 mt-3">
          <button
            onClick={() => {
              setSelected(null);
              setPendingStatus(null);
            }}
            className="flex items-center gap-1 text-xs text-[var(--ack-muted)] mb-3"
          >
            <ArrowLeft size={13} /> Back to search
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={displayName(selected)} size={52} />
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
                {displayName(selected)}
              </p>
              <p className="text-[11px] text-[var(--ack-muted)]">{selected.admission_id}</p>
              <BeltBadge belt={selected.belt} small />
            </div>
          </div>
          <div className="text-xs text-[var(--ack-muted)] mb-3 bg-[var(--ack-surface-2)] rounded-xl p-3 space-y-1">
            <p>
              Session:{' '}
              <span className="font-semibold text-[var(--ack-text)]">
                {sessionLabel} · {date}
              </span>
            </p>
            <p>
              Marked by: <span className="font-semibold text-[var(--ack-text)]">{currentUser.name || currentUser.email}</span>
            </p>
            {existingRec && (
              <p>
                Currently marked:{' '}
                <span
                  className="font-semibold"
                  style={{ color: existingRec.status === 'present' ? SUCCESS : existingRec.status === 'late' ? WARNING : DANGER }}
                >
                  {existingRec.status}
                </span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setPendingStatus('present')}
              className="py-3 rounded-xl flex flex-col items-center gap-1 font-semibold text-xs"
              style={pendingStatus === 'present' ? { background: SUCCESS, color: '#fff' } : { background: `${SUCCESS}14`, color: SUCCESS }}
            >
              <Check size={18} />
              Present
            </button>
            <button
              onClick={() => setPendingStatus('absent')}
              className="py-3 rounded-xl flex flex-col items-center gap-1 font-semibold text-xs"
              style={pendingStatus === 'absent' ? { background: DANGER, color: '#fff' } : { background: `${DANGER}14`, color: DANGER }}
            >
              <X size={18} />
              Absent
            </button>
            <button
              onClick={() => setPendingStatus('late')}
              className="py-3 rounded-xl flex flex-col items-center gap-1 font-semibold text-xs"
              style={pendingStatus === 'late' ? { background: WARNING, color: '#fff' } : { background: `${WARNING}14`, color: WARNING }}
            >
              <Clock size={18} />
              Late
            </button>
          </div>
          <Field label="Notes (optional)">
            <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <PrimaryButton onClick={confirm} disabled={!pendingStatus || busy} className="w-full mb-2">
            {busy ? 'Saving…' : 'Confirm Attendance'}
          </PrimaryButton>
          {existingRec && (
            <button
              onClick={() => setConfirmRemove(true)}
              disabled={busy}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
              style={{ borderColor: DANGER, color: DANGER }}
            >
              <Trash2 size={14} /> Remove this mark
            </button>
          )}
        </Card>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title="Remove this attendance mark?"
          message={`This clears ${selected ? displayName(selected) : ''}'s "${existingRec?.status}" mark for ${date} entirely — it'll show as not marked, not just changed. This cannot be undone.`}
          confirmLabel="Remove"
          onCancel={() => setConfirmRemove(false)}
          onConfirm={removeMark}
        />
      )}
      {confirmBulkAbsent && (
        <ConfirmDialog
          title="Mark all unmarked students absent?"
          message={`This marks ${unmarked.length} student${unmarked.length === 1 ? '' : 's'} with no record yet for ${sessionLabel} on ${date} as absent. Anyone already marked present or late is left untouched.`}
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
    await onAdd({ name: title, time, days });
    setTitle('');
    setDays([]);
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
      <PrimaryButton onClick={submit} className="w-full mb-4">
        Add session
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
          message={`"${toDelete.name}" (${toDelete.time}) will no longer appear on the Dashboard.`}
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
