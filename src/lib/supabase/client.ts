import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;
