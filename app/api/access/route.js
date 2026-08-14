import { NextResponse } from "next/server";
import { getLifetimeAccess } from "../../../lib/lifetimeAccess";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const access = await getLifetimeAccess(request);

    if (!access.authenticated) {
      return NextResponse.json({
        ok: true,
        authenticated: false,
        plan: "free",
        lifetime: false,
        email: null,
      });
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      plan: access.lifetime
        ? "lifetime_pro"
        : "free",
      lifetime: access.lifetime,
      email: access.email,
    });
  } catch (error) {
    console.error("Access API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "ACCESS_CHECK_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}
