import React from 'react';
import { Shield, X, RefreshCw, Trash2 } from '../icons';
import { Avatar, Card, PrimaryButton, Field, inputCls, Modal } from '../components/ui';
import { useToast } from '../components/Toast';
import { ROYAL, DANGER, WARNING } from '../lib/theme';
import { UserPermissions } from '../types';

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface UserManagementPanelProps {
  profiles: any[];
  userPermissions: UserPermissions[];
  onCreate: (data: any) => Promise<void>;
  onUpdatePermissions: (userId: string, permissions: any) => Promise<void>;
  onResetPassword: (userId: string) => Promise<string>;
  onDeleteUser: (userId: string) => Promise<void>;
  onClose: () => void;
}

export function UserManagementPanel({
  profiles,
  userPermissions,
  onCreate,
  onUpdatePermissions,
  onResetPassword,
  onDeleteUser,
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
  const [editingUser, setEditingUser] = React.useState<any>(null);
  const { showToast, ToastComponent } = useToast();

  const staffUsers = profiles.filter((p) => ['coach', 'captain', 'senior_player'].includes(p.role));

  function getUserPermissions(userId: string) {
    return userPermissions.find((p) => p.user_id === userId);
  }

  async function submit() {
    if (!email || !name) {
      setError('Email and name are required.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const tempPassword = generateTempPassword();

      await onCreate({
        email: email.trim(),
        password: tempPassword,
        name,
        role,
        permissions: role === 'senior_player' ? permissions : null,
      });

      // Show success with temp password
      alert(
        `Account Created Successfully!\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nThe user must change this password on first login.`
      );

      showToast('User account created successfully');

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

  async function handleEditPermissions(user: any) {
    const userPerms = getUserPermissions(user.id);
    if (userPerms) {
      setEditingUser({ ...user, permissions: userPerms });
    }
  }

  async function handleSavePermissions() {
    if (!editingUser) return;

    setBusy(true);
    try {
      await onUpdatePermissions(editingUser.id, editingUser.permissions);
      showToast('Permissions updated successfully');
      setEditingUser(null);
    } catch (e: any) {
      setError(e.message || 'Could not update permissions.');
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(user: any) {
    if (!confirm(`Reset password for ${user.name}?`)) return;

    setBusy(true);
    try {
      const newPassword = await onResetPassword(user.id);
      alert(`New Password for ${user.name}:\n\n${newPassword}\n\nThey must change this on next login.`);
      showToast('Password reset successfully');
    } catch (e: any) {
      alert('Error: ' + (e.message || 'Could not reset password.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteUser(user: any) {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;

    setBusy(true);
    try {
      await onDeleteUser(user.id);
      showToast('User deleted successfully');
    } catch (e: any) {
      alert('Error: ' + (e.message || 'Could not delete user.'));
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

        {/* Senior Player Permissions */}
        {role === 'senior_player' && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--ack-bg)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ack-heading)' }}>
              Grant Permissions:
            </p>
            {Object.keys(permissions).map((key) => (
              <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions[key as keyof typeof permissions]}
                  onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                  className="accent-[#1F5EFF]"
                />
                <span className="text-xs text-[var(--ack-text)]">
                  {key
                    .replace('can_', '')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </label>
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
          {staffUsers.map((user) => {
            const userPerms = getUserPermissions(user.id);
            const isSeniorPlayer = user.role === 'senior_player';

            return (
              <div key={user.id} className="p-3 rounded-xl" style={{ background: 'var(--ack-surface-2)' }}>
                <div className="flex items-start gap-3">
                  <Avatar name={user.name} photo={user.avatar_url} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--ack-heading)' }}>
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[var(--ack-muted)] truncate">
                      {user.role === 'captain' ? 'Captain' : user.role === 'coach' ? 'Coach' : 'Senior Player'} •{' '}
                      {user.email || 'No email'}
                    </p>

                    {/* Show permissions for senior players */}
                    {isSeniorPlayer && userPerms && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(userPerms)
                          .filter(([key, value]) => key.startsWith('can_') && value === true)
                          .map(([key]) => (
                            <span
                              key={key}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: `${ROYAL}14`, color: ROYAL }}
                            >
                              {key.replace('can_', '').replace(/_/g, ' ')}
                            </span>
                          ))}
                        {Object.values(userPerms).filter((v) => v === true).length === 0 && (
                          <span className="text-[9px] text-[var(--ack-muted)]">View Only</span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-2">
                      {isSeniorPlayer && (
                        <button
                          onClick={() => handleEditPermissions(user)}
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                          style={{ background: `${ROYAL}14`, color: ROYAL }}
                        >
                          <Shield size={12} className="inline mr-1" />
                          Edit Permissions
                        </button>
                      )}
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={busy}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                        style={{ background: `${WARNING}14`, color: WARNING }}
                      >
                        <RefreshCw size={12} className="inline mr-1" />
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
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
            );
          })}
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {editingUser && (
        <Modal title={`Edit Permissions: ${editingUser.name}`} onClose={() => setEditingUser(null)}>
          <div className="space-y-2">
            {Object.keys(permissions).map((key) => (
              <label key={key} className="flex items-center gap-2 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.permissions[key]}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      permissions: { ...editingUser.permissions, [key]: e.target.checked },
                    })
                  }
                  className="accent-[#1F5EFF]"
                />
                <span className="text-sm text-[var(--ack-text)]">
                  {key
                    .replace('can_', '')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
          <PrimaryButton onClick={handleSavePermissions} disabled={busy} className="w-full mt-4">
            {busy ? 'Saving...' : 'Save Permissions'}
          </PrimaryButton>
        </Modal>
      )}
    </Modal>
  );
}
