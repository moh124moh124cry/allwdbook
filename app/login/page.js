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
      "سجّل الدخول بحساب Google للوصول إلى حسابك واشتراكاتك.",

    purchaseNote:
      "اختر حساب Google، وبعد تسجيل الدخول ستفتح صفحة دفع الباقة تلقائيًا.",

    google:
      "المتابعة باستخدام Google",

    guest:
      "الدخول كزائر",

    guestNote:
      "يمكنك تجربة الأدوات مجانًا كزائر دون إنشاء حساب.",

    openingGoogle:
      "جارٍ فتح Google...",

    openingGuest:
      "جارٍ فتح الموقع...",

    failedGoogle:
      "تعذر فتح تسجيل الدخول باستخدام Google. حاول مرة أخرى.",

    failedGuest:
      "تعذر إنشاء جلسة الزائر. حاول مرة أخرى.",

    back:
      "العودة إلى الموقع",
  },

  en: {
    title:
      "Sign in",

    normalNote:
      "Sign in with Google to access your account and subscriptions.",

    purchaseNote:
      "Choose a Google account. Checkout will open automatically after sign-in.",

    google:
      "Continue with Google",

    guest:
      "Continue as guest",

    guestNote:
      "You can try the tools for free as a guest without creating an account.",

    openingGoogle:
      "Opening Google...",

    openingGuest:
      "Opening the website...",

    failedGoogle:
      "Unable to open Google sign-in. Please try again.",

    failedGuest:
      "Unable to create a guest session. Please try again.",

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

function forgetPlan() {
  try {
    localStorage.removeItem(
      "awd_pending_plan"
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

function isEmailSession(
  session
) {
  return Boolean(
    session?.user?.email &&
      session?.user
        ?.is_anonymous !== true
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.53l3.35-2.61Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [plan, setPlan] =
    useState("");

  const [
    language,
    setLanguage,
  ] = useState("ar");

  const [busy, setBusy] =
    useState("");

  const [error, setError] =
    useState("");

  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;

  useEffect(() => {
    let active = true;

    async function initialize() {
      const selectedPlan =
        getPlanFromAddress();

      setPlan(selectedPlan);
      rememberPlan(
        selectedPlan
      );

      try {
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
      } catch {}

      try {
        const supabase =
          getSupabase();

        const {
          data: { session },
        } =
          await supabase.auth
            .getSession();

        if (
          !active ||
          !isEmailSession(
            session
          )
        ) {
          return;
        }

        let rememberedPlan =
          "";

        try {
          rememberedPlan =
            localStorage.getItem(
              "awd_pending_plan"
            ) || "";
        } catch {}

        const pendingPlan =
          VALID_PLANS.has(
            selectedPlan
          )
            ? selectedPlan
            : VALID_PLANS.has(
                  rememberedPlan
                )
              ? rememberedPlan
              : "";

        router.replace(
          pendingPlan
            ? `/?selectedPlan=${encodeURIComponent(
                pendingPlan
              )}`
            : "/"
        );
      } catch (
        sessionError
      ) {
        console.error(
          "Login session check failed:",
          sessionError
        );
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function continueWithGoogle() {
    if (busy) {
      return;
    }

    setBusy("google");
    setError("");

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
        error: oauthError,
      } =
        await supabase.auth
          .signInWithOAuth({
            provider:
              "google",

            options: {
              redirectTo:
                destinationForPlan(
                  selectedPlan
                ),

              queryParams: {
                prompt:
                  "select_account",
              },
            },
          });

      if (oauthError) {
        throw oauthError;
      }
    } catch (
      googleError
    ) {
      console.error(
        "Google sign-in failed:",
        googleError
      );

      setError(
        text.failedGoogle
      );

      setBusy("");
    }
  }

  async function continueAsGuest() {
    if (busy) {
      return;
    }

    setBusy("guest");
    setError("");
    forgetPlan();

    try {
      const supabase =
        getSupabase();

      const {
        data: { session },
      } =
        await supabase.auth
          .getSession();

      if (
        isEmailSession(session)
      ) {
        await supabase.auth
          .signOut();
      }

      const {
        data: {
          session:
            nextSession,
        },

        error: guestError,
      } =
        await supabase.auth
          .getSession();

      if (guestError) {
        throw guestError;
      }

      if (
        !nextSession ||
        nextSession.user
          ?.is_anonymous !== true
      ) {
        const {
          error:
            anonymousError,
        } =
          await supabase.auth
            .signInAnonymously();

        if (anonymousError) {
          throw anonymousError;
        }
      }

      router.replace("/");
      router.refresh();
    } catch (guestError) {
      console.error(
        "Guest sign-in failed:",
        guestError
      );

      setError(
        text.failedGuest
      );

      setBusy("");
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

        background:
          "#081426",

        color: "white",

        direction: isEnglish
          ? "ltr"
          : "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,

          boxSizing:
            "border-box",

          padding: 24,
          borderRadius: 18,

          background:
            "#ffffff",

          color:
            "#172033",

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

          <h2
            style={{
              margin:
                "17px 0 7px",

              fontSize: 20,
            }}
          >
            {text.title}
          </h2>

          <p
            style={{
              margin:
                "0 0 18px",

              color:
                "#65738a",

              lineHeight: 1.75,
            }}
          >
            {plan
              ? text.purchaseNote
              : text.normalNote}
          </p>
        </div>

        <button
          type="button"
          onClick={
            continueWithGoogle
          }
          disabled={Boolean(
            busy
          )}
          style={{
            width: "100%",
            minHeight: 52,

            display: "flex",
            alignItems:
              "center",

            justifyContent:
              "center",

            gap: 10,

            padding:
              "12px 14px",

            borderRadius: 11,

            border:
              "1px solid #cbd5e1",

            background:
              "#ffffff",

            color:
              "#172033",

            fontSize: 16,
            fontWeight: 900,

            cursor: busy
              ? "wait"
              : "pointer",
          }}
        >
          <GoogleIcon />

          {busy === "google"
            ? text.openingGoogle
            : text.google}
        </button>

        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            gap: 10,

            margin:
              "17px 0",

            color:
              "#94a0b2",

            fontSize: 12,
          }}
        >
          <span
            style={{
              height: 1,
              flex: 1,

              background:
                "#d9e2ef",
            }}
          />

          <span>
            {isEnglish
              ? "or"
              : "أو"}
          </span>

          <span
            style={{
              height: 1,
              flex: 1,

              background:
                "#d9e2ef",
            }}
          />
        </div>

        <button
          type="button"
          onClick={
            continueAsGuest
          }
          disabled={Boolean(
            busy
          )}
          style={{
            width: "100%",
            minHeight: 50,

            padding:
              "12px 14px",

            borderRadius: 11,

            border:
              "1px solid #22a95f",

            background:
              "#effbf3",

            color:
              "#15733d",

            fontSize: 15,
            fontWeight: 900,

            cursor: busy
              ? "wait"
              : "pointer",
          }}
        >
          {busy === "guest"
            ? text.openingGuest
            : `👤 ${text.guest}`}
        </button>

        <p
          style={{
            margin:
              "10px 4px 0",

            color:
              "#7a8799",

            fontSize: 12,
            lineHeight: 1.6,

            textAlign:
              "center",
          }}
        >
          {text.guestNote}
        </p>

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
