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

  // Create a profile row if one does not exist yet.
  // Called after OAuth sign-in where no profile was pre-created.
  const ensureProfile = React.useCallback(
    async (userId: string, userName?: string, userEmail?: string) => {
      const { data: existing } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existing) return; // Already has a profile — nothing to do

      // Role is always 'parent' for self-service. Only coaches can create
      // staff accounts via admin_create_staff_user().
      const { error } = await supabaseClient.from('profiles').insert({
        id: userId,
        role: 'parent',
        name: userName || userEmail?.split('@')[0] || 'User',
      });

      if (error) {
        console.error('Auto-profile creation failed:', error);
      }
    },
    [supabaseClient]
  );

  React.useEffect(() => {
    let cancelled = false;
    supabaseClient.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      if (data.session) {
        await ensureProfile(
          data.session.user.id,
          data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name,
          data.session.user.email
        );
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });
    const { data: sub } = supabaseClient.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await ensureProfile(
          newSession.user.id,
          newSession.user.user_metadata?.name || newSession.user.user_metadata?.full_name,
          newSession.user.email
        );
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile, ensureProfile, supabaseClient]);

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
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) return error;
      if (!data.user) return new Error('Sign up failed — no user returned');

      // Create profile immediately. Role is hardcoded to 'parent'.
      const { error: profileError } = await supabaseClient.from('profiles').insert({
        id: data.user.id,
        role: 'parent',
        name: name.trim(),
      });

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        return profileError;
      }

      return null; // Success
    },
    [supabaseClient]
  );

  // Triggers the OAuth redirect flow. The browser will navigate away and
  // return to window.location.origin after the provider authenticates.
  const signInWithOAuth = React.useCallback(
    async (provider: 'google' | 'facebook' | 'apple') => {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      return error;
    },
    [supabaseClient]
  );

  const refreshProfile = React.useCallback(() => {
    if (session?.user?.id) return loadProfile(session.user.id);
  }, [session, loadProfile]);

  return {
    session,
    profile,
    profileError,
    loading,
    signIn,
    signOut,
    signUp,
    signInWithOAuth,
    refreshProfile,
  };
}
