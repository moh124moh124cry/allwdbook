"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getSupabase,
} from "../../lib/supabase";

import {
  normalizeEmail,
  isValidEmail,
} from "../../lib/auth";

const VALID_PLANS = new Set([
  "cover",
  "micro_niche",
  "keywords",
  "pro_monthly",
  "pro_yearly",
]);

const TEXT = {
  ar: {
    title:
      "تسجيل الدخول",

    normalNote:
      "أدخل بريدك لاستعادة حسابك أو اشتراكك.",

    purchaseNote:
      "أدخل بريدك، وبعد تسجيل الدخول ستفتح صفحة الدفع تلقائيًا.",

    emailPlaceholder:
      "you@example.com",

    send:
      "إرسال رابط تسجيل الدخول",

    sending:
      "جارٍ الإرسال...",

    check:
      "تحقق من بريدك",

    checkNote:
      "افتح الرسالة واضغط على رابط تسجيل الدخول. ستنتقل تلقائيًا إلى صفحة الدفع.",

    other:
      "استخدام بريد آخر",

    invalid:
      "أدخل بريدًا إلكترونيًا صحيحًا.",

    failed:
      "تعذر إرسال رابط تسجيل الدخول.",

    back:
      "العودة إلى الموقع",
  },

  en: {
    title:
      "Sign in",

    normalNote:
      "Enter your email to restore your account or subscription.",

    purchaseNote:
      "Enter your email. Checkout will open automatically after sign-in.",

    emailPlaceholder:
      "you@example.com",

    send:
      "Send sign-in link",

    sending:
      "Sending...",

    check:
      "Check your email",

    checkNote:
      "Open the message and use the sign-in link. You will continue to checkout automatically.",

    other:
      "Use another email",

    invalid:
      "Enter a valid email address.",

    failed:
      "Unable to send the sign-in link.",

    back:
      "Return to the website",
  },
};

function getPlanFromAddress() {
  if (
    typeof window ===
    "undefined"
  ) {
    return "";
  }

  const value =
    new URLSearchParams(
      window.location.search
    ).get("plan") || "";

  return VALID_PLANS.has(
    value
  )
    ? value
    : "";
}

function rememberPlan(plan) {
  if (!plan) {
    return;
  }

  try {
    localStorage.setItem(
      "awd_pending_plan",
      plan
    );
  } catch {}
}

function destinationForPlan(
  plan
) {
  const destination =
    new URL(
      "/",
      window.location.origin
    );

  if (plan) {
    destination.searchParams.set(
      "selectedPlan",
      plan
    );
  }

  return destination.toString();
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const [error, setError] =
    useState("");

  const [plan, setPlan] =
    useState("");

  const [
    language,
    setLanguage,
  ] = useState("ar");

  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const selectedPlan =
          getPlanFromAddress();

        setPlan(selectedPlan);
        rememberPlan(
          selectedPlan
        );

        const savedLanguage =
          localStorage.getItem(
            "awd_lang"
          );

        if (
          savedLanguage ===
            "en" ||
          savedLanguage === "ar"
        ) {
          setLanguage(
            savedLanguage
          );
        }

        const supabase =
          getSupabase();

        const {
          data: { session },
        } =
          await supabase.auth
            .getSession();

        if (
          !active ||
          !session?.user?.email
        ) {
          return;
        }

        const pendingPlan =
          selectedPlan ||
          localStorage.getItem(
            "awd_pending_plan"
          ) ||
          "";

        if (
          pendingPlan &&
          VALID_PLANS.has(
            pendingPlan
          )
        ) {
          router.replace(
            `/?selectedPlan=${encodeURIComponent(
              pendingPlan
            )}`
          );
        } else {
          router.replace("/");
        }
      } catch {}
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function login(event) {
    event.preventDefault();
    setError("");

    const cleanEmail =
      normalizeEmail(email);

    if (
      !isValidEmail(
        cleanEmail
      )
    ) {
      setError(text.invalid);
      return;
    }

    setLoading(true);

    try {
      const selectedPlan =
        plan ||
        getPlanFromAddress();

      rememberPlan(
        selectedPlan
      );

      const supabase =
        getSupabase();

      const {
        error: loginError,
      } =
        await supabase.auth
          .signInWithOtp({
            email: cleanEmail,

            options: {
              shouldCreateUser:
                true,

              emailRedirectTo:
                destinationForPlan(
                  selectedPlan
                ),
            },
          });

      if (loginError) {
        throw loginError;
      }

      setSent(true);
    } catch (err) {
      console.error(err);
      setError(text.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent:
          "center",

        padding: 20,
        background: "#081426",
        color: "white",

        direction: isEnglish
          ? "ltr"
          : "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,

          borderRadius: 18,

          background:
            "#ffffff",

          color: "#172033",

          border:
            "2px solid #d9e2ef",

          boxShadow:
            "0 22px 60px rgba(0,0,0,.42)",
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
            width="62"
            height="62"
            style={{
              borderRadius:
                "50%",
            }}
          />

          <h1
            style={{
              margin:
                "10px 0 4px",

              fontSize: 25,
            }}
          >
            AllWDbook
          </h1>
        </div>

        {!sent ? (
          <form
            onSubmit={login}
          >
            <h2
              style={{
                textAlign:
                  "center",

                margin:
                  "18px 0 7px",

                fontSize: 20,
              }}
            >
              {text.title}
            </h2>

            <p
              style={{
                textAlign:
                  "center",

                color:
                  "#65738a",

                lineHeight: 1.7,

                margin:
                  "0 0 12px",
              }}
            >
              {plan
                ? text.purchaseNote
                : text.normalNote}
            </p>

            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={
                text.emailPlaceholder
              }
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
              disabled={
                loading
              }
              style={{
                width: "100%",

                boxSizing:
                  "border-box",

                padding: 14,
                marginTop: 10,

                borderRadius: 10,

                border:
                  "1px solid #cbd5e1",

                background:
                  "#f7f9fc",

                color:
                  "#172033",

                fontSize: 16,
                direction: "ltr",
              }}
            />

            <button
              type="submit"
              disabled={
                loading
              }
              style={{
                width: "100%",

                marginTop: 15,
                padding: 14,

                border: 0,
                borderRadius: 10,

                background:
                  "#20c967",

                color:
                  "#06150c",

                fontWeight: 900,
                fontSize: 16,
              }}
            >
              {loading
                ? text.sending
                : text.send}
            </button>
          </form>
        ) : (
          <div
            style={{
              textAlign:
                "center",

              padding:
                "18px 8px 8px",
            }}
          >
            <div
              style={{
                fontSize: 45,
              }}
            >
              📧
            </div>

            <h2>
              {text.check}
            </h2>

            <p
              style={{
                color:
                  "#65738a",

                lineHeight: 1.8,
              }}
            >
              {text.checkNote}
            </p>

            <button
              type="button"
              onClick={() =>
                setSent(false)
              }
              style={{
                background:
                  "transparent",

                border: 0,

                color:
                  "#1459a6",

                fontWeight: 800,
              }}
            >
              {text.other}
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 15,
              padding: 12,

              borderRadius: 10,

              background:
                "#fff0ef",

              border:
                "1px solid #d9574f",

              color:
                "#b6322c",

              textAlign:
                "center",
            }}
          >
            {error}
          </div>
        )}

        <a
          href="/"
          style={{
            display: "block",

            marginTop: 18,

            textAlign:
              "center",

            color:
              "#65738a",

            fontSize: 13,
          }}
        >
          {text.back}
        </a>
      </div>
    </main>
  );
}
