import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * True only when both Supabase env vars are configured.
 * Use this flag to gate realtime subscriptions and direct DB calls.
 * In demo / offline-only mode both vars are empty — all Supabase
 * calls will fail gracefully (401) rather than crashing at import.
 */
export const HAS_SUPABASE = url.length > 0 && key.length > 0;

/**
 * Supabase client.
 *
 * When env vars are missing we pass safe placeholder strings so
 * createClient() doesn't throw. Any call on this client will
 * return a network error, which the store catches and falls back
 * to demo data.
 */
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key',
  { realtime: { params: { eventsPerSecond: 20 } } },
);
