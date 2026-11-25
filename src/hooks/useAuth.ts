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

  const signUp = React.useCallback(
    async (email: string, password: string, name: string) => {
      // Sign up the user via Supabase Auth
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // Store name in user metadata as backup
        },
      });

      if (error) return error;
      if (!data.user) return new Error('Sign up failed');

      // Create profile immediately with role='parent' (hardcoded, never from user input)
      const { error: profileError } = await supabaseClient.from('profiles').insert({
        id: data.user.id,
        role: 'parent', // Default role - only coaches can create staff accounts
        name: name.trim(),
      });

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        // User exists in auth.users but has no profile - will see "No profile" screen
        return profileError;
      }

      return null; // Success
    },
    [supabaseClient]
  );

  const refreshProfile = React.useCallback(() => {
    if (session?.user?.id) return loadProfile(session.user.id);
  }, [session, loadProfile]);

  return { session, profile, profileError, loading, signIn, signOut, signUp, refreshProfile };
}
