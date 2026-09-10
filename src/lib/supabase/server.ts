import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseServiceKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://')
);

export function getServerSupabase() {
  if (!isServerSupabaseConfigured) {
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}
