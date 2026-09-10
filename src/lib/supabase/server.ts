import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseServiceKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
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
