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
  PAYMENT_STATUS,
} from "../../lib/plans";

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
    en: "Keyword Research",
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

export default function SubscriptionPage() {
  const access =
    useAccess();

  const [
    lang,
    setLang,
  ] = useState("ar");

  const isAr =
    lang === "ar";

  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        "awd_lang"
      );

    if (
      saved === "ar" ||
      saved === "en"
    ) {
      setLang(saved);
    }

    function syncLanguage(
      event
    ) {
      const next =
        event?.detail ||
        window.localStorage.getItem(
          "awd_lang"
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
      syncLanguage
    );

    return () => {
      window.removeEventListener(
        "awd-language-change",
        syncLanguage
      );
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "awd_lang",
      lang
    );

    document.documentElement.lang =
      lang;

    document.documentElement.dir =
      isAr
        ? "rtl"
        : "ltr";
  }, [
    lang,
    isAr,
  ]);

  function toggleLanguage() {
    const next =
      isAr
        ? "en"
        : "ar";

    setLang(next);

    window.localStorage.setItem(
      "awd_lang",
      next
    );

    window.dispatchEvent(
      new CustomEvent(
        "awd-language-change",
        {
          detail: next,
        }
      )
    );
  }

  const activePlans =
    Array.isArray(
      access.plans
    )
      ? access.plans
      : [];

  function planLabel(
    planId
  ) {
    const plan =
      PLAN_NAMES[planId];

    if (!plan) {
      return planId;
    }

    return isAr
      ? plan.ar
      : plan.en;
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
                planLabel
              )
              .join(
                " · "
              )
          : planLabel(
              access.plan ||
                "free"
            );

  const billingUrl =
    Array.isArray(
      access.subscriptions
    )
      ? access.subscriptions.find(
          (item) =>
            item
              ?.customer_portal_url
        )
          ?.customer_portal_url ||
        ""
      : "";

  const paymentMessage =
    isAr
      ? PAYMENT_STATUS.messageAr
      : PAYMENT_STATUS.messageEn;

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

  return (
    <main
      className="payment-page"
      dir={
        isAr
          ? "rtl"
          : "ltr"
      }
    >
      <style jsx global>{`
        .payment-page,
        .payment-page * {
          box-sizing:
            border-box;
        }

        .payment-page {
          min-height:
            100dvh;

          margin: 0;

          padding-bottom:
            calc(
              96px +
              env(
                safe-area-inset-bottom
              )
            );

          color:
            #f5f7fb;

          background:
            radial-gradient(
              circle at
                50% -180px,
              rgba(
                34,
                91,
                160,
                0.24
              ),
              transparent
                460px
            ),
            linear-gradient(
              180deg,
              #02060d,
              #030b17
                48%,
              #020812
            );

          font-family:
            Arial,
            sans-serif;
        }

        .payment-shell {
          width:
            min(
              760px,
              calc(
                100% -
                28px
              )
            );

          margin-inline:
            auto;
        }

        .payment-header {
          position:
            sticky;

          top: 0;

          z-index:
            50;

          border-bottom:
            1px solid
            rgba(
              100,
              140,
              190,
              0.14
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

        .payment-header-inner {
          min-height:
            70px;

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

        .payment-back,
        .payment-lang {
          width: 42px;
          height: 42px;

          display:
            grid;

          place-items:
            center;

          padding: 0;

          border:
            1px solid
            #17314d;

          border-radius:
            13px;

          background:
            #07182a;

          color:
            white;

          text-decoration:
            none;

          font-size:
            18px;

          cursor:
            pointer;
        }

        .payment-brand {
          min-width: 0;

          display:
            flex;

          align-items:
            center;

          gap: 10px;

          text-decoration:
            none;
        }

        .payment-brand img {
          width: 43px;
          height: 43px;

          flex:
            0 0 43px;

          object-fit:
            cover;

          border-radius:
            13px;
        }

        .payment-brand-copy {
          min-width: 0;
        }

        .payment-brand-copy strong {
          display:
            block;

          color:
            white;

          font-size:
            17px;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }

        .payment-brand-copy small {
          display:
            block;

          margin-top:
            3px;

          color:
            #7f92aa;

          font-size:
            10px;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }

        .payment-content {
          padding-top:
            26px;
        }

        .payment-status-card {
          position:
            relative;

          overflow:
            hidden;

          padding:
            28px 22px;

          border:
            1px solid
            rgba(
              255,
              157,
              58,
              0.34
            );

          border-radius:
            24px;

          background:
            radial-gradient(
              circle at
                100% 0%,
              rgba(
                255,
                105,
                0,
                0.14
              ),
              transparent
                46%
            ),
            linear-gradient(
              155deg,
              #0a1a2f,
              #051321
            );

          box-shadow:
            0 22px 60px
            rgba(
              0,
              0,
              0,
              0.22
            );
        }

        [dir="rtl"]
          .payment-status-card {
          background:
            radial-gradient(
              circle at
                0% 0%,
              rgba(
                255,
                105,
                0,
                0.14
              ),
              transparent
                46%
            ),
            linear-gradient(
              155deg,
              #0a1a2f,
              #051321
            );
        }

        .payment-status-badge {
          display:
            inline-flex;

          align-items:
            center;

          gap: 7px;

          padding:
            7px 11px;

          border:
            1px solid
            rgba(
              255,
              151,
              62,
              0.32
            );

          border-radius:
            999px;

          background:
            rgba(
              255,
              105,
              0,
              0.09
            );

          color:
            #ff9a57;

          font-size:
            10px;

          font-weight:
            900;
        }

        .payment-status-dot {
          width: 7px;
          height: 7px;

          border-radius:
            50%;

          background:
            #ff7c2a;

          box-shadow:
            0 0 12px
            rgba(
              255,
              105,
              0,
              0.65
            );
        }

        .payment-status-card h1 {
          margin:
            20px
            0
            0;

          color:
            white;

          font-size:
            clamp(
              29px,
              7vw,
              43px
            );

          line-height:
            1.15;
        }

        .payment-status-card h1 span {
          color:
            #ff7b2b;
        }

        .payment-status-text {
          max-width:
            650px;

          margin:
            16px
            0
            0;

          color:
            #9eb0c6;

          font-size:
            14px;

          line-height:
            1.85;
        }

        .payment-notice {
          display:
            grid;

          grid-template-columns:
            auto
            minmax(
              0,
              1fr
            );

          gap: 12px;

          align-items:
            start;

          margin-top:
            22px;

          padding:
            15px;

          border:
            1px solid
            rgba(
              255,
              167,
              86,
              0.2
            );

          border-radius:
            16px;

          background:
            rgba(
              255,
              105,
              0,
              0.06
            );
        }

        .payment-notice-icon {
          font-size:
            23px;
        }

        .payment-notice strong {
          display:
            block;

          color:
            #ffd0ad;

          font-size:
            13px;
        }

        .payment-notice p {
          margin:
            5px
            0
            0;

          color:
            #9aabc0;

          font-size:
            11px;

          line-height:
            1.7;
        }

        .payment-section {
          margin-top:
            18px;

          padding:
            20px;

          border:
            1px solid
            #142e49;

          border-radius:
            20px;

          background:
            linear-gradient(
              150deg,
              #07182b,
              #04111f
            );
        }

        .payment-section-label {
          display:
            block;

          color:
            #637b98;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            1.2px;
        }

        .payment-section h2 {
          margin:
            7px
            0
            0;

          color:
            white;

          font-size:
            20px;
        }

        .payment-access-value {
          margin-top:
            14px;

          padding:
            14px;

          border:
            1px solid
            #193653;

          border-radius:
            14px;

          background:
            #061426;

          color:
            #dbe8f5;

          font-size:
            13px;

          font-weight:
            800;
        }

        .payment-billing {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            43px;

          margin-top:
            12px;

          padding:
            9px 14px;

          border:
            1px solid
            #214365;

          border-radius:
            12px;

          background:
            #081b30;

          color:
            #c8d7e8;

          text-decoration:
            none;

          font-size:
            11px;

          font-weight:
            800;
        }

        .payment-free-grid {
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

          gap: 9px;

          margin-top:
            15px;
        }

        .payment-free-item {
          display:
            grid;

          grid-template-columns:
            auto
            minmax(
              0,
              1fr
            );

          gap: 8px;

          align-items:
            start;

          padding:
            12px;

          border:
            1px solid
            rgba(
              67,
              104,
              145,
              0.18
            );

          border-radius:
            13px;

          background:
            rgba(
              7,
              25,
              45,
              0.72
            );

          color:
            #9dafc4;

          font-size:
            11px;

          line-height:
            1.6;
        }

        .payment-check {
          color:
            #43d89a;

          font-weight:
            900;
        }

        .payment-actions {
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

          gap: 10px;

          margin-top:
            18px;
        }

        .payment-action {
          min-height:
            49px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            10px 14px;

          border:
            1px solid
            #1c3b5c;

          border-radius:
            13px;

          background:
            #07182b;

          color:
            #dce8f5;

          text-decoration:
            none;

          text-align:
            center;

          font-size:
            12px;

          font-weight:
            900;
        }

        .payment-action.primary {
          border-color:
            rgba(
              255,
              105,
              0,
              0.55
            );

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7c22
            );

          color:
            white;
        }

        .payment-footer-note {
          margin:
            22px
            0
            0;

          padding:
            0 10px;

          color:
            #576d86;

          text-align:
            center;

          font-size:
            10px;

          line-height:
            1.7;
        }

        .payment-bottom-nav {
          position:
            fixed;

          inset-inline:
            0;

          bottom: 0;

          z-index:
            100;

          min-height:
            76px;

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
              93,
              132,
              180,
              0.16
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

        .payment-nav-link {
          min-height:
            58px;

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
            14px;

          color:
            #66798f;

          text-decoration:
            none;

          font-size:
            10px;
        }

        .payment-nav-link.active {
          color:
            #ff8540;

          background:
            rgba(
              255,
              105,
              0,
              0.08
            );
        }

        .payment-nav-icon {
          font-size:
            21px;
        }

        @media (
          max-width:
            620px
        ) {
          .payment-shell {
            width: 100%;

            padding-inline:
              14px;
          }

          .payment-header-inner {
            min-height:
              68px;
          }

          .payment-brand-copy small {
            display:
              none;
          }

          .payment-content {
            padding-top:
              16px;
          }

          .payment-status-card {
            padding:
              23px 17px;

            border-radius:
              21px;
          }

          .payment-status-text {
            font-size:
              12px;
          }

          .payment-section {
            padding:
              17px;
          }

          .payment-free-grid {
            grid-template-columns:
              1fr;
          }

          .payment-actions {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>

      <header className="payment-header">
        <div className="payment-shell">
          <div className="payment-header-inner">
            <a
              href="/"
              className="payment-back"
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
              className="payment-brand"
            >
              <img
                src="/logov3.png"
                alt="AllWDbook"
              />

              <div className="payment-brand-copy">
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
              className="payment-lang"
              onClick={
                toggleLanguage
              }
              aria-label={
                isAr
                  ? "English"
                  : "العربية"
              }
            >
              🌐
            </button>
          </div>
        </div>
      </header>

      <div className="payment-shell">
        <div className="payment-content">
          <section className="payment-status-card">
            <span className="payment-status-badge">
              <span className="payment-status-dot" />

              {isAr
                ? "حالة الدفع"
                : "PAYMENT STATUS"}
            </span>

            <h1>
              {isAr
                ? "الدفع متوقف "
                : "Payments are "}

              <span>
                {isAr
                  ? "مؤقتًا."
                  : "temporarily paused."}
              </span>
            </h1>

            <p className="payment-status-text">
              {paymentMessage}
            </p>

            <div className="payment-notice">
              <span className="payment-notice-icon">
                🛡️
              </span>

              <div>
                <strong>
                  {isAr
                    ? "استكمال توثيق مزود الدفع"
                    : "Payment provider verification"}
                </strong>

                <p>
                  {isAr
                    ? "تم إيقاف عمليات الشراء الجديدة مؤقتًا إلى حين اكتمال التوثيق. لا تحتاج إلى القيام بأي شيء، وستعود الخطط المدفوعة بعد اكتمال العملية."
                    : "New purchases are temporarily disabled while verification is completed. No action is required from you. Paid plans will return after verification."}
                </p>
              </div>
            </div>
          </section>

          <section className="payment-section">
            <span className="payment-section-label">
              {isAr
                ? "الوصول الحالي"
                : "CURRENT ACCESS"}
            </span>

            <h2>
              {isAr
                ? "خطتك الحالية"
                : "Your current access"}
            </h2>

            <div className="payment-access-value">
              {currentAccess}
            </div>

            {billingUrl ? (
              <a
                href={
                  billingUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="payment-billing"
              >
                ⚙️{" "}
                {isAr
                  ? "إدارة الاشتراك والفواتير الحالية"
                  : "Manage existing subscription"}
              </a>
            ) : null}
          </section>

          <section className="payment-section">
            <span className="payment-section-label">
              FREE ACCESS
            </span>

            <h2>
              {isAr
                ? "يمكنك الاستمرار مجانًا"
                : "Keep using AllWDbook for free"}
            </h2>

            <div className="payment-free-grid">
              {freeFeatures.map(
                (
                  feature
                ) => (
                  <div
                    key={
                      feature
                    }
                    className="payment-free-item"
                  >
                    <span className="payment-check">
                      ✓
                    </span>

                    <span>
                      {feature}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

          <div className="payment-actions">
            <a
              href="/"
              className="payment-action primary"
            >
              {isAr
                ? "العودة إلى الأدوات"
                : "Return to Tools"}
            </a>

            <a
              href="/blog"
              className="payment-action"
            >
              {isAr
                ? "استكشف المدونة"
                : "Explore the Blog"}
            </a>
          </div>

          <p className="payment-footer-note">
            {isAr
              ? "أي وصول مدفوع أو Lifetime مفعّل سابقًا يبقى صالحًا. إيقاف الدفع يخص عمليات الشراء الجديدة فقط."
              : "Existing paid and Lifetime access remains valid. The temporary pause only affects new purchases."}
          </p>
        </div>
      </div>

      <nav className="payment-bottom-nav">
        <a
          href="/"
          className="payment-nav-link"
        >
          <span className="payment-nav-icon">
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
          className="payment-nav-link"
        >
          <span className="payment-nav-icon">
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
          className="payment-nav-link active"
        >
          <span className="payment-nav-icon">
            ⏸️
          </span>

          <span>
            {isAr
              ? "الدفع"
              : "Payments"}
          </span>
        </a>
      </nav>
    </main>
  );
}
