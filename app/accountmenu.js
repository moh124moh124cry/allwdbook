"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccess } from "../lib/useAccess";


/* =========================================================
   CHECKOUT CONFIG
   ========================================================= */

const LIFETIME_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LEMON_LIFETIME_CHECKOUT_URL || "";


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
    accountSubtitle: "إدارة خطتك واستعادتها بدون تسجيل دخول",
    openAccount: "فتح الحساب",

    currentAccess: "وصولك الحالي",
    loading: "جارٍ التحقق...",
    free: "الخطة المجانية",
    lifetime: "Lifetime — وصول مدى الحياة",

    restore: "استعادة خطتي",
    restoreSub: "بالرمز أو بريد الحماية",
    restoreTitle: "استعادة خطة AllWDbook",

    restoreKeyTab: "لدي رمز AWD-KEY",
    restoreEmailTab: "فقدت الرمز",

    restoreDescription:
      "أدخل رمز الوصول الذي حصلت عليه بعد الدفع. يمكنك أيضًا استخدام رمز AWD-LIFE القديم إذا كنت من مستخدمي Lifetime السابقين.",

    restoreEmailTitle: "الاستعادة ببريد الحماية",
    restoreEmailDescription:
      "إذا كنت قد ربطت بريد حماية بخطتك سابقًا، يمكنك استعادة الوصول إلى هذا الجهاز بدون معرفة رمز AWD-KEY.",

    restoreEmailPrivacy:
      "لأسباب أمنية، سنعرض نفس النتيجة سواء كان البريد مرتبطًا بخطة أم لا.",

    recoveryEmailPlaceholder: "بريد الحماية",
    recoveryEmailSend: "إرسال رمز الاستعادة",

    recoveryCodeSent:
      "إذا كان هذا البريد مرتبطًا بخطة محمية، فقد أرسلنا إليه رمز تحقق من 6 أرقام.",

    recoveryOtpPlaceholder: "رمز التحقق من 6 أرقام",
    recoveryVerify: "تحقق واستعد خطتي",

    recoverySuccess: "تمت استعادة خطتك",
    recoverySuccessNote:
      "تم ربط الخطط التي أمكن استعادتها بهذا الجهاز، ويمكنك استخدامها الآن.",

    restoredPlans: "الخطط المستعادة",
    failedPlans: "لم تُستعد",
    noFailedPlans: "كل الخطط المتاحة تم استعادتها",

    backToCode: "الاستعادة بالرمز",
    backToEmail: "الاستعادة بالبريد",
    sendNewCode: "إرسال رمز جديد",

    codePlaceholder: "AWD-KEY-XXXX-XXXX-XXXX-XXXX-XXXX",
    activate: "استعادة الخطة",

    restoreSuccess: "تمت استعادة خطتك بنجاح",
    restoreSuccessNote:
      "هذا الجهاز أصبح مرتبطًا بخطتك ويمكنك استخدام المزايا المدفوعة الآن.",

    restoredPlan: "الخطة",
    devices: "الأجهزة",

    recoveryCode: "رمز استعادة خطتي",
    recoveryCodeSub: "عرض رمز استعادة الخطة",

    codeTitle: "رمز استعادة خطتك",
    codeWarning:
      "احتفظ بهذا الرمز في مكان آمن ولا تشاركه مع أي شخص. يمكنك استخدامه لاستعادة خطتك على جهاز جديد.",

    copy: "نسخ الرمز",
    copied: "تم النسخ ✓",

    codeUnavailable:
      "لحماية خطتك، الرمز الكامل يظهر فقط على جهاز الشراء الأصلي. هذا الجهاز يرى نسخة مخفية فقط.",

    ownerDevice: "جهاز الشراء الأصلي",
    noCode: "لم نجد رمز استعادة مرتبطًا بهذا الجهاز.",

    securityEmail: "بريد الحماية",
    securityEmailSub:
      "اختياري — يحمي حقك إذا فقدت رمز الاستعادة",

    securityEmailFreeSub:
      "متاح بعد شراء أو تفعيل أي خطة",

    emailTitle: "حماية خطتك بالبريد",

    emailDescription:
      "أضف بريدًا إلكترونيًا اختياريًا لحماية خطتك. لن نطلب منك تسجيل الدخول بهذا البريد.",

    emailFreeMessage:
      "بريد الحماية متاح بعد شراء أو تفعيل أي خطة. بعد حصولك على AWD-KEY يمكنك ربط بريدك اختياريًا لحماية حقك واستعادة الخطة إذا فقدت الرمز.",

    emailOwnerOnly:
      "بريد الحماية يمكن تغييره فقط من جهاز الشراء الأصلي حفاظًا على حق صاحب الخطة.",

    emailUnavailable:
      "لم نجد خطة يمكن ربط بريد الحماية بها على هذا الجهاز.",

    emailPlaceholder: "name@example.com",
    sendCode: "إرسال رمز التحقق",

    codeSent:
      "أرسلنا رمز تحقق من 6 أرقام إلى بريدك.",

    otpPlaceholder: "رمز التحقق من 6 أرقام",
    verify: "تأكيد البريد",

    verified: "بريد الحماية موثّق",

    verifiedDescription:
      "تم ربط البريد بخططك بنجاح. لن تحتاج إلى تسجيل الدخول به.",

    protectedPlans: "الخطط المحمية",
    changeEmail: "تغيير بريد الحماية",
    resend: "إرسال رمز جديد",

    lifetimeTitle: "Lifetime",
    lifetimeSub: "وصول دائم لجميع الأدوات",
    lifetimePrice: "$125 دفعة واحدة",
    buyLifetime: "شراء Lifetime",

    goPlans: "فتح صفحة الاشتراك",
    showPlans: "عرض الباقات",
    hidePlans: "إخفاء الباقات",

    active: "مفعلة",
    included: "مشمولة",

    billing: "إدارة الاشتراك والفواتير",

    close: "إغلاق",
    processing: "جارٍ التحقق...",

    genericError: "تعذر تنفيذ العملية. حاول مرة أخرى.",

    badCode: "رمز الوصول غير صحيح أو غير فعال.",

    activationLimit:
      "وصلت الخطة إلى الحد الأقصى للأجهزة. تواصل مع الدعم إذا كان أحد أجهزتك القديمة لم يعد مستخدمًا.",

    rateLimited:
      "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.",

    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",

    invalidOtp: "أدخل رمز تحقق صحيحًا من 6 أرقام.",

    otpExpired:
      "انتهت صلاحية رمز التحقق. أرسل رمزًا جديدًا.",

    otpWrong: "رمز التحقق غير صحيح.",

    tooManyOtp:
      "تم إدخال رمز خاطئ عدة مرات. أرسل رمزًا جديدًا.",

    emailSendFailed:
      "تعذر إرسال بريد التحقق. حاول مرة أخرى.",

    recoveryFailed:
      "تعذر استعادة الخطة. تأكد من رمز التحقق أو أرسل رمزًا جديدًا.",

    missingCheckout: "رابط الدفع لهذه الخطة غير مضبوط.",

    copyFailed: "تعذر نسخ الرمز تلقائيًا.",
  },


  en: {
    account: "Account & Access",
    accountSubtitle:
      "Manage and recover your plan without signing in",
    openAccount: "Open account",

    currentAccess: "Current access",
    loading: "Checking...",
    free: "Free Plan",
    lifetime: "Lifetime Access",

    restore: "Recover my plan",
    restoreSub: "Use a key or security email",
    restoreTitle: "Recover AllWDbook Access",

    restoreKeyTab: "I have an AWD-KEY",
    restoreEmailTab: "I lost my key",

    restoreDescription:
      "Enter the access key you received after payment. Legacy AWD-LIFE codes are also supported.",

    restoreEmailTitle: "Recover with security email",

    restoreEmailDescription:
      "If you previously protected your plan with a security email, you can recover access on this device without your AWD-KEY.",

    restoreEmailPrivacy:
      "For security, the same response is shown whether or not the email is linked to a plan.",

    recoveryEmailPlaceholder: "Security email",
    recoveryEmailSend: "Send recovery code",

    recoveryCodeSent:
      "If this email is linked to protected access, a 6-digit verification code has been sent.",

    recoveryOtpPlaceholder: "6-digit verification code",
    recoveryVerify: "Verify and recover access",

    recoverySuccess: "Your access has been recovered",

    recoverySuccessNote:
      "The plans that could be restored are now linked to this device.",

    restoredPlans: "Recovered plans",
    failedPlans: "Not recovered",
    noFailedPlans: "All available plans were recovered",

    backToCode: "Recover with key",
    backToEmail: "Recover with email",
    sendNewCode: "Send a new code",

    codePlaceholder:
      "AWD-KEY-XXXX-XXXX-XXXX-XXXX-XXXX",

    activate: "Recover Plan",

    restoreSuccess: "Your plan has been recovered",

    restoreSuccessNote:
      "This device is now linked to your plan and your paid features are available.",

    restoredPlan: "Plan",
    devices: "Devices",

    recoveryCode: "My recovery key",
    recoveryCodeSub: "View your plan recovery key",

    codeTitle: "Your Plan Recovery Key",

    codeWarning:
      "Store this key safely and do not share it. You can use it to recover your plan on a new device.",

    copy: "Copy key",
    copied: "Copied ✓",

    codeUnavailable:
      "For security, the full key is only shown on the original purchase device. This device only sees a masked version.",

    ownerDevice: "Original purchase device",

    noCode:
      "No recovery key was found for this device.",

    securityEmail: "Security email",

    securityEmailSub:
      "Optional — protects your access if you lose your key",

    securityEmailFreeSub:
      "Available after activating any paid plan",

    emailTitle: "Protect your plan with email",

    emailDescription:
      "Add an optional security email to protect your plan. You will not need to sign in with this email.",

    emailFreeMessage:
      "Security email becomes available after purchasing or activating a plan. Once you have an AWD-KEY, you can optionally protect your access with email.",

    emailOwnerOnly:
      "For security, the recovery email can only be changed from the original purchase device.",

    emailUnavailable:
      "No eligible plan was found for security email protection on this device.",

    emailPlaceholder: "name@example.com",
    sendCode: "Send verification code",

    codeSent:
      "We sent a 6-digit verification code to your email.",

    otpPlaceholder: "6-digit verification code",
    verify: "Verify email",

    verified: "Security email verified",

    verifiedDescription:
      "Your email is now linked to your plans. No email sign-in is required.",

    protectedPlans: "Protected plans",
    changeEmail: "Change security email",
    resend: "Send a new code",

    lifetimeTitle: "Lifetime",
    lifetimeSub: "Permanent access to all tools",
    lifetimePrice: "$125 one-time",
    buyLifetime: "Buy Lifetime",

    goPlans: "Open subscription page",
    showPlans: "View plans",
    hidePlans: "Hide plans",

    active: "Active",
    included: "Included",

    billing: "Manage subscription & billing",

    close: "Close",
    processing: "Checking...",

    genericError:
      "Unable to complete the request. Try again.",

    badCode:
      "This access key is invalid or inactive.",

    activationLimit:
      "This plan has reached its device limit. Contact support if an old device is no longer in use.",

    rateLimited:
      "Too many attempts. Please wait before trying again.",

    invalidEmail:
      "Enter a valid email address.",

    invalidOtp:
      "Enter a valid 6-digit verification code.",

    otpExpired:
      "The verification code has expired. Send a new code.",

    otpWrong:
      "The verification code is incorrect.",

    tooManyOtp:
      "Too many incorrect attempts. Send a new code.",

    emailSendFailed:
      "Unable to send the verification email. Try again.",

    recoveryFailed:
      "Unable to recover access. Check the verification code or request a new one.",

    missingCheckout:
      "Checkout URL is not configured.",

    copyFailed:
      "Automatic copy failed.",
  },
};


/* =========================================================
   HELPERS
   ========================================================= */

function getBillingUrl(subscriptions) {
  if (!Array.isArray(subscriptions)) {
    return "";
  }

  return (
    subscriptions.find(
      (item) => item?.customer_portal_url,
    )?.customer_portal_url || ""
  );
}


function getPlanLabel(planId, isEnglish) {
  if (planId === "lifetime") {
    return "Lifetime";
  }

  const plan =
    PACKAGES.find(
      (item) => item.id === planId,
    );

  if (!plan) {
    return planId || "";
  }

  return isEnglish
    ? plan.en
    : plan.ar;
}


function normalizeTypedCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}


function isUniversalKey(code) {
  const compact =
    String(code || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  return compact.startsWith("AWDKEY");
}


function isLegacyLifetimeKey(code) {
  const compact =
    String(code || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  return compact.startsWith("AWDLIFE");
}


function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(
    normalizeEmail(value),
  );
}


function maskEmail(value) {
  const clean =
    normalizeEmail(value);

  if (
    !clean ||
    !clean.includes("@")
  ) {
    return "";
  }

  const [local, domain] =
    clean.split("@");

  if (
    !local ||
    !domain
  ) {
    return "";
  }

  if (local.length === 1) {
    return `${local}***@${domain}`;
  }

  if (local.length === 2) {
    return `${local[0]}***${local[1]}@${domain}`;
  }

  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}


function errorIs(value, names = []) {
  return names.includes(
    String(value || ""),
  );
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function AccountMenu() {
  const access =
    useAccess();


  const [mounted, setMounted] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [showPlans, setShowPlans] =
    useState(false);

  const [language, setLanguage] =
    useState("ar");

  const [dialog, setDialog] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     KEY RESTORE
     ======================================================= */

  const [
    restoreMethod,
    setRestoreMethod,
  ] =
    useState("key");

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


  /* =======================================================
     EMAIL ACCESS RECOVERY
     ======================================================= */

  const [
    recoveryEmail,
    setRecoveryEmail,
  ] =
    useState("");

  const [
    recoveryOtp,
    setRecoveryOtp,
  ] =
    useState("");

  const [
    recoveryStep,
    setRecoveryStep,
  ] =
    useState("email");

  const [
    emailRecoveryResult,
    setEmailRecoveryResult,
  ] =
    useState(null);


  /* =======================================================
     RECOVERY KEY DISPLAY
     ======================================================= */

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


  /* =======================================================
     SECURITY EMAIL
     ======================================================= */

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

  const [
    emailSystem,
    setEmailSystem,
  ] =
    useState("");

  const [
    challengeId,
    setChallengeId,
  ] =
    useState("");

  const [
    protectedEmail,
    setProtectedEmail,
  ] =
    useState("");

  const [
    protectedKeys,
    setProtectedKeys,
  ] =
    useState(0);

  const [
    securityKey,
    setSecurityKey,
  ] =
    useState(null);


  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;

  const arrow =
    isEnglish
      ? "›"
      : "‹";

  const activePlans =
    Array.isArray(access.plans)
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
    function detectLanguage(event) {
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
        setLanguage(eventLanguage);
        return;
      }

      if (
        savedLanguage === "en" ||
        savedLanguage === "ar"
      ) {
        setLanguage(savedLanguage);
        return;
      }

      setLanguage(
        document.documentElement.lang === "en"
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
      document.body.style.overflow;

    const oldOverscroll =
      document.body.style.overscrollBehavior;

    document.body.style.overflow =
      "hidden";

    document.body.style.overscrollBehavior =
      "none";

    return () => {
      document.body.style.overflow =
        oldOverflow;

      document.body.style.overscrollBehavior =
        oldOverscroll;
    };
  }, [open, dialog]);


  /* =======================================================
     ESCAPE
     ======================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") {
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
     CURRENT PLAN LABEL
     ======================================================= */

  const currentPlanLabel =
    access.loading
      ? text.loading
      : access.lifetime
        ? text.lifetime
        : activePlans.length
          ? activePlans
              .map((plan) =>
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
      !session?.access_token ||
      !session?.user?.id
    ) {
      throw new Error(
        "SESSION_MISSING",
      );
    }

    return session;
  }


  /* =======================================================
     DEVICE INFO
     ======================================================= */

  function currentDeviceInfo() {
    return {
      platform:
        navigator.platform || "",

      language:
        navigator.language || "",

      mobile:
        /Android|iPhone|iPad|iPod|Mobile/i.test(
          navigator.userAgent || "",
        ),
    };
  }


  /* =======================================================
     CHECKOUT
     ======================================================= */

  async function openCheckout(plan) {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!plan?.checkoutUrl) {
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

      if (session.user.email) {
        checkout.searchParams.set(
          "checkout[email]",
          session.user.email,
        );
      }

      window.location.assign(
        checkout.toString(),
      );
    } catch (checkoutError) {
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
    setDialog("restore");

    setRestoreMethod("key");

    setAccessCode("");
    setRestoreResult(null);

    setRecoveryEmail("");
    setRecoveryOtp("");
    setRecoveryStep("email");
    setEmailRecoveryResult(null);

    setError("");
  }


  function selectRestoreMethod(method) {
    setRestoreMethod(method);

    setError("");

    setRestoreResult(null);
    setEmailRecoveryResult(null);

    if (method === "key") {
      setRecoveryOtp("");
      setRecoveryStep("email");
    }

    if (method === "email") {
      setAccessCode("");
    }
  }


  /* =======================================================
     RESTORE WITH AWD-KEY / AWD-LIFE
     ======================================================= */

  async function activateCode(event) {
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
      isUniversalKey(cleanCode);

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
    setRestoreResult(null);

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
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                JSON.stringify({
                  code: cleanCode,

                  deviceName:
                    isEnglish
                      ? "Recovered device"
                      : "جهاز مستعاد",

                  deviceInfo:
                    currentDeviceInfo(),
                }),
            },
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
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
          type: "universal",

          planId:
            data.planId,

          planName:
            isEnglish
              ? data.plan?.nameEn ||
                getPlanLabel(
                  data.planId,
                  true,
                )
              : data.plan?.nameAr ||
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
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                code: cleanCode,
              }),
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
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
        type: "legacy",
        planName: "Lifetime",

        activeDevices:
          data?.activeActivations ||
          null,

        maxActivations:
          data?.maxActivations ||
          null,
      });

      setAccessCode("");

      await access.refresh();

      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );
    } catch (activationError) {
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
     EMAIL RECOVERY — SEND OTP
     ======================================================= */

  async function sendRecoveryEmailCode(event) {
    event?.preventDefault?.();

    const cleanEmail =
      normalizeEmail(
        recoveryEmail,
      );

    if (
      !validEmail(
        cleanEmail,
      )
    ) {
      setError(
        text.invalidEmail,
      );

      return;
    }

    setBusy(true);
    setError("");
    setEmailRecoveryResult(null);

    try {
      const session =
        await getSession();

      const response =
        await fetch(
          "/api/access-key/recover",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                action: "send",
                email: cleanEmail,
              }),
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          data?.error ===
          "RATE_LIMITED"
        ) {
          setError(
            text.rateLimited,
          );
        } else {
          setError(
            text.genericError,
          );
        }

        return;
      }

      /*
       * مهم:
       * الـ API يعطي نفس الجواب سواء البريد موجود أو لا.
       * لا نغيّر هذه الرسالة حتى لا نكشف حسابات العملاء.
       */

      setRecoveryEmail(
        cleanEmail,
      );

      setRecoveryOtp("");

      setRecoveryStep("otp");
    } catch (recoveryError) {
      console.error(
        "Email recovery send failed:",
        recoveryError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  /* =======================================================
     EMAIL RECOVERY — VERIFY OTP + RESTORE
     ======================================================= */

  async function verifyRecoveryEmailCode(event) {
    event?.preventDefault?.();

    const cleanEmail =
      normalizeEmail(
        recoveryEmail,
      );

    const cleanOtp =
      String(
        recoveryOtp || "",
      )
        .trim()
        .replace(/\D/g, "");

    if (
      !validEmail(
        cleanEmail,
      )
    ) {
      setError(
        text.invalidEmail,
      );

      return;
    }

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
          "/api/access-key/recover",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                action: "verify",

                email:
                  cleanEmail,

                otp:
                  cleanOtp,

                deviceName:
                  isEnglish
                    ? "Recovered by email"
                    : "جهاز مستعاد بالبريد",

                deviceInfo:
                  currentDeviceInfo(),
              }),
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          data?.error ===
          "RATE_LIMITED"
        ) {
          setError(
            text.rateLimited,
          );

          return;
        }

        if (
          data?.error ===
          "ACTIVATION_LIMIT_REACHED"
        ) {
          setError(
            text.activationLimit,
          );

          return;
        }

        if (
          data?.error ===
          "TOO_MANY_ATTEMPTS"
        ) {
          setError(
            text.tooManyOtp,
          );

          return;
        }

        if (
          errorIs(
            data?.error,
            [
              "CHALLENGE_EXPIRED",
              "OTP_EXPIRED",
              "EXPIRED",
              "CHALLENGE_ALREADY_USED",
              "ALREADY_USED",
              "CHALLENGE_NOT_FOUND",
            ],
          )
        ) {
          setError(
            text.otpExpired,
          );

          return;
        }

        if (
          errorIs(
            data?.error,
            [
              "INVALID_OTP",
              "OTP_INVALID",
            ],
          )
        ) {
          setError(
            text.otpWrong,
          );

          return;
        }

        setError(
          text.recoveryFailed,
        );

        return;
      }


      const restoredPlans =
        Array.isArray(
          data?.restoredPlans,
        )
          ? data.restoredPlans
          : [];

      const failedPlans =
        Array.isArray(
          data?.failedPlans,
        )
          ? data.failedPlans
          : [];


      setEmailRecoveryResult({
        restoredCount:
          Number(
            data?.restoredCount ||
              restoredPlans.length ||
              0,
          ),

        failedCount:
          Number(
            data?.failedCount ||
              failedPlans.length ||
              0,
          ),

        restoredPlans,
        failedPlans,
      });

      setRecoveryOtp("");

      setRecoveryStep(
        "success",
      );

      await access.refresh();

      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );
    } catch (recoveryError) {
      console.error(
        "Email recovery verification failed:",
        recoveryError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }


  function restartEmailRecovery() {
    setRecoveryOtp("");
    setRecoveryStep("email");
    setEmailRecoveryResult(null);
    setError("");
  }


  /* =======================================================
     RECOVERY KEY DISPLAY
     ======================================================= */

  async function revealCode() {
    setOpen(false);
    setDialog("code");

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
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: "no-store",
          },
        );

      const keyData =
        await keyResponse
          .json()
          .catch(() => ({}));

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
              item?.canRevealCode &&
              item?.code,
          );

        const anyKey =
          ownerKey ||
          usableKeys[0] ||
          null;

        if (anyKey) {
          setRevealedCode(
            ownerKey?.code || "",
          );

          setRevealedCodeHint(
            anyKey?.codeHint || "",
          );

          setRevealedCodePlan(
            isEnglish
              ? anyKey?.plan?.nameEn ||
                getPlanLabel(
                  anyKey?.planId,
                  true,
                )
              : anyKey?.plan?.nameAr ||
                getPlanLabel(
                  anyKey?.planId,
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
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: "no-store",
          },
        );

      const legacyData =
        await legacyResponse
          .json()
          .catch(() => ({}));

      if (
        legacyResponse.ok &&
        legacyData?.code
      ) {
        setRevealedCode(
          legacyData.code,
        );

        setRevealedCodeHint(
          legacyData?.codeHint ||
            "",
