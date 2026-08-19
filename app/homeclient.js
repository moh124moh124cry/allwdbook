"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./home.css";

import { T } from "../lib/i18n";
import { NICHE_CATEGORIES } from "../lib/niches";

import {
  printCost,
  royaltyPerUnit,
  royaltyRate,
  marketInfo,
} from "../lib/estimate";

import CoverTool from "./covertool";
import KeywordsPanel from "./keywordspanel";
import AccountMenu from "./accountmenu";
import UpgradePrompt, {
  shouldBlockRememberedLimit,
} from "./upgradeprompt";

import { getSupabase } from "../lib/supabase";

/* =========================================================
   MARKETS
   ========================================================= */

const MARKETS = [
  {
    code: "amazon.com",
    flag: "🇺🇸",
    ar: "الولايات المتحدة",
    en: "United States",
    sym: "$",
  },
  {
    code: "amazon.co.uk",
    flag: "🇬🇧",
    ar: "المملكة المتحدة",
    en: "United Kingdom",
    sym: "£",
  },
  {
    code: "amazon.de",
    flag: "🇩🇪",
    ar: "ألمانيا",
    en: "Germany",
    sym: "€",
  },
  {
    code: "amazon.fr",
    flag: "🇫🇷",
    ar: "فرنسا",
    en: "France",
    sym: "€",
  },
  {
    code: "amazon.it",
    flag: "🇮🇹",
    ar: "إيطاليا",
    en: "Italy",
    sym: "€",
  },
  {
    code: "amazon.es",
    flag: "🇪🇸",
    ar: "إسبانيا",
    en: "Spain",
    sym: "€",
  },
  {
    code: "amazon.ca",
    flag: "🇨🇦",
    ar: "كندا",
    en: "Canada",
    sym: "C$",
  },
];

/* =========================================================
   TOOLS
   ========================================================= */

const TOOLS = [
  {
    id: 5,
    icon: "🧮",
    tone: "orange",
    ar: "حاسبة الأرباح",
    en: "Royalty Calculator",
    dar: "احسب تكلفة الطباعة وأرباح كل نسخة قبل النشر.",
    den: "Estimate printing costs and royalties before publishing.",
  },
  {
    id: 6,
    icon: "📐",
    tone: "violet",
    ar: "مصمم الأغلفة",
    en: "Cover Designer",
    dar: "أنشئ غلافًا احترافيًا بالمقاسات المناسبة.",
    den: "Create a professional cover with the right dimensions.",
    isNew: true,
  },
  {
    id: 0,
    icon: "🔑",
    tone: "blue",
    ar: "الكلمات المفتاحية",
    en: "Keyword Research",
    dar: "ابحث عن كلمات تساعد كتابك على الوصول إلى جمهور أكبر.",
    den: "Find keywords that help your book reach more readers.",
  },
  {
    id: 1,
    icon: "🎯",
    tone: "green",
    ar: "بحث النيش",
    en: "Micro-Niche Research",
    dar: "اكتشف أفكارًا متخصصة وفرصًا تستحق التحليل.",
    den: "Discover focused niches and opportunities worth analyzing.",
  },
  {
    id: 4,
    icon: "✍️",
    tone: "pink",
    ar: "وصف الكتاب",
    en: "Book Description",
    dar: "جهز وصفًا منظمًا وجذابًا لصفحة كتابك.",
    den: "Prepare a clean and persuasive book description.",
  },
];

const HERO_SLIDES = [
  {
    ar: "كل أدوات النشر الرقمي في مكان واحد",
    en: "Your publishing toolkit in one place",
  },
  {
    ar: "ابحث، حلّل، صمّم وانشر بثقة",
    en: "Research, analyze, design and publish with confidence",
  },
  {
    ar: "من الفكرة إلى كتاب جاهز للنشر",
    en: "From idea to publish-ready book",
  },
];

/* =========================================================
   LANGUAGE PREFERENCE
   ========================================================= */

function normalizeLanguage(value) {
  return value === "en"
    ? "en"
    : "ar";
}

function persistLanguage(value) {
  const next =
    normalizeLanguage(value);

  try {
    window.localStorage.setItem(
      "awd_lang",
      next,
    );
  } catch (error) {
    /*
     * تعذر localStorage لا يجب
     * أن يعطل الواجهة.
     */
  }

  try {
    const secure =
      window.location.protocol ===
      "https:"
        ? "; Secure"
        : "";

    document.cookie =
      `awd_lang=${encodeURIComponent(
        next,
      )}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  } catch (error) {
    /*
     * تعذر حفظ Cookie لا يجب
     * أن يعطل الواجهة.
     */
  }
}

/* =========================================================
   HOME
   ========================================================= */

export default function HomeClient({
  initialLang = "ar",
  hasLanguageCookie = false,
}) {
  const [lang, setLang] =
    useState(
      normalizeLanguage(
        initialLang,
      ),
    );

  const [tab, setTab] =
    useState(null);

  const [
    marketCode,
    setMarketCode,
  ] = useState("amazon.com");

  const [
    seedKw,
    setSeedKw,
  ] = useState("");

  const [slide, setSlide] =
    useState(0);

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);

  const [usage, setUsage] =
    useState({
      used: 0,
      limit: 50000,
      planNameAr:
        "الخطة المجانية",
      planNameEn:
        "Free Plan",
      endsAt: null,
    });

  const t =
    T[lang] || T.ar;

  const isAr =
    lang === "ar";

  /* =======================================================
     LANGUAGE
     ======================================================= */

  useEffect(() => {
    /*
     * في الوضع النهائي سيصل initialLang
     * من Cookie يقرأها الخادم قبل أول Render.
     *
     * هذا الجزء يهاجر المستخدمين القدامى فقط
     * ممن كانت لغتهم محفوظة في localStorage
     * قبل إضافة Cookie.
     */
    if (hasLanguageCookie) {
      return;
    }

    try {
      const saved =
        window.localStorage.getItem(
          "awd_lang",
        );

      if (
        saved &&
        T[saved]
      ) {
        const migrated =
          normalizeLanguage(
            saved,
          );

        persistLanguage(
          migrated,
        );

        if (
          migrated !== lang
        ) {
          setLang(
            migrated,
          );
        }

        return;
      }
    } catch (error) {
      /*
       * نستمر باللغة التي
       * أرسلها الخادم.
       */
    }

    persistLanguage(
      lang,
    );
  }, [
    hasLanguageCookie,
  ]);

  useEffect(() => {
    document.documentElement.lang =
      lang;

    document.documentElement.dir =
      isAr
        ? "rtl"
        : "ltr";

    persistLanguage(
      lang,
    );
  }, [
    lang,
    isAr,
  ]);

  useEffect(() => {
    function syncLanguage(
      event,
    ) {
      const next =
        event?.detail;

      if (
        next &&
        T[next]
      ) {
        setLang(
          normalizeLanguage(
            next,
          ),
        );
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

  function toggleLanguage() {
    const next =
      isAr
        ? "en"
        : "ar";

    /*
     * نحفظ اللغة الجديدة أولًا،
     * ثم نعيد تحميل الصفحة بالكامل.
     *
     * السبب:
     * Root Layout في Next.js لا يعاد
     * رندره تلقائيًا أثناء التنقل
     * بين الصفحات، لذلك التبديل الفوري
     * بين RTL و LTR قد يترك تخطيطًا
     * قديمًا للحظات ويسبب الوميض.
     *
     * إعادة التحميل تجعل الخادم يقرأ
     * Cookie الجديدة قبل أول Render،
     * فتظهر اللغة والاتجاه الصحيحان
     * من البداية.
     */
    persistLanguage(
      next,
    );

    window.location.reload();
  }

  /* =======================================================
     DRAWER
     ======================================================= */

  useEffect(() => {
    if (!drawerOpen) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [drawerOpen]);

  /* =======================================================
     USAGE
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadUsage() {
      try {
        const supabase =
          getSupabase();

        let {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (
          !session?.access_token
        ) {
          const {
            data,
          } =
            await supabase.auth.signInAnonymously();

          session =
            data?.session ||
            null;
        }

        if (
          !session?.access_token ||
          cancelled
        ) {
          return;
        }

        const response =
          await fetch(
            "/api/usage/me",
            {
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        setUsage(
          (current) => ({
            ...current,

            used:
              Number(
                data?.used,
              ) || 0,

            limit:
              Number(
                data?.limit,
              ) ||
              current.limit,

            planNameAr:
              data?.planNameAr ||
              current.planNameAr,

            planNameEn:
              data?.planNameEn ||
              current.planNameEn,

            endsAt:
              data?.endsAt ||
              current.endsAt,
          }),
        );
      } catch (error) {
        console.error(
          "Usage load failed:",
          error,
        );
      }
    }

    loadUsage();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     HERO SLIDER
     ======================================================= */

  /*
   * Auto-rotation disabled temporarily.
   * The user can still switch slides manually
   * using the dots below the hero.
   *
   * This test isolates periodic layout shifts
   * caused by English headlines wrapping
   * to different numbers of lines.
   */

  const market =
    MARKETS.find(
      (item) =>
        item.code ===
        marketCode,
    ) || MARKETS[0];

  const usagePercent =
    usage.limit > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (usage.used /
              usage.limit) *
              100,
          ),
        )
      : 0;

  function openTool(id) {
    setDrawerOpen(false);
    setTab(id);

    window.setTimeout(
      () => {
        document
          .getElementById(
            "awd-workspace",
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
            block: "start",
          });
      },
      100,
    );
  }

  function sendToKeywords(
    keyword,
  ) {
    setSeedKw(keyword);
    openTool(0);
  }

  function scrollToTools() {
    setDrawerOpen(false);

    window.setTimeout(() => {
      const section =
        document.getElementById(
          "awd-tools",
        );

      if (!section) {
        return;
      }

      const top =
        section.getBoundingClientRect()
          .top +
        window.scrollY -
        88;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }, 80);
  }

  function goHome() {
    setDrawerOpen(false);
    setTab(null);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main
      className="awd-app"
      dir={
        isAr
          ? "rtl"
          : "ltr"
      }
    >

      {/* ===================================================
          DRAWER
          =================================================== */}

      <div
        className={
          "awd-drawer-backdrop" +
          (drawerOpen
            ? " open"
            : "")
        }
        onClick={() =>
          setDrawerOpen(false)
        }
      />

      <aside
        className={
          "awd-drawer" +
          (drawerOpen
            ? " open"
            : "")
        }
        aria-hidden={
          !drawerOpen
        }
      >
        <header className="awd-drawer-head">
          <img
            className="awd-drawer-logo"
            src="/logov3.png"
            alt="AllWDbook"          />

          <div className="awd-drawer-brand">
            <strong>
              AllWDbook
            </strong>

            <span>
              KDP Tools & Digital Publishing
            </span>
          </div>

          <button
            type="button"
            className="awd-drawer-close"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            ✕
          </button>
        </header>

        {/* MAIN */}

        <section className="awd-menu-section">
          <span className="awd-menu-label">
            {isAr
              ? "القائمة"
              : "Navigation"}
          </span>

          <nav className="awd-menu-links">
            <button
              type="button"
              className="awd-menu-link active"
              onClick={goHome}
            >
              <span className="awd-menu-icon">
                🏠
              </span>

              <span className="awd-menu-text">
                <strong>
                  {isAr
                    ? "الرئيسية"
                    : "Home"}
                </strong>

                <small>
                  {isAr
                    ? "لوحة AllWDbook"
                    : "AllWDbook dashboard"}
                </small>
              </span>
            </button>

            <button
              type="button"
              className="awd-menu-link"
              onClick={scrollToTools}
            >
              <span className="awd-menu-icon">
                🧰
              </span>

              <span className="awd-menu-text">
                <strong>
                  {isAr
                    ? "كل الأدوات"
                    : "All Tools"}
                </strong>

                <small>
                  {isAr
                    ? "الوصول إلى أدوات النشر"
                    : "Publishing toolkit"}
                </small>
              </span>
            </button>

            <Link
              href="/subscription"
              className="awd-menu-link"
              onClick={() =>
                setDrawerOpen(false)
              }
            >
              <span className="awd-menu-icon">
                👑
              </span>

              <span className="awd-menu-text">
                <strong>
                  {isAr
                    ? "الخطط والاشتراك"
                    : "Plans & Subscription"}
                </strong>

                <small>
                  {isAr
                    ? "إدارة مستوى الوصول"
                    : "Manage your access"}
                </small>
              </span>
            </Link>

            <Link
              href="/blog"
              className="awd-menu-link"
              onClick={() =>
                setDrawerOpen(false)
              }
            >
              <span className="awd-menu-icon">
                📰
              </span>

              <span className="awd-menu-text">
                <strong>
                  {isAr
                    ? "المدونة"
                    : "Blog"}
                </strong>

                <small>
                  {isAr
                    ? "نصائح وأدلة النشر"
                    : "Publishing guides"}
                </small>
              </span>
            </Link>
          </nav>
        </section>

        {/* ACCOUNT */}

        <section className="awd-menu-section">
          <span className="awd-menu-label">
            {isAr
              ? "الحساب"
              : "Account"}
          </span>

          <div className="awd-account-menu-row">
            <div className="awd-account-menu-copy">
              <strong>
                {isAr
                  ? "الحساب والوصول"
                  : "Account & Access"}
              </strong>

              <span>
                {isAr
                  ? "الخطط، Lifetime والاستعادة"
                  : "Plans, Lifetime & recovery"}
              </span>
            </div>

            <AccountMenu />
          </div>
        </section>

        {/* MARKET */}

        <section className="awd-menu-section">
          <span className="awd-menu-label">
            {isAr
              ? "الإعدادات"
              : "Settings"}
          </span>

          <div className="awd-market-card">
            <label htmlFor="drawer-market">
              {isAr
                ? "السوق المستهدف"
                : "Target marketplace"}
            </label>

            <select
              id="drawer-market"
              value={
                marketCode
              }
              onChange={(
                event,
              ) =>
                setMarketCode(
                  event.target
                    .value,
                )
              }
            >
              {MARKETS.map(
                (item) => (
                  <option
                    key={
                      item.code
                    }
                    value={
                      item.code
                    }
                  >
                    {item.flag}{" "}
                    {isAr
                      ? item.ar
                      : item.en}
                  </option>
                ),
              )}
            </select>
          </div>

          <button
            type="button"
            className="awd-menu-link"
            onClick={
              toggleLanguage
            }
            style={{
              marginTop: 6,
            }}
          >
            <span className="awd-menu-icon">
              🌐
            </span>

            <span className="awd-menu-text">
              <strong>
                {isAr
                  ? "English"
                  : "العربية"}
              </strong>

              <small>
                {isAr
                  ? "تغيير لغة الواجهة"
                  : "Change interface language"}
              </small>
            </span>
          </button>
        </section>

        {/* LEGAL */}

        <section className="awd-menu-section">
          <span className="awd-menu-label">
            {isAr
              ? "AllWDbook"
              : "AllWDbook"}
          </span>

          <nav className="awd-menu-links">
            <Link
              href="/about"
              className="awd-menu-link"
              onClick={() =>
                setDrawerOpen(false)
              }
            >
              <span className="awd-menu-icon">
                ℹ️
              </span>

              <span>
                {isAr
                  ? "حول AllWDbook"
                  : "About AllWDbook"}
              </span>
            </Link>

            <Link
              href="/privacy"
              className="awd-menu-link"
              onClick={() =>
                setDrawerOpen(false)
              }
            >
              <span className="awd-menu-icon">
                🔒
              </span>

              <span>
                {isAr
                  ? "الخصوصية"
                  : "Privacy"}
              </span>
            </Link>

            <Link
              href="/terms"
              className="awd-menu-link"
              onClick={() =>
                setDrawerOpen(false)
              }
            >
              <span className="awd-menu-icon">
                📄
              </span>

              <span>
                {isAr
                  ? "الشروط"
                  : "Terms"}
              </span>
            </Link>

            <Link
              href="/refund"
              className="awd-menu-link"
              onClick={() =>
                setDrawerOpen(false)
              }
            >
              <span className="awd-menu-icon">
                ↩️
              </span>

              <span>
                {isAr
                  ? "سياسة الاسترداد"
                  : "Refund Policy"}
              </span>
            </Link>
          </nav>
        </section>
      </aside>

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="awd-header-wrap">
        <div className="awd-shell">
          <header className="awd-header">
            {/* زر القائمة */}

            <button
              type="button"
              className="awd-menu-button"
              onClick={() =>
                setDrawerOpen(
                  true,
                )
              }
              aria-label={
                isAr
                  ? "فتح القائمة"
                  : "Open menu"
              }
            >
              <span className="awd-menu-lines">
                <span />
                <span />
                <span />
              </span>
            </button>

            {/* شعار واحد فقط */}

            <div
              className="awd-brand"
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 11,
                overflow: "hidden",
              }}
            >
              <img
                className="awd-brand-logo"
                src="/logov3.png"
                alt="AllWDbook"
                width="46"
                height="46"
                style={{
                  display: "block",
                  flex: "0 0 auto",
                  objectFit: "cover",
                  borderRadius: 14,
                }}
              />

              <div
                className="awd-brand-copy"
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    margin: 0,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  AllWDbook
                </strong>

                <small
                  style={{
                    display: "block",
                    marginTop: 2,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  KDP Tools & Digital Publishing
                </small>
              </div>
            </div>

            {/* لا توجد أيقونة حساب هنا */}

            <div className="awd-header-actions">
              <button
                type="button"
                className="awd-icon-button"
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

              <button
                type="button"
                className="awd-icon-button"
                aria-label={
                  isAr
                    ? "الإشعارات"
                    : "Notifications"
                }
              >
                🔔

                <span className="awd-notification">
                  3
                </span>
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* ===================================================
          CONTENT
          =================================================== */}

      <div className="awd-shell">
        {/* HERO */}

        <div className="awd-hero-wrap">
          <section className="awd-hero">
            <div className="awd-hero-content">
              <div className="awd-eyebrow">
                <span className="awd-eyebrow-dot" />

                <span>
                  {isAr
                    ? "منصة أدوات للنشر الرقمي"
                    : "Digital publishing toolkit"}
                </span>
              </div>

              <h1>
                {isAr
                  ? HERO_SLIDES[
                      slide
                    ].ar
                  : HERO_SLIDES[
                      slide
                    ].en}
                <span>
                  .
                </span>
              </h1>

              <p className="awd-hero-description">
                {isAr
                  ? "مجموعة مركزة من الأدوات تساعدك على البحث عن الفرص، تحليل الكلمات والنيشات، حساب الأرباح، تصميم الأغلفة وتجهيز محتوى كتابك."
                  : "A focused suite of tools for opportunity research, keywords, niche analysis, royalty calculations, cover design and book publishing."}
              </p>
{/* BlogTicker disabled temporarily for flicker test */}
              <div className="awd-hero-buttons">
                <button
                  type="button"
                  className="awd-primary"
                  onClick={() =>
                    openTool(5)
                  }
                >
                  {isAr
                    ? "ابدأ مجانًا"
                    : "Start Free"}{" "}
                  🚀
                </button>

                <button
                  type="button"
                  className="awd-secondary"
                  onClick={
                    scrollToTools
                  }
                >
                  {isAr
                    ? "استكشف الأدوات"
                    : "Explore Tools"}
                </button>
              </div>

              <div className="awd-trust-row">
                <div className="awd-trust">
                  ✅
                  <span>
                    {isAr
                      ? "أدوات في مكان واحد"
                      : "All-in-one tools"}
                  </span>
                </div>

                <div className="awd-trust">
                  ⚡
                  <span>
                    {isAr
                      ? "سريع وسهل"
                      : "Fast & simple"}
                  </span>
                </div>

                <div className="awd-trust">
                  🔒
                  <span>
                    {isAr
                      ? "ابدأ مجانًا"
                      : "Start free"}
                  </span>
                </div>
              </div>

              <div className="awd-dots">
                {HERO_SLIDES.map(
                  (
                    _,
                    index,
                  ) => (
                    <button                      key={
                        index
                      }
                      type="button"
                      className={
                        "awd-dot" +
                        (slide ===
                        index
                          ? " active"
                          : "")
                      }
                      onClick={() =>
                        setSlide(
                          index,
                        )
                      }
                      aria-label={`Slide ${
                        index + 1
                      }`}
                    />
                  ),
                )}
              </div>
            </div>

            {/* يظهر فقط على الشاشات الكبيرة */}

            <div className="awd-hero-visual">
              <span className="awd-hero-orbit" />

              <img
                className="awd-hero-logo"
                src="/logov3.png"
                alt="AllWDbook"
              />

              <div className="awd-mini-stat awd-stat-one">
                <strong>
                  5+
                </strong>

                {isAr
                  ? "أدوات احترافية"
                  : "Professional tools"}
              </div>

              <div className="awd-mini-stat awd-stat-two">
                <strong>
                  KDP
                </strong>

                {isAr
                  ? "بحث ونشر"
                  : "Research & publish"}
              </div>
            </div>
          </section>
        </div>

        {/* TOOLS */}

        <section
          id="awd-tools"
          className="awd-section"
        >
          <div className="awd-section-head">
            <div>
              <span className="awd-section-kicker">
                ALLWDBOOK TOOLS
              </span>

              <h2>
                {isAr
                  ? "أدواتك الاحترافية"
                  : "Professional Tools"}
              </h2>

              <p>
                {isAr
                  ? "اختر ما تحتاجه وابدأ العمل مباشرة."
                  : "Choose what you need and get to work."}
              </p>
            </div>

            <button
              type="button"
              className="awd-view-all"
              onClick={scrollToTools}
            >
              {isAr
                ? "عرض الكل ←"
                : "View all →"}
            </button>
          </div>

          <div className="awd-tools-grid">
            {TOOLS.map(
              (tool) => (
                <article
                  key={
                    tool.id
                  }
                  className="awd-tool-card"
                >
                  {tool.isNew && (
                    <span className="awd-new-badge">
                      {isAr
                        ? "جديد"
                        : "NEW"}
                    </span>
                  )}

                  <div
                    className={`awd-tool-icon ${tool.tone}`}
                  >
                    {tool.icon}
                  </div>

                  <h3>
                    {isAr
                      ? tool.ar
                      : tool.en}
                  </h3>

                  <p>
                    {isAr
                      ? tool.dar
                      : tool.den}
                  </p>

                  <button
                    type="button"
                    className="awd-tool-button"
                    onClick={() =>
                      openTool(
                        tool.id,
                      )
                    }
                  >
                    {isAr
                      ? "فتح الأداة"
                      : "Open Tool"}{" "}
                    ←
                  </button>
                </article>
              ),
            )}
          </div>
        </section>

        {/* PLAN */}

        <section className="awd-plan">
          <div className="awd-plan-top">
            <div className="awd-plan-icon">
              👑
            </div>

            <div>
              <span className="awd-plan-name">
                {isAr
                  ? usage.planNameAr
                  : usage.planNameEn}
              </span>

              <span className="awd-plan-sub">
                {usage.endsAt
                  ? `${
                      isAr
                        ? "تنتهي في "
                        : "Ends on "
                    }${new Date(
                      usage.endsAt,
                    ).toLocaleDateString(
                      isAr
                        ? "ar-DZ"
                        : "en-US",
                    )}`
                  : isAr
                    ? "وصولك الحالي إلى AllWDbook"
                    : "Your current AllWDbook access"}
              </span>
            </div>

            <Link
              href="/subscription"
              className="awd-upgrade"
            >
              {isAr
                ? "ترقية"
                : "Upgrade"}{" "}
              ⚡
            </Link>
          </div>

          <div className="awd-progress">
            <span
              style={{
                width:
                  usagePercent +
                  "%",
              }}
            />
          </div>

          <div className="awd-plan-foot">
            <span>
              {usage.used.toLocaleString(
                isAr
                  ? "ar-DZ"
                  : "en-US",
              )}{" "}
              /{" "}
              {usage.limit.toLocaleString(
                isAr
                  ? "ar-DZ"
                  : "en-US",
              )}
            </span>

            <span>
              {isAr
                ? "الاستخدام"
                : "Usage"}
            </span>
          </div>
        </section>

        <div className="awd-disclaimer">
          {isAr
            ? "AllWDbook أداة مستقلة وليست تابعة لأي منصة نشر أو شركة."
            : "AllWDbook is an independent tool and is not affiliated with any publishing platform or company."}
        </div>

        {/* WORKSPACE */}

        {tab !== null && (
          <section
            id="awd-workspace"
            className="awd-workspace"
          >
            <div className="awd-workspace-head">
              <button
                type="button"
                className="awd-workspace-close"
                onClick={() =>
                  setTab(null)
                }
              >
                {isAr
                  ? "إغلاق ✕"
                  : "Close ✕"}
              </button>
            </div>

            {tab === 6 && (
              <CoverTool
                lang={lang}
              />
            )}

            {tab === 1 && (
              <Niches
                t={t}
                lang={lang}
                domain={
                  marketCode
                }
                onAnalyze={
                  sendToKeywords
                }
              />
            )}

            {tab === 0 && (
              <KeywordsPanel
                t={t}
                domain={
                  marketCode
                }
                seed={
                  seedKw
                }
              />
            )}

            {tab === 5 && (
              <Calc
                t={t}
                lang={lang}
                domain={
                  marketCode
                }
                market={
                  market
                }
              />
            )}

            {tab === 4 && (
              <Formatter
                t={t}
              />
            )}
          </section>
        )}
      </div>

      {/* ===================================================
          BOTTOM NAV
          =================================================== */}

      <nav className="awd-bottom-nav">
        <button
          type="button"
          className="awd-nav-link"
          onClick={scrollToTools}
        >
          <span className="awd-nav-icon">
            🧰
          </span>

          <span>
            {isAr
              ? "الأدوات"
              : "Tools"}
          </span>
        </button>

        <button
          type="button"
          className="awd-nav-link active"
          onClick={goHome}
        >
          <span className="awd-nav-icon">
            🏠
          </span>

          <span>
            {isAr
              ? "الرئيسية"
              : "Home"}
          </span>
        </button>

        <Link
          href="/subscription"
          className="awd-nav-link"
        >
          <span className="awd-nav-icon">
            👑
          </span>

          <span>
            {isAr
              ? "الاشتراك"
              : "Plan"}
          </span>
        </Link>

        <Link
          href="/blog"
          className="awd-nav-link"
        >
          <span className="awd-nav-icon">
            📰
          </span>

          <span>
            {isAr
              ? "المدونة"
              : "Blog"}
          </span>
        </Link>
      </nav>
    </main>
  );
}

/* =========================================================
   MICRO NICHE
   ========================================================= */

function Niches({
  t,
  lang,
  domain,
  onAnalyze,
}) {
  const [
    category,
    setCategory,
  ] = useState(
    "coloring",
  );

  const [
    count,
    setCount,
  ] = useState(24);

  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    upgradeOpen,
    setUpgradeOpen,
  ] = useState(false);

  async function canUseMicroNiche() {
    const supabase =
      getSupabase();

    let {
      data: { session },
    } =
      await supabase.auth.getSession();

    if (
      !session?.access_token
    ) {
      const {
        data,
        error,
      } =
        await supabase.auth.signInAnonymously();

      if (error) {
        console.error(
          "Anonymous sign-in failed:",
          error,
        );

        return false;
      }

      session =
        data?.session ||
        null;
    }

    if (
      !session?.access_token
    ) {
      return false;
    }

    const blocked =
      await shouldBlockRememberedLimit(
        "microNiche",
        session.access_token,
      );

    if (blocked) {
      setUpgradeOpen(
        true,
      );

      return false;
    }

    const response =
      await fetch(
        "/api/usage/consume",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body:
            JSON.stringify(
              {
                toolId:
                  "microNiche",
              },
            ),
        },
      );

    const data =
      await response        .json()
        .catch(
          () => ({}),
        );

    if (
      !response.ok &&
      data?.error ===
        "DAILY_LIMIT_REACHED"
    ) {
      setUpgradeOpen(
        true,
      );

      return false;
    }

    return response.ok;
  }

  async function load() {
    setBusy(true);

    const seed =
      String(
        Date.now(),
      );

    try {
      const allowed =
        await canUseMicroNiche();

      if (!allowed) {
        return;
      }

      const response =
        await fetch(
          `/api/niches?cat=${encodeURIComponent(
            category,
          )}&domain=${encodeURIComponent(
            domain,
          )}&count=${count}&seed=${encodeURIComponent(
            seed,
          )}`,
        );

      const data =
        await response.json();

      setRows(
        data.rows || [],
      );
    } catch (error) {
      console.error(
        "Niche generation failed:",
        error,
      );

      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  async function validateCurrent() {
    setBusy(true);

    try {
      const allowed =
        await canUseMicroNiche();

      if (!allowed) {
        return;
      }

      const response =
        await fetch(
          `/api/niches?cat=${encodeURIComponent(
            category,
          )}&domain=${encodeURIComponent(
            domain,
          )}&count=${count}&seed=fixed&validate=1`,
        );

      const data =
        await response.json();

      setRows(
        data.rows || [],
      );
    } catch (error) {
      console.error(
        "Niche validation failed:",
        error,
      );

      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(
        rows
          .map(
            (row) =>
              row.keyword,
          )
          .join("\n"),
      );

      setCopied(true);

      window.setTimeout(
        () =>
          setCopied(false),
        1800,
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error,
      );
    }
  }

  function categoryLabel(
    key,
  ) {
    const item =
      NICHE_CATEGORIES[
        key
      ];

    if (!item) {
      return key;
    }

    return lang === "ar"
      ? item.ar
      : item.en;
  }

  return (
    <div className="card">
      <div className="trustNote">
        <p>
          {t.nicheNote}
        </p>
      </div>

      <label className="mut">
        {t.nicheCat}
      </label>

      <select
        value={category}
        onChange={(event) =>
          setCategory(
            event.target
              .value,
          )
        }
      >
        {Object.keys(
          NICHE_CATEGORIES,
        ).map(
          (key) => (
            <option
              key={
                key
              }
              value={
                key
              }
            >
              {categoryLabel(
                key,
              )}
            </option>
          ),
        )}
      </select>

      <label className="mut">
        {t.nicheCount}
      </label>

      <select
        value={count}
        onChange={(event) =>
          setCount(
            Number(
              event.target
                .value,
            ),
          )
        }
      >
        {[12, 24, 40, 60].map(
          (number) => (
            <option
              key={
                number
              }
              value={
                number
              }
            >
              {number}
            </option>
          ),
        )}
      </select>

      <button
        className="go"
        onClick={load}
        disabled={busy}
      >
        {busy
          ? t.working
          : rows.length
            ? t.nicheMore
            : t.nicheGen}
      </button>

      {rows.length > 0 && (
        <>
          <div className="actionRow">
            <button
              className="mini"
              onClick={
                validateCurrent
              }
              disabled={
                busy
              }
            >
              {
                t.nicheValidate
              }
            </button>

            <button
              className="mini"
              onClick={
                copyAll
              }
            >
              {copied
                ? t.copied
                : t.copy}
            </button>
          </div>

          {rows.map(
            (row) => (
              <div
                key={
                  row.keyword
                }
                className="nrow"
              >
                <span className="nicheText">
                  {row.keyword}

                  {row.longTail && (
                    <small className="mut">
                      {" "}
                      ·{" "}
                      {
                        t.longTail
                      }
                    </small>
                  )}
                </span>

                <span className="nicheActions">
                  <span
                    className={
                      "badge " +
                      (row.demand
                        ? "b-" +
                          row.demand
                        : "b-none")
                    }
                  >
                    {row.demand
                      ? t[
                          row
                            .demand
                        ] ||
                        row.demand
                      : t.untested}
                  </span>

                  <button
                    className="mini"
                    onClick={() =>
                      onAnalyze(
                        row.keyword,
                      )
                    }
                  >
                    {
                      t.analyzeThis
                    }
                  </button>
                </span>
              </div>
            ),
          )}
        </>
      )}

      <UpgradePrompt
        open={
          upgradeOpen
        }
        toolId="microNiche"
        onClose={() =>
          setUpgradeOpen(
            false,
          )
        }
      />
    </div>
  );
}

/* =========================================================
   FORMATTER
   ========================================================= */

function escapeHtml(
  value,
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

function formatDescription(
  value,
) {
  return String(
    value || "",
  )
    .slice(0, 4000)
    .split("\n\n")
    .map(
      (paragraph) =>
        paragraph.trim(),
    )
    .filter(Boolean)
    .map(
      (paragraph) => {
        if (
          paragraph.startsWith(
            "- ",
          )
        ) {
          const list =
            paragraph
              .split("\n")
              .filter(
                Boolean,
              )
              .map(
                (line) => {
                  const content =
                    line.startsWith(
                      "- ",
                    )
                      ? line.slice(
                          2,
                        )
                      : line;

                  return (
                    "<li>" +
                    escapeHtml(
                      content,
                    ) +
                    "</li>"
                  );
                },
              )
              .join("");

          return (
            "<ul>" +
            list +
            "</ul>"
          );
        }

        if (
          paragraph.startsWith(
            "# ",
          )
        ) {
          return (
            "<h4>" +
            escapeHtml(
              paragraph.slice(
                2,
              ),
            ) +
            "</h4>"
          );
        }

        return (
          "<p>" +
          escapeHtml(
            paragraph,
          ).replaceAll(
            "\n",
            "<br/>",
          ) +
          "</p>"
        );
      },
    )
    .join("");
}

function Formatter({
  t,
}) {
  const [
    value,
    setValue,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  const html =
    formatDescription(
      value,
    );

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(
        html,
      );

      setCopied(true);

      window.setTimeout(
        () =>
          setCopied(false),
        1600,
      );
    } catch (error) {
      console.error(
        "Copy HTML failed:",
        error,
      );
    }
  }

  return (
    <div className="card">
      <p className="mut">
        {t.fmtNote}
      </p>

      <textarea
        rows={8}
        maxLength={
          4000
        }        value={value}
        onChange={(event) =>
          setValue(
            event.target
              .value,
          )
        }
      />

      <h3>
        {t.preview}
      </h3>

      <div
        className="prev"
        dangerouslySetInnerHTML={{
          __html:
            html,
        }}
      />

      <div className="formatterHead">
        <h3>
          {t.htmlCode}
        </h3>

        <button
          className="mini"
          onClick={
            copyHtml
          }
        >
          {copied
            ? t.copied
            : t.copyHtml}
        </button>
      </div>

      <textarea
        rows={5}
        readOnly
        value={html}
      />

      <p className="mut">
        {t.chars}:{" "}
        {value.length}
        /4000
      </p>
    </div>
  );
}

/* =========================================================
   ROYALTY CALCULATOR
   ========================================================= */

function Calc({
  t,
  lang,
  domain,
  market,
}) {
  const [
    price,
    setPrice,
  ] = useState(
    12.99,
  );

  const [
    pages,
    setPages,
  ] = useState(120);

  const [
    ink,
    setInk,
  ] = useState(
    "black",
  );

  const [
    large,
    setLarge,
  ] = useState(false);

  const mInfo =
    marketInfo(domain);

  const options = {
    domain,
    ink,
    large,
  };

  const cost =
    printCost(
      pages,
      options,
    );

  const rate =
    royaltyRate(
      price,
      domain,
    );

  const royalty =
    royaltyPerUnit(
      price,
      pages,
      options,
    );

  const sym =
    market?.sym ||
    mInfo.symbol;

  const label =
    market
      ? `${market.flag} ${
          lang === "ar"
            ? market.ar
            : market.en
        }`
      : domain;

  return (
    <div className="card">
      <div className="trustNote">
        <p>
          <b>
            {
              t.marketplace
            }
            :
          </b>{" "}
          {label} ·{" "}
          {
            mInfo.currency
          }
        </p>

        <small>
          {t.calcNote}
        </small>
      </div>

      <label className="mut">
        {t.price}
      </label>

      <input
        type="number"
        min="0"
        step="0.01"
        value={price}
        onChange={(event) =>
          setPrice(
            Number(
              event.target
                .value,
            ),
          )
        }
      />

      <label className="mut">
        {t.pages}
      </label>

      <input
        type="number"
        min="24"
        max="828"
        value={pages}
        onChange={(event) =>
          setPages(
            Number(
              event.target
                .value,
            ),
          )
        }
      />

      <label className="mut">
        {t.printType}
      </label>

      <select
        value={ink}
        onChange={(event) =>
          setInk(
            event.target
              .value,
          )
        }
      >
        <option value="black">
          {t.blackInk}
        </option>

        <option value="premium">
          {
            t.premiumColor
          }
        </option>

        <option value="standard">
          {
            t.standardColor
          }
        </option>
      </select>

      <label className="mut">
        {t.trimClass}
      </label>

      <select
        value={
          large
            ? "large"
            : "regular"
        }
        onChange={(event) =>
          setLarge(
            event.target
              .value ===
              "large",
          )
        }
      >
        <option value="regular">
          {
            t.regularTrim
          }
        </option>

        <option value="large">
          {t.largeTrim}
        </option>
      </select>

      {cost === null ? (
        <div className="trustNote warnNote">
          <p>
            ⚠️{" "}
            {
              t.invalidPrint
            }
          </p>
        </div>
      ) : (
        <div className="grid resultSection">
          <div className="kpi">
            <b>
              {sym}
              {cost.toFixed(
                2,
              )}
            </b>

            <span>
              {
                t.printCost
              }
            </span>
          </div>

          <div className="kpi">
            <b>
              {rate
                ? Math.round(
                    rate *
                      100,
                  ) + "%"
                : "—"}
            </b>

            <span>
              {
                t.royaltyRate
              }
            </span>
          </div>

          <div className="kpi fullKpi">
            <b>
              {royalty ===
              null
                ? "—"
                : sym +
                  royalty.toFixed(
                    2,
                  )}
            </b>

            <span>
              {
                t.royaltyUnit
              }
            </span>
          </div>
        </div>
      )}

      <p className="mut disclaimer">
        ⚖️{" "}
        {t.notAdvice}
      </p>
    </div>
  );
}

