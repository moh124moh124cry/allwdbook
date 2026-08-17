import {
  NextResponse,
} from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  accessKeyAllowsAccess,
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
   MASK EMAIL
   ========================================================= */

function maskEmail(
  value,
) {
  const email =
    normalizeAccessEmail(
      value,
    );

  if (!email) {
    return "";
  }

  const [
    username,
    domain,
  ] =
    email.split("@");

  if (
    !username ||
    !domain
  ) {
    return "";
  }

  if (
    username.length <= 2
  ) {
    return `${username[0] || "*"}***@${domain}`;
  }

  return (
    username[0] +
    "***" +
    username[
      username.length - 1
    ] +
    "@" +
    domain
  );
}


/* =========================================================
   OWNER KEYS
   =========================================================
   مهم أمنيًا:

   لا نسمح لأي جهاز مستعاد بتغيير بريد الحماية.

   بريد الحماية يمكن ربطه فقط من الجهاز
   الذي اشترى الخطة أصلًا، أي:

   purchased_by_user_id = current user id
   ========================================================= */

async function getOwnerAccessKeys(
  supabase,
  userId,
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_keys",
      )
      .select(
        `
          id,
          plan_id,
          code_hint,
          status,
          source,
          purchased_by_user_id,
          recovery_email,
          recovery_email_verified_at,
          test_mode,
          starts_at,
          expires_at,
          revoked_at,
          created_at
        `,
      )
      .eq(
        "purchased_by_user_id",
        userId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );


  if (error) {
    throw new Error(
      "OWNER_ACCESS_KEYS_LOOKUP_FAILED:" +
        error.message,
    );
  }


  return (
    data ||
    []
  ).filter(
    (
      accessKey,
    ) =>
      accessKeyAllowsAccess(
        accessKey,
      ),
  );
}


/* =========================================================
   SESSION
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
          "access-key-email",

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
     AUTH
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
    ).trim();


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
     OWNER ACCESS KEYS
     ======================================================= */

  let ownerKeys;


  try {
    ownerKeys =
      await getOwnerAccessKeys(
        supabase,
        user.id,
      );
  } catch (error) {
    console.error(
      "Owner access key lookup failed:",
      error,
    );


    return json(
      {
        ok: false,

        error:
          "ACCESS_KEY_LOOKUP_FAILED",
      },
      500,
    );
  }


  if (
    ownerKeys.length ===
    0
  ) {
    return json(
      {
        ok: false,

        error:
          "NO_OWNER_ACCESS_KEY",
      },
      404,
    );
  }


  /*
   * نستعمل أحدث Access Key فعّال
   * لإنشاء OTP.
   */

  const primaryKey =
    ownerKeys[0];


  /* =======================================================
     ACTION: SEND
     ======================================================= */

  if (
    action === "send"
  ) {
    try {
      /*
       * أنشئ Challenge في قاعدة البيانات.
       */

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
              "verify_email",

            expiresMinutes:
              10,
          },
        );


      /*
       * أرسل OTP عبر Resend.
       *
       * نعيد استخدام قالب البريد الموجود
       * بالفعل في المشروع.
       */

      const delivery =
        await sendLicenseOtpEmail(
          {
            email,

            otp,

            purpose:
              "verify_email",
          },
        );


      /*
       * إذا فشل إرسال البريد:
       * نحذف Challenge حتى لا يبقى
       * OTP غير مستعمل في القاعدة.
       */

      if (
        !delivery.sent
      ) {
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
              "recovery_email_send_failed",

            actorUserId:
              user.id,

            actorEmail:
              email,

            metadata: {
              reason:
                delivery.reason ||
                null,
            },
          },
        );


        return json(
          {
            ok: false,

            error:
              delivery.reason ||
              "EMAIL_SEND_FAILED",
          },
          503,
        );
      }


      await recordAccessAudit(
        supabase,
        {
          accessKeyId:
            primaryKey.id,

          eventType:
            "recovery_email_code_sent",

          actorUserId:
            user.id,

          actorEmail:
            email,

          metadata: {
            challengeId:
              challenge.id,

            protectedKeys:
              ownerKeys.length,
          },
        },
      );


      return json({
        ok: true,

        sent: true,

        challengeId:
          challenge.id,

        email:
          maskEmail(
            email,
          ),

        expiresIn:
          600,
      });
    } catch (error) {
      console.error(
        "AWD-KEY recovery email send failed:",
        error,
      );


      return json(
        {
          ok: false,

          error:
            "RECOVERY_EMAIL_SEND_FAILED",
        },
        500,
      );
    }
  }


  /* =======================================================
     ACTION: VERIFY
     ======================================================= */

  if (
    action === "verify"
  ) {
    const challengeId =
      String(
        body?.challengeId ||
          "",
      ).trim();


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
      !challengeId
    ) {
      return json(
        {
          ok: false,

          error:
            "CHALLENGE_REQUIRED",
        },
        400,
      );
    }


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


    /*
     * أولًا نتأكد أن Challenge
     * يخص أحد مفاتيح هذا المستخدم.
     */

    const {
      data:
        challengeRecord,

      error:
        challengeError,
    } =
      await supabase
        .from(
          "allwdbook_access_recovery_challenges",
        )
        .select(
          `
            id,
            access_key_id,
            email,
            purpose,
            expires_at,
            consumed_at
          `,
        )
        .eq(
          "id",
          challengeId,
        )
        .maybeSingle();


    if (
      challengeError
    ) {
      console.error(
        "Recovery challenge lookup failed:",
        challengeError,
      );


      return json(
        {
          ok: false,

          error:
            "CHALLENGE_LOOKUP_FAILED",
        },
        500,
      );
    }


    if (
      !challengeRecord
    ) {
      return json(
        {
          ok: false,

          error:
            "CHALLENGE_NOT_FOUND",
        },
        404,
      );
    }


    const ownerKeyIds =
      new Set(
        ownerKeys.map(
          (item) =>
            item.id,
        ),
      );


    if (
      !ownerKeyIds.has(
        challengeRecord
          .access_key_id,
      )
    ) {
      return json(
        {
          ok: false,

          error:
            "CHALLENGE_NOT_ALLOWED",
        },
        403,
      );
    }


    if (
      challengeRecord
        .purpose !==
      "verify_email"
    ) {
      return json(
        {
          ok: false,

          error:
            "INVALID_CHALLENGE_PURPOSE",
        },
        400,
      );
    }


    if (
      normalizeAccessEmail(
        challengeRecord.email,
      ) !== email
    ) {
      return json(
        {
          ok: false,

          error:
            "EMAIL_MISMATCH",
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
            challengeId,

            otp,
          },
        );
    } catch (error) {
      console.error(
        "AWD-KEY recovery verification failed:",
        error,
      );


      return json(
        {
          ok: false,

          error:
            "OTP_VERIFY_FAILED",
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
       PROTECT ALL ACTIVE KEYS OWNED BY THIS USER
       =====================================================
       إذا كان المستخدم اشترى مثلاً:

       Cover
       +
       Keywords
       +
       Pro

       يكفي توثيق البريد مرة واحدة
       لحماية كل الخطط التي اشتراها
       على هذا الحساب المجهول.
       ===================================================== */

    const now =
      new Date()
        .toISOString();


    const ids =
      ownerKeys.map(
        (item) =>
          item.id,
      );


    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "allwdbook_access_keys",
        )
        .update({
          recovery_email:
            email,

          recovery_email_verified_at:
            now,

          updated_at:
            now,
        })
        .in(
          "id",
          ids,
        );


    if (
      updateError
    ) {
      console.error(
        "Recovery email save failed:",
        updateError,
      );


      return json(
        {
          ok: false,

          error:
            "RECOVERY_EMAIL_SAVE_FAILED",
        },
        500,
      );
    }


    /* =====================================================
       AUDIT EACH KEY
       ===================================================== */

    for (
      const accessKey of
        ownerKeys
    ) {
      await recordAccessAudit(
        supabase,
        {
          accessKeyId:
            accessKey.id,

          eventType:
            "recovery_email_verified",

          actorUserId:
            user.id,

          actorEmail:
            email,

          metadata: {
            challengeId,

            protectedKeys:
              ownerKeys.length,
          },
        },
      );
    }


    return json({
      ok: true,

      verified:
        true,

      email:
        maskEmail(
          email,
        ),

      protectedKeys:
        ownerKeys.length,
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
      "AllWDbook AWD-KEY Security Email",

    actions: [
      "send",
      "verify",
    ],
  });
}
