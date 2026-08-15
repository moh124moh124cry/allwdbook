"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { getSupabase } from "../lib/supabase";
import { useAccess } from "../lib/useAccess";

const LIFETIME_CHECKOUT_URL =
  process.env
    .NEXT_PUBLIC_LEMON_LIFETIME_CHECKOUT_URL ||
  "";

const PACKAGES = [
  {
    id: "cover",
    ar: "مصمم الغلاف",
    en: "Cover Designer",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/a40b815f-2b2c-4086-b8b8-3afcd0bf7a4d",
  },
  {
    id: "micro_niche",
    ar: "الميكرو نيتش",
    en: "Micro-Niche",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/c205aef7-1c77-4711-9fba-ee2b9a81153b",
  },
  {
    id: "keywords",
    ar: "الكلمات المفتاحية",
    en: "Keywords",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",
  },
  {
    id: "pro_monthly",
    ar: "Pro شهري",
    en: "Pro Monthly",
    price: "$5.99",
    periodAr: "/ شهر",
    periodEn: "/ month",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/00e64ca6-4e8c-42c2-aa44-e9667d745524",
  },
  {
    id: "pro_yearly",
    ar: "Pro سنوي",
    en: "Pro Yearly",
    price: "$55",
    periodAr: "/ سنة",
    periodEn: "/ year",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/14a4b6b5-553f-4070-bd39-932ba2270aa5",
  },
];

const TEXT = {
  ar: {
    menu: "فتح قائمة الباقات والوصول",
    status: "حالة الوصول",
    free: "الخطة المجانية",
    lifetime: "مدى الحياة",
    buyLifetime: "تفعيل مدى الحياة",
    lifetimePrice: "$125 دفعة واحدة",
    choose: "اختر باقتك",
    restore: "تفعيل أو استعادة الوصول",
    showCode: "عرض رمز الاستعادة",
    secureEmail: "إضافة بريد الأمان",
    manage: "إدارة الاشتراك والفواتير",
    active: "مفعّلة",
    included: "مشمولة",
    enterCode: "أدخل رمز مدى الحياة",
    codePlaceholder:
      "AWD-LIFE-XXXX-XXXX-XXXX-XXXX-XXXX",
    activate: "تفعيل الرمز",
    activating: "جارٍ التنفيذ...",
    codeTitle: "رمز الاستعادة الخاص بك",
    codeWarning:
      "احتفظ به في مكان آمن ولا تشاركه مع أي شخص.",
    copy: "نسخ الرمز",
    copied: "تم النسخ",
    emailTitle: "حماية الوصول بالبريد",
    emailNote:
      "سنرسل رمز تحقق للتأكد أن البريد ملكك.",
    send: "إرسال رمز التحقق",
    otp: "رمز التحقق المكون من 6 أرقام",
    verify: "تأكيد البريد",
    verified:
      "تم توثيق بريد الأمان بنجاح",
    close: "إغلاق",
    genericError:
      "تعذر تنفيذ العملية. حاول مرة أخرى.",
    badCode:
      "الرمز غير صحيح أو غير فعال.",
    limit:
      "وصل الرمز إلى الحد الأقصى للأجهزة.",
    checkoutMissing:
      "رابط شراء مدى الحياة غير موجود.",
  },
  en: {
    menu: "Open plans and access menu",
    status: "Access status",
    free: "Free plan",
    lifetime: "Lifetime",
    buyLifetime: "Activate Lifetime",
    lifetimePrice: "$125 one-time payment",
    choose: "Choose your plan",
    restore: "Activate or restore access",
    showCode: "Show recovery code",
    secureEmail: "Add security email",
    manage:
      "Manage subscription and billing",
    active: "Active",
    included: "Included",
    enterCode:
      "Enter your Lifetime code",
    codePlaceholder:
      "AWD-LIFE-XXXX-XXXX-XXXX-XXXX-XXXX",
    activate: "Activate code",
    activating: "Processing...",
    codeTitle: "Your recovery code",
    codeWarning:
      "Keep it private and store it somewhere safe.",
    copy: "Copy code",
    copied: "Copied",
    emailTitle:
      "Protect access with email",
    emailNote:
      "We will send a verification code to confirm ownership.",
    send: "Send verification code",
    otp: "6-digit verification code",
    verify: "Verify email",
    verified:
      "Security email verified successfully",
    close: "Close",
    genericError:
      "Unable to complete the request. Try again.",
    badCode:
      "This code is invalid or inactive.",
    limit:
      "This code has reached its device limit.",
    checkoutMissing:
      "The Lifetime checkout URL is missing.",
  },
};

const fullButton = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 11,
  fontWeight: 900,
};

export default function AccountMenu() {
  const menuRef = useRef(null);
  const access = useAccess();

  const [open, setOpen] =
    useState(false);

  const [showPlans, setShowPlans] =
    useState(false);

  const [language, setLanguage] =
    useState("ar");

  const [session, setSession] =
    useState(null);

  const [dialog, setDialog] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [licenseCode, setLicenseCode] =
    useState("");

  const [revealedCode, setRevealedCode] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [emailStep, setEmailStep] =
    useState("email");

  const isEnglish =
    language === "en";

  const text = isEnglish
    ? TEXT.en
    : TEXT.ar;

  const activePlans =
    Array.isArray(access.plans)
      ? access.plans
      : [];

  const subscriptions =
    Array.isArray(access.subscriptions)
      ? access.subscriptions
      : [];

  const billingUrl =
    subscriptions.find(
      (item) =>
        item.customer_portal_url,
    )?.customer_portal_url || "";

  useEffect(() => {
    function detectLanguage() {
      const nextLanguage =
        document.documentElement.lang ===
          "en" ||
        document.documentElement.dir ===
          "ltr"
          ? "en"
          : "ar";

      setLanguage(nextLanguage);
    }

    detectLanguage();

    const observer =
      new MutationObserver(
        detectLanguage,
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "dir",
          "lang",
        ],
      },
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();

    async function initialize() {
      let {
        data: {
          session: currentSession,
        },
      } =
        await supabase.auth.getSession();

      if (!currentSession) {
        const {
          data,
          error: signInError,
        } =
          await supabase.auth.signInAnonymously();

        if (signInError) {
          throw signInError;
        }

        currentSession =
          data?.session || null;
      }

      if (mounted) {
        setSession(currentSession);
      }
    }

    initialize().catch(
      (sessionError) => {
        console.error(
          "Account session error:",
          sessionError,
        );
      },
    );

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (mounted) {
            setSession(
              nextSession || null,
            );
          }
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function closeOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        setOpen(false);
      }
    }

    function closeEscape(event) {
      if (event.key === "Escape") {
        if (dialog) {
          setDialog("");
        } else {
          setOpen(false);
        }
      }
    }

    document.addEventListener(
      "pointerdown",
      closeOutside,
    );

    document.addEventListener(
      "keydown",
      closeEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      );

      document.removeEventListener(
        "keydown",
        closeEscape,
      );
    };
  }, [dialog]);

  async function getSession() {
    if (session) {
      return session;
    }

    const supabase = getSupabase();

    const {
      data,
      error: signInError,
    } =
      await supabase.auth.signInAnonymously();

    if (signInError) {
      throw signInError;
    }

    const currentSession =
      data?.session || null;

    setSession(currentSession);

    return currentSession;
  }

  async function openCheckout(plan) {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const userId =
        currentSession?.user?.id;

      if (!userId) {
        throw new Error(
          "NO_GUEST_SESSION",
        );
      }

      if (!plan.checkoutUrl) {
        setError(
          text.checkoutMissing,
        );

        return;
      }

      const checkout = new URL(
        plan.checkoutUrl,
      );

      checkout.searchParams.set(
        "checkout[custom][user_id]",
        userId,
      );

      checkout.searchParams.set(
        "checkout[custom][plan_id]",
        plan.id,
      );

      if (
        currentSession.user?.email
      ) {
        checkout.searchParams.set(
          "checkout[email]",
          currentSession.user.email,
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
    return openCheckout({
      id: "lifetime",
      checkoutUrl:
        LIFETIME_CHECKOUT_URL,
    });
  }

  async function activateCode(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/activate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          body: JSON.stringify({
            code: licenseCode,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          data.error ===
          "ACTIVATION_LIMIT_REACHED"
        ) {
          throw new Error("LIMIT");
        }

        throw new Error("BAD_CODE");
      }

      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );

      window.location.reload();
    } catch (activationError) {
      setError(
        activationError.message ===
          "LIMIT"
          ? text.limit
          : text.badCode,
      );
    } finally {
      setBusy(false);
    }
  }

  async function revealCode() {
    setDialog("code");
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/code",
        {
          headers: {
            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "CODE_FAILED",
        );
      }

      setRevealedCode(
        data.code || "",
      );

      setEmail(
        data.recoveryEmail || "",
      );
    } catch (codeError) {
      console.error(
        "License reveal failed:",
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
    await navigator.clipboard.writeText(
      revealedCode,
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function openEmailSecurity() {
    setDialog("email");

    setEmail(
      access.lifetimeLicense
        ?.recoveryEmail || "",
    );

    setEmailStep("email");
    setOtp("");
    setError("");
  }

  async function sendEmailCode() {
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          body: JSON.stringify({
            action: "send",
            email,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "SEND_FAILED",
        );
      }

      setEmailStep("otp");
    } catch (emailError) {
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
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          body: JSON.stringify({
            action: "verify",
            email,
            otp,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "VERIFY_FAILED",
        );
      }

      setEmailStep("verified");

      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );
    } catch (verifyError) {
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

  function planName(planId) {
    const plan = PACKAGES.find(
      (item) =>
        item.id === planId,
    );

    return plan
      ? isEnglish
        ? plan.en
        : plan.ar
      : planId;
  }

  return (
    <>
      <div
        ref={menuRef}
        style={{
          position: "relative",
          flex: "0 0 auto",
          zIndex: 10020,
        }}
      >
        <button
          type="button"
          aria-label={text.menu}
          onClick={() =>
            setOpen(
              (current) => !current,
            )
          }
          style={{
            width: 50,
            height: 50,
            padding: 2,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",

            border: open
              ? "2px solid #f59e0b"
              : "2px solid transparent",

            background: "transparent",
          }}
        >
          <img
            src="/logov3.png"
            alt="AllWDbook"
            width="44"
            height="44"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
            }}
          />
        </button>

        {open && (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: 58,

              right: isEnglish
                ? "auto"
                : 0,

              left: isEnglish
                ? 0
                : "auto",

              width:
                "min(370px, calc(100vw - 24px))",

              maxHeight:
                "min(720px, calc(100vh - 92px))",

              overflowY: "auto",
              padding: 14,
              borderRadius: 16,
              background: "#ffffff",
              color: "#172033",

              border:
                "2px solid #d9e2ef",

              boxShadow:
                "0 22px 60px rgba(0,0,0,.42)",

              direction: isEnglish
                ? "ltr"
                : "rtl",

              textAlign: isEnglish
                ? "left"
                : "right",
            }}
          >
            <div
              style={{
                fontWeight: 900,
              }}
            >
              {text.status}
            </div>

            <div
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 10,

                background:
                  access.lifetime
                    ? "#eafaf1"
                    : "#f2f4f7",

                color:
                  access.lifetime
                    ? "#15733d"
                    : "#4e5c70",

                fontWeight: 900,
              }}
            >
              {access.lifetime
                ? `♾️ ${text.lifetime}`
                : activePlans.length
                  ? activePlans
                      .map(planName)
                      .join(" · ")
                  : text.free}
            </div>

            {!access.lifetime && (
              <button
                type="button"
                onClick={buyLifetime}
                disabled={busy}
                style={{
                  ...fullButton,

                  border:
                    "2px solid #d99a20",

                  background:
                    "linear-gradient(135deg,#fff8df,#ffe7a3)",

                  color: "#744700",
                }}
              >
                ♾️ {text.buyLifetime}

                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  {text.lifetimePrice}
                </small>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                setShowPlans(
                  (current) =>
                    !current,
                )
              }
              style={{
                ...fullButton,
                border:
                  "1px solid #2776d2",
                background: "#eaf3ff",
                color: "#1459a6",
              }}
            >
              🧾 {text.choose}
            </button>

            {showPlans && (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {PACKAGES.map(
                  (plan) => {
                    const current =
                      access.lifetime ||
                      activePlans.includes(
                        plan.id,
                      );

                    return (
                      <button
                        key={plan.id}
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
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          gap: 10,
                          padding: 11,
                          borderRadius: 10,

                          border: current
                            ? "2px solid #3ea968"
                            : "1px solid #d9e2ef",

                                "وصل الرمز إلى الحد الأقصى للأجهزة.",
    checkoutMissing:
      "رابط شراء مدى الحياة غير موجود.",
  },
  en: {
    menu: "Open plans and access menu",
    status: "Access status",
    free: "Free plan",
    lifetime: "Lifetime",
    buyLifetime: "Activate Lifetime",
    lifetimePrice: "$125 one-time payment",
    choose: "Choose your plan",
    restore: "Activate or restore access",
    showCode: "Show recovery code",
    secureEmail: "Add security email",
    manage:
      "Manage subscription and billing",
    active: "Active",
    included: "Included",
    enterCode:
      "Enter your Lifetime code",
    codePlaceholder:
      "AWD-LIFE-XXXX-XXXX-XXXX-XXXX-XXXX",
    activate: "Activate code",
    activating: "Processing...",
    codeTitle: "Your recovery code",
    codeWarning:
      "Keep it private and store it somewhere safe.",
    copy: "Copy code",
    copied: "Copied",
    emailTitle:
      "Protect access with email",
    emailNote:
      "We will send a verification code to confirm ownership.",
    send: "Send verification code",
    otp: "6-digit verification code",
    verify: "Verify email",
    verified:
      "Security email verified successfully",
    close: "Close",
    genericError:
      "Unable to complete the request. Try again.",
    badCode:
      "This code is invalid or inactive.",
    limit:
      "This code has reached its device limit.",
    checkoutMissing:
      "The Lifetime checkout URL is missing.",
  },
};

const fullButton = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 11,
  fontWeight: 900,
};

export default function AccountMenu() {
  const menuRef = useRef(null);
  const access = useAccess();

  const [open, setOpen] =
    useState(false);

  const [showPlans, setShowPlans] =
    useState(false);

  const [language, setLanguage] =
    useState("ar");

  const [session, setSession] =
    useState(null);

  const [dialog, setDialog] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [licenseCode, setLicenseCode] =
    useState("");

  const [revealedCode, setRevealedCode] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [emailStep, setEmailStep] =
    useState("email");

  const isEnglish =
    language === "en";

  const text = isEnglish
    ? TEXT.en
    : TEXT.ar;

  const activePlans =
    Array.isArray(access.plans)
      ? access.plans
      : [];

  const subscriptions =
    Array.isArray(access.subscriptions)
      ? access.subscriptions
      : [];

  const billingUrl =
    subscriptions.find(
      (item) =>
        item.customer_portal_url,
    )?.customer_portal_url || "";

  useEffect(() => {
    function detectLanguage() {
      const nextLanguage =
        document.documentElement.lang ===
          "en" ||
        document.documentElement.dir ===
          "ltr"
          ? "en"
          : "ar";

      setLanguage(nextLanguage);
    }

    detectLanguage();

    const observer =
      new MutationObserver(
        detectLanguage,
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "dir",
          "lang",
        ],
      },
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();

    async function initialize() {
      let {
        data: {
          session: currentSession,
        },
      } =
        await supabase.auth.getSession();

      if (!currentSession) {
        const {
          data,
          error: signInError,
        } =
          await supabase.auth.signInAnonymously();

        if (signInError) {
          throw signInError;
        }

        currentSession =
          data?.session || null;
      }

      if (mounted) {
        setSession(currentSession);
      }
    }

    initialize().catch(
      (sessionError) => {
        console.error(
          "Account session error:",
          sessionError,
        );
      },
    );

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (mounted) {
            setSession(
              nextSession || null,
            );
          }
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function closeOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        setOpen(false);
      }
    }

    function closeEscape(event) {
      if (event.key === "Escape") {
        if (dialog) {
          setDialog("");
        } else {
          setOpen(false);
        }
      }
    }

    document.addEventListener(
      "pointerdown",
      closeOutside,
    );

    document.addEventListener(
      "keydown",
      closeEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      );

      document.removeEventListener(
        "keydown",
        closeEscape,
      );
    };
  }, [dialog]);

  async function getSession() {
    if (session) {
      return session;
    }

    const supabase = getSupabase();

    const {
      data,
      error: signInError,
    } =
      await supabase.auth.signInAnonymously();

    if (signInError) {
      throw signInError;
    }

    const currentSession =
      data?.session || null;

    setSession(currentSession);

    return currentSession;
  }

  async function openCheckout(plan) {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const userId =
        currentSession?.user?.id;

      if (!userId) {
        throw new Error(
          "NO_GUEST_SESSION",
        );
      }

      if (!plan.checkoutUrl) {
        setError(
          text.checkoutMissing,
        );

        return;
      }

      const checkout = new URL(
        plan.checkoutUrl,
      );

      checkout.searchParams.set(
        "checkout[custom][user_id]",
        userId,
      );

      checkout.searchParams.set(
        "checkout[custom][plan_id]",
        plan.id,
      );

      if (
        currentSession.user?.email
      ) {
        checkout.searchParams.set(
          "checkout[email]",
          currentSession.user.email,
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
    return openCheckout({
      id: "lifetime",
      checkoutUrl:
        LIFETIME_CHECKOUT_URL,
    });
  }

  async function activateCode(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/activate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          body: JSON.stringify({
            code: licenseCode,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          data.error ===
          "ACTIVATION_LIMIT_REACHED"
        ) {
          throw new Error("LIMIT");
        }

        throw new Error("BAD_CODE");
      }

      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );

      window.location.reload();
    } catch (activationError) {
      setError(
        activationError.message ===
          "LIMIT"
          ? text.limit
          : text.badCode,
      );
    } finally {
      setBusy(false);
    }
  }

  async function revealCode() {
    setDialog("code");
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/code",
        {
          headers: {
            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          cache: "no-store",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "CODE_FAILED",
        );
      }

      setRevealedCode(
        data.code || "",
      );

      setEmail(
        data.recoveryEmail || "",
      );
    } catch (codeError) {
      console.error(
        "License reveal failed:",
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
    await navigator.clipboard.writeText(
      revealedCode,
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function openEmailSecurity() {
    setDialog("email");

    setEmail(
      access.lifetimeLicense
        ?.recoveryEmail || "",
    );

    setEmailStep("email");
    setOtp("");
    setError("");
  }

  async function sendEmailCode() {
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          body: JSON.stringify({
            action: "send",
            email,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "SEND_FAILED",
        );
      }

      setEmailStep("otp");
    } catch (emailError) {
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
    setBusy(true);
    setError("");

    try {
      const currentSession =
        await getSession();

      const response = await fetch(
        "/api/license/email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${currentSession.access_token}`,
          },

          body: JSON.stringify({
            action: "verify",
            email,
            otp,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "VERIFY_FAILED",
        );
      }

      setEmailStep("verified");

      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );
    } catch (verifyError) {
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

  function planName(planId) {
    const plan = PACKAGES.find(
      (item) =>
        item.id === planId,
    );

    return plan
      ? isEnglish
        ? plan.en
        : plan.ar
      : planId;
  }

  return (
    <>
      <div
        ref={menuRef}
        style={{
          position: "relative",
          flex: "0 0 auto",
          zIndex: 10020,
        }}
      >
        <button
          type="button"
          aria-label={text.menu}
          onClick={() =>
            setOpen(
              (current) => !current,
            )
          }
          style={{
            width: 50,
            height: 50,
            padding: 2,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",

            border: open
              ? "2px solid #f59e0b"
              : "2px solid transparent",

            background: "transparent",
          }}
        >
          <img
            src="/logov3.png"
            alt="AllWDbook"
            width="44"
            height="44"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
            }}
          />
        </button>

        {open && (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: 58,

              right: isEnglish
                ? "auto"
                : 0,

              left: isEnglish
                ? 0
                : "auto",

              width:
                "min(370px, calc(100vw - 24px))",

              maxHeight:
                "min(720px, calc(100vh - 92px))",

              overflowY: "auto",
              padding: 14,
              borderRadius: 16,
              background: "#ffffff",
              color: "#172033",

              border:
                "2px solid #d9e2ef",

              boxShadow:
                "0 22px 60px rgba(0,0,0,.42)",

              direction: isEnglish
                ? "ltr"
                : "rtl",

              textAlign: isEnglish
                ? "left"
                : "right",
            }}
          >
            <div
              style={{
                fontWeight: 900,
              }}
            >
              {text.status}
            </div>

            <div
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 10,

                background:
                  access.lifetime
                    ? "#eafaf1"
                    : "#f2f4f7",

                color:
                  access.lifetime
                    ? "#15733d"
                    : "#4e5c70",

                fontWeight: 900,
              }}
            >
              {access.lifetime
                ? `♾️ ${text.lifetime}`
                : activePlans.length
                  ? activePlans
                      .map(planName)
                      .join(" · ")
                  : text.free}
            </div>

            {!access.lifetime && (
              <button
                type="button"
                onClick={buyLifetime}
                disabled={busy}
                style={{
                  ...fullButton,

                  border:
                    "2px solid #d99a20",

                  background:
                    "linear-gradient(135deg,#fff8df,#ffe7a3)",

                  color: "#744700",
                }}
              >
                ♾️ {text.buyLifetime}

                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  {text.lifetimePrice}
                </small>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                setShowPlans(
                  (current) =>
                    !current,
                )
              }
              style={{
                ...fullButton,
                border:
                  "1px solid #2776d2",
                background: "#eaf3ff",
                color: "#1459a6",
              }}
            >
              🧾 {text.choose}
            </button>

            {showPlans && (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {PACKAGES.map(
                  (plan) => {
                    const current =
                      access.lifetime ||
                      activePlans.includes(
                        plan.id,
                      );

                    return (
                      <button
                        key={plan.id}
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
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          gap: 10,
                          padding: 11,
                          borderRadius: 10,

                          border: current
                            ? "2px solid #3ea968"
                            : "1px solid #d9e2ef",

                          background:
                            current
                              ? "#eafaf1"
                              : "#f7f9fc",

                          color:
                            "#172033",
                        }}
                      >
                        <span>
                          <strong>
                            {isEnglish
                              ? plan.en
                              : plan.ar}
                          </strong>

                          {current && (
                            <small
                              style={{
                                display:
                                  "block",

                                color:
                                  "#16864a",
                              }}
                            >
                              ✓{" "}
                              {access.lifetime
                                ? text.included
                                : text.active}
                            </small>
                          )}
                        </span>

                        <span dir="ltr">
                          <strong>
                            {plan.price}
                          </strong>{" "}
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

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDialog("restore");
                setError("");
              }}
              style={{
                ...fullButton,
                border:
                  "1px solid #6f56c9",
                background: "#f2efff",
                color: "#4f36a5",
              }}
            >
              🔑 {text.restore}
            </button>

            {access.lifetime && (
              <>
                <button
                  type="button"
                  onClick={revealCode}
                  style={{
                    ...fullButton,

                    border:
                      "1px solid #16864a",

                    background:
                      "#eafaf1",

                    color: "#15733d",
                  }}
                >
                  🛡️ {text.showCode}
                </button>

                <button
                  type="button"
                  onClick={
                    openEmailSecurity
                  }
                  style={{
                    ...fullButton,

                    border:
                      "1px solid #d99a20",

                    background:
                      "#fff8df",

                    color: "#744700",
                  }}
                >
                  ✉️ {text.secureEmail}
                </button>
              </>
            )}

            {billingUrl && (
              <a
                href={billingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: 10,
                  padding: 11,
                  borderRadius: 10,
                  background: "#fff8e8",
                  color: "#8a5700",

                  textAlign:
                    "center",

                  textDecoration:
                    "none",

                  fontWeight: 900,
                }}
              >
                ⚙️ {text.manage}
              </a>
            )}

            {error && (
              <p
                style={{
                  color: "#b6322c",
                  fontWeight: 700,
                }}
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {dialog && (
        <div
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDialog("");
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 25000,
            display: "grid",
            placeItems: "center",
            padding: 16,

            background:
              "rgba(3,10,22,.82)",
          }}
        >
          <section
            dir={
              isEnglish
                ? "ltr"
                : "rtl"
            }
            style={{
              width:
                "min(470px,100%)",

              boxSizing:
                "border-box",

              padding: 22,
              borderRadius: 18,
              background: "#ffffff",
              color: "#172033",
            }}
          >
            {dialog === "restore" && (
              <form
                onSubmit={
                  activateCode
                }
              >
                <h2>
                  {text.enterCode}
                </h2>

                <input
                  value={licenseCode}
                  onChange={(event) =>
                    setLicenseCode(
                      event.target
                        .value,
                    )
                  }
                  placeholder={
                    text.codePlaceholder
                  }
                  autoCapitalize="characters"
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                  }}
                />

                <button
                  className="go"
                  type="submit"
                  disabled={busy}
                  style={{
                    width: "100%",
                    marginTop: 12,
                  }}
                >
                  {busy
                    ? text.activating
                    : text.activate}
                </button>
              </form>
            )}

            {dialog === "code" && (
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <h2>
                  {text.codeTitle}
                </h2>

                {busy ? (
                  <p>
                    {text.activating}
                  </p>
                ) : (
                  <>
                    <code
                      dir="ltr"
                      style={{
                        display: "block",
                        padding: 14,
                        borderRadius: 10,

                        background:
                          "#f1f5f9",

                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {revealedCode}
                    </code>

                    <p
                      style={{
                        color:
                          "#b45309",
                      }}
                    >
                      {text.codeWarning}
                    </p>

                    <button
                      className="go"
                      type="button"
                      onClick={copyCode}
                    >
                      {copied
                        ? text.copied
                        : text.copy}
                    </button>
                  </>
                )}
              </div>
            )}

            {dialog === "email" && (
              <div>
                <h2>
                  {text.emailTitle}
                </h2>

                <p>
                  {text.emailNote}
                </p>

                {emailStep ===
                  "email" && (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(
                        event,
                      ) =>
                        setEmail(
                          event.target
                            .value,
                        )
                      }
                      placeholder="name@example.com"
                      dir="ltr"
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                      }}
                    />

                    <button
                      className="go"
                      type="button"
                      onClick={
                        sendEmailCode
                      }
                      disabled={busy}
                      style={{
                        width: "100%",
                        marginTop: 12,
                      }}
                    >
                      {text.send}
                    </button>
                  </>
                )}

                {emailStep ===
                  "otp" && (
                  <>
                    <input
                      inputMode="numeric"
                      value={otp}
                      onChange={(
                        event,
                      ) =>
                        setOtp(
                          event.target
                            .value,
                        )
                      }
                      placeholder={
                        text.otp
                      }
                      dir="ltr"
                      maxLength={6}
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                      }}
                    />

                    <button
                      className="go"
                      type="button"
                      onClick={
                        verifyEmailCode
                      }
                      disabled={busy}
                      style={{
                        width: "100%",
                        marginTop: 12,
                      }}
                    >
                      {text.verify}
                    </button>
                  </>
                )}

                {emailStep ===
                  "verified" && (
                  <p
                    style={{
                      color:
                        "#15733d",

                      fontWeight: 900,
                    }}
                  >
                    ✅ {text.verified}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p
                style={{
                  color: "#b6322c",
                  fontWeight: 700,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                setDialog("")
              }
              style={{
                width: "100%",
                marginTop: 14,
                padding: 11,
                borderRadius: 10,

                border:
                  "1px solid #cbd5e1",

                background: "#ffffff",
                color: "#4e5c70",
                fontWeight: 800,
              }}
            >
              {text.close}
            </button>
          </section>
        </div>
      )}
    </>
  );
}                       "1px solid #ccd4df",

                          color:
                            "#4e5c70",

                          fontSize: 12,
                          fontWeight:
                            800,
                        }}
                      >
                        {
                          text.freePlan
                        }
                      </span>
                    )}
                  </div>

                  {access.billingUrl && (
                    <a
                      href={
                        access.billingUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display:
                          "block",

                        marginTop: 10,

                        padding:
                          "9px 10px",

                        borderRadius:
                          9,

                        background:
                          "#fff8e8",

                        border:
                          "1px solid #e4b34f",

                        color:
                          "#8a5700",

                        textAlign:
                          "center",

                        textDecoration:
                          "none",

                        fontSize: 13,

                        fontWeight:
                          900,
                      }}
                    >
                      ⚙️{" "}
                      {text.manage}
                    </a>
                  )}
                </div>
              )}
          </div>

          <div
            style={{
              padding:
                "14px 4px 8px",

              color:
                "#172033",

              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {text.plans}
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {PACKAGES.map(
              (plan) => {
                const current =
                  access.lifetime ||
                  activePlans.includes(
                    plan.id
                  );

                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      choosePlan(
                        plan
                      )
                    }
                    disabled={
                      current
                    }
                    style={{
                      minHeight: 56,

                      display: "flex",
                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap: 12,
                      width: "100%",

                      padding:
                        "10px 12px",

                      borderRadius:
                        11,

                      border: current
                        ? "2px solid #3ea968"
                        : plan.featured
                          ? "2px solid #22a95f"
                          : "1px solid #d9e2ef",

                      background:
                        current
                          ? "#eafaf1"
                          : plan.featured
                            ? "#effbf3"
                            : "#f7f9fc",

                      color:
                        "#172033",

                      direction:
                        isEnglish
                          ? "ltr"
                          : "rtl",

                      textAlign:
                        isEnglish
                          ? "left"
                          : "right",

                      cursor: current
                        ? "default"
                        : "pointer",

                      opacity: current
                        ? 0.88
                        : 1,
                    }}
                  >
                    <span>
                      <strong
                        style={{
                          display:
                            "block",

                          color:
                            "#172033",

                          fontSize:
                            14,
                        }}
                      >
                        {isEnglish
                          ? plan.en
                          : plan.ar}
                      </strong>

                      {current ? (
                        <small
                          style={{
                            display:
                              "block",

                            marginTop:
                              3,

                            color:
                              "#16864a",

                            fontSize:
                              12,

                            fontWeight:
                              800,
                          }}
                        >
                          ✓{" "}
                          {access.lifetime
                            ? text.included
                            : text.current}
                        </small>
                      ) : plan.featured ? (
                        <small
                          style={{
                            display:
                              "block",

                            marginTop:
                              3,

                            color:
                              "#16864a",

                            fontSize:
                              12,

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            text.featured
                          }
                        </small>
                      ) : null}
                    </span>

                    <span
                      style={{
                        flex:
                          "0 0 auto",

                        direction:
                          "ltr",

                        color:
                          "#c96b08",
                      }}
                    >
                      <strong>
                        {plan.price}
                      </strong>

                      <small
                        style={{
                          color:
                            "#65738a",

                          marginLeft:
                            3,
                        }}
                      >
                        {isEnglish
                          ? plan.periodEn
                          : plan.periodAr}
                      </small>
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,

              borderTop:
                "1px solid #d9e2ef",
            }}
          >
            {isGuest ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);

                  router.push(
                    "/login"
                  );
                }}
                style={{
                  width: "100%",
                  minHeight: 48,

                  border:
                    "1px solid #2776d2",

                  borderRadius: 10,

                  background:
                    "#eaf3ff",

                  color:
                    "#1459a6",

                  fontWeight: 900,
                }}
              >
                {text.existing}
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                disabled={busy}
                style={{
                  width: "100%",
                  minHeight: 48,

                  border:
                    "1px solid #d9574f",

                  borderRadius: 10,

                  background:
                    "#fff0ef",

                  color:
                    "#b6322c",

                  fontWeight: 900,
                }}
              >
                {busy
                  ? text.signingOut
                  : text.signOut}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
