import { createClient } from '@supabase/supabase-js';

const sanitize = (s: unknown): string =>
  String(s ?? '').replace(/[^\x20-\x7E]/g, '').trim();

const supabaseUrl = sanitize(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitize(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
