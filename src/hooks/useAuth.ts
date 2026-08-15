import React from 'react';

export function useAuth(supabaseClient) {
  const [session, setSession] = React.useState(undefined);
  const [profile, setProfile] = React.useState(null);
  const [profileError, setProfileError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const loadProfile = React.useCallback(
    async (userId) => {
      const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.error('Failed to load profile:', error);
        setProfile(null);
        setProfileError(error);
      } else {
        setProfile(data);
        setProfileError(null);
      }
    },
    [supabaseClient]
  );

  React.useEffect(() => {
    let cancelled = false;
    supabaseClient.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabaseClient.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) await loadProfile(newSession.user.id);
      else setProfile(null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile, supabaseClient]);

  const signIn = React.useCallback(
    async (email, password) => {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      return error;
    },
    [supabaseClient]
  );

  const signOut = React.useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, [supabaseClient]);
  const refreshProfile = React.useCallback(() => {
    if (session?.user?.id) return loadProfile(session.user.id);
  }, [session, loadProfile]);

  return { session, profile, profileError, loading, signIn, signOut, refreshProfile };
}
