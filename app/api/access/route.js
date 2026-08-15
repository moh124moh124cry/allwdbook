import { NextResponse } from "next/server";
import { getLifetimeAccess } from "../../../lib/lifetimeAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const access =
      await getLifetimeAccess(request);

    return NextResponse.json(
      {
        ok: true,
        authenticated:
          access.authenticated,
        lifetime:
          access.lifetime,
        lifetimeLicense:
          access.lifetimeLicense,
        email: access.email,
        plan: access.plan,
        plans: access.plans,
        paid: access.paid,
        subscriptions:
          access.subscriptions,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Access lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        lifetime: false,
        lifetimeLicense: null,
        email: null,
        plan: "free",
        plans: [],
        paid: false,
        subscriptions: [],
        error: "ACCESS_LOOKUP_FAILED",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
