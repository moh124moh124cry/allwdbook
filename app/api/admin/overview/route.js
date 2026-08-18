import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { normalizeEmail } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

function tokenFrom(request) {
  const value =
    request.headers.get("authorization") || "";

  if (!value.startsWith("Bearer ")) {
    return "";
  }

  return value.slice(7).trim();
}

async function requireAdmin(request) {
  const token = tokenFrom(request);

  if (!token) {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "UNAUTHORIZED",
        },
        401
      ),
    };
  }

  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user?.email) {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "INVALID_SESSION",
        },
        401
      ),
    };
  }

  const email =
    normalizeEmail(user.email);

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("allwdbook_admins")
    .select("email, active")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Admin check failed:",
      adminError
    );

    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "ADMIN_CHECK_FAILED",
        },
        500
      ),
    };
  }

  if (!admin) {
    return {
      ok: false,
      response: json(
        {
          ok: false,
          error: "FORBIDDEN",
        },
        403
      ),
    };
  }

  return {
    ok: true,
    supabase,
    email,
  };
}

async function countRows(query) {
  try {
    const { count, error } =
      await query;

    if (error) {
      console.error(
        "Admin count error:",
        error
      );

      return 0;
    }

    return Number(count) || 0;
  } catch (error) {
    console.error(
      "Admin count exception:",
      error
    );

    return 0;
  }
}

export async function GET(request) {
  /*
   * فتح الرابط مباشرة لا يكشف
   * أي بيانات إدارية.
   */
  if (!tokenFrom(request)) {
    return json({
      ok: true,
      service:
        "AllWDbook Admin Overview",
      authenticationRequired: true,
      dataExposed: false,
    });
  }

  const auth =
    await requireAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const supabase =
    auth.supabase;

  try {
    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const [
      plans,
      keys,
      activeKeys,
      devices,
      subscriptions,
      lifetime,
    ] = await Promise.all([
      countRows(
        supabase
          .from("allwdbook_plans")
          .select("id", {
            count: "exact",
            head: true,
          })
      ),

      countRows(
        supabase
          .from("allwdbook_access_keys")
          .select("id", {
            count: "exact",
            head: true,
          })
      ),

      countRows(
        supabase
          .from("allwdbook_access_keys")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("status", "active")
          .is("revoked_at", null)
      ),

      countRows(
        supabase
          .from(
            "allwdbook_access_key_activations"
          )
          .select("id", {
            count: "exact",
            head: true,
          })
          .is("revoked_at", null)
      ),

      countRows(
        supabase
          .from(
            "allwdbook_subscriptions"
          )
          .select("id", {
            count: "exact",
            head: true,
          })
      ),

      countRows(
        supabase
          .from(
            "allwdbook_lifetime_access"
          )
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("active", true)
      ),
    ]);

    const {
      data: daily,
      error: dailyError,
    } = await supabase
      .from(
        "allwdbook_analytics_daily"
      )
      .select(
        "unique_visitors, page_views"
      )
      .eq("visit_date", today)
      .maybeSingle();

    if (dailyError) {
      console.error(
        "Daily analytics error:",
        dailyError
      );
    }

    const {
      data: totals,
      error: totalsError,
    } = await supabase
      .from(
        "allwdbook_analytics_totals"
      )
      .select(
        "unique_visitors, page_views"
      )
      .eq("id", 1)
      .maybeSingle();

    if (totalsError) {
      console.error(
        "Total analytics error:",
        totalsError
      );
    }

    return json({
      ok: true,

      admin: {
        email: auth.email,
      },

      analytics: {
        visitorsToday:
          Number(
            daily?.unique_visitors
          ) || 0,

        visitorsTotal:
          Number(
            totals?.unique_visitors
          ) || 0,

        pageViewsToday:
          Number(
            daily?.page_views
          ) || 0,

        pageViewsTotal:
          Number(
            totals?.page_views
          ) || 0,
      },

      counts: {
        plans,
        accessKeys: keys,
        activeAccessKeys:
          activeKeys,
        activeDevices: devices,
        subscriptions,
        lifetime,
      },

      generatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Admin overview error:",
      error
    );

    return json(
      {
        ok: false,
        error:
          "ADMIN_OVERVIEW_FAILED",
      },
      500
    );
  }
}
