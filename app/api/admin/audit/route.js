import { NextResponse } from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  normalizeEmail,
} from "../../../../lib/auth";


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
    adminEmail: email,
  };
}


function clean(value, max = 150) {
  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      max
    );
}


function safeMetadata(value) {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value;
}


export async function GET(request) {
  /*
   * Health Check بدون كشف بيانات.
   */

  if (!bearerToken(request)) {
    return json({
      ok: true,

      service:
        "AllWDbook Admin Security Audit",

      authenticationRequired:
        true,

      actions: [
        "list",
        "search",
        "filter_event",
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
      url.searchParams.get(
        "q"
      ),
      180
    ).toLowerCase();

  const eventFilter =
    clean(
      url.searchParams.get(
        "event"
      ),
      100
    );

  const accessKeyId =
    clean(
      url.searchParams.get(
        "accessKeyId"
      ),
      100
    );

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
    let auditQuery =
      auth.supabase
        .from(
          "allwdbook_access_audit"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(limit);


    if (eventFilter) {
      auditQuery =
        auditQuery.eq(
          "event_type",
          eventFilter
        );
    }


    if (accessKeyId) {
      auditQuery =
        auditQuery.eq(
          "access_key_id",
          accessKeyId
        );
    }


    const {
      data: auditData,
      error: auditError,
    } =
      await auditQuery;


    if (auditError) {
      console.error(
        "Admin audit load failed:",
        auditError
      );

      return json(
        {
          ok: false,
          error:
            "AUDIT_LOAD_FAILED",
        },
        500
      );
    }


    const auditItems =
      Array.isArray(
        auditData
      )
        ? auditData
        : [];


    /* ===============================================
       LOAD RELATED AWD-KEYS
       =============================================== */

    const keyIds =
      [
        ...new Set(
          auditItems
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
            "id, plan_id, code_hint, purchaser_email, recovery_email"
          )
          .in(
            "id",
            keyIds
          );


      if (!error) {
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


    /* ===============================================
       LOAD PLAN NAMES
       =============================================== */

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


    /* ===============================================
       SERIALIZE
       =============================================== */

    let items =
      auditItems.map(
        (item) => {
          const accessKey =
            keyMap.get(
              item.access_key_id
            ) || null;

          const plan =
            accessKey
              ? planMap.get(
                  accessKey.plan_id
                )
              : null;

          return {
            id:
              item.id,

            eventType:
              item.event_type ||
              "unknown",

            accessKeyId:
              item.access_key_id ||
              null,

            actorUserId:
              item.actor_user_id ||
              null,

            actorEmail:
              item.actor_email ||
              null,

            metadata:
              safeMetadata(
                item.metadata
              ),

            createdAt:
              item.created_at ||
              null,

            key:
              accessKey
                ? {
                    id:
                      accessKey.id,

                    codeHint:
                      accessKey.code_hint ||
                      "",

                    planId:
                      accessKey.plan_id,

                    planName:
                      plan?.name_ar ||
                      plan?.name_en ||
                      accessKey.plan_id,

                    purchaserEmail:
                      accessKey
                        .purchaser_email ||
                      null,

                    recoveryEmail:
                      accessKey
                        .recovery_email ||
                      null,
                  }
                : null,
          };
        }
      );


    /* ===============================================
       SEARCH
       =============================================== */

    if (search) {
      items =
        items.filter(
          (item) => {
            const values = [
              item.eventType,
              item.actorEmail,
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


    const eventTypes =
      [
        ...new Set(
          auditItems
            .map(
              (item) =>
                item.event_type
            )
            .filter(Boolean)
        ),
      ].sort();


    return json({
      ok: true,

      count:
        items.length,

      eventTypes,

      items,
    });
  } catch (error) {
    console.error(
      "Admin audit failed:",
      error
    );

    return json(
      {
        ok: false,

        error:
          "AUDIT_LOAD_FAILED",
      },
      500
    );
  }
}
