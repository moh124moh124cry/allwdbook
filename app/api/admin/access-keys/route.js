import { NextResponse } from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  normalizeEmail,
} from "../../../../lib/auth";

import {
  accessKeyAllowsAccess,
  countAccessKeyActivations,
  findAccessKeyByCode,
  normalizeAccessKeyCode,
  recordAccessAudit,
  resetAccessKeyDevices,
  revealAccessKeyCode,
  revokeAccessKeyActivation,
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
   TOKEN
   ========================================================= */

function bearerToken(request) {
  const value =
    request.headers.get(
      "authorization"
    ) || "";

  if (
    !value.startsWith(
      "Bearer "
    )
  ) {
    return "";
  }

  return value
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

  if (
    adminError ||
    !admin
  ) {
    return {
      ok: false,

      response: json(
        {
          ok: false,
          error:
            adminError
              ? "ADMIN_CHECK_FAILED"
              : "FORBIDDEN",
        },
        adminError
          ? 500
          : 403
      ),
    };
  }

  return {
    ok: true,
    supabase,
    adminEmail: email,
    adminUserId: user.id,
  };
}


/* =========================================================
   SAFE EMAIL
   ========================================================= */

function cleanSearch(value) {
  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      180
    );
}


/* =========================================================
   PLAN
   ========================================================= */

async function loadPlan(
  supabase,
  planId
) {
  if (!planId) {
    return null;
  }

  const {
    data,
  } =
    await supabase
      .from(
        "allwdbook_plans"
      )
      .select(
        "id, name_ar, name_en, billing_type, billing_interval, price, currency"
      )
      .eq(
        "id",
        planId
      )
      .maybeSingle();

  return data || null;
}


/* =========================================================
   DEVICES
   ========================================================= */

async function loadDevices(
  supabase,
  accessKeyId
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations"
      )
      .select("*")
      .eq(
        "access_key_id",
        accessKeyId
      )
      .order(
        "activated_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      "DEVICES_LOAD_FAILED:" +
      error.message
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map(
    (item) => ({
      id:
        item.id,

      userId:
        item.user_id,

      deviceName:
        item.device_name ||
        "جهاز",

      deviceInfo:
        item.device_info ||
        {},

      active:
        !item.revoked_at,

      activatedAt:
        item.activated_at ||
        null,

      lastSeenAt:
        item.last_seen_at ||
        null,

      revokedAt:
        item.revoked_at ||
        null,
    })
  );
}


/* =========================================================
   SERIALIZE KEY
   ========================================================= */

async function serializeKey(
  supabase,
  accessKey,
  {
    includeDevices = false,
  } = {}
) {
  const [
    plan,
    activeDevices,
  ] =
    await Promise.all([
      loadPlan(
        supabase,
        accessKey.plan_id
      ),

      countAccessKeyActivations(
        supabase,
        accessKey.id
      ),
    ]);

  const devices =
    includeDevices
      ? await loadDevices(
          supabase,
          accessKey.id
        )
      : undefined;

  return {
    id:
      accessKey.id,

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

          price:
            plan.price,

          currency:
            plan.currency ||
            "USD",
        }
      : null,

    codeHint:
      accessKey.code_hint ||
      "",

    status:
      accessKey.status ||
      "",

    usable:
      accessKeyAllowsAccess(
        accessKey
      ),

    source:
      accessKey.source ||
      null,

    purchaserEmail:
      accessKey.purchaser_email ||
      null,

    recoveryEmail:
      accessKey.recovery_email ||
      null,

    recoveryEmailVerified:
      Boolean(
        accessKey
          .recovery_email_verified_at
      ),

    maxActivations:
      Number(
        accessKey.max_activations ||
        3
      ),

    activeDevices,

    startsAt:
      accessKey.starts_at ||
      null,

    expiresAt:
      accessKey.expires_at ||
      null,

    revokedAt:
      accessKey.revoked_at ||
      null,

    createdAt:
      accessKey.created_at ||
      null,

    createdByEmail:
      accessKey.created_by_email ||
      null,

    note:
      accessKey.note ||
      null,

    testMode:
      Boolean(
        accessKey.test_mode
      ),

    ...(includeDevices
      ? { devices }
      : {}),
  };
}


/* =========================================================
   LOAD KEY
   ========================================================= */

async function loadKeyById(
  supabase,
  accessKeyId
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_keys"
      )
      .select("*")
      .eq(
        "id",
        accessKeyId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      "KEY_LOOKUP_FAILED:" +
      error.message
    );
  }

  return data || null;
}


/* =========================================================
   GET
   ========================================================= */

export async function GET(request) {
  /*
   * Health Check عند فتح الرابط مباشرة.
   */

  if (!bearerToken(request)) {
    return json({
      ok: true,

      service:
        "AllWDbook Admin Access Keys",

      authenticationRequired:
        true,

      actions: [
        "search",
        "details",
        "reveal",
        "revoke_key",
        "reset_devices",
        "revoke_device",
      ],
    });
  }

  const auth =
    await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const url =
    new URL(
      request.url
    );

  const accessKeyId =
    cleanSearch(
      url.searchParams.get(
        "id"
      )
    );

  const search =
    cleanSearch(
      url.searchParams.get(
        "q"
      )
    );


  /* =======================================================
     DETAILS
     ======================================================= */

  if (accessKeyId) {
    try {
      const accessKey =
        await loadKeyById(
          auth.supabase,
          accessKeyId
        );

      if (!accessKey) {
        return json(
          {
            ok: false,
            error:
              "ACCESS_KEY_NOT_FOUND",
          },
          404
        );
      }

      return json({
        ok: true,

        item:
          await serializeKey(
            auth.supabase,
            accessKey,
            {
              includeDevices:
                true,
            }
          ),
      });
    } catch (error) {
      console.error(
        "Admin key detail failed:",
        error
      );

      return json(
        {
          ok: false,
          error:
            "KEY_DETAILS_FAILED",
        },
        500
      );
    }
  }


  /* =======================================================
     SEARCH BY FULL AWD-KEY
     ======================================================= */

  const normalizedCode =
    normalizeAccessKeyCode(
      search
    );

  if (normalizedCode) {
    try {
      const accessKey =
        await findAccessKeyByCode(
          auth.supabase,
          normalizedCode
        );

      if (!accessKey) {
        return json({
          ok: true,
          items: [],
        });
      }

      return json({
        ok: true,

        items: [
          await serializeKey(
            auth.supabase,
            accessKey
          ),
        ],
      });
    } catch (error) {
      console.error(
        "Admin code search failed:",
        error
      );

      return json(
        {
          ok: false,
          error:
            "KEY_SEARCH_FAILED",
        },
        500
      );
    }
  }


  /* =======================================================
     LIST / EMAIL SEARCH / HINT SEARCH
     ======================================================= */

  try {
    let query =
      auth.supabase
        .from(
          "allwdbook_access_keys"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(50);

    if (search) {
      if (
        search.includes("@")
      ) {
        query =
          query.or(
            `purchaser_email.ilike.%${search}%,recovery_email.ilike.%${search}%`
          );
      } else {
        query =
          query.ilike(
            "code_hint",
            `%${search}%`
          );
      }
    }

    const {
      data,
      error,
    } =
      await query;

    if (error) {
      throw error;
    }

    const items = [];

    for (
      const accessKey of
      Array.isArray(data)
        ? data
        : []
    ) {
      items.push(
        await serializeKey(
          auth.supabase,
          accessKey
        )
      );
    }

    return json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error(
      "Admin keys list failed:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "KEY_LIST_FAILED",
      },
      500
    );
  }
}


/* =========================================================
   POST
   ========================================================= */

export async function POST(request) {
  const rate =
    checkRateLimit(
      request,
      {
        name:
          "admin-access-keys",

        limit: 60,

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
      },
      429
    );
  }

  const auth =
    await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

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

  const action =
    String(
      body?.action || ""
    ).trim();

  const accessKeyId =
    String(
      body?.accessKeyId ||
      ""
    ).trim();


  /* =======================================================
     REVOKE DEVICE
     ======================================================= */

  if (
    action ===
    "revoke_device"
  ) {
    const activationId =
      String(
        body?.activationId ||
        ""
      ).trim();

    if (!activationId) {
      return json(
        {
          ok: false,
          error:
            "ACTIVATION_ID_REQUIRED",
        },
        400
      );
    }

    try {
      const removed =
        await revokeAccessKeyActivation(
          auth.supabase,
          activationId,
          {
            actorUserId:
              auth.adminUserId,

            actorEmail:
              auth.adminEmail,

            reason:
              "admin_device_remove",
          }
        );

      return json({
        ok: true,
        removed,
      });
    } catch (error) {
      console.error(
        "Admin device revoke failed:",
        error
      );

      return json(
        {
          ok: false,
          error:
            "DEVICE_REVOKE_FAILED",
        },
        500
      );
    }
  }


  /* =======================================================
     ACCESS KEY REQUIRED
     ======================================================= */

  if (!accessKeyId) {
    return json(
      {
        ok: false,
        error:
          "ACCESS_KEY_ID_REQUIRED",
      },
      400
    );
  }

  let accessKey;

  try {
    accessKey =
      await loadKeyById(
        auth.supabase,
        accessKeyId
      );
  } catch {
    return json(
      {
        ok: false,
        error:
          "KEY_LOOKUP_FAILED",
      },
      500
    );
  }

  if (!accessKey) {
    return json(
      {
        ok: false,
        error:
          "ACCESS_KEY_NOT_FOUND",
      },
      404
    );
  }


  /* =======================================================
     REVEAL
     ======================================================= */

  if (
    action === "reveal"
  ) {
    try {
      const code =
        revealAccessKeyCode(
          accessKey
        );

      await recordAccessAudit(
        auth.supabase,
        {
          accessKeyId:
            accessKey.id,

          eventType:
            "admin_key_revealed",

          actorUserId:
            auth.adminUserId,

          actorEmail:
            auth.adminEmail,
        }
      );

      return json({
        ok: true,
        code,
      });
    } catch (error) {
      console.error(
        "Admin reveal failed:",
        error
      );

      return json(
        {
          ok: false,
          error:
            "KEY_REVEAL_FAILED",
        },
        500
      );
    }
  }


  /* =======================================================
     RESET DEVICES
     ======================================================= */

  if (
    action ===
    "reset_devices"
  ) {
    try {
      await resetAccessKeyDevices(
        auth.supabase,
        accessKey.id,
        {
          actorEmail:
            auth.adminEmail,

          reason:
            "admin_reset",
        }
      );

      return json({
        ok: true,
        reset: true,
        activeDevices: 0,
      });
    } catch (error) {
      console.error(
        "Admin devices reset failed:",
        error
      );

      return json(
        {
          ok: false,
          error:
            "DEVICE_RESET_FAILED",
        },
        500
      );
    }
  }


  /* =======================================================
     REVOKE KEY
     ======================================================= */

  if (
    action ===
    "revoke_key"
  ) {
    const reason =
      String(
        body?.reason ||
        "admin_manual_revoke"
      )
        .trim()
        .slice(
          0,
          200
        );

    try {
      const now =
        new Date()
          .toISOString();

      const {
        error,
      } =
        await auth.supabase
          .from(
            "allwdbook_access_keys"
          )
          .update({
            status:
              "revoked",

            revoked_at:
              now,

            updated_at:
              now,
          })
          .eq(
            "id",
            accessKey.id
          );

      if (error) {
        throw error;
      }

      /*
       * إيقاف الأجهزة أيضًا.
       */
      await resetAccessKeyDevices(
        auth.supabase,
        accessKey.id,
        {
          actorEmail:
            auth.adminEmail,

          reason:
            "key_revoked",
        }
      );

      await recordAccessAudit(
        auth.supabase,
        {
          accessKeyId:
            accessKey.id,

          eventType:
            "admin_key_revoked",

          actorUserId:
            auth.adminUserId,

          actorEmail:
            auth.adminEmail,

          metadata: {
            reason,
          },
        }
      );

      return json({
        ok: true,
        revoked: true,
      });
    } catch (error) {
      console.error(
        "Admin key revoke failed:",
        error
      );

      return json(
        {
          ok: false,
          error:
            "KEY_REVOKE_FAILED",
        },
        500
      );
    }
  }


  return json(
    {
      ok: false,

      error:
        "INVALID_ACTION",

      allowedActions: [
        "reveal",
        "revoke_key",
        "reset_devices",
        "revoke_device",
      ],
    },
    400
  );
}
