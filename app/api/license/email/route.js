import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import {
  isValidEmail,
  normalizeEmail,
} from "../../../../lib/auth";
import {
  acceptsTestMode,
  generateEmailOtp,
  hashEmailOtp,
  recordLicenseAudit,
  safeEqualHex,
} from "../../../../lib/license";
import { sendLicenseOtpEmail } from "../../../../lib/email";
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

async function activeLicenseForUser(
  supabase,
  userId,
) {
  const {
    data: activations,
    error,
  } = await supabase
    .from("allwdbook_license_activations")
    .select("license_id")
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (error) {
    throw error;
  }

  const ids = (activations || []).map(
    (item) => item.license_id,
  );

  if (ids.length === 0) {
    return null;
  }

  const {
    data: licenses,
    error: licenseError,
  } = await supabase
    .from("allwdbook_lifetime_licenses")
    .select("id, status, test_mode")
    .in("id", ids)
    .eq("status", "active");

  if (licenseError) {
    throw licenseError;
  }

  return (
    (licenses || []).find((item) =>
      acceptsTestMode(item.test_mode),
    ) || null
  );
}

export async function POST(request) {
  const rate = checkRateLimit(request, {
    name: "license-email",
    limit: 10,
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

  const action = String(body?.action || "");
  const email = normalizeEmail(body?.email);

  if (!isValidEmail(email)) {
    return json(
      {
        ok: false,
        error: "INVALID_EMAIL",
      },
      400,
    );
  }

  let license;

  try {
    license = await activeLicenseForUser(
      supabase,
      user.id,
    );
  } catch (error) {
    console.error(
      "Recovery email license lookup failed:",
      error,
    );

    return json(
      {
        ok: false,
        error: "LICENSE_LOOKUP_FAILED",
      },
      500,
    );
  }

  if (!license) {
    return json(
      {
        ok: false,
        error: "NO_ACTIVE_LICENSE",
      },
      404,
    );
  }

  if (action === "send") {
    const otp = generateEmailOtp();

    const otpHash = hashEmailOtp({
      licenseId: license.id,
      email,
      purpose: "verify_email",
      otp,
    });

    const delivery =
      await sendLicenseOtpEmail({
        email,
        otp,
        purpose: "verify_email",
      });

    if (!delivery.sent) {
      return json(
        {
          ok: false,
          error: delivery.reason,
        },
        503,
      );
    }

    const {
      error,
    } = await supabase
      .from(
        "allwdbook_license_email_codes",
      )
      .insert({
        license_id: license.id,
        email,
        purpose: "verify_email",
        otp_hash: otpHash,
        expires_at: new Date(
          Date.now() + 10 * 60 * 1000,
        ).toISOString(),
      });

    if (error) {
      console.error(
        "Recovery email code save failed:",
        error,
      );

      return json(
        {
          ok: false,
          error: "CODE_SAVE_FAILED",
        },
        500,
      );
    }

    return json({
      ok: true,
      sent: true,
    });
  }

  if (action === "verify") {
    const otp = String(
      body?.otp || "",
    ).trim();

    if (!new RegExp("^\\d{6}$").test(otp)) {
      return json(
        {
          ok: false,
          error: "INVALID_OTP",
        },
        400,
      );
    }

    const {
      data: codeRecord,
      error,
    } = await supabase
      .from(
        "allwdbook_license_email_codes",
      )
      .select(
        "id, otp_hash, expires_at, attempts",
      )
      .eq("license_id", license.id)
      .eq("email", email)
      .eq("purpose", "verify_email")
      .is("consumed_at", null)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Recovery email code lookup failed:",
        error,
      );

      return json(
        {
          ok: false,
          error: "CODE_LOOKUP_FAILED",
        },
        500,
      );
    }

    if (
      !codeRecord ||
      codeRecord.attempts >= 5 ||
      new Date(
        codeRecord.expires_at,
      ).getTime() < Date.now()
    ) {
      return json(
        {
          ok: false,
          error: "OTP_EXPIRED",
        },
        400,
      );
    }

    const expectedHash = hashEmailOtp({
      licenseId: license.id,
      email,
      purpose: "verify_email",
      otp,
    });

    if (
      !safeEqualHex(
        expectedHash,
        codeRecord.otp_hash,
      )
    ) {
      await supabase
        .from(
          "allwdbook_license_email_codes",
        )
        .update({
          attempts:
            codeRecord.attempts + 1,
        })
        .eq("id", codeRecord.id);

      return json(
        {
          ok: false,
          error: "OTP_INCORRECT",
        },
        400,
      );
    }

    const now =
      new Date().toISOString();

    const [
      {
        error: licenseUpdateError,
      },
      {
        error: codeUpdateError,
      },
    ] = await Promise.all([
      supabase
        .from(
          "allwdbook_lifetime_licenses",
        )
        .update({
          recovery_email: email,
          email_verified_at: now,
          updated_at: now,
        })
        .eq("id", license.id),

      supabase
        .from(
          "allwdbook_license_email_codes",
        )
        .update({
          consumed_at: now,
        })
        .eq("id", codeRecord.id),
    ]);

    if (
      licenseUpdateError ||
      codeUpdateError
    ) {
      console.error(
        "Recovery email verification save failed:",
        {
          licenseUpdateError,
          codeUpdateError,
        },
      );

      return json(
        {
          ok: false,
          error: "VERIFY_SAVE_FAILED",
        },
        500,
      );
    }

    await recordLicenseAudit(
      supabase,
      {
        licenseId: license.id,
        eventType:
          "recovery_email_verified",
        actorUserId: user.id,
        actorEmail: email,
      },
    );

    return json({
      ok: true,
      verified: true,
    });
  }

  return json(
    {
      ok: false,
      error: "INVALID_ACTION",
    },
    400,
  );
}
