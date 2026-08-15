import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import {
  activateLifetimeLicense,
  createLifetimeLicense,
  recordLicenseAudit,
} from "../../../../lib/license";
import { sendLifetimeCodeEmail } from "../../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

const ORDER_EVENTS = new Set([
  "order_created",
  "order_refunded",
]);

function getPlanFromVariant(variantId) {
  const variants = new Map(
    [
      [
        process.env.LEMON_VARIANT_COVER,
        "cover",
      ],
      [
        process.env.LEMON_VARIANT_MICRO_NICHE,
        "micro_niche",
      ],
      [
        process.env.LEMON_VARIANT_KEYWORDS,
        "keywords",
      ],
      [
        process.env.LEMON_VARIANT_PRO_MONTHLY,
        "pro_monthly",
      ],
      [
        process.env.LEMON_VARIANT_PRO_YEARLY,
        "pro_yearly",
      ],
    ].filter(([id]) => Boolean(id)),
  );

  return (
    variants.get(
      String(variantId || ""),
    ) || null
  );
}

function isLifetimeVariant(variantId) {
  return (
    Boolean(
      process.env.LEMON_VARIANT_LIFETIME,
    ) &&
    String(variantId || "") ===
      String(
        process.env.LEMON_VARIANT_LIFETIME,
      )
  );
}

function validUuid(value) {
  const pattern = new RegExp(
    "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    "i",
  );

  return pattern.test(
    String(value || ""),
  );
}

function validSignature(
  body,
  signature,
  secret,
) {
  if (!body || !signature || !secret) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const first = Buffer.from(
    expected,
    "utf8",
  );

  const second = Buffer.from(
    signature,
    "utf8",
  );

  return (
    first.length === second.length &&
    crypto.timingSafeEqual(
      first,
      second,
    )
  );
}

function normalizedStatus(
  eventName,
  attributes,
) {
  if (
    eventName === "subscription_expired"
  ) {
    return "expired";
  }

  if (
    eventName === "subscription_cancelled"
  ) {
    return "cancelled";
  }

  if (
    eventName === "subscription_paused"
  ) {
    return "paused";
  }

  if (
    eventName === "subscription_resumed" ||
    eventName === "subscription_unpaused"
  ) {
    return "active";
  }

  const allowed = new Set([
    "inactive",
    "on_trial",
    "active",
    "paused",
    "past_due",
    "unpaid",
    "cancelled",
    "expired",
  ]);

  const status = String(
    attributes?.status || "inactive",
  );

  return allowed.has(status)
    ? status
    : "inactive";
}

async function handleLifetimeOrder(
  payload,
  eventName,
) {
  const supabase =
    getSupabaseAdmin();

  const attributes =
    payload?.data?.attributes || {};

  const customData =
    payload?.meta?.custom_data || {};

  const orderItem =
    attributes?.first_order_item || {};

  const orderId = String(
    payload?.data?.id ||
      attributes?.order_id ||
      "",
  );

  const variantId = String(
    orderItem?.variant_id ||
      attributes?.variant_id ||
      "",
  );

  if (!isLifetimeVariant(variantId)) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      event: eventName,
      reason: "NOT_LIFETIME_VARIANT",
    });
  }

  if (!orderId) {
    return NextResponse.json(
      {
        ok: false,
        error: "MISSING_ORDER_ID",
      },
      {
        status: 400,
      },
    );
  }

  const {
    data: existing,
    error: lookupError,
  } = await supabase
    .from(
      "allwdbook_lifetime_licenses",
    )
    .select("*")
    .eq("lemon_order_id", orderId)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "Lifetime order lookup failed:",
      lookupError,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "LIFETIME_LOOKUP_FAILED",
      },
      {
        status: 500,
      },
    );
  }

  if (eventName === "order_refunded") {
    if (existing) {
      const now =
        new Date().toISOString();

      const [
        {
          error: revokeError,
        },
        {
          error: activationError,
        },
      ] = await Promise.all([
        supabase
          .from(
            "allwdbook_lifetime_licenses",
          )
          .update({
            status: "refunded",
            revoked_at: now,
            updated_at: now,
          })
          .eq("id", existing.id),

        supabase
          .from(
            "allwdbook_license_activations",
          )
          .update({
            revoked_at: now,
          })
          .eq(
            "license_id",
            existing.id,
          )
          .is("revoked_at", null),
      ]);

      if (
        revokeError ||
        activationError
      ) {
        console.error(
          "Lifetime refund failed:",
          {
            revokeError,
            activationError,
          },
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

      await recordLicenseAudit(
        supabase,
        {
          licenseId: existing.id,
          eventType:
            "purchase_refunded",
          metadata: {
            orderId,
          },
        },
      );
    }

    return NextResponse.json({
      ok: true,
      event: eventName,
      plan: "lifetime",
    });
  }

  const userId = String(
    customData?.user_id || "",
  );

  if (!validUuid(userId)) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_USER_ID",
      },
      {
        status: 400,
      },
    );
  }

  let license = existing;
  let plainCode = null;

  try {
    if (!license) {
      const created =
        await createLifetimeLicense(
          supabase,
          {
            source: "purchase",

            purchaserEmail:
              String(
                attributes?.user_email ||
                  "",
              )
                .trim()
                .toLowerCase() || null,

            lemonOrderId: orderId,

            lemonCustomerId:
              attributes?.customer_id ==
              null
                ? null
                : String(
                    attributes.customer_id,
                  ),

            lemonProductId:
              orderItem?.product_id == null
                ? null
                : String(
                    orderItem.product_id,
                  ),

            lemonVariantId: variantId,

            testMode: Boolean(
              payload?.meta?.test_mode ||
                attributes?.test_mode,
            ),

            maxActivations: 3,
          },
        );

      license = created.license;
      plainCode = created.code;
    }

    const activation =
      await activateLifetimeLicense(
        supabase,
        license,
        userId,
      );

    if (activation.allowed === false) {
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
        licenseId: license.id,

        eventType: existing
          ? "purchase_replayed"
          : "purchase_completed",

        actorUserId: userId,

        metadata: {
          orderId,
          variantId,
        },
      },
    );

    const purchaserEmail = String(
      attributes?.user_email ||
        license.purchaser_email ||
        "",
    )
      .trim()
      .toLowerCase();

    if (
      plainCode &&
      purchaserEmail
    ) {
      const delivery =
        await sendLifetimeCodeEmail({
          email: purchaserEmail,
          code: plainCode,
        });

      await recordLicenseAudit(
        supabase,
        {
          licenseId: license.id,

          eventType: delivery.sent
            ? "purchase_code_emailed"
            : "purchase_code_email_failed",

          actorEmail: purchaserEmail,

          metadata: {
            reason:
              delivery.reason || null,
          },
        },
      );
    }

    return NextResponse.json({
      ok: true,
      event: eventName,
      plan: "lifetime",
      activated: true,
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

async function handleSubscription(
  payload,
  eventName,
) {
  const supabase =
    getSupabaseAdmin();

  const subscriptionId = String(
    payload?.data?.id || "",
  );

  const attributes =
    payload?.data?.attributes || {};

  const customData =
    payload?.meta?.custom_data || {};

  if (!subscriptionId) {
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

  const {
    data: existing,
    error: lookupError,
  } = await supabase
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

  if (lookupError) {
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

  const userId =
    existing?.user_id ||
    String(customData?.user_id || "");

  const variantId = String(
    attributes?.variant_id || "",
  );

  const planId =
    getPlanFromVariant(variantId) ||
    existing?.plan_id ||
    null;

  if (!validUuid(userId)) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_USER_ID",
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
        error: "UNKNOWN_VARIANT",
      },
      {
        status: 400,
      },
    );
  }

  const email = String(
    attributes?.user_email ||
      existing?.email ||
      "",
  )
    .trim()
    .toLowerCase();

  const urls =
    attributes?.urls || {};

  const pause =
    attributes?.pause || null;

  const record = {
    user_id: userId,
    email: email || null,
    plan_id: planId,

    status: normalizedStatus(
      eventName,
      attributes,
    ),

    lemon_subscription_id:
      subscriptionId,

    lemon_customer_id:
      attributes?.customer_id == null
        ? null
        : String(
            attributes.customer_id,
          ),

    lemon_order_id:
      attributes?.order_id == null
        ? null
        : String(
            attributes.order_id,
          ),

    lemon_product_id:
      attributes?.product_id == null
        ? null
        : String(
            attributes.product_id,
          ),

    lemon_variant_id:
      variantId || null,

    renews_at:
      attributes?.renews_at || null,

    ends_at:
      attributes?.ends_at || null,

    cancelled: Boolean(
      attributes?.cancelled,
    ),

    pause_mode: pause?.mode
      ? String(pause.mode)
      : null,

    customer_portal_url:
      urls?.customer_portal || null,

    update_payment_method_url:
      urls?.update_payment_method ||
      null,

    test_mode: Boolean(
      payload?.meta?.test_mode,
    ),

    last_event_name: eventName,

    last_event_at:
      new Date().toISOString(),
  };

  const {
    error: saveError,
  } = await supabase
    .from(
      "allwdbook_subscriptions",
    )
    .upsert(record, {
      onConflict:
        "lemon_subscription_id",
    });

  if (saveError) {
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

  return NextResponse.json({
    ok: true,
    event: eventName,
    plan: planId,
  });
}

export async function POST(request) {
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
        error: "INVALID_SIGNATURE",
      },
      {
        status: 401,
      },
    );
  }

  let payload;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      {
        status: 400,
      },
    );
  }

  const eventName = String(
    payload?.meta?.event_name || "",
  );

  if (ORDER_EVENTS.has(eventName)) {
    return handleLifetimeOrder(
      payload,
      eventName,
    );
  }

  if (
    SUBSCRIPTION_EVENTS.has(eventName)
  ) {
    return handleSubscription(
      payload,
      eventName,
    );
  }

  return NextResponse.json({
    ok: true,
    ignored: true,
    event: eventName || null,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service:
      "AllWDbook Lemon Squeezy webhook",
  });
}
