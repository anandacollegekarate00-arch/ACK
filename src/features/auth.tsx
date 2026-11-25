import React from 'react';
import { Eye, EyeOff } from '../icons';

const BG = 'linear-gradient(165deg,#0B1F3A 0%,#0B2A5B 55%,#10294F 100%)';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const inputCls =
  'w-full h-[52px] rounded-full px-5 text-[15px] bg-white/10 border border-white/15 text-white ' +
  'placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-colors';

function PillButton({
  children, onClick, type = 'button', disabled = false, variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'white' | 'muted' | 'primary' | 'danger';
}) {
  const styles: Record<string, React.CSSProperties> = {
    white:   { background: '#fff', color: '#111' },
    muted:   { background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.12)' },
    primary: { background: '#1F5EFF', color: '#fff' },
    danger:  { background: 'rgba(255,59,48,0.15)', color: 'rgba(255,100,90,1)', border: '1px solid rgba(255,59,48,0.25)' },
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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors -ml-1"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      Back
    </button>
  );
}

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

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
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

type LoginView = 'landing' | 'email' | 'forgot' | 'forgot-sent';

export function LoginScreen({ onSignIn, onSignInWithOAuth, onShowSignUp, onResetPassword }) {
  const [view, setView] = React.useState<LoginView>('landing');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  const [oauthBusy, setOauthBusy] = React.useState(false);
  const [oauthError, setOauthError] = React.useState('');

  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotBusy, setForgotBusy] = React.useState(false);
  const [forgotError, setForgotError] = React.useState('');

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

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) { setForgotError('Please enter your email address.'); return; }
    setForgotBusy(true);
    const err = await onResetPassword(forgotEmail.trim());
    setForgotBusy(false);
    if (err) {
      setForgotError(err.message || 'Could not send reset email. Please try again.');
    } else {
      setView('forgot-sent');
    }
  }

  // Pre-fill forgotEmail from whatever the user typed in the sign-in form
  function goToForgot() {
    setForgotEmail(email);
    setForgotError('');
    setView('forgot');
  }

  const heading: Record<LoginView, string> = {
    landing:      'Welcome back',
    email:        'Sign in with email',
    forgot:       'Reset password',
    'forgot-sent':'Check your email',
  };
  const subtext: Record<LoginView, string> = {
    landing:      'Ananda College Karate · Member Portal',
    email:        'Enter your email and password',
    forgot:       "We'll send a reset link to your email",
    'forgot-sent':'',
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px] flex flex-col items-center">

          <img src="/logos/karate.png" alt="Ananda College Karate" style={{ width: 60, height: 'auto' }} draggable={false} className="mb-7" />

          <h1
            className="text-white font-extrabold text-[32px] text-center leading-tight mb-3"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
          >
            {heading[view]}
          </h1>
          {subtext[view] && (
            <p className="text-white/40 text-sm text-center mb-10">{subtext[view]}</p>
          )}

          {/* ── Landing ── */}
          {view === 'landing' && (
            <div className="w-full flex flex-col gap-3">
              {oauthError && <p className="text-xs text-red-300/80 text-center -mb-1">{oauthError}</p>}
              <PillButton variant="white" onClick={handleGoogle} disabled={oauthBusy}>
                {oauthBusy
                  ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"/>
                  : <GoogleIcon />}
                Continue with Google
              </PillButton>
              <PillButton variant="muted" onClick={() => setView('email')} disabled={oauthBusy}>
                <EmailIcon />
                Continue with email
              </PillButton>
            </div>
          )}

          {/* ── Email sign-in ── */}
          {view === 'email' && (
            <div className="w-full">
              <BackButton onClick={() => { setView('landing'); setError(''); setNotFound(false); }} />
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
                  className={inputCls}
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    className={inputCls + ' pr-12'}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>

                {error && <p className="text-xs text-red-300/80 px-1">{error}</p>}

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

                {/* Forgot password link — below the buttons */}
                <button
                  type="button"
                  onClick={goToForgot}
                  className="text-white/35 hover:text-white/60 text-sm text-center mt-2 transition-colors"
                >
                  Forgot your password?
                </button>
              </form>
            </div>
          )}

          {/* ── Forgot password ── */}
          {view === 'forgot' && (
            <div className="w-full mt-2">
              <BackButton onClick={() => { setView('email'); setForgotError(''); }} />
              <form onSubmit={handleForgotPassword} noValidate className="flex flex-col gap-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  autoFocus
                  className={inputCls}
                />
                {forgotError && <p className="text-xs text-red-300/80 px-1">{forgotError}</p>}
                <div className="mt-1">
                  <PillButton type="submit" variant="primary" disabled={forgotBusy}>
                    {forgotBusy ? 'Sending…' : 'Send reset link'}
                  </PillButton>
                </div>
              </form>
            </div>
          )}

          {/* ── Forgot sent ── */}
          {view === 'forgot-sent' && (
            <div className="w-full flex flex-col items-center text-center mt-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(31,94,255,0.12)', border: '1px solid rgba(31,94,255,0.25)' }}
              >
                <EmailIcon />
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                We sent a password reset link to <span className="text-white/80 font-medium">{forgotEmail}</span>.
                Check your inbox and follow the link.
              </p>
              <div className="w-full">
                <PillButton variant="muted" onClick={() => { setView('email'); setForgotEmail(''); }}>
                  Back to sign in
                </PillButton>
              </div>
            </div>
          )}

          {/* Footer */}
          {(view === 'landing' || view === 'email') && (
            <p className="text-white/30 text-sm mt-10 text-center">
              New here?{' '}
              <button type="button" onClick={onShowSignUp}
                className="text-white/55 hover:text-white/80 underline underline-offset-2 transition-colors">
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reset Password Screen (deep link from email)
// Shown when the URL contains ?reset=1 and Supabase has set a recovery session
// ---------------------------------------------------------------------------

export function ResetPasswordScreen({ onUpdatePassword, onDone }) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    const err = await onUpdatePassword(password);
    setBusy(false);
    if (err) {
      setError(err.message || 'Could not update password. Please try again.');
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <div className="w-full max-w-[340px] flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.25)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(52,199,89,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-white font-extrabold text-[28px] mb-2" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>
            Password updated
          </h2>
          <p className="text-white/40 text-sm mb-10">Your password has been changed. You can now sign in.</p>
          <div className="w-full">
            <PillButton variant="primary" onClick={onDone}>Continue to Sign In</PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <img src="/logos/karate.png" alt="Ananda College Karate" style={{ width: 60, height: 'auto' }} draggable={false} className="mb-7"/>
          <h1 className="text-white font-extrabold text-[28px] text-center leading-tight mb-3"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>
            New password
          </h1>
          <p className="text-white/40 text-sm text-center mb-10">Choose a new password for your account</p>

          <div className="w-full">
            <form onSubmit={submit} noValidate className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required autoFocus autoComplete="new-password"
                  placeholder="New password (min. 6 characters)"
                  className={inputCls + ' pr-12'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required autoComplete="new-password"
                placeholder="Confirm new password"
                className={inputCls}
              />
              {error && <p className="text-xs text-red-300/80 px-1">{error}</p>}
              <div className="mt-1">
                <PillButton type="submit" variant="primary" disabled={busy}>
                  {busy ? 'Updating…' : 'Update password'}
                </PillButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// No Profile Screen — clean fallback when auth succeeded but no profile row
// ---------------------------------------------------------------------------

export function NoProfileScreen({ email, onSignOut }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center" style={{ background: BG }}>
      <div className="w-full max-w-[320px] flex flex-col items-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(255,204,0,0.10)', border: '1px solid rgba(255,204,0,0.20)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,204,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-white font-extrabold text-[24px] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Account not set up
        </h2>
        <p className="text-white/40 text-sm leading-relaxed mb-2">
          Your account <span className="text-white/60">{email}</span> is not linked to a member profile yet.
        </p>
        <p className="text-white/30 text-sm leading-relaxed mb-10">
          Please contact your coach to have your account activated.
        </p>
        <div className="w-full">
          <PillButton variant="muted" onClick={onSignOut}>Sign out</PillButton>
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

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <div className="w-full max-w-[340px] flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.25)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(52,199,89,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-white font-extrabold text-[28px] mb-2" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>
            Account created
          </h2>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">Your account has been created successfully.</p>
          <div className="w-full">
            <PillButton variant="primary" onClick={onBackToLogin}>Go to Sign In</PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: BG }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <img src="/logos/karate.png" alt="Ananda College Karate" style={{ width: 60, height: 'auto' }} draggable={false} className="mb-7"/>

          <h1 className="text-white font-extrabold text-[32px] text-center leading-tight mb-3"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>
            {view === 'landing' ? 'Create an account' : 'Your details'}
          </h1>
          <p className="text-white/40 text-sm text-center mb-10">
            {view === 'landing' ? 'Ananda College Karate · Member Portal' : 'Fill in your information below'}
          </p>

          {view === 'landing' && (
            <div className="w-full flex flex-col gap-3">
              {oauthError && <p className="text-xs text-red-300/80 text-center -mb-1">{oauthError}</p>}
              <PillButton variant="white" onClick={handleGoogle} disabled={oauthBusy}>
                {oauthBusy
                  ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"/>
                  : <GoogleIcon/>}
                Continue with Google
              </PillButton>
              <PillButton variant="muted" onClick={() => setView('email')} disabled={oauthBusy}>
                <EmailIcon/>
                Continue with email
              </PillButton>
            </div>
          )}

          {view === 'email' && (
            <div className="w-full">
              <BackButton onClick={() => { setView('landing'); setError(''); }}/>
              <form onSubmit={handleEmailSignUp} noValidate className="flex flex-col gap-3">
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Full name"
                  autoComplete="name" autoFocus className={inputCls}/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none"
                  autoComplete="email" required placeholder="Email address" className={inputCls}/>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="new-password" placeholder="Password (min. 6 characters)" className={inputCls + ' pr-12'}/>
                  <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required autoComplete="new-password" placeholder="Confirm password" className={inputCls}/>
                {error && <p className="text-xs text-red-300/80 px-1">{error}</p>}
                <div className="mt-1">
                  <PillButton type="submit" variant="primary" disabled={busy}>
                    {busy ? 'Creating account…' : 'Create account'}
                  </PillButton>
                </div>
              </form>
            </div>
          )}

          <p className="text-white/30 text-sm mt-10 text-center">
            Already have an account?{' '}
            <button type="button" onClick={onBackToLogin}
              className="text-white/55 hover:text-white/80 underline underline-offset-2 transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
