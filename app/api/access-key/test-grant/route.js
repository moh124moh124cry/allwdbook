import crypto from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  accessKeyAllowsAccess,
  activateAccessKey,
  createAccessKey,
  revealAccessKeyCode,
} from "../../../../lib/accessKey";

import {
  checkRateLimit,
} from "../../../../lib/rateLimit";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


/* =========================================================
   CONFIG
   ========================================================= */

const ALLOWED_TEST_PLANS =
  new Set([
    "cover",
    "micro_niche",
    "keywords",
    "pro_monthly",
    "pro_yearly",
    "lifetime",
  ]);


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
   BEARER TOKEN
   ========================================================= */

function bearerToken(
  request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    ) || "";

  if (
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    return "";
  }

  return authorization
    .slice(7)
    .trim();
}


/* =========================================================
   SAFE SECRET COMPARE
   ========================================================= */

function safeEqual(
  first,
  second,
) {
  const left =
    Buffer.from(
      String(
        first || "",
      ),
      "utf8",
    );

  const right =
    Buffer.from(
      String(
        second || "",
      ),
      "utf8",
    );

  if (
    left.length !==
    right.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    left,
    right,
  );
}


/* =========================================================
   TEST MODE ENABLED?
   ========================================================= */

function testGrantEnabled() {
  return (
    process.env
      .ALLWDBOOK_TEST_GRANT_ENABLED ===
    "true"
  );
}


/* =========================================================
   EXPECTED SECRET
   ========================================================= */

function expectedSecret() {
  return String(
    process.env
      .ALLWDBOOK_TEST_GRANT_SECRET ||
      "",
  ).trim();
}


/* =========================================================
   AUTHENTICATE CURRENT DEVICE
   ========================================================= */

async function authenticate(
  request,
  supabase,
) {
  const token =
    bearerToken(
      request,
    );

  if (!token) {
    return {
      user: null,

      response:
        json(
          {
            ok: false,
            error:
              "UNAUTHORIZED",
          },
          401,
        ),
    };
  }


  const {
    data: {
      user,
    },

    error,
  } =
    await supabase.auth.getUser(
      token,
    );


  if (
    error ||
    !user
  ) {
    return {
      user: null,

      response:
        json(
          {
            ok: false,
            error:
              "INVALID_SESSION",
          },
          401,
        ),
    };
  }


  return {
    user,
    response: null,
  };
}


/* =========================================================
   DEVICE NAME
   ========================================================= */

function safeDeviceName(
  value,
) {
  const clean =
    String(
      value || "",
    )
      .trim()
      .slice(
        0,
        100,
      );

  return (
    clean ||
    "AllWDbook Test Device"
  );
}


/* =========================================================
   DEVICE INFO
   ========================================================= */

function safeDeviceInfo(
  value,
) {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return {
      source:
        "manual_test_grant",
    };
  }


  return {
    platform:
      String(
        value.platform ||
          "",
      ).slice(
        0,
        120,
      ),

    language:
      String(
        value.language ||
          "",
      ).slice(
        0,
        50,
      ),

    mobile:
      Boolean(
        value.mobile,
      ),

    source:
      "manual_test_grant",
  };
}


/* =========================================================
   EXTRACT CREATED ACCESS KEY
   =========================================================
   نجعله مرنًا حتى لو كانت createAccessKey
   ترجع accessKey مباشرة أو داخل object.
   ========================================================= */

function extractAccessKey(
  created,
) {
  if (!created) {
    return null;
  }

  return (
    created.accessKey ||
    created.key ||
    created.row ||
    created.data ||
    created
  );
}


/* =========================================================
   EXTRACT CODE
   ========================================================= */

function extractCode(
  created,
  accessKey,
) {
  const direct =
    String(
      created?.code ||
      created?.accessKeyCode ||
      "",
    ).trim();

  if (direct) {
    return direct;
  }


  if (
    accessKey
      ?.code_ciphertext
  ) {
    try {
      return revealAccessKeyCode(
        accessKey,
      );
    } catch (error) {
      console.error(
        "Test access key reveal failed:",
        error,
      );
    }
  }


  return "";
}


/* =========================================================
   FIND EXISTING TEST KEY
   =========================================================
   حتى لا ننشئ مفتاحًا جديدًا كل مرة
   يضغط فيها المستخدم زر الاختبار.
   ========================================================= */

async function findExistingTestKey(
  supabase,
  userId,
  planId,
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_keys",
      )
      .select("*")
      .eq(
        "purchased_by_user_id",
        userId,
      )
      .eq(
        "plan_id",
        planId,
      )
      .eq(
        "source",
        "manual_test",
      )
      .is(
        "revoked_at",
        null,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle();


  if (error) {
    throw new Error(
      "TEST_KEY_LOOKUP_FAILED:" +
        error.message,
    );
  }


  if (
    !data ||
    !accessKeyAllowsAccess(
      data,
    )
  ) {
    return null;
  }


  return data;
}


/* =========================================================
   ACTIVATE ON CURRENT DEVICE
   ========================================================= */

async function activateForUser(
  supabase,
  accessKey,
  userId,
  body,
) {
  const result =
    await activateAccessKey(
      supabase,
      accessKey,
      userId,
      {
        deviceName:
          safeDeviceName(
            body?.deviceName,
          ),

        deviceInfo:
          safeDeviceInfo(
            body?.deviceInfo,
          ),
      },
    );


  if (
    result?.allowed ===
    false
  ) {
    throw new Error(
      result.reason ||
      "TEST_ACTIVATION_FAILED",
    );
  }


  return result;
}


/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request,
) {
  /* =======================================================
     1. FEATURE SWITCH
     ======================================================= */

  if (
    !testGrantEnabled()
  ) {
    return json(
      {
        ok: false,

        error:
          "TEST_GRANT_DISABLED",
      },
      404,
    );
  }


  /* =======================================================
     2. RATE LIMIT
     ======================================================= */

  const rate =
    checkRateLimit(
      request,
      {
        name:
          "test-access-grant",

        limit: 10,

        windowMs:
          60 *
          60 *
          1000,
      },
    );


  if (!rate.ok) {
    return json(
      {
        ok: false,

        error:
          "RATE_LIMITED",

        retryAfter:
          rate.retryAfter,
      },
      429,
    );
  }


  /* =======================================================
     3. BODY
     ======================================================= */

  let body;


  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,

        error:
          "INVALID_JSON",
      },
      400,
    );
  }


  /* =======================================================
     4. SECRET
     ======================================================= */

  const secret =
    String(
      body?.secret ||
      request.headers.get(
        "x-allwdbook-test-secret",
      ) ||
      "",
    ).trim();


  const expected =
    expectedSecret();


  /*
   * نرفض تشغيل النظام إذا كان Secret
   * غير مضبوط أو قصيرًا.
   */

  if (
    expected.length <
    32
  ) {
    return json(
      {
        ok: false,

        error:
          "TEST_SECRET_NOT_CONFIGURED",
      },
      503,
    );
  }


  if (
    !secret ||
    !safeEqual(
      secret,
      expected,
    )
  ) {
    return json(
      {
        ok: false,

        error:
          "INVALID_TEST_SECRET",
      },
      403,
    );
  }


  /* =======================================================
     5. PLAN
     ======================================================= */

  const planId =
    String(
      body?.planId ||
      "pro_monthly",
    ).trim();


  if (
    !ALLOWED_TEST_PLANS.has(
      planId,
    )
  ) {
    return json(
      {
        ok: false,

        error:
          "INVALID_TEST_PLAN",

        allowedPlans:
          [
            ...ALLOWED_TEST_PLANS,
          ],
      },
      400,
    );
  }


  /* =======================================================
     6. SUPABASE + CURRENT USER
     ======================================================= */

  const supabase =
    getSupabaseAdmin();


  const {
    user,
    response:
      authResponse,
  } =
    await authenticate(
      request,
      supabase,
    );


  if (authResponse) {
    return authResponse;
  }


  try {
    /* =====================================================
       7. REUSE EXISTING TEST KEY
       ===================================================== */

    const existing =
      await findExistingTestKey(
        supabase,
        user.id,
        planId,
      );


    if (existing) {
      await activateForUser(
        supabase,
        existing,
        user.id,
        body,
      );


      let code =
        "";


      try {
        code =
          revealAccessKeyCode(
            existing,
          );
      } catch (error) {
        console.error(
          "Existing test key reveal failed:",
          error,
        );
      }


      return json({
        ok: true,

        test: true,

        reused: true,

        planId,

        accessKeyId:
          existing.id,

        code,

        codeHint:
          existing.code_hint ||
          "",

        message:
          "TEST_ACCESS_GRANTED",
      });
    }


    /* =====================================================
       8. CREATE TEST AWD-KEY
       =====================================================
       مهم:
       testMode = false هنا عمدًا.

       هذا ليس Lemon Squeezy Test Order.
       هو مفتاح داخلي مؤقت لاختبار واجهة
       الوصول والاستعادة فقط.

       سنلغيه بعد انتهاء الاختبار.
       ===================================================== */

    const created =
      await createAccessKey(
        supabase,
        {
          planId,

          source:
            "manual_test",

          purchasedByUserId:
            user.id,

          maxActivations:
            3,

          testMode:
            false,

          note:
            "Temporary AllWDbook recovery-flow test key",

          metadata: {
            purpose:
              "email_recovery_test",

            temporary:
              true,

            createdForUserId:
              user.id,
          },
        },
      );


    const accessKey =
      extractAccessKey(
        created,
      );


    if (
      !accessKey?.id
    ) {
      console.error(
        "Unexpected createAccessKey result:",
        created,
      );

      return json(
        {
          ok: false,

          error:
            "TEST_KEY_CREATE_FAILED",
        },
        500,
      );
    }


    /* =====================================================
       9. ACTIVATE ON THIS DEVICE
       ===================================================== */

    await activateForUser(
      supabase,
      accessKey,
      user.id,
      body,
    );


    /* =====================================================
       10. REVEAL CODE TO OWNER DEVICE
       ===================================================== */

    const code =
      extractCode(
        created,
        accessKey,
      );


    return json({
      ok: true,

      test: true,

      reused: false,

      planId,

      accessKeyId:
        accessKey.id,

      code,

      codeHint:
        accessKey.code_hint ||
        "",

      message:
        "TEST_ACCESS_GRANTED",
    });
  } catch (error) {
    console.error(
      "Test access grant failed:",
      error,
    );


    const message =
      String(
        error?.message ||
        "",
      );


    if (
      message.includes(
        "ACTIVATION_LIMIT_REACHED",
      )
    ) {
      return json(
        {
          ok: false,

          error:
            "ACTIVATION_LIMIT_REACHED",
        },
        409,
      );
    }


    return json(
      {
        ok: false,

        error:
          "TEST_GRANT_FAILED",
      },
      500,
    );
  }
}


/* =========================================================
   GET — HEALTH CHECK ONLY
   ========================================================= */

export async function GET() {
  return json({
    ok: true,

    service:
      "AllWDbook Temporary Test Access Grant",

    enabled:
      testGrantEnabled(),

    secretConfigured:
      expectedSecret().length >=
      32,

    defaultPlan:
      "pro_monthly",

    note:
      "POST only for creating test access",
  });
}
