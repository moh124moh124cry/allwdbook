import {
  getToolEntitlement,
} from "./plans";

import {
  getLifetimeAccess,
} from "./lifetimeAccess";

import {
  getSupabaseAdmin,
} from "./supabaseAdmin";

const ALLOWED_TOOLS =
  new Set([
    "coverDesigner",
    "microNiche",
    "keywords",
  ]);

function resolveEntitlement(
  access,
  toolId
) {
  if (access.lifetime) {
    return {
      access: true,
      unlimited: true,
      dailyLimit: null,
      plan: "lifetime_pro",
    };
  }

  const paidPlans =
    Array.isArray(access.plans)
      ? access.plans
      : [];

  const planIds = [
    "free",
    ...paidPlans,
  ];

  const entitlements =
    planIds.map((planId) => ({
      planId,

      entitlement:
        getToolEntitlement(
          planId,
          toolId
        ),
    }));

  const unlimited =
    entitlements.find(
      ({ entitlement }) =>
        entitlement.access ===
          true &&
        entitlement.dailyLimit ===
          null
    );

  if (unlimited) {
    return {
      access: true,
      unlimited: true,
      dailyLimit: null,
      plan: unlimited.planId,
    };
  }

  const limits =
    entitlements
      .filter(
        ({ entitlement }) =>
          entitlement.access ===
          true
      )
      .map(
        ({ entitlement }) =>
          Number(
            entitlement.dailyLimit ??
              0
          )
      )
      .filter(
        (limit) =>
          Number.isFinite(
            limit
          ) && limit > 0
      );

  if (
    limits.length === 0
  ) {
    return {
      access: false,
      unlimited: false,
      dailyLimit: 0,
      plan:
        access.plan || "free",
    };
  }

  return {
    access: true,
    unlimited: false,

    dailyLimit:
      Math.max(...limits),

    plan:
      access.plan || "free",
  };
}

export async function consumeToolUse(
  request,
  toolId
) {
  if (
    !ALLOWED_TOOLS.has(
      toolId
    )
  ) {
    return {
      allowed: false,
      reason: "INVALID_TOOL",
      used: 0,
      remaining: 0,
      unlimited: false,
    };
  }

  const access =
    await getLifetimeAccess(
      request
    );

  if (
    !access.authenticated
  ) {
    return {
      allowed: false,
      reason:
        "LOGIN_REQUIRED",
      used: 0,
      remaining: 0,
      unlimited: false,
    };
  }

  const entitlement =
    resolveEntitlement(
      access,
      toolId
    );

  if (
    !entitlement.access
  ) {
    return {
      allowed: false,
      reason:
        "PLAN_REQUIRED",
      used: 0,
      remaining: 0,
      unlimited: false,
      plan:
        entitlement.plan,
      dailyLimit: 0,
    };
  }

  if (
    entitlement.unlimited
  ) {
    return {
      allowed: true,
      reason: null,
      used: null,
      remaining: null,
      unlimited: true,
      plan:
        entitlement.plan,
      dailyLimit: null,
    };
  }

  const dailyLimit =
    Number(
      entitlement.dailyLimit
    );

  const userId =
    access.user?.id;

  if (!userId) {
    return {
      allowed: false,
      reason:
        "USER_REQUIRED",
      used: 0,
      remaining: 0,
      unlimited: false,
      plan:
        entitlement.plan,
      dailyLimit,
    };
  }

  const supabase =
    getSupabaseAdmin();

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const {
    data,
    error,
  } = await supabase.rpc(
    "allwdbook_consume_daily_use",
    {
      p_user_id: userId,
      p_tool_id: toolId,
      p_limit: dailyLimit,
      p_usage_date: today,
    }
  );

  if (error) {
    console.error(
      "Daily usage error:",
      error
    );

    return {
      allowed: false,
      reason:
        "USAGE_CHECK_FAILED",
      used: 0,
      remaining: 0,
      unlimited: false,
      plan:
        entitlement.plan,
      dailyLimit,
    };
  }

  const result =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!result) {
    return {
      allowed: false,
      reason:
        "USAGE_CHECK_FAILED",
      used: 0,
      remaining: 0,
      unlimited: false,
      plan:
        entitlement.plan,
      dailyLimit,
    };
  }

  return {
    allowed: Boolean(
      result.allowed
    ),

    reason:
      result.allowed
        ? null
        : "DAILY_LIMIT_REACHED",

    used: Number(
      result.used ?? 0
    ),

    remaining: Number(
      result.remaining ?? 0
    ),

    dailyLimit,
    unlimited: false,

    plan:
      entitlement.plan,
  };
}
