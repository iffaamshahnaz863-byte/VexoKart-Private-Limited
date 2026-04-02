export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ghzadiplpazekzgjbdxu.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoemFkaXBscGF6ZWt6Z2piZHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTg0OTAsImV4cCI6MjA4MjQ3NDQ5MH0.wpdheFIdeG53ucNGBgfb5h24P5HW1Qm-bkzJXyrPmQs';
export const BASE_API_URL = `${SUPABASE_URL}/rest/v1`;

// IMPORTANT: Do NOT use process.env.API_KEY for Supabase. 
// That key is reserved exclusively for the Google Gemini API.
// The Supabase REST API uses the 'apikey' header for identification.
export const API_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Content-Type': 'application/json'
};