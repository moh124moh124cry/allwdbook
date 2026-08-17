"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useAccess,
} from "../lib/useAccess";


/* =========================================================
   CHECKOUT
   ========================================================= */

const LIFETIME_CHECKOUT_URL =
  process.env
    .NEXT_PUBLIC_LEMON_LIFETIME_CHECKOUT_URL ||
  "";


const PACKAGES = [
  {
    id: "cover",
    ar: "مصمم الأغلفة",
    en: "Cover Designer",
    price: "$2.49",
    periodAr: "شهريًا",
    periodEn: "monthly",
    icon: "📐",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/a40b815f-2b2c-4086-b8b8-3afcd0bf7a4d",
  },

  {
    id: "micro_niche",
    ar: "Micro-Niche",
    en: "Micro-Niche",
    price: "$2.49",
    periodAr: "شهريًا",
    periodEn: "monthly",
    icon: "🎯",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/c205aef7-1c77-4711-9fba-ee2b9a81153b",
  },

  {
    id: "keywords",
    ar: "الكلمات المفتاحية",
    en: "Keyword Research",
    price: "$2.49",
    periodAr: "شهريًا",
    periodEn: "monthly",
    icon: "🔑",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",
  },

  {
    id: "pro_monthly",
    ar: "AllWDbook Pro",
    en: "AllWDbook Pro",
    price: "$5.99",
    periodAr: "شهريًا",
    periodEn: "monthly",
    icon: "⚡",
    featured: true,
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/00e64ca6-4e8c-42c2-aa44-e9667d745524",
  },

  {
    id: "pro_yearly",
    ar: "Pro السنوي",
    en: "Pro Yearly",
    price: "$55",
    periodAr: "سنويًا",
    periodEn: "yearly",
    icon: "👑",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/14a4b6b5-553f-4070-bd39-932ba2270aa5",
  },
];


/* =========================================================
   TEXT
   ========================================================= */

const TEXT = {
  ar: {
    account: "الحساب والوصول",
    accountSubtitle:
      "إدارة خطتك واستعادتها بدون تسجيل دخول",

    openAccount:
      "فتح الحساب",

    currentAccess:
      "وصولك الحالي",

    loading:
      "جارٍ التحقق...",

    free:
      "الخطة المجانية",

    lifetime:
      "Lifetime — وصول مدى الحياة",

    showPlans:
      "عرض الباقات",

    hidePlans:
      "إخفاء الباقات",

    active:
      "مفعلة",

    included:
      "مشمولة",

    lifetimeTitle:
      "Lifetime",

    lifetimeSub:
      "وصول دائم لجميع الأدوات",

    lifetimePrice:
      "$125 دفعة واحدة",

    buyLifetime:
      "شراء Lifetime",

    restore:
      "استعادة خطتي",

    restoreSub:
      "استخدم رمز AWD-KEY على جهاز جديد",

    restoreTitle:
      "استعادة خطة AllWDbook",

    restoreDescription:
      "أدخل رمز الوصول الذي حصلت عليه بعد الدفع. يمكنك أيضًا استخدام رمز AWD-LIFE القديم إذا كنت من مستخدمي Lifetime السابقين.",

    codePlaceholder:
      "AWD-KEY-XXXX-XXXX-XXXX-XXXX-XXXX",

    activate:
      "استعادة الخطة",

    processing:
      "جارٍ التحقق...",

    restoreSuccess:
      "تمت استعادة خطتك بنجاح",

    restoreSuccessNote:
      "هذا الجهاز أصبح مرتبطًا بخطتك ويمكنك استخدام المزايا المدفوعة الآن.",

    restoredPlan:
      "الخطة",

    devices:
      "الأجهزة",

    close:
      "إغلاق",

    recoveryCode:
      "رمز استعادة خطتي",

    recoveryCodeSub:
      "عرض رمز استعادة الخطة",

    codeTitle:
      "رمز استعادة خطتك",

    codeWarning:
      "احتفظ بهذا الرمز في مكان آمن ولا تشاركه مع أي شخص. يمكنك استخدامه لاستعادة خطتك على جهاز جديد.",

    copy:
      "نسخ الرمز",

    copied:
      "تم النسخ ✓",

    codeUnavailable:
      "لحماية خطتك، الرمز الكامل يظهر فقط على جهاز الشراء الأصلي. هذا الجهاز يرى نسخة مخفية فقط.",

    securityEmail:
      "بريد الحماية",

    securityEmailSub:
      "حماية إضافية لـLifetime القديم",

    emailTitle:
      "حماية Lifetime بالبريد",

    emailDescription:
      "هذه الخاصية حاليًا خاصة بنظام Lifetime القديم. سنربط بريد الحماية بجميع رموز AWD-KEY في المرحلة التالية.",

    emailPlaceholder:
      "name@example.com",

    sendCode:
      "إرسال رمز التحقق",

    otpPlaceholder:
      "رمز التحقق من 6 أرقام",

    verify:
      "تأكيد البريد",

    verified:
      "تم توثيق بريد الأمان بنجاح.",

    billing:
      "إدارة الاشتراك والفواتير",

    genericError:
      "تعذر تنفيذ العملية. حاول مرة أخرى.",

    badCode:
      "رمز الوصول غير صحيح أو غير فعال.",

    activationLimit:
      "وصل هذا الرمز إلى الحد الأقصى للأجهزة.",

    rateLimited:
      "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.",

    invalidEmail:
      "أدخل بريدًا إلكترونيًا صحيحًا.",

    invalidOtp:
      "أدخل رمز تحقق صحيحًا من 6 أرقام.",

    missingCheckout:
      "رابط الدفع لهذه الخطة غير مضبوط.",

    copyFailed:
      "تعذر نسخ الرمز تلقائيًا.",

    ownerDevice:
      "جهاز الشراء الأصلي",

    noCode:
      "لم نجد رمز استعادة مرتبطًا بهذا الجهاز.",

    goPlans:
      "فتح صفحة الاشتراك",
  },


  en: {
    account:
      "Account & Access",

    accountSubtitle:
      "Manage and recover your plan without signing in",

    openAccount:
      "Open account",

    currentAccess:
      "Current access",

    loading:
      "Checking...",

    free:
      "Free Plan",

    lifetime:
      "Lifetime Access",

    showPlans:
      "View plans",

    hidePlans:
      "Hide plans",

    active:
      "Active",

    included:
      "Included",

    lifetimeTitle:
      "Lifetime",

    lifetimeSub:
      "Permanent access to all tools",

    lifetimePrice:
      "$125 one-time",

    buyLifetime:
      "Buy Lifetime",

    restore:
      "Recover my plan",

    restoreSub:
      "Use your AWD-KEY on a new device",

    restoreTitle:
      "Recover AllWDbook Access",

    restoreDescription:
      "Enter the access key you received after payment. Legacy AWD-LIFE codes are also supported.",

    codePlaceholder:
      "AWD-KEY-XXXX-XXXX-XXXX-XXXX-XXXX",

    activate:
      "Recover Plan",

    processing:
      "Checking...",

    restoreSuccess:
      "Your plan has been recovered",

    restoreSuccessNote:
      "This device is now linked to your plan and your paid features are available.",

    restoredPlan:
      "Plan",

    devices:
      "Devices",

    close:
      "Close",

    recoveryCode:
      "My recovery key",

    recoveryCodeSub:
      "View your plan recovery key",

    codeTitle:
      "Your Plan Recovery Key",

    codeWarning:
      "Store this key safely and do not share it. You can use it to recover your plan on a new device.",

    copy:
      "Copy key",

    copied:
      "Copied ✓",

    codeUnavailable:
      "For security, the full key is only shown on the original purchase device. This device only sees a masked version.",

    securityEmail:
      "Security email",

    securityEmailSub:
      "Extra protection for legacy Lifetime",

    emailTitle:
      "Protect Lifetime with email",

    emailDescription:
      "This feature currently applies to legacy Lifetime. AWD-KEY email protection will be connected next.",

    emailPlaceholder:
      "name@example.com",

    sendCode:
      "Send verification code",

    otpPlaceholder:
      "6-digit verification code",

    verify:
      "Verify email",

    verified:
      "Security email verified successfully.",

    billing:
      "Manage subscription & billing",

    genericError:
      "Unable to complete the request. Try again.",

    badCode:
      "This access key is invalid or inactive.",

    activationLimit:
      "This key has reached its device limit.",

    rateLimited:
      "Too many attempts. Please wait before trying again.",

    invalidEmail:
      "Enter a valid email address.",

    invalidOtp:
      "Enter a valid 6-digit verification code.",

    missingCheckout:
      "Checkout URL is not configured.",

    copyFailed:
      "Automatic copy failed.",

    ownerDevice:
      "Original purchase device",

    noCode:
      "No recovery key was found for this device.",

    goPlans:
      "Open subscription page",
  },
};


/* =========================================================
   HELPERS
   ========================================================= */

function getBillingUrl(
  subscriptions,
) {
  if (
    !Array.isArray(
      subscriptions,
    )
  ) {
    return "";
  }

  return (
    subscriptions.find(
      (item) =>
        item?.customer_portal_url,
    )
      ?.customer_portal_url ||
    ""
  );
}


function getPlanLabel(
  planId,
  isEnglish,
) {
  if (
    planId === "lifetime"
  ) {
    return "Lifetime";
  }

  const plan =
    PACKAGES.find(
      (item) =>
        item.id ===
        planId,
    );

  if (!plan) {
    return planId;
  }

  return isEnglish
    ? plan.en
    : plan.ar;
}


function normalizeTypedCode(
  value,
) {
  return String(
    value || "",
  )
    .trim()
    .toUpperCase()
    .replace(
      /\s+/g,
      "",
    );
}


function isUniversalKey(
  code,
) {
  const compact =
    String(
      code || "",
    )
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        "",
      );

  return compact.startsWith(
    "AWDKEY",
  );
}


function isLegacyLifetimeKey(
  code,
) {
  const compact =
    String(
      code || "",
    )
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        "",
      );

  return compact.startsWith(
    "AWDLIFE",
  );
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function AccountMenu() {
  const access =
    useAccess();


  const [
    mounted,
    setMounted,
  ] =
    useState(false);


  const [
    open,
    setOpen,
  ] =
    useState(false);


  const [
    showPlans,
    setShowPlans,
  ] =
    useState(false);


  const [
    language,
    setLanguage,
  ] =
    useState("ar");


  const [
    dialog,
    setDialog,
  ] =
    useState("");


  const [
    busy,
    setBusy,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    accessCode,
    setAccessCode,
  ] =
    useState("");


  const [
    restoreResult,
    setRestoreResult,
  ] =
    useState(null);


  const [
    revealedCode,
    setRevealedCode,
  ] =
    useState("");


  const [
    revealedCodeHint,
    setRevealedCodeHint,
  ] =
    useState("");


  const [
    revealedCodePlan,
    setRevealedCodePlan,
  ] =
    useState("");


  const [
    copied,
    setCopied,
  ] =
    useState(false);


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    otp,
    setOtp,
  ] =
    useState("");


  const [
    emailStep,
    setEmailStep,
  ] =
    useState("email");


  const isEnglish =
    language === "en";


  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;


  const activePlans =
    Array.isArray(
      access.plans,
    )
      ? access.plans
      : [];


  const billingUrl =
    getBillingUrl(
      access.subscriptions,
    );


  /* =======================================================
     MOUNT
     ======================================================= */

  useEffect(() => {
    setMounted(true);
  }, []);


  /* =======================================================
     LANGUAGE
     ======================================================= */

  useEffect(() => {
    function detectLanguage(
      event,
    ) {
      const eventLanguage =
        event?.detail;

      const savedLanguage =
        window.localStorage.getItem(
          "awd_lang",
        );


      if (
        eventLanguage === "en" ||
        eventLanguage === "ar"
      ) {
        setLanguage(
          eventLanguage,
        );

        return;
      }


      if (
        savedLanguage === "en" ||
        savedLanguage === "ar"
      ) {
        setLanguage(
          savedLanguage,
        );

        return;
      }


      setLanguage(
        document
          .documentElement
          .lang === "en"
          ? "en"
          : "ar",
      );
    }


    detectLanguage();


    window.addEventListener(
      "awd-language-change",
      detectLanguage,
    );


    return () => {
      window.removeEventListener(
        "awd-language-change",
        detectLanguage,
      );
    };
  }, []);


  /* =======================================================
     BODY LOCK
     ======================================================= */

  useEffect(() => {
    if (
      !open &&
      !dialog
    ) {
      return;
    }


    const oldOverflow =
      document.body.style
        .overflow;


    const oldOverscroll =
      document.body.style
        .overscrollBehavior;


    document.body.style
      .overflow =
      "hidden";


    document.body.style
      .overscrollBehavior =
      "none";


    return () => {
      document.body.style
        .overflow =
        oldOverflow;

      document.body.style
        .overscrollBehavior =
        oldOverscroll;
    };
  }, [
    open,
    dialog,
  ]);


  /* =======================================================
     ESCAPE
     ======================================================= */

  useEffect(() => {
    function handleEscape(
      event,
    ) {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }


      if (dialog) {
        closeDialog();
      } else {
        setOpen(false);
      }
    }


    document.addEventListener(
      "keydown",
      handleEscape,
    );


    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    dialog,
  ]);


  /* =======================================================
     CURRENT PLAN
     ======================================================= */

  const currentPlanLabel =
    access.loading
      ? text.loading
      : access.lifetime
        ? text.lifetime
        : activePlans.length
          ? activePlans
              .map(
                (plan) =>
                  getPlanLabel(
                    plan,
                    isEnglish,
                  ),
              )
              .join(" · ")
          : text.free;


  /* =======================================================
     SESSION
     ======================================================= */

  async function getSession() {
    const session =
      await access.ensureSession();


    if (
      !session
        ?.access_token ||
      !session
        ?.user
        ?.id
    ) {
      throw new Error(
        "SESSION_MISSING",
      );
    }


    return session;
  }


  /* =======================================================
     CHECKOUT
     ======================================================= */

  async function openCheckout(
    plan,
  ) {
    if (busy) {
      return;
    }


    setBusy(true);

    setError("");


    try {
      if (
        !plan?.checkoutUrl
      ) {
        setError(
          text.missingCheckout,
        );

        return;
      }


      const session =
        await getSession();


      const checkout =
        new URL(
          plan.checkoutUrl,
        );


      checkout.searchParams.set(
        "checkout[custom][user_id]",
        session.user.id,
      );


      checkout.searchParams.set(
        "checkout[custom][plan_id]",
        plan.id,
      );


      if (
        session.user.email
      ) {
        checkout.searchParams.set(
          "checkout[email]",
          session.user.email,
        );
      }


      window.location.assign(
        checkout.toString(),
      );
    } catch (
      checkoutError
    ) {
      console.error(
        "Checkout error:",
        checkoutError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  function buyLifetime() {
    openCheckout({
      id:
        "lifetime",

      checkoutUrl:
        LIFETIME_CHECKOUT_URL,
    });
  }


  /* =======================================================
     RESTORE
     ======================================================= */

  function openRestoreDialog() {
    setOpen(false);

    setDialog(
      "restore",
    );

    setAccessCode("");

    setRestoreResult(
      null,
    );

    setError("");
  }


  async function activateCode(
    event,
  ) {
    event.preventDefault();


    const cleanCode =
      normalizeTypedCode(
        accessCode,
      );


    if (!cleanCode) {
      setError(
        text.badCode,
      );

      return;
    }


    const universal =
      isUniversalKey(
        cleanCode,
      );


    const legacy =
      isLegacyLifetimeKey(
        cleanCode,
      );


    if (
      !universal &&
      !legacy
    ) {
      setError(
        text.badCode,
      );

      return;
    }


    setBusy(true);

    setError("");

    setRestoreResult(
      null,
    );


    try {
      const session =
        await getSession();


      /* ===================================================
         AWD-KEY
         =================================================== */

      if (universal) {
        const response =
          await fetch(
            "/api/access-key/activate",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                JSON.stringify({
                  code:
                    cleanCode,

                  deviceName:
                    isEnglish
                      ? "Recovered device"
                      : "جهاز مستعاد",

                  deviceInfo: {
                    platform:
                      navigator.platform ||
                      "",

                    language:
                      navigator.language ||
                      "",

                    mobile:
                      /Android|iPhone|iPad|iPod|Mobile/i.test(
                        navigator.userAgent ||
                          "",
                      ),
                  },
                }),
            },
          );


        const data =
          await response
            .json()
            .catch(
              () => ({}),
            );


        if (
          !response.ok
        ) {
          if (
            data?.error ===
            "ACTIVATION_LIMIT_REACHED"
          ) {
            setError(
              text.activationLimit,
            );
          } else if (
            data?.error ===
            "RATE_LIMITED"
          ) {
            setError(
              text.rateLimited,
            );
          } else {
            setError(
              text.badCode,
            );
          }

          return;
        }


        setRestoreResult({
          type:
            "universal",

          planId:
            data.planId,

          planName:
            isEnglish
              ? data.plan
                  ?.nameEn ||
                getPlanLabel(
                  data.planId,
                  true,
                )
              : data.plan
                  ?.nameAr ||
                getPlanLabel(
                  data.planId,
                  false,
                ),

          codeHint:
            data.codeHint,

          activeDevices:
            data.activeDevices,

          maxActivations:
            data.maxActivations,
        });


        setAccessCode("");


        await access.refresh();


        window.dispatchEvent(
          new Event(
            "allwdbook-access-refresh",
          ),
        );


        return;
      }


      /* ===================================================
         AWD-LIFE LEGACY
         =================================================== */

      const response =
        await fetch(
          "/api/license/activate",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                code:
                  cleanCode,
              }),
          },
        );


      const data =
        await response
          .json()
          .catch(
            () => ({}),
          );


      if (
        !response.ok
      ) {
        if (
          data?.error ===
          "ACTIVATION_LIMIT_REACHED"
        ) {
          setError(
            text.activationLimit,
          );
        } else {
          setError(
            text.badCode,
          );
        }

        return;
      }


      setRestoreResult({
        type:
          "legacy",

        planName:
          "Lifetime",

        activeDevices:
          data
            ?.activeActivations ||
          null,

        maxActivations:
          data
            ?.maxActivations ||
          null,
      });


      setAccessCode("");


      await access.refresh();


      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );
    } catch (
      activationError
    ) {
      console.error(
        "Plan activation failed:",
        activationError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  /* =======================================================
     REVEAL CODE
     ======================================================= */

  async function revealCode() {
    setOpen(false);

    setDialog(
      "code",
    );

    setRevealedCode("");

    setRevealedCodeHint("");

    setRevealedCodePlan("");

    setCopied(false);

    setBusy(true);

    setError("");


    try {
      const session =
        await getSession();


      const keyResponse =
        await fetch(
          "/api/access-key/me",
          {
            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache:
              "no-store",
          },
        );


      const keyData =
        await keyResponse
          .json()
          .catch(
            () => ({}),
          );


      if (
        keyResponse.ok &&
        Array.isArray(
          keyData?.keys,
        ) &&
        keyData.keys.length
      ) {
        const usableKeys =
          keyData.keys.filter(
            (item) =>
              item?.usable,
          );


        const ownerKey =
          usableKeys.find(
            (item) =>
              item
                ?.canRevealCode &&
              item?.code,
          );


        const anyKey =
          ownerKey ||
          usableKeys[0] ||
          null;


        if (anyKey) {
          setRevealedCode(
            ownerKey?.code ||
              "",
          );


          setRevealedCodeHint(
            anyKey?.codeHint ||
              "",
          );


          setRevealedCodePlan(
            isEnglish
              ? anyKey
                  ?.plan
                  ?.nameEn ||
                getPlanLabel(
                  anyKey
                    ?.planId,
                  true,
                )
              : anyKey
                  ?.plan
                  ?.nameAr ||
                getPlanLabel(
                  anyKey
                    ?.planId,
                  false,
                ),
          );


          return;
        }
      }


      /* ===================================================
         LEGACY LIFETIME
         =================================================== */

      const legacyResponse =
        await fetch(
          "/api/license/code",
          {
            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache:
              "no-store",
          },
        );


      const legacyData =
        await legacyResponse
          .json()
          .catch(
            () => ({}),
          );


      if (
        legacyResponse.ok &&
        legacyData?.code
      ) {
        setRevealedCode(
          legacyData.code,
        );

        setRevealedCodeHint(
          legacyData
            ?.codeHint ||
          "",
        );

        setRevealedCodePlan(
          "Lifetime",
        );


        if (
          legacyData
            .recoveryEmail
        ) {
          setEmail(
            legacyData
              .recoveryEmail,
          );
        }


        return;
      }


      setError(
        text.noCode,
      );
    } catch (
      codeError
    ) {
      console.error(
        "Recovery code lookup failed:",
        codeError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  async function copyCode() {
    if (
      !revealedCode
    ) {
      return;
    }


    try {
      await navigator
        .clipboard
        .writeText(
          revealedCode,
        );


      setCopied(true);


      window.setTimeout(
        () => {
          setCopied(
            false,
          );
        },
        1600,
      );
    } catch (
      clipboardError
    ) {
      console.error(
        "Copy failed:",
        clipboardError,
      );

      setError(
        text.copyFailed,
      );
    }
  }


  /* =======================================================
     LEGACY EMAIL
     ======================================================= */

  function openEmailSecurity() {
    setOpen(false);

    setDialog(
      "email",
    );


    setEmail(
      access
        .lifetimeLicense
        ?.recoveryEmail ||
        access.email ||
        "",
    );


    setEmailStep(
      "email",
    );

    setOtp("");

    setError("");
  }


  async function sendEmailCode() {
    const normalizedEmail =
      String(
        email || "",
      )
        .trim()
        .toLowerCase();


    if (
      !/^\S+@\S+\.\S+$/.test(
        normalizedEmail,
      )
    ) {
      setError(
        text.invalidEmail,
      );

      return;
    }


    setBusy(true);

    setError("");


    try {
      const session =
        await getSession();


      const response =
        await fetch(
          "/api/license/email",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                action:
                  "send",

                email:
                  normalizedEmail,
              }),
          },
        );


      const data =
        await response
          .json()
          .catch(
            () => ({}),
          );


      if (
        !response.ok
      ) {
        throw new Error(
          data?.error ||
            "SEND_FAILED",
        );
      }


      setEmail(
        normalizedEmail,
      );

      setEmailStep(
        "otp",
      );
    } catch (
      emailError
    ) {
      console.error(
        "Security email send failed:",
        emailError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  async function verifyEmailCode() {
    const cleanOtp =
      String(
        otp || "",
      ).trim();


    if (
      !/^\d{6}$/.test(
        cleanOtp,
      )
    ) {
      setError(
        text.invalidOtp,
      );

      return;
    }


    setBusy(true);

    setError("");


    try {
      const session =
        await getSession();


      const response =
        await fetch(
          "/api/license/email",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                action:
                  "verify",

                email,

                otp:
                  cleanOtp,
              }),
          },
        );


      const data =
        await response
          .json()
          .catch(
            () => ({}),
          );


      if (
        !response.ok
      ) {
        throw new Error(
          data?.error ||
            "VERIFY_FAILED",
        );
      }


      setEmailStep(
        "verified",
      );

      setOtp("");


      await access.refresh();
    } catch (
      verifyError
    ) {
      console.error(
        "Security email verification failed:",
        verifyError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  /* =======================================================
     CLOSE
     ======================================================= */

  function closeDialog() {
    setDialog("");

    setError("");

    setBusy(false);

    setRestoreResult(
      null,
    );
  }


  /* =======================================================
     PORTAL CONTENT
     ======================================================= */

  const portalContent =
    mounted
      ? createPortal(
          <>
            {/* ACCOUNT SHEET */}

            {open && (
              <div
                className="awd-account-portal"
                dir={
                  isEnglish
                    ? "ltr"
                    : "rtl"
                }
              >
                <button
                  type="button"
                  aria-label={
                    text.close
                  }
                  className="awd-account-backdrop"
                  onClick={() =>
                    setOpen(false)
                  }
                />

                <section
                  className="awd-account-sheet"
                  role="dialog"
                  aria-modal="true"
                >
                  <span className="awd-sheet-handle" />


                  <header className="awd-account-head">
                    <img
                      className="awd-account-avatar"
                      src="/logov3.png"
                      alt="AllWDbook"
                    />

                    <div className="awd-account-head-copy">
                      <h3>
                        {text.account}
                      </h3>

                      <p>
                        {
                          text.accountSubtitle
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      className="awd-account-close"
                      onClick={() =>
                        setOpen(false)
                      }
                      aria-label={
                        text.close
                      }
                    >
                      ✕
                    </button>
                  </header>


                  {/* CURRENT ACCESS */}

                  <div className="awd-access-card">
                    <span className="awd-access-label">
                      {
                        text.currentAccess
                      }
                    </span>

                    <div className="awd-access-value">
                      <span
                        className={
                          "awd-access-dot" +
                          (
                            access.lifetime ||
                            activePlans.length
                              ? " premium"
                              : ""
                          )
                        }
                      />

                      <span>
                        {
                          currentPlanLabel
                        }
                      </span>
                    </div>
                  </div>


                  {/* RESTORE */}

                  <button
                    type="button"
                    className="awd-account-button green"
                    onClick={
                      openRestoreDialog
                    }
                  >
                    <span className="awd-button-left">
                      <span className="awd-button-icon">
                        🔑
                      </span>

                      <span className="awd-button-copy">
                        <strong>
                          {text.restore}
                        </strong>

                        <small>
                          {
                            text.restoreSub
                          }
                        </small>
                      </span>
                    </span>

                    <span className="awd-button-arrow">
                      ‹
                    </span>
                  </button>


                  {/* RECOVERY CODE */}

                  {access.paid && (
                    <button
                      type="button"
                      className="awd-account-button"
                      onClick={
                        revealCode
                      }
                      disabled={
                        busy
                      }
                    >
                      <span className="awd-button-left">
                        <span className="awd-button-icon">
                          🛡️
                        </span>

                        <span className="awd-button-copy">
                          <strong>
                            {
                              text.recoveryCode
                            }
                          </strong>

                          <small>
                            {
                              text.recoveryCodeSub
                            }
                          </small>
                        </span>
                      </span>

                      <span className="awd-button-arrow">
                        ‹
                      </span>
                    </button>
                  )}


                  {/* LIFETIME */}

                  {!access.lifetime && (
                    <div className="awd-lifetime-card">
                      <div className="awd-lifetime-top">
                        <div className="awd-lifetime-icon">
                          👑
                        </div>

                        <div className="awd-lifetime-copy">
                          <span className="awd-lifetime-title">
                            {
                              text.lifetimeTitle
                            }
                          </span>

                          <span className="awd-lifetime-sub">
                            {
                              text.lifetimeSub
                            }
                          </span>

                          <div className="awd-lifetime-price">
                            {
                              text.lifetimePrice
                            }
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="awd-account-button primary"
                        onClick={
                          buyLifetime
                        }
                        disabled={
                          busy
                        }
                      >
                        <span className="awd-button-left">
                          <span className="awd-button-icon">
                            ⚡
                          </span>

                          {
                            text.buyLifetime
                          }
                        </span>

                        <span className="awd-button-arrow">
                          ‹
                        </span>
                      </button>
                    </div>
                  )}


                  {/* SUBSCRIPTION */}

                  <a
                    href="/subscription"
                    className="awd-account-button"
                  >
                    <span className="awd-button-left">
                      <span className="awd-button-icon">
                        👑
                      </span>

                      {
                        text.goPlans
                      }
                    </span>

                    <span className="awd-button-arrow">
                      ‹
                    </span>
                  </a>


                  {/* PACKAGES */}

                  <button
                    type="button"
                    className="awd-account-button"
                    onClick={() =>
                      setShowPlans(
                        (current) =>
                          !current,
                      )
                    }
                  >
                    <span className="awd-button-left">
                      <span className="awd-button-icon">
                        🧾
                      </span>

                      {showPlans
                        ? text.hidePlans
                        : text.showPlans}
                    </span>

                    <span className="awd-button-arrow">
                      {showPlans
                        ? "⌃"
                        : "⌄"}
                    </span>
                  </button>


                  {showPlans && (
                    <div className="awd-plans-wrap">
                      {PACKAGES.map(
                        (plan) => {
                          const current =
                            access.lifetime ||
                            activePlans.includes(
                              plan.id,
                            );


                          return (
                            <button
                              key={
                                plan.id
                              }
                              type="button"
                              disabled={
                                current ||
                                busy
                              }
                              onClick={() =>
                                openCheckout(
                                  plan,
                                )
                              }
                              className={
                                "awd-plan-option" +
                                (
                                  plan.featured
                                    ? " featured"
                                    : ""
                                ) +
                                (
                                  current
                                    ? " active"
                                    : ""
                                )
                              }
                            >
                              <span className="awd-plan-icon">
                                {
                                  plan.icon
                                }
                              </span>

                              <span className="awd-plan-middle">
                                <span className="awd-plan-name">
                                  {isEnglish
                                    ? plan.en
                                    : plan.ar}
                                </span>

                                {current && (
                                  <small className="awd-plan-state">
                                    ✓{" "}
                                    {access.lifetime
                                      ? text.included
                                      : text.active}
                                  </small>
                                )}
                              </span>

                              <span className="awd-plan-price">
                                {
                                  plan.price
                                }

                                <small>
                                  {isEnglish
                                    ? plan.periodEn
                                    : plan.periodAr}
                                </small>
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}


                  {/* LEGACY EMAIL */}

                  {access.lifetime &&
                    access
                      .lifetimeLicense
                      ?.system ===
                      "legacy" && (
                      <button
                        type="button"
                        className="awd-account-button gold"
                        onClick={
                          openEmailSecurity
                        }
                        disabled={
                          busy
                        }
                      >
                        <span className="awd-button-left">
                          <span className="awd-button-icon">
                            ✉️
                          </span>

                          <span className="awd-button-copy">
                            <strong>
                              {
                                text.securityEmail
                              }
                            </strong>

                            <small>
                              {
                                text.securityEmailSub
                              }
                            </small>
                          </span>
                        </span>

                        <span className="awd-button-arrow">
                          ‹
                        </span>
                      </button>
                    )}


                  {/* BILLING */}

                  {billingUrl && (
                    <a
                      href={
                        billingUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="awd-account-button"
                    >
                      <span className="awd-button-left">
                        <span className="awd-button-icon">
                          ⚙️
                        </span>

                        {
                          text.billing
                        }
                      </span>

                      <span className="awd-button-arrow">
                        ↗
                      </span>
                    </a>
                  )}


                  {error && (
                    <div
                      className="awd-account-error"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                </section>
              </div>
            )}


            {/* DIALOG */}

            {dialog && (
              <div
                className="awd-dialog-portal"
                dir={
                  isEnglish
                    ? "ltr"
                    : "rtl"
                }
              >
                <button
                  type="button"
                  aria-label={
                    text.close
                  }
                  className="awd-dialog-backdrop"
                  onClick={
                    closeDialog
                  }
                />

                <section
                  className="awd-dialog"
                  role="dialog"
                  aria-modal="true"
                >
                  <span className="awd-dialog-handle" />


                  {/* RESTORE */}

                  {dialog ===
                    "restore" && (
                    <div>
                      <h2>
                        🔑{" "}
                        {
                          text.restoreTitle
                        }
                      </h2>

                      <p className="awd-dialog-description">
                        {
                          text.restoreDescription
                        }
                      </p>


                      {!restoreResult ? (
                        <form
                          onSubmit={
                            activateCode
                          }
                        >
                          <input
                            className="awd-dialog-input"
                            dir="ltr"
                            value={
                              accessCode
                            }
                            placeholder={
                              text.codePlaceholder
                            }
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck="false"
                            onChange={(
                              event,
                            ) =>
                              setAccessCode(
                                event
                                  .target
                                  .value,
                              )
                            }
                          />


                          {error && (
                            <div
                              className="awd-account-error"
                              role="alert"
                            >
                              {error}
                            </div>
                          )}


                          <div className="awd-dialog-actions">
                            <button
                              type="submit"
                              className="awd-dialog-primary"
                              disabled={
                                busy
                              }
                            >
                              {busy
                                ? text.processing
                                : text.activate}
                            </button>

                            <button
                              type="button"
                              className="awd-dialog-secondary"
                              onClick={
                                closeDialog
                              }
                            >
                              {
                                text.close
                              }
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="awd-success-box">
                            ✅{" "}
                            {
                              text.restoreSuccess
                            }

                            <small>
                              {
                                text.restoreSuccessNote
                              }
                            </small>
                          </div>


                          <div className="awd-result-grid">
                            <div className="awd-result-box">
                              <small>
                                {
                                  text.restoredPlan
                                }
                              </small>

                              <strong>
                                {
                                  restoreResult
                                    .planName
                                }
                              </strong>
                            </div>

                            <div className="awd-result-box">
                              <small>
                                {
                                  text.devices
                                }
                              </small>

                              <strong
                                dir="ltr"
                              >
                                {restoreResult
                                  .activeDevices ??
                                  "—"}
                                {" / "}
                                {restoreResult
                                  .maxActivations ??
                                  "—"}
                              </strong>
                            </div>
                          </div>


                          {restoreResult
                            .codeHint && (
                            <div className="awd-code-box awd-code-space">
                              {
                                restoreResult
                                  .codeHint
                              }
                            </div>
                          )}


                          <div className="awd-dialog-actions">
                            <button
                              type="button"
                              className="awd-dialog-primary"
                              onClick={() => {
                                closeDialog();

                                window.location.href =
                                  "/";
                              }}
                            >
                              🚀 AllWDbook
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}


                  {/* CODE */}

                  {dialog ===
                    "code" && (
                    <div>
                      <h2>
                        🛡️{" "}
                        {
                          text.codeTitle
                        }
                      </h2>


                      <p className="awd-dialog-description">
                        {
                          text.codeWarning
                        }
                      </p>


                      {busy ? (
                        <p className="awd-dialog-description">
                          {
                            text.processing
                          }
                        </p>
                      ) : revealedCode ? (
                        <>
                          {revealedCodePlan && (
                            <div className="awd-result-box">
                              <small>
                                {
                                  text.restoredPlan
                                }
                              </small>

                              <strong>
                                {
                                  revealedCodePlan
                                }
                              </strong>
                            </div>
                          )}


                          <div className="awd-code-box awd-code-space">
                            {
                              revealedCode
                            }
                          </div>


                          <p className="awd-code-warning">
                            🔒{" "}
                            {
                              text.ownerDevice
                            }
                          </p>


                          <div className="awd-dialog-actions">
                            <button
                              type="button"
                              className="awd-dialog-primary"
                              onClick={
                                copyCode
                              }
                            >
                              {copied
                                ? text.copied
                                : text.copy}
                            </button>

                            <button
                              type="button"
                              className="awd-dialog-secondary"
                              onClick={
                                closeDialog
                              }
                            >
                              {
                                text.close
                              }
                            </button>
                          </div>
                        </>
                      ) : revealedCodeHint ? (
                        <>
                          {revealedCodePlan && (
                            <div className="awd-result-box">
                              <small>
                                {
                                  text.restoredPlan
                                }
                              </small>

                              <strong>
                                {
                                  revealedCodePlan
                                }
                              </strong>
                            </div>
                          )}


                          <div className="awd-code-box awd-code-space">
                            {
                              revealedCodeHint
                            }
                          </div>


                          <p className="awd-code-warning">
                            🔐{" "}
                            {
                              text.codeUnavailable
                            }
                          </p>


                          <div className="awd-dialog-actions">
                            <button
                              type="button"
                              className="awd-dialog-secondary"
                              onClick={
                                closeDialog
                              }
                            >
                              {
                                text.close
                              }
                            </button>
                          </div>
                        </>
                      ) : null}


                      {error && (
                        <div
                          className="awd-account-error"
                          role="alert"
                        >
                          {error}
                        </div>
                      )}
                    </div>
                  )}


                  {/* EMAIL */}

                  {dialog ===
                    "email" && (
                    <div>
                      <h2>
                        ✉️{" "}
                        {
                          text.emailTitle
                        }
                      </h2>

                      <p className="awd-dialog-description">
                        {
                          text.emailDescription
                        }
                      </p>


                      {emailStep ===
                        "email" && (
                        <>
                          <input
                            className="awd-dialog-input"
                            type="email"
                            dir="ltr"
                            autoComplete="email"
                            placeholder={
                              text.emailPlaceholder
                            }
                            value={
                              email
                            }
                            onChange={(
                              event,
                            ) =>
                              setEmail(
                                event
                                  .target
                                  .value,
                              )
                            }
                          />

                          <div className="awd-dialog-actions">
                            <button
                              type="button"
                              className="awd-dialog-primary"
                              onClick={
                                sendEmailCode
                              }
                              disabled={
                                busy
                              }
                            >
                              {busy
                                ? text.processing
                                : text.sendCode}
                            </button>

                            <button
                              type="button"
                              className="awd-dialog-secondary"
                              onClick={
                                closeDialog
                              }
                            >
                              {
                                text.close
                              }
                            </button>
                          </div>
                        </>
                      )}


                      {emailStep ===
                        "otp" && (
                        <>
                          <input
                            className="awd-dialog-input"
                            dir="ltr"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={
                              6
                            }
                            placeholder={
                              text.otpPlaceholder
                            }
                            value={
                              otp
                            }
                            onChange={(
                              event,
                            ) =>
                              setOtp(
                                event
                                  .target
                                  .value
                                  .replace(
                                    /\D/g,
                                    "",
                                  )
                                  .slice(
                                    0,
                                    6,
                                  ),
                              )
                            }
                          />

                          <div className="awd-dialog-actions">
                            <button
                              type="button"
                              className="awd-dialog-primary"
                              onClick={
                                verifyEmailCode
                              }
                              disabled={
                                busy
                              }
                            >
                              {busy
                                ? text.processing
                                : text.verify}
                            </button>

                            <button
                              type="button"
                              className="awd-dialog-secondary"
                              onClick={
                                closeDialog
                              }
                            >
                              {
                                text.close
                              }
                            </button>
                          </div>
                        </>
                      )}


                      {emailStep ===
                        "verified" && (
                        <>
                          <div className="awd-success-box">
                            ✅{" "}
                            {
                              text.verified
                            }
                          </div>

                          <div className="awd-dialog-actions">
                            <button
                              type="button"
                              className="awd-dialog-primary"
                              onClick={
                                closeDialog
                              }
                            >
                              {
                                text.close
                              }
                            </button>
                          </div>
                        </>
                      )}


                      {error && (
                        <div
                          className="awd-account-error"
                          role="alert"
                        >
                          {error}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>,
          document.body,
        )
      : null;


  /* =======================================================
     RETURN
     ======================================================= */

  return (
    <>
      <style jsx global>{`
        .awd-account-root,
        .awd-account-root *,
        .awd-account-portal,
        .awd-account-portal *,
        .awd-dialog-portal,
        .awd-dialog-portal * {
          box-sizing: border-box;
        }


        /* ===============================================
           TRIGGER
           =============================================== */

        .awd-account-trigger {
          width: 46px;
          height: 46px;

          display: grid;
          place-items: center;

          padding: 2px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.11
            );

          border-radius: 15px;

          background: #0d1929;

          cursor: pointer;
        }


        .awd-account-trigger img {
          width: 38px;
          height: 38px;

          display: block;

          object-fit: cover;

          border-radius: 12px;
        }


        /* ===============================================
           IMPORTANT: PORTAL
           =============================================== */

        .awd-account-portal,
        .awd-dialog-portal {
          position: fixed;

          inset: 0;

          width: 100vw;
          height: 100dvh;

          margin: 0;
          padding: 0;

          transform: none !important;

          isolation: isolate;

          pointer-events: none;
        }


        .awd-account-portal {
          z-index: 2147483000;
        }


        .awd-dialog-portal {
          z-index: 2147483100;
        }


        /* ===============================================
           BACKDROP
           =============================================== */

        .awd-account-backdrop,
        .awd-dialog-backdrop {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          margin: 0;
          padding: 0;

          border: 0;

          pointer-events: auto;

          cursor: default;

          background:
            rgba(
              1,
              7,
              15,
              0.78
            );

          backdrop-filter:
            blur(7px);

          -webkit-backdrop-filter:
            blur(7px);
        }


        .awd-dialog-backdrop {
          background:
            rgba(
              1,
              7,
              15,
              0.86
            );
        }


        /* ===============================================
           ACCOUNT SHEET — DESKTOP
           =============================================== */

        .awd-account-sheet {
          position: absolute;

          z-index: 2;

          top: 82px;

          inset-inline-end: 18px;

          width:
            min(
              410px,
              calc(
                100vw -
                36px
              )
            );

          max-height:
            calc(
              100dvh -
                102px
            );

          overflow-x: hidden;
          overflow-y: auto;

          overscroll-behavior:
            contain;

          -webkit-overflow-scrolling:
            touch;

          padding: 18px;

          border:
            1px solid #263650;

          border-radius: 24px;

          pointer-events: auto;

          background:
            radial-gradient(
              circle at
                90% 0%,
              rgba(
                255,
                107,
                0,
                0.11
              ),
              transparent 34%
            ),
            linear-gradient(
              160deg,
              #0d1b2f,
              #071424
            );

          color: #f4f7fb;

          box-shadow:
            0 30px 80px
            rgba(
              0,
              0,
              0,
              0.55
            );
        }


        [dir="rtl"]
          .awd-account-sheet {
          background:
            radial-gradient(
              circle at
                10% 0%,
              rgba(
                255,
                107,
                0,
                0.11
              ),
              transparent 34%
            ),
            linear-gradient(
              160deg,
              #0d1b2f,
              #071424
            );
        }


        .awd-sheet-handle,
        .awd-dialog-handle {
          display: none;
        }


        /* ===============================================
           HEADER
           =============================================== */

        .awd-account-head {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 17px;
        }


        .awd-account-avatar {
          width: 54px;
          height: 54px;

          flex:
            0 0 54px;

          border-radius: 16px;

          object-fit: cover;
        }


        .awd-account-head-copy {
          flex: 1;

          min-width: 0;
        }


        .awd-account-head-copy h3 {
          margin: 0;

          color: white;

          font-size: 18px;

          font-weight: 900;
        }


        .awd-account-head-copy p {
          margin:
            4px 0 0;

          color: #8496ae;

          font-size: 11px;

          line-height: 1.5;
        }


        .awd-account-close {
          width: 40px;
          height: 40px;

          flex:
            0 0 40px;

          display: grid;

          place-items: center;

          border:
            1px solid #29405d;

          border-radius: 12px;

          background: #0c1d31;

          color: #dce6f1;

          font-size: 18px;

          cursor: pointer;
        }


        /* ===============================================
           CURRENT ACCESS
           =============================================== */

        .awd-access-card {
          padding: 15px;

          border:
            1px solid #263650;

          border-radius: 17px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }


        .awd-access-label {
          display: block;

          margin-bottom: 7px;

          color: #8292aa;

          font-size: 10px;

          font-weight: 800;
        }


        .awd-access-value {
          display: flex;

          align-items: center;

          gap: 9px;

          color: white;

          font-size: 16px;

          font-weight: 900;
        }


        .awd-access-dot {
          width: 9px;
          height: 9px;

          flex:
            0 0 9px;

          border-radius: 999px;

          background: #ff6b00;

          box-shadow:
            0 0 0 5px
            rgba(
              255,
              107,
              0,
              0.1
            );
        }


        .awd-access-dot.premium {
          background: #21c47b;

          box-shadow:
            0 0 0 5px
            rgba(
              33,
              196,
              123,
              0.1
            );
        }


        /* ===============================================
           BUTTONS
           =============================================== */

        .awd-account-button {
          width: 100%;

          min-height: 52px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 10px;

          margin-top: 10px;

          padding:
            10px 13px;

          border:
            1px solid #283a52;

          border-radius: 14px;

          background: #0c1b2e;

          color: #eef3fb;

          text-align: inherit;

          text-decoration: none;

          font-size: 13px;

          font-weight: 800;

          cursor: pointer;
        }


        .awd-account-button.primary {
          border-color: #ff6b00;

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7b1e
            );

          color: white;
        }


        .awd-account-button.gold {
          border-color:
            rgba(
              255,
              185,
              55,
              0.35
            );

          background:
            rgba(
              255,
              185,
              55,
              0.07
            );

          color: #ffd37d;
        }


        .awd-account-button.green {
          border-color:
            rgba(
              32,
              196,
              121,
              0.3
            );

          background:
            linear-gradient(
              135deg,
              rgba(
                19,
                102,
                82,
                0.17
              ),
              rgba(
                5,
                69,
                66,
                0.12
              )
            );

          color: #73e4ad;
        }


        .awd-account-button:disabled {
          opacity: 0.52;

          cursor: not-allowed;
        }


        .awd-button-left {
          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;
        }


        .awd-button-icon {
          width: 34px;
          height: 34px;

          display: grid;

          place-items: center;

          flex:
            0 0 34px;

          border-radius: 10px;

          background:
            rgba(
              255,
              255,
              255,
              0.055
            );

          font-size: 17px;
        }


        .awd-button-copy {
          min-width: 0;
        }


        .awd-button-copy strong {
          display: block;

          color: inherit;

          font-size: 13px;
        }


        .awd-button-copy small {
          display: block;

          margin-top: 3px;

          color: #71839d;

          font-size: 9px;

          font-weight: 500;

          line-height: 1.45;
        }


        .awd-button-arrow {
          flex:
            0 0 auto;

          color: #657a96;

          font-size: 20px;
        }


        /* ===============================================
           LIFETIME
           =============================================== */

        .awd-lifetime-card {
          margin-top: 12px;

          padding: 15px;

          border:
            1px solid
            rgba(
              255,
              177,
              52,
              0.3
            );

          border-radius: 18px;

          background:
            radial-gradient(
              circle at
                85% 0%,
              rgba(
                255,
                180,
                50,
                0.13
              ),
              transparent 45%
            ),
            #0d1929;
        }


        [dir="rtl"]
          .awd-lifetime-card {
          background:
            radial-gradient(
              circle at
                15% 0%,
              rgba(
                255,
                180,
                50,
                0.13
              ),
              transparent 45%
            ),
            #0d1929;
        }


        .awd-lifetime-top {
          display: flex;

          gap: 12px;

          align-items: center;
        }


        .awd-lifetime-icon {
          width: 50px;
          height: 50px;

          display: grid;

          place-items: center;

          flex:
            0 0 50px;

          border-radius: 15px;

          background:
            rgba(
              255,
              185,
              55,
              0.12
            );

          font-size: 25px;
        }


        .awd-lifetime-copy {
          flex: 1;

          min-width: 0;
        }


        .awd-lifetime-title {
          display: block;

          font-size: 17px;

          font-weight: 900;
        }


        .awd-lifetime-sub {
          display: block;

          margin-top: 3px;

          color: #9aa8ba;

          font-size: 11px;
        }


        .awd-lifetime-price {
          margin-top: 5px;

          color: #ffc25a;

          font-size: 12px;

          font-weight: 900;
        }


        /* ===============================================
           PLANS
           =============================================== */

        .awd-plans-wrap {
          display: grid;

          gap: 8px;

          margin-top: 10px;
        }


        .awd-plan-option {
          width: 100%;

          display: grid;

          grid-template-columns:
            auto
            minmax(
              0,
              1fr
            )
            auto;

          align-items: center;

          gap: 10px;

          padding: 12px;

          border:
            1px solid #283950;

          border-radius: 14px;

          background: #0a1829;

          color: #edf3fb;

          text-align: inherit;

          cursor: pointer;
        }


        .awd-plan-option.featured {
          border-color:
            rgba(
              255,
              107,
              0,
              0.52
            );

          background:
            rgba(
              255,
              107,
              0,
              0.055
            );
        }


        .awd-plan-option.active {
          border-color:
            rgba(
              32,
              196,
              121,
              0.45
            );

          background:
            rgba(
              32,
              196,
              121,
              0.07
            );
        }


        .awd-plan-option:disabled {
          cursor: default;
        }


        .awd-plan-icon {
          width: 40px;
          height: 40px;

          display: grid;

          place-items: center;

          border-radius: 11px;

          background: #15243a;

          font-size: 19px;
        }


        .awd-plan-middle {
          min-width: 0;
        }


        .awd-plan-name {
          display: block;

          overflow-wrap:
            anywhere;

          font-size: 13px;

          font-weight: 900;
        }


        .awd-plan-state {
          display: block;

          margin-top: 3px;

          color: #54d99a;

          font-size: 10px;
        }


        .awd-plan-price {
          direction: ltr;

          text-align: end;

          font-size: 13px;

          font-weight: 900;
        }


        .awd-plan-price small {
          display: block;

          margin-top: 2px;

          color: #788aa2;

          font-size: 9px;

          font-weight: 500;
        }


        /* ===============================================
           ERRORS
           =============================================== */

        .awd-account-error {
          margin:
            12px 0 0;

          padding:
            11px 12px;

          border:
            1px solid
            rgba(
              255,
              91,
              91,
              0.25
            );

          border-radius: 12px;

          background:
            rgba(
              255,
              76,
              76,
              0.08
            );

          color: #ff9b9b;

          font-size: 11px;

          line-height: 1.6;
        }


        /* ===============================================
           DIALOG
           =============================================== */

        .awd-dialog {
          position: absolute;

          z-index: 2;

          top: 50%;
          left: 50%;

          width:
            min(
              460px,
              calc(
                100vw -
                36px
              )
            );

          max-height:
            calc(
              100dvh -
                36px
            );

          overflow-x: hidden;
          overflow-y: auto;

          overscroll-behavior:
            contain;

          -webkit-overflow-scrolling:
            touch;

          padding: 22px;

          border:
            1px solid #283950;

          border-radius: 24px;

          pointer-events: auto;

          transform:
            translate(
              -50%,
              -50%
            );

          background:
            radial-gradient(
              circle at
                90% 0%,
              rgba(
                255,
                107,
                0,
                0.1
              ),
              transparent 35%
            ),
            #08182a;

          color: #f4f7fb;

          box-shadow:
            0 30px 90px
            rgba(
              0,
              0,
              0,
              0.6
            );
        }


        [dir="rtl"]
          .awd-dialog {
          background:
            radial-gradient(
              circle at
                10% 0%,
              rgba(
                255,
                107,
                0,
                0.1
              ),
              transparent 35%
            ),
            #08182a;
        }


        .awd-dialog h2 {
          margin: 0;

          color: white;

          font-size: 21px;

          line-height: 1.35;
        }


        .awd-dialog-description {
          margin:
            9px 0 18px;

          color: #8fa0b8;

          font-size: 12px;

          line-height: 1.8;
        }


        .awd-dialog-input {
          width: 100%;

          min-height: 54px;

          padding:
            11px 13px;

          border:
            1px solid #2a3c55;

          border-radius: 13px;

          outline: none;

          background: #04111f;

          color: white;

          font-size: 14px;
        }


        .awd-dialog-input::placeholder {
          color: #60718a;
        }


        .awd-dialog-input:focus {
          border-color: #ff6b00;

          box-shadow:
            0 0 0 3px
            rgba(
              255,
              107,
              0,
              0.08
            );
        }


        .awd-code-box {
          padding:
            15px 10px;

          border:
            1px solid #293b54;

          border-radius: 14px;

          background: #03101d;

          color: #ffc56d;

          direction: ltr;

          text-align: center;

          overflow-wrap:
            anywhere;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size: 13px;

          line-height: 1.6;

          user-select: all;
        }


        .awd-code-space {
          margin-top: 10px;
        }


        .awd-code-warning {
          margin:
            12px 0 0;

          color: #9baabd;

          font-size: 11px;

          line-height: 1.7;
        }


        .awd-success-box {
          padding: 15px;

          border:
            1px solid
            rgba(
              32,
              196,
              121,
              0.3
            );

          border-radius: 14px;

          background:
            rgba(
              32,
              196,
              121,
              0.07
            );

          color: #72e5ad;

          font-size: 12px;

          font-weight: 800;

          line-height: 1.65;
        }


        .awd-success-box small {
          display: block;

          margin-top: 5px;

          color: #9db8aa;

          font-size: 10px;

          font-weight: 500;
        }


        .awd-result-grid {
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

          margin-top: 11px;
        }


        .awd-result-box {
          padding: 12px;

          border:
            1px solid #233a55;

          border-radius: 13px;

          background: #051426;
        }


        .awd-result-box small {
          display: block;

          color: #7588a2;

          font-size: 9px;
        }


        .awd-result-box strong {
          display: block;

          margin-top: 5px;

          color: white;

          font-size: 12px;

          overflow-wrap:
            anywhere;
        }


        .awd-dialog-actions {
          display: grid;

          gap: 9px;

          margin-top: 16px;
        }


        .awd-dialog-primary,
        .awd-dialog-secondary {
          width: 100%;

          min-height: 50px;

          border-radius: 13px;

          font-size: 13px;

          font-weight: 900;

          cursor: pointer;
        }


        .awd-dialog-primary {
          border:
            1px solid #ff6b00;

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7c20
            );

          color: white;

          box-shadow:
            0 12px 28px
            rgba(
              255,
              105,
              0,
              0.12
            );
        }


        .awd-dialog-secondary {
          border:
            1px solid #2a3c54;

          background: #0d1c30;

          color: #d9e2ef;
        }


        .awd-dialog-primary:disabled {
          opacity: 0.55;

          cursor: not-allowed;
        }


        /* ===============================================
           PHONE
           =============================================== */

        @media (
          max-width: 620px
        ) {
          .awd-account-trigger {
            width: 43px;
            height: 43px;

            border-radius: 13px;
          }


          .awd-account-trigger img {
            width: 35px;
            height: 35px;

            border-radius: 11px;
          }


          /*
           * مهم:
           *
           * أصبح Bottom Sheet مربوطاً بـ BODY
           * بواسطة React Portal.
           *
           * لذلك يبدأ من x=0 الحقيقي للشاشة.
           */

          .awd-account-sheet {
            top: auto;

            bottom: 0;

            left: 0;
            right: 0;

            inset-inline-start: 0;
            inset-inline-end: 0;

            width: 100vw;
            max-width: none;

            max-height: 88dvh;

            margin: 0;

            padding:
              10px 17px
              calc(
                18px +
                  env(
                    safe-area-inset-bottom
                  )
              );

            border-inline: 0;
            border-bottom: 0;

            border-radius:
              27px
              27px
              0
              0;

            box-shadow:
              0 -20px 60px
              rgba(
                0,
                0,
                0,
                0.5
              );
          }


          .awd-sheet-handle,
          .awd-dialog-handle {
            width: 48px;
            height: 5px;

            display: block;

            margin:
              2px auto
              15px;

            border-radius:
              999px;

            background: #425570;
          }


          .awd-account-head {
            margin-bottom: 13px;
          }


          .awd-account-avatar {
            width: 49px;
            height: 49px;

            flex-basis: 49px;

            border-radius: 14px;
          }


          .awd-account-head-copy h3 {
            font-size: 20px;
          }


          .awd-access-card {
            padding: 16px;
          }


          .awd-account-button {
            min-height: 56px;
          }


          /* DIALOG MOBILE */

          .awd-dialog {
            top: auto;
            bottom: 0;

            left: 0;
            right: 0;

            width: 100vw;
            max-width: none;

            max-height: 90dvh;

            margin: 0;

            padding:
              10px 18px
              calc(
                20px +
                  env(
                    safe-area-inset-bottom
                  )
              );

            border-inline: 0;
            border-bottom: 0;

            border-radius:
              27px
              27px
              0
              0;

            transform: none;

            box-shadow:
              0 -20px 70px
              rgba(
                0,
                0,
                0,
                0.58
              );
          }


          .awd-dialog h2 {
            font-size: 21px;
          }


          .awd-dialog-description {
            font-size: 12px;
          }


          .awd-dialog-input {
            min-height: 58px;

            font-size: 14px;
          }


          .awd-dialog-primary,
          .awd-dialog-secondary {
            min-height: 55px;
          }
        }


        /* ===============================================
           VERY SMALL PHONE
           =============================================== */

        @media (
          max-width: 360px
        ) {
          .awd-account-sheet,
          .awd-dialog {
            padding-inline: 13px;
          }


          .awd-account-head-copy h3 {
            font-size: 18px;
          }


          .awd-result-grid {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>


      {/* TRIGGER STAYS IN ITS ORIGINAL PLACE */}

      <div className="awd-account-root">
        <button
          type="button"
          className="awd-account-trigger"
          aria-label={
            text.openAccount
          }
          aria-expanded={
            open
          }
          onClick={() => {
            setOpen(true);

            setError("");
          }}
        >
          <img
            src="/logov3.png"
            alt="AllWDbook"
          />
        </button>
      </div>


      {/* EVERYTHING ELSE IS RENDERED DIRECTLY UNDER BODY */}

      {portalContent}
    </>
  );
}
