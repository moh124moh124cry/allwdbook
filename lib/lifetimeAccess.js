import { getSupabaseAdmin } from "./supabaseAdmin";
import { normalizeEmail } from "./auth";
import { acceptsTestMode } from "./license";

function getBearerToken(request) {
  const authorization =
    request.headers.get("authorization") || "";

  return authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
}

function subscriptionHasAccess(
  subscription,
) {
  if (
    !subscription ||
    !acceptsTestMode(
      subscription.test_mode,
    )
  ) {
    return false;
  }

  const status = String(
    subscription.status || "",
  );

  const endsAt =
    subscription.ends_at
      ? new Date(
          subscription.ends_at,
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

  if (status === "cancelled") {
    return (
      endsAt !== null &&
      endsAt > now
    );
  }

  if (status === "paused") {
    return (
      subscription.pause_mode === "free"
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
      plans.includes(planId),
    ) || "free"
  );
}

function emptyAccess() {
  return {
    authenticated: false,
    lifetime: false,
    lifetimeLicense: null,
    email: null,
    user: null,
    plan: "free",
    plans: [],
    subscriptions: [],
    paid: false,
  };
}

async function findLicenseAccess(
  supabase,
  userId,
) {
  const {
    data: activations,
    error: activationError,
  } = await supabase
    .from(
      "allwdbook_license_activations",
    )
    .select("id, license_id")
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (activationError) {
    console.error(
      "License activation access check failed:",
      activationError,
    );

    return null;
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
    .from(
      "allwdbook_lifetime_licenses",
    )
    .select(
      "id, code_hint, status, test_mode, recovery_email, email_verified_at",
    )
    .in("id", ids)
    .eq("status", "active");

  if (licenseError) {
    console.error(
      "Lifetime license access check failed:",
      licenseError,
    );

    return null;
  }

  const license =
    (licenses || []).find((item) =>
      acceptsTestMode(item.test_mode),
    );

  if (license) {
    await supabase
      .from(
        "allwdbook_license_activations",
      )
      .update({
        last_seen_at:
          new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("license_id", license.id);
  }

  return license || null;
}

export async function getLifetimeAccess(
  request,
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
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return emptyAccess();
  }

  const email = user.email
    ? normalizeEmail(user.email)
    : null;

  const queries = [
    supabase
      .from(
        "allwdbook_subscriptions",
      )
      .select(
        "email, plan_id, status, ends_at, renews_at, cancelled, pause_mode, test_mode, customer_portal_url",
      )
      .eq("user_id", user.id),

    findLicenseAccess(
      supabase,
      user.id,
    ),
  ];

  if (email) {
    queries.push(
      supabase
        .from(
          "allwdbook_lifetime_access",
        )
        .select("email, active")
        .eq("email", email)
        .eq("active", true)
        .maybeSingle(),
    );
  }

  const [
    subscriptionsResult,
    lifetimeLicense,
    legacyResult,
  ] = await Promise.all(queries);

  if (subscriptionsResult.error) {
    console.error(
      "Subscription access check failed:",
      subscriptionsResult.error,
    );
  }

  if (legacyResult?.error) {
    console.error(
      "Legacy lifetime access check failed:",
      legacyResult.error,
    );
  }

  const activeSubscriptions =
    (
      subscriptionsResult.data || []
    ).filter(subscriptionHasAccess);

  const plans = [
    ...new Set(
      activeSubscriptions
        .map((subscription) =>
          String(
            subscription.plan_id || "",
          ),
        )
        .filter(Boolean),
    ),
  ];

  const lifetime = Boolean(
    lifetimeLicense ||
      legacyResult?.data,
  );

  const contactEmail =
    email ||
    lifetimeLicense?.recovery_email ||
    activeSubscriptions.find(
      (item) => item.email,
    )?.email ||
    null;

  return {
    authenticated: true,
    lifetime,

    lifetimeLicense:
      lifetimeLicense
        ? {
            codeHint:
              lifetimeLicense.code_hint,

            recoveryEmail:
              lifetimeLicense.email_verified_at
                ? lifetimeLicense.recovery_email
                : null,

            recoveryEmailVerified:
              Boolean(
                lifetimeLicense.email_verified_at,
              ),
          }
        : null,

    email: contactEmail,
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
