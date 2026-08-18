import { NextResponse } from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  normalizeEmail,
} from "../../../../lib/auth";

import {
  accessKeyAllowsAccess,
} from "../../../../lib/accessKey";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}


function bearerToken(request) {
  const value =
    request.headers.get("authorization") || "";

  if (!value.startsWith("Bearer ")) {
    return "";
  }

  return value.slice(7).trim();
}


async function requireAdmin(request) {
  const token = bearerToken(request);

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
    error,
  } = await supabase.auth.getUser(token);

  if (
    error ||
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
    normalizeEmail(user.email);

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("allwdbook_admins")
    .select("email, active")
    .eq("email", email)
    .eq("active", true)
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
          error: adminError
            ? "ADMIN_CHECK_FAILED"
            : "FORBIDDEN",
        },
        adminError ? 500 : 403
      ),
    };
  }

  return {
    ok: true,
    supabase,
    adminEmail: email,
  };
}


function cleanEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function subscriptionHasAccess(item) {
  const status =
    String(item?.status || "");

  if (
    status === "active" ||
    status === "on_trial"
  ) {
    return true;
  }

  const endsAt =
    item?.ends_at
      ? new Date(item.ends_at).getTime()
      : null;

  if (
    (status === "cancelled" ||
      status === "past_due") &&
    endsAt &&
    endsAt > Date.now()
  ) {
    return true;
  }

  if (
    status === "paused" &&
    item?.pause_mode === "free"
  ) {
    return true;
  }

  return false;
}


function unique(values) {
  return [
    ...new Set(
      values.filter(Boolean)
    ),
  ];
}


export async function GET(request) {
  /* Health Check */

  if (!bearerToken(request)) {
    return json({
      ok: true,
      service:
        "AllWDbook Admin Customers",
      authenticationRequired: true,
      actions: [
        "list",
        "search_by_email",
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
    cleanEmail(
      url.searchParams.get("q")
    );


  try {
    /* ===============================================
       PLANS
       =============================================== */

    const {
      data: plansData,
    } =
      await auth.supabase
        .from("allwdbook_plans")
        .select(
          "id, name_ar, name_en"
        );


    const planMap =
      new Map();

    for (
      const plan of
      plansData || []
    ) {
      planMap.set(
        plan.id,
        {
          id: plan.id,
          nameAr:
            plan.name_ar ||
            plan.id,
          nameEn:
            plan.name_en ||
            plan.id,
        }
      );
    }


    /* ===============================================
       AWD-KEYS
       =============================================== */

    let accessKeys = [];

    if (search) {
      const [
        purchaserResult,
        recoveryResult,
      ] =
        await Promise.all([
          auth.supabase
            .from(
              "allwdbook_access_keys"
            )
            .select("*")
            .ilike(
              "purchaser_email",
              `%${search}%`
            )
            .limit(100),

          auth.supabase
            .from(
              "allwdbook_access_keys"
            )
            .select("*")
            .ilike(
              "recovery_email",
              `%${search}%`
            )
            .limit(100),
        ]);


      const merged =
        new Map();

      for (
        const item of [
          ...(purchaserResult.data || []),
          ...(recoveryResult.data || []),
        ]
      ) {
        merged.set(
          item.id,
          item
        );
      }

      accessKeys =
        [...merged.values()];
    } else {
      const {
        data,
      } =
        await auth.supabase
          .from(
            "allwdbook_access_keys"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(100);

      accessKeys =
        data || [];
    }


    /* ===============================================
       SUBSCRIPTIONS
       =============================================== */

    let subscriptionQuery =
      auth.supabase
        .from(
          "allwdbook_subscriptions"
        )
        .select(
          `
            email,
            plan_id,
            status,
            ends_at,
            renews_at,
            cancelled,
            pause_mode,
            test_mode,
            customer_portal_url
          `
        )
        .limit(100);


    if (search) {
      subscriptionQuery =
        subscriptionQuery.ilike(
          "email",
          `%${search}%`
        );
    }


    const {
      data: subscriptionsData,
    } =
      await subscriptionQuery;


    const subscriptions =
      subscriptionsData || [];


    /* ===============================================
       LEGACY LIFETIME
       =============================================== */

    let lifetimeQuery =
      auth.supabase
        .from(
          "allwdbook_lifetime_access"
        )
        .select(
          "email, active"
        )
        .eq(
          "active",
          true
        )
        .limit(100);


    if (search) {
      lifetimeQuery =
        lifetimeQuery.ilike(
          "email",
          `%${search}%`
        );
    }


    const {
      data: lifetimeData,
    } =
      await lifetimeQuery;


    const lifetimeItems =
      lifetimeData || [];


    /* ===============================================
       DEVICE COUNTS
       =============================================== */

    const keyIds =
      accessKeys
        .map((item) => item.id)
        .filter(Boolean);


    let activationData = [];

    if (keyIds.length) {
      const {
        data,
      } =
        await auth.supabase
          .from(
            "allwdbook_access_key_activations"
          )
          .select(
            "access_key_id, revoked_at"
          )
          .in(
            "access_key_id",
            keyIds
          )
          .is(
            "revoked_at",
            null
          );

      activationData =
        data || [];
    }


    const deviceCount =
      new Map();


    for (
      const activation of
      activationData
    ) {
      const keyId =
        activation.access_key_id;

      deviceCount.set(
        keyId,
        (
          deviceCount.get(keyId) ||
          0
        ) + 1
      );
    }


    /* ===============================================
       CUSTOMERS MAP
       =============================================== */

    const customers =
      new Map();


    function ensureCustomer(email) {
      const normalized =
        cleanEmail(email);

      if (!normalized) {
        return null;
      }

      if (
        !customers.has(normalized)
      ) {
        customers.set(
          normalized,
          {
            email: normalized,

            plans: [],

            accessKeys: [],

            subscriptions: [],

            activeDevices: 0,

            lifetime: false,

            recoveryEmails: [],
          }
        );
      }

      return customers.get(
        normalized
      );
    }


    /* AWD-KEY */

    for (
      const key of accessKeys
    ) {
      const ownerEmail =
        cleanEmail(
          key.purchaser_email ||
          key.recovery_email
        );

      const customer =
        ensureCustomer(
          ownerEmail
        );

      if (!customer) {
        continue;
      }

      const plan =
        planMap.get(
          key.plan_id
        );

      customer.accessKeys.push({
        id: key.id,

        planId:
          key.plan_id,

        planName:
          plan?.nameAr ||
          key.plan_id,

        codeHint:
          key.code_hint ||
          "",

        status:
          key.status,

        usable:
          accessKeyAllowsAccess(
            key
          ),

        activeDevices:
          deviceCount.get(
            key.id
          ) || 0,

        maxActivations:
          Number(
            key.max_activations ||
            3
          ),

        expiresAt:
          key.expires_at ||
          null,

        createdAt:
          key.created_at ||
          null,
      });


      if (
        accessKeyAllowsAccess(
          key
        )
      ) {
        customer.plans.push(
          key.plan_id
        );
      }


      customer.activeDevices +=
        deviceCount.get(
          key.id
        ) || 0;


      if (
        key.plan_id ===
          "lifetime" ||
        key.plan_id ===
          "lifetime_pro"
      ) {
        customer.lifetime =
          true;
      }


      if (
        key.recovery_email &&
        key.recovery_email_verified_at
      ) {
        customer
          .recoveryEmails
          .push(
            cleanEmail(
              key.recovery_email
            )
          );
      }
    }


    /* SUBSCRIPTIONS */

    for (
      const subscription of
      subscriptions
    ) {
      const customer =
        ensureCustomer(
          subscription.email
        );

      if (!customer) {
        continue;
      }

      const plan =
        planMap.get(
          subscription.plan_id
        );

      customer
        .subscriptions
        .push({
          planId:
            subscription.plan_id,

          planName:
            plan?.nameAr ||
            subscription.plan_id,

          status:
            subscription.status,

          active:
            subscriptionHasAccess(
              subscription
            ),

          endsAt:
            subscription.ends_at ||
            null,

          renewsAt:
            subscription.renews_at ||
            null,

          cancelled:
            Boolean(
              subscription.cancelled
            ),

          portalUrl:
            subscription
              .customer_portal_url ||
            null,
        });


      if (
        subscriptionHasAccess(
          subscription
        )
      ) {
        customer.plans.push(
          subscription.plan_id
        );
      }
    }


    /* LEGACY LIFETIME */

    for (
      const item of
      lifetimeItems
    ) {
      const customer =
        ensureCustomer(
          item.email
        );

      if (!customer) {
        continue;
      }

      customer.lifetime =
        true;

      customer.plans.push(
        "lifetime"
      );
    }


    /* ===============================================
       FINAL RESULT
       =============================================== */

    const items =
      [...customers.values()]
        .map(
          (customer) => ({
            ...customer,

            plans:
              unique(
                customer.plans
              ),

            recoveryEmails:
              unique(
                customer
                  .recoveryEmails
              ),

            accessKeyCount:
              customer
                .accessKeys
                .length,

            subscriptionCount:
              customer
                .subscriptions
                .length,
          })
        )
        .sort(
          (a, b) =>
            a.email.localeCompare(
              b.email
            )
        );


    return json({
      ok: true,

      query:
        search || null,

      count:
        items.length,

      items,
    });
  } catch (error) {
    console.error(
      "Admin customers failed:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "CUSTOMERS_LOAD_FAILED",
      },
      500
    );
  }
}
