import React from 'react';
import { Eye, EyeOff, AlertTriangle } from '../icons';
import { Card, Field } from '../components/ui';
import { phoneToParentEmail } from '../lib/identity';

export function SplashScreen() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 55%,#10294F 100%)' }}
    >
      <img
        src="/logos/karate.png"
        alt="Ananda College Karate emblem"
        className="relative mb-7"
        style={{ width: 240, height: 'auto' }}
        draggable={false}
      />

      <h1
        className="relative text-white font-extrabold text-2xl tracking-[0.15em] mb-2"
        style={{ fontFamily: 'Poppins, sans-serif', textShadow: '0 4px 24px rgba(0,0,0,.25)' }}
      >
        ANANDA COLLEGE
      </h1>
      <p className="relative text-white/60 text-xs tracking-[0.3em] mb-16">
        STRENGTH <span style={{ color: '#FF3B30' }}>•</span> DISCIPLINE <span style={{ color: '#FF3B30' }}>•</span> EXCELLENCE
      </p>

      <p className="relative text-white/50 text-[11px] tracking-[0.35em] mb-2">LOADING</p>
      <div className="relative w-52 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div className="h-full rounded-full bg-white" style={{ animation: 'splashBar 1.6s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes splashBar { 0% { width: 0%; } 60% { width: 85%; } 100% { width: 100%; opacity: 0; } }`}</style>
    </div>
  );
}

export function LoginScreen({ onSignIn }) {
  const [role, setRole] = React.useState('coach');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const loginEmail = role === 'parent' ? phoneToParentEmail(email) : email.trim();
    const err = await onSignIn(loginEmail, password);
    setBusy(false);
    if (err) setError(err.message || 'Could not sign in — check your details and password.');
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 55%,#10294F 100%)' }}
    >
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="relative w-full max-w-sm" style={{ animation: 'iosScreenIn .5s cubic-bezier(.22,1,.36,1) both' }}>
          <div className="flex flex-col items-center mb-7">
            <img
              src="/logos/karate.png"
              alt="Ananda College Karate emblem"
              className="mb-4"
              style={{ width: 72, height: 'auto' }}
              draggable={false}
            />
            <h1
              className="text-white font-extrabold text-2xl text-center tracking-tight"
              style={{ fontFamily: 'Poppins, sans-serif', textShadow: '0 4px 24px rgba(0,0,0,.25)' }}
            >
              Ananda College
              <br />
              Karate
            </h1>
            <p className="text-white/60 text-xs mt-1.5 tracking-[0.25em]">DISCIPLINE · FOCUS · EXCELLENCE</p>
          </div>

          <Card
            className="p-5 !bg-white/10 border-white/25"
            style={{
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              boxShadow: '0 32px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.3)',
            }}
          >
            <div
              className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}
            >
              {[
                { id: 'coach', label: 'Coach / Captain' },
                { id: 'parent', label: 'Parent' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className="py-2 rounded-lg text-xs font-semibold transition"
                  style={
                    role === r.id
                      ? {
                          background: '#1F5EFF',
                          color: '#fff',
                          boxShadow: '0 6px 18px rgba(31,94,255,.45)',
                        }
                      : { color: 'rgba(255,255,255,.7)' }
                  }
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit}>
              <Field label={role === 'parent' ? 'WhatsApp Number' : 'Email'}>
                <input
                  type={role === 'parent' ? 'tel' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  required
                  placeholder={role === 'parent' ? '+94 7X XXX XXXX' : 'coach@example.com'}
                  className="w-full border border-white/25 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-300 bg-white/10 text-white placeholder-white/40"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,.15)' }}
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-white/25 rounded-xl px-3.5 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-300 bg-white/10 text-white placeholder-white/40"
                    style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,.15)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              {error && (
                <p className="text-xs text-red-300 mb-3 bg-red-500/15 border border-red-400/30 rounded-lg px-2.5 py-1.5">{error}</p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition disabled:opacity-60"
                style={{ background: '#1F5EFF', boxShadow: '0 12px 32px rgba(31,94,255,.45)' }}
              >
                {busy ? 'Signing in…' : 'Log in'}
              </button>
            </form>
          </Card>

          <div className="mt-4 bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl p-3 flex gap-2">
            <AlertTriangle size={16} className="text-amber-300 shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/80 leading-snug">
              Coaches and captains: your account is created directly in the Supabase dashboard. Parents: your login is created for you by a
              coach after registration.
            </p>
          </div>

          <p className="text-center text-white/50 text-[11px] mt-5">Ananda College Karate · Strength in Spirit, Excellence in Action</p>
        </div>
      </div>
    </div>
  );
}
