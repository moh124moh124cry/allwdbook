import { getSupabaseAdmin } from "./supabaseAdmin";
import { normalizeEmail } from "./auth";

function getBearerToken(request) {
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

function subscriptionHasAccess(
  subscription
) {
  if (!subscription) {
    return false;
  }

  if (
    subscription.test_mode ===
      true &&
    process.env
      .LEMONSQUEEZY_ACCEPT_TEST_MODE !==
      "true"
  ) {
    return false;
  }

  const status = String(
    subscription.status || ""
  );

  const endsAt =
    subscription.ends_at
      ? new Date(
          subscription.ends_at
        ).getTime()
      : null;

  const now = Date.now();

  if (
    status === "active" ||
    status === "on_trial"
  ) {
    return true;
  }

  if (status === "past_due") {
    return (
      endsAt === null ||
      endsAt > now
    );
  }

  if (
    status === "cancelled"
  ) {
    return (
      endsAt !== null &&
      endsAt > now
    );
  }

  if (status === "paused") {
    return (
      subscription.pause_mode ===
      "free"
    );
  }

  return false;
}

function primaryPlan(plans) {
  const priority = [
    "pro_yearly",
    "pro_monthly",
    "keywords",
    "micro_niche",
    "cover",
  ];

  return (
    priority.find((planId) =>
      plans.includes(planId)
    ) || "free"
  );
}

function emptyAccess() {
  return {
    authenticated: false,
    lifetime: false,
    email: null,
    user: null,
    plan: "free",
    plans: [],
    subscriptions: [],
    paid: false,
  };
}

export async function getLifetimeAccess(
  request
) {
  const token =
    getBearerToken(request);

  if (!token) {
    return emptyAccess();
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

  if (userError || !user) {
    return emptyAccess();
  }

  /*
   * مستخدم Supabase المجهول يستطيع
   * استخدام الخطة المجانية دون بريد.
   */
  if (!user.email) {
    return {
      authenticated: true,
      lifetime: false,
      email: null,
      user,
      plan: "free",
      plans: [],
      subscriptions: [],
      paid: false,
    };
  }

  const email =
    normalizeEmail(user.email);

  const [
    lifetimeResult,
    subscriptionsResult,
  ] = await Promise.all([
    supabase
      .from(
        "allwdbook_lifetime_access"
      )
      .select("email, active")
      .eq("email", email)
      .eq("active", true)
      .maybeSingle(),

    supabase
      .from(
        "allwdbook_subscriptions"
      )
      .select(
        "plan_id, status, ends_at, renews_at, cancelled, pause_mode, test_mode, customer_portal_url"
      )
      .eq("user_id", user.id),
  ]);

  if (lifetimeResult.error) {
    console.error(
      "Lifetime access check failed:",
      lifetimeResult.error
    );
  }

  if (
    subscriptionsResult.error
  ) {
    console.error(
      "Subscription access check failed:",
      subscriptionsResult.error
    );
  }

  const lifetime =
    Boolean(
      lifetimeResult.data
    );

  const activeSubscriptions =
    (
      subscriptionsResult.data ||
      []
    ).filter(
      subscriptionHasAccess
    );

  /*
   * يمكن للمستخدم امتلاك أكثر
   * من باقة منفصلة في الوقت نفسه.
   */
  const plans = [
    ...new Set(
      activeSubscriptions
        .map((subscription) =>
          String(
            subscription.plan_id ||
              ""
          )
        )
        .filter(Boolean)
    ),
  ];

  return {
    authenticated: true,
    lifetime,
    email,
    user,

    plan: lifetime
      ? "lifetime_pro"
      : primaryPlan(plans),

    plans,

    subscriptions:
      activeSubscriptions,

    paid:
      lifetime ||
      plans.length > 0,
  };
}
