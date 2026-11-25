import React from 'react';
import { Eye, EyeOff } from '../icons';

// ---------------------------------------------------------------------------
// Shared design tokens — auth screens only
// ---------------------------------------------------------------------------

const BG = 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 55%,#10294F 100%)';

// Clean panel: very low opacity fill, single-weight border, no blur
const panelStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: 14,
  boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
};

// Shared input class — consistent height, clean border, no inner shadow
const inputCls =
  'w-full border border-white/20 rounded-[10px] px-3.5 py-2.5 text-sm bg-white/[0.07] text-white placeholder-white/35 ' +
  'focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors';

// Shared label
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold tracking-wide text-white/50 mb-1.5 uppercase">
      {children}
    </label>
  );
}

// Shared field wrapper
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// Error message
function ErrorMsg({ message }: { message: string }) {
  return (
    <p className="text-xs text-red-300/90 mb-4 pl-0.5">{message}</p>
  );
}

// ---------------------------------------------------------------------------
// Google button
// ---------------------------------------------------------------------------

function GoogleButton({ onSignInWithOAuth, disabled }: { onSignInWithOAuth: (p: 'google') => Promise<any>; disabled?: boolean }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handle() {
    setError('');
    setBusy(true);
    const err = await onSignInWithOAuth('google');
    if (err) {
      setError('Could not sign in with Google. Please try again.');
      setBusy(false);
    }
    // On success the browser navigates away — no further state update needed
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy || disabled}
        onClick={handle}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-[10px] text-sm font-medium text-[#1f1f1f] transition-opacity disabled:opacity-50"
        style={{ background: '#fff' }}
      >
        {busy ? (
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        Continue with Google
      </button>
      {error && <p className="text-xs text-red-300/90 mt-2 pl-0.5">{error}</p>}
    </div>
  );
}

// Divider between social and email sections
function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[11px] text-white/30 font-medium">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Splash Screen — unchanged from original
// ---------------------------------------------------------------------------

export function SplashScreen() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: BG }}
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
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        ANANDA COLLEGE
      </h1>
      <p className="relative text-white/60 text-xs tracking-[0.3em] mb-16">
        STRENGTH <span style={{ color: '#FF3B30' }}>•</span> DISCIPLINE <span style={{ color: '#FF3B30' }}>•</span> EXCELLENCE
      </p>
      <p className="relative text-white/40 text-[11px] tracking-[0.35em] mb-2">LOADING</p>
      <div className="relative w-48 h-0.5 rounded-full overflow-hidden bg-white/10">
        <div className="h-full rounded-full bg-white/60" style={{ animation: 'splashBar 1.6s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes splashBar { 0%{width:0%} 60%{width:85%} 100%{width:100%;opacity:0} }`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Screen
// ---------------------------------------------------------------------------

export function LoginScreen({ onSignIn, onSignInWithOAuth, onShowSignUp }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotFound(false);
    setBusy(true);
    const err = await onSignIn(email.trim(), password);
    setBusy(false);
    if (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError("No account found with these details.");
        setNotFound(true);
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[360px]">

          {/* Logo + wordmark */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logos/karate.png"
              alt="Ananda College Karate"
              style={{ width: 56, height: 'auto' }}
              draggable={false}
            />
            <h1
              className="text-white font-bold text-[22px] text-center mt-4 leading-snug"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em' }}
            >
              Ananda College Karate
            </h1>
            <p className="text-white/40 text-[11px] mt-1">Member Portal</p>
          </div>

          {/* Panel */}
          <div style={panelStyle} className="p-6">

            {/* Google */}
            <GoogleButton onSignInWithOAuth={onSignInWithOAuth} disabled={busy} />

            <Divider />

            {/* Email + password */}
            <form onSubmit={submit} noValidate>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={inputCls + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {error && <ErrorMsg message={error} />}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-[10px] text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-1"
                style={{ background: '#1F5EFF' }}
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>

              {/* Account not found — contextual CTA */}
              {notFound && (
                <button
                  type="button"
                  onClick={onShowSignUp}
                  className="w-full mt-2 py-2.5 rounded-[10px] text-sm font-medium text-white/80 border border-white/15 hover:border-white/30 hover:text-white transition-colors"
                >
                  Create an account
                </button>
              )}
            </form>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center mt-5">
            <span className="text-white/35 text-xs">New here?</span>
            <button
              type="button"
              onClick={onShowSignUp}
              className="ml-1.5 text-xs text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors"
            >
              Create an account
            </button>
          </div>

          <p className="text-center text-white/20 text-[10px] mt-6 tracking-wide">
            Ananda College Karate · Colombo, Sri Lanka
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sign-Up Screen
// ---------------------------------------------------------------------------

export function SignUpScreen({ onSignUp, onSignInWithOAuth, onBackToLogin }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setBusy(true);
    const err = await onSignUp(email.trim(), password, name.trim());
    setBusy(false);

    if (err) {
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('This email is already registered. Sign in instead.');
      } else {
        setError(err.message || 'Could not create account. Please try again.');
      }
    } else {
      setSuccess(true);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
          <div className="w-full max-w-[360px]">
            <div style={panelStyle} className="p-8 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(52,199,89,0.15)', border: '1px solid rgba(52,199,89,0.3)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(52,199,89,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Account created
              </h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Your account has been created successfully. You can now sign in.
              </p>
              <button
                onClick={onBackToLogin}
                className="w-full py-2.5 rounded-[10px] text-sm font-semibold text-white"
                style={{ background: '#1F5EFF' }}
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[360px]">

          {/* Logo + wordmark */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logos/karate.png"
              alt="Ananda College Karate"
              style={{ width: 56, height: 'auto' }}
              draggable={false}
            />
            <h1
              className="text-white font-bold text-[22px] text-center mt-4 leading-snug"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em' }}
            >
              Create Account
            </h1>
            <p className="text-white/40 text-[11px] mt-1">Ananda College Karate</p>
          </div>

          {/* Panel */}
          <div style={panelStyle} className="p-6">

            {/* Google sign-up */}
            <GoogleButton onSignInWithOAuth={onSignInWithOAuth} disabled={busy} />

            <Divider />

            {/* Email + password form */}
            <form onSubmit={submit} noValidate>
              <Field label="Full Name">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  autoComplete="name"
                  className={inputCls}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className={inputCls + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className={inputCls}
                />
              </Field>

              {error && <ErrorMsg message={error} />}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-[10px] text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-1"
                style={{ background: '#1F5EFF' }}
              >
                {busy ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center mt-5">
            <span className="text-white/35 text-xs">Already have an account?</span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="ml-1.5 text-xs text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors"
            >
              Sign in
            </button>
          </div>

          <p className="text-center text-white/20 text-[10px] mt-6 tracking-wide">
            Ananda College Karate · Colombo, Sri Lanka
          </p>
        </div>
      </div>
    </div>
  );
}
