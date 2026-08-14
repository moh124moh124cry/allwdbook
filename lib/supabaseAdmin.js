import { createClient } from "@supabase/supabase-js";

let adminClient = null;

export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_ADMIN_SERVER_ONLY");
  }

  if (adminClient) {
    return adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("SUPABASE_ADMIN_CONFIG_MISSING");
  }

  adminClient = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}
