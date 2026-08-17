import {
  getSupabaseAdmin,
} from "./supabaseAdmin";

import {
  normalizeEmail,
} from "./auth";

import {
  acceptsTestMode,
} from "./license";

import {
  accessKeyAllowsAccess,
} from "./accessKey";


/* =========================================================
   BEARER TOKEN
   ========================================================= */

function getBearerToken(
  request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    ) || "";

  return authorization.startsWith(
    "Bearer ",
  )
    ? authorization
        .slice(7)
        .trim()
    : "";
}


/* =========================================================
   LEGACY SUBSCRIPTION ACCESS
   ========================================================= */

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

  const status =
    String(
      subscription.status ||
        "",
    );

  const endsAt =
    subscription.ends_at
      ? new Date(
          subscription.ends_at,
        ).getTime()
      : null;

  const now =
    Date.now();


  if (
    status ===
      "active" ||
    status ===
      "on_trial"
  ) {
    return true;
  }


  if (
    status ===
    "past_due"
  ) {
    return (
      endsAt === null ||
      endsAt > now
    );
  }


  if (
    status ===
    "cancelled"
  ) {
    return (
      endsAt !== null &&
      endsAt > now
    );
  }


  if (
    status ===
    "paused"
  ) {
    return (
      subscription.pause_mode ===
      "free"
    );
  }


  return false;
}


/* =========================================================
   PRIMARY PLAN
   ========================================================= */

function primaryPlan(
  plans,
) {
  const priority = [
    "pro_yearly",
    "pro_monthly",
    "keywords",
    "micro_niche",
    "cover",
  ];


  return (
    priority.find(
      (planId) =>
        plans.includes(
          planId,
        ),
    ) || "free"
  );
}


/* =========================================================
   EMPTY ACCESS
   ========================================================= */

function emptyAccess() {
  return {
    authenticated:
      false,

    lifetime:
      false,

    lifetimeLicense:
      null,

    email:
      null,

    user:
      null,

    plan:
      "free",

    plans: [],

    subscriptions: [],

    paid:
      false,
  };
}


/* =========================================================
   OLD LIFETIME LICENSE ACCESS
   ========================================================= */

async function findLicenseAccess(
  supabase,
  userId,
) {
  const {
    data:
      activations,

    error:
      activationError,
  } =
    await supabase
      .from(
        "allwdbook_license_activations",
      )
      .select(
        "id, license_id",
      )
      .eq(
        "user_id",
        userId,
      )
      .is(
        "revoked_at",
        null,
      );


  if (
    activationError
  ) {
    console.error(
      "License activation access check failed:",
      activationError,
    );

    return null;
  }


  const ids =
    (
      activations ||
      []
    )
      .map(
        (item) =>
          item.license_id,
      )
      .filter(
        Boolean,
      );


  if (
    ids.length ===
    0
  ) {
    return null;
  }


  const {
    data:
      licenses,

    error:
      licenseError,
  } =
    await supabase
      .from(
        "allwdbook_lifetime_licenses",
      )
      .select(
        `
          id,
          code_hint,
          status,
          test_mode,
          recovery_email,
          email_verified_at
        `,
      )
      .in(
        "id",
        ids,
      )
      .eq(
        "status",
        "active",
      );


  if (
    licenseError
  ) {
    console.error(
      "Lifetime license access check failed:",
      licenseError,
    );

    return null;
  }


  const license =
    (
      licenses ||
      []
    ).find(
      (item) =>
        acceptsTestMode(
          item.test_mode,
        ),
    );


  if (license) {
    await supabase
      .from(
        "allwdbook_license_activations",
      )
      .update({
        last_seen_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "user_id",
        userId,
      )
      .eq(
        "license_id",
        license.id,
      );
  }


  return (
    license ||
    null
  );
}


/* =========================================================
   NEW AWD-KEY ACCESS
   =========================================================
   هذه الدالة هي الجسر بين:

   AWD-KEY
       ↓
   activation
       ↓
   /api/access
       ↓
   useAccess()
       ↓
   فتح الأدوات
   ========================================================= */

async function findUnifiedAccess(
  supabase,
  userId,
) {
  const empty = {
    keys: [],
    plans: [],
    lifetimeKey:
      null,
  };


  /* =======================================================
     1. DEVICE ACTIVATIONS
     ======================================================= */

  const {
    data:
      activations,

    error:
      activationError,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .select(
        `
          id,
          access_key_id,
          activated_at,
          last_seen_at
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .is(
        "revoked_at",
        null,
      );


  if (
    activationError
  ) {
    console.error(
      "Unified access activation lookup failed:",
      activationError,
    );

    return empty;
  }


  const accessKeyIds =
    [
      ...new Set(
        (
          activations ||
          []
        )
          .map(
            (item) =>
              item
                .access_key_id,
          )
          .filter(
            Boolean,
          ),
      ),
    ];


  if (
    accessKeyIds.length ===
    0
  ) {
    return empty;
  }


  /* =======================================================
     2. ACCESS KEYS
     ======================================================= */

  const {
    data:
      accessKeys,

    error:
      keyError,
  } =
    await supabase
      .from(
        "allwdbook_access_keys",
      )
      .select(
        `
          id,
          plan_id,
          code_hint,
          status,
          source,
          purchaser_email,
          recovery_email,
          recovery_email_verified_at,
          max_activations,
          test_mode,
          starts_at,
          expires_at,
          revoked_at,
          created_at
        `,
      )
      .in(
        "id",
        accessKeyIds,
      );


  if (keyError) {
    console.error(
      "Unified access key lookup failed:",
      keyError,
    );

    return empty;
  }


  /* =======================================================
     3. VALID KEYS ONLY
     ======================================================= */

  const usableKeys =
    (
      accessKeys ||
      []
    ).filter(
      (accessKey) =>
        accessKeyAllowsAccess(
          accessKey,
        ),
    );


  if (
    usableKeys.length ===
    0
  ) {
    return empty;
  }


  /* =======================================================
     4. UPDATE LAST SEEN
     ======================================================= */

  const usableIds =
    usableKeys.map(
      (item) =>
        item.id,
    );


  const {
    error:
      touchError,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .update({
        last_seen_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "user_id",
        userId,
      )
      .in(
        "access_key_id",
        usableIds,
      )
      .is(
        "revoked_at",
        null,
      );


  if (
    touchError
  ) {
    console.error(
      "Unified access last seen update failed:",
      touchError,
    );
  }


  /* =======================================================
     5. LIFETIME
     ======================================================= */

  const lifetimeKey =
    usableKeys.find(
      (item) =>
        item.plan_id ===
        "lifetime",
    ) ||
    null;


  /* =======================================================
     6. NORMAL PAID PLANS
     ======================================================= */

  const plans =
    [
      ...new Set(
        usableKeys
          .map(
            (item) =>
              String(
                item.plan_id ||
                  "",
              ),
          )
          .filter(
            (planId) =>
              Boolean(
                planId,
              ) &&
              planId !==
                "lifetime" &&
              planId !==
                "free",
          ),
      ),
    ];


  return {
    keys:
      usableKeys,

    plans,

    lifetimeKey,
  };
}


/* =========================================================
   MAIN ACCESS LOOKUP
   ========================================================= */

export async function getLifetimeAccess(
  request,
) {
  /* =======================================================
     1. SESSION
     ======================================================= */

  const token =
    getBearerToken(
      request,
    );


  if (!token) {
    return emptyAccess();
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
    return emptyAccess();
  }


  /* =======================================================
     2. OPTIONAL EMAIL
     ======================================================= */

  const email =
    user.email
      ? normalizeEmail(
          user.email,
        )
      : null;


  /* =======================================================
     3. LOAD ALL ACCESS SYSTEMS
     =======================================================
     نحافظ على الأنظمة القديمة حتى لا نخسر
     أي مستخدم سابق.

     - subscriptions القديمة
     - Lifetime القديم
     - AWD-KEY الجديد
     - Lifetime القديم بالبريد
     ======================================================= */

  const subscriptionPromise =
    supabase
      .from(
        "allwdbook_subscriptions",
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
        `,
      )
      .eq(
        "user_id",
        user.id,
      );


  const lifetimeLicensePromise =
    findLicenseAccess(
      supabase,
      user.id,
    );


  const unifiedAccessPromise =
    findUnifiedAccess(
      supabase,
      user.id,
    );


  const legacyLifetimePromise =
    email
      ? supabase
          .from(
            "allwdbook_lifetime_access",
          )
          .select(
            "email, active",
          )
          .eq(
            "email",
            email,
          )
          .eq(
            "active",
            true,
          )
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        });


  const [
    subscriptionsResult,
    lifetimeLicense,
    unifiedAccess,
    legacyResult,
  ] =
    await Promise.all([
      subscriptionPromise,
      lifetimeLicensePromise,
      unifiedAccessPromise,
      legacyLifetimePromise,
    ]);


  /* =======================================================
     4. LEGACY SUBSCRIPTION ERRORS
     ======================================================= */

  if (
    subscriptionsResult
      .error
  ) {
    console.error(
      "Subscription access check failed:",
      subscriptionsResult
        .error,
    );
  }


  if (
    legacyResult
      ?.error
  ) {
    console.error(
      "Legacy lifetime access check failed:",
      legacyResult.error,
    );
  }


  /* =======================================================
     5. OLD ACTIVE SUBSCRIPTIONS
     ======================================================= */

  const activeSubscriptions =
    (
      subscriptionsResult
        .data ||
      []
    ).filter(
      subscriptionHasAccess,
    );


  const subscriptionPlans =
    activeSubscriptions
      .map(
        (subscription) =>
          String(
            subscription
              .plan_id ||
              "",
          ),
      )
      .filter(
        Boolean,
      );


  /* =======================================================
     6. MERGE OLD + NEW PLANS
     ======================================================= */

  const plans =
    [
      ...new Set([
        ...subscriptionPlans,
        ...(
          unifiedAccess
            ?.plans ||
          []
        ),
      ]),
    ];


  /* =======================================================
     7. LIFETIME
     ======================================================= */

  const unifiedLifetimeKey =
    unifiedAccess
      ?.lifetimeKey ||
    null;


  const lifetime =
    Boolean(
      lifetimeLicense ||
      legacyResult?.data ||
      unifiedLifetimeKey,
    );


  /* =======================================================
     8. LIFETIME INFO
     =======================================================
     إذا جاء Lifetime من AWD-KEY فقط،
     ما زلنا نعيد معلومات مفيدة للقائمة.
     ======================================================= */

  let lifetimeLicenseInfo =
    null;


  if (
    lifetimeLicense
  ) {
    lifetimeLicenseInfo = {
      codeHint:
        lifetimeLicense
          .code_hint,

      recoveryEmail:
        lifetimeLicense
          .email_verified_at
          ? lifetimeLicense
              .recovery_email
          : null,

      recoveryEmailVerified:
        Boolean(
          lifetimeLicense
            .email_verified_at,
        ),

      system:
        "legacy",
    };
  } else if (
    unifiedLifetimeKey
  ) {
    lifetimeLicenseInfo = {
      codeHint:
        unifiedLifetimeKey
          .code_hint,

      recoveryEmail:
        unifiedLifetimeKey
          .recovery_email_verified_at
          ? unifiedLifetimeKey
              .recovery_email
          : null,

      recoveryEmailVerified:
        Boolean(
          unifiedLifetimeKey
            .recovery_email_verified_at,
        ),

      system:
        "access_key",
    };
  }


  /* =======================================================
     9. CONTACT / RECOVERY EMAIL
     ======================================================= */

  const verifiedUnifiedEmail =
    (
      unifiedAccess
        ?.keys ||
      []
    ).find(
      (item) =>
        item
          .recovery_email_verified_at &&
        item
          .recovery_email,
    )
      ?.recovery_email ||
    null;


  const purchaserEmail =
    (
      unifiedAccess
        ?.keys ||
      []
    ).find(
      (item) =>
        item
          .purchaser_email,
    )
      ?.purchaser_email ||
    null;


  const subscriptionEmail =
    activeSubscriptions.find(
      (item) =>
        item.email,
    )
      ?.email ||
    null;


  const contactEmail =
    email ||
    verifiedUnifiedEmail ||
    lifetimeLicense
      ?.recovery_email ||
    subscriptionEmail ||
    purchaserEmail ||
    null;


  /* =======================================================
     10. RETURN
     ======================================================= */

  return {
    authenticated:
      true,

    lifetime,

    lifetimeLicense:
      lifetimeLicenseInfo,

    email:
      contactEmail,

    user,

    plan:
      lifetime
        ? "lifetime_pro"
        : primaryPlan(
            plans,
          ),

    plans,

    subscriptions:
      activeSubscriptions,

    paid:
      lifetime ||
      plans.length > 0,
  };
}
