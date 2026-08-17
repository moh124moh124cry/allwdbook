"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getSupabase,
} from "../../../lib/supabase";


/* =========================================================
   TEXT
   ========================================================= */

const TEXT = {
  ar: {
    thanks:
      "تم استلام عملية الدفع",

    subtitle:
      "نفعّل خطتك الآن تلقائياً. لا تحتاج إلى إنشاء حساب أو تسجيل الدخول.",

    checking:
      "جارٍ تفعيل خطتك",

    checkingNote:
      "ننتظر تأكيد Lemon Squeezy وربط الخطة بهذا الجهاز.",

    ready:
      "تم تفعيل خطتك بنجاح",

    readyNote:
      "أصبحت المزايا المدفوعة جاهزة للاستخدام على هذا الجهاز.",

    keyTitle:
      "رمز استعادة خطتك",

    keyDescription:
      "احتفظ بهذا الرمز في مكان آمن. ستستخدمه لاستعادة خطتك إذا غيرت الهاتف أو الجهاز، بدون تسجيل دخول.",

    copy:
      "نسخ الرمز",

    copied:
      "تم نسخ الرمز ✓",

    devices:
      "الأجهزة",

    plan:
      "الخطة",

    permanent:
      "وصول دائم",

    pendingKey:
      "تم تفعيل الخطة، وننتظر إنشاء رمز الاستعادة...",

    pending:
      "التفعيل ما زال قيد المعالجة",

    pendingNote:
      "عملية الدفع محفوظة. انتظر بضع ثوانٍ ثم اضغط إعادة التحقق.",

    retry:
      "إعادة التحقق",

    home:
      "الدخول إلى AllWDbook",

    billing:
      "إدارة الاشتراك والفواتير",

    secure:
      "دفع آمن",

    automatic:
      "تفعيل تلقائي",

    noLogin:
      "بدون تسجيل دخول",

    important:
      "مهم",

    importantText:
      "لا ترسل رمز الوصول لأي شخص. من يملك الرمز يمكنه محاولة تفعيل خطتك على جهاز آخر.",

    sessionProblem:
      "تعذر العثور على جلسة الجهاز المرتبطة بعملية الشراء.",

    sessionProblemNote:
      "لا تقم بإعادة الدفع. أعد فتح الموقع من نفس المتصفح الذي استخدمته أثناء الشراء ثم اضغط إعادة التحقق.",

    contact:
      "التواصل مع الدعم",
  },

  en: {
    thanks:
      "Payment received",

    subtitle:
      "We are activating your plan automatically. No account or sign-in is required.",

    checking:
      "Activating your plan",

    checkingNote:
      "Waiting for Lemon Squeezy confirmation and linking access to this device.",

    ready:
      "Your plan is active",

    readyNote:
      "Your paid features are now ready on this device.",

    keyTitle:
      "Plan Recovery Key",

    keyDescription:
      "Keep this key somewhere safe. Use it to recover your plan on a new phone or device without signing in.",

    copy:
      "Copy key",

    copied:
      "Key copied ✓",

    devices:
      "Devices",

    plan:
      "Plan",

    permanent:
      "Permanent access",

    pendingKey:
      "Your plan is active. We are finishing your recovery key...",

    pending:
      "Activation is still processing",

    pendingNote:
      "Your payment is safe. Wait a few seconds and check again.",

    retry:
      "Check again",

    home:
      "Enter AllWDbook",

    billing:
      "Manage subscription & billing",

    secure:
      "Secure payment",

    automatic:
      "Automatic activation",

    noLogin:
      "No sign-in required",

    important:
      "Important",

    importantText:
      "Do not share your access key. Anyone with the key may try to activate your plan on another device.",

    sessionProblem:
      "We could not find the device session linked to this purchase.",

    sessionProblemNote:
      "Do not pay again. Open AllWDbook in the same browser used for checkout, then check again.",

    contact:
      "Contact support",
  },
};


/* =========================================================
   PAGE
   ========================================================= */

export default function PaymentSuccessPage() {
  const timerRef =
    useRef(null);

  const [
    language,
    setLanguage,
  ] = useState("ar");

  const [
    status,
    setStatus,
  ] = useState(
    "checking",
  );

  const [
    access,
    setAccess,
  ] = useState(null);

  const [
    accessKey,
    setAccessKey,
  ] = useState(null);

  const [
    attempt,
    setAttempt,
  ] = useState(0);

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    sessionMissing,
    setSessionMissing,
  ] = useState(false);


  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;


  /* =======================================================
     LANGUAGE
     ======================================================= */

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          "awd_lang",
        );

      const detected =
        saved === "en"
          ? "en"
          : "ar";

      setLanguage(
        detected,
      );

      document.documentElement.lang =
        detected;

      document.documentElement.dir =
        detected === "en"
          ? "ltr"
          : "rtl";
    } catch {
      setLanguage("ar");
    }
  }, []);


  /* =======================================================
     START
     ======================================================= */

  useEffect(() => {
    checkPurchase(0);

    return () => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current,
        );
      }
    };
  }, []);


  /* =======================================================
     SESSION
     ======================================================= */

  async function getCurrentSession() {
    const supabase =
      getSupabase();

    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    /*
     * لا نفرض البريد.
     *
     * المستخدم الطبيعي يكون لديه
     * Anonymous Supabase Session
     * تم إنشاؤها قبل الدفع.
     */

    if (
      session?.access_token &&
      session?.user?.id
    ) {
      return session;
    }

    /*
     * إذا لم توجد جلسة إطلاقاً،
     * ننشئ Anonymous Session حتى يبقى
     * الموقع قابلاً للاستخدام.
     *
     * لكن هذه الجلسة الجديدة لن تكون
     * بالضرورة نفس user_id الذي اشترى،
     * ولذلك سنوضح للمستخدم إذا لم نجد الخطة.
     */

    const {
      data,
      error,
    } =
      await supabase.auth
        .signInAnonymously();

    if (error) {
      console.error(
        "Anonymous session failed:",
        error,
      );

      return null;
    }

    setSessionMissing(
      true,
    );

    return (
      data?.session ||
      null
    );
  }


  /* =======================================================
     FETCH LEGACY/CURRENT ACCESS
     ======================================================= */

  async function fetchAccess(
    token,
  ) {
    const response =
      await fetch(
        "/api/access",
        {
          method:
            "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache:
            "no-store",
        },
      );

    const data =
      await response
        .json()
        .catch(
          () => ({}),
        );

    if (
      !response.ok ||
      !data?.ok
    ) {
      throw new Error(
        data?.error ||
          "ACCESS_CHECK_FAILED",
      );
    }

    return data;
  }


  /* =======================================================
     FETCH ACCESS KEY
     ======================================================= */

  async function fetchAccessKeys(
    token,
  ) {
    const response =
      await fetch(
        "/api/access-key/me",
        {
          method:
            "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          cache:
            "no-store",
        },
      );

    const data =
      await response
        .json()
        .catch(
          () => ({}),
        );

    if (
      !response.ok ||
      !data?.ok
    ) {
      return {
        keys: [],
        paid: false,
      };
    }

    return data;
  }


  /* =======================================================
     CHECK PURCHASE
     ======================================================= */

  async function checkPurchase(
    currentAttempt = 0,
  ) {
    if (
      timerRef.current
    ) {
      clearTimeout(
        timerRef.current,
      );
    }

    setAttempt(
      currentAttempt,
    );

    setStatus(
      "checking",
    );


    try {
      const session =
        await getCurrentSession();

      if (
        !session
          ?.access_token
      ) {
        setStatus(
          "session_error",
        );

        return;
      }


      /*
       * نفحص نظام الوصول الحالي
       * ونظام AWD-KEY الجديد معاً.
       */

      const [
        accessData,
        keyData,
      ] =
        await Promise.all([
          fetchAccess(
            session
              .access_token,
          ),

          fetchAccessKeys(
            session
              .access_token,
          ),
        ]);


      setAccess(
        accessData,
      );


      const keys =
        Array.isArray(
          keyData
            ?.keys,
        )
          ? keyData.keys
          : [];


      /*
       * نختار أحدث Access Key صالح.
       *
       * صاحب جهاز الشراء الأصلي
       * يحصل على code الكامل.
       */

      const usableKeys =
        keys.filter(
          (item) =>
            item?.usable,
        );


      const bestKey =
        usableKeys.find(
          (item) =>
            item
              ?.canRevealCode &&
            item?.code,
        ) ||
        usableKeys[0] ||
        null;


      setAccessKey(
        bestKey,
      );


      const hasPaidAccess =
        Boolean(
          accessData
            ?.paid ||
          accessData
            ?.lifetime ||
          keyData?.paid,
        );


      /*
       * الحالة المثالية:
       *
       * الخطة مفعلة +
       * Access Key تم إنشاؤه.
       */

      if (
        hasPaidAccess &&
        bestKey
      ) {
        setStatus(
          "ready",
        );

        window.dispatchEvent(
          new Event(
            "allwdbook-access-refresh",
          ),
        );

        return;
      }


      /*
       * أحياناً allwdbook_subscriptions
       * تُحفظ قبل Access Key بجزء من الثانية.
       *
       * لا نظهر نجاحاً ناقصاً فوراً.
       * نستمر في Polling حتى يصل الكود.
       */

      if (
        currentAttempt <
        10
      ) {
        timerRef.current =
          setTimeout(
            () => {
              checkPurchase(
                currentAttempt +
                  1,
              );
            },
            3000,
          );

        return;
      }


      /*
       * إذا الخطة موجودة لكن الكود
       * لم يظهر بعد.
       */

      if (
        hasPaidAccess
      ) {
        setStatus(
          "key_pending",
        );

        return;
      }


      /*
       * إذا أنشأنا Session جديدة بعد العودة
       * من Checkout ولا نجد شراء مرتبطاً بها.
       */

      if (
        sessionMissing
      ) {
        setStatus(
          "session_error",
        );

        return;
      }


      setStatus(
        "pending",
      );
    } catch (error) {
      console.error(
        "Payment verification failed:",
        error,
      );


      if (
        currentAttempt <
        4
      ) {
        timerRef.current =
          setTimeout(
            () => {
              checkPurchase(
                currentAttempt +
                  1,
              );
            },
            3000,
          );

        return;
      }


      setStatus(
        "pending",
      );
    }
  }


  /* =======================================================
     COPY KEY
     ======================================================= */

  async function copyKey() {
    if (
      !accessKey?.code
    ) {
      return;
    }

    try {
      await navigator
        .clipboard
        .writeText(
          accessKey.code,
        );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(
            false,
          );
        },
        1800,
      );
    } catch (
      error
    ) {
      console.error(
        "Copy access key failed:",
        error,
      );
    }
  }


  /* =======================================================
     BILLING URL
     ======================================================= */

  const billingUrl =
    Array.isArray(
      access
        ?.subscriptions,
    )
      ? access
          .subscriptions
          .find(
            (item) =>
              item
                ?.customer_portal_url,
          )
          ?.customer_portal_url ||
        ""
      : "";


  /* =======================================================
     PLAN NAME
     ======================================================= */

  const planName =
    accessKey?.plan
      ? isEnglish
        ? accessKey
            .plan
            .nameEn
        : accessKey
            .plan
            .nameAr
      : access?.lifetime
        ? "Lifetime"
        : "";


  /* =======================================================
     UI
     ======================================================= */

  return (
    <main
      className="success-page"
      dir={
        isEnglish
          ? "ltr"
          : "rtl"
      }
    >
      <style jsx global>{`
        body {
          margin: 0;
          background: #02060d;
        }

        .success-page,
        .success-page * {
          box-sizing: border-box;
        }

        .success-page {
          --orange: #ff6900;
          --orange-2: #ff7b1d;

          --text: #f7f9fd;
          --muted: #899bb4;

          width: 100%;
          min-height: 100dvh;

          display: grid;
          place-items: center;

          padding:
            24px 14px
            calc(
              24px +
                env(
                  safe-area-inset-bottom
                )
            );

          overflow-x: hidden;

          color: var(--text);

          background:
            radial-gradient(
              circle at 50% -160px,
              rgba(29, 89, 156, 0.22),
              transparent 430px
            ),
            linear-gradient(
              180deg,
              #02060d 0%,
              #030b17 46%,
              #020812 100%
            );
        }

        .success-card {
          width: min(
            560px,
            100%
          );

          overflow: hidden;

          border:
            1px solid
            rgba(
              91,
              134,
              187,
              0.2
            );

          border-radius: 27px;

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #08182c,
              #04101e
            );

          box-shadow:
            0 28px 90px
            rgba(
              0,
              0,
              0,
              0.42
            );
        }

        [dir="rtl"]
          .success-card {
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #08182c,
              #04101e
            );
        }

        .success-header {
          padding:
            27px 20px
            21px;

          text-align: center;
        }

        .success-logo {
          width: 68px;
          height: 68px;

          object-fit: cover;

          border-radius: 20px;

          box-shadow:
            0 15px 35px
            rgba(
              0,
              0,
              0,
              0.3
            );
        }

        .success-kicker {
          width: max-content;
          max-width: 100%;

          display: inline-flex;
          align-items: center;

          gap: 7px;

          margin-top: 17px;

          padding:
            6px 10px;

          border:
            1px solid
            rgba(
              255,
              105,
              0,
              0.27
            );

          border-radius: 999px;

          background:
            rgba(
              255,
              105,
              0,
              0.07
            );

          color: #ff9853;

          font-size: 9px;
          font-weight: 900;
        }

        .success-kicker::before {
          content: "";

          width: 7px;
          height: 7px;

          border-radius: 50%;

          background:
            var(--orange);
        }

        .success-header h1 {
          margin:
            14px 0 0;

          color: white;

          font-size: 25px;

          line-height: 1.25;
        }

        .success-header p {
          max-width: 430px;

          margin:
            9px auto 0;

          color:
            var(--muted);

          font-size: 12px;

          line-height: 1.75;
        }

        .success-body {
          padding:
            0 18px 20px;
        }

        /* STATUS */

        .status-card {
          padding: 18px;

          border:
            1px solid
            #17324f;

          border-radius: 18px;

          background:
            rgba(
              2,
              12,
              25,
              0.68
            );

          text-align: center;
        }

        .status-card.ready {
          border-color:
            rgba(
              33,
              196,
              135,
              0.33
            );

          background:
            rgba(
              33,
              196,
              135,
              0.055
            );
        }

        .status-icon {
          width: 55px;
          height: 55px;

          display: grid;
          place-items: center;

          margin-inline: auto;

          border:
            1px solid
            #1a3a5c;

          border-radius: 17px;

          background:
            #08192d;

          color:
            #ff9853;

          font-size: 25px;
          font-weight: 900;
        }

        .status-card.ready
          .status-icon {
          border-color:
            rgba(
              33,
              196,
              135,
              0.34
            );

          background:
            rgba(
              33,
              196,
              135,
              0.08
            );

          color:
            #64deab;
        }

        .status-card h2 {
          margin:
            13px 0 0;

          color: white;

          font-size: 18px;
        }

        .status-card p {
          max-width: 400px;

          margin:
            7px auto 0;

          color: #8497ae;

          font-size: 11px;

          line-height: 1.7;
        }

        .loading-ring {
          width: 25px;
          height: 25px;

          margin:
            13px auto 0;

          border:
            3px solid
            #17314d;

          border-top-color:
            var(--orange);

          border-radius: 50%;

          animation:
            successSpin
            0.8s linear
            infinite;
        }

        .attempt {
          display: inline-flex;

          margin-top: 10px;

          padding:
            4px 8px;

          border-radius: 999px;

          background: #07172a;

          color: #667b95;

          font-size: 9px;
        }

        /* ACCESS KEY */

        .key-card {
          margin-top: 12px;

          padding: 17px;

          border:
            1px solid
            rgba(
              255,
              105,
              0,
              0.34
            );

          border-radius: 18px;

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(
                255,
                105,
                0,
                0.11
              ),
              transparent 45%
            ),
            #061426;
        }

        [dir="rtl"]
          .key-card {
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(
                255,
                105,
                0,
                0.11
              ),
              transparent 45%
            ),
            #061426;
        }

        .key-label {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 10px;

          color: #ff9854;

          font-size: 11px;

          font-weight: 900;
        }

        .key-value {
          margin-top: 13px;

          padding:
            14px 10px;

          overflow-wrap: anywhere;

          border:
            1px solid
            #1c3b5d;

          border-radius: 13px;

          background: #020d1a;

          color: white;

          direction: ltr;

          text-align: center;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size:
            clamp(
              13px,
              4vw,
              17px
            );

          font-weight: 900;

          letter-spacing: 0.04em;
        }

        .key-copy {
          width: 100%;

          min-height: 46px;

          margin-top: 10px;

          border:
            1px solid
            var(--orange);

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7d20
            );

          color: white;

          font-size: 12px;
          font-weight: 900;

          cursor: pointer;
        }

        .key-description {
          margin:
            11px 0 0;

          color: #8194ad;

          font-size: 10px;

          line-height: 1.7;
        }

        /* PLAN */

        .plan-card {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap: 8px;

          margin-top: 12px;
        }

        .plan-box {
          padding: 12px;

          border:
            1px solid
            #17314e;

          border-radius: 14px;

          background: #051425;
        }

        .plan-box small {
          display: block;

          color: #71849c;

          font-size: 9px;
        }

        .plan-box strong {
          display: block;

          margin-top: 5px;

          overflow-wrap: anywhere;

          color: white;

          font-size: 12px;
        }

        /* WARNING */

        .key-warning {
          margin-top: 12px;

          padding: 12px;

          border:
            1px solid
            rgba(
              244,
              190,
              73,
              0.25
            );

          border-radius: 13px;

          background:
            rgba(
              244,
              190,
              73,
              0.055
            );

          color: #a99b7b;

          font-size: 10px;

          line-height: 1.65;
        }

        .key-warning b {
          color: #e9c875;
        }

        /* ACTIONS */

        .success-actions {
          display: grid;

          gap: 8px;

          margin-top: 13px;
        }

        .success-primary,
        .success-secondary {
          width: 100%;

          min-height: 47px;

          display: flex;

          align-items: center;
          justify-content: center;

          padding:
            10px 13px;

          border-radius: 12px;

          text-align: center;

          text-decoration: none;

          font-size: 12px;
          font-weight: 900;

          cursor: pointer;
        }

        .success-primary {
          border:
            1px solid
            var(--orange);

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7c20
            );

          color: white;
        }

        .success-secondary {
          border:
            1px solid
            #1c3857;

          background: #07182b;

          color: #dce6f1;
        }

        /* TRUST */

        .success-trust {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 6px;

          margin-top: 15px;
        }

        .trust-item {
          padding:
            9px 4px;

          border:
            1px solid
            rgba(
              90,
              130,
              178,
              0.13
            );

          border-radius: 12px;

          background:
            rgba(
              4,
              17,
              32,
              0.54
            );

          color: #72869f;

          text-align: center;

          font-size: 8px;

          line-height: 1.4;
        }

        .trust-item span {
          display: block;

          margin-bottom: 3px;

          font-size: 16px;
        }

        @keyframes
          successSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        @media (
          max-width: 620px
        ) {
          .success-page {
            place-items:
              start center;

            padding-top: 17px;
          }

          .success-card {
            border-radius: 22px;
          }

          .success-header {
            padding:
              23px 16px
              18px;
          }

          .success-logo {
            width: 62px;
            height: 62px;

            border-radius: 18px;
          }

          .success-header h1 {
            font-size: 22px;
          }

          .success-body {
            padding:
              0 13px 16px;
          }

          .status-card {
            padding:
              16px 12px;
          }

          .key-card {
            padding: 14px;
          }

          .plan-card {
            gap: 6px;
          }
        }
      `}</style>


      <section className="success-card">

        {/* HEADER */}

        <header className="success-header">
          <img
            src="/logov3.png"
            alt="AllWDbook"
            className="success-logo"
          />

          <div className="success-kicker">
            ALLWDBOOK ACCESS
          </div>

          <h1>
            {text.thanks}
          </h1>

          <p>
            {text.subtitle}
          </p>
        </header>


        <div className="success-body">

          {/* CHECKING */}

          {status ===
            "checking" && (
            <section className="status-card">
              <div className="status-icon">
                ↻
              </div>

              <h2>
                {text.checking}
              </h2>

              <p>
                {text.checkingNote}
              </p>

              <div className="loading-ring" />

              <span className="attempt">
                {attempt + 1}/11
              </span>
            </section>
          )}


          {/* READY */}

          {status ===
            "ready" && (
            <>
              <section className="status-card ready">
                <div className="status-icon">
                  ✓
                </div>

                <h2>
                  {text.ready}
                </h2>

                <p>
                  {text.readyNote}
                </p>
              </section>


              {/* RECOVERY CODE */}

              {accessKey
                ?.code && (
                <section className="key-card">
                  <div className="key-label">
                    <span>
                      🔑{" "}
                      {text.keyTitle}
                    </span>

                    <span>
                      {accessKey
                        .activeDevices}
                      /
                      {accessKey
                        .maxActivations}
                    </span>
                  </div>

                  <div className="key-value">
                    {
                      accessKey.code
                    }
                  </div>

                  <button
                    type="button"
                    className="key-copy"
                    onClick={
                      copyKey
                    }
                  >
                    {copied
                      ? `✓ ${text.copied}`
                      : `📋 ${text.copy}`}
                  </button>

                  <p className="key-description">
                    {
                      text.keyDescription
                    }
                  </p>
                </section>
              )}


              {/* PLAN */}

              <div className="plan-card">
                <div className="plan-box">
                  <small>
                    {text.plan}
                  </small>

                  <strong>
                    {planName ||
                      "AllWDbook Pro"}
                  </strong>
                </div>

                <div className="plan-box">
                  <small>
                    {text.devices}
                  </small>

                  <strong
                    dir="ltr"
                  >
                    {accessKey
                      ?.activeDevices ??
                      1}
                    {" / "}
                    {accessKey
                      ?.maxActivations ??
                      3}
                  </strong>
                </div>
              </div>


              <div className="key-warning">
                <b>
                  ⚠️{" "}
                  {text.important}:
                </b>{" "}
                {text.importantText}
              </div>
            </>
          )}


          {/* KEY PENDING */}

          {status ===
            "key_pending" && (
            <section className="status-card">
              <div className="status-icon">
                🔑
              </div>

              <h2>
                {text.ready}
              </h2>

              <p>
                {text.pendingKey}
              </p>
            </section>
          )}


          {/* PENDING */}

          {status ===
            "pending" && (
            <section className="status-card">
              <div className="status-icon">
                ⌛
              </div>

              <h2>
                {text.pending}
              </h2>

              <p>
                {text.pendingNote}
              </p>
            </section>
          )}


          {/* SESSION PROBLEM */}

          {status ===
            "session_error" && (
            <section className="status-card">
              <div className="status-icon">
                !
              </div>

              <h2>
                {text.sessionProblem}
              </h2>

              <p>
                {
                  text.sessionProblemNote
                }
              </p>
            </section>
          )}


          {/* ACTIONS */}

          <div className="success-actions">

            {(status ===
              "pending" ||
              status ===
                "key_pending" ||
              status ===
                "session_error") && (
              <button
                type="button"
                className="success-primary"
                onClick={() =>
                  checkPurchase(
                    0,
                  )
                }
              >
                🔄{" "}
                {text.retry}
              </button>
            )}


            {status ===
              "ready" && (
              <a
                href="/"
                className="success-primary"
              >
                🚀{" "}
                {text.home}
              </a>
            )}


            {billingUrl && (
              <a
                href={
                  billingUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="success-secondary"
              >
                ⚙️{" "}
                {text.billing}
              </a>
            )}


            {status !==
              "ready" && (
              <a
                href="/"
                className="success-secondary"
              >
                🏠 AllWDbook
              </a>
            )}


            {status ===
              "session_error" && (
              <a
                href="mailto:anesscherfaoui@gmail.com"
                className="success-secondary"
              >
                ✉️{" "}
                {text.contact}
              </a>
            )}
          </div>


          {/* TRUST */}

          <div className="success-trust">
            <div className="trust-item">
              <span>
                🔒
              </span>

              {text.secure}
            </div>

            <div className="trust-item">
              <span>
                ⚡
              </span>

              {text.automatic}
            </div>

            <div className="trust-item">
              <span>
                👤
              </span>

              {text.noLogin}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
