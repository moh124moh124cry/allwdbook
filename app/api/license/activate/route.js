import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import {
  acceptsTestMode,
  activateLifetimeLicense,
  hashLicenseCode,
  normalizeLicenseCode,
  recordLicenseAudit,
} from "../../../../lib/license";
import { checkRateLimit } from "../../../../lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function bearerToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  return authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
}

export async function POST(request) {
  const rate = checkRateLimit(request, {
    name: "license-activate",
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });

  if (!rate.ok) {
    return json(
      {
        ok: false,
        error: "RATE_LIMITED",
        retryAfter: rate.retryAfter,
      },
      429,
    );
  }

  const supabase = getSupabaseAdmin();
  const token = bearerToken(request);

  if (!token) {
    return json(
      {
        ok: false,
        error: "UNAUTHORIZED",
      },
      401,
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return json(
      {
        ok: false,
        error: "INVALID_SESSION",
      },
      401,
    );
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
      400,
    );
  }

  const code = normalizeLicenseCode(body?.code);
  const codeHash = hashLicenseCode(code);

  if (!code || !codeHash) {
    return json(
      {
        ok: false,
        error: "INVALID_LICENSE_CODE",
      },
      400,
    );
  }

  const {
    data: license,
    error: licenseError,
  } = await supabase
    .from("allwdbook_lifetime_licenses")
    .select(
      "id, status, code_hint, max_activations, test_mode, recovery_email, email_verified_at",
    )
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (licenseError) {
    console.error(
      "License lookup failed:",
      licenseError,
    );

    return json(
      {
        ok: false,
        error: "LICENSE_LOOKUP_FAILED",
      },
      500,
    );
  }

  if (
    !license ||
    license.status !== "active" ||
    !acceptsTestMode(license.test_mode)
  ) {
    return json(
      {
        ok: false,
        error: "LICENSE_NOT_ACTIVE",
      },
      404,
    );
  }

  try {
    const activation =
      await activateLifetimeLicense(
        supabase,
        license,
        user.id,
      );

    if (activation.allowed === false) {
      return json(
        {
          ok: false,
          error:
            activation.reason ||
            "ACTIVATION_NOT_ALLOWED",
        },
        409,
      );
    }

    await recordLicenseAudit(supabase, {
      licenseId: license.id,
      eventType: activation.existing
        ? "license_reactivated"
        : "license_activated",
      actorUserId: user.id,
    });

    return json({
      ok: true,
      lifetime: true,
      codeHint: license.code_hint,
      recoveryEmailVerified: Boolean(
        license.email_verified_at,
      ),
    });
  } catch (error) {
    console.error(
      "License activation failed:",
      error,
    );

    return json(
      {
        ok: false,
        error: "ACTIVATION_FAILED",
      },
      500,
    );
  }
}
