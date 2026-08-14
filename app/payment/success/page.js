"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getSupabase,
} from "../../../lib/supabase";

const PLAN_NAMES = {
  cover: {
    ar: "مصمم الغلاف",
    en: "Cover Designer",
  },

  micro_niche: {
    ar: "الميكرو نيتش",
    en: "Micro-Niche",
  },

  keywords: {
    ar: "الكلمات المفتاحية",
    en: "Keywords",
  },

  pro_monthly: {
    ar: "Pro الشهري",
    en: "Pro Monthly",
  },

  pro_yearly: {
    ar: "Pro السنوي",
    en: "Pro Yearly",
  },
};

const TEXT = {
  ar: {
    title:
      "شكراً لاشتراكك",

    checking:
      "نتحقق الآن من الدفع ونفعّل باقتك تلقائياً...",

    ready:
      "تم تفعيل اشتراكك بنجاح",

    pending:
      "تم استلام العملية، لكن التفعيل ما زال قيد المعالجة.",

    pendingNote:
      "انتظر دقيقة ثم اضغط إعادة التحقق. إذا استمرت المشكلة تواصل معنا وأرفق بريد الشراء.",

    login:
      "سجّل الدخول بالبريد الذي استخدمته عند الاشتراك لإظهار باقتك.",

    error:
      "تعذر التحقق من الاشتراك حالياً. لم يتم فقدان عملية الدفع.",

    plans:
      "الباقة المفعّلة",

    home:
      "العودة إلى الأدوات",

    retry:
      "إعادة التحقق",

    signIn:
      "تسجيل الدخول",

    billing:
      "إدارة الاشتراك والفواتير",

    contact:
      "التواصل مع الدعم",
  },

  en: {
    title:
      "Thank you for subscribing",

    checking:
      "We are verifying your payment and activating your plan...",

    ready:
      "Your subscription is active",

    pending:
      "Your payment was received, but activation is still processing.",

    pendingNote:
      "Wait a minute, then check again. If the issue continues, contact us and include the purchase email.",

    login:
      "Sign in with the email used for the subscription to view your plan.",

    error:
      "We could not verify the subscription yet. Your payment has not been lost.",

    plans:
      "Active plan",

    home:
      "Return to tools",

    retry:
      "Check again",

    signIn:
      "Sign in",

    billing:
      "Manage subscription and billing",

    contact:
      "Contact support",
  },
};

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
  ] = useState("checking");

  const [
    access,
    setAccess,
  ] = useState(null);

  const [
    attempt,
    setAttempt,
  ] = useState(0);

  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "awd_lang"
        );

      const detected =
        saved === "en" ||
        document.documentElement
          .dir === "ltr"
          ? "en"
          : "ar";

      setLanguage(detected);

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

  useEffect(() => {
    checkAccess(0);

    return () => {
      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  async function checkAccess(
    currentAttempt = 0
  ) {
    if (timerRef.current) {
      clearTimeout(
        timerRef.current
      );
    }

    setStatus("checking");
    setAttempt(currentAttempt);

    try {
      const supabase =
        getSupabase();

      const {
        data: { session },
      } =
        await supabase.auth
          .getSession();

      if (
        !session?.access_token ||
        !session?.user?.email
      ) {
        setStatus("login");
        return;
      }

      const response =
        await fetch(
          "/api/access",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.ok
      ) {
        throw new Error(
          data?.error ||
            "ACCESS_CHECK_FAILED"
        );
      }

      setAccess(data);

      if (
        data.paid ||
        data.lifetime
      ) {
        setStatus("ready");
        return;
      }

      if (
        currentAttempt < 10
      ) {
        timerRef.current =
          setTimeout(() => {
            checkAccess(
              currentAttempt + 1
            );
          }, 3000);
      } else {
        setStatus("pending");
      }
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      if (
        currentAttempt < 3
      ) {
        timerRef.current =
          setTimeout(() => {
            checkAccess(
              currentAttempt + 1
            );
          }, 3000);
      } else {
        setStatus("error");
      }
    }
  }

  function planName(planId) {
    const plan =
      PLAN_NAMES[planId];

    return plan
      ? isEnglish
        ? plan.en
        : plan.ar
      : planId;
  }

  const plans =
    Array.isArray(
      access?.plans
    )
      ? access.plans
      : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 18,
        background: "#0b1220",
        color: "#172033",

        direction: isEnglish
          ? "ltr"
          : "rtl",

        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width:
            "min(520px, 100%)",

          padding: 24,
          borderRadius: 20,
          background: "#ffffff",

          border:
            "2px solid #d9e2ef",

          boxShadow:
            "0 24px 70px rgba(0,0,0,.45)",

          textAlign: isEnglish
            ? "left"
            : "right",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <img
            src="/logov3.png"
            alt="AllWDbook"
            width="68"
            height="68"
            style={{
              borderRadius: "50%",
            }}
          />

          <h1
            style={{
              margin:
                "12px 0 6px",

              fontSize: 24,
              color: "#172033",
            }}
          >
            {text.title}
          </h1>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 13,

            background:
              status === "ready"
                ? "#eafaf1"
                : "#f7f9fc",

            border:
              status === "ready"
                ? "1px solid #54bd7a"
                : "1px solid #d9e2ef",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            {status ===
              "checking" &&
              `⏳ ${text.checking}`}

            {status ===
              "ready" &&
              `✅ ${text.ready}`}

            {status ===
              "pending" &&
              `⏳ ${text.pending}`}

            {status ===
              "login" &&
              `🔐 ${text.login}`}

            {status ===
              "error" &&
              `⚠️ ${text.error}`}
          </div>

          {status ===
            "checking" && (
            <div
              style={{
                marginTop: 8,
                color: "#65738a",
                fontSize: 13,
              }}
            >
              {attempt + 1}/11
            </div>
          )}

          {(status ===
            "pending" ||
            status ===
              "error") && (
            <p
              style={{
                margin:
                  "10px 0 0",

                color:
                  "#65738a",

                lineHeight: 1.8,
              }}
            >
              {text.pendingNote}
            </p>
          )}
        </div>

        {status ===
          "ready" && (
          <div
            style={{
              marginTop: 18,
            }}
          >
            <div
              style={{
                color: "#65738a",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {text.plans}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {access?.lifetime ? (
                <span
                  style={planBadge}
                >
                  ♾️ Lifetime Pro
                </span>
              ) : (
                plans.map(
                  (planId) => (
                    <span
                      key={planId}
                      style={
                        planBadge
                      }
                    >
                      ✓{" "}
                      {planName(
                        planId
                      )}
                    </span>
                  )
                )
              )}
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gap: 9,
            marginTop: 22,
          }}
        >
          {status ===
            "login" && (
            <a
              href="/login"
              style={
                primaryButton
              }
            >
              {text.signIn}
            </a>
          )}

          {(status ===
            "pending" ||
            status ===
              "error") && (
            <button
              type="button"
              onClick={() =>
                checkAccess(0)
              }
              style={
                primaryButton
              }
            >
              {text.retry}
            </button>
          )}

          {access?.billingUrl && (
            <a
              href={
                access.billingUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              style={
                secondaryButton
              }
            >
              ⚙️ {text.billing}
            </a>
          )}

          <a
            href="/"
            style={
              status === "ready"
                ? primaryButton
                : secondaryButton
            }
          >
            {text.home}
          </a>

          {(status ===
            "pending" ||
            status ===
              "error") && (
            <a
              href="mailto:anesscherfaoui@gmail.com"
              style={
                secondaryButton
              }
            >
              ✉️ {text.contact}
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

const planBadge = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "#eafaf1",

  border:
    "1px solid #54bd7a",

  color: "#15733d",
  fontSize: 13,
  fontWeight: 900,
};

const primaryButton = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",

  padding:
    "12px 14px",

  border:
    "1px solid #218a4d",

  borderRadius: 11,
  background: "#22a95f",
  color: "#ffffff",

  textAlign: "center",
  textDecoration: "none",

  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButton = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",

  padding:
    "12px 14px",

  border:
    "1px solid #cbd5e1",

  borderRadius: 11,
  background: "#f7f9fc",
  color: "#24334b",

  textAlign: "center",
  textDecoration: "none",

  fontSize: 14,
  fontWeight: 800,
};
