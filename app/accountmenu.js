"use client";

import { useEffect, useState } from "react";
import { useAccess } from "../lib/useAccess";

/* =========================================================
   CHECKOUT CONFIG
   ========================================================= */

const LIFETIME_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LEMON_LIFETIME_CHECKOUT_URL || "";

const PACKAGES = [
  {
    id: "cover",
    ar: "مصمم الغلاف",
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
    ar: "الميكرو نيتش",
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
    en: "Keywords",
    price: "$2.49",
    periodAr: "شهريًا",
    periodEn: "monthly",
    icon: "🔑",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",
  },
  {
    id: "pro_monthly",
    ar: "Pro شهري",
    en: "Pro Monthly",
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
    ar: "Pro سنوي",
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
   TRANSLATIONS
   ========================================================= */

const TEXT = {
  ar: {
    account: "الحساب",
    accountMenu: "فتح الحساب",
    currentAccess: "الوصول الحالي",
    loading: "جارٍ التحقق...",
    free: "الخطة المجانية",
    lifetime: "وصول مدى الحياة",
    premiumAccess: "وصول Premium",
    plans: "الخطط والباقات",
    showPlans: "عرض الباقات",
    hidePlans: "إخفاء الباقات",
    active: "مفعلة",
    included: "مشمولة",
    buy: "اشترك الآن",
    lifetimeTitle: "Lifetime",
    lifetimeSub: "وصول دائم لجميع الأدوات",
    lifetimePrice: "$125 دفعة واحدة",
    buyLifetime: "شراء Lifetime",
    restore: "تفعيل أو استعادة Lifetime",
    recoveryCode: "رمز الاستعادة",
    securityEmail: "بريد الأمان",
    billing: "إدارة الاشتراك والفواتير",
    close: "إغلاق",
    activateTitle: "تفعيل Lifetime",
    activateDescription:
      "أدخل رمز Lifetime الخاص بك لاستعادة الوصول على هذا الجهاز.",
    codePlaceholder: "AWD-LIFE-XXXX-XXXX-XXXX-XXXX-XXXX",
    activate: "تفعيل الرمز",
    processing: "جارٍ التنفيذ...",
    codeTitle: "رمز الاستعادة الخاص بك",
    codeWarning:
      "احتفظ بهذا الرمز في مكان آمن. من يملك الرمز قد يتمكن من استعادة الوصول.",
    copy: "نسخ الرمز",
    copied: "تم النسخ ✓",
    emailTitle: "حماية Lifetime بالبريد",
    emailDescription:
      "أضف بريدًا إلكترونيًا موثوقًا ليساعدك في حماية واستعادة وصولك.",
    emailPlaceholder: "name@example.com",
    sendCode: "إرسال رمز التحقق",
    otpPlaceholder: "رمز التحقق من 6 أرقام",
    verify: "تأكيد البريد",
    verified: "تم توثيق بريد الأمان بنجاح.",
    genericError: "تعذر تنفيذ العملية. حاول مرة أخرى.",
    badCode: "رمز Lifetime غير صحيح أو غير فعال.",
    activationLimit: "وصل هذا الرمز إلى الحد الأقصى للأجهزة.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    invalidOtp: "أدخل رمز تحقق صحيحًا من 6 أرقام.",
    missingCheckout: "رابط الدفع لهذه الخطة غير مضبوط.",
    copyFailed: "تعذر النسخ تلقائيًا.",
    secure: "دفع آمن",
    oneTime: "مرة واحدة",
    manage: "إدارة",
  },

  en: {
    account: "Account",
    accountMenu: "Open account",
    currentAccess: "Current access",
    loading: "Checking...",
    free: "Free Plan",
    lifetime: "Lifetime Access",
    premiumAccess: "Premium Access",
    plans: "Plans & Packages",
    showPlans: "View plans",
    hidePlans: "Hide plans",
    active: "Active",
    included: "Included",
    buy: "Subscribe",
    lifetimeTitle: "Lifetime",
    lifetimeSub: "Permanent access to all tools",
    lifetimePrice: "$125 one-time",
    buyLifetime: "Buy Lifetime",
    restore: "Activate or restore Lifetime",
    recoveryCode: "Recovery code",
    securityEmail: "Security email",
    billing: "Manage subscription & billing",
    close: "Close",
    activateTitle: "Activate Lifetime",
    activateDescription:
      "Enter your Lifetime code to restore access on this device.",
    codePlaceholder: "AWD-LIFE-XXXX-XXXX-XXXX-XXXX-XXXX",
    activate: "Activate code",
    processing: "Processing...",
    codeTitle: "Your recovery code",
    codeWarning:
      "Store this code somewhere safe. Anyone with this code may be able to restore access.",
    copy: "Copy code",
    copied: "Copied ✓",
    emailTitle: "Protect Lifetime with email",
    emailDescription:
      "Add a trusted email address to help protect and recover your access.",
    emailPlaceholder: "name@example.com",
    sendCode: "Send verification code",
    otpPlaceholder: "6-digit verification code",
    verify: "Verify email",
    verified: "Security email verified successfully.",
    genericError: "Unable to complete the request. Try again.",
    badCode: "This Lifetime code is invalid or inactive.",
    activationLimit: "This code has reached its device limit.",
    invalidEmail: "Enter a valid email address.",
    invalidOtp: "Enter a valid 6-digit verification code.",
    missingCheckout: "Checkout URL is not configured.",
    copyFailed: "Automatic copy failed.",
    secure: "Secure payment",
    oneTime: "one time",
    manage: "Manage",
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

function getBillingUrl(subscriptions) {
  if (!Array.isArray(subscriptions)) return "";

  return (
    subscriptions.find((item) => item?.customer_portal_url)
      ?.customer_portal_url || ""
  );
}

function getPlanLabel(planId, isEnglish) {
  const plan = PACKAGES.find((item) => item.id === planId);

  if (!plan) return planId;

  return isEnglish ? plan.en : plan.ar;
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AccountMenu() {
  const access = useAccess();

  const [open, setOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const [language, setLanguage] = useState("ar");

  const [dialog, setDialog] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [licenseCode, setLicenseCode] = useState("");

  const [revealedCode, setRevealedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState("email");

  const isEnglish = language === "en";
  const text = isEnglish ? TEXT.en : TEXT.ar;

  const activePlans = Array.isArray(access.plans)
    ? access.plans
    : [];

  const billingUrl = getBillingUrl(access.subscriptions);

  /* =======================================================
     LANGUAGE
     ======================================================= */

  useEffect(() => {
    function detectLanguage(event) {
      const eventLanguage = event?.detail;

      const savedLanguage =
        window.localStorage.getItem("awd_lang");

      if (eventLanguage === "en" || eventLanguage === "ar") {
        setLanguage(eventLanguage);
        return;
      }

      if (savedLanguage === "en" || savedLanguage === "ar") {
        setLanguage(savedLanguage);
        return;
      }

      setLanguage(
        document.documentElement.lang === "en" ? "en" : "ar",
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
     LOCK BODY WHEN PANEL IS OPEN
     ======================================================= */

  useEffect(() => {
    if (!open && !dialog) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open, dialog]);

  /* =======================================================
     ESCAPE
     ======================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (dialog) {
        closeDialog();
      } else {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dialog]);

  /* =======================================================
     ACCESS LABEL
     ======================================================= */

  const currentPlanLabel = access.loading
    ? text.loading
    : access.lifetime
      ? text.lifetime
      : activePlans.length
        ? activePlans
            .map((plan) => getPlanLabel(plan, isEnglish))
            .join(" · ")
        : text.free;

  /* =======================================================
     SESSION
     ======================================================= */

  async function getSession() {
    const session = await access.ensureSession();

    if (!session?.access_token || !session?.user?.id) {
      throw new Error("SESSION_MISSING");
    }

    return session;
  }

  /* =======================================================
     CHECKOUT
     ======================================================= */

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

      window.location.assign(checkout.toString());
    } catch (checkoutError) {
      console.error("Checkout error:", checkoutError);
      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  function buyLifetime() {
    openCheckout({
      id: "lifetime",
      checkoutUrl: LIFETIME_CHECKOUT_URL,
    });
  }

  /* =======================================================
     ACTIVATE LIFETIME
     ======================================================= */

  async function activateCode(event) {
    event.preventDefault();

    const cleanCode = String(licenseCode || "")
      .trim()
      .toUpperCase();

    if (!cleanCode) {
      setError(text.badCode);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      const response = await fetch("/api/license/activate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          code: cleanCode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data?.error === "ACTIVATION_LIMIT_REACHED") {
          setError(text.activationLimit);
        } else {
          setError(text.badCode);
        }

        return;
      }

      setLicenseCode("");
      setDialog("");
      setOpen(false);

      await access.refresh();
    } catch (activationError) {
      console.error(
        "License activation failed:",
        activationError,
      );

      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  /* =======================================================
     RECOVERY CODE
     ======================================================= */

  async function revealCode() {
    setOpen(false);

    setDialog("code");
    setRevealedCode("");
    setCopied(false);
    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      const response = await fetch("/api/license/code", {
        method: "GET",

        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },

        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.code) {
        throw new Error(data?.error || "CODE_FAILED");
      }

      setRevealedCode(data.code);

      if (data.recoveryEmail) {
        setEmail(data.recoveryEmail);
      }
    } catch (codeError) {
      console.error("Recovery code failed:", codeError);
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

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (clipboardError) {
      console.error("Copy failed:", clipboardError);
      setError(text.copyFailed);
    }
  }

  /* =======================================================
     EMAIL SECURITY
     ======================================================= */

  function openEmailSecurity() {
    setOpen(false);
    setDialog("email");

    setEmail(
      access.lifetimeLicense?.recoveryEmail ||
        access.email ||
        "",
    );

    setEmailStep("email");
    setOtp("");
    setError("");
  }

  async function sendEmailCode() {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError(text.invalidEmail);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      const response = await fetch("/api/license/email", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          action: "send",
          email: normalizedEmail,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "SEND_FAILED");
      }

      setEmail(normalizedEmail);
      setEmailStep("otp");
    } catch (emailError) {
      console.error(
        "Security email send failed:",
        emailError,
      );

      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmailCode() {
    const cleanOtp = String(otp || "").trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(text.invalidOtp);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await getSession();

      const response = await fetch("/api/license/email", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          action: "verify",
          email,
          otp: cleanOtp,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "VERIFY_FAILED");
      }

      setEmailStep("verified");
      setOtp("");

      await access.refresh();
    } catch (verifyError) {
      console.error(
        "Security email verification failed:",
        verifyError,
      );

      setError(text.genericError);
    } finally {
      setBusy(false);
    }
  }

  /* =======================================================
     OPEN DIALOGS
     ======================================================= */

  function openRestoreDialog() {
    setOpen(false);
    setDialog("restore");
    setLicenseCode("");
    setError("");
  }

  function closeDialog() {
    setDialog("");
    setError("");
    setBusy(false);
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <>
      <style jsx global>{`
        .awd-account-root,
        .awd-account-root * {
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
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 15px;
          background: #0d1929;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .awd-account-trigger:hover {
          border-color: #ff6b00;
        }

        .awd-account-trigger:active {
          transform: scale(0.96);
        }

        .awd-account-trigger img {
          width: 38px;
          height: 38px;
          display: block;
          object-fit: cover;
          border-radius: 12px;
        }

        /* ===============================================
           BACKDROP
           =============================================== */

        .awd-account-backdrop {
          position: fixed;
          inset: 0;
          z-index: 20000;
          background: rgba(1, 7, 15, 0.7);
          backdrop-filter: blur(5px);
          animation: awdFadeIn 0.18s ease;
        }

        /* ===============================================
           ACCOUNT PANEL
           =============================================== */

        .awd-account-sheet {
          position: fixed;
          z-index: 20010;

          top: 84px;
          inset-inline-end: 18px;

          width: min(400px, calc(100vw - 36px));
          max-height: calc(100dvh - 104px);

          overflow-y: auto;
          overscroll-behavior: contain;

          padding: 18px;

          border: 1px solid #263650;
          border-radius: 24px;

          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(255, 107, 0, 0.12),
              transparent 35%
            ),
            linear-gradient(160deg, #0d1b2f, #091625);

          color: #f4f7fb;

          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.55);

          animation: awdPanelIn 0.22s ease;
        }

        .awd-sheet-handle {
          display: none;
        }

        .awd-account-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
        }

        .awd-account-avatar {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
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
          font-size: 19px;
          font-weight: 900;
        }

        .awd-account-head-copy p {
          margin: 4px 0 0;
          color: #8fa0b8;
          font-size: 12px;
        }

        .awd-account-close {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border: 1px solid #2a3a51;
          border-radius: 12px;
          background: #111f32;
          color: white;
          cursor: pointer;
          font-size: 17px;
        }

        /* ===============================================
           STATUS
           =============================================== */

        .awd-access-card {
          padding: 15px;
          border: 1px solid #263650;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.025);
        }

        .awd-access-label {
          display: block;
          margin-bottom: 7px;
          color: #8292aa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .awd-access-value {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 16px;
          font-weight: 900;
        }

        .awd-access-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #ff6b00;
          box-shadow: 0 0 0 5px rgba(255, 107, 0, 0.1);
        }

        .awd-access-dot.premium {
          background: #21c47b;
          box-shadow: 0 0 0 5px rgba(33, 196, 123, 0.1);
        }

        /* ===============================================
           LIFETIME
           =============================================== */

        .awd-lifetime-card {
          margin-top: 12px;
          padding: 16px;
          border: 1px solid rgba(255, 177, 52, 0.28);
          border-radius: 18px;

          background:
            radial-gradient(
              circle at 85% 0%,
              rgba(255, 180, 50, 0.13),
              transparent 45%
            ),
            #111c2b;
        }

        .awd-lifetime-top {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .awd-lifetime-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex: 0 0 48px;
          border-radius: 15px;
          background: rgba(255, 185, 55, 0.12);
          font-size: 24px;
        }

        .awd-lifetime-copy {
          flex: 1;
          min-width: 0;
        }

        .awd-lifetime-title {
          display: block;
          font-size: 16px;
          font-weight: 900;
        }

        .awd-lifetime-sub {
          display: block;
          margin-top: 3px;
          color: #9aa8ba;
          font-size: 12px;
        }

        .awd-lifetime-price {
          margin-top: 4px;
          color: #ffc25a;
          font-size: 12px;
          font-weight: 900;
        }

        /* ===============================================
           BUTTONS
           =============================================== */

        .awd-account-button {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;

          margin-top: 10px;
          padding: 10px 13px;

          border: 1px solid #283a52;
          border-radius: 14px;

          background: #101e31;
          color: #eef3fb;

          text-align: inherit;
          font-size: 14px;
          font-weight: 800;

          cursor: pointer;
        }

        .awd-account-button:hover {
          border-color: #3a506f;
          background: #13233a;
        }

        .awd-account-button.primary {
          border-color: #ff6b00;
          background: #ff6b00;
          color: white;
        }

        .awd-account-button.gold {
          border-color: rgba(255, 185, 55, 0.35);
          background: rgba(255, 185, 55, 0.09);
          color: #ffd37d;
        }

        .awd-account-button.green {
          border-color: rgba(32, 196, 121, 0.25);
          background: rgba(32, 196, 121, 0.08);
          color: #73e4ad;
        }

        .awd-account-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .awd-button-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .awd-button-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          flex: 0 0 31px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.055);
          font-size: 16px;
        }

        .awd-button-arrow {
          color: #667993;
          font-size: 18px;
        }

        /* ===============================================
           PLANS
           =============================================== */

        .awd-plans-wrap {
          display: grid;
          gap: 8px;
          margin-top: 10px;
          animation: awdFadeIn 0.18s ease;
        }

        .awd-plan-option {
          width: 100%;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;

          padding: 12px;

          border: 1px solid #283950;
          border-radius: 14px;

          background: #0d192a;
          color: #edf3fb;

          text-align: inherit;
          cursor: pointer;
        }

        .awd-plan-option.featured {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.07);
        }

        .awd-plan-option.active {
          border-color: rgba(32, 196, 121, 0.45);
          background: rgba(32, 196, 121, 0.07);
        }

        .awd-plan-option:disabled {
          cursor: default;
        }

        .awd-plan-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #15243a;
          font-size: 19px;
        }

        .awd-plan-name {
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
           ERROR
           =============================================== */

        .awd-account-error {
          margin: 12px 0 0;
          padding: 11px 12px;
          border: 1px solid rgba(255, 91, 91, 0.25);
          border-radius: 12px;
          background: rgba(255, 76, 76, 0.08);
          color: #ff9b9b;
          font-size: 12px;
          line-height: 1.5;
        }

        /* ===============================================
           DIALOG
           =============================================== */

        .awd-dialog-backdrop {
          position: fixed;
          inset: 0;
          z-index: 21000;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(1, 7, 15, 0.82);
          backdrop-filter: blur(7px);
        }

        .awd-dialog {
          width: min(460px, 100%);
          max-height: calc(100dvh - 36px);
          overflow-y: auto;

          padding: 22px;

          border: 1px solid #283950;
          border-radius: 24px;

          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(255, 107, 0, 0.1),
              transparent 35%
            ),
            #0c192b;

          color: #f4f7fb;

          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.6);

          animation: awdDialogIn 0.22s ease;
        }

        .awd-dialog h2 {
          margin: 0;
          font-size: 22px;
          line-height: 1.2;
        }

        .awd-dialog-description {
          margin: 8px 0 18px;
          color: #8fa0b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .awd-dialog-input {
          width: 100%;
          min-height: 50px;
          padding: 11px 13px;
          border: 1px solid #2a3c55;
          border-radius: 13px;
          outline: none;
          background: #091522;
          color: white;
          font-size: 15px;
        }

        .awd-dialog-input:focus {
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.08);
        }

        .awd-code-box {
          padding: 15px;
          border: 1px solid #293b54;
          border-radius: 14px;
          background: #081421;
          color: #ffc56d;
          direction: ltr;
          text-align: center;
          overflow-wrap: anywhere;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.6;
          user-select: all;
        }

        .awd-code-warning {
          margin: 12px 0 0;
          color: #9baabd;
          font-size: 12px;
          line-height: 1.6;
        }

        .awd-success-box {
          padding: 14px;
          border: 1px solid rgba(32, 196, 121, 0.3);
          border-radius: 14px;
          background: rgba(32, 196, 121, 0.08);
          color: #72e5ad;
          font-size: 13px;
          line-height: 1.6;
        }

        .awd-dialog-actions {
          display: grid;
          gap: 9px;
          margin-top: 16px;
        }

        .awd-dialog-primary,
        .awd-dialog-secondary {
          width: 100%;
          min-height: 49px;
          border-radius: 13px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .awd-dialog-primary {
          border: 1px solid #ff6b00;
          background: #ff6b00;
          color: white;
        }

        .awd-dialog-secondary {
          border: 1px solid #2a3c54;
          background: #111f32;
          color: #d9e2ef;
        }

        .awd-dialog-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ===============================================
           MOBILE BOTTOM SHEET
           =============================================== */

        @media (max-width: 620px) {
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

          .awd-account-sheet {
            top: auto;
            bottom: 0;

            inset-inline-start: 0;
            inset-inline-end: 0;

            width: 100%;
            max-width: none;

            max-height: 84dvh;

            padding:
              10px
              16px
              calc(
                18px +
                  env(safe-area-inset-bottom)
              );

            border-inline: 0;
            border-bottom: 0;

            border-radius: 26px 26px 0 0;

            animation: awdSheetUp 0.25s ease;
          }

          .awd-sheet-handle {
            width: 44px;
            height: 5px;
            display: block;
            margin: 2px auto 13px;
            border-radius: 999px;
            background: #3c4b5f;
          }

          .awd-account-head {
            margin-bottom: 13px;
          }

          .awd-account-avatar {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
            border-radius: 14px;
          }

          .awd-lifetime-card {
            padding: 13px;
          }

          .awd-account-button {
            min-height: 46px;
          }

          .awd-dialog-backdrop {
            align-items: end;
            padding: 0;
          }

          .awd-dialog {
            width: 100%;
            max-height: 88dvh;

            padding:
              22px
              17px
              calc(
                20px +
                  env(safe-area-inset-bottom)
              );

            border-inline: 0;
            border-bottom: 0;

            border-radius: 26px 26px 0 0;

            animation: awdSheetUp 0.25s ease;
          }
        }

        /* ===============================================
           ANIMATIONS
           =============================================== */

        @keyframes awdFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes awdPanelIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes awdDialogIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes awdSheetUp {
          from {
            transform: translateY(100%);
          }

          to {
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ===================================================
          ACCOUNT BUTTON
          =================================================== */}

      <div className="awd-account-root">
        <button
          type="button"
          className="awd-account-trigger"
          aria-label={text.accountMenu}
          aria-expanded={open}
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

      {/* ===================================================
          ACCOUNT SHEET
          =================================================== */}

      {open && (
        <>
          <div
            className="awd-account-backdrop"
            onClick={() => setOpen(false)}
          />

          <section
            className="awd-account-sheet"
            role="dialog"
            aria-modal="true"
            dir={isEnglish ? "ltr" : "rtl"}
          >
            <span className="awd-sheet-handle" />

            <header className="awd-account-head">
              <img
                className="awd-account-avatar"
                src="/logov3.png"
                alt="AllWDbook"
              />

              <div className="awd-account-head-copy">
                <h3>{text.account}</h3>

                <p>
                  AllWDbook · KDP Tools
                </p>
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

            {/* ACCESS */}

            <div className="awd-access-card">
              <span className="awd-access-label">
                {text.currentAccess}
              </span>

              <div className="awd-access-value">
                <span
                  className={
                    "awd-access-dot" +
                    (access.lifetime ||
                    activePlans.length
                      ? " premium"
                      : "")
                  }
                />

                <span>
                  {currentPlanLabel}
                </span>
              </div>
            </div>

            {/* LIFETIME */}

            {!access.lifetime && (
              <div className="awd-lifetime-card">
                <div className="awd-lifetime-top">
                  <div className="awd-lifetime-icon">
                    👑
                  </div>

                  <div className="awd-lifetime-copy">
                    <span className="awd-lifetime-title">
                      {text.lifetimeTitle}
                    </span>

                    <span className="awd-lifetime-sub">
                      {text.lifetimeSub}
                    </span>

                    <div className="awd-lifetime-price">
                      {text.lifetimePrice}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="awd-account-button primary"
                  onClick={buyLifetime}
                  disabled={busy}
                >
                  <span className="awd-button-left">
                    <span className="awd-button-icon">
                      ⚡
                    </span>

                    {text.buyLifetime}
                  </span>

                  <span className="awd-button-arrow">
                    ›
                  </span>
                </button>
              </div>
            )}

            {/* PLANS */}

            <button
              type="button"
              className="awd-account-button"
              onClick={() =>
                setShowPlans((current) => !current)
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
                {showPlans ? "⌃" : "⌄"}
              </span>
            </button>

            {showPlans && (
              <div className="awd-plans-wrap">
                {PACKAGES.map((plan) => {
                  const current =
                    access.lifetime ||
                    activePlans.includes(plan.id);

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      disabled={current || busy}
                      onClick={() =>
                        openCheckout(plan)
                      }
                      className={
                        "awd-plan-option" +
                        (plan.featured
                          ? " featured"
                          : "") +
                        (current
                          ? " active"
                          : "")
                      }
                    >
                      <span className="awd-plan-icon">
                        {plan.icon}
                      </span>

                      <span>
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
                        {plan.price}

                        <small>
                          {isEnglish
                            ? plan.periodEn
                            : plan.periodAr}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* RESTORE */}

            <button
              type="button"
              className="awd-account-button"
              onClick={openRestoreDialog}
            >
              <span className="awd-button-left">
                <span className="awd-button-icon">
                  🔑
                </span>

                {text.restore}
              </span>

              <span className="awd-button-arrow">
                ›
              </span>
            </button>

            {/* LIFETIME OWNER */}

            {access.lifetime && (
              <>
                <button
                  type="button"
                  className="awd-account-button green"
                  onClick={revealCode}
                  disabled={busy}
                >
                  <span className="awd-button-left">
                    <span className="awd-button-icon">
                      🛡️
                    </span>

                    {text.recoveryCode}
                  </span>

                  <span className="awd-button-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  className="awd-account-button gold"
                  onClick={openEmailSecurity}
                  disabled={busy}
                >
                  <span className="awd-button-left">
                    <span className="awd-button-icon">
                      ✉️
                    </span>

                    {text.securityEmail}
                  </span>

                  <span className="awd-button-arrow">
                    ›
                  </span>
                </button>
              </>
            )}

            {/* BILLING */}

            {billingUrl && (
              <a
                href={billingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="awd-account-button"
                style={{
                  textDecoration: "none",
                }}
              >
                <span className="awd-button-left">
                  <span className="awd-button-icon">
                    ⚙️
                  </span>

                  {text.billing}
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
        </>
      )}

      {/* ===================================================
          DIALOGS
          =================================================== */}

      {dialog && (
        <div
          className="awd-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <section
            className="awd-dialog"
            role="dialog"
            aria-modal="true"
            dir={isEnglish ? "ltr" : "rtl"}
          >
            {/* RESTORE */}

            {dialog === "restore" && (
              <form onSubmit={activateCode}>
                <h2>
                  🔑 {text.activateTitle}
                </h2>

                <p className="awd-dialog-description">
                  {text.activateDescription}
                </p>

                <input
                  className="awd-dialog-input"
                  dir="ltr"
                  value={licenseCode}
                  placeholder={text.codePlaceholder}
                  autoComplete="off"
                  autoCapitalize="characters"
                  onChange={(event) =>
                    setLicenseCode(event.target.value)
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
                    disabled={busy}
                  >
                    {busy
                      ? text.processing
                      : text.activate}
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

            {/* CODE */}

            {dialog === "code" && (
              <div>
                <h2>
                  🛡️ {text.codeTitle}
                </h2>

                <p className="awd-dialog-description">
                  {text.codeWarning}
                </p>

                {busy ? (
                  <p className="awd-dialog-description">
                    {text.processing}
                  </p>
                ) : revealedCode ? (
                  <>
                    <div className="awd-code-box">
                      {revealedCode}
                    </div>

                    <p className="awd-code-warning">
                      {text.codeWarning}
                    </p>

                    <div className="awd-dialog-actions">
                      <button
                        type="button"
                        className="awd-dialog-primary"
                        onClick={copyCode}
                      >
                        {copied
                          ? text.copied
                          : text.copy}
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

            {dialog === "email" && (
              <div>
                <h2>
                  ✉️ {text.emailTitle}
                </h2>

                <p className="awd-dialog-description">
                  {text.emailDescription}
                </p>

                {emailStep === "email" && (
                  <>
                    <input
                      className="awd-dialog-input"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      placeholder={text.emailPlaceholder}
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                    />

                    <div className="awd-dialog-actions">
                      <button
                        type="button"
                        className="awd-dialog-primary"
                        onClick={sendEmailCode}
                        disabled={busy}
                      >
                        {busy
                          ? text.processing
                          : text.sendCode}
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
                    <input
                      className="awd-dialog-input"
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder={text.otpPlaceholder}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        )
                      }
                    />

                    <div className="awd-dialog-actions">
                      <button
                        type="button"
                        className="awd-dialog-primary"
                        onClick={verifyEmailCode}
                        disabled={busy}
                      >
                        {busy
                          ? text.processing
                          : text.verify}
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
                    <div className="awd-success-box">
                      ✅ {text.verified}
                    </div>

                    <div className="awd-dialog-actions">
                      <button
                        type="button"
                        className="awd-dialog-primary"
                        onClick={closeDialog}
                      >
                        {text.close}
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
    </>
  );
}
