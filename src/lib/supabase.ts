import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Strip any trailing path (e.g. /rest/v1/) — createClient needs the bare project URL
const supabaseUrl = rawUrl ? rawUrl.replace(/\/(rest\/v1\/?)?$/, "") : undefined;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (supabaseConfigured) {
  console.log("[Supabase] Client initialized. Project URL:", supabaseUrl);
} else {
  console.warn("[Supabase] Not configured — VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing");
}
