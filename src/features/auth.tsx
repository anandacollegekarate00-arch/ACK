import React from 'react';
import { Eye, EyeOff } from '../icons';
import { Card, Field } from '../components/ui';

// ---------------------------------------------------------------------------
// Shared OAuth buttons
// ---------------------------------------------------------------------------

function OAuthDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <span className="text-white/40 text-xs tracking-widest">OR</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
    </div>
  );
}

function OAuthButtons({ onSignInWithOAuth, busy }: { onSignInWithOAuth: (p: 'google' | 'facebook' | 'apple') => Promise<any>; busy?: boolean }) {
  const [oauthBusy, setOauthBusy] = React.useState<string | null>(null);
  const [oauthError, setOauthError] = React.useState('');

  async function handleOAuth(provider: 'google' | 'facebook' | 'apple') {
    setOauthError('');
    setOauthBusy(provider);
    const err = await onSignInWithOAuth(provider);
    // If there's an error the redirect didn't happen — show it.
    // On success the page navigates away so we never reach the line below.
    if (err) {
      setOauthError(err.message || `Could not sign in with ${provider}. Please try again.`);
      setOauthBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      {oauthError && (
        <p className="text-xs text-red-300 bg-red-500/15 border border-red-400/30 rounded-lg px-2.5 py-1.5 mb-2">
          {oauthError}
        </p>
      )}

      {/* Google */}
      <button
        type="button"
        disabled={!!oauthBusy || busy}
        onClick={() => handleOAuth('google')}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
        style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#1f1f1f',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        {oauthBusy === 'google' ? (
          <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Facebook */}
      <button
        type="button"
        disabled={!!oauthBusy || busy}
        onClick={() => handleOAuth('facebook')}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
        style={{
          background: '#1877F2',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(24,119,242,0.4)',
        }}
      >
        {oauthBusy === 'facebook' ? (
          <span className="w-5 h-5 border-2 border-blue-300 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        Continue with Facebook
      </button>

      {/* Apple */}
      <button
        type="button"
        disabled={!!oauthBusy || busy}
        onClick={() => handleOAuth('apple')}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
        style={{
          background: '#000',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        {oauthBusy === 'apple' ? (
          <span className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="17" height="20" viewBox="0 0 814 1000" fill="white">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.9c-50.5-90.4-94.4-234.1-94.4-371.1C8 191.4 103.1 90.9 215.1 90.9c64.7 0 118.1 43.6 158.2 43.6 36.8 0 97.1-45.9 171.6-45.9 27.5 0 108.2 2.6 171.6 80zM517.3 95.7c-30.2 13.3-61.6 55.4-61.6 110.7 0 54.4 36.3 108.9 73.9 128.2 4.5.6 8.4 1.3 12.9 1.3 2.6 0 5.1-.6 7.7-.6 29-13 60.4-55.1 60.4-108.9 0-55.7-36.9-109.6-93.3-130.7z" />
          </svg>
        )}
        Continue with Apple
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Splash Screen
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Login Screen
// ---------------------------------------------------------------------------

export function LoginScreen({ onSignIn, onSignInWithOAuth, onShowSignUp }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [showCreatePrompt, setShowCreatePrompt] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setShowCreatePrompt(false);
    setBusy(true);
    const err = await onSignIn(email.trim(), password);
    setBusy(false);
    if (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError("We couldn't find an account with these details.");
        setShowCreatePrompt(true);
      } else {
        setError(err.message || 'Could not sign in — check your details and try again.');
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

          {/* Branding */}
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
            {/* OAuth buttons — above the email form */}
            <OAuthButtons onSignInWithOAuth={onSignInWithOAuth} busy={busy} />

            <OAuthDivider />

            {/* Email + password form */}
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
                <p className="text-xs text-red-300 mb-3 bg-red-500/15 border border-red-400/30 rounded-lg px-2.5 py-1.5">
                  {error}
                </p>
              )}
              {showCreatePrompt && (
                <button
                  type="button"
                  onClick={onShowSignUp}
                  className="w-full mb-3 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/30 transition hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
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

          <p className="text-center text-white/50 text-[11px] mt-5">
            Ananda College Karate · Strength in Spirit, Excellence in Action
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

  async function submit(e) {
    e.preventDefault();
    setError('');

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

  // Success state
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
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-white text-xl font-bold mb-2">Account Created!</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Your account has been created successfully. You can now sign in.
                </p>
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

          {/* Branding */}
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
            {/* OAuth buttons — quick sign-up path */}
            <OAuthButtons onSignInWithOAuth={onSignInWithOAuth} busy={busy} />

            <OAuthDivider />

            {/* Email + password form */}
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
                <p className="text-xs text-red-300 mb-3 bg-red-500/15 border border-red-400/30 rounded-lg px-2.5 py-1.5">
                  {error}
                </p>
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

          <p className="text-center text-white/50 text-[11px] mt-5">
            Ananda College Karate · Strength in Spirit, Excellence in Action
          </p>
        </div>
      </div>
    </div>
  );
}
