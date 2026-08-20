import React from 'react';
import { RefreshCw, Trash2, Shield } from '../icons';
import { Avatar, PrimaryButton, Field, inputCls, Modal, ConfirmDialog } from '../components/ui';
import { useToast } from '../components/Toast';
import { ROYAL, DANGER, WARNING } from '../lib/theme';

interface UserManagementPanelProps {
  profiles: any[];
  userPermissions: any[];
  onCreate: (data: any) => Promise<void>;
  onResetPassword: (userId: string) => Promise<string>;
  onDeleteUser: (userId: string) => Promise<void>;
  onUpdatePermissions: (userId: string, permissions: any) => Promise<void>;
  onClose: () => void;
}

export function UserManagementPanel({
  profiles,
  userPermissions,
  onCreate,
  onResetPassword,
  onDeleteUser,
  onUpdatePermissions,
  onClose,
}: UserManagementPanelProps) {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<'coach' | 'captain' | 'senior_player'>('coach');
  const [permissions, setPermissions] = React.useState({
    can_mark_attendance: false,
    can_manage_students: false,
    can_add_achievements: false,
    can_register_tournaments: false,
    can_promote_belts: false,
  });
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const { showToast, ToastComponent } = useToast();

  const [confirmDeleteTarget, setConfirmDeleteTarget] = React.useState<any>(null);
  const [confirmResetTarget, setConfirmResetTarget] = React.useState<any>(null);
  const [editingPermissionsFor, setEditingPermissionsFor] = React.useState<any>(null);

  const staffUsers = profiles.filter((p) => ['coach', 'captain', 'senior_player'].includes(p.role));

  async function submit() {
    if (!email || !name) {
      setError('Email and name are required.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await onCreate({
        email: email.trim(),
        password: '000000',
        name,
        role,
        permissions: role === 'senior_player' ? { ...permissions } : undefined,
      });

      showToast(`Account created — email: ${email}, temp password: 000000`);

      setEmail('');
      setName('');
      setRole('coach');
      setPermissions({
        can_mark_attendance: false,
        can_manage_students: false,
        can_add_achievements: false,
        can_register_tournaments: false,
        can_promote_belts: false,
      });
    } catch (e: any) {
      setError(e.message || 'Could not create account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="User Management" onClose={onClose} wide>
      {ToastComponent}

      {/* Create New User Form */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--ack-surface-2)' }}>
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--ack-heading)' }}>
          Create New User
        </h3>

        <Field label="Email (Gmail)">
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@gmail.com"
          />
        </Field>

        <Field label="Full Name">
          <input type="text" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
        </Field>

        <Field label="Role">
          <div className="flex gap-2">
            {[
              { value: 'coach', label: 'Coach' },
              { value: 'captain', label: 'Captain' },
              { value: 'senior_player', label: 'Senior Player' },
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value as any)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                  role === r.value
                    ? 'text-white'
                    : 'bg-[var(--ack-surface-1)] text-[var(--ack-muted)]'
                }`}
                style={role === r.value ? { background: ROYAL } : {}}
              >
                {r.label}
              </button>
            ))}
          </div>
        </Field>

        {role === 'senior_player' && (
          <div className="mb-3 p-3 rounded-xl" style={{ background: 'var(--ack-surface-1)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--ack-heading)' }}>Initial Permissions</p>
            <p className="text-[11px] text-[var(--ack-muted)] mb-2">All off by default — enable what this senior player can do.</p>
            {[
              { key: 'can_mark_attendance', label: 'Mark Attendance' },
              { key: 'can_manage_students', label: 'Manage Students' },
              { key: 'can_add_achievements', label: 'Log Achievements' },
              { key: 'can_register_tournaments', label: 'Manage Tournaments' },
              { key: 'can_promote_belts', label: 'Promote Belts' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-[var(--ack-text)]">{label}</span>
                <button
                  onClick={() => setPermissions((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className="w-9 h-5 rounded-full relative transition"
                  style={{ background: permissions[key as keyof typeof permissions] ? ROYAL : '#9CA3AF' }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: permissions[key as keyof typeof permissions] ? 18 : 2 }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

        <PrimaryButton onClick={submit} disabled={busy || !email || !name} className="w-full mt-3">
          {busy ? 'Creating...' : 'Generate Account & Password'}
        </PrimaryButton>
      </div>

      {/* List Existing Users */}
      <div>
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--ack-heading)' }}>
          Existing Users ({staffUsers.length})
        </h3>
        <div className="space-y-2">
          {staffUsers.map((user) => (
            <div key={user.id} className="p-3 rounded-xl" style={{ background: 'var(--ack-surface-2)' }}>
              <div className="flex items-start gap-3">
                <Avatar name={user.name} photo={user.avatar_url} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--ack-heading)' }}>
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[var(--ack-muted)] truncate">
                    {user.role === 'captain' ? 'Captain' : user.role === 'senior_player' ? 'Senior Player' : 'Coach'} • {user.email || 'No email'}
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => setConfirmResetTarget(user)}
                      disabled={busy}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: `${WARNING}14`, color: WARNING }}
                    >
                      <RefreshCw size={12} className="inline mr-1" />
                      Reset Password
                    </button>
                    {user.role === 'senior_player' && (
                      <button
                        onClick={() => setEditingPermissionsFor(user)}
                        disabled={busy}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                        style={{ background: `${ROYAL}14`, color: ROYAL }}
                      >
                        <Shield size={12} className="inline mr-1" />
                        Permissions
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteTarget(user)}
                      disabled={busy}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: `${DANGER}14`, color: DANGER }}
                    >
                      <Trash2 size={12} className="inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirm dialog */}
      {confirmDeleteTarget && (
        <ConfirmDialog
          title="Delete this user?"
          message={`Permanently delete ${confirmDeleteTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDeleteTarget(null)}
          onConfirm={async () => {
            try {
              await onDeleteUser(confirmDeleteTarget.id);
              showToast('User deleted successfully');
            } catch (e: any) {
              showToast('Error: ' + (e.message || 'Could not delete user.'));
            } finally {
              setConfirmDeleteTarget(null);
            }
          }}
        />
      )}

      {/* Reset password confirm dialog */}
      {confirmResetTarget && (
        <ConfirmDialog
          title="Reset password?"
          message={`Reset password for ${confirmResetTarget.name} to "000000"?`}
          confirmLabel="Reset"
          onCancel={() => setConfirmResetTarget(null)}
          onConfirm={async () => {
            try {
              const newPw = await onResetPassword(confirmResetTarget.id);
              showToast(`Password reset — new temporary password: ${newPw}`);
            } catch (e: any) {
              showToast('Error: ' + (e.message || 'Could not reset password.'));
            } finally {
              setConfirmResetTarget(null);
            }
          }}
        />
      )}

      {/* Edit permissions modal */}
      {editingPermissionsFor && (
        <EditPermissionsModal
          user={editingPermissionsFor}
          userPermissions={userPermissions}
          onSave={onUpdatePermissions}
          onClose={() => setEditingPermissionsFor(null)}
        />
      )}
    </Modal>
  );
}

function EditPermissionsModal({
  user,
  userPermissions,
  onSave,
  onClose,
}: {
  user: any;
  userPermissions: any[];
  onSave: (id: string, p: any) => Promise<void>;
  onClose: () => void;
}) {
  const existing = userPermissions.find((p) => p.user_id === user.id) || {};
  const [perms, setPerms] = React.useState({
    can_mark_attendance: existing.can_mark_attendance ?? false,
    can_manage_students: existing.can_manage_students ?? false,
    can_add_achievements: existing.can_add_achievements ?? false,
    can_register_tournaments: existing.can_register_tournaments ?? false,
    can_promote_belts: existing.can_promote_belts ?? false,
  });
  const [saving, setSaving] = React.useState(false);

  const PERM_LABELS = [
    { key: 'can_mark_attendance', label: 'Mark Attendance', desc: 'Can mark students present / late / absent' },
    { key: 'can_manage_students', label: 'Manage Students', desc: 'Can add, edit, and remove students' },
    { key: 'can_add_achievements', label: 'Log Achievements', desc: 'Can record tournament results and achievements' },
    { key: 'can_register_tournaments', label: 'Manage Tournaments', desc: 'Can create and edit tournaments and series' },
    { key: 'can_promote_belts', label: 'Promote Belts', desc: "Can change a student's belt grade" },
  ];

  async function save() {
    setSaving(true);
    try {
      await onSave(user.id, perms);
      onClose();
    } catch (_e) {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Permissions — ${user.name}`} onClose={onClose}>
      <p className="text-xs text-[var(--ack-muted)] mb-4">
        Control what this senior player can do. Disabled = view only.
      </p>
      <div className="space-y-2 mb-5">
        {PERM_LABELS.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 p-3 rounded-xl"
            style={{ background: 'var(--ack-surface-2)' }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--ack-heading)' }}>{label}</p>
              <p className="text-[11px] text-[var(--ack-muted)]">{desc}</p>
            </div>
            <button
              onClick={() => setPerms((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              className="w-11 h-6 rounded-full relative transition shrink-0"
              style={{ background: perms[key as keyof typeof perms] ? ROYAL : '#9CA3AF' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: perms[key as keyof typeof perms] ? 22 : 2 }}
              />
            </button>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={save} disabled={saving} className="w-full">
        {saving ? 'Saving…' : 'Save Permissions'}
      </PrimaryButton>
    </Modal>
  );
}
