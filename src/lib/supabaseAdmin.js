import { createClient } from '@supabase/supabase-js';

// Admin client for operations that require service key (elevated privileges)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env?.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service key environment variable. Please add VITE_SUPABASE_SERVICE_KEY to your .env file.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
