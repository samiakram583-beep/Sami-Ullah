import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables or use configured project credentials
const DEFAULT_SUPABASE_URL = 'https://jgcidyssiktwcdstrkxw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_MFb-5-m6esrjKcj_w4el7w_GBlrxzuu';

const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // import.meta.env not available
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {
    // process.env not available
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY;

// Validate if real credentials have been provided
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

export const supabase = clientInstance;
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_PROJECT_ID = 'jgcidyssiktwcdstrkxw';
