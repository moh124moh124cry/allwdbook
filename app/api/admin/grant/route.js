import { NextResponse } from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  normalizeEmail,
} from "../../../../lib/auth";

import {
  createAccessKey,
  normalizeAccessEmail,
} from "../../../../lib/accessKey";

import {
  checkRateLimit,
} from "../../../../lib/rateLimit";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* =========================================================
   JSON
   ========================================================= */

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,

    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",

      Pragma:
        "no-cache",
    },
  });
}


/* =========================================================
   BEARER
   ========================================================= */

function bearerToken(request) {
  const authorization =
    request.headers.get(
      "authorization"
    ) || "";

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return "";
  }

  return authorization
    .slice(7)
    .trim();
}


/* =========================================================
   ADMIN AUTH
   ========================================================= */

async function requireAdmin(request) {
  const token =
    bearerToken(request);

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

  const supabase =
    getSupabaseAdmin();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser(
      token
    );

  if (
    userError ||
    !user?.email
  ) {
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

  const email =
    normalizeEmail(
      user.email
    );

  const {
    data: admin,
    error: adminError,
  } =
    await supabase
      .from(
        "allwdbook_admins"
      )
      .select(
        "email, active"
      )
      .eq(
        "email",
        email
      )
      .eq(
        "active",
        true
      )
      .maybeSingle();

  if (adminError) {
    console.error(
      "Admin grant auth failed:",
      adminError
    );

    return {
      ok: false,

      response: json(
        {
          ok: false,
          error:
            "ADMIN_CHECK_FAILED",
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


/* =========================================================
   PLAN EXPIRATION
   ========================================================= */

function planExpiresAt(plan) {
  const planId =
    String(
      plan?.id || ""
    ).toLowerCase();

  const billingType =
    String(
      plan?.billing_type || ""
    ).toLowerCase();

  const interval =
    String(
      plan?.billing_interval || ""
    ).toLowerCase();

  /*
   * Lifetime لا ينتهي.
   */
  if (
    planId === "lifetime" ||
    planId === "lifetime_pro" ||
    billingType === "lifetime"
  ) {
    return null;
  }

  const date =
    new Date();

  if (
    interval === "year" ||
    interval === "yearly" ||
    interval === "annual"
  ) {
    date.setUTCFullYear(
      date.getUTCFullYear() + 1
    );

    return date.toISOString();
  }

  /*
   * الخطط الشهرية:
   * cover
   * micro_niche
   * keywords
   * pro_monthly
   */
  if (
    interval === "month" ||
    interval === "monthly"
  ) {
    date.setUTCMonth(
      date.getUTCMonth() + 1
    );

    return date.toISOString();
  }

  /*
   * حماية إضافية لو كان billing_interval
   * غير موجود في سجل قديم.
   */
  if (
    planId === "cover" ||
    planId === "micro_niche" ||
    planId === "keywords" ||
    planId === "pro_monthly"
  ) {
    date.setUTCMonth(
      date.getUTCMonth() + 1
    );

    return date.toISOString();
  }

  if (
    planId === "pro_yearly"
  ) {
    date.setUTCFullYear(
      date.getUTCFullYear() + 1
    );

    return date.toISOString();
  }

  return null;
}


/* =========================================================
   SAFE PLAN
   ========================================================= */

function safePlan(plan) {
  return {
    id:
      plan.id,

    nameAr:
      plan.name_ar ||
      plan.name_en ||
      plan.id,

    nameEn:
      plan.name_en ||
      plan.name_ar ||
      plan.id,

    billingType:
      plan.billing_type ||
      null,

    billingInterval:
      plan.billing_interval ||
      null,

    price:
      plan.price ??
      plan.price_usd ??
      null,

    currency:
      plan.currency ||
      "USD",

    maxActivations:
      Number(
        plan.max_activations ||
        3
      ),
  };
}


/* =========================================================
   GET
   =========================================================
   بدون Bearer = Health Check
   مع Admin Bearer = قائمة الخطط القابلة للمنح
   ========================================================= */

export async function GET(request) {
  if (!bearerToken(request)) {
    return json({
      ok: true,

      service:
        "AllWDbook Admin Plan Grant",

      authenticationRequired:
        true,

      actions: [
        "list_plans",
        "grant_plan",
      ],
    });
  }

  const auth =
    await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const {
    data,
    error,
  } =
    await auth.supabase
      .from(
        "allwdbook_plans"
      )
      .select("*")
      .eq(
        "active",
        true
      )
      .neq(
        "id",
        "free"
      )
      .order(
        "price",
        {
          ascending: true,
        }
      );

  if (error) {
    console.error(
      "Admin plans load failed:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "PLANS_LOAD_FAILED",
      },
      500
    );
  }

  const plans =
    (Array.isArray(data)
      ? data
      : []
    ).map(safePlan);

  return json({
    ok: true,
    plans,
  });
}


/* =========================================================
   POST — GRANT PLAN
   ========================================================= */

export async function POST(request) {
  const rate =
    checkRateLimit(
      request,
      {
        name:
          "admin-plan-grant",

        limit: 30,

        windowMs:
          60 *
          60 *
          1000,
      }
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
      429
    );
  }


  /* =======================================================
     AUTH
     ======================================================= */

  const auth =
    await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }


  /* =======================================================
     BODY
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
      400
    );
  }


  /* =======================================================
     PLAN
     ======================================================= */

  const planId =
    String(
      body?.planId || ""
    ).trim();

  if (
    !planId ||
    planId === "free"
  ) {
    return json(
      {
        ok: false,
        error:
          "INVALID_PLAN",
      },
      400
    );
  }

  const {
    data: plan,
    error: planError,
  } =
    await auth.supabase
      .from(
        "allwdbook_plans"
      )
      .select("*")
      .eq(
        "id",
        planId
      )
      .eq(
        "active",
        true
      )
      .maybeSingle();

  if (planError) {
    console.error(
      "Admin plan lookup failed:",
      planError
    );

    return json(
      {
        ok: false,
        error:
          "PLAN_LOOKUP_FAILED",
      },
      500
    );
  }

  if (!plan) {
    return json(
      {
        ok: false,
        error:
          "PLAN_NOT_FOUND",
      },
      404
    );
  }


  /* =======================================================
     OPTIONAL EMAIL
     ======================================================= */

  const rawEmail =
    String(
      body?.email || ""
    ).trim();

  const customerEmail =
    rawEmail
      ? normalizeAccessEmail(
          rawEmail
        )
      : "";

  if (
    rawEmail &&
    !customerEmail
  ) {
    return json(
      {
        ok: false,
        error:
          "INVALID_EMAIL",
      },
      400
    );
  }


  /* =======================================================
     NOTE
     ======================================================= */

  const note =
    String(
      body?.note || ""
    )
      .trim()
      .slice(
        0,
        300
      );


  /* =======================================================
     ACTIVATIONS
     ======================================================= */

  const maxActivations =
    Math.max(
      1,
      Math.min(
        20,
        Number(
          plan.max_activations ||
          body?.maxActivations ||
          3
        ) || 3
      )
    );


  /* =======================================================
     EXPIRATION
     ======================================================= */

  const expiresAt =
    planExpiresAt(plan);


  /* =======================================================
     CREATE AWD-KEY
     ======================================================= */

  try {
    const result =
      await createAccessKey(
        auth.supabase,
        {
          planId:
            plan.id,

          source:
            "admin",

          /*
           * لا نربطه بجهاز الأدمن.
           * العميل سيستعمل AWD-KEY
           * في "استعادة خطتي".
           */
          purchasedByUserId:
            null,

          purchaserEmail:
            customerEmail ||
            null,

          /*
           * البريد لم يتحقق بعد،
           * لذلك لا نعتبره Recovery Email
           * موثقًا تلقائيًا.
           */
          recoveryEmail:
            null,

          recoveryEmailVerified:
            false,

          maxActivations,

          testMode:
            false,

          startsAt:
            new Date()
              .toISOString(),

          expiresAt,

          note:
            note ||
            "Manual Admin Grant",

          createdByEmail:
            auth.adminEmail,

          metadata: {
            manualGrant:
              true,

            grantedBy:
              auth.adminEmail,

            grantedToEmail:
              customerEmail ||
              null,

            planId:
              plan.id,
          },
        }
      );


    if (
      !result?.accessKey?.id ||
      !result?.code
    ) {
      return json(
        {
          ok: false,
          error:
            "GRANT_RESULT_MISSING",
        },
        500
      );
    }


    return json({
      ok: true,

      granted: true,

      accessKeyId:
        result.accessKey.id,

      code:
        result.code,

      codeHint:
        result.accessKey
          .code_hint ||
        "",

      plan:
        safePlan(
          result.plan ||
          plan
        ),

      customerEmail:
        customerEmail ||
        null,

      maxActivations,

      startsAt:
        result.accessKey
          .starts_at ||
        null,

      expiresAt:
        result.accessKey
          .expires_at ||
        null,

      lifetime:
        !result.accessKey
          .expires_at,

      message:
        "PLAN_GRANTED",
    });
  } catch (error) {
    console.error(
      "Admin plan grant failed:",
      error
    );

    const detail =
      String(
        error?.message ||
        ""
      ).slice(
        0,
        220
      );

    if (
      detail.includes(
        "PLAN_NOT_FOUND"
      )
    ) {
      return json(
        {
          ok: false,
          error:
            "PLAN_NOT_FOUND",
        },
        404
      );
    }

    if (
      detail.includes(
        "PLAN_NOT_ACTIVE"
      )
    ) {
      return json(
        {
          ok: false,
          error:
            "PLAN_NOT_ACTIVE",
        },
        400
      );
    }

    return json(
      {
        ok: false,

        error:
          "PLAN_GRANT_FAILED",

        detail,
      },
      500
    );
  }
}
