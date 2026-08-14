import { NextResponse } from "next/server";
import { getLifetimeAccess } from "../../../lib/lifetimeAccess";

export const dynamic =
  "force-dynamic";

const BILLING_URL =
  "https://allworldfactures.lemonsqueezy.com/billing";

export async function GET(
  request
) {
  try {
    const access =
      await getLifetimeAccess(
        request
      );

    if (
      !access.authenticated
    ) {
      return NextResponse.json({
        ok: true,
        authenticated: false,
        plan: "free",
        plans: [],
        paid: false,
        lifetime: false,
        email: null,
        subscriptions: [],
        billingUrl: null,
      });
    }

    const subscriptions = (
      access.subscriptions || []
    ).map((subscription) => ({
      plan:
        subscription.plan_id,

      status:
        subscription.status,

      renewsAt:
        subscription.renews_at ||
        null,

      endsAt:
        subscription.ends_at ||
        null,

      cancelled: Boolean(
        subscription.cancelled
      ),
    }));

    return NextResponse.json({
      ok: true,
      authenticated: true,

      plan:
        access.plan || "free",

      plans:
        access.plans || [],

      paid: Boolean(
        access.paid
      ),

      lifetime: Boolean(
        access.lifetime
      ),

      email:
        access.email,

      subscriptions,

      billingUrl:
        !access.lifetime &&
        access.paid
          ? BILLING_URL
          : null,
    });
  } catch (error) {
    console.error(
      "Access API error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "ACCESS_CHECK_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
