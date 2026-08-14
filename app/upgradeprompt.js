"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getSupabase,
} from "../lib/supabase";

const PLANS = {
  cover: {
    id: "cover",
    ar: "مصمم الغلاف",
    en: "Cover Designer",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/a40b815f-2b2c-4086-b8b8-3afcd0bf7a4d",
  },

  micro_niche: {
    id: "micro_niche",
    ar: "الميكرو نيتش",
    en: "Micro-Niche",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/c205aef7-1c77-4711-9fba-ee2b9a81153b",
  },

  keywords: {
    id: "keywords",
    ar: "الكلمات المفتاحية",
    en: "Keywords",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",
  },

  pro_monthly: {
    id: "pro_monthly",

    ar:
      "Pro شهري — جميع الأدوات",

    en:
      "Pro Monthly — All tools",

    price: "$5.99",
    periodAr: "/ شهر",
    periodEn: "/ month",
    featured: true,

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/00e64ca6-4e8c-42c2-aa44-e9667d745524",
  },

  pro_yearly: {
    id: "pro_yearly",

    ar:
      "Pro سنوي — جميع الأدوات",

    en:
      "Pro Yearly — All tools",

    price: "$55",
    periodAr: "/ سنة",
    periodEn: "/ year",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/14a4b6b5-553f-4070-bd39-932ba2270aa5",
  },
};

const TOOL_PLANS = {
  coverDesigner: [
    "cover",
    "pro_monthly",
    "pro_yearly",
  ],

  microNiche: [
    "micro_niche",
    "pro_monthly",
    "pro_yearly",
  ],

  keywords: [
    "keywords",
    "pro_monthly",
    "pro_yearly",
  ],
};

const TOOL_NAMES = {
  coverDesigner: {
    ar: "مصمم الغلاف",
    en: "Cover Designer",
  },

  microNiche: {
    ar: "الميكرو نيتش",
    en: "Micro-Niche",
  },

  keywords: {
    ar: "الكلمات المفتاحية",
    en: "Keyword Research",
  },
};

const TEXT = {
  ar: {
    title:
      "انتهت استخداماتك المجانية اليوم",

    note:
      "استخدمت 5 عمليات مجانية لهذه الأداة. اختر باقة للمتابعة دون حد يومي.",

    choose:
      "اختر الباقة المناسبة",

    featured:
      "أفضل قيمة لجميع الأدوات",

    subscribe:
      "الاشتراك الآن",

    existing:
      "لدي اشتراك — تسجيل الدخول",

    close:
      "ليس الآن",

    closeLabel:
      "إغلاق نافذة الاشتراك",

    opening:
      "جارٍ فتح الدفع...",

    error:
      "تعذر فتح صفحة الدفع. حاول مرة أخرى.",

    reset:
      "تتجدد الاستخدامات المجانية في اليوم التالي.",
  },

  en: {
    title:
      "You have used today's free allowance",

    note:
      "You used 5 free actions for this tool. Choose a plan to continue without a daily limit.",

    choose:
      "Choose a plan",

    featured:
      "Best value for all tools",

    subscribe:
      "Subscribe now",

    existing:
      "I have a subscription — Sign in",

    close:
      "Not now",

    closeLabel:
      "Close subscription window",

    opening:
      "Opening checkout...",

    error:
      "Unable to open checkout. Please try again.",

    reset:
      "Free uses reset the following day.",
  },
};

const LIMIT_KEY_PREFIX =
  "awd_daily_limit_";

function utcUsageDate() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export function rememberDailyLimit(
  toolId
) {
  if (
    !toolId ||
    typeof window ===
      "undefined"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      LIMIT_KEY_PREFIX +
        toolId,

      utcUsageDate()
    );
  } catch {}
}

export function isDailyLimitRemembered(
  toolId
) {
  if (
    !toolId ||
    typeof window ===
      "undefined"
  ) {
    return false;
  }

  try {
    const key =
      LIMIT_KEY_PREFIX +
      toolId;

    const savedDate =
      localStorage.getItem(key);

    if (
      savedDate ===
      utcUsageDate()
    ) {
      return true;
    }

    if (savedDate) {
      localStorage.removeItem(
        key
      );
    }
  } catch {}

  return false;
}

export function clearRememberedDailyLimit(
  toolId
) {
  if (
    !toolId ||
    typeof window ===
      "undefined"
  ) {
    return;
  }

  try {
    localStorage.removeItem(
      LIMIT_KEY_PREFIX +
        toolId
    );
  } catch {}
}

const PAID_TOOL_PLANS = {
  coverDesigner: [
    "cover",
    "pro_monthly",
    "pro_yearly",
  ],

  microNiche: [
    "micro_niche",
    "pro_monthly",
    "pro_yearly",
  ],

  keywords: [
    "keywords",
    "pro_monthly",
    "pro_yearly",
  ],
};

export async function shouldBlockRememberedLimit(
  toolId,
  accessToken
) {
  if (
    !isDailyLimitRemembered(
      toolId
    )
  ) {
    return false;
  }

  try {
    const response =
      await fetch(
        "/api/access",
        {
          cache: "no-store",

          headers: accessToken
            ? {
                Authorization:
                  `Bearer ${accessToken}`,
              }
            : {},
        }
      );

    if (response.ok) {
      const access =
        await response.json();

      const activePlans =
        Array.isArray(
          access?.plans
        )
          ? access.plans
          : [];

      const allowedPlans =
        PAID_TOOL_PLANS[
          toolId
        ] || [];

      const hasPaidTool =
        allowedPlans.some(
          (planId) =>
            activePlans.includes(
              planId
            )
        );

      if (
        access?.lifetime ||
        hasPaidTool
      ) {
        clearRememberedDailyLimit(
          toolId
        );

        return false;
      }
    }
  } catch (error) {
    console.error(
      "Remembered limit check failed:",
      error
    );
  }

  return true;
}

export default function UpgradePrompt({
  open,
  toolId,
  onClose,
}) {
  const [
    language,
    setLanguage,
  ] = useState("ar");

  const [
    openingPlan,
    setOpeningPlan,
  ] = useState("");

  const [error, setError] =
    useState("");

  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;

  useEffect(() => {
    function detectLanguage() {
      try {
        const saved =
          localStorage.getItem(
            "awd_lang"
          );

        const next =
          saved === "en" ||
          document
            .documentElement
            .dir === "ltr"
            ? "en"
            : "ar";

        setLanguage(next);
      } catch {
        setLanguage("ar");
      }
    }

    detectLanguage();

    const languageObserver =
      new MutationObserver(
        detectLanguage
      );

    languageObserver.observe(
      document.documentElement,
      {
        attributes: true,

        attributeFilter: [
          "dir",
          "lang",
        ],
      }
    );

    if (!open) {
      return () => {
        languageObserver.disconnect();
      };
    }

    rememberDailyLimit(
      toolId
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function closeWithEscape(
      event
    ) {
      if (
        event.key === "Escape"
      ) {
        onClose?.();
      }
    }

    document.addEventListener(
      "keydown",
      closeWithEscape
    );

    return () => {
      languageObserver.disconnect();

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        closeWithEscape
      );
    };
  }, [
    open,
    onClose,
    toolId,
  ]);

  if (!open) {
    return null;
  }

  const planIds =
    TOOL_PLANS[toolId] || [
      "pro_monthly",
      "pro_yearly",
    ];

  const toolName =
    TOOL_NAMES[toolId]?.[
      language
    ] || "AllWDbook";

  async function choosePlan(
    plan
  ) {
    if (openingPlan) {
      return;
    }

    setOpeningPlan(plan.id);
    setError("");

    try {
      localStorage.setItem(
        "awd_pending_plan",
        plan.id
      );

      const supabase =
        getSupabase();

      const {
        data: { session },
      } =
        await supabase.auth
          .getSession();

      if (
        !session?.user?.email
      ) {
        window.location.assign(
          `/login?plan=${encodeURIComponent(
            plan.id
          )}`
        );

        return;
      }

      const checkout =
        new URL(
          plan.checkoutUrl
        );

      checkout.searchParams.set(
        "checkout[email]",
        session.user.email
      );

      checkout.searchParams.set(
        "checkout[custom][user_id]",
        session.user.id
      );

      checkout.searchParams.set(
        "checkout[custom][plan_id]",
        plan.id
      );

      localStorage.removeItem(
        "awd_pending_plan"
      );

      window.location.assign(
        checkout.toString()
      );
    } catch (
      purchaseError
    ) {
      console.error(
        "Upgrade checkout error:",
        purchaseError
      );

      setOpeningPlan("");
      setError(text.error);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,

        display: "grid",
        placeItems: "center",

        padding: 16,

        background:
          "rgba(4, 10, 20, .78)",

        backdropFilter:
          "blur(5px)",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        style={{
          position:
            "relative",

          width:
            "min(460px, 100%)",

          maxHeight:
            "calc(100vh - 32px)",

          overflowY: "auto",

          boxSizing:
            "border-box",

          padding:
            "54px 20px 20px",

          borderRadius: 18,

          background:
            "#ffffff",

          color:
            "#172033",

          border:
            "2px solid #d9e2ef",

          boxShadow:
            "0 28px 80px rgba(0,0,0,.55)",

          direction: isEnglish
            ? "ltr"
            : "rtl",

          textAlign: isEnglish
            ? "left"
            : "right",
        }}
      >
        <button
          type="button"
          aria-label={
            text.closeLabel
          }
          title={
            text.closeLabel
          }
          onClick={() =>
            onClose?.()
          }
          style={{
            position:
              "absolute",

            top: 12,

            right: isEnglish
              ? 12
              : "auto",

            left: isEnglish
              ? "auto"
              : 12,

            width: 36,
            height: 36,

            display: "grid",
            placeItems: "center",

            padding: 0,

            borderRadius:
              "50%",

            border:
              "1px solid #cbd5e1",

            background:
              "#f7f9fc",

            color:
              "#172033",

            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,

            cursor:
              "pointer",
          }}
        >
          ×
        </button>

        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 42,
            }}
          >
            🔒
          </div>

          <h2
            id="upgrade-title"
            style={{
              margin:
                "8px 0 7px",

              fontSize: 21,
            }}
          >
            {text.title}
          </h2>

          <p
            style={{
              margin: 0,

              color:
                "#65738a",

              lineHeight: 1.75,
            }}
          >
            {text.note}
          </p>

          <strong
            style={{
              display:
                "inline-block",

              marginTop: 9,

              padding:
                "6px 10px",

              borderRadius: 999,

              background:
                "#f2f4f7",

              color:
                "#40506a",

              fontSize: 12,
            }}
          >
            {toolName}
          </strong>
        </div>

        <div
          style={{
            marginTop: 17,
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {text.choose}
        </div>

        <div
          style={{
            display: "grid",
            gap: 9,
            marginTop: 9,
          }}
        >
          {planIds.map(
            (planId) => {
              const plan =
                PLANS[planId];

              const loading =
                openingPlan ===
                plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  disabled={Boolean(
                    openingPlan
                  )}
                  onClick={() =>
                    choosePlan(
                      plan
                    )
                  }
                  style={{
                    width: "100%",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    gap: 12,

                    padding:
                      "12px 13px",

                    borderRadius:
                      12,

                    border:
                      plan.featured
                        ? "2px solid #22a95f"
                        : "1px solid #d9e2ef",

                    background:
                      plan.featured
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

                    cursor:
                      openingPlan
                        ? "wait"
                        : "pointer",
                  }}
                >
                  <span>
                    <strong
                      style={{
                        display:
                          "block",

                        fontSize:
                          14,
                      }}
                    >
                      {isEnglish
                        ? plan.en
                        : plan.ar}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",

                        marginTop:
                          3,

                        color:
                          "#16864a",
                      }}
                    >
                      {loading
                        ? text.opening
                        : plan.featured
                          ? text.featured
                          : text.subscribe}
                    </small>
                  </span>

                  <span
                    style={{
                      direction:
                        "ltr",

                      color:
                        "#c96b08",

                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    <strong>
                      {plan.price}
                    </strong>

                    <small
                      style={{
                        marginLeft:
                          3,

                        color:
                          "#65738a",
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

        {error && (
          <div
            style={{
              marginTop: 11,
              padding: 10,

              borderRadius: 9,

              background:
                "#fff0ef",

              border:
                "1px solid #d9574f",

              color:
                "#b6322c",

              fontSize: 13,

              textAlign:
                "center",
            }}
          >
            {error}
          </div>
        )}

        <a
          href={`/login?plan=${encodeURIComponent(
            planIds[0]
          )}`}
          style={{
            display: "block",

            marginTop: 12,

            padding:
              "10px 12px",

            borderRadius: 10,

            background:
              "#eaf3ff",

            border:
              "1px solid #6ca8eb",

            color:
              "#1459a6",

            textAlign:
              "center",

            textDecoration:
              "none",

            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {text.existing}
        </a>

        <button
          type="button"
          onClick={() =>
            onClose?.()
          }
          style={{
            width: "100%",
            marginTop: 8,
            padding: 9,
            border: 0,

            background:
              "transparent",

            color:
              "#65738a",

            fontWeight: 800,

            cursor:
              "pointer",
          }}
        >
          {text.close}
        </button>

        <div
          style={{
            marginTop: 5,

            color:
              "#8491a5",

            fontSize: 11,

            textAlign:
              "center",
          }}
        >
          {text.reset}
        </div>
      </section>
    </div>
  );
}
