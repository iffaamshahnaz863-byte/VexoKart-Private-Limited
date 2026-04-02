export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ghzadiplpazekzgjbdxu.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RKVgfomQ5gEkCaJqw7gH1A_fig5xfZd';
export const BASE_API_URL = `${SUPABASE_URL}/rest/v1`;

// IMPORTANT: Do NOT use process.env.API_KEY for Supabase. 
// That key is reserved exclusively for the Google Gemini API.
// The Supabase REST API uses the 'apikey' header for identification.
export const API_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Content-Type': 'application/json'
};