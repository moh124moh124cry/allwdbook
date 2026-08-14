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
      "id, email, active, note, created_by_email, created_at, updated_at"
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Lifetime list error:",
      error
    );

    return json(
      {
        ok: false,
        error: "LIST_FAILED",
      },
      500
    );
  }

  return json({
    ok: true,
    items: data || [],
  });
}

export async function POST(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      400
    );
  }

  const email = normalizeEmail(body?.email);
  const note = String(body?.note || "")
    .trim()
    .slice(0, 300);

  if (!isValidEmail(email)) {
    return json(
      {
        ok: false,
        error: "INVALID_EMAIL",
      },
      400
    );
  }

  const now = new Date().toISOString();

  const { data, error } = await auth.supabase
    .from("allwdbook_lifetime_access")
    .upsert(
      {
        email,
        active: true,
        note: note || null,
        created_by_email:
          auth.adminEmail,
        updated_at: now,
      },
      {
        onConflict: "email",
      }
    )
    .select(
      "id, email, active, note, created_by_email, created_at, updated_at"
    )
    .single();

  if (error) {
    console.error(
      "Lifetime add error:",
      error
    );

    return json(
      {
        ok: false,
        error: "ADD_FAILED",
      },
      500
    );
  }

  return json({
    ok: true,
    item: data,
  });
}

export async function DELETE(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      400
    );
  }

  const email = normalizeEmail(body?.email);

  if (!isValidEmail(email)) {
    return json(
      {
        ok: false,
        error: "INVALID_EMAIL",
      },
      400
    );
  }

  const { error } = await auth.supabase
    .from("allwdbook_lifetime_access")
    .delete()
    .eq("email", email);

  if (error) {
    console.error(
      "Lifetime delete error:",
      error
    );

    return json(
      {
        ok: false,
        error: "DELETE_FAILED",
      },
      500
    );
  }

  return json({
    ok: true,
    deletedEmail: email,
  });
}
