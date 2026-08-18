import { NextResponse } from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  normalizeEmail,
} from "../../../../lib/auth";

import {
  resetAccessKeyDevices,
  revokeAccessKeyActivation,
} from "../../../../lib/accessKey";

import {
  checkRateLimit,
} from "../../../../lib/rateLimit";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


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

    adminEmail:
      email,

    adminUserId:
      user.id,
  };
}


function clean(value, max = 180) {
  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      max
    );
}


export async function GET(request) {
  /*
   * Health Check
   */

  if (!bearerToken(request)) {
    return json({
      ok: true,

      service:
        "AllWDbook Admin Devices",

      authenticationRequired:
        true,

      actions: [
        "list",
        "search",
        "revoke_device",
        "reset_key_devices",
      ],
    });
  }


  const auth =
    await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }


  const url =
    new URL(request.url);

  const search =
    clean(
      url.searchParams.get("q")
    ).toLowerCase();

  const showAll =
    url.searchParams.get("all") ===
    "1";

  const requestedLimit =
    Number(
      url.searchParams.get(
        "limit"
      )
    );

  const limit =
    Math.max(
      1,
      Math.min(
        200,

        Number.isFinite(
          requestedLimit
        ) &&
        requestedLimit > 0
          ? requestedLimit
          : 100
      )
    );


  try {
    /*
     * الأجهزة
     */

    let activationQuery =
      auth.supabase
        .from(
          "allwdbook_access_key_activations"
        )
        .select("*")
        .order(
          "last_seen_at",
          {
            ascending: false,
          }
        )
        .limit(limit);


    if (!showAll) {
      activationQuery =
        activationQuery.is(
          "revoked_at",
          null
        );
    }


    const {
      data: activationData,
      error: activationError,
    } =
      await activationQuery;


    if (activationError) {
      console.error(
        "Admin devices load failed:",
        activationError
      );

      return json(
        {
          ok: false,
          error:
            "DEVICES_LOAD_FAILED",
        },
        500
      );
    }


    const activations =
      Array.isArray(
        activationData
      )
        ? activationData
        : [];


    /*
     * المفاتيح المرتبطة
     */

    const keyIds =
      [
        ...new Set(
          activations
            .map(
              (item) =>
                item.access_key_id
            )
            .filter(Boolean)
        ),
      ];


    let accessKeys = [];

    if (keyIds.length) {
      const {
        data,
        error,
      } =
        await auth.supabase
          .from(
            "allwdbook_access_keys"
          )
          .select(
            `
              id,
              plan_id,
              code_hint,
              status,
              purchaser_email,
              recovery_email,
              max_activations,
              expires_at,
              revoked_at
            `
          )
          .in(
            "id",
            keyIds
          );


      if (error) {
        console.error(
          "Device keys load failed:",
          error
        );
      } else {
        accessKeys =
          data || [];
      }
    }


    const keyMap =
      new Map(
        accessKeys.map(
          (item) => [
            item.id,
            item,
          ]
        )
      );


    /*
     * أسماء الخطط
     */

    const planIds =
      [
        ...new Set(
          accessKeys
            .map(
              (item) =>
                item.plan_id
            )
            .filter(Boolean)
        ),
      ];


    let plans = [];

    if (planIds.length) {
      const {
        data,
      } =
        await auth.supabase
          .from(
            "allwdbook_plans"
          )
          .select(
            "id, name_ar, name_en"
          )
          .in(
            "id",
            planIds
          );

      plans =
        data || [];
    }


    const planMap =
      new Map(
        plans.map(
          (plan) => [
            plan.id,
            plan,
          ]
        )
      );


    /*
     * تحويل البيانات
     */

    let items =
      activations.map(
        (activation) => {
          const key =
            keyMap.get(
              activation
                .access_key_id
            ) || null;

          const plan =
            key
              ? planMap.get(
                  key.plan_id
                )
              : null;

          return {
            id:
              activation.id,

            userId:
              activation.user_id ||
              null,

            deviceName:
              activation.device_name ||
              "جهاز",

            deviceInfo:
              activation.device_info &&
              typeof activation
                .device_info ===
                "object"
                ? activation
                    .device_info
                : {},

            active:
              !activation
                .revoked_at,

            activatedAt:
              activation
                .activated_at ||
              null,

            lastSeenAt:
              activation
                .last_seen_at ||
              null,

            revokedAt:
              activation
                .revoked_at ||
              null,

            accessKeyId:
              activation
                .access_key_id ||
              null,

            key:
              key
                ? {
                    id:
                      key.id,

                    codeHint:
                      key.code_hint ||
                      "",

                    planId:
                      key.plan_id,

                    planName:
                      plan
                        ?.name_ar ||
                      plan
                        ?.name_en ||
                      key.plan_id,

                    purchaserEmail:
                      key
                        .purchaser_email ||
                      null,

                    recoveryEmail:
                      key
                        .recovery_email ||
                      null,

                    status:
                      key.status,

                    maxActivations:
                      Number(
                        key.max_activations ||
                        3
                      ),

                    expiresAt:
                      key.expires_at ||
                      null,

                    revoked:
                      Boolean(
                        key.revoked_at
                      ),
                  }
                : null,
          };
        }
      );


    /*
     * البحث
     */

    if (search) {
      items =
        items.filter(
          (item) => {
            const values = [
              item.deviceName,

              item.userId,

              item.deviceInfo
                ?.platform,

              item.deviceInfo
                ?.userAgent,

              item.key
                ?.codeHint,

              item.key
                ?.planId,

              item.key
                ?.planName,

              item.key
                ?.purchaserEmail,

              item.key
                ?.recoveryEmail,
            ];


            return values.some(
              (value) =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(
                    search
                  )
            );
          }
        );
    }


    return json({
      ok: true,

      showing:
        showAll
          ? "all"
          : "active",

      count:
        items.length,

      items,
    });
  } catch (error) {
    console.error(
      "Admin devices failed:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "DEVICES_LOAD_FAILED",
      },
      500
    );
  }
}


export async function POST(request) {
  const rate =
    checkRateLimit(
      request,
      {
        name:
          "admin-devices",

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
    clean(
      body?.action,
      60
    );


  /*
   * حذف جهاز واحد
   */

  if (
    action ===
    "revoke_device"
  ) {
    const activationId =
      clean(
        body?.activationId,
        120
      );


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
              "admin_devices_page",
          }
        );


      if (!removed) {
        return json(
          {
            ok: false,
            error:
              "DEVICE_NOT_FOUND",
          },
          404
        );
      }


      return json({
        ok: true,
        removed: true,
      });
    } catch (error) {
      console.error(
        "Admin remove device failed:",
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


  /*
   * إعادة ضبط جميع أجهزة المفتاح
   */

  if (
    action ===
    "reset_key_devices"
  ) {
    const accessKeyId =
      clean(
        body?.accessKeyId,
        120
      );


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


    const {
      data: accessKey,
      error: lookupError,
    } =
      await auth.supabase
        .from(
          "allwdbook_access_keys"
        )
        .select(
          "id"
        )
        .eq(
          "id",
          accessKeyId
        )
        .maybeSingle();


    if (lookupError) {
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


    try {
      await resetAccessKeyDevices(
        auth.supabase,
        accessKeyId,
        {
          actorEmail:
            auth.adminEmail,

          reason:
            "admin_devices_page",
        }
      );


      return json({
        ok: true,
        reset: true,
      });
    } catch (error) {
      console.error(
        "Admin reset devices failed:",
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


  return json(
    {
      ok: false,

      error:
        "INVALID_ACTION",

      allowedActions: [
        "revoke_device",
        "reset_key_devices",
      ],
    },
    400
  );
}
