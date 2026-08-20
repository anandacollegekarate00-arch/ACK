import React from 'react';
import { Users, Calendar, Trophy, Plus, X, Edit3, Trash2, Award, Medal, TrendingUp, PieChartIcon } from '../icons';
import { DonutChart, TrendBarChart } from '../components/charts';
import { Avatar, LevelBadge, Card, StatCard, PrimaryButton, Field, inputCls, Modal, ConfirmDialog } from '../components/ui';
import { NAVY, ROYAL, GOLD, DANGER, LEVELS, PLACEMENT_STYLE, PLACEMENTS, EVENT_PRESETS } from '../lib/theme';
import { rosterForEvent, tournamentAnalytics, seriesYearlyStats } from '../lib/tournament';
import { todayISO } from '../lib/dates';
import { displayName } from '../lib/identity';

export function AddAchievementModal({ students, tournaments, onClose, onSave, lockStudentId, existing }) {
  const [studentId, setStudentId] = React.useState(lockStudentId || existing?.student_id || students[0]?.id || '');
  const lockedStudent = lockStudentId ? students.find((s) => s.id === lockStudentId) : null;
  const [title, setTitle] = React.useState(existing?.title || '');
  const [level, setLevel] = React.useState(existing?.level || 'School');
  const [tournamentId, setTournamentId] = React.useState(existing?.tournament_id || '');
  const [date, setDate] = React.useState(existing?.date || todayISO());
  const [notes, setNotes] = React.useState(existing?.notes || '');

  async function submit() {
    if (!studentId || !title) return;
    const data = { student_id: studentId, title, level, date, notes: notes || null, tournament_id: tournamentId || null };
    if (existing) data.id = existing.id;
    await onSave(data);
  }

  return (
    <Modal title={existing ? "Edit Achievement" : "Add Achievement"} onClose={onClose} wide>
      <Field label="Student">
        {lockedStudent ? (
          <div className={`${inputCls} flex items-center text-[var(--ack-muted)]`}>
            {displayName(lockedStudent)} ({lockedStudent.admission_id})
          </div>
        ) : (
          <select className={inputCls} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {displayName(s)} ({s.admission_id})
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Competition name">
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. National Karate Championship 2026"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Level">
          <select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <Field label="Notes (optional)">
        <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <details className="mb-3">
        <summary className="text-xs font-semibold cursor-pointer" style={{ color: ROYAL }}>
          Link to a tournament (optional)
        </summary>
        <div className="mt-2">
          <select className={inputCls} value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
            <option value="">— None —</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </details>
      <PrimaryButton onClick={submit} className="w-full" style={{ background: GOLD }}>
        Save Achievement
      </PrimaryButton>
    </Modal>
  );
}

export function TournamentFormModal({ series, existing = undefined, onClose, onSave, onCreateSeries }) {
  const [useNewSeries, setUseNewSeries] = React.useState(!existing && series.length === 0);
  const [seriesId, setSeriesId] = React.useState(existing?.series_id || '');
  const [newSeriesName, setNewSeriesName] = React.useState('');
  const [level, setLevel] = React.useState(existing?.level || 'School');
  const [name, setName] = React.useState(existing?.name || '');
  const [date, setDate] = React.useState(existing?.date || todayISO());
  const [location, setLocation] = React.useState(existing?.location || '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  function applySeriesDefaults(sId, dateVal) {
    const s = series.find((x) => x.id === sId);
    if (s && !existing) {
      setLevel(s.level);
      const year = (dateVal || date || todayISO()).slice(0, 4);
      setName(`${s.name} ${year}`);
    }
  }

  async function submit() {
    setError('');
    let finalSeriesId = seriesId || null;
    setSaving(true);
    try {
      if (useNewSeries) {
        if (!newSeriesName.trim()) {
          setError('Give the series a name (e.g. "Senior School Championship").');
          setSaving(false);
          return;
        }
        const created = await onCreateSeries({ name: newSeriesName.trim(), level });
        finalSeriesId = created?.id || null;
      }
      if (!name.trim()) {
        setError('Give this tournament a name.');
        setSaving(false);
        return;
      }
      const saved = await onSave({
        ...(existing ? { id: existing.id } : {}),
        name: name.trim(),
        level,
        date: date || null,
        location: location || null,
        series_id: finalSeriesId,
      });
      onClose();
      return saved;
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={existing ? 'Edit Tournament' : 'New Tournament'} onClose={onClose} wide>
      <p className="text-xs text-[var(--ack-muted)] mb-3">
        Link this to a series (e.g. "Senior School Championship") so results across years — '26, '27, '28 — can be compared automatically.
      </p>
      <Field label="Series">
        {!useNewSeries ? (
          <select
            className={inputCls}
            value={seriesId}
            onChange={(e) => {
              setSeriesId(e.target.value);
              applySeriesDefaults(e.target.value, date);
            }}
          >
            <option value="">— One-off tournament (no series) —</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={inputCls}
            value={newSeriesName}
            onChange={(e) => setNewSeriesName(e.target.value)}
            placeholder="e.g. Senior School Championship"
          />
        )}
        <button
          type="button"
          onClick={() => {
            setUseNewSeries((v) => !v);
            setSeriesId('');
          }}
          className="text-xs font-semibold mt-1.5"
          style={{ color: ROYAL }}
        >
          {useNewSeries ? '← Choose an existing series instead' : '+ Start a new series'}
        </button>
      </Field>
      <Field label="Tournament name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Senior School Championship 2026"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Level">
          <select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            className={inputCls}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              applySeriesDefaults(seriesId, e.target.value);
            }}
          />
        </Field>
      </div>
      <Field label="Location (optional)">
        <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <PrimaryButton onClick={submit} disabled={saving} className="w-full">
        {saving ? 'Saving…' : existing ? 'Save Changes' : 'Create Tournament'}
      </PrimaryButton>
    </Modal>
  );
}

export function TournamentEventFormModal({ onClose, onSave }) {
  const [category, setCategory] = React.useState('individual');
  const [preset, setPreset] = React.useState(EVENT_PRESETS.individual[0]);
  const [teamSize, setTeamSize] = React.useState<number | string>(3);
  const [dates, setDates] = React.useState([todayISO()]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setPreset(EVENT_PRESETS[category][0]);
  }, [category]);

  function setDateAt(i, v) {
    setDates((ds) => ds.map((d, idx) => (idx === i ? v : d)));
  }
  function addDate() {
    setDates((ds) => [...ds, '']);
  }
  function removeDate(i) {
    setDates((ds) => ds.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setSaving(true);
    try {
      await onSave({ name: preset, category, team_size: category === 'team' ? Number(teamSize) || 3 : null, dates: dates.filter(Boolean) });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Event" onClose={onClose}>
      <Field label="Type">
        <div className="flex gap-2">
          {['individual', 'team'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize border"
              style={
                category === c
                  ? { background: ROYAL, color: '#fff', borderColor: ROYAL }
                  : { borderColor: 'var(--ack-border)', color: 'var(--ack-muted)' }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Event">
        <select className={inputCls} value={preset} onChange={(e) => setPreset(e.target.value)}>
          {EVENT_PRESETS[category].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      {category === 'team' && (
        <Field label="Team size">
          <input type="number" min="2" className={inputCls} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
        </Field>
      )}
      <Field label="Event date(s)">
        <div className="space-y-2">
          {dates.map((d, i) => (
            <div key={i} className="flex gap-2">
              <input type="date" className={`${inputCls} flex-1`} value={d} onChange={(e) => setDateAt(i, e.target.value)} />
              {dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(i)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${DANGER}14` }}
                >
                  <X size={14} color={DANGER} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addDate} className="text-xs font-semibold" style={{ color: ROYAL }}>
            + Add another day
          </button>
        </div>
      </Field>
      <PrimaryButton onClick={submit} disabled={saving} className="w-full">
        {saving ? 'Adding…' : 'Add Event'}
      </PrimaryButton>
    </Modal>
  );
}

export function ResultEntryModal({ student, event, tournament, existing, onClose, onSave, onDelete }) {
  const [placement, setPlacement] = React.useState(existing?.placement || '');
  const [date, setDate] = React.useState(existing?.date || tournament.date || todayISO());
  const [notes, setNotes] = React.useState(existing?.notes || '');
  const [saving, setSaving] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  async function submit() {
    setSaving(true);
    try {
      const title = `${event.name}${placement ? ' — ' + placement : ''}`;
      await onSave({
        ...(existing ? { id: existing.id } : {}),
        student_id: student.id,
        tournament_id: tournament.id,
        event_id: event.id,
        title,
        level: tournament.level,
        date: date || todayISO(),
        notes: notes || null,
        placement: placement || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Result — ${displayName(student)}`} onClose={onClose}>
      <p className="text-xs text-[var(--ack-muted)] mb-3">
        {event.name}
        {event.category === 'team' ? ` (Team of ${event.team_size})` : ''}
      </p>
      <Field label="Placement">
        <select className={inputCls} value={placement} onChange={(e) => setPlacement(e.target.value)}>
          <option value="">— No result yet —</option>
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Notes (optional)">
        <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <PrimaryButton onClick={submit} disabled={saving} className="w-full" style={{ background: GOLD }}>
        {saving ? 'Saving…' : 'Save Result'}
      </PrimaryButton>
      {existing && (
        <button onClick={() => setConfirmDelete(true)} className="w-full mt-2 text-xs font-semibold text-red-600 py-2">
          Remove result
        </button>
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Remove this result?"
          message="This deletes the achievement record for this student's result in this event."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await onDelete(existing.id);
            setConfirmDelete(false);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

export function EventRosterCard({
  event,
  students,
  registrations,
  achievements,
  tournament,
  onRegister,
  onUnregister,
  onSaveResult,
  onDeleteAchievement,
  onDeleteEvent,
  openStudent,
}) {
  const [addingStudentId, setAddingStudentId] = React.useState('');
  const [resultStudent, setResultStudent] = React.useState(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = React.useState(false);

  const roster = rosterForEvent(event.id, registrations, students);
  const registeredIds = new Set(roster.map((r) => r.student.id));
  const available = students.filter((s) => !registeredIds.has(s.id));
  const eventResults = achievements.filter((a) => a.event_id === event.id);
  function findResult(studentId) {
    return eventResults.find((a) => a.student_id === studentId);
  }
  const full = event.category === 'team' && event.team_size && roster.length >= event.team_size;

  async function addPlayer() {
    if (!addingStudentId) return;
    await onRegister({ event_id: event.id, student_id: addingStudentId });
    setAddingStudentId('');
  }

  return (
    <Card className="p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--ack-heading)' }}>
            {event.name}
          </p>
          <p className="text-[11px] text-[var(--ack-muted)]">
            {event.category === 'team'
              ? `Team event · ${roster.length}/${event.team_size || '?'} registered`
              : `Individual · ${roster.length} registered`}
          </p>
          {event.dates && event.dates.length > 0 && <p className="text-[11px] text-[var(--ack-muted)] mt-0.5">{event.dates.join(' · ')}</p>}
        </div>
        <button
          onClick={() => setConfirmDeleteEvent(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${DANGER}14` }}
        >
          <Trash2 size={13} color={DANGER} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {roster.map(({ registration, student }) => {
          const result = findResult(student.id);
          return (
            <div key={registration.id} className="flex items-center gap-2 bg-[var(--ack-surface-2)] rounded-xl p-2.5">
              <Avatar name={displayName(student)} size={30} />
              <button onClick={() => openStudent(student.id)} className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--ack-heading)' }}>
                  {displayName(student)}
                </p>
                {result?.placement && (
                  <span
                    className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: PLACEMENT_STYLE[result.placement].bg, color: PLACEMENT_STYLE[result.placement].fg }}
                  >
                    {result.placement}
                  </span>
                )}
              </button>
              <button
                onClick={() => setResultStudent(student)}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0"
                style={{ background: result ? `${GOLD}1A` : ROYAL, color: result ? GOLD : '#fff' }}
              >
                {result ? 'Edit Result' : 'Add Result'}
              </button>
              <button
                onClick={() => onUnregister(registration.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                title="Remove from roster"
              >
                <X size={12} color="#9CA3AF" />
              </button>
            </div>
          );
        })}
        {roster.length === 0 && (
          <p className="text-xs text-[var(--ack-muted)] text-center py-3">No players registered for this event yet.</p>
        )}
      </div>

      {!full && (
        <div className="flex gap-2">
          <select className={`${inputCls} flex-1`} value={addingStudentId} onChange={(e) => setAddingStudentId(e.target.value)}>
            <option value="">Select a student…</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {displayName(s)}
              </option>
            ))}
          </select>
          <button
            onClick={addPlayer}
            disabled={!addingStudentId}
            className="px-3 rounded-xl text-white text-xs font-semibold disabled:opacity-40"
            style={{ background: ROYAL }}
          >
            Add
          </button>
        </div>
      )}
      {full && (
        <p className="text-[11px] text-[var(--ack-muted)] text-center">
          Team is full ({event.team_size}/{event.team_size}).
        </p>
      )}

      {resultStudent && (
        <ResultEntryModal
          student={resultStudent}
          event={event}
          tournament={tournament}
          existing={findResult(resultStudent.id)}
          onClose={() => setResultStudent(null)}
          onSave={onSaveResult}
          onDelete={onDeleteAchievement}
        />
      )}
      {confirmDeleteEvent && (
        <ConfirmDialog
          title="Delete this event?"
          message={`This removes "${event.name}" along with its roster. Any results already entered will stay on the students' profiles but lose their event link.`}
          onCancel={() => setConfirmDeleteEvent(false)}
          onConfirm={async () => {
            await onDeleteEvent(event.id);
            setConfirmDeleteEvent(false);
          }}
        />
      )}
    </Card>
  );
}

export function TournamentDetailPage({
  tournament,
  thisSeries,
  allSeries,
  students,
  events,
  registrations,
  achievements,
  onAddEvent,
  onDeleteEvent,
  onRegister,
  onUnregister,
  onSaveResult,
  onDeleteAchievement,
  onSaveTournament,
  onDeleteTournament,
  onCreateSeries,
  openStudent,
  openSeries,
}) {
  const [showAddEvent, setShowAddEvent] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const myEvents = events.filter((e) => e.tournament_id === tournament.id);
  const stats = React.useMemo(
    () => tournamentAnalytics(tournament.id, events, registrations, achievements),
    [tournament.id, events, registrations, achievements]
  );
  const medalRows = [
    { label: 'Gold', value: stats.medals.Gold, color: '#D4AF37' },
    { label: 'Silver', value: stats.medals.Silver, color: '#9CA3AF' },
    { label: 'Bronze', value: stats.medals.Bronze, color: '#CD7F32' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            {thisSeries && (
              <button onClick={() => openSeries(thisSeries.id)} className="text-[11px] font-bold mb-1" style={{ color: ROYAL }}>
                {thisSeries.name} ↗
              </button>
            )}
            <h1 className="text-lg font-extrabold" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
              {tournament.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <LevelBadge level={tournament.level} />
              {tournament.date && <span className="text-[11px] text-[var(--ack-muted)]">{tournament.date}</span>}
              {tournament.location && <span className="text-[11px] text-[var(--ack-muted)]">· {tournament.location}</span>}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${ROYAL}14` }}
            >
              <Edit3 size={14} color={ROYAL} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${DANGER}14` }}
            >
              <Trash2 size={14} color={DANGER} />
            </button>
          </div>
        </div>
      </Card>

      <p className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: 'var(--ack-heading)' }}>
        <PieChartIcon size={15} color={ROYAL} /> Tournament Analytics
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Users} label="Participants" value={stats.participants} tint={ROYAL} />
        <StatCard icon={Trophy} label="Results Logged" value={stats.results} tint={GOLD} />
        <StatCard icon={Medal} label="Medals" value={stats.medals.Gold + stats.medals.Silver + stats.medals.Bronze} tint="#D4AF37" />
        <StatCard icon={Calendar} label="Events" value={stats.events} tint={NAVY} />
      </div>

      <Card className="p-4 mb-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ack-heading)' }}>
          Medal Breakdown
        </h2>
        {stats.results === 0 ? (
          <p className="text-xs text-[var(--ack-muted)] text-center py-6">No results entered yet.</p>
        ) : (
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <DonutChart
              segments={medalRows.map((r) => ({ key: r.label, value: r.value, color: r.color }))}
              centerLabel={String(stats.medals.Gold + stats.medals.Silver + stats.medals.Bronze)}
              centerSub="medals"
            />
            <div className="space-y-2.5">
              {medalRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                  <span className="font-semibold w-14" style={{ color: 'var(--ack-heading)' }}>
                    {row.label}
                  </span>
                  <span className="text-[var(--ack-muted)]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {stats.byEvent.length > 0 && (
        <Card className="overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-[var(--ack-border)]">
            <span className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
              Performance by Event
            </span>
          </div>
          <div className="divide-y divide-[var(--ack-border)]">
            {stats.byEvent.map((row) => (
              <div key={row.event.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                    {row.event.name}
                  </p>
                  <p className="text-[11px] text-[var(--ack-muted)]">
                    {row.registered} registered · {row.results} results
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
                  <span style={{ color: '#B8860B' }}>{row.medals.Gold}G</span>
                  <span style={{ color: '#6B7280' }}>{row.medals.Silver}S</span>
                  <span style={{ color: '#B4622A' }}>{row.medals.Bronze}B</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
          Events & Roster
        </p>
        <button onClick={() => setShowAddEvent(true)} className="text-xs font-semibold flex items-center gap-1" style={{ color: ROYAL }}>
          <Plus size={13} /> Add Event
        </button>
      </div>
      {myEvents.map((event) => (
        <EventRosterCard
          key={event.id}
          event={event}
          students={students}
          registrations={registrations}
          achievements={achievements}
          tournament={tournament}
          onRegister={onRegister}
          onUnregister={onUnregister}
          onSaveResult={onSaveResult}
          onDeleteAchievement={onDeleteAchievement}
          onDeleteEvent={onDeleteEvent}
          openStudent={openStudent}
        />
      ))}
      {myEvents.length === 0 && (
        <p className="text-xs text-[var(--ack-muted)] text-center py-6">
          No events yet — add Kata, Kumite, or a team event to start building the roster.
        </p>
      )}

      {showAddEvent && (
        <TournamentEventFormModal
          onClose={() => setShowAddEvent(false)}
          onSave={(e) => onAddEvent({ ...e, tournament_id: tournament.id })}
        />
      )}
      {showEdit && (
        <TournamentFormModal
          series={allSeries}
          existing={tournament}
          onCreateSeries={onCreateSeries}
          onClose={() => setShowEdit(false)}
          onSave={onSaveTournament}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete this tournament?"
          message="This removes the tournament, its events, and its roster. Results already recorded on student profiles stay, but lose their tournament/event link."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await onDeleteTournament(tournament.id);
            setConfirmDelete(false);
          }}
        />
      )}
    </div>
  );
}

export function SeriesDetailPage({ series, tournaments, events, registrations, achievements, openTournament }) {
  const rows = React.useMemo(
    () => seriesYearlyStats(series.id, tournaments, events, registrations, achievements),
    [series.id, tournaments, events, registrations, achievements]
  );

  function yearLabel(t) {
    return (t.date || '').slice(0, 4) || t.name;
  }
  const medalsSeries = rows.map((r) => ({
    label: yearLabel(r.tournament),
    rate: r.medals.Gold + r.medals.Silver + r.medals.Bronze,
    total: 1,
  }));
  const participantsSeries = rows.map((r) => ({ label: yearLabel(r.tournament), rate: r.participants, total: 1 }));
  const maxMedals = Math.max(5, ...medalsSeries.map((d) => d.rate));
  const maxParticipants = Math.max(5, ...participantsSeries.map((d) => d.rate));

  const totalGold = rows.reduce((s, r) => s + r.medals.Gold, 0);
  const totalSilver = rows.reduce((s, r) => s + r.medals.Silver, 0);
  const totalBronze = rows.reduce((s, r) => s + r.medals.Bronze, 0);
  const bestYear = rows.length
    ? [...rows].sort((a, b) => b.medals.Gold + b.medals.Silver + b.medals.Bronze - (a.medals.Gold + a.medals.Silver + a.medals.Bronze))[0]
    : null;

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <h1
        className="text-xl font-extrabold mb-1 flex items-center gap-2"
        style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}
      >
        <Medal size={20} color={GOLD} /> {series.name}
      </h1>
      <p className="text-xs text-[var(--ack-muted)] mb-4">
        {rows.length} edition{rows.length === 1 ? '' : 's'} tracked · Year-over-year performance
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Trophy} label="Total Gold" value={totalGold} tint="#D4AF37" />
        <StatCard icon={Medal} label="Total Silver" value={totalSilver} tint="#9CA3AF" />
        <StatCard icon={Award} label="Total Bronze" value={totalBronze} tint="#CD7F32" />
        <StatCard icon={TrendingUp} label="Best Year" value={bestYear ? yearLabel(bestYear.tournament) : '—'} tint={ROYAL} />
      </div>

      <Card className="p-4 mb-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ack-heading)' }}>
          Medals by Year
        </h2>
        <TrendBarChart data={medalsSeries} color={GOLD} suffix="" maxValue={maxMedals} barMinWidth={60} />
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ack-heading)' }}>
          Participants by Year
        </h2>
        <TrendBarChart data={participantsSeries} color={ROYAL} suffix="" maxValue={maxParticipants} barMinWidth={60} />
      </Card>

      <Card className="overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[var(--ack-border)]">
          <span className="font-bold text-sm" style={{ color: 'var(--ack-heading)' }}>
            By Edition
          </span>
        </div>
        <div className="divide-y divide-[var(--ack-border)]">
          {rows.map((r) => (
            <button
              key={r.tournament.id}
              onClick={() => openTournament(r.tournament.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                  {r.tournament.name}
                </p>
                <p className="text-[11px] text-[var(--ack-muted)]">
                  {r.tournament.date || 'No date set'} · {r.participants} competed
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
                <span style={{ color: '#B8860B' }}>{r.medals.Gold}G</span>
                <span style={{ color: '#6B7280' }}>{r.medals.Silver}S</span>
                <span style={{ color: '#B4622A' }}>{r.medals.Bronze}B</span>
              </div>
            </button>
          ))}
          {rows.length === 0 && (
            <p className="p-4 text-sm text-[var(--ack-muted)] text-center">No tournaments recorded for this series yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export function AchievementsView({
  tournaments,
  tournamentSeries,
  achievements,
  onAddTournament,
  onCreateSeries,
  autoOpenAdd,
  onConsumeAutoOpen,
  openTournament,
  openSeries,
}) {
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    if (autoOpenAdd) {
      setShowAdd(true);
      onConsumeAutoOpen();
    }
  }, [autoOpenAdd, onConsumeAutoOpen]);

  const sortedTournaments = [...tournaments].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  function medalsFor(tId) {
    const recs = achievements.filter((a) => a.tournament_id === tId);
    return {
      Gold: recs.filter((a) => a.placement === 'Gold').length,
      Silver: recs.filter((a) => a.placement === 'Silver').length,
      Bronze: recs.filter((a) => a.placement === 'Bronze').length,
    };
  }
  function seriesFor(t) {
    return tournamentSeries.find((s) => s.id === t.series_id);
  }
  const seriesWithCounts = tournamentSeries
    .map((s) => ({ series: s, count: tournaments.filter((t) => t.series_id === s.id).length }))
    .filter((x) => x.count > 0);

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <h1 className="text-xl font-extrabold mb-4" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
        Tournaments
      </h1>

      {seriesWithCounts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--ack-muted)' }}>
            Recurring Series
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {seriesWithCounts.map(({ series, count }) => (
              <button
                key={series.id}
                onClick={() => openSeries(series.id)}
                className="shrink-0 px-3.5 py-2 rounded-xl text-left"
                style={{ background: `${ROYAL}0F` }}
              >
                <p className="text-xs font-bold" style={{ color: ROYAL }}>
                  {series.name}
                </p>
                <p className="text-[10px] text-[var(--ack-muted)]">
                  {count} edition{count === 1 ? '' : 's'} · view trends
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="w-full mb-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
        style={{ background: GOLD }}
      >
        <Plus size={16} /> New Tournament
      </button>

      <div className="space-y-3">
        {sortedTournaments.map((t) => {
          const m = medalsFor(t.id);
          const s = seriesFor(t);
          return (
            <button key={t.id} onClick={() => openTournament(t.id)} className="w-full text-left">
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    {s && (
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ROYAL }}>
                        {s.name}
                      </p>
                    )}
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--ack-heading)' }}>
                      {t.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <LevelBadge level={t.level} />
                      <span className="text-[11px] text-[var(--ack-muted)]">{t.date || 'No date'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
                    <span style={{ color: '#B8860B' }}>{m.Gold}G</span>
                    <span style={{ color: '#6B7280' }}>{m.Silver}S</span>
                    <span style={{ color: '#B4622A' }}>{m.Bronze}B</span>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
        {sortedTournaments.length === 0 && (
          <p className="text-sm text-[var(--ack-muted)] py-10 text-center">
            No tournaments recorded yet — add one to start building rosters and tracking results.
          </p>
        )}
      </div>

      {showAdd && (
        <TournamentFormModal
          series={tournamentSeries}
          onCreateSeries={onCreateSeries}
          onClose={() => setShowAdd(false)}
          onSave={async (t) => {
            const created = await onAddTournament(t);
            if (created?.id) openTournament(created.id);
          }}
        />
      )}
    </div>
  );
}
