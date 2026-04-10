
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

console.log("Initializing Supabase client with URL:", SUPABASE_URL);
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase client initialized.");
