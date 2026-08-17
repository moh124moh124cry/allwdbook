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


const TEST_SOURCE =
  "admin";

const TEST_NOTE =
  "Temporary AllWDbook recovery-flow test key";


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
   TOKEN
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
   SAFE SECRET
   ========================================================= */

function safeEqual(
  first,
  second,
) {
  const left =
    Buffer.from(
      String(first || ""),
      "utf8",
    );

  const right =
    Buffer.from(
      String(second || ""),
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
   CONFIG
   ========================================================= */

function testGrantEnabled() {
  return (
    process.env
      .ALLWDBOOK_TEST_GRANT_ENABLED ===
    "true"
  );
}


function expectedSecret() {
  return String(
    process.env
      .ALLWDBOOK_TEST_GRANT_SECRET ||
      "",
  ).trim();
}


/* =========================================================
   AUTH
   ========================================================= */

async function authenticate(
  request,
  supabase,
) {
  const token =
    bearerToken(request);

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
   DEVICE
   ========================================================= */

function safeDeviceName(
  value,
) {
  return (
    String(value || "")
      .trim()
      .slice(0, 100) ||
    "AllWDbook Test Device"
  );
}


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
        "test_access",
    };
  }


  return {
    platform:
      String(
        value.platform || "",
      ).slice(0, 120),

    language:
      String(
        value.language || "",
      ).slice(0, 50),

    mobile:
      Boolean(value.mobile),

    source:
      "test_access",
  };
}


/* =========================================================
   EXISTING TEST KEY
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
        TEST_SOURCE,
      )
      .eq(
        "note",
        TEST_NOTE,
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
   ACTIVATE
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
    const error =
      new Error(
        result.reason ||
          "TEST_ACTIVATION_FAILED",
      );

    error.code =
      result.reason ||
      "TEST_ACTIVATION_FAILED";

    throw error;
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
     ENABLED
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
     RATE LIMIT
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
     BODY
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
     SECRET
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


  if (
    expected.length < 32
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
     PLAN
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
     SUPABASE
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


  /* =======================================================
     EXISTING
     ======================================================= */

  let existing;


  try {
    existing =
      await findExistingTestKey(
        supabase,
        user.id,
        planId,
      );
  } catch (error) {
    console.error(
      "Test key lookup failed:",
      error,
    );


    return json(
      {
        ok: false,

        error:
          "TEST_KEY_LOOKUP_FAILED",

        detail:
          String(
            error?.message ||
            "",
          ).slice(
            0,
            220,
          ),
      },
      500,
    );
  }


  /* =======================================================
     REUSE
     ======================================================= */

  if (existing) {
    try {
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
      } catch (
        revealError
      ) {
        console.error(
          "Existing test key reveal failed:",
          revealError,
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
    } catch (error) {
      console.error(
        "Existing test key activation failed:",
        error,
      );


      if (
        String(
          error?.message ||
          "",
        ).includes(
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
            "TEST_ACTIVATION_FAILED",

          detail:
            String(
              error?.message ||
              "",
            ).slice(
              0,
              220,
            ),
        },
        500,
      );
    }
  }


  /* =======================================================
     CREATE
     ======================================================= */

  let created;


  try {
    created =
      await createAccessKey(
        supabase,
        {
          planId,

          /*
           * نستخدم المصدر المدعوم رسميًا
           * في محرك AllWDbook.
           */
          source:
            TEST_SOURCE,

          purchasedByUserId:
            user.id,

          maxActivations:
            3,

          testMode:
            false,

          note:
            TEST_NOTE,

          metadata: {
            purpose:
              "email_recovery_test",

            temporary:
              true,

            testAccess:
              true,

            createdForUserId:
              user.id,
          },
        },
      );
  } catch (error) {
    console.error(
      "Test key create failed:",
      error,
    );


    const detail =
      String(
        error?.message ||
        "",
      ).slice(
        0,
        220,
      );


    if (
      detail.includes(
        "PLAN_NOT_FOUND",
      )
    ) {
      return json(
        {
          ok: false,
          error:
            "TEST_PLAN_NOT_FOUND",
          detail,
        },
        400,
      );
    }


    if (
      detail.includes(
        "PLAN_NOT_ACTIVE",
      )
    ) {
      return json(
        {
          ok: false,
          error:
            "TEST_PLAN_NOT_ACTIVE",
          detail,
        },
        400,
      );
    }


    return json(
      {
        ok: false,

        error:
          "TEST_KEY_CREATE_FAILED",

        detail,
      },
      500,
    );
  }


  const accessKey =
    created?.accessKey ||
    null;


  if (
    !accessKey?.id
  ) {
    return json(
      {
        ok: false,

        error:
          "TEST_KEY_CREATE_FAILED",

        detail:
          "ACCESS_KEY_RESULT_MISSING",
      },
      500,
    );
  }


  /* =======================================================
     ACTIVATE
     ======================================================= */

  try {
    await activateForUser(
      supabase,
      accessKey,
      user.id,
      body,
    );
  } catch (error) {
    console.error(
      "New test key activation failed:",
      error,
    );


    if (
      String(
        error?.message ||
        "",
      ).includes(
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
          "TEST_ACTIVATION_FAILED",

        detail:
          String(
            error?.message ||
            "",
          ).slice(
            0,
            220,
          ),
      },
      500,
    );
  }


  /* =======================================================
     SUCCESS
     ======================================================= */

  return json({
    ok: true,

    test: true,

    reused: false,

    planId,

    accessKeyId:
      accessKey.id,

    code:
      created?.code ||
      "",

    codeHint:
      accessKey.code_hint ||
      "",

    message:
      "TEST_ACCESS_GRANTED",
  });
}


/* =========================================================
   GET
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

    source:
      TEST_SOURCE,

    note:
      "POST only for creating test access",
  });
}
