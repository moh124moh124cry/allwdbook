import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

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

function getPlanFromVariant(
  variantId
) {
  const value = String(
    variantId || ""
  );

  const variants = new Map(
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
    ].filter(([id]) =>
      Boolean(id)
    )
  );

  return (
    variants.get(value) || null
  );
}

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function validSignature(
  rawBody,
  signature,
  secret
) {
  if (
    !rawBody ||
    !signature ||
    !secret
  ) {
    return false;
  }

  const expected = crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(rawBody)
    .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8"
    );

  const signatureBuffer =
    Buffer.from(
      signature,
      "utf8"
    );

  if (
    expectedBuffer.length !==
    signatureBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    signatureBuffer
  );
}

function normalizedStatus(
  eventName,
  attributes
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
    "subscription_resumed"
  ) {
    return "active";
  }

  if (
    eventName ===
    "subscription_unpaused"
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
    attributes?.status ||
      "inactive"
  );

  return allowed.has(status)
    ? status
    : "inactive";
}

export async function POST(
  request
) {
  const secret =
    process.env
      .LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "Missing LEMONSQUEEZY_WEBHOOK_SECRET"
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "WEBHOOK_NOT_CONFIGURED",
      },
      {
        status: 500,
      }
    );
  }

  const rawBody =
    await request.text();

  const signature =
    request.headers.get(
      "x-signature"
    ) || "";

  if (
    !validSignature(
      rawBody,
      signature,
      secret
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
      }
    );
  }

  let payload;

  try {
    payload =
      JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      {
        status: 400,
      }
    );
  }

  const eventName = String(
    payload?.meta?.event_name ||
      ""
  );

  if (
    !SUBSCRIPTION_EVENTS.has(
      eventName
    )
  ) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      event:
        eventName || null,
    });
  }

  const subscriptionId =
    String(
      payload?.data?.id || ""
    );

  const attributes =
    payload?.data?.attributes ||
    {};

  const customData =
    payload?.meta?.custom_data ||
    {};

  if (!subscriptionId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "MISSING_SUBSCRIPTION_ID",
      },
      {
        status: 400,
      }
    );
  }

  const supabase =
    getSupabaseAdmin();

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from(
      "allwdbook_subscriptions"
    )
    .select(
      "user_id, email, plan_id"
    )
    .eq(
      "lemon_subscription_id",
      subscriptionId
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "Subscription lookup failed:",
      existingError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "SUBSCRIPTION_LOOKUP_FAILED",
      },
      {
        status: 500,
      }
    );
  }

  const userId =
    existing?.user_id ||
    String(
      customData?.user_id || ""
    );

  const variantId =
    String(
      attributes?.variant_id ||
        ""
    );

  const planId =
    getPlanFromVariant(
      variantId
    ) ||
    existing?.plan_id ||
    null;

  if (!validUuid(userId)) {
    console.error(
      "Webhook has no valid Supabase user ID",
      {
        eventName,
        subscriptionId,
      }
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "INVALID_USER_ID",
      },
      {
        status: 400,
      }
    );
  }

  if (!planId) {
    console.error(
      "Unknown Lemon Squeezy variant",
      {
        eventName,
        subscriptionId,
        variantId,
      }
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "UNKNOWN_VARIANT",
      },
      {
        status: 400,
      }
    );
  }

  const email = String(
    attributes?.user_email ||
      existing?.email ||
      ""
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
      attributes
    ),

    lemon_subscription_id:
      subscriptionId,

    lemon_customer_id:
      attributes?.customer_id ==
      null
        ? null
        : String(
            attributes.customer_id
          ),

    lemon_order_id:
      attributes?.order_id == null
        ? null
        : String(
            attributes.order_id
          ),

    lemon_product_id:
      attributes?.product_id ==
      null
        ? null
        : String(
            attributes.product_id
          ),

    lemon_variant_id:
      variantId || null,

    renews_at:
      attributes?.renews_at ||
      null,

    ends_at:
      attributes?.ends_at ||
      null,

    cancelled: Boolean(
      attributes?.cancelled
    ),

    pause_mode: pause?.mode
      ? String(pause.mode)
      : null,

    customer_portal_url:
      urls?.customer_portal ||
      null,

    update_payment_method_url:
      urls?.update_payment_method ||
      null,

    test_mode: Boolean(
      payload?.meta?.test_mode
    ),

    last_event_name:
      eventName,

    last_event_at:
      new Date().toISOString(),
  };

  const {
    error: saveError,
  } = await supabase
    .from(
      "allwdbook_subscriptions"
    )
    .upsert(record, {
      onConflict:
        "lemon_subscription_id",
    });

  if (saveError) {
    console.error(
      "Subscription save failed:",
      saveError
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "SUBSCRIPTION_SAVE_FAILED",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    event: eventName,
    plan: planId,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service:
      "AllWDbook Lemon Squeezy webhook",
  });
}
