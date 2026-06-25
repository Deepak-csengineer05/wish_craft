import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Warning: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variables. Supabase features will fail until these are configured.'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder-project.supabase.co', supabaseAnonKey || 'placeholder-anon-key');
export default supabase;
