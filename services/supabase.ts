import { createClient } from '@supabase/supabase-js';

// Robust environment variable retrieval for Vite or standard process.env
const getEnv = (key: string) => {
    // Check for Vite's import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env[key];
    }
    // Check for standard process.env (Create React App / Next.js / Node)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        return process.env[key];
    }
    return undefined;
};

// Access environment variables. 
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;