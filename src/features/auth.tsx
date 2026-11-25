import React from 'react';
import { Eye, EyeOff } from '../icons';
import { Card, Field } from '../components/ui';

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

export function LoginScreen({ onSignIn, onShowSignUp }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setShowCreateAccountPrompt(false);
    setBusy(true);
    const err = await onSignIn(email.trim(), password);
    setBusy(false);
    if (err) {
      // Check if it's an "account not found" error
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('Email not confirmed')) {
        setError("We couldn't find an account with these details.");
        setShowCreateAccountPrompt(true);
      } else {
        setError(err.message || 'Could not sign in — check your details and password.');
      }
    }
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
            <form onSubmit={submit}>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
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
                    autoComplete="current-password"
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
              {showCreateAccountPrompt && (
                <button
                  type="button"
                  onClick={onShowSignUp}
                  className="w-full mb-3 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/30"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  Create Account
                </button>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition disabled:opacity-60"
                style={{ background: '#1F5EFF', boxShadow: '0 12px 32px rgba(31,94,255,.45)' }}
              >
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={onShowSignUp}
                className="w-full text-white/70 text-sm mt-3 hover:text-white/90 transition"
              >
                Don't have an account? <span className="underline">Sign up</span>
              </button>
            </form>
          </Card>

          <p className="text-center text-white/50 text-[11px] mt-5">Ananda College Karate · Strength in Spirit, Excellence in Action</p>
        </div>
      </div>
    </div>
  );
}


export function SignUpScreen({ onSignUp, onBackToLogin }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    const err = await onSignUp(email.trim(), password, name.trim());
    setBusy(false);

    if (err) {
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Could not create account. Please try again.');
      }
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-dvh flex flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 55%,#10294F 100%)' }}
      >
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="relative w-full max-w-sm" style={{ animation: 'iosScreenIn .5s cubic-bezier(.22,1,.36,1) both' }}>
            <Card
              className="p-6 !bg-white/10 border-white/25"
              style={{
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                boxShadow: '0 32px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.3)',
              }}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center mx-auto mb-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-400">
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-white text-xl font-bold mb-2">Account Created!</h2>
                <p className="text-white/80 text-sm">Your account has been created successfully. You can now sign in.</p>
              </div>
              <button
                onClick={onBackToLogin}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition"
                style={{ background: '#1F5EFF', boxShadow: '0 12px 32px rgba(31,94,255,.45)' }}
              >
                Go to Sign In
              </button>
            </Card>
          </div>
        </div>
      </div>
    );
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
              Create Account
            </h1>
            <p className="text-white/60 text-xs mt-1.5 tracking-[0.25em]">JOIN ANANDA COLLEGE KARATE</p>
          </div>

          <Card
            className="p-5 !bg-white/10 border-white/25"
            style={{
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              boxShadow: '0 32px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.3)',
            }}
          >
            <form onSubmit={submit}>
              <Field label="Full Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full border border-white/25 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-300 bg-white/10 text-white placeholder-white/40"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,.15)' }}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
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
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
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

              <Field label="Confirm Password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="w-full border border-white/25 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-300 bg-white/10 text-white placeholder-white/40"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,.15)' }}
                />
              </Field>

              {error && (
                <p className="text-xs text-red-300 mb-3 bg-red-500/15 border border-red-400/30 rounded-lg px-2.5 py-1.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition disabled:opacity-60 mb-3"
                style={{ background: '#1F5EFF', boxShadow: '0 12px 32px rgba(31,94,255,.45)' }}
              >
                {busy ? 'Creating account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-white/70 text-sm hover:text-white/90 transition"
              >
                Already have an account? <span className="underline">Sign in</span>
              </button>
            </form>
          </Card>

          <p className="text-center text-white/50 text-[11px] mt-5">Ananda College Karate · Strength in Spirit, Excellence in Action</p>
        </div>
      </div>
    </div>
  );
}
