import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import {
  normalizeEmail,
  isValidEmail,
} from "../../../../lib/auth";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getBearerToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}

async function requireAdmin(request) {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "UNAUTHORIZED",
        },
        401
      ),
    };
  }

  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user?.email) {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "INVALID_SESSION",
        },
        401
      ),
    };
  }

  const email = normalizeEmail(user.email);

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("allwdbook_admins")
    .select("email, active")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Admin verification error:",
      adminError
    );

    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "ADMIN_CHECK_FAILED",
        },
        500
      ),
    };
  }

  if (!admin) {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "FORBIDDEN",
        },
        403
      ),
    };
  }

  return {
    ok: true,
    supabase,
    adminEmail: email,
  };
}

export async function GET(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("allwdbook_lifetime_access")
    .select(
     
