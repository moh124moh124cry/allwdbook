import {
  NextResponse,
} from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  accessKeyAllowsAccess,
  activateAccessKey,
  countAccessKeyActivations,
  findAccessKeyByCode,
  getAccessPlan,
  normalizeAccessKeyCode,
  recordAccessAudit,
} from "../../../../lib/accessKey";

import {
  checkRateLimit,
} from "../../../../lib/rateLimit";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


/* =========================================================
   JSON
   ========================================================= */

function json(
  data,
  status = 200,
) {
  return NextResponse.json(
    data,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",

        Pragma:
          "no-cache",
      },
    },
  );
}


/* =========================================================
   BEARER TOKEN
   ========================================================= */

function bearerToken(
  request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    ) || "";

  if (
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    return "";
  }

  return authorization
    .slice(7)
    .trim();
}


/* =========================================================
   SAFE DEVICE NAME
   ========================================================= */

function cleanDeviceName(
  value,
) {
  return String(
    value || "",
  )
    .trim()
    .slice(0, 80);
}


/* =========================================================
   SAFE DEVICE INFO
   ========================================================= */

function cleanDeviceInfo(
  value,
) {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const safe = {};

  if (value.platform) {
    safe.platform =
      String(
        value.platform,
      ).slice(0, 80);
  }

  if (value.language) {
    safe.language =
      String(
        value.language,
      ).slice(0, 30);
  }

  if (value.mobile !== undefined) {
    safe.mobile =
      Boolean(
        value.mobile,
      );
  }

  return safe;
}


/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request,
) {
  /* =======================================================
     1. RATE LIMIT
     ======================================================= */

  const rate =
    checkRateLimit(
      request,
      {
        name:
          "access-key-activate",

        /*
         * لا نسمح بمحاولات تخمين كثيرة.
         */

        limit: 10,

        windowMs:
          60 *
          60 *
          1000,
      },
    );


  if (!rate.ok) {
    return json(
      {
        ok: false,

        error:
          "RATE_LIMITED",

        retryAfter:
          rate.retryAfter,
      },
      429,
    );
  }


  /* =======================================================
     2. SESSION
     ======================================================= */

  const token =
    bearerToken(
      request,
    );


  if (!token) {
    return json(
      {
        ok: false,

        error:
          "UNAUTHORIZED",
      },
      401,
    );
  }


  const supabase =
    getSupabaseAdmin();


  const {
    data: {
      user,
    },

    error:
      userError,
  } =
    await supabase.auth.getUser(
      token,
    );


  if (
    userError ||
    !user
  ) {
    return json(
      {
        ok: false,

        error:
          "INVALID_SESSION",
      },
      401,
    );
  }


  /* =======================================================
     3. BODY
     ======================================================= */

  let body;


  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,

        error:
          "INVALID_JSON",
      },
      400,
    );
  }


  /* =======================================================
     4. NORMALIZE CODE
     ======================================================= */

  const code =
    normalizeAccessKeyCode(
      body?.code,
    );


  if (!code) {
    return json(
      {
        ok: false,

        error:
          "INVALID_ACCESS_KEY",
      },
      400,
    );
  }


  /* =======================================================
     5. FIND ACCESS KEY
     ======================================================= */

  let accessKey;


  try {
    accessKey =
      await findAccessKeyByCode(
        supabase,
        code,
      );
  } catch (error) {
    console.error(
      "Access key lookup failed:",
      error,
    );

    return json(
      {
        ok: false,

        error:
          "ACCESS_KEY_LOOKUP_FAILED",
      },
      500,
    );
  }


  /*
   * لا نوضح هل الكود موجود لكنه موقوف
   * أو غير موجود.
   *
   * هذا أفضل أمنياً.
   */

  if (
    !accessKey ||
    !accessKeyAllowsAccess(
      accessKey,
    )
  ) {
    await recordAccessAudit(
      supabase,
      {
        accessKeyId:
          accessKey?.id ||
          null,

        eventType:
          "activation_rejected",

        actorUserId:
          user.id,

        metadata: {
          reason:
            accessKey
              ? "ACCESS_NOT_ACTIVE"
              : "CODE_NOT_FOUND",
        },
      },
    );


    return json(
      {
        ok: false,

        error:
          "ACCESS_KEY_NOT_ACTIVE",
      },
      404,
    );
  }


  /* =======================================================
     6. ACTIVATE ON THIS DEVICE
     ======================================================= */

  try {
    const activation =
      await activateAccessKey(
        supabase,
        accessKey,
        user.id,
        {
          deviceName:
            cleanDeviceName(
              body?.deviceName,
            ) ||
            "Restored device",

          deviceInfo:
            cleanDeviceInfo(
              body?.deviceInfo,
            ),
        },
      );


    if (
      activation
        ?.allowed ===
      false
    ) {
      if (
        activation.reason ===
        "ACTIVATION_LIMIT_REACHED"
      ) {
        return json(
          {
            ok: false,

            error:
              "ACTIVATION_LIMIT_REACHED",

            activeDevices:
              activation.activeCount ||
              0,

            maxActivations:
              activation.maxActivations ||
              accessKey.max_activations ||
              3,
          },
          409,
        );
      }


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


    /* =====================================================
       7. PLAN INFO
       ===================================================== */

    const plan =
      await getAccessPlan(
        supabase,
        accessKey.plan_id,
      );


    const activeDevices =
      await countAccessKeyActivations(
        supabase,
        accessKey.id,
      );


    /* =====================================================
       8. AUDIT
       ===================================================== */

    await recordAccessAudit(
      supabase,
      {
        accessKeyId:
          accessKey.id,

        eventType:
          activation.existing
            ? "plan_restored_existing_device"
            : "plan_restored_new_device",

        actorUserId:
          user.id,

        metadata: {
          planId:
            accessKey.plan_id,

          activeDevices,

          maxActivations:
            Number(
              accessKey
                .max_activations ||
                3,
            ),
        },
      },
    );


    /* =====================================================
       9. RESPONSE

       مهم:
       لا نعيد الكود الكامل.
       الجهاز الجديد يرى فقط Hint.
       ===================================================== */

    return json({
      ok: true,

      restored: true,

      planId:
        accessKey.plan_id,

      plan: plan
        ? {
            id:
              plan.id,

            nameAr:
              plan.name_ar,

            nameEn:
              plan.name_en,

            billingType:
              plan.billing_type,

            billingInterval:
              plan.billing_interval,
          }
        : null,

      status:
        accessKey.status,

      codeHint:
        accessKey.code_hint,

      activeDevices,

      maxActivations:
        Number(
          accessKey
            .max_activations ||
            3,
        ),

      recoveryEmailVerified:
        Boolean(
          accessKey
            .recovery_email_verified_at,
        ),
    });
  } catch (error) {
    console.error(
      "Access key activation failed:",
      error,
    );


    return json(
      {
        ok: false,

        error:
          "ACCESS_KEY_ACTIVATION_FAILED",
      },
      500,
    );
  }
}


/* =========================================================
   HEALTH CHECK
   ========================================================= */

export async function GET() {
  return json({
    ok: true,

    service:
      "AllWDbook Access Key Activation",

    format:
      "AWD-KEY-XXXX-XXXX-XXXX-XXXX-XXXX",
  });
}
