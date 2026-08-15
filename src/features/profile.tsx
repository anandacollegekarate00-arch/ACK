import React from 'react';
import { Users, Bell, Edit3, Mail, Phone, KeyRound, Moon, LogOut } from '../icons';
import { Avatar, Card, PrimaryButton, Field, inputCls, Modal } from '../components/ui';
import { ROYAL, DANGER, WARNING } from '../lib/theme';
import { displayName } from '../lib/identity';
import { StudentProfilePage } from './/students';

export function EditProfileModal({ profile, onClose, onSave }) {
  const [name, setName] = React.useState(profile.name || '');
  const [position, setPosition] = React.useState(profile.position || '');
  const [phone, setPhone] = React.useState(profile.phone || '');
  const [photo, setPhoto] = React.useState(profile.avatar_url || '');
  const [error, setError] = React.useState('');

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale,
          h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        setPhoto(canvas.toDataURL('image/jpeg', 0.85));
        setError('');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    await onSave({ name: name.trim(), position, phone, avatar_url: photo });
  }

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <Avatar name={name || profile.name} photo={photo} size={84} />
          <label
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow cursor-pointer"
            style={{ background: ROYAL }}
          >
            <Edit3 size={14} color="#fff" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
        <p className="text-[11px] text-[var(--ack-muted)] mt-2">Tap the icon to change your photo</p>
      </div>
      <Field label="Full name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Position / title">
        <input
          className={inputCls}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="e.g. Head Coach, Assistant Coach, Captain"
        />
      </Field>
      <Field label="Phone">
        <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <PrimaryButton onClick={submit} className="w-full">
        Save Profile
      </PrimaryButton>
    </Modal>
  );
}

export function ChangePasswordModal({ supabaseClient, onClose, required = false }) {
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);

  async function submit() {
    if (newPw.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setError("Passwords don't match.");
      return;
    }
    const { error: err } = await supabaseClient.auth.updateUser({ password: newPw });
    if (err) {
      setError(err.message);
      return;
    }
    // Clear the forced-change flag so this isn't asked again next sign-in.
    const { data: sess } = await supabaseClient.auth.getSession();
    if (sess?.session?.user?.user_metadata?.must_change_password) {
      await supabaseClient.auth.updateUser({ data: { must_change_password: false } });
    }
    setDone(true);
  }

  return (
    <Modal title={required ? 'Set a New Password' : 'Change Password'} onClose={onClose} required={required}>
      {done ? (
        <p className="text-sm text-[var(--ack-text)]">Password updated. {required ? 'You can now continue.' : ''}</p>
      ) : (
        <>
          {required && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
              For your security, the one-time password issued by your coach must be replaced with one you choose. This is required before
              you can continue.
            </p>
          )}
          <Field label="New password">
            <input type="password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <input type="password" className={inputCls} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </Field>
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <PrimaryButton onClick={submit} className="w-full">
            Update Password
          </PrimaryButton>
        </>
      )}
    </Modal>
  );
}

export function CreateParentLoginModal({ student, onClose, onCreate }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [generatedPassword, setGeneratedPassword] = React.useState('');
  const phone = student.guardian_whatsapp || '';
  const digits = phone.replace(/\D/g, '');

  async function submit() {
    if (!digits) {
      setError('Add a WhatsApp number for this student first, via Edit → Guardian Information.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // onCreate returns the one-time password the DB generated for the parent
      const pwd = await onCreate({ phone, studentId: student.id, name: `${displayName(student)}'s guardian` });
      setGeneratedPassword(pwd || '');
      setDone(true);
    } catch (e) {
      setError(e.message || 'Could not create that login.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Create Parent Login" onClose={onClose}>
      {done ? (
        <div>
          <p className="text-sm text-[var(--ack-text)] mb-2">Login created. Share these with the parent:</p>
          <div className="bg-[var(--ack-surface-2)] rounded-xl p-3 text-xs space-y-1 mb-3">
            <p>
              Login ID (WhatsApp number): <span className="font-bold">{phone}</span>
            </p>
            <p>
              One-time password: <span className="font-bold">{generatedPassword || '—'}</span>
            </p>
          </div>
          <p className="text-xs text-[var(--ack-muted)]">
            This password is random and shown only once. The parent must change it on first sign-in — the app will ask them automatically.
            You can generate a new one from the Parent Logins panel anytime.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--ack-muted)] mb-3">
            Creates a read-only login for {displayName(student)}'s parent, using their WhatsApp number as the login ID. A random one-time
            password is generated and shown once — the parent must change it after their first sign-in.
          </p>
          <div className="bg-[var(--ack-surface-2)] rounded-xl p-3 text-xs mb-3">
            <p className="text-[var(--ack-muted)]">WhatsApp number on file</p>
            <p className="font-bold" style={{ color: 'var(--ack-heading)' }}>
              {phone || '— not set —'}
            </p>
          </div>
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <PrimaryButton onClick={submit} disabled={busy} className="w-full">
            {busy ? 'Creating…' : 'Create Login'}
          </PrimaryButton>
        </>
      )}
    </Modal>
  );
}

export function ResetParentPasswordDialog({ parentProfile, onClose, onReset }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      setNewPassword((await onReset(parentProfile.id)) || '');
      setDone(true);
    } catch (e) {
      setError(e.message || 'Could not reset that password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Reset Parent Password" onClose={onClose}>
      {done ? (
        <div>
          <p className="text-sm text-[var(--ack-text)] mb-2">Password reset. Share this new one-time password with the parent:</p>
          <div className="bg-[var(--ack-surface-2)] rounded-xl p-3 text-xs mb-3">
            <p>
              New password: <span className="font-bold">{newPassword || '—'}</span>
            </p>
          </div>
          <p className="text-xs text-[var(--ack-muted)]">
            It's random and shown only once. The app will ask the parent to change it at their next sign-in.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--ack-muted)] mb-3">
            This generates a new random one-time password for <span className="font-semibold">{parentProfile.name}</span>. It will be shown
            once, right here — share it with the parent.
          </p>
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <PrimaryButton onClick={confirm} disabled={busy} className="w-full" style={{ background: WARNING }}>
            {busy ? 'Resetting…' : 'Reset Password'}
          </PrimaryButton>
        </>
      )}
    </Modal>
  );
}

export function ParentAccountsPanel({ students, profiles, onCreate, onResetPassword, onClose }) {
  const [studentId, setStudentId] = React.useState(students[0]?.id ?? '');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [resetTarget, setResetTarget] = React.useState(null);
  const parentProfiles = profiles.filter((p) => p.role === 'parent');

  function studentName(id) {
    return displayName(students.find((s) => s.id === id)) || 'Unknown';
  }

  async function submit() {
    if (!studentId || !email || !password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const student = students.find((s) => s.id === studentId);
      await onCreate({ email: email.trim(), password, studentId, name: `${student ? displayName(student) : ''}'s guardian` });
      setEmail('');
      setPassword('');
    } catch (e) {
      setError(e.message || 'Could not create that account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Parent Logins" onClose={onClose} wide>
      <p className="text-xs text-[var(--ack-muted)] mb-3">
        Create a login for a parent, tied to their child — a student can have more than one (e.g. both parents). Parents can only view their
        own child, read-only. Share the password with them directly — they can change it after logging in. To create a login by WhatsApp
        number instead, use the "Create Parent Login" button on the student's own profile.
      </p>
      <Field label="Student">
        <select className={inputCls} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {displayName(s)} ({s.admission_id})
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Parent's email">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Temporary password">
          <input className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <PrimaryButton onClick={submit} disabled={busy} className="w-full mb-4">
        {busy ? 'Creating…' : 'Create parent login'}
      </PrimaryButton>
      <div className="space-y-2">
        {parentProfiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-[var(--ack-surface-2)] rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>
                {p.name}
              </p>
              <p className="text-[11px] text-[var(--ack-muted)]">Linked to {studentName(p.student_id)}</p>
            </div>
            <button
              onClick={() => setResetTarget(p)}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shrink-0"
              style={{ background: `${WARNING}14`, color: WARNING }}
            >
              Reset Password
            </button>
          </div>
        ))}
        {parentProfiles.length === 0 && <p className="text-xs text-[var(--ack-muted)] text-center py-4">No parent logins created yet.</p>}
      </div>
      {resetTarget && (
        <ResetParentPasswordDialog parentProfile={resetTarget} onClose={() => setResetTarget(null)} onReset={onResetPassword} />
      )}
    </Modal>
  );
}

export function ProfileView({
  profile,
  user,
  students,
  profiles,
  onSignOut,
  onUpdateProfile,
  onCreateParentAccount,
  onResetParentPassword,
  darkMode,
  onToggleDarkMode,
  push,
  supabaseClient,
}) {
  const [notifOn, setNotifOn] = React.useState(true);
  const [showPwModal, setShowPwModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showParentPanel, setShowParentPanel] = React.useState(false);

  return (
    <div className="p-4 sm:p-6 max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-24 sm:pb-6">
      <h1 className="text-xl font-extrabold mb-4" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
        My Profile
      </h1>
      <Card className="p-5 mb-4 flex flex-col items-center text-center relative">
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full"
          style={{ background: `${ROYAL}14`, color: ROYAL }}
        >
          <Edit3 size={12} /> Edit
        </button>
        <Avatar name={profile.name || user.email} photo={profile.avatar_url} size={72} />
        <p className="font-extrabold text-base mt-3" style={{ color: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}>
          {profile.name || user.email}
        </p>
        <p className="text-xs text-[var(--ack-muted)]">{profile.position || (profile.role === 'captain' ? 'Club Captain' : 'Coach')}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs text-[var(--ack-muted)]">
          <span className="flex items-center gap-1 break-all">
            <Mail size={12} />
            {user.email}
          </span>
          {profile.phone && (
            <span className="flex items-center gap-1">
              <Phone size={12} />
              {profile.phone}
            </span>
          )}
        </div>
        <span className="mt-3 text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${ROYAL}1A`, color: ROYAL }}>
          {profile.role === 'captain' ? 'Captain' : 'Coach'}
        </span>
      </Card>

      <Card className="divide-y divide-[var(--ack-border)] mb-4">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-2 text-sm text-[var(--ack-text)]">
            <Moon size={16} color="var(--ack-heading)" />
            Dark Mode
          </span>
          <button
            onClick={onToggleDarkMode}
            className="w-11 h-6 rounded-full relative transition"
            style={{ background: darkMode ? ROYAL : '#E5E7EB' }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: darkMode ? 22 : 2 }} />
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <button onClick={() => push('notifications')} className="flex items-center gap-2 text-sm text-[var(--ack-text)]">
            <Bell size={16} color="var(--ack-heading)" />
            Notifications
          </button>
          <button
            onClick={() => setNotifOn((v) => !v)}
            className="w-11 h-6 rounded-full relative transition"
            style={{ background: notifOn ? ROYAL : darkMode ? 'var(--ack-border)' : '#E5E7EB' }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: notifOn ? 22 : 2 }} />
          </button>
        </div>
        <button onClick={() => setShowPwModal(true)} className="w-full flex items-center gap-2 px-4 py-3.5 text-sm text-[var(--ack-text)]">
          <KeyRound size={16} color="var(--ack-heading)" />
          Account Security
        </button>
        <button
          onClick={() => setShowParentPanel(true)}
          className="w-full flex items-center gap-2 px-4 py-3.5 text-sm text-[var(--ack-text)]"
        >
          <Users size={16} color="var(--ack-heading)" />
          Parent Logins
        </button>
      </Card>

      <button
        onClick={onSignOut}
        className="w-full py-3 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2"
        style={{ borderColor: DANGER, color: DANGER }}
      >
        <LogOut size={16} /> Logout
      </button>

      {showPwModal && <ChangePasswordModal supabaseClient={supabaseClient} onClose={() => setShowPwModal(false)} />}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={async (patch) => {
            await onUpdateProfile(patch);
            setShowEditModal(false);
          }}
        />
      )}
      {showParentPanel && (
        <ParentAccountsPanel
          students={students}
          profiles={profiles}
          onCreate={onCreateParentAccount}
          onResetPassword={onResetParentPassword}
          onClose={() => setShowParentPanel(false)}
        />
      )}
    </div>
  );
}

export function ParentView({
  profile,
  students,
  attendance,
  achievements,
  tournaments,
  tournamentSeries,
  tournamentEvents,
  eventRegistrations,
  onSignOut,
}) {
  const student = students.find((s) => s.id === profile.student_id);
  return (
    <div className="min-h-dvh bg-[var(--ack-bg)]">
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 sticky top-0 z-30"
        style={{
          background: 'linear-gradient(90deg,#0B1F3A 0%,#0B2A5B 100%)',
          boxShadow: '0 8px 28px rgba(11,31,58,.3)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logos/crest.png" alt="Ananda College crest" className="w-6 h-6 object-contain shrink-0" draggable={false} />
          <span className="text-white font-bold text-sm truncate">Welcome, {profile.name}</span>
        </div>
        <button onClick={onSignOut} className="shrink-0">
          <LogOut size={18} color="#fff" />
        </button>
      </div>
      {student ? (
        <StudentProfilePage
          student={student}
          attendance={attendance}
          achievements={achievements}
          tournaments={tournaments}
          tournamentSeries={tournamentSeries}
          tournamentEvents={tournamentEvents}
          eventRegistrations={eventRegistrations}
          readOnly
        />
      ) : (
        <p className="p-6 text-sm text-gray-400">No student is linked to this account. Please contact a coach.</p>
      )}
    </div>
  );
}
