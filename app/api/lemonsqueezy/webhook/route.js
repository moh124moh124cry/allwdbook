import crypto from "node:crypto";
import { NextResponse } from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  activateLifetimeLicense,
  createLifetimeLicense,
  recordLicenseAudit,
} from "../../../../lib/license";

import {
  sendLifetimeCodeEmail,
} from "../../../../lib/email";

import {
  activateAccessKey,
  createAccessKey,
  findAccessKeyByOrder,
  findAccessKeyBySubscription,
  recordAccessAudit,
} from "../../../../lib/accessKey";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";


/* =========================================================
   EVENTS
   ========================================================= */

const SUBSCRIPTION_EVENTS =
  new Set([
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_resumed",
    "subscription_expired",
    "subscription_paused",
    "subscription_unpaused",
  ]);

const ORDER_EVENTS =
  new Set([
    "order_created",
    "order_refunded",
  ]);


/* =========================================================
   PLAN FROM LEMON VARIANT
   ========================================================= */

function getPlanFromVariant(
  variantId,
) {
  const variants =
    new Map(
      [
        [
          process.env
            .LEMON_VARIANT_COVER,
          "cover",
        ],

        [
          process.env
            .LEMON_VARIANT_MICRO_NICHE,
          "micro_niche",
        ],

        [
          process.env
            .LEMON_VARIANT_KEYWORDS,
          "keywords",
        ],

        [
          process.env
            .LEMON_VARIANT_PRO_MONTHLY,
          "pro_monthly",
        ],

        [
          process.env
            .LEMON_VARIANT_PRO_YEARLY,
          "pro_yearly",
        ],
      ].filter(
        ([id]) =>
          Boolean(id),
      ),
    );

  return (
    variants.get(
      String(
        variantId || "",
      ),
    ) || null
  );
}


/* =========================================================
   LIFETIME VARIANT
   ========================================================= */

function isLifetimeVariant(
  variantId,
) {
  return (
    Boolean(
      process.env
        .LEMON_VARIANT_LIFETIME,
    ) &&
    String(
      variantId || "",
    ) ===
      String(
        process.env
          .LEMON_VARIANT_LIFETIME,
      )
  );
}


/* =========================================================
   UUID
   ========================================================= */

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(
      value || "",
    ),
  );
}


/* =========================================================
   WEBHOOK SIGNATURE
   ========================================================= */

function validSignature(
  body,
  signature,
  secret,
) {
  if (
    !body ||
    !signature ||
    !secret
  ) {
    return false;
  }

  const expected =
    crypto
      .createHmac(
        "sha256",
        secret,
      )
      .update(body)
      .digest("hex");

  const first =
    Buffer.from(
      expected,
      "utf8",
    );

  const second =
    Buffer.from(
      signature,
      "utf8",
    );

  return (
    first.length ===
      second.length &&
    crypto.timingSafeEqual(
      first,
      second,
    )
  );
}


/* =========================================================
   LEGACY SUBSCRIPTION STATUS
   ========================================================= */

function normalizedStatus(
  eventName,
  attributes,
) {
  if (
    eventName ===
    "subscription_expired"
  ) {
    return "expired";
  }

  if (
    eventName ===
    "subscription_cancelled"
  ) {
    return "cancelled";
  }

  if (
    eventName ===
    "subscription_paused"
  ) {
    return "paused";
  }

  if (
    eventName ===
      "subscription_resumed" ||
    eventName ===
      "subscription_unpaused"
  ) {
    return "active";
  }

  const allowed =
    new Set([
      "inactive",
      "on_trial",
      "active",
      "paused",
      "past_due",
      "unpaid",
      "cancelled",
      "expired",
    ]);

  const status =
    String(
      attributes?.status ||
        "inactive",
    );

  return allowed.has(
    status,
  )
    ? status
    : "inactive";
}


/* =========================================================
   NEW ACCESS KEY STATUS
   ========================================================= */

function normalizedAccessKeyStatus(
  eventName,
  attributes,
) {
  const status =
    normalizedStatus(
      eventName,
      attributes,
    );

  if (
    status === "active" ||
    status === "on_trial"
  ) {
    return "active";
  }

  if (
    status === "cancelled"
  ) {
    return "cancelled";
  }

  if (
    status === "expired"
  ) {
    return "expired";
  }

  /*
   * paused
   * past_due
   * unpaid
   * inactive
   */

  return "paused";
}


/* =========================================================
   HELPERS
   ========================================================= */

function valueOrNull(
  value,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}


function cleanEmail(
  value,
) {
  return String(
    value || "",
  )
    .trim()
    .toLowerCase();
}


/* =========================================================
   SUBSCRIPTION EXPIRY
   ========================================================= */

function subscriptionExpiry(
  eventName,
  attributes,
) {
  const status =
    normalizedStatus(
      eventName,
      attributes,
    );

  /*
   * عند إلغاء التجديد:
   * المستخدم يحتفظ بالوصول
   * إلى نهاية الفترة المدفوعة.
   */

  if (
    status ===
    "cancelled"
  ) {
    return (
      attributes?.ends_at ||
      attributes?.renews_at ||
      null
    );
  }

  return (
    attributes?.ends_at ||
    null
  );
}


/* =========================================================
   REVOKE UNIFIED ACCESS KEY
   ========================================================= */

async function revokeUnifiedKey(
  supabase,
  accessKey,
  {
    status =
      "revoked",

    eventType =
      "access_revoked",

    actorUserId =
      null,

    actorEmail =
      null,

    metadata =
      {},
  } = {},
) {
  if (!accessKey) {
    return;
  }

  const now =
    new Date()
      .toISOString();

  const [
    keyResult,
    activationResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "allwdbook_access_keys",
        )
        .update({
          status,

          revoked_at:
            now,

          updated_at:
            now,
        })
        .eq(
          "id",
          accessKey.id,
        ),

      supabase
        .from(
          "allwdbook_access_key_activations",
        )
        .update({
          revoked_at:
            now,
        })
        .eq(
          "access_key_id",
          accessKey.id,
        )
        .is(
          "revoked_at",
          null,
        ),
    ]);

  if (
    keyResult.error ||
    activationResult.error
  ) {
    throw new Error(
      "UNIFIED_ACCESS_REVOKE_FAILED:" +
        (
          keyResult.error
            ?.message ||
          activationResult
            .error
            ?.message ||
          "UNKNOWN"
        ),
    );
  }

  await recordAccessAudit(
    supabase,
    {
      accessKeyId:
        accessKey.id,

      eventType,

      actorUserId,

      actorEmail,

      metadata,
    },
  );
}


/* =========================================================
   LIFETIME ORDER
   ========================================================= */

async function handleLifetimeOrder(
  payload,
  eventName,
) {
  const supabase =
    getSupabaseAdmin();

  const attributes =
    payload
      ?.data
      ?.attributes ||
    {};

  const customData =
    payload
      ?.meta
      ?.custom_data ||
    {};

  const orderItem =
    attributes
      ?.first_order_item ||
    {};

  const orderId =
    String(
      payload
        ?.data
        ?.id ||
      attributes
        ?.order_id ||
      "",
    );

  const variantId =
    String(
      orderItem
        ?.variant_id ||
      attributes
        ?.variant_id ||
      "",
    );


  /* =======================================================
     IGNORE NON-LIFETIME ORDERS
     ======================================================= */

  if (
    !isLifetimeVariant(
      variantId,
    )
  ) {
    return NextResponse.json({
      ok: true,

      ignored: true,

      event:
        eventName,

      reason:
        "NOT_LIFETIME_VARIANT",
    });
  }


  if (!orderId) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "MISSING_ORDER_ID",
      },
      {
        status: 400,
      },
    );
  }


  /* =======================================================
     LOOKUP LEGACY LIFETIME
     ======================================================= */

  const legacyLookup =
    await supabase
      .from(
        "allwdbook_lifetime_licenses",
      )
      .select("*")
      .eq(
        "lemon_order_id",
        orderId,
      )
      .maybeSingle();

  if (
    legacyLookup.error
  ) {
    console.error(
      "Lifetime order lookup failed:",
      legacyLookup.error,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "LIFETIME_LOOKUP_FAILED",
      },
      {
        status: 500,
      },
    );
  }

  const existing =
    legacyLookup.data ||
    null;


  /* =======================================================
     LOOKUP UNIFIED KEY
     ======================================================= */

  let existingUnified =
    null;

  try {
    existingUnified =
      await findAccessKeyByOrder(
        supabase,
        orderId,
      );
  } catch (error) {
    console.error(
      "Unified lifetime lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "UNIFIED_LIFETIME_LOOKUP_FAILED",
      },
      {
        status: 500,
      },
    );
  }


  /* =======================================================
     REFUND
     ======================================================= */

  if (
    eventName ===
    "order_refunded"
  ) {
    try {
      /*
       * النظام القديم.
       */

      if (existing) {
        const now =
          new Date()
            .toISOString();

        const [
          revokeResult,
          activationResult,
        ] =
          await Promise.all([
            supabase
              .from(
                "allwdbook_lifetime_licenses",
              )
              .update({
                status:
                  "refunded",

                revoked_at:
                  now,

                updated_at:
                  now,
              })
              .eq(
                "id",
                existing.id,
              ),

            supabase
              .from(
                "allwdbook_license_activations",
              )
              .update({
                revoked_at:
                  now,
              })
              .eq(
                "license_id",
                existing.id,
              )
              .is(
                "revoked_at",
                null,
              ),
          ]);

        if (
          revokeResult.error ||
          activationResult.error
        ) {
          throw new Error(
            "LEGACY_LIFETIME_REVOKE_FAILED:" +
              (
                revokeResult
                  .error
                  ?.message ||
                activationResult
                  .error
                  ?.message ||
                "UNKNOWN"
              ),
          );
        }

        await recordLicenseAudit(
          supabase,
          {
            licenseId:
              existing.id,

            eventType:
              "purchase_refunded",

            metadata: {
              orderId,
            },
          },
        );
      }


      /*
       * النظام الموحد الجديد.
       */

      if (
        existingUnified
      ) {
        await revokeUnifiedKey(
          supabase,
          existingUnified,
          {
            status:
              "refunded",

            eventType:
              "purchase_refunded",

            metadata: {
              orderId,

              variantId,

              planId:
                "lifetime",
            },
          },
        );
      }


      return NextResponse.json({
        ok: true,

        event:
          eventName,

        plan:
          "lifetime",

        refunded:
          true,
      });
    } catch (error) {
      console.error(
        "Lifetime refund failed:",
        error,
      );

      return NextResponse.json(
        {
          ok: false,

          error:
            "LIFETIME_REVOKE_FAILED",
        },
        {
          status: 500,
        },
      );
    }
  }


  /* =======================================================
     PURCHASER USER ID
     ======================================================= */

  const userId =
    String(
      customData
        ?.user_id ||
      "",
    );

  if (
    !validUuid(
      userId,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "INVALID_USER_ID",
      },
      {
        status: 400,
      },
    );
  }


  const purchaserEmail =
    cleanEmail(
      attributes
        ?.user_email,
    );

  const customerId =
    valueOrNull(
      attributes
        ?.customer_id,
    );

  const productId =
    valueOrNull(
      orderItem
        ?.product_id,
    );

  const testMode =
    Boolean(
      payload
        ?.meta
        ?.test_mode ||
      attributes
        ?.test_mode,
    );


  let license =
    existing;

  let plainLegacyCode =
    null;

  let unifiedKey =
    existingUnified;


  try {
    /* =====================================================
       1. LEGACY LIFETIME SYSTEM
       يبقى مؤقتاً حتى ننقل الواجهة بالكامل.
       ===================================================== */

    if (!license) {
      const created =
        await createLifetimeLicense(
          supabase,
          {
            source:
              "purchase",

            purchaserEmail:
              purchaserEmail ||
              null,

            lemonOrderId:
              orderId,

            lemonCustomerId:
              customerId,

            lemonProductId:
              productId,

            lemonVariantId:
              variantId,

            testMode,

            maxActivations:
              3,
          },
        );

      license =
        created.license;

      plainLegacyCode =
        created.code;
    }


    const legacyActivation =
      await activateLifetimeLicense(
        supabase,
        license,
        userId,
      );

    if (
      legacyActivation
        .allowed ===
      false
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "ACTIVATION_LIMIT_REACHED",
        },
        {
          status: 409,
        },
      );
    }


    await recordLicenseAudit(
      supabase,
      {
        licenseId:
          license.id,

        eventType:
          existing
            ? "purchase_replayed"
            : "purchase_completed",

        actorUserId:
          userId,

        metadata: {
          orderId,

          variantId,
        },
      },
    );


    /* =====================================================
       2. UNIFIED ACCESS KEY
       ===================================================== */

    if (
      !unifiedKey
    ) {
      const created =
        await createAccessKey(
          supabase,
          {
            planId:
              "lifetime",

            source:
              "purchase",

            purchasedByUserId:
              userId,

            purchaserEmail:
              purchaserEmail ||
              null,

            maxActivations:
              3,

            lemonOrderId:
              orderId,

            lemonCustomerId:
              customerId,

            lemonProductId:
              productId,

            lemonVariantId:
              variantId,

            testMode,

            metadata: {
              eventName,

              legacyLifetimeLicenseId:
                license?.id ||
                null,
            },
          },
        );

      unifiedKey =
        created.accessKey;
    }


    /* =====================================================
       FIRST DEVICE ACTIVATION
       ===================================================== */

    const unifiedActivation =
      await activateAccessKey(
        supabase,
        unifiedKey,
        userId,
        {
          deviceName:
            "Purchase device",

          deviceInfo: {
            source:
              "lemon_squeezy",

            eventName,
          },
        },
      );


    if (
      unifiedActivation
        .allowed ===
      false
    ) {
      await recordAccessAudit(
        supabase,
        {
          accessKeyId:
            unifiedKey.id,

          eventType:
            "purchase_activation_blocked",

          actorUserId:
            userId,

          metadata: {
            reason:
              unifiedActivation
                .reason ||
              null,

            orderId,
          },
        },
      );
    } else {
      await recordAccessAudit(
        supabase,
        {
          accessKeyId:
            unifiedKey.id,

          eventType:
            existingUnified
              ? "purchase_replayed"
              : "purchase_completed",

          actorUserId:
            userId,

          metadata: {
            orderId,

            variantId,

            planId:
              "lifetime",
          },
        },
      );
    }


    /* =====================================================
       OLD LIFETIME EMAIL
       =====================================================
       نبقيه مؤقتاً حتى ننقل خانة الاستعادة
       إلى AWD-KEY الجديد.
       ===================================================== */

    if (
      plainLegacyCode &&
      purchaserEmail
    ) {
      const delivery =
        await sendLifetimeCodeEmail(
          {
            email:
              purchaserEmail,

            code:
              plainLegacyCode,
          },
        );

      await recordLicenseAudit(
        supabase,
        {
          licenseId:
            license.id,

          eventType:
            delivery.sent
              ? "purchase_code_emailed"
              : "purchase_code_email_failed",

          actorEmail:
            purchaserEmail,

          metadata: {
            reason:
              delivery.reason ||
              null,
          },
        },
      );
    }


    return NextResponse.json({
      ok: true,

      event:
        eventName,

      plan:
        "lifetime",

      activated:
        true,

      unifiedAccess:
        true,
    });
  } catch (error) {
    console.error(
      "Lifetime order failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "LIFETIME_PROCESSING_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}


/* =========================================================
   SUBSCRIPTION
   ========================================================= */

async function handleSubscription(
  payload,
  eventName,
) {
  const supabase =
    getSupabaseAdmin();

  const subscriptionId =
    String(
      payload
        ?.data
        ?.id ||
      "",
    );

  const attributes =
    payload
      ?.data
      ?.attributes ||
    {};

  const customData =
    payload
      ?.meta
      ?.custom_data ||
    {};


  if (
    !subscriptionId
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "MISSING_SUBSCRIPTION_ID",
      },
      {
        status: 400,
      },
    );
  }


  /* =======================================================
     CURRENT LEGACY SUBSCRIPTION
     ======================================================= */

  const {
    data: existing,

    error:
      lookupError,
  } =
    await supabase
      .from(
        "allwdbook_subscriptions",
      )
      .select(
        "user_id, email, plan_id",
      )
      .eq(
        "lemon_subscription_id",
        subscriptionId,
      )
      .maybeSingle();


  if (
    lookupError
  ) {
    console.error(
      "Subscription lookup failed:",
      lookupError,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "SUBSCRIPTION_LOOKUP_FAILED",
      },
      {
        status: 500,
      },
    );
  }


  /* =======================================================
     USER
     ======================================================= */

  const userId =
    existing?.user_id ||
    String(
      customData
        ?.user_id ||
      "",
    );


  const variantId =
    String(
      attributes
        ?.variant_id ||
      "",
    );


  const planId =
    getPlanFromVariant(
      variantId,
    ) ||
    existing?.plan_id ||
    null;


  if (
    !validUuid(
      userId,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "INVALID_USER_ID",
      },
      {
        status: 400,
      },
    );
  }


  if (!planId) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "UNKNOWN_VARIANT",
      },
      {
        status: 400,
      },
    );
  }


  const email =
    cleanEmail(
      attributes
        ?.user_email ||
      existing
        ?.email ||
      "",
    );


  const urls =
    attributes
      ?.urls ||
    {};


  const pause =
    attributes
      ?.pause ||
    null;


  const legacyStatus =
    normalizedStatus(
      eventName,
      attributes,
    );


  const unifiedStatus =
    normalizedAccessKeyStatus(
      eventName,
      attributes,
    );


  const expiresAt =
    subscriptionExpiry(
      eventName,
      attributes,
    );


  const testMode =
    Boolean(
      payload
        ?.meta
        ?.test_mode,
    );


  const customerId =
    valueOrNull(
      attributes
        ?.customer_id,
    );


  const orderId =
    valueOrNull(
      attributes
        ?.order_id,
    );


  const productId =
    valueOrNull(
      attributes
        ?.product_id,
    );


  /* =======================================================
     1. LEGACY SUBSCRIPTIONS TABLE
     =======================================================
     نبقي هذا كما هو حتى لا تتوقف
     الخطط الحالية أثناء الانتقال.
     ======================================================= */

  const record = {
    user_id:
      userId,

    email:
      email ||
      null,

    plan_id:
      planId,

    status:
      legacyStatus,

    lemon_subscription_id:
      subscriptionId,

    lemon_customer_id:
      customerId,

    lemon_order_id:
      orderId,

    lemon_product_id:
      productId,

    lemon_variant_id:
      variantId ||
      null,

    renews_at:
      attributes
        ?.renews_at ||
      null,

    ends_at:
      attributes
        ?.ends_at ||
      null,

    cancelled:
      Boolean(
        attributes
          ?.cancelled,
      ),

    pause_mode:
      pause?.mode
        ? String(
            pause.mode,
          )
        : null,

    customer_portal_url:
      urls
        ?.customer_portal ||
      null,

    update_payment_method_url:
      urls
        ?.update_payment_method ||
      null,

    test_mode:
      testMode,

    last_event_name:
      eventName,

    last_event_at:
      new Date()
        .toISOString(),
  };


  const {
    error:
      saveError,
  } =
    await supabase
      .from(
        "allwdbook_subscriptions",
      )
      .upsert(
        record,
        {
          onConflict:
            "lemon_subscription_id",
        },
      );


  if (
    saveError
  ) {
    console.error(
      "Subscription save failed:",
      saveError,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "SUBSCRIPTION_SAVE_FAILED",
      },
      {
        status: 500,
      },
    );
  }


  /* =======================================================
     2. UNIFIED ACCESS KEY
     ======================================================= */

  try {
    let accessKey =
      await findAccessKeyBySubscription(
        supabase,
        subscriptionId,
      );


    const existedBefore =
      Boolean(
        accessKey,
      );


    /* =====================================================
       CREATE KEY ON FIRST PURCHASE / MIGRATION
       ===================================================== */

    if (
      !accessKey
    ) {
      const created =
        await createAccessKey(
          supabase,
          {
            planId,

            source:
              "purchase",

            purchasedByUserId:
              userId,

            purchaserEmail:
              email ||
              null,

            maxActivations:
              3,

            lemonSubscriptionId:
              subscriptionId,

            lemonOrderId:
              orderId,

            lemonCustomerId:
              customerId,

            lemonProductId:
              productId,

            lemonVariantId:
              variantId ||
              null,

            testMode,

            expiresAt,

            metadata: {
              firstEventName:
                eventName,
            },
          },
        );

      accessKey =
        created.accessKey;
    }


    /* =====================================================
       SYNC KEY STATUS WITH LEMON
       ===================================================== */

    const now =
      new Date()
        .toISOString();


    const terminal =
      unifiedStatus ===
      "expired";


    const updateRecord = {
      plan_id:
        planId,

      status:
        unifiedStatus,

      lemon_subscription_id:
        subscriptionId,

      lemon_customer_id:
        customerId,

      lemon_order_id:
        orderId,

      lemon_product_id:
        productId,

      lemon_variant_id:
        variantId ||
        null,

      test_mode:
        testMode,

      expires_at:
        expiresAt,

      revoked_at:
        terminal
          ? now
          : null,

      updated_at:
        now,

      metadata: {
        ...(
          accessKey
            .metadata ||
          {}
        ),

        lastEventName:
          eventName,

        legacySubscriptionStatus:
          legacyStatus,
      },
    };


    if (email) {
      updateRecord
        .purchaser_email =
        email;
    }


    const {
      data:
        updatedKey,

      error:
        keyUpdateError,
    } =
      await supabase
        .from(
          "allwdbook_access_keys",
        )
        .update(
          updateRecord,
        )
        .eq(
          "id",
          accessKey.id,
        )
        .select("*")
        .single();


    if (
      keyUpdateError
    ) {
      throw new Error(
        "ACCESS_KEY_SYNC_FAILED:" +
          keyUpdateError
            .message,
      );
    }


    accessKey =
      updatedKey;


    /* =====================================================
       ACTIVATE PURCHASE DEVICE
       ===================================================== */

    let activationResult =
      null;


    if (
      unifiedStatus ===
        "active" ||
      unifiedStatus ===
        "cancelled"
    ) {
      activationResult =
        await activateAccessKey(
          supabase,
          accessKey,
          userId,
          {
            deviceName:
              "Purchase device",

            deviceInfo: {
              source:
                "lemon_squeezy",

              eventName,
            },
          },
        );
    }


    /* =====================================================
       AUDIT
       ===================================================== */

    await recordAccessAudit(
      supabase,
      {
        accessKeyId:
          accessKey.id,

        eventType:
          existedBefore
            ? "subscription_synced"
            : "subscription_access_created",

        actorUserId:
          userId,

        actorEmail:
          email ||
          null,

        metadata: {
          subscriptionId,

          planId,

          variantId,

          eventName,

          status:
            unifiedStatus,

          activationAllowed:
            activationResult
              ?.allowed ??
            null,

          activationReason:
            activationResult
              ?.reason ||
            null,
        },
      },
    );
  } catch (error) {
    /*
     * مهم:
     *
     * جدول allwdbook_subscriptions القديم
     * تم حفظه بالفعل قبل هذه النقطة.
     *
     * أي أن الخطط الحالية لن تتوقف.
     *
     * نرجع 500 فقط لكي يحاول Lemon Squeezy
     * إرسال Webhook مرة أخرى حتى ينجح
     * إنشاء Access Key الجديد.
     */

    console.error(
      "Unified subscription sync failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          "UNIFIED_ACCESS_SYNC_FAILED",
      },
      {
        status: 500,
      },
    );
  }


  return NextResponse.json({
    ok: true,

    event:
      eventName,

    plan:
      planId,

    unifiedAccess:
      true,
  });
}


/* =========================================================
   POST WEBHOOK
   ========================================================= */

export async function POST(
  request,
) {
  const secret =
    process.env
      .LEMONSQUEEZY_WEBHOOK_SECRET;


  if (!secret) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "WEBHOOK_NOT_CONFIGURED",
      },
      {
        status: 500,
      },
    );
  }


  const rawBody =
    await request.text();


  const signature =
    request.headers.get(
      "x-signature",
    ) || "";


  if (
    !validSignature(
      rawBody,
      signature,
      secret,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "INVALID_SIGNATURE",
      },
      {
        status: 401,
      },
    );
  }


  let payload;


  try {
    payload =
      JSON.parse(
        rawBody,
      );
  } catch {
    return NextResponse.json(
      {
        ok: false,

        error:
          "INVALID_JSON",
      },
      {
        status: 400,
      },
    );
  }


  const eventName =
    String(
      payload
        ?.meta
        ?.event_name ||
      "",
    );


  /* =======================================================
     LIFETIME
     ======================================================= */

  if (
    ORDER_EVENTS.has(
      eventName,
    )
  ) {
    return handleLifetimeOrder(
      payload,
      eventName,
    );
  }


  /* =======================================================
     MONTHLY / YEARLY
     ======================================================= */

  if (
    SUBSCRIPTION_EVENTS.has(
      eventName,
    )
  ) {
    return handleSubscription(
      payload,
      eventName,
    );
  }


  /* =======================================================
     OTHER EVENTS
     ======================================================= */

  return NextResponse.json({
    ok: true,

    ignored:
      true,

    event:
      eventName ||
      null,
  });
}


/* =========================================================
   HEALTH CHECK
   ========================================================= */

export async function GET() {
  return NextResponse.json({
    ok: true,

    service:
      "AllWDbook Lemon Squeezy webhook",

    accessKeys:
      "enabled",
  });
}
