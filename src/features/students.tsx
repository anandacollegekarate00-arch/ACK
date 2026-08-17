import React from 'react';
import {
  Trophy,
  Search,
  Plus,
  Check,
  Edit3,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
  UserPlus,
  UploadCloud,
  FileText,
  Star,
  LogOut,
  RefreshCw,
} from '../icons';
import { MiniBarChart } from '../components/charts';
import {
  Avatar,
  BeltBadge,
  LevelBadge,
  Card,
  PrimaryButton,
  Field,
  inputCls,
  Modal,
  ConfirmDialog,
  ProgressRing,
  QRCode,
} from '../components/ui';
import { ROYAL, GOLD, SUCCESS, DANGER, WARNING, BELTS, PLACEMENT_STYLE } from '../lib/theme';
import { todayISO } from '../lib/dates';
import { generateAdmissionId, displayName } from '../lib/identity';
import { statsFor, monthlySeries } from '../lib/attendance';
import { downloadCSV, parseCSV, csvToStudents } from '../lib/csv';
import { AddAchievementModal } from './/achievements';
import { CreateParentLoginModal, ResetParentPasswordDialog } from './/profile';

// Cross-references used by the profile page — module-level so the memo that
// consumes them stays dependency-clean.
function tournamentFor(a, tournaments) {
  return tournaments.find((t) => t.id === a.tournament_id);
}
function seriesFor(t, tournamentSeries) {
  return t && tournamentSeries.find((s) => s.id === t.series_id);
}

export function StudentFormModal({ students, existing = undefined, onClose, onSave }) {
  const [form, setForm] = React.useState(
    existing || {
      name: '',
      full_name: '',
      dob: '',
      birth_cert_no: '',
      nic: '',
      grade: '',
      belt: 'White (10th Kyu)',
      join_date: todayISO(),
      school_admission_no: '',
      association_admission_no: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_whatsapp: '',
      guardian_email: '',
      guardian_address: '',
    }
  );
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function submit() {
    if (!form.name || !form.dob) return;
    if (existing) {
      onSave(form);
      return;
    }
    // The database assigns admission_id server-side (see database-schema.sql).
    onSave(form);
  }
  return (
    <Modal title={existing ? 'Edit Student' : 'Add New Student'} onClose={onClose} wide>
      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: ROYAL }}>
        Personal Information
      </p>
      <Field label="Name">
        <input
          className={inputCls}
          value={form.name || ''}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Short display name (used everywhere in the app)"
        />
      </Field>
      <Field label="Full name">
        <input
          className={inputCls}
          value={form.full_name || ''}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder="Full legal name"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Date of birth">
          <input type="date" className={inputCls} value={form.dob || ''} onChange={(e) => set('dob', e.target.value)} />
        </Field>
        <Field label="Join date">
          <input type="date" className={inputCls} value={form.join_date || ''} onChange={(e) => set('join_date', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Birth certificate no.">
          <input className={inputCls} value={form.birth_cert_no || ''} onChange={(e) => set('birth_cert_no', e.target.value)} />
        </Field>
        <Field label="NIC / Postal ID (if have)">
          <input className={inputCls} value={form.nic || ''} onChange={(e) => set('nic', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Grade">
          <select className={inputCls} value={form.grade || ''} onChange={(e) => set('grade', e.target.value)}>
            <option value="">— Select grade —</option>
            {['1','2','3','4','5','6','7','8','9','10','11','12','13'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Kyu">
          <select className={inputCls} value={form.belt} onChange={(e) => set('belt', e.target.value)}>
            {BELTS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="School admission number">
          <input className={inputCls} value={form.school_admission_no || ''} onChange={(e) => set('school_admission_no', e.target.value)} />
        </Field>
        <Field label="Association admission number">
          <input
            className={inputCls}
            value={form.association_admission_no || ''}
            onChange={(e) => set('association_admission_no', e.target.value)}
          />
        </Field>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide mt-4 mb-2" style={{ color: ROYAL }}>
        Guardian Information
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Parent / guardian name">
          <input className={inputCls} value={form.guardian_name || ''} onChange={(e) => set('guardian_name', e.target.value)} />
        </Field>
        <Field label="Phone number">
          <input className={inputCls} value={form.guardian_phone || ''} onChange={(e) => set('guardian_phone', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="WhatsApp number">
          <input className={inputCls} value={form.guardian_whatsapp || ''} onChange={(e) => set('guardian_whatsapp', e.target.value)} />
        </Field>
        <Field label="Email address">
          <input className={inputCls} value={form.guardian_email || ''} onChange={(e) => set('guardian_email', e.target.value)} />
        </Field>
      </div>
      <Field label="Address">
        <textarea
          rows={2}
          className={inputCls}
          value={form.guardian_address || ''}
          onChange={(e) => set('guardian_address', e.target.value)}
        />
      </Field>
      {!existing && (
        <p className="text-[11px] text-[var(--ack-muted)] mb-3">
          Admission ID auto-generated: <span className="font-semibold">{generateAdmissionId(students, form.join_date)}</span>
        </p>
      )}
      <PrimaryButton onClick={submit} className="w-full">
        Save Student
      </PrimaryButton>
    </Modal>
  );
}

// Downloads an array of rows as a CSV file. Handles quoting/escaping (Excel-
// safe), UTF-8 BOM so Sinhala/emoji names open correctly, and \r\n line
// endings per the CSV spec.
export function ImportStudentsModal({ roster, onClose, onImport }) {
  const fileRef = React.useRef(null);
  const [fileName, setFileName] = React.useState('');
  const [valid, setValid] = React.useState([]);
  const [skipped, setSkipped] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(null);

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setDone(null);
    setError('');
    try {
      const rows = parseCSV(await file.text());
      if (rows.length < 2) {
        setError('The file has no data rows — it needs a header line plus at least one student.');
        setValid([]);
        setSkipped([]);
        return;
      }
      const res = csvToStudents(rows[0], rows.slice(1), roster);
      setValid(res.valid);
      setSkipped(res.skipped);
    } catch (e) {
      setError('Could not read the file: ' + (e && e.message ? e.message : e));
      setValid([]);
      setSkipped([]);
    }
  }

  async function doImport() {
    setBusy(true);
    setError('');
    try {
      await onImport(valid);
      setDone({ added: valid.length });
    } catch (e) {
      setError('Import failed: ' + (e && e.message ? e.message : e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Import Students" onClose={onClose} wide>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files && e.target.files[0]);
          e.target.value = '';
        }}
      />

      {!done && !fileName && (
        <div className="rounded-xl border border-dashed border-[var(--ack-border)] p-5 text-center mb-4">
          <FileText size={28} className="mx-auto mb-2" color={ROYAL} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ack-heading)' }}>
            Choose a CSV file
          </p>
          <p className="text-xs text-[var(--ack-muted)] mb-4">
            Columns can match the Export CSV button (Admission ID, Name, Full Name, DOB, Belt, Grade, Join Date, Birth Cert No, NIC, School
            Admission No, Association Admission No, Guardian Name, Guardian Phone, Guardian WhatsApp, Guardian Email, Guardian Address).
            Only Name and Date of Birth are required; Admission IDs are assigned automatically.
          </p>
          <button
            onClick={() => fileRef.current && fileRef.current.click()}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm active:scale-[0.98] transition"
            style={{ background: ROYAL }}
          >
            <UploadCloud size={15} className="inline mr-1.5 -mt-0.5" />
            Choose CSV file
          </button>
        </div>
      )}

      {!done && fileName && (
        <>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: 'var(--ack-surface-2)' }}>
            <FileText size={15} color={ROYAL} />
            <p className="text-sm font-semibold truncate flex-1" style={{ color: 'var(--ack-heading)' }}>
              {fileName}
            </p>
            <button
              onClick={() => {
                setFileName('');
                setValid([]);
                setSkipped([]);
                setError('');
              }}
              className="text-xs font-semibold shrink-0"
              style={{ color: ROYAL }}
            >
              Choose another
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(52,199,89,0.15)', color: '#1D7A36' }}
            >
              {valid.length} ready to import
            </span>
            {skipped.length > 0 && (
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,149,0,0.15)', color: '#B45309' }}
              >
                {skipped.length} skipped
              </span>
            )}
          </div>
          {skipped.length > 0 && (
            <div className="max-h-44 overflow-y-auto mb-3 rounded-xl border border-[var(--ack-border)] divide-y divide-[var(--ack-border)]">
              {skipped.map((s, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" color="#B45309" />
                  <p className="text-xs leading-snug" style={{ color: 'var(--ack-text)' }}>
                    <span className="font-semibold">Row {s.row}:</span> {s.name} — {s.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="text-xs mb-3" style={{ color: DANGER }}>
              {error}
            </p>
          )}
          <PrimaryButton onClick={doImport} disabled={busy || valid.length === 0} className="w-full">
            {busy ? 'Importing…' : `Import ${valid.length} student${valid.length === 1 ? '' : 's'}`}
          </PrimaryButton>
        </>
      )}

      {done && (
        <div className="text-center py-6">
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(52,199,89,0.15)' }}
          >
            <Check size={26} color="#1D7A36" />
          </span>
          <p className="font-bold text-base mb-1" style={{ color: 'var(--ack-heading)' }}>
            {done.added} student{done.added === 1 ? '' : 's'} added to the roster
          </p>
          <p className="text-xs text-[var(--ack-muted)] mb-4">
            Admission IDs were assigned automatically. Your list refreshes in the Students tab.
          </p>
          {skipped.length > 0 && (
            <p className="text-xs mb-4" style={{ color: '#B45309' }}>
              {skipped.length} row{skipped.length === 1 ? '' : 's'} skipped — {skipped.map((s) => s.reason).join('; ')}
            </p>
          )}
          <PrimaryButton onClick={onClose} className="w-full">
            Done
          </PrimaryButton>
        </div>
      )}
    </Modal>
  );
}

export function StudentsView({ students, attendance, onAddStudent, openStudent, autoOpenAdd, onConsumeAutoOpen, onImportStudents }) {
  const [query, setQuery] = React.useState('');
  const [filterBy, setFilterBy] = React.useState('All');
  const [selectedBelt, setSelectedBelt] = React.useState(null);
  const [selectedGrade, setSelectedGrade] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);

  React.useEffect(() => {
    if (autoOpenAdd) {
      setShowAdd(true);
      onConsumeAutoOpen();
    }
  }, [autoOpenAdd, onConsumeAutoOpen]);

  function switchFilter(f) {
    setFilterBy(f);
    setSelectedBelt(null);
    setSelectedGrade(null);
    setQuery('');
  }

  // gradeKey extracts the leading numeric part so "12m6" groups with "12"
  const gradeKey = (g: string) => { const m = String(g || '').replace(/^(class|grade)\s*/i, '').match(/^(\d+)/); return m ? m[1] : String(g || ''); };
  const VALID_GRADES = ['1','2','3','4','5','6','7','8','9','10','11','12','13'];
  const distinctGrades: string[] = VALID_GRADES.filter((g) => students.some((s) => gradeKey(s.grade) === g));
  const distinctBelts = BELTS.filter((b) => students.some((s) => s.belt === b));

  // Former members (left_at set) live behind their own filter — the main
  // roster, imports and attendance stay purely active-member.
  const activeStudents = students.filter((s) => !s.left_at);
  const formerStudents = students.filter((s) => s.left_at);

  const filtered = (filterBy === 'Former members' ? formerStudents : activeStudents).filter((s) => {
    if (filterBy === 'Belt') return selectedBelt ? s.belt === selectedBelt : true;
    if (filterBy === 'Grade') return selectedGrade ? gradeKey(s.grade) === selectedGrade : true;
    const q = query.toLowerCase();
    if (!q) return true;
    return displayName(s).toLowerCase().includes(q) || s.admission_id.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6 relative">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
          Students
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              downloadCSV(
                `ack-students-${todayISO()}.csv`,
                [
                  'Admission ID',
                  'Name',
                  'Full Name',
                  'DOB',
                  'Belt',
                  'Grade',
                  'Join Date',
                  'Birth Cert No',
                  'NIC',
                  'School Admission No',
                  'Association Admission No',
                  'Guardian Name',
                  'Guardian Phone',
                  'Guardian WhatsApp',
                  'Guardian Email',
                  'Guardian Address',
                ],
                (filterBy === 'Former members' ? formerStudents : activeStudents).map((s) => [
                  s.admission_id,
                  s.name,
                  s.full_name,
                  s.dob,
                  s.belt,
                  s.grade,
                  s.join_date,
                  s.birth_cert_no,
                  s.nic,
                  s.school_admission_no,
                  s.association_admission_no,
                  s.guardian_name,
                  s.guardian_phone,
                  s.guardian_whatsapp,
                  s.guardian_email,
                  s.guardian_address,
                ])
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ background: 'var(--ack-surface-2)', color: 'var(--ack-heading)' }}
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap text-white"
            style={{ background: ROYAL }}
          >
            <UploadCloud size={13} /> Import CSV
          </button>
        </div>
      </div>

      {filterBy === 'All' && (
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ack-muted)]" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search by name or admission ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {['All', 'Belt', 'Grade'].map((f) => (
          <button
            key={f}
            onClick={() => switchFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={
              filterBy === f
                ? { background: 'var(--ack-heading)', color: '#fff' }
                : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
            }
          >
            {f}
          </button>
        ))}
        <button
          key="Former members"
          onClick={() => switchFilter('Former members')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
          style={
            filterBy === 'Former members'
              ? { background: '#f59e0b', color: '#fff' }
              : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
          }
        >
          Past Students {formerStudents.length > 0 ? `(${formerStudents.length})` : ''}
        </button>
      </div>

      {filterBy === 'Belt' && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setSelectedBelt(null)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={!selectedBelt ? { background: ROYAL, color: '#fff' } : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }}
          >
            All Belts
          </button>
          {distinctBelts.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBelt(b)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={
                selectedBelt === b
                  ? { background: ROYAL, color: '#fff' }
                  : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
              }
            >
              {b}
            </button>
          ))}
          {distinctBelts.length === 0 && <p className="text-xs text-[var(--ack-muted)]">No students registered yet.</p>}
        </div>
      )}

      {filterBy === 'Grade' && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setSelectedGrade(null)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={
              !selectedGrade ? { background: ROYAL, color: '#fff' } : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
            }
          >
            All Grades
          </button>
          {distinctGrades.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={
                selectedGrade === g
                  ? { background: ROYAL, color: '#fff' }
                  : { background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }
              }
            >
              Grade {g}
            </button>
          ))}
          {distinctGrades.length === 0 && <p className="text-xs text-[var(--ack-muted)]">No students registered yet.</p>}
        </div>
      )}

      {filterBy === 'Former members' && formerStudents.length > 0 && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
          <p className="text-xs font-semibold" style={{ color: '#92400e' }}>
            📚 Past Students Section — These students have left the club but their records are preserved. Parents can still view their history.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
        {filtered.map((s) => {
          const st = statsFor(s.id, attendance);
          return (
            <Card key={s.id} className="p-4 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={displayName(s)} size={48} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--ack-muted)]">{s.admission_id}</p>
                  <p className="font-bold text-sm truncate flex items-center gap-1.5" style={{ color: 'var(--ack-heading)' }}>
                    {displayName(s)}
                    {s.left_at && (
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }}
                      >
                        left
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--ack-muted)]">Grade {s.grade}</p>
                </div>
                <BeltBadge belt={s.belt} small />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--ack-surface-2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${st.presentPct}%`, background: ROYAL }} />
                </div>
                <span className="text-[11px] font-bold text-[var(--ack-muted)]">{st.presentPct}%</span>
              </div>
              <button
                onClick={() => openStudent(s.id)}
                className="w-full mt-auto py-2 rounded-xl text-xs font-semibold border"
                style={{ borderColor: ROYAL, color: ROYAL }}
              >
                View Profile
              </button>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-[var(--ack-muted)] py-10 text-center">No students found.</p>}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed sm:absolute bottom-24 sm:bottom-6 right-5 sm:right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30"
        style={{ background: ROYAL }}
      >
        <Plus size={24} color="#fff" />
      </button>

      {showAdd && (
        <StudentFormModal
          students={students}
          onClose={() => setShowAdd(false)}
          onSave={async (s) => {
            await onAddStudent(s);
            setShowAdd(false);
          }}
        />
      )}
      {showImport && (
        <ImportStudentsModal
          roster={students}
          onClose={() => setShowImport(false)}
          onImport={async (rows) => {
            await onImportStudents(rows);
          }}
        />
      )}
    </div>
  );
}

export function ChangeBeltModal({ student, onClose, onSave }) {
  const [belt, setBelt] = React.useState(student.belt);
  return (
    <Modal title="Update Belt Rank" onClose={onClose}>
      <p className="text-xs text-[var(--ack-muted)] mb-3">
        Updating rank for <span className="font-semibold text-[var(--ack-text)]">{displayName(student)}</span>.
      </p>
      <Field label="Belt rank">
        <select className={inputCls} value={belt} onChange={(e) => setBelt(e.target.value)}>
          {BELTS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>
      <PrimaryButton
        onClick={async () => {
          await onSave({ ...student, belt });
          onClose();
        }}
        className="w-full"
      >
        Save Belt
      </PrimaryButton>
    </Modal>
  );
}

export function AttendanceCalendar({ studentId, attendance }) {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDow = new Date(cursor.y, cursor.m, 1).getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const recsByDay = {};
  attendance
    .filter((a) => a.student_id === studentId)
    .forEach((a) => {
      const d = new Date(a.date + 'T00:00:00');
      if (d.getFullYear() === cursor.y && d.getMonth() === cursor.m) recsByDay[d.getDate()] = a.status;
    });
  const statusColor = { present: SUCCESS, absent: DANGER, late: WARNING };
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  function shift(delta) {
    let m = cursor.m + delta,
      y = cursor.y;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setCursor({ y, m });
  }
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shift(-1)}>
          <ChevronLeft size={16} color="var(--ack-heading)" />
        </button>
        <p className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
          {monthName}
        </p>
        <button onClick={() => shift(1)}>
          <ChevronRight size={16} color="var(--ack-heading)" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <p key={i} className="text-center text-[10px] text-[var(--ack-muted)] font-semibold">
            {d}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const status = d ? recsByDay[d] : null;
          return (
            <div
              key={i}
              className="aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold"
              style={d ? { background: status ? statusColor[status] : 'var(--ack-surface-2)', color: status ? '#fff' : '#9CA3AF' } : {}}
            >
              {d || ''}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-[11px] text-[var(--ack-muted)]">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: SUCCESS }} />
          Present
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: DANGER }} />
          Absent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: WARNING }} />
          Late
        </span>
      </div>
    </Card>
  );
}

export function StudentRecordModal({ student, attendance, achievements, tournaments = [], tournamentEvents = [], onClose }) {
  const st = statsFor(student.id, attendance);
  const my = achievements.filter((a) => a.student_id === student.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Modal title="Student Record" onClose={onClose} wide>
      <div className="print-area">
        <div className="mb-5 text-center">
          <p className="text-sm font-extrabold tracking-wide" style={{ color: ROYAL, fontFamily: 'Poppins, sans-serif' }}>
            ANANDA COLLEGE KARATE CLUB
          </p>
          <p className="text-[11px] text-[var(--ack-muted)] mt-0.5">Official Student Record</p>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={displayName(student)} size={56} />
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-lg truncate" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
              {displayName(student)}
            </p>
            <p className="text-xs text-[var(--ack-muted)]">{student.full_name}</p>
          </div>
          <BeltBadge belt={student.belt} />
        </div>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs mb-4">
          <p className="text-[var(--ack-muted)]">Admission ID</p>
          <p className="font-semibold text-right" style={{ color: 'var(--ack-heading)' }}>
            {student.admission_id}
          </p>
          <p className="text-[var(--ack-muted)]">Grade</p>
          <p className="font-semibold text-right" style={{ color: 'var(--ack-heading)' }}>
            {student.grade || '—'}
          </p>
          <p className="text-[var(--ack-muted)]">Date of birth</p>
          <p className="font-semibold text-right" style={{ color: 'var(--ack-heading)' }}>
            {student.dob || '—'}
          </p>
          <p className="text-[var(--ack-muted)]">Joined</p>
          <p className="font-semibold text-right" style={{ color: 'var(--ack-heading)' }}>
            {student.join_date || '—'}
          </p>
          <p className="text-[var(--ack-muted)]">Membership</p>
          <p className="font-semibold text-right" style={{ color: 'var(--ack-heading)' }}>
            {student.left_at ? `Left on ${student.left_at.slice(0, 10)}` : 'Active member'}
          </p>
        </div>
        <div className="rounded-xl p-3 mb-4" style={{ background: 'var(--ack-surface-2)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: ROYAL }}>
            Attendance Record
          </p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              ['Sessions', st.total],
              ['Present', st.present],
              ['Late', st.late],
              ['Absent', st.absent],
              ['Rate', `${st.presentPct}%`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-extrabold text-base" style={{ color: 'var(--ack-heading)' }}>
                  {value}
                </p>
                <p className="text-[10px] text-[var(--ack-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: ROYAL }}>
            Achievements ({my.length})
          </p>
          {my.length === 0 ? (
            <p className="text-xs text-[var(--ack-muted)]">No achievements recorded.</p>
          ) : (
            <div className="space-y-2">
              {my.map((a) => {
                const tournament = tournamentFor(a, tournaments);
                const event = tournamentEvents.find((e) => e.id === a.event_id);
                return (
                  <div key={a.id} className="rounded-xl p-3" style={{ background: 'var(--ack-surface-2)' }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold" style={{ color: 'var(--ack-heading)' }}>
                        {a.title}
                        {a.placement && (
                          <span className="ml-1.5" style={{ color: PLACEMENT_STYLE[a.placement]?.color || GOLD }}>
                            {a.placement}
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-[var(--ack-muted)] shrink-0">{a.date}</span>
                    </div>
                    <p className="text-[10px] text-[var(--ack-muted)] mt-0.5">
                      {[tournament?.name, event?.name, a.level].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <p className="text-[10px] text-[var(--ack-muted)] text-center pt-2 border-t border-[var(--ack-border)]">
          Record generated {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} · Ananda College
          Karate Club
        </p>
      </div>
      <div className="print-hide">
        <PrimaryButton onClick={() => window.print()} className="w-full">
          Print / Save as PDF
        </PrimaryButton>
      </div>
    </Modal>
  );
}

export function StudentProfilePage({
  student,
  attendance,
  achievements,
  tournaments = [],
  tournamentSeries = [],
  tournamentEvents = [],
  eventRegistrations = [],
  profiles = [],
  parentLinks = [],
  readOnly = false,
  onUpdate = undefined,
  onMarkLeft = undefined,
  onReinstate = undefined,
  onDelete = undefined,
  onAddAchievement = undefined,
  onCreateParentAccount = undefined,
  onResetParentPassword = undefined,
  openTournament = undefined,
}) {
  const [showEdit, setShowEdit] = React.useState(false);
  const [showAddAchievement, setShowAddAchievement] = React.useState(false);
  const [showChangeBelt, setShowChangeBelt] = React.useState(false);
  const [confirmMarkLeft, setConfirmMarkLeft] = React.useState(false);
  const [confirmErase, setConfirmErase] = React.useState(false);
  const [showRecord, setShowRecord] = React.useState(false);
  const [showCreateParentLogin, setShowCreateParentLogin] = React.useState(false);
  const [resetParentTarget, setResetParentTarget] = React.useState(null);
  const isFormer = !!student.left_at;
  const st = statsFor(student.id, attendance);
  const chartData = monthlySeries(student.id, attendance);
  const myAchievements = achievements.filter((a) => a.student_id === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const medalCount = myAchievements.filter((a) => a.placement === 'Gold' || a.placement === 'Silver' || a.placement === 'Bronze').length;
  const parentProfiles = parentLinks
    .filter((l) => l.student_id === student.id)
    .map((l) => profiles.find((p) => p.id === l.parent_id))
    .filter(Boolean);
  const hasParentAccount = parentProfiles.length > 0;

  // Upcoming Tournaments — events this student is registered for whose
  // tournament hasn't happened yet (or has no date set).
  const upcoming = React.useMemo(() => {
    const today = todayISO();
    return eventRegistrations
      .filter((r) => r.student_id === student.id)
      .map((r) => {
        const event = tournamentEvents.find((e) => e.id === r.event_id);
        const tournament = event && tournaments.find((t) => t.id === event.tournament_id);
        return event && tournament ? { registration: r, event, tournament, series: seriesFor(tournament, tournamentSeries) } : null;
      })
      .filter((x) => x && (!x.tournament.date || x.tournament.date >= today))
      .sort((a, b) => (a.tournament.date || '9999').localeCompare(b.tournament.date || '9999'));
  }, [eventRegistrations, tournamentEvents, tournaments, tournamentSeries, student.id]);

  return (
    <div className={`p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto ${readOnly ? 'pb-8' : 'pb-24 sm:pb-6'}`}>
      <Card className="p-5 mb-4">
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar name={displayName(student)} size={72} />
          <h1 className="text-lg font-extrabold mt-3" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
            {displayName(student)}
          </h1>
          <p className="text-xs text-[var(--ack-muted)] mb-2">{student.admission_id}</p>
          <div className="flex items-center gap-2">
            <BeltBadge belt={student.belt} />
            {!readOnly && !isFormer && (
              <button
                onClick={() => setShowChangeBelt(true)}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: `${ROYAL}14` }}
                title="Update belt"
              >
                <Star size={12} color={ROYAL} />
              </button>
            )}
          </div>
          {isFormer && (
            <span
              className="mt-2 text-[10px] font-bold uppercase px-2 py-1 rounded-full"
              style={{ background: 'var(--ack-surface-2)', color: 'var(--ack-muted)' }}
            >
              Former member — left {student.left_at.slice(0, 10)}
            </span>
          )}
          <div className="mt-4">
            <ProgressRing percent={st.presentPct} size={88} />
          </div>
          <p className="text-[11px] text-[var(--ack-muted)] mt-1">Attendance (late = half credit)</p>
        </div>
        {!readOnly && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
              style={{ borderColor: ROYAL, color: ROYAL }}
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={() => setShowRecord(true)}
              className="py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
              style={{ borderColor: ROYAL, color: ROYAL }}
            >
              <FileText size={14} />
              Student record
            </button>
            {isFormer ? (
              <button
                onClick={() => onReinstate && onReinstate(student.id)}
                className="py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
                style={{ borderColor: SUCCESS, color: SUCCESS }}
              >
                <RefreshCw size={14} />
                Restore to Active
              </button>
            ) : (
              <button
                onClick={() => setConfirmMarkLeft(true)}
                className="py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                <LogOut size={14} />
                Mark as Past Student
              </button>
            )}
            {isFormer && (
              <button
                onClick={() => setConfirmErase(true)}
                className="py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5"
                style={{ borderColor: DANGER, color: DANGER }}
              >
                <Trash2 size={14} />
                Delete Permanently
              </button>
            )}
          </div>
        )}
      </Card>

      {!readOnly && upcoming.length > 0 && (
        <Card className="overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-[var(--ack-border)] flex items-center gap-2">
            <Trophy size={16} color={ROYAL} />
            <span className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
              Upcoming Tournaments
            </span>
          </div>
          <div className="divide-y divide-[var(--ack-border)]">
            {upcoming.map(({ registration, event, tournament, series }) => (
              <button
                key={registration.id}
                onClick={() => openTournament && openTournament(tournament.id)}
                className="w-full px-4 py-3 text-left"
              >
                {series && (
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ROYAL }}>
                    {series.name}
                  </p>
                )}
                <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                  {tournament.name}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--ack-muted)' }}>
                    {event.name}
                  </span>
                  {(event.dates && event.dates.length > 0 ? event.dates : [tournament.date]).filter(Boolean).map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${ROYAL}14`, color: ROYAL }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 mb-4 flex flex-col items-center text-center">
        <p className="font-bold text-sm mb-3 self-start" style={{ color: 'var(--ack-heading)' }}>
          Attendance QR ID
        </p>
        <QRCode value={student.admission_id} size={150} />
        <p className="text-xs font-bold mt-3 tracking-wider" style={{ color: 'var(--ack-heading)' }}>
          {student.admission_id}
        </p>
        <p className="text-[11px] text-[var(--ack-muted)] mt-1 max-w-[220px]">
          Tap "Scan" on the Attendance screen and point the camera at this code to mark {readOnly ? 'them' : 'this student'} present — or
          use "Code" to type the admission ID manually.
        </p>
      </Card>

      <Card className="p-4 mb-4">
        <p className="font-bold text-sm mb-3" style={{ color: 'var(--ack-heading)' }}>
          Information
        </p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
          <p className="text-[var(--ack-muted)]">Full name</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.full_name || '—'}</p>
          <p className="text-[var(--ack-muted)]">Date of birth</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.dob}</p>
          {!readOnly && (
            <>
              <p className="text-[var(--ack-muted)]">NIC / Postal ID</p>
              <p className="text-[var(--ack-text)] font-medium text-right">{student.nic || '—'}</p>
            </>
          )}
          {!readOnly && (
            <>
              <p className="text-[var(--ack-muted)]">Birth certificate</p>
              <p className="text-[var(--ack-text)] font-medium text-right">{student.birth_cert_no}</p>
            </>
          )}
          <p className="text-[var(--ack-muted)]">Grade / class</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.grade}</p>
          <p className="text-[var(--ack-muted)]">Join date</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.join_date}</p>
          <p className="text-[var(--ack-muted)]">School admission no.</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.school_admission_no || '—'}</p>
          <p className="text-[var(--ack-muted)]">Association admission no.</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.association_admission_no || '—'}</p>
          <p className="text-[var(--ack-muted)]">Guardian</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.guardian_name}</p>
          <p className="text-[var(--ack-muted)]">Phone</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.guardian_phone}</p>
          <p className="text-[var(--ack-muted)]">WhatsApp</p>
          <p className="text-[var(--ack-text)] font-medium text-right">{student.guardian_whatsapp || '—'}</p>
        </div>
      </Card>

      {!readOnly && (
        <Card className="p-4 mb-4">
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--ack-heading)' }}>
            Parent Access
          </p>
          {parentProfiles.length > 0 && (
            <div className="space-y-2 mb-3">
              {parentProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-[var(--ack-surface-2)] rounded-xl p-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                    {p.name}
                  </p>
                  <button
                    onClick={() => setResetParentTarget(p)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shrink-0"
                    style={{ background: `${WARNING}14`, color: WARNING }}
                  >
                    Reset Password
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--ack-muted)] mb-3">
            {parentProfiles.length > 0
              ? 'Add another parent login (e.g. a second guardian) using a different WhatsApp number.'
              : 'No parent login yet. Create one using their WhatsApp number — a random one-time password is generated, and they must change it on first sign-in.'}
          </p>
          <button
            onClick={() => setShowCreateParentLogin(true)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            style={{ background: ROYAL }}
          >
            <UserPlus size={14} /> {parentProfiles.length > 0 ? 'Add Another Parent Login' : 'Create Parent Login'}
          </button>
        </Card>
      )}

      {!readOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Card className="p-4">
            <p className="text-2xl font-extrabold" style={{ color: 'var(--ack-heading)' }}>
              {myAchievements.length}
            </p>
            <p className="text-[11px] text-[var(--ack-muted)]">Total Achievements</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-extrabold" style={{ color: GOLD }}>
              {medalCount}
            </p>
            <p className="text-[11px] text-[var(--ack-muted)]">Medals Won</p>
          </Card>
        </div>
      )}

      {!readOnly && (
        <button
          onClick={() => setShowAddAchievement(true)}
          className="w-full mb-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: GOLD }}
        >
          <Plus size={16} /> Add Achievement for {displayName(student).split(' ')[0]}
        </button>
      )}

      <Card className="p-4 mb-4">
        <p className="font-bold text-sm mb-3" style={{ color: 'var(--ack-heading)' }}>
          Performance Overview — Monthly Attendance
        </p>
        <div style={{ width: '100%', height: 160 }}>
          <MiniBarChart data={chartData} labelKey="month" valueKey="rate" color={ROYAL} />
        </div>
        {chartData.length === 0 && <p className="text-xs text-[var(--ack-muted)] text-center py-6">No attendance records yet.</p>}
      </Card>

      <div className="mb-4">
        <AttendanceCalendar studentId={student.id} attendance={attendance} />
      </div>

      {!readOnly && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--ack-border)] flex items-center gap-2">
            <Award size={16} color={GOLD} />
            <span className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
              Achievement History
            </span>
          </div>
          <div className="divide-y divide-[var(--ack-border)]">
            {myAchievements.map((a) => {
              const t = tournamentFor(a, tournaments);
              const s = seriesFor(t, tournamentSeries);
              return (
                <div key={a.id} className="px-4 py-3">
                  {t && (
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ROYAL }}>
                      {s ? `${s.name} · ${t.name}` : t.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                      {a.title}
                    </p>
                    <span className="text-[11px] text-[var(--ack-muted)]">{a.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <LevelBadge level={a.level} />
                    {a.placement && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: PLACEMENT_STYLE[a.placement].bg, color: PLACEMENT_STYLE[a.placement].fg }}
                      >
                        {a.placement}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--ack-muted)]">{a.date}</span>
                  </div>
                  {a.notes && <p className="text-xs text-[var(--ack-muted)] mt-1">{a.notes}</p>}
                </div>
              );
            })}
            {myAchievements.length === 0 && <p className="p-4 text-sm text-[var(--ack-muted)]">No achievements logged yet.</p>}
          </div>
        </Card>
      )}

      {showEdit && (
        <StudentFormModal
          students={[]}
          existing={student}
          onClose={() => setShowEdit(false)}
          onSave={async (s) => {
            await onUpdate(s);
            setShowEdit(false);
          }}
        />
      )}
      {showChangeBelt && <ChangeBeltModal student={student} onClose={() => setShowChangeBelt(false)} onSave={onUpdate} />}
      {showAddAchievement && (
        <AddAchievementModal
          students={[student]}
          tournaments={tournaments}
          lockStudentId={student.id}
          onClose={() => setShowAddAchievement(false)}
          onSave={async (a) => {
            await onAddAchievement(a);
            setShowAddAchievement(false);
          }}
        />
      )}
      {confirmMarkLeft && (
        <ConfirmDialog
          title="Mark as Past Student?"
          message={`${displayName(student)} will be moved to "Past Students" section and removed from active attendance marking. Parents will still have access to view their historical records. All attendance and achievement history is preserved. You can restore them anytime from the "Past Students" filter.`}
          confirmLabel="Mark as Past Student"
          onCancel={() => setConfirmMarkLeft(false)}
          onConfirm={async () => {
            await onMarkLeft(student.id);
            setConfirmMarkLeft(false);
          }}
        />
      )}
      {confirmErase && (
        <ConfirmDialog
          title="⚠️ Permanently Delete Student?"
          message={`This will PERMANENTLY DELETE ${displayName(student)} and ALL their data including attendance records, achievements, tournament registrations, and parent access. This action CANNOT be undone. Consider marking as "Past Student" instead to preserve records.`}
          confirmLabel="Delete Permanently"
          onCancel={() => setConfirmErase(false)}
          onConfirm={async () => {
            await onDelete(student.id);
            setConfirmErase(false);
          }}
        />
      )}
      {showRecord && (
        <StudentRecordModal
          student={student}
          attendance={attendance}
          achievements={achievements}
          tournaments={tournaments}
          tournamentEvents={tournamentEvents}
          onClose={() => setShowRecord(false)}
        />
      )}
      {showCreateParentLogin && (
        <CreateParentLoginModal student={student} onClose={() => setShowCreateParentLogin(false)} onCreate={onCreateParentAccount} />
      )}
      {resetParentTarget && (
        <ResetParentPasswordDialog
          parentProfile={resetParentTarget}
          onClose={() => setResetParentTarget(null)}
          onReset={onResetParentPassword}
        />
      )}
    </div>
  );
}
