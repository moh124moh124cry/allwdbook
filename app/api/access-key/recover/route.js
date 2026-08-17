import {
  NextResponse,
} from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  accessKeyAllowsAccess,
  activateAccessKey,
  createAccessRecoveryChallenge,
  normalizeAccessEmail,
  recordAccessAudit,
  verifyAccessRecoveryChallenge,
} from "../../../../lib/accessKey";

import {
  sendLicenseOtpEmail,
} from "../../../../lib/email";

import {
  checkRateLimit,
} from "../../../../lib/rateLimit";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


/* =========================================================
   JSON RESPONSE
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

    response:
      null,
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
    "Recovered by email"
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
    Array.isArray(
      value,
    )
  ) {
    return {};
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
      "email_recovery",
  };
}


/* =========================================================
   GET ALL ACTIVE KEYS FOR VERIFIED EMAIL
   ========================================================= */

async function getRecoverableKeys(
  supabase,
  email,
) {
  const cleanEmail =
    normalizeAccessEmail(
      email,
    );


  if (!cleanEmail) {
    return [];
  }


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
        "recovery_email",
        cleanEmail,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );


  if (error) {
    throw new Error(
      "RECOVERY_KEY_LOOKUP_FAILED:" +
        error.message,
    );
  }


  return (
    data ||
    []
  ).filter(
    (accessKey) => {
      /*
       * البريد يجب أن يكون موثقًا.
       */
      if (
        !accessKey
          ?.recovery_email_verified_at
      ) {
        return false;
      }


      /*
       * الخطة نفسها يجب أن تكون فعالة.
       */
      return accessKeyAllowsAccess(
        accessKey,
      );
    },
  );
}


/* =========================================================
   FIND LATEST EMAIL RECOVERY CHALLENGE
   ========================================================= */

async function findRecoveryChallenge(
  supabase,
  email,
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_recovery_challenges",
      )
      .select("*")
      .eq(
        "email",
        email,
      )
      .eq(
        "purpose",
        "recover_access",
      )
      .is(
        "consumed_at",
        null,
      )
      .order(
        "expires_at",
        {
          ascending:
            false,
        },
      )
      .limit(1)
      .maybeSingle();


  if (error) {
    throw new Error(
      "RECOVERY_CHALLENGE_LOOKUP_FAILED:" +
        error.message,
    );
  }


  return data || null;
}


/* =========================================================
   GENERIC SEND RESPONSE
   =========================================================
   مهم أمنيًا:

   لا نخبر أي شخص هل البريد موجود
   في قاعدة البيانات أم لا.

   نفس الجواب يظهر دائمًا.

   هذا يمنع Email Enumeration.
   ========================================================= */

function genericSendResponse() {
  return json({
    ok: true,

    sent: true,

    message:
      "IF_EMAIL_EXISTS_CODE_SENT",

    expiresIn:
      600,
  });
}


/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request,
) {
  /* =======================================================
     RATE LIMIT
     ======================================================= */

  const rate =
    checkRateLimit(
      request,
      {
        name:
          "access-key-recover",

        limit:
          8,

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
     SUPABASE
     ======================================================= */

  const supabase =
    getSupabaseAdmin();


  /* =======================================================
     AUTH CURRENT ANONYMOUS DEVICE
     ======================================================= */

  const {
    user,
    response:
      authResponse,
  } =
    await authenticate(
      request,
      supabase,
    );


  if (
    authResponse
  ) {
    return authResponse;
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


  const action =
    String(
      body?.action ||
        "",
    )
      .trim()
      .toLowerCase();


  const email =
    normalizeAccessEmail(
      body?.email,
    );


  if (!email) {
    return json(
      {
        ok: false,

        error:
          "INVALID_EMAIL",
      },
      400,
    );
  }


  /* =======================================================
     ACTION: SEND
     ======================================================= */

  if (
    action === "send"
  ) {
    let accessKeys;


    try {
      accessKeys =
        await getRecoverableKeys(
          supabase,
          email,
        );
    } catch (error) {
      console.error(
        "Email recovery lookup failed:",
        error,
      );


      /*
       * لا نكشف للمستخدم هل البريد موجود.
       */
      return genericSendResponse();
    }


    /*
     * البريد غير موجود أو غير موثق.
     *
     * نرجع نفس النتيجة تمامًا.
     */
    if (
      accessKeys.length ===
      0
    ) {
      return genericSendResponse();
    }


    /*
     * أحدث Access Key فعّال
     * سيكون Anchor للـ OTP.
     *
     * بعد نجاح OTP سنستعيد جميع
     * الخطط المرتبطة بنفس البريد.
     */
    const primaryKey =
      accessKeys[0];


    try {
      /* ===================================================
         CREATE OTP CHALLENGE
         =================================================== */

      const {
        challenge,
        otp,
      } =
        await createAccessRecoveryChallenge(
          supabase,
          {
            accessKeyId:
              primaryKey.id,

            email,

            purpose:
              "recover_access",

            expiresMinutes:
              10,
          },
        );


      /* ===================================================
         SEND OTP EMAIL
         =================================================== */

      const delivery =
        await sendLicenseOtpEmail(
          {
            email,

            otp,

            purpose:
              "recover_access",
          },
        );


      /* ===================================================
         EMAIL FAILED
         =================================================== */

      if (
        !delivery.sent
      ) {
        /*
         * نحذف OTP غير المرسل.
         */
        await supabase
          .from(
            "allwdbook_access_recovery_challenges",
          )
          .delete()
          .eq(
            "id",
            challenge.id,
          );


        await recordAccessAudit(
          supabase,
          {
            accessKeyId:
              primaryKey.id,

            eventType:
              "email_recovery_send_failed",

            actorUserId:
              user.id,

            actorEmail:
              email,

            metadata: {
              reason:
                delivery.reason ||
                "EMAIL_SEND_FAILED",
            },
          },
        );


        console.error(
          "Recovery email delivery failed:",
          delivery.reason,
        );


        /*
         * لا نكشف وجود البريد.
         */
        return genericSendResponse();
      }


      /* ===================================================
         AUDIT
         =================================================== */

      await recordAccessAudit(
        supabase,
        {
          accessKeyId:
            primaryKey.id,

          eventType:
            "email_recovery_code_sent",

          actorUserId:
            user.id,

          actorEmail:
            email,

          metadata: {
            challengeId:
              challenge.id,

            plansFound:
              accessKeys.length,

            emailId:
              delivery.id ||
              null,
          },
        },
      );


      /*
       * لا نرجع challengeId إلى المتصفح.
       *
       * السيرفر سيجده بنفسه عند VERIFY.
       *
       * هذا يقلل كشف معلومات الحساب.
       */
      return genericSendResponse();
    } catch (error) {
      console.error(
        "Email recovery send failed:",
        error,
      );


      /*
       * نفس الجواب أمنيًا.
       */
      return genericSendResponse();
    }
  }


  /* =======================================================
     ACTION: VERIFY
     ======================================================= */

  if (
    action === "verify"
  ) {
    const otp =
      String(
        body?.otp ||
          "",
      )
        .trim()
        .replace(
          /\D/g,
          "",
        );


    if (
      !/^\d{6}$/.test(
        otp,
      )
    ) {
      return json(
        {
          ok: false,

          error:
            "INVALID_OTP",
        },
        400,
      );
    }


    /* =====================================================
       FIND ACTIVE PLANS BELONGING TO EMAIL
       ===================================================== */

    let accessKeys;


    try {
      accessKeys =
        await getRecoverableKeys(
          supabase,
          email,
        );
    } catch (error) {
      console.error(
        "Recovery verification key lookup failed:",
        error,
      );


      return json(
        {
          ok: false,

          error:
            "INVALID_OTP",
        },
        400,
      );
    }


    if (
      accessKeys.length ===
      0
    ) {
      /*
       * لا نقول EMAIL_NOT_FOUND.
       *
       * حتى لا نكشف إذا البريد مسجل.
       */
      return json(
        {
          ok: false,

          error:
            "INVALID_OTP",
        },
        400,
      );
    }


    /* =====================================================
       FIND CHALLENGE
       ===================================================== */

    let challenge;


    try {
      challenge =
        await findRecoveryChallenge(
          supabase,
          email,
        );
    } catch (error) {
      console.error(
        "Recovery challenge lookup failed:",
        error,
      );


      return json(
        {
          ok: false,

          error:
            "RECOVERY_VERIFY_FAILED",
        },
        500,
      );
    }


    if (!challenge) {
      return json(
        {
          ok: false,

          error:
            "INVALID_OTP",
        },
        400,
      );
    }


    /* =====================================================
       MAKE SURE CHALLENGE BELONGS TO THIS EMAIL OWNER
       ===================================================== */

    const accessKeyIds =
      new Set(
        accessKeys.map(
          (item) =>
            String(
              item.id,
            ),
        ),
      );


    if (
      !accessKeyIds.has(
        String(
          challenge
            .access_key_id,
        ),
      )
    ) {
      return json(
        {
          ok: false,

          error:
            "INVALID_OTP",
        },
        400,
      );
    }


    if (
      challenge.purpose !==
      "recover_access"
    ) {
      return json(
        {
          ok: false,

          error:
            "INVALID_OTP",
        },
        400,
      );
    }


    /* =====================================================
       VERIFY OTP
       ===================================================== */

    let verification;


    try {
      verification =
        await verifyAccessRecoveryChallenge(
          supabase,
          {
            challengeId:
              challenge.id,

            otp,
          },
        );
    } catch (error) {
      console.error(
        "Recovery OTP verification failed:",
        error,
      );


      return json(
        {
          ok: false,

          error:
            "RECOVERY_VERIFY_FAILED",
        },
        500,
      );
    }


    if (
      !verification
        ?.verified
    ) {
      const reason =
        verification
          ?.reason ||
        "INVALID_OTP";


      const status =
        reason ===
          "TOO_MANY_ATTEMPTS"
          ? 429
          : 400;


      return json(
        {
          ok: false,

          error:
            reason,
        },
        status,
      );
    }


    /* =====================================================
       DEVICE
       ===================================================== */

    const deviceName =
      safeDeviceName(
        body?.deviceName,
      );


    const deviceInfo =
      safeDeviceInfo(
        body?.deviceInfo,
      );


    /* =====================================================
       RESTORE EVERY PLAN LINKED TO THIS EMAIL
       ===================================================== */

    const restoredPlans =
      [];

    const failedPlans =
      [];


    for (
      const accessKey of
        accessKeys
    ) {
      try {
        const result =
          await activateAccessKey(
            supabase,
            accessKey,
            user.id,
            {
              deviceName,

              deviceInfo,
            },
          );


        if (
          result?.allowed
        ) {
          restoredPlans.push({
            accessKeyId:
              accessKey.id,

            planId:
              accessKey.plan_id,

            codeHint:
              accessKey.code_hint,

            existing:
              Boolean(
                result.existing,
              ),

            maxActivations:
              Number(
                accessKey
                  .max_activations ||
                  0,
              ),
          });


          await recordAccessAudit(
            supabase,
            {
              accessKeyId:
                accessKey.id,

              eventType:
                "email_recovery_completed",

              actorUserId:
                user.id,

              actorEmail:
                email,

              metadata: {
                planId:
                  accessKey
                    .plan_id,

                existingDevice:
                  Boolean(
                    result.existing,
                  ),

                challengeId:
                  challenge.id,
              },
            },
          );
        } else {
          failedPlans.push({
            planId:
              accessKey.plan_id,

            reason:
              result?.reason ||
              "ACTIVATION_FAILED",
          });
        }
      } catch (error) {
        console.error(
          "Plan email recovery activation failed:",
          {
            accessKeyId:
              accessKey.id,

            planId:
              accessKey.plan_id,

            error,
          },
        );


        failedPlans.push({
          planId:
            accessKey.plan_id,

          reason:
            "ACTIVATION_FAILED",
        });
      }
    }


    /* =====================================================
       NOTHING COULD BE RESTORED
       ===================================================== */

    if (
      restoredPlans.length ===
      0
    ) {
      const onlyLimits =
        failedPlans.length >
          0 &&
        failedPlans.every(
          (item) =>
            item.reason ===
            "ACTIVATION_LIMIT_REACHED",
        );


      if (onlyLimits) {
        return json(
          {
            ok: false,

            error:
              "ACTIVATION_LIMIT_REACHED",

            failedPlans,
          },
          409,
        );
      }


      return json(
        {
          ok: false,

          error:
            "RECOVERY_ACTIVATION_FAILED",

          failedPlans,
        },
        400,
      );
    }


    /* =====================================================
       SUCCESS
       ===================================================== */

    return json({
      ok: true,

      recovered:
        true,

      restoredCount:
        restoredPlans.length,

      failedCount:
        failedPlans.length,

      restoredPlans,

      failedPlans,
    });
  }


  /* =======================================================
     INVALID ACTION
     ======================================================= */

  return json(
    {
      ok: false,

      error:
        "INVALID_ACTION",
    },
    400,
  );
}


/* =========================================================
   GET — HEALTH CHECK
   ========================================================= */

export async function GET() {
  return json({
    ok: true,

    service:
      "AllWDbook Email Access Recovery",

    actions: [
      "send",
      "verify",
    ],

    loginRequired:
      false,

    passwordRequired:
      false,
  });
}
