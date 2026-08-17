"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useAccess,
} from "../../lib/useAccess";

import {
  FREE_DAILY_LIMITS,
} from "../../lib/plans";

/* =========================================================
   CHECKOUTS
   نفس الروابط الموجودة في AccountMenu
   ========================================================= */

const LIFETIME_CHECKOUT_URL =
  process.env
    .NEXT_PUBLIC_LEMON_LIFETIME_CHECKOUT_URL ||
  "";

const PAID_PLANS = [
  {
    id: "cover",
    icon: "📐",
    ar: "مصمم الأغلفة",
    en: "Cover Designer",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",
    tone: "blue",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/a40b815f-2b2c-4086-b8b8-3afcd0bf7a4d",

    featuresAr: [
      "مصمم الأغلفة بدون حد يومي",
      `Micro-Niche: ${FREE_DAILY_LIMITS.microNiche} مرات يوميًا`,
      `Keywords: ${FREE_DAILY_LIMITS.keywords} مرات يوميًا`,
      "حاسبة الأرباح بدون حد",
      "منسق وصف الكتاب بدون حد",
    ],

    featuresEn: [
      "Unlimited Cover Designer",
      `Micro-Niche: ${FREE_DAILY_LIMITS.microNiche} daily uses`,
      `Keywords: ${FREE_DAILY_LIMITS.keywords} daily uses`,
      "Unlimited Royalty Calculator",
      "Unlimited Book Formatter",
    ],
  },

  {
    id: "micro_niche",
    icon: "🎯",
    ar: "Micro-Niche",
    en: "Micro-Niche",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",
    tone: "green",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/c205aef7-1c77-4711-9fba-ee2b9a81153b",

    featuresAr: [
      "Micro-Niche بدون حد يومي",
      `مصمم الأغلفة: ${FREE_DAILY_LIMITS.coverDesigner} مرات يوميًا`,
      `Keywords: ${FREE_DAILY_LIMITS.keywords} مرات يوميًا`,
      "حاسبة الأرباح بدون حد",
      "منسق وصف الكتاب بدون حد",
    ],

    featuresEn: [
      "Unlimited Micro-Niche",
      `Cover Designer: ${FREE_DAILY_LIMITS.coverDesigner} daily uses`,
      `Keywords: ${FREE_DAILY_LIMITS.keywords} daily uses`,
      "Unlimited Royalty Calculator",
      "Unlimited Book Formatter",
    ],
  },

  {
    id: "keywords",
    icon: "🔑",
    ar: "الكلمات المفتاحية",
    en: "Keyword Research",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",
    tone: "violet",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",

    featuresAr: [
      "بحث الكلمات بدون حد يومي",
      `مصمم الأغلفة: ${FREE_DAILY_LIMITS.coverDesigner} مرات يوميًا`,
      `Micro-Niche: ${FREE_DAILY_LIMITS.microNiche} مرات يوميًا`,
      "حاسبة الأرباح بدون حد",
      "منسق وصف الكتاب بدون حد",
    ],

    featuresEn: [
      "Unlimited Keyword Research",
      `Cover Designer: ${FREE_DAILY_LIMITS.coverDesigner} daily uses`,
      `Micro-Niche: ${FREE_DAILY_LIMITS.microNiche} daily uses`,
      "Unlimited Royalty Calculator",
      "Unlimited Book Formatter",
    ],
  },

  {
    id: "pro_monthly",
    icon: "⚡",
    ar: "AllWDbook Pro",
    en: "AllWDbook Pro",
    price: "$5.99",
    periodAr: "/ شهر",
    periodEn: "/ month",
    tone: "orange",
    featured: true,

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/00e64ca6-4e8c-42c2-aa44-e9667d745524",

    featuresAr: [
      "جميع الأدوات بدون حدود يومية",
      "مصمم الأغلفة الكامل",
      "Micro-Niche بدون حدود",
      "Keyword Research بدون حدود",
      "الحاسبة وFormatter بدون حدود",
    ],

    featuresEn: [
      "All tools with no daily limits",
      "Full Cover Designer",
      "Unlimited Micro-Niche",
      "Unlimited Keyword Research",
      "Unlimited Calculator & Formatter",
    ],
  },

  {
    id: "pro_yearly",
    icon: "👑",
    ar: "Pro السنوي",
    en: "Pro Yearly",
    price: "$55",
    periodAr: "/ سنة",
    periodEn: "/ year",
    tone: "gold",
    bestValue: true,

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/14a4b6b5-553f-4070-bd39-932ba2270aa5",

    featuresAr: [
      "جميع مزايا Pro",
      "جميع الأدوات بدون حدود يومية",
      "دفع مرة واحدة كل سنة",
      "أوفر من الاشتراك الشهري",
      "وصول مستمر طوال مدة الاشتراك",
    ],

    featuresEn: [
      "Everything in Pro",
      "All tools with no daily limits",
      "One payment per year",
      "Better value than monthly",
      "Continuous access during subscription",
    ],
  },
];

/* =========================================================
   LABELS
   ========================================================= */

const PLAN_NAMES = {
  free: {
    ar: "الخطة المجانية",
    en: "Free Plan",
  },

  cover: {
    ar: "مصمم الأغلفة",
    en: "Cover Designer",
  },

  micro_niche: {
    ar: "Micro-Niche",
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

  founders_trial: {
    ar: "تجربة Pro",
    en: "Pro Trial",
  },
};

/* =========================================================
   PAGE
   ========================================================= */

export default function SubscriptionPage() {
  const access =
    useAccess();

  const [
    lang,
    setLang,
  ] = useState("ar");

  const [
    busyPlan,
    setBusyPlan,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const isAr =
    lang === "ar";

  const activePlans =
    Array.isArray(
      access.plans,
    )
      ? access.plans
      : [];

  const billingUrl =
    Array.isArray(
      access.subscriptions,
    )
      ? access.subscriptions.find(
          (item) =>
            item?.customer_portal_url,
        )?.customer_portal_url ||
        ""
      : "";

  /* =======================================================
     LANGUAGE
     ======================================================= */

  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        "awd_lang",
      );

    if (
      saved === "ar" ||
      saved === "en"
    ) {
      setLang(saved);
    }

    function syncLanguage(
      event,
    ) {
      const next =
        event?.detail ||
        window.localStorage.getItem(
          "awd_lang",
        );

      if (
        next === "ar" ||
        next === "en"
      ) {
        setLang(next);
      }
    }

    window.addEventListener(
      "awd-language-change",
      syncLanguage,
    );

    return () => {
      window.removeEventListener(
        "awd-language-change",
        syncLanguage,
      );
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "awd_lang",
      lang,
    );

    document.documentElement.lang =
      lang;

    document.documentElement.dir =
      isAr
        ? "rtl"
        : "ltr";
  }, [lang, isAr]);

  function toggleLanguage() {
    const next =
      isAr
        ? "en"
        : "ar";

    setLang(next);

    window.localStorage.setItem(
      "awd_lang",
      next,
    );

    window.dispatchEvent(
      new CustomEvent(
        "awd-language-change",
        {
          detail: next,
        },
      ),
    );
  }

  /* =======================================================
     CURRENT PLAN
     ======================================================= */

  function planLabel(
    planId,
  ) {
    const item =
      PLAN_NAMES[
        planId
      ];

    if (!item) {
      return planId;
    }

    return isAr
      ? item.ar
      : item.en;
  }

  const currentAccess =
    access.loading
      ? isAr
        ? "جارٍ التحقق..."
        : "Checking..."
      : access.lifetime
        ? isAr
          ? "Lifetime — وصول مدى الحياة"
          : "Lifetime Access"
        : activePlans.length
          ? activePlans
              .map(
                planLabel,
              )
              .join(" · ")
          : planLabel(
              access.plan ||
                "free",
            );

  function isActive(
    planId,
  ) {
    return activePlans.includes(
      planId,
    );
  }

  /* =======================================================
     CHECKOUT
     نفس طريقة AccountMenu الحالية
     ======================================================= */

  async function openCheckout(
    plan,
  ) {
    if (
      busyPlan ||
      !plan
    ) {
      return;
    }

    setBusyPlan(
      plan.id,
    );

    setError("");

    try {
      if (
        !plan.checkoutUrl
      ) {
        setError(
          isAr
            ? "رابط الدفع لهذه الخطة غير مضبوط بعد."
            : "Checkout URL is not configured.",
        );

        return;
      }

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
        isAr
          ? "تعذر فتح صفحة الدفع. حاول مرة أخرى."
          : "Unable to open checkout. Please try again.",
      );
    } finally {
      setBusyPlan("");
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
     FREE FEATURES
     ======================================================= */

  const freeFeatures =
    isAr
      ? [
          `${FREE_DAILY_LIMITS.coverDesigner} استخدامات يومية لمصمم الأغلفة`,
          `${FREE_DAILY_LIMITS.microNiche} استخدامات يومية لـ Micro-Niche`,
          `${FREE_DAILY_LIMITS.keywords} استخدامات يومية للكلمات المفتاحية`,
          "حاسبة الأرباح بدون حد يومي",
          "منسق وصف الكتاب بدون حد يومي",
        ]
      : [
          `${FREE_DAILY_LIMITS.coverDesigner} daily Cover Designer uses`,
          `${FREE_DAILY_LIMITS.microNiche} daily Micro-Niche uses`,
          `${FREE_DAILY_LIMITS.keywords} daily Keyword Research uses`,
          "Unlimited Royalty Calculator",
          "Unlimited Book Formatter",
        ];

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main
      className="sub-page"
      dir={
        isAr
          ? "rtl"
          : "ltr"
      }
    >
      <style jsx global>{`
        .sub-page,
        .sub-page * {
          box-sizing: border-box;
        }

        .sub-page {
          --sub-black:
            #02060d;

          --sub-bg:
            #030b17;

          --sub-navy:
            #061326;

          --sub-card:
            #071629;

          --sub-card-2:
            #091a30;

          --sub-border:
            #172f4c;

          --sub-text:
            #f7f9fd;

          --sub-muted:
            #899bb4;

          --sub-orange:
            #ff6900;

          width: 100%;

          min-height:
            100dvh;

          overflow-x:
            hidden;

          padding-bottom:
            calc(
              86px +
                env(
                  safe-area-inset-bottom
                )
            );

          color:
            var(
              --sub-text
            );

          background:
            radial-gradient(
              circle
                at 50%
                -180px,
              rgba(
                26,
                82,
                148,
                0.2
              ),
              transparent
                440px
            ),
            linear-gradient(
              180deg,
              #02060d,
              #030b17
                42%,
              #020812
            );
        }

        .sub-shell {
          width: min(
            1120px,
            calc(
              100% -
                32px
            )
          );

          margin-inline:
            auto;
        }

        /* =============================================
           HEADER
           ============================================= */

        .sub-header-wrap {
          position:
            sticky;

          top: 0;

          z-index:
            1000;

          border-bottom:
            1px solid
            rgba(
              105,
              145,
              195,
              0.12
            );

          background:
            rgba(
              2,
              8,
              18,
              0.96
            );

          backdrop-filter:
            blur(18px);
        }

        .sub-header {
          min-height:
            72px;

          display:
            grid;

          grid-template-columns:
            auto
            minmax(
              0,
              1fr
            )
            auto;

          align-items:
            center;

          gap: 10px;
        }

        .sub-back,
        .sub-lang {
          width: 42px;
          height: 42px;

          display:
            grid;

          place-items:
            center;

          padding: 0;

          border:
            1px solid
            #17314e;

          border-radius:
            13px;

          background:
            linear-gradient(
              180deg,
              #0a192d,
              #061325
            );

          color:
            white;

          text-decoration:
            none;

          font-size:
            18px;

          cursor:
            pointer;
        }

        .sub-brand {
          min-width: 0;

          display:
            flex;

          align-items:
            center;

          gap: 9px;

          text-decoration:
            none;
        }

        .sub-brand img {
          width: 43px;
          height: 43px;

          flex:
            0 0 43px;

          object-fit:
            cover;

          border-radius:
            13px;
        }

        .sub-brand-copy {
          min-width: 0;
        }

        .sub-brand-copy strong {
          display:
            block;

          overflow:
            hidden;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;

          color: white;

          font-size:
            18px;

          font-weight:
            900;
        }

        .sub-brand-copy small {
          display:
            block;

          margin-top:
            2px;

          color:
            #71849c;

          font-size:
            10px;
        }

        /* =============================================
           HERO
           ============================================= */

        .sub-hero {
          padding-top:
            22px;
        }

        .sub-hero-card {
          position:
            relative;

          overflow:
            hidden;

          padding:
            38px;

          border:
            1px solid
            rgba(
              92,
              132,
              183,
              0.18
            );

          border-radius:
            28px;

          background:
            radial-gradient(
              circle
                at 100%
                0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent
                38%
            ),
            linear-gradient(
              145deg,
              #08182c,
              #04101e
            );
        }

        [dir="rtl"]
          .sub-hero-card {
          background:
            radial-gradient(
              circle
                at 0%
                0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent
                38%
            ),
            linear-gradient(
              145deg,
              #08182c,
              #04101e
            );
        }

        .sub-kicker {
          display:
            inline-flex;

          align-items:
            center;

          gap: 7px;

          padding:
            6px 10px;

          border:
            1px solid
            rgba(
              255,
              105,
              0,
              0.24
            );

          border-radius:
            999px;

          background:
            rgba(
              255,
              105,
              0,
              0.07
            );

          color:
            #ff9956;

          font-size:
            10px;

          font-weight:
            900;
        }

        .sub-kicker::before {
          content: "";

          width: 7px;
          height: 7px;

          border-radius:
            50%;

          background:
            var(
              --sub-orange
            );
        }

        .sub-hero h1 {
          max-width:
            760px;

          margin:
            16px
            0
            0;

          color: white;

          font-size:
            clamp(
              34px,
              5vw,
              54px
            );

          line-height:
            1.1;

          letter-spacing:
            -1px;
        }

        .sub-hero h1 span {
          color:
            var(
              --sub-orange
            );
        }

        .sub-hero-text {
          max-width:
            680px;

          margin:
            14px
            0
            0;

          color:
            #91a2b8;

          font-size:
            14px;

          line-height:
            1.8;
        }

        /* =============================================
           CURRENT ACCESS
           ============================================= */

        .sub-current {
          display:
            grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            auto;

          align-items:
            center;

          gap: 15px;

          margin-top:
            24px;

          padding:
            15px;

          border:
            1px solid
            #17324f;

          border-radius:
            16px;

          background:
            rgba(
              2,
              12,
              25,
              0.62
            );
        }

        .sub-current small {
          display:
            block;

          color:
            #71849d;

          font-size:
            10px;

          font-weight:
            800;
        }

        .sub-current strong {
          display:
            block;

          margin-top:
            4px;

          color: white;

          font-size:
            15px;
        }

        .sub-live {
          display:
            inline-flex;

          align-items:
            center;

          gap: 6px;

          color:
            #74dfa9;

          font-size:
            10px;

          font-weight:
            900;
        }

        .sub-live::before {
          content: "";

          width: 8px;
          height: 8px;

          border-radius:
            50%;

          background:
            #22c987;

          box-shadow:
            0 0 0 5px
            rgba(
              34,
              201,
              135,
              0.1
            );
        }

        .sub-billing {
          min-height:
            42px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          padding-inline:
            15px;

          border:
            1px solid
            #234361;

          border-radius:
            11px;

          background:
            #08192c;

          color:
            #d9e4f0;

          text-decoration:
            none;

          font-size:
            11px;

          font-weight:
            800;
        }

        /* =============================================
           SECTION
           ============================================= */

        .sub-section {
          padding-top:
            34px;
        }

        .sub-section-head {
          margin-bottom:
            17px;
        }

        .sub-section-head span {
          display:
            block;

          margin-bottom:
            6px;

          color:
            var(
              --sub-orange
            );

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.08em;
        }

        .sub-section-head h2 {
          margin: 0;

          color: white;

          font-size:
            27px;
        }

        .sub-section-head p {
          margin:
            7px
            0
            0;

          color:
            var(
              --sub-muted
            );

          font-size:
            12px;

          line-height:
            1.65;
        }

        /* =============================================
           PRICING GRID
           ============================================= */

        .sub-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 14px;
        }

        .sub-card {
          position:
            relative;

          min-width: 0;

          display:
            flex;

          flex-direction:
            column;

          padding:
            20px;

          border:
            1px solid
            rgba(
              89,
              129,
              178,
              0.18
            );

          border-radius:
            22px;

          background:
            linear-gradient(
              155deg,
              #091a2f,
              #051322
                68%,
              #030d19
            );

          box-shadow:
            0 18px 50px
            rgba(
              0,
              0,
              0,
              0.16
            );
        }

        .sub-card.featured {
          border-color:
            rgba(
              255,
              105,
              0,
              0.56
            );

          background:
            radial-gradient(
              circle
                at 100%
                0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent
                43%
            ),
            linear-gradient(
              155deg,
              #0b1b30,
              #061426
            );

          box-shadow:
            0 22px 60px
            rgba(
              255,
              105,
              0,
              0.08
            );
        }

        [dir="rtl"]
          .sub-card.featured {
          background:
            radial-gradient(
              circle
                at 0%
                0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent
                43%
            ),
            linear-gradient(
              155deg,
              #0b1b30,
              #061426
            );
        }

        .sub-card.lifetime {
          border-color:
            rgba(
              247,
              186,
              74,
              0.38
            );

          background:
            radial-gradient(
              circle
                at 50%
                0%,
              rgba(
                255,
                179,
                43,
                0.11
              ),
              transparent
                42%
            ),
            linear-gradient(
              155deg,
              #101a27,
              #05111f
            );
        }

        .sub-popular {
          position:
            absolute;

          top: 15px;
          inset-inline-end:
            15px;

          padding:
            5px 9px;

          border-radius:
            999px;

          background:
            var(
              --sub-orange
            );

          color: white;

          font-size:
            8px;

          font-weight:
            900;
        }

        .sub-best {
          position:
            absolute;

          top: 15px;
          inset-inline-end:
            15px;

          padding:
            5px 9px;

          border:
            1px solid
            rgba(
              245,
              190,
              83,
              0.38
            );

          border-radius:
            999px;

          background:
            rgba(
              245,
              190,
              83,
              0.1
            );

          color:
            #ffd477;

          font-size:
            8px;

          font-weight:
            900;
        }

        .sub-icon {
          width: 52px;
          height: 52px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            15px;

          background:
            #0c1d32;

          font-size:
            23px;
        }

        .sub-icon.orange {
          border:
            1px solid
            rgba(
              255,
              105,
              0,
              0.25
            );

          background:
            rgba(
              255,
              105,
              0,
              0.1
            );
        }

        .sub-icon.blue {
          border:
            1px solid
            rgba(
              67,
              136,
              255,
              0.24
            );
        }

        .sub-icon.green {
          border:
            1px solid
            rgba(
              33,
              196,
              135,
              0.24
            );
        }

        .sub-icon.violet {
          border:
            1px solid
            rgba(
              139,
              92,
              246,
              0.26
            );
        }

        .sub-icon.gold {
          border:
            1px solid
            rgba(
              245,
              190,
              83,
              0.3
            );

          background:
            rgba(
              245,
              190,
              83,
              0.08
            );
        }

        .sub-card h3 {
          margin:
            17px
            0
            0;

          color: white;

          font-size:
            19px;
        }

        .sub-price {
          display:
            flex;

          align-items:
            baseline;

          gap: 5px;

          margin-top:
            12px;

          direction: ltr;

          justify-content:
            flex-start;
        }

        [dir="rtl"]
          .sub-price {
          justify-content:
            flex-end;
        }

        .sub-price strong {
          color: white;

          font-size:
            31px;

          line-height: 1;
        }

        .sub-price span {
          color:
            #73859e;

          font-size:
            10px;
        }

        .sub-features {
          display:
            grid;

          gap: 9px;

          margin:
            19px
            0
            20px;

          padding: 0;

          list-style:
            none;
        }

        .sub-features li {
          display:
            grid;

          grid-template-columns:
            auto
            minmax(
              0,
              1fr
            );

          gap: 8px;

          color:
            #aab8c9;

          font-size:
            11px;

          line-height:
            1.55;
        }

        .sub-check {
          color:
            #39d497;

          font-weight:
            900;
        }

        .sub-card-button {
          width: 100%;

          min-height:
            47px;

          margin-top:
            auto;

          padding:
            10px
            12px;

          border:
            1px solid
            #1c3857;

          border-radius:
            12px;

          background:
            #07182b;

          color:
            #e8eef7;

          font-size:
            12px;

          font-weight:
            900;

          cursor:
            pointer;
        }

        .sub-card-button.primary {
          border-color:
            var(
              --sub-orange
            );

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7c20
            );

          color: white;

          box-shadow:
            0 12px 28px
            rgba(
              255,
              105,
              0,
              0.16
            );
        }

        .sub-card-button.gold {
          border-color:
            rgba(
              245,
              190,
              83,
              0.4
            );

          background:
            rgba(
              245,
              190,
              83,
              0.09
            );

          color:
            #ffd67e;
        }

        .sub-card-button.active {
          border-color:
            rgba(
              33,
              196,
              135,
              0.35
            );

          background:
            rgba(
              33,
              196,
              135,
              0.08
            );

          color:
            #6ce0ad;
        }

        .sub-card-button:disabled {
          cursor:
            default;

          opacity: 1;
        }

        /* =============================================
           FREE
           ============================================= */

        .sub-free {
          display:
            grid;

          grid-template-columns:
            auto
            minmax(
              0,
              1fr
            )
            auto;

          align-items:
            center;

          gap: 18px;

          padding:
            20px;

          border:
            1px solid
            #17314d;

          border-radius:
            20px;

          background:
            linear-gradient(
              145deg,
              #07172a,
              #04101e
            );
        }

        .sub-free-icon {
          width: 58px;
          height: 58px;

          display:
            grid;

          place-items:
            center;

          border:
            1px solid
            #193753;

          border-radius:
            16px;

          background:
            #08192c;

          font-size:
            26px;
        }

        .sub-free h3 {
          margin: 0;

          color: white;

          font-size:
            18px;
        }

        .sub-free p {
          margin:
            5px
            0
            0;

          color:
            #8295ad;

          font-size:
            11px;

          line-height:
            1.6;
        }

        .sub-free-price {
          direction:
            ltr;

          color: white;

          font-size:
            27px;

          font-weight:
            900;
        }

        .sub-free-features {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            7px
            14px;

          margin-top:
            15px;

          padding-top:
            15px;

          border-top:
            1px solid
            rgba(
              103,
              143,
              190,
              0.13
            );
        }

        .sub-free-feature {
          display:
            flex;

          gap: 7px;

          color:
            #93a4b9;

          font-size:
            10px;

          line-height:
            1.5;
        }

        /* =============================================
           SECURITY
           ============================================= */

        .sub-trust {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 10px;

          margin-top:
            26px;
        }

        .sub-trust-item {
          padding:
            14px;

          border:
            1px solid
            #142d48;

          border-radius:
            15px;

          background:
            rgba(
              5,
              18,
              34,
              0.7
            );

          color:
            #8fa1b8;

          text-align:
            center;

          font-size:
            10px;

          line-height:
            1.5;
        }

        .sub-trust-item b {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #dbe5f0;

          font-size:
            12px;
        }

        /* =============================================
           ERROR
           ============================================= */

        .sub-error {
          margin-top:
            17px;

          padding:
            12px
            14px;

          border:
            1px solid
            rgba(
              248,
              113,
              113,
              0.3
            );

          border-radius:
            12px;

          background:
            rgba(
              248,
              113,
              113,
              0.07
            );

          color:
            #fca5a5;

          font-size:
            11px;

          line-height:
            1.6;
        }

        /* =============================================
           FOOT NOTE
           ============================================= */

        .sub-note {
          padding:
            30px
            10px
            18px;

          color:
            #536982;

          text-align:
            center;

          font-size:
            10px;

          line-height:
            1.7;
        }

        /* =============================================
           BOTTOM NAV
           ============================================= */

        .sub-bottom-nav {
          position:
            fixed;

          inset-inline:
            0;

          bottom: 0;

          z-index:
            1500;

          min-height:
            78px;

          display:
            grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          align-items:
            center;

          padding:
            5px
            8px
            calc(
              5px +
                env(
                  safe-area-inset-bottom
                )
            );

          border-top:
            1px solid
            rgba(
              89,
              128,
              177,
              0.15
            );

          background:
            rgba(
              1,
              6,
              14,
              0.98
            );

          backdrop-filter:
            blur(18px);
        }

        .sub-nav-link {
          min-height:
            60px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          gap: 4px;

          border-radius:
            15px;

          color:
            #61728a;

          text-decoration:
            none;

          font-size:
            10px;
        }

        .sub-nav-icon {
          min-width:
            46px;

          height: 31px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            15px;

          font-size:
            22px;
        }

        .sub-nav-link.active {
          color:
            #ff8540;
        }

        .sub-nav-link.active
          .sub-nav-icon {
          background:
            rgba(
              255,
              105,
              0,
              0.12
            );
        }

        /* =============================================
           TABLET
           ============================================= */

        @media (
          max-width:
            850px
        ) {
          .sub-shell {
            width: min(
              100% -
                24px,
              680px
            );
          }

          .sub-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }
        }

        /* =============================================
           MOBILE
           ============================================= */

        @media (
          max-width:
            620px
        ) {
          .sub-shell {
            width: 100%;

            padding-inline:
              14px;
          }

          .sub-header {
            min-height:
              69px;

            gap: 7px;
          }

          .sub-back,
          .sub-lang {
            width: 39px;
            height: 39px;

            border-radius:
              12px;
          }

          .sub-brand img {
            width: 39px;
            height: 39px;

            flex-basis:
              39px;

            border-radius:
              12px;
          }

          .sub-brand-copy strong {
            font-size:
              16px;
          }

          .sub-brand-copy small {
            display:
              none;
          }

          .sub-hero {
            padding-top:
              14px;
          }

          .sub-hero-card {
            padding:
              25px
              17px;

            border-radius:
              22px;
          }

          .sub-hero h1 {
            font-size:
              clamp(
                29px,
                8vw,
                38px
              );
          }

          .sub-hero-text {
            font-size:
              12px;
          }

          .sub-current {
            grid-template-columns:
              1fr;

            gap: 10px;

            margin-top:
              19px;
          }

          .sub-billing {
            width: 100%;
          }

          .sub-section {
            padding-top:
              28px;
          }

          .sub-section-head h2 {
            font-size:
              23px;
          }

          .sub-grid {
            grid-template-columns:
              1fr;

            gap: 10px;
          }

          .sub-card {
            min-height: 0;

            padding:
              17px;

            border-radius:
              19px;
          }

          .sub-card h3 {
            font-size:
              17px;
          }

          .sub-price strong {
            font-size:
              29px;
          }

          .sub-features {
            gap: 8px;

            margin:
              16px
              0;
          }

          .sub-features li {
            font-size:
              10.5px;
          }

          .sub-free {
            grid-template-columns:
              50px
              minmax(
                0,
                1fr
              )
              auto;

            gap: 10px;

            padding:
              16px;
          }

          .sub-free-icon {
            width: 50px;
            height: 50px;

            font-size:
              22px;
          }

          .sub-free h3 {
            font-size:
              16px;
          }

          .sub-free-price {
            font-size:
              23px;
          }

          .sub-free-features {
            grid-template-columns:
              1fr;
          }

          .sub-trust {
            grid-template-columns:
              1fr;

            gap: 7px;
          }
        }
      `}</style>

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="sub-header-wrap">
        <div className="sub-shell">
          <header className="sub-header">
            <a
              href="/"
              className="sub-back"
              aria-label={
                isAr
                  ? "العودة"
                  : "Back"
              }
            >
              {isAr
                ? "→"
                : "←"}
            </a>

            <a
              href="/"
              className="sub-brand"
            >
              <img
                src="/logov3.png"
                alt="AllWDbook"
              />

              <div className="sub-brand-copy">
                <strong>
                  AllWDbook
                </strong>

                <small>
                  KDP Tools & Digital Publishing
                </small>
              </div>
            </a>

            <button
              type="button"
              className="sub-lang"
              onClick={
                toggleLanguage
              }
            >
              🌐
            </button>
          </header>
        </div>
      </div>

      <div className="sub-shell">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="sub-hero">
          <div className="sub-hero-card">

            <span className="sub-kicker">
              ALLWDBOOK ACCESS
            </span>

            <h1>
              {isAr
                ? "اختر الخطة التي تناسب طريقة "
                : "Choose the plan that fits how you "}

              <span>
                {isAr
                  ? "عملك."
                  : "publish."}
              </span>
            </h1>

            <p className="sub-hero-text">
              {isAr
                ? "ابدأ مجانًا، افتح أداة واحدة بدون حدود، أو انتقل إلى Pro للوصول الكامل. ويمكنك اختيار Lifetime إذا أردت وصولًا دائمًا."
                : "Start free, unlock one tool, upgrade to Pro for full access, or choose Lifetime for permanent access."}
            </p>

            <div className="sub-current">
              <div>
                <small>
                  {isAr
                    ? "وصولك الحالي"
                    : "CURRENT ACCESS"}
                </small>

                <strong>
                  {currentAccess}
                </strong>
              </div>

              {billingUrl ? (
                <a
                  href={
                    billingUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sub-billing"
                >
                  ⚙️{" "}
                  {isAr
                    ? "إدارة الاشتراك والفواتير"
                    : "Manage billing"}
                </a>
              ) : (
                <span className="sub-live">
                  {access.loading
                    ? isAr
                      ? "جارٍ التحقق"
                      : "Checking"
                    : isAr
                      ? "الحساب متصل"
                      : "Account connected"}
                </span>
              )}
            </div>

            {error && (
              <div className="sub-error">
                ⚠️ {error}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            PRO PLANS
            ================================================= */}

        <section className="sub-section">
          <div className="sub-section-head">
            <span>
              PRO ACCESS
            </span>

            <h2>
              {isAr
                ? "الوصول الكامل"
                : "Full Access"}
            </h2>

            <p>
              {isAr
                ? "مناسب لمن يستخدم أكثر من أداة بصورة مستمرة."
                : "Best for publishers who regularly use multiple tools."}
            </p>
          </div>

          <div className="sub-grid">
            {PAID_PLANS.filter(
              (plan) =>
                plan.id ===
                  "pro_monthly" ||
                plan.id ===
                  "pro_yearly",
            ).map(
              (plan) => {
                const active =
                  isActive(
                    plan.id,
                  );

                return (
                  <article
                    key={
                      plan.id
                    }
                    className={
                      "sub-card" +
                      (plan.featured
                        ? " featured"
                        : "")
                    }
                  >
                    {plan.featured && (
                      <span className="sub-popular">
                        {isAr
                          ? "الأكثر مرونة"
                          : "POPULAR"}
                      </span>
                    )}

                    {plan.bestValue && (
                      <span className="sub-best">
                        {isAr
                          ? "أفضل قيمة"
                          : "BEST VALUE"}
                      </span>
                    )}

                    <div
                      className={`sub-icon ${plan.tone}`}
                    >
                      {plan.icon}
                    </div>

                    <h3>
                      {isAr
                        ? plan.ar
                        : plan.en}
                    </h3>

                    <div className="sub-price">
                      <strong>
                        {plan.price}
                      </strong>

                      <span>
                        {isAr
                          ? plan.periodAr
                          : plan.periodEn}
                      </span>
                    </div>

                    <ul className="sub-features">
                      {(isAr
                        ? plan.featuresAr
                        : plan.featuresEn
                      ).map(
                        (
                          feature,
                        ) => (
                          <li
                            key={
                              feature
                            }
                          >
                            <span className="sub-check">
                              ✓
                            </span>

                            <span>
                              {
                                feature
                              }
                            </span>
                          </li>
                        ),
                      )}
                    </ul>

                    <button
                      type="button"
                      disabled={
                        active ||
                        access.lifetime ||
                        busyPlan ===
                          plan.id
                      }
                      className={
                        "sub-card-button" +
                        (active ||
                        access.lifetime
                          ? " active"
                          : " primary")
                      }
                      onClick={() =>
                        openCheckout(
                          plan,
                        )
                      }
                    >
                      {access.lifetime
                        ? isAr
                          ? "مشمول في Lifetime ✓"
                          : "Included in Lifetime ✓"
                        : active
                          ? isAr
                            ? "الخطة مفعلة ✓"
                            : "Active Plan ✓"
                          : busyPlan ===
                              plan.id
                            ? isAr
                              ? "جارٍ فتح الدفع..."
                              : "Opening checkout..."
                            : isAr
                              ? "اختيار الخطة"
                              : "Choose Plan"}
                    </button>
                  </article>
                );
              },
            )}

            {/* LIFETIME */}

            <article className="sub-card lifetime">
              <span className="sub-best">
                LIFETIME
              </span>

              <div className="sub-icon gold">
                💎
              </div>

              <h3>
                {isAr
                  ? "Lifetime"
                  : "Lifetime"}
              </h3>

              <div className="sub-price">
                <strong>
                  $125
                </strong>

                <span>
                  {isAr
                    ? "دفعة واحدة"
                    : "one-time"}
                </span>
              </div>

              <ul className="sub-features">
                {(
                  isAr
                    ? [
                        "وصول دائم إلى جميع الأدوات الحالية",
                        "بدون اشتراك شهري أو سنوي",
                        "مصمم الأغلفة بدون حدود يومية",
                        "Micro-Niche وKeywords بدون حدود",
                        "إمكانية الاستعادة عبر كود Lifetime",
                      ]
                    : [
                        "Permanent access to all current tools",
                        "No monthly or yearly subscription",
                        "Unlimited Cover Designer",
                        "Unlimited Micro-Niche & Keywords",
                        "Lifetime recovery code support",
                      ]
                ).map(
                  (feature) => (
                    <li
                      key={
                        feature
                      }
                    >
                      <span className="sub-check">
                        ✓
                      </span>

                      <span>
                        {feature}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <button
                type="button"
                disabled={
                  access.lifetime ||
                  busyPlan ===
                    "lifetime"
                }
                className={
                  "sub-card-button" +
                  (access.lifetime
                    ? " active"
                    : " gold")
                }
                onClick={
                  buyLifetime
                }
              >
                {access.lifetime
                  ? isAr
                    ? "Lifetime مفعل ✓"
                    : "Lifetime Active ✓"
                  : busyPlan ===
                      "lifetime"
                    ? isAr
                      ? "جارٍ فتح الدفع..."
                      : "Opening checkout..."
                    : isAr
                      ? "شراء Lifetime"
                      : "Buy Lifetime"}
              </button>
            </article>
          </div>
        </section>

        {/* =================================================
            SINGLE TOOLS
            ================================================= */}

        <section className="sub-section">
          <div className="sub-section-head">
            <span>
              SINGLE TOOL
            </span>

            <h2>
              {isAr
                ? "افتح أداة واحدة"
                : "Unlock One Tool"}
            </h2>

            <p>
              {isAr
                ? "خيار اقتصادي إذا كنت تحتاج أداة واحدة بشكل مكثف."
                : "A lower-cost option when you mainly need one tool."}
            </p>
          </div>

          <div className="sub-grid">
            {PAID_PLANS.filter(
              (plan) =>
                plan.id ===
                  "cover" ||
                plan.id ===
                  "micro_niche" ||
                plan.id ===
                  "keywords",
            ).map(
              (plan) => {
                const active =
                  isActive(
                    plan.id,
                  );

                return (
                  <article
                    key={
                      plan.id
                    }
                    className="sub-card"
                  >
                    <div
                      className={`sub-icon ${plan.tone}`}
                    >
                      {plan.icon}
                    </div>

                    <h3>
                      {isAr
                        ? plan.ar
                        : plan.en}
                    </h3>

                    <div className="sub-price">
                      <strong>
                        {plan.price}
                      </strong>

                      <span>
                        {isAr
                          ? plan.periodAr
                          : plan.periodEn}
                      </span>
                    </div>

                    <ul className="sub-features">
                      {(isAr
                        ? plan.featuresAr
                        : plan.featuresEn
                      ).map(
                        (
                          feature,
                        ) => (
                          <li
                            key={
                              feature
                            }
                          >
                            <span className="sub-check">
                              ✓
                            </span>

                            <span>
                              {
                                feature
                              }
                            </span>
                          </li>
                        ),
                      )}
                    </ul>

                    <button
                      type="button"
                      disabled={
                        active ||
                        access.lifetime ||
                        busyPlan ===
                          plan.id
                      }
                      className={
                        "sub-card-button" +
                        (active ||
                        access.lifetime
                          ? " active"
                          : "")
                      }
                      onClick={() =>
                        openCheckout(
                          plan,
                        )
                      }
                    >
                      {access.lifetime
                        ? isAr
                          ? "مشمول في Lifetime ✓"
                          : "Included in Lifetime ✓"
                        : active
                          ? isAr
                            ? "مفعلة ✓"
                            : "Active ✓"
                          : busyPlan ===
                              plan.id
                            ? isAr
                              ? "جارٍ فتح الدفع..."
                              : "Opening checkout..."
                            : isAr
                              ? "اشترك الآن"
                              : "Subscribe"}
                    </button>
                  </article>
                );
              },
            )}
          </div>
        </section>

        {/* =================================================
            FREE
            ================================================= */}

        <section className="sub-section">
          <div className="sub-section-head">
            <span>
              START FREE
            </span>

            <h2>
              {isAr
                ? "الخطة المجانية"
                : "Free Plan"}
            </h2>
          </div>

          <article className="sub-free">
            <div className="sub-free-icon">
              🚀
            </div>

            <div>
              <h3>
                {isAr
                  ? "ابدأ بدون بطاقة بنكية"
                  : "Start without a credit card"}
              </h3>

              <p>
                {isAr
                  ? "استخدم الأدوات الأساسية يوميًا ثم قم بالترقية فقط عندما تحتاج المزيد."
                  : "Use the core tools every day and upgrade only when you need more."}
              </p>
            </div>

            <div className="sub-free-price">
              $0
            </div>
          </article>

          <div className="sub-free-features">
            {freeFeatures.map(
              (feature) => (
                <div
                  key={
                    feature
                  }
                  className="sub-free-feature"
                >
                  <span className="sub-check">
                    ✓
                  </span>

                  <span>
                    {feature}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =================================================
            TRUST
            ================================================= */}

        <div className="sub-trust">
          <div className="sub-trust-item">
            <b>
              🔒{" "}
              {isAr
                ? "دفع آمن"
                : "Secure checkout"}
            </b>

            {isAr
              ? "عمليات الدفع تتم عبر Lemon Squeezy."
              : "Payments are processed through Lemon Squeezy."}
          </div>

          <div className="sub-trust-item">
            <b>
              ⚡{" "}
              {isAr
                ? "تفعيل تلقائي"
                : "Automatic access"}
            </b>

            {isAr
              ? "بعد نجاح الدفع يتم تحديث وصول الحساب."
              : "Your account access updates after successful payment."}
          </div>

          <div className="sub-trust-item">
            <b>
              ⚙️{" "}
              {isAr
                ? "إدارة الاشتراك"
                : "Subscription control"}
            </b>

            {isAr
              ? "يمكن للمشترك إدارة الفواتير والاشتراك من بوابة العميل."
              : "Subscribers can manage billing through the customer portal."}
          </div>
        </div>

        <p className="sub-note">
          {isAr
            ? "يمكن تفعيل أو استعادة Lifetime من القائمة ☰ ← الحساب والوصول. AllWDbook أداة مستقلة وليست تابعة لأي منصة نشر."
            : "Lifetime activation and recovery are available from ☰ → Account & Access. AllWDbook is an independent publishing tool."}
        </p>
      </div>

      {/* ===================================================
          BOTTOM NAV
          =================================================== */}

      <nav className="sub-bottom-nav">
        <a
          href="/tools"
          className="sub-nav-link"
        >
          <span className="sub-nav-icon">
            🧰
          </span>

          <span>
            {isAr
              ? "الأدوات"
              : "Tools"}
          </span>
        </a>

        <a
          href="/"
          className="sub-nav-link"
        >
          <span className="sub-nav-icon">
            🏠
          </span>

          <span>
            {isAr
              ? "الرئيسية"
              : "Home"}
          </span>
        </a>

        <a
          href="/subscription"
          className="sub-nav-link active"
        >
          <span className="sub-nav-icon">
            👑
          </span>

          <span>
            {isAr
              ? "الاشتراك"
              : "Plan"}
          </span>
        </a>

        <a
          href="/blog"
          className="sub-nav-link"
        >
          <span className="sub-nav-icon">
            📰
          </span>

          <span>
            {isAr
              ? "المدونة"
              : "Blog"}
          </span>
        </a>
      </nav>
    </main>
  );
}
