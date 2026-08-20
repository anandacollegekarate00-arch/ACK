import React from 'react';
import { RefreshCw, Trash2 } from '../icons';
import { Avatar, PrimaryButton, Field, inputCls, Modal, ConfirmDialog } from '../components/ui';
import { useToast } from '../components/Toast';
import { ROYAL, DANGER, WARNING } from '../lib/theme';

interface UserManagementPanelProps {
  profiles: any[];
  onCreate: (data: any) => Promise<void>;
  onResetPassword: (userId: string) => Promise<string>;
  onDeleteUser: (userId: string) => Promise<void>;
  onClose: () => void;
}

export function UserManagementPanel({
  profiles,
  onCreate,
  onResetPassword,
  onDeleteUser,
  onClose,
}: UserManagementPanelProps) {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<'coach' | 'captain'>('coach');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const { showToast, ToastComponent } = useToast();

  const [confirmDeleteTarget, setConfirmDeleteTarget] = React.useState<any>(null);
  const [confirmResetTarget, setConfirmResetTarget] = React.useState<any>(null);

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
      });

      showToast(`Account created — email: ${email}, temp password: 000000`);

      setEmail('');
      setName('');
      setRole('coach');
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
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setConfirmResetTarget(user)}
                      disabled={busy}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: `${WARNING}14`, color: WARNING }}
                    >
                      <RefreshCw size={12} className="inline mr-1" />
                      Reset Password
                    </button>
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
    </Modal>
  );
}
