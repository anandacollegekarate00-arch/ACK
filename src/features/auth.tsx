import React from 'react';
import { Eye, EyeOff } from '../icons';

const BG = 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 55%,#10294F 100%)';

// ---------------------------------------------------------------------------
// Pill button variants
// ---------------------------------------------------------------------------

function PillButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'white',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'white' | 'muted' | 'primary';
}) {
  const styles: Record<string, React.CSSProperties> = {
    white:   { background: '#fff', color: '#111' },
    muted:   { background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.12)' },
    primary: { background: '#1F5EFF', color: '#fff' },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 h-[52px] rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-40 active:scale-[0.98]"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Google icon
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// Email icon
function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

// Back chevron
function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Splash Screen
// ---------------------------------------------------------------------------

export function SplashScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: BG }}>
      <img src="/logos/karate.png" alt="Ananda College Karate" style={{ width: 72, height: 'auto' }} draggable={false} className="mb-7" />
      <h1 className="text-white font-extrabold text-2xl tracking-[0.15em] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
        ANANDA COLLEGE
      </h1>
      <p className="text-white/50 text-xs tracking-[0.3em] mb-16">
        STRENGTH <span style={{ color: '#FF3B30' }}>•</span> DISCIPLINE <span style={{ color: '#FF3B30' }}>•</span> EXCELLENCE
      </p>
      <div className="w-48 h-0.5 rounded-full overflow-hidden bg-white/10">
        <div className="h-full rounded-full bg-white/50" style={{ animation: 'splashBar 1.6s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes splashBar{0%{width:0%}60%{width:85%}100%{width:100%;opacity:0}}`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Screen
// ---------------------------------------------------------------------------

export function LoginScreen({ onSignIn, onSignInWithOAuth, onShowSignUp }) {
  // 'landing' → show Google + "Continue with email"
  // 'email'   → show inline email/password form
  const [view, setView] = React.useState<'landing' | 'email'>('landing');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  const [oauthBusy, setOauthBusy] = React.useState(false);
  const [oauthError, setOauthError] = React.useState('');

  async function handleGoogle() {
    setOauthError('');
    setOauthBusy(true);
    const err = await onSignInWithOAuth('google');
    if (err) { setOauthError('Could not sign in with Google. Please try again.'); setOauthBusy(false); }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotFound(false);
    setBusy(true);
    const err = await onSignIn(email.trim(), password);
    setBusy(false);
    if (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('No account found with these details.');
        setNotFound(true);
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px] flex flex-col items-center">

          {/* Logo */}
          <img
            src="/logos/karate.png"
            alt="Ananda College Karate"
            style={{ width: 60, height: 'auto' }}
            draggable={false}
            className="mb-7"
          />

          {/* Heading */}
          {view === 'landing' ? (
            <h1
              className="text-white font-extrabold text-[32px] text-center leading-tight mb-3"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
            >
              Welcome back
            </h1>
          ) : (
            <h1
              className="text-white font-extrabold text-[28px] text-center leading-tight mb-3"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
            >
              Sign in with email
            </h1>
          )}

          <p className="text-white/40 text-sm text-center mb-10">
            {view === 'landing' ? 'Ananda College Karate · Member Portal' : 'Enter your email and password'}
          </p>

          {/* Landing view — two pill buttons */}
          {view === 'landing' && (
            <div className="w-full flex flex-col gap-3">
              {oauthError && (
                <p className="text-xs text-red-300/80 text-center -mb-1">{oauthError}</p>
              )}
              <PillButton variant="white" onClick={handleGoogle} disabled={oauthBusy}>
                {oauthBusy
                  ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                  : <GoogleIcon />
                }
                Continue with Google
              </PillButton>

              <PillButton variant="muted" onClick={() => setView('email')} disabled={oauthBusy}>
                <EmailIcon />
                Continue with email
              </PillButton>
            </div>
          )}

          {/* Email view — inline form */}
          {view === 'email' && (
            <div className="w-full">
              {/* Back button */}
              <button
                type="button"
                onClick={() => { setView('landing'); setError(''); setNotFound(false); }}
                className="flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors -ml-1"
              >
                <ChevronLeft />
                Back
              </button>

              <form onSubmit={handleEmailSignIn} noValidate className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  autoFocus
                  className="w-full h-[52px] rounded-full px-5 text-[15px] bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors"
                />

                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    className="w-full h-[52px] rounded-full px-5 pr-12 text-[15px] bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-300/80 px-1">{error}</p>
                )}

                <div className="flex flex-col gap-2 mt-1">
                  <PillButton type="submit" variant="primary" disabled={busy}>
                    {busy ? 'Signing in…' : 'Sign in'}
                  </PillButton>

                  {notFound && (
                    <PillButton variant="muted" onClick={onShowSignUp}>
                      Create an account instead
                    </PillButton>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Footer */}
          <p className="text-white/30 text-sm mt-10 text-center">
            New here?{' '}
            <button
              type="button"
              onClick={onShowSignUp}
              className="text-white/55 hover:text-white/80 underline underline-offset-2 transition-colors"
            >
              Create an account
            </button>
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
  const [view, setView] = React.useState<'landing' | 'email'>('landing');

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [oauthBusy, setOauthBusy] = React.useState(false);
  const [oauthError, setOauthError] = React.useState('');

  async function handleGoogle() {
    setOauthError('');
    setOauthBusy(true);
    const err = await onSignInWithOAuth('google');
    if (err) { setOauthError('Could not sign in with Google. Please try again.'); setOauthBusy(false); }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
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

  // Success
  if (success) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <div className="w-full max-w-[340px] flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.25)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(52,199,89,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-white font-extrabold text-[28px] mb-2" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>
            Account created
          </h2>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">
            Your account has been created successfully.
          </p>
          <div className="w-full">
            <PillButton variant="primary" onClick={onBackToLogin}>
              Go to Sign In
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px] flex flex-col items-center">

          {/* Logo */}
          <img
            src="/logos/karate.png"
            alt="Ananda College Karate"
            style={{ width: 60, height: 'auto' }}
            draggable={false}
            className="mb-7"
          />

          {/* Heading */}
          {view === 'landing' ? (
            <h1
              className="text-white font-extrabold text-[32px] text-center leading-tight mb-3"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
            >
              Create an account
            </h1>
          ) : (
            <h1
              className="text-white font-extrabold text-[28px] text-center leading-tight mb-3"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
            >
              Your details
            </h1>
          )}

          <p className="text-white/40 text-sm text-center mb-10">
            {view === 'landing' ? 'Ananda College Karate · Member Portal' : 'Fill in your information below'}
          </p>

          {/* Landing view */}
          {view === 'landing' && (
            <div className="w-full flex flex-col gap-3">
              {oauthError && (
                <p className="text-xs text-red-300/80 text-center -mb-1">{oauthError}</p>
              )}
              <PillButton variant="white" onClick={handleGoogle} disabled={oauthBusy}>
                {oauthBusy
                  ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                  : <GoogleIcon />
                }
                Continue with Google
              </PillButton>

              <PillButton variant="muted" onClick={() => setView('email')} disabled={oauthBusy}>
                <EmailIcon />
                Continue with email
              </PillButton>
            </div>
          )}

          {/* Email form */}
          {view === 'email' && (
            <div className="w-full">
              <button
                type="button"
                onClick={() => { setView('landing'); setError(''); }}
                className="flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors -ml-1"
              >
                <ChevronLeft />
                Back
              </button>

              <form onSubmit={handleEmailSignUp} noValidate className="flex flex-col gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Full name"
                  autoComplete="name"
                  autoFocus
                  className="w-full h-[52px] rounded-full px-5 text-[15px] bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  className="w-full h-[52px] rounded-full px-5 text-[15px] bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors"
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Password (min. 6 characters)"
                    className="w-full h-[52px] rounded-full px-5 pr-12 text-[15px] bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  className="w-full h-[52px] rounded-full px-5 text-[15px] bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors"
                />

                {error && (
                  <p className="text-xs text-red-300/80 px-1">{error}</p>
                )}

                <div className="mt-1">
                  <PillButton type="submit" variant="primary" disabled={busy}>
                    {busy ? 'Creating account…' : 'Create account'}
                  </PillButton>
                </div>
              </form>
            </div>
          )}

          {/* Footer */}
          <p className="text-white/30 text-sm mt-10 text-center">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-white/55 hover:text-white/80 underline underline-offset-2 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
