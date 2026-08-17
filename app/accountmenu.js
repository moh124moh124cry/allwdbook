"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
    menu: "فتح قائمة الحساب والباقات",
    status: "حالة الوصول",
    loading: "جارٍ التحقق من الوصول...",
    free: "الخطة المجانية",
    lifetime: "مدى الحياة",
    buyLifetime: "شراء وصول مدى الحياة",
    lifetimePrice: "$125 دفعة واحدة",
    choose: "عرض الباقات",
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
    invalidEmail:
      "أدخل بريدًا إلكترونيًا صحيحًا.",
    invalidOtp:
      "أدخل رمز تحقق صحيحًا من 6 أرقام.",
    checkoutMissing:
      "رابط الدفع لهذه الباقة غير مضبوط بعد.",
    clipboardError:
      "تعذر النسخ تلقائيًا. انسخ الرمز يدويًا.",
  },

  en: {
    menu: "Open account and plans menu",
    status: "Access status",
    loading: "Checking access...",
    free: "Free plan",
    lifetime: "Lifetime",
    buyLifetime: "Buy Lifetime access",
    lifetimePrice: "$125 one-time payment",
    choose: "View plans",
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
    invalidEmail:
      "Enter a valid email address.",
    invalidOtp:
      "Enter a valid 6-digit verification code.",
    checkoutMissing:
      "The checkout URL for this plan is not configured yet.",
    clipboardError:
      "Automatic copy failed. Please copy the code manually.",
  },
};

const STYLES = {
  fullButton: {
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 11,
    fontWeight: 900,
    cursor: "pointer",
  },

  input: {
    width: "100%",
    minHeight: 46,
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    background: "#ffffff",
    color: "#172033",
    fontSize: 15,
    outline: "none",
  },

  primary: {
    width: "100%",
    minHeight: 46,
    marginTop: 12,
    padding: "10px 14px",
    border: 0,
    borderRadius: 10,
    background: "#ff6b00",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  close: {
    width: "100%",
    minHeight: 44,
    marginTop: 14,
    padding: 11,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#4e5c70",
    fontWeight: 800,
    cursor: "pointer",
  },
};

function getBillingUrl(subscriptions) {
  if (!Array.isArray(subscriptions)) {
    return "";
  }

  return (
    subscriptions.find(
      (item) =>
        item?.customer_portal_url,
    )?.customer_portal_url || ""
  );
}

export default function AccountMenu() {
  const menuRef = useRef(null);

  const access = useAccess();

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

  const [
    licenseCode,
    setLicenseCode,
  ] = useState("");

  const [
    revealedCode,
    setRevealedCode,
  ] = useState("");

  const [copied, setCopied] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [
    emailStep,
    setEmailStep,
  ] = useState("email");

  const isEnglish =
    language === "en";

  const text = isEnglish
    ? TEXT.en
    : TEXT.ar;

  const activePlans =
    Array.isArray(access.plans)
      ? access.plans
      : [];

  const billingUrl =
    getBillingUrl(
      access.subscriptions,
    );

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

      let nextLanguage = "ar";

      if (
        eventLanguage === "en" ||
        eventLanguage === "ar"
      ) {
        nextLanguage =
          eventLanguage;
      } else if (
        savedLanguage === "en" ||
        savedLanguage === "ar"
      ) {
        nextLanguage =
          savedLanguage;
      } else if (
        document.documentElement
          .lang === "en" ||
        document.documentElement
          .dir === "ltr"
      ) {
        nextLanguage = "en";
      }

      setLanguage(
        nextLanguage,
      );
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

    window.addEventListener(
      "awd-language-change",
      detectLanguage,
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "awd-language-change",
        detectLanguage,
      );
    };
  }, []);

  useEffect(() => {
    function closeOutside(
      event,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        setOpen(false);
      }
    }

    function closeEscape(
      event,
    ) {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      if (dialog) {
        setDialog("");
        setError("");
      } else {
        setOpen(false);
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

  function closeDialog() {
    setDialog("");
    setError("");
    setBusy(false);
  }

  function planName(
    planId,
  ) {
    const plan =
      PACKAGES.find(
        (item) =>
          item.id === planId,
      );

    if (!plan) {
      return planId;
    }

    return isEnglish
      ? plan.en
      : plan.ar;
  }

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

  async function openCheckout(
    plan,
  ) {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!plan?.checkoutUrl) {
        setError(
          text.checkoutMissing,
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
    return openCheckout({
      id: "lifetime",
      checkoutUrl:
        LIFETIME_CHECKOUT_URL,
    });
  }

  async function activateCode(
    event,
  ) {
    event.preventDefault();

    const cleanCode =
      String(
        licenseCode || "",
      )
        .trim()
        .toUpperCase();

    if (!cleanCode) {
      setError(text.badCode);

      return;
    }

    setBusy(true);
    setError("");

    try {
      const session =
        await getSession();

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

            body: JSON.stringify({
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
            text.limit,
          );
        } else {
          setError(
            text.badCode,
          );
        }

        return;
      }

      setLicenseCode("");
      setDialog("");
      setOpen(false);

      await access.refresh();
    } catch (
      activationError
    ) {
      console.error(
        "License activation failed:",
        activationError,
      );

      setError(
        text.genericError,
      );
    } finally {
      setBusy(false);
    }
  }

  async function revealCode() {
    setOpen(false);
    setDialog("code");
    setRevealedCode("");
    setCopied(false);
    setBusy(true);
    setError("");

    try {
      const session =
        await getSession();

      const response =
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

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        !response.ok ||
        !data?.code
      ) {
        throw new Error(
          data?.error ||
            "CODE_FAILED",
        );
      }

      setRevealedCode(
        data.code,
      );

      if (
        data.recoveryEmail
      ) {
        setEmail(
          data.recoveryEmail,
        );
      }
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
    if (!revealedCode) {
      return;
    }

    try {
      await navigator.clipboard
        .writeText(
          revealedCode,
        );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1500,
      );
    } catch (
      clipboardError
    ) {
      console.error(
        "Clipboard copy failed:",
        clipboardError,
      );

      setError(
        text.clipboardError,
      );
    }
  }

  function openEmailSecurity() {
    setOpen(false);
    setDialog("email");

    setEmail(
      access.lifetimeLicense
        ?.recoveryEmail ||
        access.email ||
        "",
    );

    setEmailStep("email");
    setOtp("");
    setError("");
  }

  async function sendEmailCode() {
    const normalizedEmail =
      String(email || "")
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
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              action: "send",
              email:
                normalizedEmail,
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

      setEmail(
        normalizedEmail,
      );

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
    const cleanOtp =
      String(otp || "").trim();

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
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              action: "verify",
              email,
              otp: cleanOtp,
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

      setEmailStep(
        "verified",
      );

      setOtp("");

      await access.refresh();
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
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => {
            setOpen(
              (current) =>
                !current,
            );

            setError("");
          }}
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

            background:
              "transparent",

            cursor: "pointer",
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
              objectFit: "cover",
            }}
          />
        </button>

        {open && (
          <div
            role="menu"
            aria-label={text.menu}
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
                "min(720px, calc(100dvh - 92px))",

              overflowY: "auto",

              padding: 14,

              borderRadius: 16,

              background:
                "#ffffff",

              color: "#172033",

              border:
                "2px solid #d9e2ef",

              boxShadow:
                "0 22px 60px rgba(0,0,0,.42)",

              direction:
                isEnglish
                  ? "ltr"
                  : "rtl",

              textAlign:
                isEnglish
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
              {access.loading
                ? text.loading
                : access.lifetime
                  ? `♾️ ${text.lifetime}`
                  : activePlans.length
                    ? activePlans
                        .map(
                          planName,
                        )
                        .join(
                          " · ",
                        )
                    : text.free}
            </div>

            {!access.lifetime && (
              <button
                type="button"
                onClick={
                  buyLifetime
                }
                disabled={busy}
                style={{
                  ...STYLES.fullButton,

                  border:
                    "2px solid #d99a20",

                  background:
                    "linear-gradient(135deg,#fff8df,#ffe7a3)",

                  color:
                    "#744700",

                  opacity: busy
                    ? 0.65
                    : 1,
                }}
              >
                ♾️{" "}
                {text.buyLifetime}

                <small
                  style={{
                    display:
                      "block",

                    marginTop: 4,
                  }}
                >
                  {
                    text.lifetimePrice
                  }
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
              aria-expanded={
                showPlans
              }
              style={{
                ...STYLES.fullButton,

                border:
                  "1px solid #2776d2",

                background:
                  "#eaf3ff",

                color:
                  "#1459a6",
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
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "space-between",

                          gap: 10,

                          padding: 11,

                          borderRadius: 10,

                          border:
                            current
                              ? "2px solid #3ea968"
                              : "1px solid #d9e2ef",

                          background:
                            current
                              ? "#eafaf1"
                              : "#f7f9fc",

                          color:
                            "#172033",

                          textAlign:
                            "inherit",

                          cursor:
                            current
                              ? "default"
                              : "pointer",

                          opacity:
                            busy &&
                            !current
                              ? 0.7
                              : 1,
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

                                marginTop:
                                  3,

                                color:
                                  "#16864a",

                                fontWeight:
                                  800,
                              }}
                            >
                              ✓{" "}
                              {access.lifetime
                                ? text.included
                                : text.active}
                            </small>
                          )}
                        </span>

                        <span
                          dir="ltr"
                          style={{
                            flex:
                              "0 0 auto",
                          }}
                        >
                          <strong>
                            {
                              plan.price
                            }
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
                setDialog(
                  "restore",
                );
                setLicenseCode(
                  "",
                );
                setError("");
              }}
              style={{
                ...STYLES.fullButton,

                border:
                  "1px solid #6f56c9",

                background:
                  "#f2efff",

                color:
                  "#4f36a5",
              }}
            >
              🔑 {text.restore}
            </button>

            {access.lifetime && (
              <>
                <button
                  type="button"
                  onClick={
                    revealCode
                  }
                  disabled={busy}
                  style={{
                    ...STYLES.fullButton,

                    border:
                      "1px solid #16864a",

                    background:
                      "#eafaf1",

                    color:
                      "#15733d",
                  }}
                >
                  🛡️{" "}
                  {text.showCode}
                </button>

                <button
                  type="button"
                  onClick={
                    openEmailSecurity
                  }
                  disabled={busy}
                  style={{
                    ...STYLES.fullButton,

                    border:
                      "1px solid #d99a20",

                    background:
                      "#fff8df",

                    color:
                      "#744700",
                  }}
                >
                  ✉️{" "}
                  {
                    text.secureEmail
                  }
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

                  background:
                    "#fff8e8",

                  color:
                    "#8a5700",

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
                role="alert"
                style={{
                  color:
                    "#b6322c",

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
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDialog();
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
            role="dialog"
            aria-modal="true"
            dir={
              isEnglish
                ? "ltr"
                : "rtl"
            }
            style={{
              width:
                "min(470px,100%)",

              maxHeight:
                "calc(100dvh - 32px)",

              overflowY: "auto",

              boxSizing:
                "border-box",

              padding: 22,

              borderRadius: 18,

              background:
                "#ffffff",

              color: "#172033",

              boxShadow:
                "0 24px 70px rgba(0,0,0,.35)",
            }}
          >
            {dialog ===
              "restore" && (
              <form
                onSubmit={
                  activateCode
                }
              >
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  {
                    text.enterCode
                  }
                </h2>

                <input
                  value={
                    licenseCode
                  }
                  onChange={(
                    event,
                  ) =>
                    setLicenseCode(
                      event.target
                        .value,
                    )
                  }
                  placeholder={
                    text.codePlaceholder
                  }
                  autoCapitalize="characters"
                  autoComplete="off"
                  dir="ltr"
                  style={
                    STYLES.input
                  }
                />

                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    ...STYLES.primary,

                    opacity: busy
                      ? 0.65
                      : 1,
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
                  textAlign:
                    "center",
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  {
                    text.codeTitle
                  }
                </h2>

                {busy ? (
                  <p>
                    {
                      text.activating
                    }
                  </p>
                ) : revealedCode ? (
                  <>
                    <code
                      dir="ltr"
                      style={{
                        display:
                          "block",

                        padding: 14,

                        borderRadius: 10,

                        background:
                          "#f1f5f9",

                        overflowWrap:
                          "anywhere",

                        userSelect:
                          "all",
                      }}
                    >
                      {
                        revealedCode
                      }
                    </code>

                    <p
                      style={{
                        color:
                          "#b45309",
                      }}
                    >
                      {
                        text.codeWarning
                      }
                    </p>

                    <button
                      type="button"
                      onClick={
                        copyCode
                      }
                      style={
                        STYLES.primary
                      }
                    >
                      {copied
                        ? text.copied
                        : text.copy}
                    </button>
                  </>
                ) : null}
              </div>
            )}

            {dialog === "email" && (
              <div>
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  {
                    text.emailTitle
                  }
                </h2>

                <p>
                  {
                    text.emailNote
                  }
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
                      autoComplete="email"
                      dir="ltr"
                      style={
                        STYLES.input
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        sendEmailCode
                      }
                      disabled={
                        busy
                      }
                      style={{
                        ...STYLES.primary,

                        opacity:
                          busy
                            ? 0.65
                            : 1,
                      }}
                    >
                      {busy
                        ? text.activating
                        : text.send}
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
                      placeholder={
                        text.otp
                      }
                      dir="ltr"
                      maxLength={6}
                      autoComplete="one-time-code"
                      style={
                        STYLES.input
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        verifyEmailCode
                      }
                      disabled={
                        busy
                      }
                      style={{
                        ...STYLES.primary,

                        opacity:
                          busy
                            ? 0.65
                            : 1,
                      }}
                    >
                      {busy
                        ? text.activating
                        : text.verify}
                    </button>
                  </>
                )}

                {emailStep ===
                  "verified" && (
                  <p
                    style={{
                      color:
                        "#15733d",

                      fontWeight:
                        900,
                    }}
                  >
                    ✅{" "}
                    {
                      text.verified
                    }
                  </p>
                )}
              </div>
            )}

            {error && (
              <p
                role="alert"
                style={{
                  color:
                    "#b6322c",

                  fontWeight: 700,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={
                closeDialog
              }
              style={
                STYLES.close
              }
            >
              {text.close}
            </button>
          </section>
        </div>
      )}
    </>
  );
}