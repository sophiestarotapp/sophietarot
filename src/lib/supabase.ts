import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase powers auth (Google / Apple / Email), reading history sync,
 * and vector memory (pgvector) in production. The app runs fully offline
 * with local persistence when these env vars are absent.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

export async function signInWithProvider(provider: "google" | "apple") {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/` },
  });
}

export async function signInWithEmail(email: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
}
