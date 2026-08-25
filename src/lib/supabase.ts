import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Vite replaces `import.meta.env.VITE_*` statically at bundle time.
const FALLBACK_URL = "https://duwvqfiledszzxlinroj.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1d3ZxZmlsZWRzenp4bGlucm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTE5MzQsImV4cCI6MjEwMzIyNzkzNH0.2GBoMpOqiTVqFJ6izUwzwNtKTTHILWRlS99p5pAueTQ";

const rawUrl =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  FALLBACK_URL;

const rawAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  FALLBACK_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawAnonKey &&
    rawUrl.startsWith("https://") &&
    rawAnonKey.length > 20,
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
