import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Baked-in production connection — every visitor gets this automatically,
// no setup screen and no per-device configuration. (A setup/switch-your-
// project screen was removed: a single club runs against a single project,
// and the localStorage override path was a footgun that silently pointed
// the app at the wrong database on someone else's device.)
export const DEFAULT_SUPABASE_URL = 'https://velrrklvyefnpvrkidww.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_YHyncslQiCaJk7wXcrk01Q_iFXZCozu';

export interface SupabaseClients {
  client: SupabaseClient;
  /** Secondary client with a separate storage key — used for flows that must
   *  not disturb the primary session (e.g. coach-side parent login creation). */
  secondary: SupabaseClient;
}

export function createSupabaseClients(url: string = DEFAULT_SUPABASE_URL, anonKey: string = DEFAULT_SUPABASE_KEY): SupabaseClients {
  const client = createClient(url, anonKey);
  const secondary = createClient(url, anonKey, {
    auth: { storageKey: 'akc-secondary-auth', persistSession: false, autoRefreshToken: false },
  });
  return { client, secondary };
}
