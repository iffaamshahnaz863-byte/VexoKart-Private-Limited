
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './constants.ts';

console.log("Initializing Supabase client with URL:", SUPABASE_URL);
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("Supabase client initialized.");
