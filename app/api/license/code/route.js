import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import {
  acceptsTestMode,
  decryptLicenseCode,
} from "../../../../lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearerToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  return authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
}

export async function GET(request) {
  const supabase = getSupabaseAdmin();
  const token = bearerToken(request);

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHORIZED",
      },
      {
        status: 401,
      },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_SESSION",
      },
      {
        status: 401,
      },
    );
  }

  const {
    data: activations,
    error: activationError,
  } = await supabase
    .from("allwdbook_license_activations")
    .select("license_id, activated_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("activated_at", {
      ascending: false,
    });

  if (activationError) {
    console.error(
      "License code activation lookup failed:",
      activationError,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "LICENSE_LOOKUP_FAILED",
      },
      {
        status: 500,
      },
    );
  }

  const licenseIds = (activations || []).map(
    (item) => item.license_id,
  );

  if (licenseIds.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "NO_LIFETIME_LICENSE",
      },
      {
        status: 404,
      },
    );
  }

  const {
    data: licenses,
    error: licenseError,
  } = await supabase
    .from("allwdbook_lifetime_licenses")
    .select(
      "id, code_ciphertext, code_hint, status, test_mode, recovery_email, email_verified_at",
    )
    .in("id", licenseIds)
    .eq("status", "active");

  if (licenseError) {
    console.error(
      "License code lookup failed:",
      licenseError,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "LICENSE_LOOKUP_FAILED",
      },
      {
        status: 500,
      },
    );
  }

  const license = (licenses || []).find(
    (item) => acceptsTestMode(item.test_mode),
  );

  if (!license) {
    return NextResponse.json(
      {
        ok: false,
        error: "NO_ACTIVE_LICENSE",
      },
      {
        status: 404,
      },
    );
  }

  try {
    return NextResponse.json(
      {
        ok: true,
        code: decryptLicenseCode(
          license.code_ciphertext,
        ),
        codeHint: license.code_hint,
        recoveryEmail: license.email_verified_at
          ? license.recovery_email
          : null,
        recoveryEmailVerified: Boolean(
          license.email_verified_at,
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "License decryption failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "LICENSE_DECRYPTION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}
