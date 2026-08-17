"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useAccess,
} from "../lib/useAccess";


/* =========================================================
   CHECKOUT CONFIG
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
    account:
      "الحساب والوصول",

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

    plans:
      "الخطط والباقات",

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
      "عرض الرمز الخاص بهذا الجهاز",

    codeTitle:
      "رمز استعادة خطتك",

    codeWarning:
      "احتفظ بهذا الرمز في مكان آمن ولا تشاركه مع أي شخص. يمكنك استخدامه لاستعادة خطتك على جهاز جديد.",

    copy:
      "نسخ الرمز",

    copied:
      "تم النسخ ✓",

    codeUnavailable:
      "الرمز الكامل لا يظهر على هذا الجهاز. يظهر الرمز الكامل فقط على جهاز الشراء الأصلي لحماية خطتك.",

    securityEmail:
      "بريد الحماية",

    securityEmailSub:
      "حماية إضافية لـLifetime القديم",

    emailTitle:
      "حماية Lifetime بالبريد",

    emailDescription:
      "هذه الخاصية حالياً خاصة بنظام Lifetime القديم. سنربط البريد بجميع خطط AWD-KEY في الخطوة القادمة.",

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

    subscription:
      "الاشتراك",

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

    legacy:
      "Lifetime قديم",

    universal:
      "AllWDbook Access Key",

    ownerDevice:
      "جهاز الشراء الأصلي",

    secondaryDevice:
      "جهاز مستعاد",

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

    plans:
      "Plans & Packages",

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
      "View the recovery key for this purchase",

    codeTitle:
      "Your Plan Recovery Key",

    codeWarning:
      "Store this key safely and do not share it. You can use it to recover your plan on a new device.",

    copy:
      "Copy key",

    copied:
      "Copied ✓",

    codeUnavailable:
      "The full key is hidden on this device. For security, it is only revealed on the original purchase device.",

    securityEmail:
      "Security email",

    securityEmailSub:
      "Extra protection for legacy Lifetime",

    emailTitle:
      "Protect Lifetime with email",

    emailDescription:
      "This feature currently applies to the legacy Lifetime system. AWD-KEY email recovery will be connected next.",

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

    subscription:
      "Subscription",

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

    legacy:
      "Legacy Lifetime",

    universal:
      "AllWDbook Access Key",

    ownerDevice:
      "Original purchase device",

    secondaryDevice:
      "Recovered device",

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
        item
          ?.customer_portal_url,
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
    planId ===
    "lifetime"
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
    codeOwnerDevice,
    setCodeOwnerDevice,
  ] =
    useState(false);


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
        eventLanguage ===
          "en" ||
        eventLanguage ===
          "ar"
      ) {
        setLanguage(
          eventLanguage,
        );

        return;
      }


      if (
        savedLanguage ===
          "en" ||
        savedLanguage ===
          "ar"
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


    document.body.style
      .overflow =
      "hidden";


    return () => {
      document.body.style
        .overflow =
        oldOverflow;
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
  }, [dialog]);


  /* =======================================================
     CURRENT ACCESS LABEL
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
        !plan
          ?.checkoutUrl
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


      /*
       * البريد ليس شرطاً.
       * إذا كان موجوداً نرسله فقط.
       */

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
      id: "lifetime",

      checkoutUrl:
        LIFETIME_CHECKOUT_URL,
    });
  }


  /* =======================================================
     OPEN RESTORE
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


  /* =======================================================
     RESTORE PLAN
     ======================================================= */

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


      /*
       * AWD-KEY الجديد
       */
