
export const SUPABASE_URL = 'https://ghzadiplpazekzgjbdxu.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_RKVgfomQ5gEkCaJqw7gH1A_fig5xfZd';
export const BASE_API_URL = `${SUPABASE_URL}/rest/v1`;

export const API_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
