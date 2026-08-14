import { getSupabaseAdmin } from "./supabaseAdmin";
import { normalizeEmail } from "./auth";

function getBearerToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}

export async function getLifetimeAccess(request) {
  const token = getBearerToken(request);

  if (!token) {
    return {
      authenticated: false,
      lifetime: false,
      email: null,
      user: null,
    };
  }

  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user?.email) {
    return {
      authenticated: false,
      lifetime: false,
      email: null,
      user: null,
    };
  }

  const email = normalizeEmail(user.email);

  const {
    data: lifetimeAccount,
    error: lifetimeError,
  } = await supabase
    .from("allwdbook_lifetime_access")
    .select("email, active")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (lifetimeError) {
    console.error(
      "Lifetime access check failed:",
      lifetimeError
    );

    return {
      authenticated: true,
      lifetime: false,
      email,
      user,
    };
  }

  return {
    authenticated: true,
    lifetime: Boolean(lifetimeAccount),
    email,
   
