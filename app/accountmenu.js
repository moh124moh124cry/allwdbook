"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccess } from "../lib/useAccess";

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
      "أدخل رمز الوصول الذي حصلت عليه بعد الدفع. ويمكن لمستخدمي Lifetime القدامى استعمال AWD-LIFE.",
    restoreEmailTitle: "الاستعادة ببريد الحماية",
    restoreEmailDescription:
      "إذا كنت ربطت بريد حماية بخطتك سابقًا، يمكنك استعادة الوصول على هذا الجهاز بدون AWD-KEY.",
    restoreEmailPrivacy:
      "لأسباب أمنية نعرض نفس رسالة الإرسال سواء كان البريد مرتبطًا بخطة أم لا.",
    recoveryEmailPlaceholder: "بريد الحماية",
    recoveryEmailSend: "إرسال رمز الاستعادة",
    recoveryCodeSent:
      "إذا كان البريد مرتبطًا بخطة محمية، أرسلنا إليه رمز تحقق من 6 أرقام.",
    recoveryOtpPlaceholder: "رمز التحقق من 6 أرقام",
    recoveryVerify: "تحقق واستعد خطتي",
    recoverySuccess: "تمت استعادة خطتك",
    recoverySuccessNote:
      "تم ربط الخطط التي أمكن استعادتها بهذا الجهاز ويمكنك استخدامها الآن.",
    restoredPlans: "الخطط المستعادة",
    failedPlans: "لم تُستعد",
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
      "احتفظ بهذا الرمز في مكان آمن ولا تشاركه مع أي شخص. يمكنك استعماله على جهاز جديد.",
    copy: "نسخ الرمز",
    copied: "تم النسخ ✓",
    codeUnavailable:
      "الرمز الكامل يظهر فقط على جهاز الشراء الأصلي. هذا الجهاز يرى نسخة مخفية فقط.",
    ownerDevice: "جهاز الشراء الأصلي",
    noCode: "لم نجد رمز استعادة مرتبطًا بهذا الجهاز.",

    securityEmail: "بريد الحماية",
    securityEmailSub: "اختياري — يحمي حقك إذا فقدت رمز الاستعادة",
    securityEmailFreeSub: "متاح بعد شراء أو تفعيل أي خطة",
    emailTitle: "حماية خطتك بالبريد",
    emailDescription:
      "أضف بريدًا إلكترونيًا اختياريًا لحماية خطتك. لن نطلب منك تسجيل الدخول بهذا البريد.",
    emailFreeMessage:
      "بريد الحماية متاح بعد شراء أو تفعيل أي خطة. بعد حصولك على AWD-KEY يمكنك ربط بريدك لحماية حقك واستعادة الخطة إذا فقدت الرمز.",
    emailOwnerOnly:
      "بريد الحماية يمكن تغييره فقط من جهاز الشراء الأصلي حفاظًا على حق صاحب الخطة.",
    emailUnavailable:
      "لم نجد خطة يمكن ربط بريد الحماية بها على هذا الجهاز.",
    emailPlaceholder: "name@example.com",
    sendCode: "إرسال رمز التحقق",
    codeSent: "أرسلنا رمز تحقق من 6 أرقام إلى بريدك.",
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
      "وصلت الخطة إلى الحد الأقصى للأجهزة. تواصل مع الدعم إذا كان جهاز قديم لم يعد مستخدمًا.",
    rateLimited: "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    invalidOtp: "أدخل رمز تحقق صحيحًا من 6 أرقام.",
    otpExpired: "انتهت صلاحية رمز التحقق. أرسل رمزًا جديدًا.",
    otpWrong: "رمز التحقق غير صحيح.",
    tooManyOtp: "تم إدخال رمز خاطئ عدة مرات. أرسل رمزًا جديدًا.",
    emailSendFailed: "تعذر إرسال بريد التحقق. حاول مرة أخرى.",
    recoveryFailed:
      "تعذر استعادة الخطة. تأكد من رمز التحقق أو أرسل رمزًا جديدًا.",
    missingCheckout: "رابط الدفع لهذه الخطة غير مضبوط.",
    copyFailed: "تعذر نسخ الرمز تلقائيًا.",
  },

  en: {
    account: "Account & Access",
    accountSubtitle: "Manage and recover your plan without signing in",
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
      "If you previously protected your plan with a security email, you can recover access without your AWD-KEY.",
    restoreEmailPrivacy:
      "For security, the same send message is shown whether or not the email is linked to a plan.",
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
    sendNewCode: "Send a new code",

    codePlaceholder: "AWD-KEY-XXXX-XXXX-XXXX-XXXX-XXXX",
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
    noCode: "No recovery key was found for this device.",

    securityEmail: "Security email",
    securityEmailSub: "Optional — protects your access if you lose your key",
    securityEmailFreeSub: "Available after activating any paid plan",
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
    codeSent: "We sent a 6-digit verification code to your email.",
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
    genericError: "Unable to complete the request. Try again.",
    badCode: "This access key is invalid or inactive.",
    activationLimit:
      "This plan has reached its device limit. Contact support if an old device is no longer in use.",
    rateLimited: "Too many attempts. Please wait before trying again.",
    invalidEmail: "Enter a valid email address.",
    invalidOtp: "Enter a valid 6-digit verification code.",
    otpExpired: "The verification code has expired. Send a new code.",
    otpWrong: "The verification code is incorrect.",
    tooManyOtp: "Too many incorrect attempts. Send a new code.",
    emailSendFailed: "Unable to send the verification email. Try again.",
    recoveryFailed:
      "Unable to recover access. Check the verification code or request a new one.",
    missingCheckout: "Checkout URL is not configured.",
    copyFailed: "Automatic copy failed.",
  },
};

function getBillingUrl(subscriptions) {
  if (!Array.isArray(subscriptions)) return "";
  return subscriptions.find((item) => item?.customer_portal_url)
    ?.customer_portal_url || "";
}

function getPlanLabel(planId, isEnglish) {
  if (planId === "lifetime") return "Lifetime";
  const plan = PACKAGES.find((item) => item.id === planId);
  if (!plan) return planId || "";
  return isEnglish ? plan.en : plan.ar;
}

function normalizeTypedCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function isUniversalKey(code) {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .startsWith("AWDKEY");
}

function isLegacyLifetimeKey(code) {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .startsWith("AWDLIFE");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(normalizeEmail(value));
}

function maskEmail(value) {
  const clean = normalizeEmail(value);
  if (!clean || !clean.includes("@")) return "";
  const [local, domain] = clean.split("@");
  if (!local || !domain) return "";
  if (local.length === 1) return `${local}***@${domain}`;
  if (local.length === 2) return `${local[0]}***${local[1]}@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function errorIs(value, names = []) {
  return names.includes(String(value || ""));
}

export default function AccountMenu() {
  const access = useAccess();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [language, setLanguage] = useState("ar");
  const [dialog, setDialog] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [restoreMethod, setRestoreMethod] = useState("key");
  const [accessCode, setAccessCode] = useState("");
  const [restoreResult, setRestoreResult] = useState(null);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryStep, setRecoveryStep] = useState("email");
  const [emailRecoveryResult, setEmailRecoveryResult] = useState(null);

  const [revealedCode, setRevealedCode] = useState("");
  const [revealedCodeHint, setRevealedCodeHint] = useState("");
  const [revealedCodePlan, setRevealedCodePlan] = useState("");
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState("email");
  const [emailSystem, setEmailSystem] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [protectedEmail, setProtectedEmail] = useState("");
  const [protectedKeys, setProtectedKeys] = useState(0);
  const [securityKey, setSecurityKey] = useState(null);

  const isEnglish = language === "en";
  const text = isEnglish ? TEXT.en : TEXT.ar;
  const arrow = isEnglish ? "›" : "‹";
  const activePlans = Array.isArray(access.plans) ? access.plans : [];
  const billingUrl = getBillingUrl(access.subscriptions);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function detectLanguage(event) {
      const eventLanguage = event?.detail;
      const savedLanguage = window.localStorage.getItem("awd_lang");

      if (eventLanguage === "en" || eventLanguage === "ar") {
        setLanguage(eventLanguage);
        return;
      }

      if (savedLanguage === "en" || savedLanguage === "ar") {
        setLanguage(savedLanguage);
        return;
      }

      setLanguage(document.documentElement.lang === "en" ? "en" : "ar");
    }

    detectLanguage();
    window.addEventListener("awd-language-change", detectLanguage);
    return () => {
      window.removeEventListener("awd-language-change", detectLanguage);
    };
  }, []);

  useEffect(() => {
    if (!open && !dialog) return;
    const oldOverflow = document.body.style.overflow;
    const oldOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = oldOverflow;
      document.body.style.overscrollBehavior = oldOverscroll;
    };
  }, [open, dialog]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;
      if (dialog) closeDialog();
      else setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dialog]);

  const currentPlanLabel = access.loading
    ? text.loading
    : access.lifetime
      ? text.lifetime
      : activePlans.length
        ? activePlans.map((plan) => getPlanLabel(plan, isEnglish)).join(" · ")
        : text.free;

  async function getSession() {
    const session = await access.ensureSession();
    if (!session?.access_token || !session?.user?.id) {
      throw new Error("SESSION_MISSING");
    }
    return session;
  }

  function currentDeviceInfo() {
    return {
      platform: navigator.platform || "",
      language: navigator.language || "",
      mobile: /Android|iPhone|iPad|iPod|Mobile/i.test(
        navigator.userAgent || "",
      ),
    };
  }

  async function refreshAccess() {
    await access.refresh();
    window.dispatchEvent(new Event("allwdbook-access-refresh"));
  }

  async function openCheckout(plan) {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      if (!plan?.checkoutUrl) {
        setError(text.missingCheckout);
        return;
      }

      const session = await getSession();
      const checkout = new URL(plan.checkoutUrl);
      checkout.searchParams.set("checkout[custom][user_id]", session.user.id);
      checkout.searchParams.set("checkout[custom][plan_id]", plan.id);
      if (session.user.email) {
        checkout.searchParams.set("checkout[email]", session.user.email);
      }
      window.location.assign(checkout.toString());
    } catch (checkoutError) {
      console.error("Checkout error:", checkoutError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  function buyLifetime() {
    openCheckout({ id: "lifetime", checkoutUrl: LIFETIME_CHECKOUT_URL });
  }

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
    } else {
      setAccessCode("");
    }
  }

  async function activateCode(event) {
    event.preventDefault();
    const cleanCode = normalizeTypedCode(accessCode);
    if (!cleanCode) {
      setError(text.badCode);
      return;
    }

    const universal = isUniversalKey(cleanCode);
    const legacy = isLegacyLifetimeKey(cleanCode);
    if (!universal && !legacy) {
      setError(text.badCode);
      return;
    }

    setBusy(true);
    setError("");
    setRestoreResult(null);

    try {
      const session = await getSession();

      if (universal) {
        const response = await fetch("/api/access-key/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            code: cleanCode,
            deviceName: isEnglish ? "Recovered device" : "جهاز مستعاد",
            deviceInfo: currentDeviceInfo(),
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (data?.error === "ACTIVATION_LIMIT_REACHED") {
            setError(text.activationLimit);
          } else if (data?.error === "RATE_LIMITED") {
            setError(text.rateLimited);
          } else {
            setError(text.badCode);
          }
          return;
        }

        setRestoreResult({
          type: "universal",
          planId: data.planId,
          planName: isEnglish
            ? data.plan?.nameEn || getPlanLabel(data.planId, true)
            : data.plan?.nameAr || getPlanLabel(data.planId, false),
          codeHint: data.codeHint,
          activeDevices: data.activeDevices,
          maxActivations: data.maxActivations,
        });

        setAccessCode("");
        await refreshAccess();
        return;
      }

      const response = await fetch("/api/license/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          data?.error === "ACTIVATION_LIMIT_REACHED"
            ? text.activationLimit
            : text.badCode,
        );
        return;
      }

      setRestoreResult({
        type: "legacy",
        planName: "Lifetime",
        activeDevices: data?.activeActivations ?? null,
        maxActivations: data?.maxActivations ?? null,
      });
      setAccessCode("");
      await refreshAccess();
    } catch (activationError) {
      console.error("Plan activation failed:", activationError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function sendRecoveryEmailCode(event) {
    event?.preventDefault?.();
    const cleanEmail = normalizeEmail(recoveryEmail);
    if (!validEmail(cleanEmail)) {
      setError(text.invalidEmail);
      return;
    }

    setBusy(true);
    setError("");
    setEmailRecoveryResult(null);

    try {
      const session = await getSession();
      const response = await fetch("/api/access-key/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "send", email: cleanEmail }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error === "RATE_LIMITED" ? text.rateLimited : text.genericError);
        return;
      }

      setRecoveryEmail(cleanEmail);
      setRecoveryOtp("");
      setRecoveryStep("otp");
    } catch (recoveryError) {
      console.error("Email recovery send failed:", recoveryError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function verifyRecoveryEmailCode(event) {
    event?.preventDefault?.();
    const cleanEmail = normalizeEmail(recoveryEmail);
    const cleanOtp = String(recoveryOtp || "").trim().replace(/\D/g, "");

    if (!validEmail(cleanEmail)) {
      setError(text.invalidEmail);
      return;
    }
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(text.invalidOtp);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await getSession();
      const response = await fetch("/api/access-key/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "verify",
          email: cleanEmail,
          otp: cleanOtp,
          deviceName: isEnglish ? "Recovered by email" : "جهاز مستعاد بالبريد",
          deviceInfo: currentDeviceInfo(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data?.error === "RATE_LIMITED") setError(text.rateLimited);
        else if (data?.error === "ACTIVATION_LIMIT_REACHED") setError(text.activationLimit);
        else if (data?.error === "TOO_MANY_ATTEMPTS") setError(text.tooManyOtp);
        else if (
          errorIs(data?.error, [
            "CHALLENGE_EXPIRED",
            "OTP_EXPIRED",
            "EXPIRED",
            "CHALLENGE_ALREADY_USED",
            "ALREADY_USED",
            "CHALLENGE_NOT_FOUND",
          ])
        ) {
          setError(text.otpExpired);
        } else if (errorIs(data?.error, ["INVALID_OTP", "OTP_INVALID"])) {
          setError(text.otpWrong);
        } else {
          setError(text.recoveryFailed);
        }
        return;
      }

      const restoredPlans = Array.isArray(data?.restoredPlans)
        ? data.restoredPlans
        : [];
      const failedPlans = Array.isArray(data?.failedPlans) ? data.failedPlans : [];

      setEmailRecoveryResult({
        restoredCount: Number(data?.restoredCount || restoredPlans.length || 0),
        failedCount: Number(data?.failedCount || failedPlans.length || 0),
        restoredPlans,
        failedPlans,
      });
      setRecoveryOtp("");
      setRecoveryStep("success");
      await refreshAccess();
    } catch (recoveryError) {
      console.error("Email recovery verification failed:", recoveryError);
      setError(text.genericError);
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
      const session = await getSession();
      const keyResponse = await fetch("/api/access-key/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const keyData = await keyResponse.json().catch(() => ({}));

      if (keyResponse.ok && Array.isArray(keyData?.keys) && keyData.keys.length) {
        const usableKeys = keyData.keys.filter((item) => item?.usable);
        const ownerKey = usableKeys.find(
          (item) => item?.canRevealCode && item?.code,
        );
        const anyKey = ownerKey || usableKeys[0] || null;

        if (anyKey) {
          setRevealedCode(ownerKey?.code || "");
          setRevealedCodeHint(anyKey?.codeHint || "");
          setRevealedCodePlan(
            isEnglish
              ? anyKey?.plan?.nameEn || getPlanLabel(anyKey?.planId, true)
              : anyKey?.plan?.nameAr || getPlanLabel(anyKey?.planId, false),
          );
          return;
        }
      }

      const legacyResponse = await fetch("/api/license/code", {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const legacyData = await legacyResponse.json().catch(() => ({}));

      if (legacyResponse.ok && legacyData?.code) {
        setRevealedCode(legacyData.code);
        setRevealedCodeHint(legacyData?.codeHint || "");
        setRevealedCodePlan("Lifetime");
        return;
      }

      setError(text.noCode);
    } catch (codeError) {
      console.error("Recovery code lookup failed:", codeError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!revealedCode) return;
    try {
      await navigator.clipboard.writeText(revealedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (clipboardError) {
      console.error("Copy failed:", clipboardError);
      setError(text.copyFailed);
    }
  }

  async function getOwnerSecurityKey(session) {
    const response = await fetch("/api/access-key/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data?.keys)) return null;
    return data.keys.find((item) => item?.usable && item?.ownerDevice) || null;
  }

  async function openEmailSecurity() {
    setOpen(false);
    setDialog("email");
    setBusy(false);
    setError("");
    setEmail("");
    setOtp("");
    setChallengeId("");
    setProtectedEmail("");
    setProtectedKeys(0);
    setSecurityKey(null);
    setEmailSystem("");

    if (!access.paid) {
      setEmailStep("free");
      return;
    }

    setBusy(true);
    setEmailStep("loading");

    try {
      const session = await getSession();
      const ownerKey = await getOwnerSecurityKey(session);

      if (ownerKey) {
        setSecurityKey(ownerKey);
        setEmailSystem("access_key");
        const existingEmail = ownerKey?.recoveryEmail || "";
        setEmail(existingEmail);
        setProtectedEmail(existingEmail ? maskEmail(existingEmail) : "");
        setEmailStep(ownerKey?.recoveryEmailVerified ? "verified" : "email");
        return;
      }

      if (access.lifetime && access.lifetimeLicense?.system === "legacy") {
        setEmailSystem("legacy");
        const existingEmail =
          access.lifetimeLicense?.recoveryEmail || access.email || "";
        setEmail(existingEmail);
        setProtectedEmail(existingEmail ? maskEmail(existingEmail) : "");
        setEmailStep(
          access.lifetimeLicense?.recoveryEmailVerified ? "verified" : "email",
        );
        return;
      }

      setEmailStep("unavailable");
      setError(text.emailOwnerOnly);
    } catch (securityError) {
      console.error("Security email setup failed:", securityError);
      setEmailStep("unavailable");
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function sendEmailCode() {
    const normalizedEmail = normalizeEmail(email);
    if (!validEmail(normalizedEmail)) {
      setError(text.invalidEmail);
      return;
    }
    if (!emailSystem) {
      setError(text.emailUnavailable);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      if (emailSystem === "access_key") {
        const response = await fetch("/api/access-key/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: "send", email: normalizedEmail }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (data?.error === "RATE_LIMITED") setError(text.rateLimited);
          else if (data?.error === "NO_OWNER_ACCESS_KEY") setError(text.emailOwnerOnly);
          else if (
            errorIs(data?.error, [
              "EMAIL_NOT_CONFIGURED",
              "EMAIL_SEND_FAILED",
              "RECOVERY_EMAIL_SEND_FAILED",
            ])
          ) {
            setError(text.emailSendFailed);
          } else setError(text.genericError);
          return;
        }

        setEmail(normalizedEmail);
        setChallengeId(data?.challengeId || "");
        setProtectedEmail(data?.email || maskEmail(normalizedEmail));
        setEmailStep("otp");
        return;
      }

      const response = await fetch("/api/license/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "send", email: normalizedEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error === "RATE_LIMITED" ? text.rateLimited : text.genericError);
        return;
      }
      setEmail(normalizedEmail);
      setProtectedEmail(maskEmail(normalizedEmail));
      setEmailStep("otp");
    } catch (emailError) {
      console.error("Security email send failed:", emailError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmailCode() {
    const cleanOtp = String(otp || "").trim().replace(/\D/g, "");
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(text.invalidOtp);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      if (emailSystem === "access_key") {
        if (!challengeId) {
          setError(text.otpExpired);
          return;
        }

        const response = await fetch("/api/access-key/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "verify",
            email: normalizeEmail(email),
            challengeId,
            otp: cleanOtp,
          }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (data?.error === "INVALID_OTP") setError(text.otpWrong);
          else if (
            errorIs(data?.error, ["CHALLENGE_EXPIRED", "CHALLENGE_ALREADY_USED"])
          )
            setError(text.otpExpired);
          else if (data?.error === "TOO_MANY_ATTEMPTS") setError(text.tooManyOtp);
          else if (data?.error === "RATE_LIMITED") setError(text.rateLimited);
          else setError(text.genericError);
          return;
        }

        setProtectedEmail(data?.email || maskEmail(email));
        setProtectedKeys(Number(data?.protectedKeys || 0));
        setOtp("");
        setChallengeId("");
        setEmailStep("verified");
        await refreshAccess();
        return;
      }

      const response = await fetch("/api/license/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "verify",
          email: normalizeEmail(email),
          otp: cleanOtp,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error === "INVALID_OTP" ? text.otpWrong : text.genericError);
        return;
      }

      setProtectedEmail(maskEmail(email));
      setOtp("");
      setEmailStep("verified");
      await refreshAccess();
    } catch (verifyError) {
      console.error("Security email verification failed:", verifyError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  function changeSecurityEmail() {
    setEmailStep("email");
    setOtp("");
    setChallengeId("");
    setError("");
  }

  function resendSecurityOtp() {
    setOtp("");
    setChallengeId("");
    setError("");
    setEmailStep("email");
  }

  function closeDialog() {
    setDialog("");
    setError("");
    setBusy(false);
    setRestoreResult(null);
    setEmailRecoveryResult(null);
    setOtp("");
    setRecoveryOtp("");
    setChallengeId("");
  }

  const portalContent = mounted
    ? createPortal(
        <>
          {open && (
            <div className="awd-account-portal" dir={isEnglish ? "ltr" : "rtl"}>
              <button
                type="button"
                className="awd-account-backdrop"
                aria-label={text.close}
                onClick={() => setOpen(false)}
              />

              <section className="awd-account-sheet" role="dialog" aria-modal="true">
                <span className="awd-sheet-handle" />

                <header className="awd-account-head">
                  <img className="awd-account-avatar" src="/logov3.png" alt="AllWDbook" />
                  <div className="awd-account-head-copy">
                    <h3>{text.account}</h3>
                    <p>{text.accountSubtitle}</p>
                  </div>
                  <button
                    type="button"
                    className="awd-account-close"
                    onClick={() => setOpen(false)}
                    aria-label={text.close}
                  >
                    ✕
                  </button>
                </header>

                <div className="awd-access-card">
                  <span className="awd-access-label">{text.currentAccess}</span>
                  <div className="awd-access-value">
                    <span
                      className={`awd-access-dot${
                        access.lifetime || activePlans.length ? " premium" : ""
                      }`}
                    />
                    <span>{currentPlanLabel}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="awd-account-button green"
                  onClick={openRestoreDialog}
                >
                  <span className="awd-button-left">
                    <span className="awd-button-icon">🔑</span>
                    <span className="awd-button-copy">
                      <strong>{text.restore}</strong>
                      <small>{text.restoreSub}</small>
                    </span>
                  </span>
                  <span className="awd-button-arrow">{arrow}</span>
                </button>

                {access.paid && (
                  <button
                    type="button"
                    className="awd-account-button"
                    onClick={revealCode}
                    disabled={busy}
                  >
                    <span className="awd-button-left">
                      <span className="awd-button-icon">🛡️</span>
                      <span className="awd-button-copy">
                        <strong>{text.recoveryCode}</strong>
                        <small>{text.recoveryCodeSub}</small>
                      </span>
                    </span>
                    <span className="awd-button-arrow">{arrow}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="awd-account-button security"
                  onClick={openEmailSecurity}
                  disabled={busy}
                >
                  <span className="awd-button-left">
                    <span className="awd-button-icon">✉️</span>
                    <span className="awd-button-copy">
                      <strong>{text.securityEmail}</strong>
                      <small>
                        {access.paid
                          ? text.securityEmailSub
                          : text.securityEmailFreeSub}
                      </small>
                    </span>
                  </span>
                  <span className="awd-button-arrow">{arrow}</span>
                </button>

                {!access.lifetime && (
                  <div className="awd-lifetime-card">
                    <div className="awd-lifetime-top">
                      <div className="awd-lifetime-icon">👑</div>
                      <div className="awd-lifetime-copy">
                        <span className="awd-lifetime-title">{text.lifetimeTitle}</span>
                        <span className="awd-lifetime-sub">{text.lifetimeSub}</span>
                        <div className="awd-lifetime-price">{text.lifetimePrice}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="awd-account-button primary"
                      onClick={buyLifetime}
                      disabled={busy}
                    >
                      <span className="awd-button-left">
                        <span className="awd-button-icon">⚡</span>
                        {text.buyLifetime}
                      </span>
                      <span className="awd-button-arrow">{arrow}</span>
                    </button>
                  </div>
                )}

                <a href="/subscription" className="awd-account-button">
                  <span className="awd-button-left">
                    <span className="awd-button-icon">👑</span>
                    {text.goPlans}
                  </span>
                  <span className="awd-button-arrow">{arrow}</span>
                </a>

                <button
                  type="button"
                  className="awd-account-button"
                  onClick={() => setShowPlans((current) => !current)}
                >
                  <span className="awd-button-left">
                    <span className="awd-button-icon">🧾</span>
                    {showPlans ? text.hidePlans : text.showPlans}
                  </span>
                  <span className="awd-button-arrow">{showPlans ? "⌃" : "⌄"}</span>
                </button>

                {showPlans && (
                  <div className="awd-plans-wrap">
                    {PACKAGES.map((plan) => {
                      const current =
                        access.lifetime || activePlans.includes(plan.id);
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          disabled={current || busy}
                          onClick={() => openCheckout(plan)}
                          className={`awd-plan-option${plan.featured ? " featured" : ""}${
                            current ? " active" : ""
                          }`}
                        >
                          <span className="awd-plan-icon">{plan.icon}</span>
                          <span className="awd-plan-middle">
                            <span className="awd-plan-name">
                              {isEnglish ? plan.en : plan.ar}
                            </span>
                            {current && (
                              <small className="awd-plan-state">
                                ✓ {access.lifetime ? text.included : text.active}
                              </small>
                            )}
                          </span>
                          <span className="awd-plan-price">
                            {plan.price}
                            <small>{isEnglish ? plan.periodEn : plan.periodAr}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {billingUrl && (
                  <a
                    href={billingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="awd-account-button"
                  >
                    <span className="awd-button-left">
                      <span className="awd-button-icon">⚙️</span>
                      {text.billing}
                    </span>
                    <span className="awd-button-arrow">↗</span>
                  </a>
                )}

                {error && <div className="awd-account-error">{error}</div>}
              </section>
            </div>
          )}

          {dialog && (
            <div className="awd-dialog-portal" dir={isEnglish ? "ltr" : "rtl"}>
              <button
                type="button"
                className="awd-dialog-backdrop"
                aria-label={text.close}
                onClick={closeDialog}
              />

              <section className="awd-dialog" role="dialog" aria-modal="true">
                <span className="awd-dialog-handle" />

                {dialog === "restore" && (
                  <div>
                    <h2>🔑 {text.restoreTitle}</h2>

                    <div className="awd-restore-tabs">
                      <button
                        type="button"
                        className={restoreMethod === "key" ? "active" : ""}
                        onClick={() => selectRestoreMethod("key")}
                      >
                        🔑 {text.restoreKeyTab}
                      </button>
                      <button
                        type="button"
                        className={restoreMethod === "email" ? "active" : ""}
                        onClick={() => selectRestoreMethod("email")}
                      >
                        ✉️ {text.restoreEmailTab}
                      </button>
                    </div>

                    {restoreMethod === "key" && (
                      <>
                        <p className="awd-dialog-description">{text.restoreDescription}</p>

                        {!restoreResult ? (
                          <form onSubmit={activateCode}>
                            <input
                              className="awd-dialog-input"
                              dir="ltr"
                              value={accessCode}
                              placeholder={text.codePlaceholder}
                              autoComplete="off"
                              autoCapitalize="characters"
                              spellCheck="false"
                              onChange={(event) => setAccessCode(event.target.value)}
                            />

                            {error && (
                              <div className="awd-account-error" role="alert">
                                {error}
                              </div>
                            )}

                            <div className="awd-dialog-actions">
                              <button
                                type="submit"
                                className="awd-dialog-primary"
                                disabled={busy}
                              >
                                {busy ? text.processing : text.activate}
                              </button>
                              <button
                                type="button"
                                className="awd-dialog-secondary"
                                onClick={closeDialog}
                              >
                                {text.close}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="awd-success-box">
                              ✅ {text.restoreSuccess}
                              <small>{text.restoreSuccessNote}</small>
                            </div>
                            <div className="awd-result-grid">
                              <div className="awd-result-box">
                                <small>{text.restoredPlan}</small>
                                <strong>{restoreResult.planName}</strong>
                              </div>
                              <div className="awd-result-box">
                                <small>{text.devices}</small>
                                <strong dir="ltr">
                                  {restoreResult.activeDevices ?? "—"} / {restoreResult.maxActivations ?? "—"}
                                </strong>
                              </div>
                            </div>
                            {restoreResult.codeHint && (
                              <div className="awd-code-box awd-code-space">
                                {restoreResult.codeHint}
                              </div>
                            )}
                            <div className="awd-dialog-actions">
                              <button
                                type="button"
                                className="awd-dialog-primary"
                                onClick={() => {
                                  closeDialog();
                                  window.location.href = "/";
                                }}
                              >
                                🚀 AllWDbook
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {restoreMethod === "email" && (
                      <>
                        <p className="awd-dialog-description">
                          {text.restoreEmailDescription}
                        </p>
                        <div className="awd-privacy-note">🔒 {text.restoreEmailPrivacy}</div>

                        {recoveryStep === "email" && (
                          <form onSubmit={sendRecoveryEmailCode}>
                            <input
                              className="awd-dialog-input"
                              type="email"
                              dir="ltr"
                              autoComplete="email"
                              placeholder={text.recoveryEmailPlaceholder}
                              value={recoveryEmail}
                              onChange={(event) => setRecoveryEmail(event.target.value)}
                            />

                            {error && (
                              <div className="awd-account-error" role="alert">
                                {error}
                              </div>
                            )}

                            <div className="awd-dialog-actions">
                              <button
                                type="submit"
                                className="awd-dialog-primary"
                                disabled={busy}
                              >
                                {busy ? text.processing : `✉️ ${text.recoveryEmailSend}`}
                              </button>
                              <button
                                type="button"
                                className="awd-dialog-secondary"
                                onClick={closeDialog}
                              >
                                {text.close}
                              </button>
                            </div>
                          </form>
                        )}

                        {recoveryStep === "otp" && (
                          <form onSubmit={verifyRecoveryEmailCode}>
                            <div className="awd-email-sent">
                              <span>✉️</span>
                              <div>
                                <strong>{text.recoveryCodeSent}</strong>
                                <small dir="ltr">{maskEmail(recoveryEmail)}</small>
                              </div>
                            </div>

                            <input
                              className="awd-dialog-input awd-otp-input"
                              dir="ltr"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              placeholder={text.recoveryOtpPlaceholder}
                              value={recoveryOtp}
                              onChange={(event) =>
                                setRecoveryOtp(
                                  event.target.value.replace(/\D/g, "").slice(0, 6),
                                )
                              }
                            />

                            {error && (
                              <div className="awd-account-error" role="alert">
                                {error}
                              </div>
                            )}

                            <div className="awd-dialog-actions">
                              <button
                                type="submit"
                                className="awd-dialog-primary"
                                disabled={busy}
                              >
                                {busy ? text.processing : `✓ ${text.recoveryVerify}`}
                              </button>
                              <button
                                type="button"
                                className="awd-dialog-secondary"
                                onClick={restartEmailRecovery}
                                disabled={busy}
                              >
                                🔄 {text.sendNewCode}
                              </button>
                            </div>
                          </form>
                        )}

                        {recoveryStep === "success" && (
                          <>
                            <div className="awd-security-success">
                              <div className="awd-security-success-icon">✓</div>
                              <h3>{text.recoverySuccess}</h3>
                              <p>{text.recoverySuccessNote}</p>
                            </div>

                            <div className="awd-result-grid">
                              <div className="awd-result-box">
                                <small>{text.restoredPlans}</small>
                                <strong>{emailRecoveryResult?.restoredCount ?? 0}</strong>
                              </div>
                              <div className="awd-result-box">
                                <small>{text.failedPlans}</small>
                                <strong>{emailRecoveryResult?.failedCount ?? 0}</strong>
                              </div>
                            </div>

                            {emailRecoveryResult?.restoredPlans?.length > 0 && (
                              <div className="awd-recovered-list">
                                {emailRecoveryResult.restoredPlans.map((plan, index) => (
                                  <div key={`${plan?.accessKeyId || plan?.planId || index}`}>
                                    <span>✓</span>
                                    <strong>{getPlanLabel(plan?.planId, isEnglish)}</strong>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="awd-dialog-actions">
                              <button
                                type="button"
                                className="awd-dialog-primary"
                                onClick={() => {
                                  closeDialog();
                                  window.location.href = "/";
                                }}
                              >
                                🚀 AllWDbook
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {dialog === "code" && (
                  <div>
                    <h2>🛡️ {text.codeTitle}</h2>
                    <p className="awd-dialog-description">{text.codeWarning}</p>

                    {busy ? (
                      <div className="awd-loading-box">
                        <div className="awd-loader" />
                        <span>{text.processing}</span>
                      </div>
                    ) : revealedCode ? (
                      <>
                        {revealedCodePlan && (
                          <div className="awd-result-box">
                            <small>{text.restoredPlan}</small>
                            <strong>{revealedCodePlan}</strong>
                          </div>
                        )}
                        <div className="awd-code-box awd-code-space">{revealedCode}</div>
                        <p className="awd-code-warning">🔒 {text.ownerDevice}</p>
                        <div className="awd-dialog-actions">
                          <button
                            type="button"
                            className="awd-dialog-primary"
                            onClick={copyCode}
                          >
                            {copied ? text.copied : text.copy}
                          </button>
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={closeDialog}
                          >
                            {text.close}
                          </button>
                        </div>
                      </>
                    ) : revealedCodeHint ? (
                      <>
                        {revealedCodePlan && (
                          <div className="awd-result-box">
                            <small>{text.restoredPlan}</small>
                            <strong>{revealedCodePlan}</strong>
                          </div>
                        )}
                        <div className="awd-code-box awd-code-space">
                          {revealedCodeHint}
                        </div>
                        <p className="awd-code-warning">🔐 {text.codeUnavailable}</p>
                        <div className="awd-dialog-actions">
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={closeDialog}
                          >
                            {text.close}
                          </button>
                        </div>
                      </>
                    ) : null}

                    {error && (
                      <div className="awd-account-error" role="alert">
                        {error}
                      </div>
                    )}
                  </div>
                )}

                {dialog === "email" && (
                  <div>
                    <h2>✉️ {text.emailTitle}</h2>
                    <p className="awd-dialog-description">{text.emailDescription}</p>

                    {emailStep === "free" && (
                      <>
                        <div className="awd-free-security-box">
                          <div className="awd-free-security-icon">🔒</div>
                          <h3>{text.securityEmail}</h3>
                          <p>{text.emailFreeMessage}</p>
                        </div>
                        <div className="awd-dialog-actions">
                          <a
                            href="/subscription"
                            className="awd-dialog-primary awd-dialog-link"
                          >
                            👑 {text.goPlans}
                          </a>
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={closeDialog}
                          >
                            {text.close}
                          </button>
                        </div>
                      </>
                    )}

                    {emailStep === "loading" && (
                      <div className="awd-loading-box">
                        <div className="awd-loader" />
                        <span>{text.processing}</span>
                      </div>
                    )}

                    {emailStep === "email" && (
                      <>
                        {emailSystem === "access_key" && securityKey && (
                          <div className="awd-security-plan">
                            <span className="awd-security-plan-icon">🛡️</span>
                            <div>
                              <small>{text.restoredPlan}</small>
                              <strong>
                                {isEnglish
                                  ? securityKey?.plan?.nameEn ||
                                    getPlanLabel(securityKey?.planId, true)
                                  : securityKey?.plan?.nameAr ||
                                    getPlanLabel(securityKey?.planId, false)}
                              </strong>
                            </div>
                          </div>
                        )}

                        <input
                          className="awd-dialog-input"
                          type="email"
                          dir="ltr"
                          autoComplete="email"
                          placeholder={text.emailPlaceholder}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />

                        {error && (
                          <div className="awd-account-error" role="alert">
                            {error}
                          </div>
                        )}

                        <div className="awd-dialog-actions">
                          <button
                            type="button"
                            className="awd-dialog-primary"
                            onClick={sendEmailCode}
                            disabled={busy}
                          >
                            {busy ? text.processing : `✉️ ${text.sendCode}`}
                          </button>
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={closeDialog}
                          >
                            {text.close}
                          </button>
                        </div>
                      </>
                    )}

                    {emailStep === "otp" && (
                      <>
                        <div className="awd-email-sent">
                          <span>✉️</span>
                          <div>
                            <strong>{text.codeSent}</strong>
                            {protectedEmail && <small dir="ltr">{protectedEmail}</small>}
                          </div>
                        </div>

                        <input
                          className="awd-dialog-input awd-otp-input"
                          dir="ltr"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder={text.otpPlaceholder}
                          value={otp}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                        />

                        {error && (
                          <div className="awd-account-error" role="alert">
                            {error}
                          </div>
                        )}

                        <div className="awd-dialog-actions">
                          <button
                            type="button"
                            className="awd-dialog-primary"
                            onClick={verifyEmailCode}
                            disabled={busy}
                          >
                            {busy ? text.processing : `✓ ${text.verify}`}
                          </button>
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={resendSecurityOtp}
                            disabled={busy}
                          >
                            🔄 {text.resend}
                          </button>
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={closeDialog}
                          >
                            {text.close}
                          </button>
                        </div>
                      </>
                    )}

                    {emailStep === "verified" && (
                      <>
                        <div className="awd-security-success">
                          <div className="awd-security-success-icon">✓</div>
                          <h3>{text.verified}</h3>
                          <p>{text.verifiedDescription}</p>
                          {(protectedEmail || email) && (
                            <div className="awd-protected-email" dir="ltr">
                              {protectedEmail || maskEmail(email)}
                            </div>
                          )}
                          {protectedKeys > 0 && (
                            <div className="awd-protected-count">
                              <small>{text.protectedPlans}</small>
                              <strong>{protectedKeys}</strong>
                            </div>
                          )}
                        </div>
                        <div className="awd-dialog-actions">
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={changeSecurityEmail}
                          >
                            ✏️ {text.changeEmail}
                          </button>
                          <button
                            type="button"
                            className="awd-dialog-primary"
                            onClick={closeDialog}
                          >
                            ✓ {text.close}
                          </button>
                        </div>
                      </>
                    )}

                    {emailStep === "unavailable" && (
                      <>
                        <div className="awd-security-unavailable">
                          <div className="awd-free-security-icon">🔒</div>
                          <p>{error || text.emailUnavailable}</p>
                        </div>
                        <div className="awd-dialog-actions">
                          <button
                            type="button"
                            className="awd-dialog-secondary"
                            onClick={closeDialog}
                          >
                            {text.close}
                          </button>
                        </div>
                      </>
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

  return (
    <>
      <style jsx global>{`
        .awd-account-root,
        .awd-account-root *,
        .awd-account-portal,
        .awd-account-portal *,
        .awd-dialog-portal,
        .awd-dialog-portal * { box-sizing: border-box; }

        .awd-account-trigger {
          width: 46px; height: 46px; display: grid; place-items: center; padding: 2px;
          border: 1px solid rgba(255,255,255,.11); border-radius: 15px;
          background: #0d1929; cursor: pointer;
        }
        .awd-account-trigger img {
          width: 38px; height: 38px; display: block; object-fit: cover; border-radius: 12px;
        }

        .awd-account-portal, .awd-dialog-portal {
          position: fixed; inset: 0; width: 100vw; height: 100dvh; margin: 0; padding: 0;
          transform: none !important; isolation: isolate; pointer-events: none;
        }
        .awd-account-portal { z-index: 2147483000; }
        .awd-dialog-portal { z-index: 2147483100; }

        .awd-account-backdrop, .awd-dialog-backdrop {
          position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0;
          border: 0; pointer-events: auto; cursor: default;
          background: rgba(1,7,15,.78); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
        }
        .awd-dialog-backdrop { background: rgba(1,7,15,.86); }

        .awd-account-sheet {
          position: absolute; z-index: 2; top: 82px; inset-inline-end: 18px;
          width: min(410px, calc(100vw - 36px)); max-height: calc(100dvh - 102px);
          overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch; padding: 18px;
          border: 1px solid #263650; border-radius: 24px; pointer-events: auto;
          background: radial-gradient(circle at 90% 0%, rgba(255,107,0,.11), transparent 34%),
            linear-gradient(160deg,#0d1b2f,#071424);
          color: #f4f7fb; box-shadow: 0 30px 80px rgba(0,0,0,.55);
        }
        [dir="rtl"] .awd-account-sheet {
          background: radial-gradient(circle at 10% 0%, rgba(255,107,0,.11), transparent 34%),
            linear-gradient(160deg,#0d1b2f,#071424);
        }
        .awd-sheet-handle, .awd-dialog-handle { display: none; }

        .awd-account-head { display: flex; align-items: center; gap: 12px; margin-bottom: 17px; }
        .awd-account-avatar { width: 54px; height: 54px; flex: 0 0 54px; border-radius: 16px; object-fit: cover; }
        .awd-account-head-copy { flex: 1; min-width: 0; }
        .awd-account-head-copy h3 { margin: 0; color: white; font-size: 18px; font-weight: 900; }
        .awd-account-head-copy p { margin: 4px 0 0; color: #8496ae; font-size: 11px; line-height: 1.5; }
        .awd-account-close {
          width: 40px; height: 40px; flex: 0 0 40px; display: grid; place-items: center;
          border: 1px solid #29405d; border-radius: 12px; background: #0c1d31;
          color: #dce6f1; font-size: 18px; cursor: pointer;
        }

        .awd-access-card { padding: 15px; border: 1px solid #263650; border-radius: 17px; background: rgba(255,255,255,.025); }
        .awd-access-label { display: block; margin-bottom: 7px; color: #8292aa; font-size: 10px; font-weight: 800; }
        .awd-access-value { display: flex; align-items: center; gap: 9px; color: white; font-size: 16px; font-weight: 900; }
        .awd-access-dot { width: 9px; height: 9px; flex: 0 0 9px; border-radius: 999px; background: #ff6b00; box-shadow: 0 0 0 5px rgba(255,107,0,.1); }
        .awd-access-dot.premium { background: #21c47b; box-shadow: 0 0 0 5px rgba(33,196,123,.1); }

        .awd-account-button {
          width: 100%; min-height: 52px; display: flex; align-items: center; justify-content: space-between;
          gap: 10px; margin-top: 10px; padding: 10px 13px; border: 1px solid #283a52;
          border-radius: 14px; background: #0c1b2e; color: #eef3fb; text-align: inherit;
          text-decoration: none; font-size: 13px; font-weight: 800; cursor: pointer;
        }
        .awd-account-button.primary { border-color: #ff6b00; background: linear-gradient(135deg,#ff6900,#ff7b1e); color: white; }
        .awd-account-button.green { border-color: rgba(32,196,121,.3); background: linear-gradient(135deg,rgba(19,102,82,.17),rgba(5,69,66,.12)); color: #73e4ad; }
        .awd-account-button.security { border-color: rgba(77,156,255,.32); background: linear-gradient(135deg,rgba(31,100,177,.13),rgba(11,41,78,.24)); color: #dcecff; }
        .awd-account-button:disabled { opacity: .52; cursor: not-allowed; }
        .awd-button-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .awd-button-icon { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 34px; border-radius: 10px; background: rgba(255,255,255,.055); font-size: 17px; }
        .awd-button-copy { min-width: 0; }
        .awd-button-copy strong { display: block; color: inherit; font-size: 13px; }
        .awd-button-copy small { display: block; margin-top: 3px; color: #71839d; font-size: 9px; font-weight: 500; line-height: 1.45; }
        .awd-button-arrow { flex: 0 0 auto; color: #657a96; font-size: 20px; }

        .awd-lifetime-card {
          margin-top: 12px; padding: 15px; border: 1px solid rgba(255,177,52,.3); border-radius: 18px;
          background: radial-gradient(circle at 85% 0%, rgba(255,180,50,.13), transparent 45%), #0d1929;
        }
        [dir="rtl"] .awd-lifetime-card { background: radial-gradient(circle at 15% 0%, rgba(255,180,50,.13), transparent 45%), #0d1929; }
        .awd-lifetime-top { display: flex; gap: 12px; align-items: center; }
        .awd-lifetime-icon { width: 50px; height: 50px; display: grid; place-items: center; flex: 0 0 50px; border-radius: 15px; background: rgba(255,185,55,.12); font-size: 25px; }
        .awd-lifetime-copy { flex: 1; min-width: 0; }
        .awd-lifetime-title { display: block; font-size: 17px; font-weight: 900; }
        .awd-lifetime-sub { display: block; margin-top: 3px; color: #9aa8ba; font-size: 11px; }
        .awd-lifetime-price { margin-top: 5px; color: #ffc25a; font-size: 12px; font-weight: 900; }

        .awd-plans-wrap { display: grid; gap: 8px; margin-top: 10px; }
        .awd-plan-option {
          width: 100%; display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center;
          gap: 10px; padding: 12px; border: 1px solid #283950; border-radius: 14px;
          background: #0a1829; color: #edf3fb; text-align: inherit; cursor: pointer;
        }
        .awd-plan-option.featured { border-color: rgba(255,107,0,.52); background: rgba(255,107,0,.055); }
        .awd-plan-option.active { border-color: rgba(32,196,121,.45); background: rgba(32,196,121,.07); }
        .awd-plan-option:disabled { cursor: default; }
        .awd-plan-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 11px; background: #15243a; font-size: 19px; }
        .awd-plan-middle { min-width: 0; }
        .awd-plan-name { display: block; overflow-wrap: anywhere; font-size: 13px; font-weight: 900; }
        .awd-plan-state { display: block; margin-top: 3px; color: #54d99a; font-size: 10px; }
        .awd-plan-price { direction: ltr; text-align: end; font-size: 13px; font-weight: 900; }
        .awd-plan-price small { display: block; margin-top: 2px; color: #788aa2; font-size: 9px; font-weight: 500; }

        .awd-account-error { margin: 12px 0 0; padding: 11px 12px; border: 1px solid rgba(255,91,91,.25); border-radius: 12px; background: rgba(255,76,76,.08); color: #ff9b9b; font-size: 11px; line-height: 1.6; }

        .awd-dialog {
          position: absolute; z-index: 2; top: 50%; left: 50%; width: min(460px, calc(100vw - 36px));
          max-height: calc(100dvh - 36px); overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch; padding: 22px; border: 1px solid #283950; border-radius: 24px;
          pointer-events: auto; transform: translate(-50%,-50%);
          background: radial-gradient(circle at 90% 0%, rgba(255,107,0,.1), transparent 35%), #08182a;
          color: #f4f7fb; box-shadow: 0 30px 90px rgba(0,0,0,.6);
        }
        [dir="rtl"] .awd-dialog { background: radial-gradient(circle at 10% 0%, rgba(255,107,0,.1), transparent 35%), #08182a; }
        .awd-dialog h2 { margin: 0; color: white; font-size: 21px; line-height: 1.35; }
        .awd-dialog-description { margin: 9px 0 18px; color: #8fa0b8; font-size: 12px; line-height: 1.8; }
        .awd-dialog-input { width: 100%; min-height: 54px; padding: 11px 13px; border: 1px solid #2a3c55; border-radius: 13px; outline: none; background: #04111f; color: white; font-size: 14px; }
        .awd-dialog-input::placeholder { color: #60718a; }
        .awd-dialog-input:focus { border-color: #ff6b00; box-shadow: 0 0 0 3px rgba(255,107,0,.08); }
        .awd-otp-input { margin-top: 12px; text-align: center; letter-spacing: .3em; font-size: 20px; font-weight: 900; }

        .awd-restore-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
        .awd-restore-tabs button { min-height: 46px; padding: 8px 10px; border: 1px solid #29405d; border-radius: 13px; background: #0c1a2d; color: #9fb0c5; font-size: 11px; font-weight: 800; cursor: pointer; }
        .awd-restore-tabs button.active { border-color: #ff6b00; background: rgba(255,107,0,.1); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,107,0,.1); }
        .awd-privacy-note { margin: -6px 0 14px; padding: 10px 12px; border: 1px solid #233d59; border-radius: 12px; background: rgba(51,114,183,.07); color: #7f94ad; font-size: 10px; line-height: 1.65; }

        .awd-code-box { padding: 15px 10px; border: 1px solid #293b54; border-radius: 14px; background: #03101d; color: #ffc56d; direction: ltr; text-align: center; overflow-wrap: anywhere; font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; font-size: 13px; line-height: 1.6; user-select: all; }
        .awd-code-space { margin-top: 10px; }
        .awd-code-warning { margin: 12px 0 0; color: #9baabd; font-size: 11px; line-height: 1.7; }

        .awd-success-box { padding: 15px; border: 1px solid rgba(32,196,121,.3); border-radius: 14px; background: rgba(32,196,121,.07); color: #72e5ad; font-size: 12px; font-weight: 800; line-height: 1.65; }
        .awd-success-box small { display: block; margin-top: 5px; color: #9db8aa; font-size: 10px; font-weight: 500; }
        .awd-result-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; margin-top: 11px; }
        .awd-result-box { padding: 12px; border: 1px solid #233a55; border-radius: 13px; background: #051426; }
        .awd-result-box small { display: block; color: #7588a2; font-size: 9px; }
        .awd-result-box strong { display: block; margin-top: 5px; color: white; font-size: 12px; overflow-wrap: anywhere; }
        .awd-recovered-list { display: grid; gap: 7px; margin-top: 10px; }
        .awd-recovered-list > div { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid rgba(32,196,121,.22); border-radius: 12px; background: rgba(32,196,121,.05); }
        .awd-recovered-list span { color: #54d99a; }
        .awd-recovered-list strong { color: #eaf9f2; font-size: 11px; }

        .awd-security-plan { display: flex; align-items: center; gap: 11px; margin-bottom: 12px; padding: 12px; border: 1px solid #25415f; border-radius: 14px; background: #061729; }
        .awd-security-plan-icon { width: 42px; height: 42px; display: grid; place-items: center; flex: 0 0 42px; border-radius: 12px; background: rgba(61,142,234,.11); font-size: 20px; }
        .awd-security-plan small { display: block; color: #7588a3; font-size: 9px; }
        .awd-security-plan strong { display: block; margin-top: 3px; color: white; font-size: 13px; }
        .awd-email-sent { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 13px; border: 1px solid rgba(54,141,239,.25); border-radius: 14px; background: rgba(39,111,197,.07); }
        .awd-email-sent > span { width: 40px; height: 40px; display: grid; place-items: center; flex: 0 0 40px; border-radius: 12px; background: #102842; font-size: 19px; }
        .awd-email-sent strong { display: block; color: #dcecff; font-size: 11px; line-height: 1.55; }
        .awd-email-sent small { display: block; margin-top: 4px; color: #79a9dc; font-size: 10px; }

        .awd-security-success, .awd-free-security-box, .awd-security-unavailable { padding: 20px 14px; border: 1px solid #29425c; border-radius: 18px; background: #06182a; text-align: center; }
        .awd-security-success { border-color: rgba(32,196,121,.3); background: radial-gradient(circle at 50% 0%, rgba(32,196,121,.12), transparent 60%), #06182a; }
        .awd-free-security-box { border-color: rgba(77,156,255,.25); background: radial-gradient(circle at 50% 0%, rgba(77,156,255,.1), transparent 60%), #06182a; }
        .awd-security-success-icon, .awd-free-security-icon { width: 58px; height: 58px; display: grid; place-items: center; margin: 0 auto 12px; border-radius: 18px; font-size: 27px; font-weight: 900; }
        .awd-security-success-icon { border: 1px solid rgba(51,219,151,.32); background: rgba(33,196,123,.1); color: #69e4ad; }
        .awd-free-security-icon { border: 1px solid rgba(76,151,239,.3); background: rgba(48,124,214,.1); }
        .awd-security-success h3, .awd-free-security-box h3 { margin: 0; color: white; font-size: 18px; }
        .awd-security-success p, .awd-free-security-box p, .awd-security-unavailable p { margin: 8px auto 0; max-width: 360px; color: #8ca0b6; font-size: 11px; line-height: 1.75; }
        .awd-protected-email { margin-top: 14px; padding: 12px; border: 1px solid #25425f; border-radius: 12px; background: #03101e; color: #cce3ff; font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 12px; }
        .awd-protected-count { display: inline-flex; align-items: center; gap: 9px; margin-top: 11px; padding: 7px 11px; border-radius: 999px; background: rgba(33,196,123,.08); }
        .awd-protected-count small { color: #90b3a2; font-size: 9px; }
        .awd-protected-count strong { color: #65dda8; font-size: 12px; }

        .awd-loading-box { min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 11px; color: #899db6; font-size: 11px; }
        .awd-loader { width: 29px; height: 29px; border: 3px solid #1d3654; border-top-color: #ff6b00; border-radius: 50%; animation: awdSpin .8s linear infinite; }
        @keyframes awdSpin { to { transform: rotate(360deg); } }

        .awd-dialog-actions { display: grid; gap: 9px; margin-top: 16px; }
        .awd-dialog-primary, .awd-dialog-secondary { width: 100%; min-height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 13px; font-size: 13px; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
        .awd-dialog-primary { border: 1px solid #ff6b00; background: linear-gradient(135deg,#ff6900,#ff7c20); color: white; box-shadow: 0 12px 28px rgba(255,105,0,.12); }
        .awd-dialog-secondary { border: 1px solid #2a3c54; background: #0d1c30; color: #d9e2ef; }
        .awd-dialog-link { text-decoration: none; }
        .awd-dialog-primary:disabled, .awd-dialog-secondary:disabled { opacity: .55; cursor: not-allowed; }

        @media (max-width: 620px) {
          .awd-account-trigger { width: 43px; height: 43px; border-radius: 13px; }
          .awd-account-trigger img { width: 35px; height: 35px; border-radius: 11px; }
          .awd-account-sheet {
            top: auto; bottom: 0; left: 0; right: 0; inset-inline-start: 0; inset-inline-end: 0;
            width: 100vw; max-width: none; max-height: 88dvh; margin: 0;
            padding: 10px 17px calc(18px + env(safe-area-inset-bottom));
            border-inline: 0; border-bottom: 0; border-radius: 27px 27px 0 0;
            box-shadow: 0 -20px 60px rgba(0,0,0,.5);
          }
          .awd-sheet-handle, .awd-dialog-handle { width: 48px; height: 5px; display: block; margin: 2px auto 15px; border-radius: 999px; background: #425570; }
          .awd-account-head { margin-bottom: 13px; }
          .awd-account-avatar { width: 49px; height: 49px; flex-basis: 49px; border-radius: 14px; }
          .awd-account-head-copy h3 { font-size: 20px; }
          .awd-access-card { padding: 16px; }
          .awd-account-button { min-height: 56px; }
          .awd-dialog {
            top: auto; bottom: 0; left: 0; right: 0; width: 100vw; max-width: none; max-height: 90dvh;
            margin: 0; padding: 10px 18px calc(20px + env(safe-area-inset-bottom));
            border-inline: 0; border-bottom: 0; border-radius: 27px 27px 0 0; transform: none;
            box-shadow: 0 -20px 70px rgba(0,0,0,.58);
          }
          .awd-dialog h2 { font-size: 21px; }
          .awd-dialog-description { font-size: 12px; }
          .awd-dialog-input { min-height: 58px; font-size: 14px; }
          .awd-dialog-primary, .awd-dialog-secondary { min-height: 55px; }
          .awd-restore-tabs { grid-template-columns: 1fr; }
        }

        @media (max-width: 360px) {
          .awd-account-sheet, .awd-dialog { padding-inline: 13px; }
          .awd-account-head-copy h3 { font-size: 18px; }
          .awd-result-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="awd-account-root">
        <button
          type="button"
          className="awd-account-trigger"
          aria-label={text.openAccount}
          aria-expanded={open}
          onClick={() => {
            setOpen(true);
            setError("");
          }}
        >
          <img src="/logov3.png" alt="AllWDbook" />
        </button>
      </div>

      {portalContent}
    </>
  );
}

