import { createClient } from '@supabase/supabase-js';

// Access environment variables. 
// Note: In Vite/Vercel, these should be set in the project dashboard.
// If these are missing, the app will gracefully degrade to local storage or show an error.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;