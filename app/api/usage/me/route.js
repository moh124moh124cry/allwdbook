import {
  NextResponse,
} from "next/server";

import {
  getLifetimeAccess,
} from "../../../../lib/lifetimeAccess";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  getToolEntitlement,
} from "../../../../lib/plans";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


/* =========================================================
   TOOLS
   ========================================================= */

const TRACKED_TOOLS = [
  "coverDesigner",
  "microNiche",
  "keywords",
];


/* =========================================================
   PLAN NAMES
   ========================================================= */

const PLAN_NAMES = {
  free: {
    ar: "الخطة المجانية",
    en: "Free Plan",
  },

  cover: {
    ar: "مصمم الأغلفة",
    en: "Cover Designer",
  },

  micro_niche: {
    ar: "Micro-Niche",
    en: "Micro-Niche",
  },

  keywords: {
    ar: "الكلمات المفتاحية",
    en: "Keyword Research",
  },

  pro_monthly: {
    ar: "AllWDbook Pro",
    en: "AllWDbook Pro",
  },

  pro_yearly: {
    ar: "Pro السنوي",
    en: "Pro Yearly",
  },

  founders_trial: {
    ar: "تجربة Pro",
    en: "Pro Trial",
  },

  lifetime_pro: {
    ar: "Lifetime",
    en: "Lifetime",
  },
};


/* =========================================================
   JSON
   ========================================================= */

function json(
  data,
  status = 200,
) {
  return NextResponse.json(
    data,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",

        Pragma:
          "no-cache",
      },
    },
  );
}


/* =========================================================
   BEARER?
   ========================================================= */

function hasBearerToken(
  request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    ) || "";

  return authorization
    .trim()
    .startsWith(
      "Bearer ",
    );
}


/* =========================================================
   NUMBER
   ========================================================= */

function safeNumber(
  value,
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number,
    ) ||
    number < 0
  ) {
    return 0;
  }

  return number;
}


/* =========================================================
   USAGE VALUE FROM DATABASE ROW
   =========================================================
   هذا يجعل المسار متسامحًا مع اسم عمود العداد
   إذا كان SQL القديم يستخدم used أو used_count.
   ========================================================= */

function rowUsage(
  row,
) {
  if (!row) {
    return 0;
  }

  const candidates = [
    row.used,
    row.used_count,
    row.usage_count,
    row.uses,
    row.count,
  ];

  for (
    const value of
    candidates
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(
        parsed,
      ) &&
      parsed >= 0
    ) {
      return parsed;
    }
  }

  return 0;
}


/* =========================================================
   RESOLVE TOOL ENTITLEMENT
   =========================================================
   نفس منطق dailyUsage.js:
   إذا كانت أي خطة تمنح الأداة بدون حد،
   فالأداة Unlimited.
   ========================================================= */

function resolveToolQuota(
  access,
  toolId,
) {
  if (
    access?.lifetime
  ) {
    return {
      access: true,
      unlimited: true,
      dailyLimit: null,
      plan:
        "lifetime_pro",
    };
  }


  const paidPlans =
    Array.isArray(
      access?.plans,
    )
      ? access.plans
      : [];


  const planIds = [
    "free",
    ...paidPlans,
  ];


  const entitlements =
    planIds.map(
      (planId) => ({
        planId,

        entitlement:
          getToolEntitlement(
            planId,
            toolId,
          ),
      }),
    );


  const unlimited =
    entitlements.find(
      ({
        entitlement,
      }) =>
        entitlement?.access ===
          true &&
        entitlement?.dailyLimit ===
          null,
    );


  if (unlimited) {
    return {
      access: true,
      unlimited: true,
      dailyLimit: null,
      plan:
        unlimited.planId,
    };
  }


  const limits =
    entitlements
      .filter(
        ({
          entitlement,
        }) =>
          entitlement?.access ===
          true,
      )
      .map(
        ({
          entitlement,
        }) =>
          Number(
            entitlement
              ?.dailyLimit ??
              0,
          ),
      )
      .filter(
        (limit) =>
          Number.isFinite(
            limit,
          ) &&
          limit > 0,
      );


  if (
    limits.length ===
    0
  ) {
    return {
      access: false,
      unlimited: false,
      dailyLimit: 0,
      plan:
        access?.plan ||
        "free",
    };
  }


  return {
    access: true,
    unlimited: false,

    dailyLimit:
      Math.max(
        ...limits,
      ),

    plan:
      access?.plan ||
      "free",
  };
}


/* =========================================================
   PLAN NAME
   ========================================================= */

function getPlanName(
  access,
) {
  const planId =
    access?.lifetime
      ? "lifetime_pro"
      : String(
          access?.plan ||
          "free",
        );


  const names =
    PLAN_NAMES[
      planId
    ] ||
    {
      ar: planId,
      en: planId,
    };


  return {
    planId,
    planNameAr:
      names.ar,
    planNameEn:
      names.en,
  };
}


/* =========================================================
   SUBSCRIPTION END DATE
   ========================================================= */

function getEndsAt(
  access,
) {
  const subscriptions =
    Array.isArray(
      access?.subscriptions,
    )
      ? access.subscriptions
      : [];


  const dates =
    subscriptions
      .map(
        (item) =>
          item?.ends_at ||
          item?.renews_at ||
          null,
      )
      .filter(Boolean)
      .map(
        (value) =>
          new Date(
            value,
          ),
      )
      .filter(
        (date) =>
          !Number.isNaN(
            date.getTime(),
          ),
      )
      .sort(
        (a, b) =>
          b.getTime() -
          a.getTime(),
      );


  if (
    dates.length ===
    0
  ) {
    return null;
  }


  return dates[0]
    .toISOString();
}


/* =========================================================
   NEXT UTC RESET
   ========================================================= */

function nextResetAt() {
  const now =
    new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() +
        1,
      0,
      0,
      0,
      0,
    ),
  ).toISOString();
}


/* =========================================================
   GET
   ========================================================= */

export async function GET(
  request,
) {
  /*
   * عند فتح الرابط مباشرة في المتصفح
   * نظهر Health Check فقط.
   *
   * الصفحة الرئيسية ترسل Bearer Token
   * وتحصل على البيانات الحقيقية.
   */

  if (
    !hasBearerToken(
      request,
    )
  ) {
    return json({
      ok: true,

      service:
        "AllWDbook Usage Status",

      authenticatedRequest:
        false,

      trackedTools:
        TRACKED_TOOLS,

      note:
        "Bearer token required for personal usage data",
    });
  }


  try {
    /* =====================================================
       ACCESS
       ===================================================== */

    const access =
      await getLifetimeAccess(
        request,
      );


    if (
      !access
        ?.authenticated ||
      !access?.user?.id
    ) {
      return json(
        {
          ok: false,

          error:
            "INVALID_SESSION",
        },
        401,
      );
    }


    const userId =
      access.user.id;


    /* =====================================================
       QUOTAS
       ===================================================== */

    const quotas =
      TRACKED_TOOLS.map(
        (toolId) => ({
          toolId,

          ...resolveToolQuota(
            access,
            toolId,
          ),
        }),
      );


    const finiteQuotas =
      quotas.filter(
        (item) =>
          item.access &&
          !item.unlimited &&
          safeNumber(
            item.dailyLimit,
          ) > 0,
      );


    const allUnlimited =
      quotas.every(
        (item) =>
          item.access &&
          item.unlimited,
      );


    /* =====================================================
       TODAY
       ===================================================== */

    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        );


    /* =====================================================
       LOAD CURRENT USAGE
       ===================================================== */

    let rows = [];

    let storageReady =
      true;


    /*
     * allwdbook_consume_daily_use()
     * المستخدم في dailyUsage.js
     * يخزن استهلاك اليوم.
     *
     * نقرأ الجدول فقط ولا نزيد العداد.
     */

    if (
      finiteQuotas.length >
      0
    ) {
      const supabase =
        getSupabaseAdmin();


      const {
        data,
        error,
      } =
        await supabase
          .from(
            "allwdbook_daily_usage",
          )
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "usage_date",
            today,
          )
          .in(
            "tool_id",
            finiteQuotas.map(
              (item) =>
                item.toolId,
            ),
          );


      if (error) {
        storageReady =
          false;

        console.error(
          "Usage status read failed:",
          error,
        );
      } else {
        rows =
          Array.isArray(data)
            ? data
            : [];
      }
    }


    /* =====================================================
       BUILD TOOL STATUS
       ===================================================== */

    const tools =
      quotas.map(
        (quota) => {
          if (
            !quota.access
          ) {
            return {
              toolId:
                quota.toolId,

              access:
                false,

              unlimited:
                false,

              used: 0,

              limit: 0,

              remaining: 0,
            };
          }


          if (
            quota.unlimited
          ) {
            return {
              toolId:
                quota.toolId,

              access:
                true,

              unlimited:
                true,

              used: null,

              limit: null,

              remaining:
                null,
            };
          }


          const row =
            rows.find(
              (item) =>
                String(
                  item?.tool_id ||
                  "",
                ) ===
                quota.toolId,
            );


          const used =
            rowUsage(row);


          const limit =
            safeNumber(
              quota.dailyLimit,
            );


          return {
            toolId:
              quota.toolId,

            access: true,

            unlimited:
              false,

            used:

              Math.min(
                used,
                limit,
              ),

            limit,

            remaining:
              Math.max(
                0,
                limit -
                  used,
              ),
          };
        },
      );


    /* =====================================================
       TOTAL FINITE USAGE
       ===================================================== */

    const finiteTools =
      tools.filter(
        (item) =>
          item.access &&
          !item.unlimited &&
          item.limit > 0,
      );


    const totalUsed =
      finiteTools.reduce(
        (
          total,
          item,
        ) =>
          total +
          safeNumber(
            item.used,
          ),
        0,
      );


    const totalLimit =
      finiteTools.reduce(
        (
          total,
          item,
        ) =>
          total +
          safeNumber(
            item.limit,
          ),
        0,
      );


    /* =====================================================
       PLAN
       ===================================================== */

    const plan =
      getPlanName(
        access,
      );


    /*
     * الصفحة الرئيسية الحالية تتوقع limit
     * أكبر من صفر لحساب progress bar.
     *
     * في Pro/Lifetime لا يوجد حد يومي،
     * لذلك نعيد 1 للتوافق مع الواجهة الحالية
     * ونرسل unlimited=true أيضًا.
     *
     * لاحقًا يمكن للواجهة إظهار ∞ مباشرة.
     */

    const displayUsed =
      allUnlimited
        ? 0
        : totalUsed;


    const displayLimit =
      allUnlimited
        ? 1
        : Math.max(
            1,
            totalLimit,
          );


    /* =====================================================
       RESPONSE
       ===================================================== */

    return json({
      ok: true,

      date:
        today,

      plan:
        plan.planId,

      planNameAr:
        plan.planNameAr,

      planNameEn:
        plan.planNameEn,

      paid:
        Boolean(
          access.paid,
        ),

      lifetime:
        Boolean(
          access.lifetime,
        ),

      unlimited:
        allUnlimited,

      used:
        displayUsed,

      limit:
        displayLimit,

      realUsed:
        totalUsed,

      realLimit:
        allUnlimited
          ? null
          : totalLimit,

      endsAt:
        getEndsAt(
          access,
        ),

      resetAt:
        nextResetAt(),

      storageReady,

      tools,
    });
  } catch (error) {
    console.error(
      "Usage status API error:",
      error,
    );


    return json(
      {
        ok: false,

        error:
          "USAGE_STATUS_FAILED",
      },
      500,
    );
  }
}
