"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
import BlogTicker from "./blogticker";
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
   HOME
   ========================================================= */

export default function Home() {
  const [lang, setLang] = useState("ar");

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
    const saved =
      window.localStorage.getItem(
        "awd_lang",
      );

    if (
      saved &&
      T[saved]
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
        next &&
        T[next]
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

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setSlide(
            (current) =>
              (current + 1) %
              HERO_SLIDES.length,
          );
        },
        6000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, []);

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
      <style jsx global>{`
        :root {
          --awd-black: #02060d;
          --awd-bg: #030b17;
          --awd-navy: #061326;
          --awd-navy-2: #091a30;
          --awd-card: #08172a;
          --awd-card-2: #0b1b31;

          --awd-border: #172c46;
          --awd-border-soft: rgba(
            120,
            163,
            214,
            0.13
          );

          --awd-text: #f7f9fd;
          --awd-muted: #8d9db5;

          --awd-orange: #ff6900;
          --awd-orange-2: #ff8734;

          --awd-green: #21c487;
          --awd-blue: #4388ff;
          --awd-violet: #8b5cf6;
          --awd-pink: #ec4899;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(
            --awd-black
          );
          overflow-x: hidden;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        a,
        button {
          -webkit-tap-highlight-color:
            transparent;

          touch-action:
            manipulation;
        }

        .awd-app,
        .awd-app * {
          box-sizing: border-box;
        }

        .awd-app {
          width: 100%;
          min-height: 100dvh;

          overflow-x: hidden;

          padding-bottom: calc(
            86px +
              env(
                safe-area-inset-bottom
              )
          );

          color: var(
            --awd-text
          );

          background:
            radial-gradient(
              circle at 50% -180px,
              rgba(
                20,
                70,
                130,
                0.22
              ),
              transparent 420px
            ),
            linear-gradient(
              180deg,
              #020711 0%,
              #030b17 38%,
              #020812 100%
            );
        }

        .awd-shell {
          width: min(
            1160px,
            calc(
              100% - 32px
            )
          );

          margin-inline: auto;
        }

        /* ===============================================
           HEADER
           =============================================== */

        .awd-header-wrap {
          position: sticky;
          top: 0;
          z-index: 1000;

          border-bottom: 1px
            solid
            rgba(
              117,
              153,
              196,
              0.12
            );

          background: rgba(
            2,
            8,
            18,
            0.96
          );

          backdrop-filter:
            blur(20px);
        }

        .awd-header {
          min-height: 76px;

          display: grid;

          grid-template-columns:
            auto
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 12px;
        }

        .awd-menu-button,
        .awd-icon-button {
          width: 44px;
          height: 44px;

          display: grid;
          place-items: center;

          flex: 0 0 44px;

          padding: 0;

          border: 1px
            solid
            var(
              --awd-border
            );

          border-radius: 14px;

          background:
            linear-gradient(
              180deg,
              #0a192c,
              #071425
            );

          color: white;

          cursor: pointer;
        }

        .awd-menu-button {
          transition:
            border-color
              0.18s ease,
            background
              0.18s ease;
        }

        .awd-menu-button:hover {
          border-color:
            rgba(
              255,
              105,
              0,
              0.6
            );
        }

        .awd-menu-lines {
          width: 20px;

          display: grid;

          gap: 5px;
        }

        .awd-menu-lines span {
          width: 100%;
          height: 2px;

          display: block;

          border-radius:
            999px;

          background:
            #f8fafc;
        }

        .awd-brand {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 11px;
        }

        .awd-brand-logo {
          width: 46px;
          height: 46px;

          flex: 0 0 46px;

          object-fit: cover;

          border-radius: 14px;

          box-shadow:
            0 0 0 1px
              rgba(
                255,
                255,
                255,
                0.08
              ),
            0 8px 25px
              rgba(
                255,
                105,
                0,
                0.08
              );
        }

        .awd-brand-copy {
          min-width: 0;
        }

        .awd-brand-copy strong {
          display: block;

          overflow: hidden;

          white-space:
            nowrap;

          text-overflow:
            ellipsis;

          color: white;

          font-size: 21px;
          font-weight: 900;

          letter-spacing:
            -0.5px;
        }

        .awd-brand-copy small {
          display: block;

          margin-top: 1px;

          color:
            #6f829d;

          font-size: 10px;

          white-space:
            nowrap;
        }

        .awd-header-actions {
          display: flex;
          align-items: center;

          gap: 7px;
        }

        .awd-icon-button {
          position: relative;

          font-size: 20px;
        }

        .awd-notification {
          position: absolute;

          top: -4px;
          inset-inline-end: -4px;

          min-width: 19px;
          height: 19px;

          display: grid;
          place-items: center;

          padding-inline: 4px;

          border: 2px
            solid #020812;

          border-radius:
            999px;

          background:
            #ef4444;

          color: white;

          font-size: 9px;
          line-height: 1;

          font-weight: 900;
        }

        /* ===============================================
           DRAWER
           =============================================== */

        .awd-drawer-backdrop {
          position: fixed;
          inset: 0;

          z-index: 1990;

          pointer-events:
            none;

          opacity: 0;

          background:
            rgba(
              0,
              3,
              9,
              0.76
            );

          backdrop-filter:
            blur(5px);

          transition:
            opacity
              0.22s ease;
        }

        .awd-drawer-backdrop.open {
          opacity: 1;

          pointer-events:
            auto;
        }

        .awd-drawer {
          position: fixed;

          top: 0;
          bottom: 0;

          inset-inline-start: 0;

          z-index: 2000;

          width: min(
            350px,
            88vw
          );

          overflow-y: auto;

          padding:
            18px
            15px
            calc(
              24px +
                env(
                  safe-area-inset-bottom
                )
            );

          border-inline-end:
            1px solid
            #142a45;

          background:
            radial-gradient(
              circle at 30% 0%,
              rgba(
                25,
                82,
                145,
                0.17
              ),
              transparent 280px
            ),
            linear-gradient(
              180deg,
              #061326,
              #020812
            );

          box-shadow:
            30px 0
            90px
            rgba(
              0,
              0,
              0,
              0.55
            );

          transform:
            translateX(
              -105%
            );

          transition:
            transform
              0.25s ease;
        }

        [dir="rtl"]
          .awd-drawer {
          transform:
            translateX(
              105%
            );
        }

        .awd-drawer.open,
        [dir="rtl"]
          .awd-drawer.open {
          transform:
            translateX(0);
        }

        .awd-drawer-head {
          display: flex;
          align-items: center;

          gap: 10px;

          padding:
            4px 3px
            17px;

          border-bottom:
            1px solid
            var(
              --awd-border-soft
            );
        }

        .awd-drawer-logo {
          width: 48px;
          height: 48px;

          object-fit: cover;

          border-radius: 14px;
        }

        .awd-drawer-brand {
          min-width: 0;
          flex: 1;
        }

        .awd-drawer-brand strong {
          display: block;

          color: white;

          font-size: 18px;
          font-weight: 900;
        }

        .awd-drawer-brand span {
          display: block;

          margin-top: 3px;

          color:
            var(
              --awd-muted
            );

          font-size: 11px;
        }

        .awd-drawer-close {
          width: 38px;
          height: 38px;

          display: grid;
          place-items: center;

          border: 1px solid
            var(
              --awd-border
            );

          border-radius: 12px;

          background:
            #09182b;

          color:
            #cbd5e1;

          cursor: pointer;
        }

        .awd-menu-section {
          padding-top: 17px;
        }

        .awd-menu-label {
          display: block;

          margin:
            0
            10px
            8px;

          color:
            #607590;

          font-size: 10px;
          font-weight: 900;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;
        }

        .awd-menu-links {
          display: grid;

          gap: 5px;
        }

        .awd-menu-link {
          width: 100%;
          min-height: 49px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding:
            9px 11px;

          border: 1px solid
            transparent;

          border-radius: 13px;

          background:
            transparent;

          color:
            #dbe4f1;

          text-decoration:
            none;

          text-align:
            inherit;

          font-size: 14px;

          cursor: pointer;
        }

        .awd-menu-link:hover {
          border-color:
            #152c48;

          background:
            #09192d;
        }

        .awd-menu-link.active {
          border-color:
            rgba(
              255,
              105,
              0,
              0.22
            );

          background:
            rgba(
              255,
              105,
              0,
              0.08
            );

          color:
            #ff8d40;
        }

        .awd-menu-icon {
          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          flex: 0 0 35px;

          border-radius: 10px;

          background:
            #0c1c30;

          font-size: 17px;
        }

        .awd-menu-text {
          min-width: 0;
          flex: 1;
        }

        .awd-menu-text strong {
          display: block;

          font-size: 13px;
        }

        .awd-menu-text small {
          display: block;

          margin-top: 2px;

          color:
            #74869f;

          font-size: 10px;
        }

        /* ===============================================
           MARKET IN MENU
           =============================================== */

        .awd-market-card {
          padding: 12px;

          border: 1px solid
            var(
              --awd-border
            );

          border-radius: 15px;

          background:
            rgba(
              7,
              21,
              38,
              0.82
            );
        }

        .awd-market-card label {
          display: block;

          margin-bottom: 8px;

          color:
            #7f92aa;

          font-size: 11px;
          font-weight: 800;
        }

        .awd-market-card select {
          width: 100%;
          min-height: 46px;

          padding-inline: 12px;

          border: 1px solid
            #1c3552;

          border-radius: 12px;

          outline: none;

          background:
            #030c18;

          color: white;

          font-size: 13px;
        }

        /* ===============================================
           ACCOUNT IN DRAWER
           =============================================== */

        .awd-account-menu-row {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 10px;

          padding: 12px;

          border: 1px solid
            var(
              --awd-border
            );

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              #091a2f,
              #061323
            );
        }

        .awd-account-menu-copy strong {
          display: block;

          color: white;

          font-size: 13px;
        }

        .awd-account-menu-copy span {
          display: block;

          margin-top: 3px;

          color:
            #7689a2;

          font-size: 10px;
        }

        .awd-account-menu-row
          .awd-account-trigger {
          width: 42px !important;
          height: 42px !important;

          border-radius:
            12px !important;
        }

        .awd-account-menu-row
          .awd-account-trigger
          img {
          width: 34px !important;
          height: 34px !important;

          border-radius:
            10px !important;
        }

        /* ===============================================
           HERO
           =============================================== */

        .awd-hero-wrap {
          padding-top: 20px;
        }

        .awd-hero {
          position: relative;

          overflow: hidden;

          min-height: 430px;

          display: grid;

          grid-template-columns:
            minmax(
              0,
              1.15fr
            )
            minmax(
              240px,
              0.85fr
            );

          align-items: center;

          gap: 30px;

          padding: 48px;

          border: 1px solid
            rgba(
              89,
              130,
              181,
              0.18
            );

          border-radius: 30px;

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent 35%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(
                39,
                112,
                197,
                0.15
              ),
              transparent 42%
            ),
            linear-gradient(
              145deg,
              #071629,
              #061224 55%,
              #030b17
            );

          box-shadow:
            0 24px
            80px
            rgba(
              0,
              0,
              0,
              0.28
            );
        }

        [dir="rtl"]
          .awd-hero {
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(
                255,
                105,
                0,
                0.13
              ),
              transparent 35%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(
                39,
                112,
                197,
                0.15
              ),
              transparent 42%
            ),
            linear-gradient(
              145deg,
              #071629,
              #061224 55%,
              #030b17
            );
        }

        .awd-hero::before {
          content: "";

          position: absolute;

          width: 240px;
          height: 240px;

          border-radius:
            999px;

          inset-inline-end:
            -100px;

          top: -120px;

          border: 1px solid
            rgba(
              255,
              105,
              0,
              0.12
            );
        }

        .awd-hero-content {
          position: relative;

          z-index: 2;

          min-width: 0;
        }

        .awd-eyebrow {
          width: max-content;

          max-width: 100%;

          display: flex;
          align-items: center;

          gap: 7px;

          margin-bottom: 16px;

          padding:
            7px 11px;

          border: 1px solid
            rgba(
              255,
              105,
              0,
              0.22
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
            #ff9855;

          font-size: 11px;

          font-weight: 900;
        }

        .awd-eyebrow-dot {
          width: 7px;
          height: 7px;

          border-radius:
            999px;

          background:
            var(
              --awd-orange
            );

          box-shadow:
            0 0 0 5px
              rgba(
                255,
                105,
                0,
                0.1
              );
        }

        .awd-hero h1 {
          max-width: 730px;
          margin: 0;

          color:
            var(
              --awd-text
            );

          font-size:
            clamp(
              40px,
              5vw,
              64px
            );

          line-height: 1.08;

          letter-spacing:
            -1.5px;

          font-weight: 950;
        }

        .awd-hero h1 span {
          color:
            var(
              --awd-orange
            );
        }

        .awd-hero-description {
          max-width: 650px;

          margin:
            20px
            0
            0;

          color:
            #97a7bd;

          font-size: 16px;

          line-height: 1.85;
        }

        .awd-hero-buttons {
          display: flex;

          gap: 11px;

          margin-top: 25px;
        }

        .awd-primary,
        .awd-secondary {
          min-height: 52px;

          padding:
            11px
            23px;

          border-radius:
            14px;

          font-size: 15px;
          font-weight: 900;

          cursor: pointer;
        }

        .awd-primary {
          border: 1px solid
            var(
              --awd-orange
            );

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7d20
            );

          color: white;

          box-shadow:
            0 12px
            32px
            rgba(
              255,
              105,
              0,
              0.2
            );
        }

        .awd-secondary {
          border: 1px solid
            #1c3553;

          background:
            rgba(
              6,
              18,
              34,
              0.72
            );

          color:
            #e6edf7;
        }

        .awd-trust-row {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 8px;

          margin-top: 24px;
        }

        .awd-trust {
          min-height: 58px;

          display: flex;
          align-items: center;

          justify-content:
            center;

          gap: 7px;

          padding: 8px;

          border: 1px solid
            rgba(
              93,
              130,
              177,
              0.16
            );

          border-radius: 14px;

          background:
            rgba(
              4,
              14,
              28,
              0.54
            );

          color:
            #b2c0d3;

          text-align: center;

          font-size: 11px;

          line-height: 1.35;
        }

        .awd-dots {
          display: flex;

          justify-content:
            center;

          gap: 7px;

          margin-top: 22px;
        }

        .awd-dot {
          width: 28px;
          height: 6px;

          padding: 0;

          border: 0;

          border-radius:
            99px;

          background:
            #263750;

          cursor: pointer;
        }

        .awd-dot.active {
          width: 46px;

          background:
            var(
              --awd-orange
            );
        }

        .awd-hero-visual {
          position: relative;

          min-height: 310px;

          display: grid;
          place-items: center;
        }

        .awd-hero-orbit {
          position: absolute;

          width: 290px;
          height: 290px;

          border: 1px solid
            rgba(
              102,
              153,
              216,
              0.15
            );

          border-radius:
            999px;
        }

        .awd-hero-orbit::before,
        .awd-hero-orbit::after {
          content: "";

          position: absolute;

          border-radius:
            999px;

          border: 1px solid
            rgba(
              102,
              153,
              216,
              0.1
            );
        }

        .awd-hero-orbit::before {
          inset: 27px;
        }

        .awd-hero-orbit::after {
          inset: 55px;
        }

        .awd-hero-logo {
          position: relative;

          z-index: 2;

          width: 180px;
          height: 180px;

          object-fit: cover;

          border-radius: 35px;

          box-shadow:
            0 0 0 1px
              rgba(
                255,
                255,
                255,
                0.08
              ),
            0 30px 65px
              rgba(
                0,
                0,
                0,
                0.4
              );
        }

        .awd-mini-stat {
          position: absolute;

          z-index: 3;

          min-width: 115px;

          padding:
            10px
            12px;

          border: 1px solid
            #17314e;

          border-radius: 14px;

          background:
            rgba(
              5,
              17,
              33,
              0.93
            );

          box-shadow:
            0 16px
            35px
            rgba(
              0,
              0,
              0,
              0.28
            );

          color: white;

          font-size: 11px;
        }

        .awd-mini-stat strong {
          display: block;

          color:
            #ff9551;

          font-size: 15px;
        }

        .awd-stat-one {
          top: 22px;

          inset-inline-start:
            3px;
        }

        .awd-stat-two {
          bottom: 22px;

          inset-inline-end:
            2px;
        }

        /* ===============================================
           SECTION HEADER
           =============================================== */

        .awd-section {
          scroll-margin-top:
            90px;

          padding-top: 43px;
        }

        .awd-section-head {
          display: flex;
          align-items: end;

          justify-content:
            space-between;

          gap: 18px;

          margin-bottom: 19px;
        }

        .awd-section-kicker {
          display: block;

          margin-bottom: 7px;

          color:
            var(
              --awd-orange
            );

          font-size: 10px;

          font-weight: 900;

          text-transform:
            uppercase;

          letter-spacing:
            0.08em;
        }

        .awd-section-head h2 {
          margin: 0;

          color: white;

          font-size:
            clamp(
              27px,
              3vw,
              36px
            );

          line-height: 1.15;

          letter-spacing:
            -0.6px;
        }

        .awd-section-head p {
          margin:
            7px
            0
            0;

          color:
            var(
              --awd-muted
            );

          font-size: 14px;
        }

        .awd-view-all {
          flex: 0 0 auto;

          padding: 0;

          border: 0;

          background:
            transparent;

          color:
            #ff8a38;

          text-decoration:
            none;

          font-size: 13px;

          font-weight: 900;

          cursor: pointer;
        }

        /* ===============================================
           TOOL CARDS
           =============================================== */

        .awd-tools-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 15px;
        }

        .awd-tool-card {
          position: relative;

          min-height: 280px;

          display: flex;
          flex-direction:
            column;

          padding: 20px;

          overflow: hidden;

          border: 1px solid
            rgba(
              90,
              126,
              172,
              0.16
            );

          border-radius: 22px;

          background:
            linear-gradient(
              155deg,
              #091a2e,
              #051221 62%,
              #040d19
            );

          transition:
            transform
              0.2s ease,
            border-color
              0.2s ease;
        }

        .awd-tool-card:hover {
          transform:            translateY(-2px);

          border-color:
            rgba(
              255,
              105,
              0,
              0.3
            );
        }

        .awd-tool-icon {
          width: 56px;
          height: 56px;

          display: grid;
          place-items: center;

          border-radius: 16px;

          font-size: 25px;
        }

        .awd-tool-icon.orange {
          background:
            rgba(
              255,
              105,
              0,
              0.13
            );

          border: 1px solid
            rgba(
              255,
              105,
              0,
              0.21
            );
        }

        .awd-tool-icon.violet {
          background:
            rgba(
              139,
              92,
              246,
              0.12
            );

          border: 1px solid
            rgba(
              139,
              92,
              246,
              0.22
            );
        }

        .awd-tool-icon.blue {
          background:
            rgba(
              67,
              136,
              255,
              0.12
            );

          border: 1px solid
            rgba(
              67,
              136,
              255,
              0.22
            );
        }

        .awd-tool-icon.green {
          background:
            rgba(
              33,
              196,
              135,
              0.12
            );

          border: 1px solid
            rgba(
              33,
              196,
              135,
              0.22
            );
        }

        .awd-tool-icon.pink {
          background:
            rgba(
              236,
              72,
              153,
              0.12
            );

          border: 1px solid
            rgba(
              236,
              72,
              153,
              0.22
            );
        }

        .awd-new-badge {
          position: absolute;

          top: 18px;
          inset-inline-end:
            18px;

          padding:
            6px
            10px;

          border: 1px solid
            rgba(
              139,
              92,
              246,
              0.4
            );

          border-radius:
            999px;

          background:
            rgba(
              139,
              92,
              246,
              0.14
            );

          color:
            #bda7ff;

          font-size: 10px;
          font-weight: 900;
        }

        .awd-tool-card h3 {
          margin:
            18px
            0
            8px;

          color: white;

          font-size: 19px;

          line-height: 1.2;
        }

        .awd-tool-card p {
          margin: 0;

          color:
            #8798af;

          font-size: 13px;

          line-height: 1.65;
        }

        .awd-tool-button {
          width: 100%;
          min-height: 46px;

          margin-top: auto;

          padding:
            10px
            12px;

          border: 1px solid
            #1b3654;

          border-radius: 12px;

          background:
            #07182b;

          color:
            #e8eef7;

          font-size: 13px;
          font-weight: 900;

          cursor: pointer;
        }

        .awd-tool-button:hover {
          border-color:
            rgba(
              255,
              105,
              0,
              0.45
            );

          color:
            #ff984f;
        }

        /* ===============================================
           PLAN CARD
           =============================================== */

        .awd-plan {
          margin-top: 32px;

          padding: 24px;

          border: 1px solid
            rgba(
              94,
              133,
              182,
              0.17
            );

          border-radius: 23px;

          background:
            radial-gradient(
              circle at 0% 50%,
              rgba(
                255,
                105,
                0,
                0.09
              ),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #091a2e,
              #04101e
            );
        }

        [dir="rtl"]
          .awd-plan {
          background:
            radial-gradient(
              circle at 100% 50%,
              rgba(
                255,
                105,
                0,
                0.09
              ),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #091a2e,
              #04101e
            );
        }

        .awd-plan-top {
          display: grid;

          grid-template-columns:
            auto
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 15px;
        }

        .awd-plan-icon {
          width: 60px;
          height: 60px;

          display: grid;
          place-items: center;

          border: 1px solid
            rgba(
              255,
              165,
              32,
              0.2
            );

          border-radius: 17px;

          background:
            rgba(
              255,
              153,
              0,
              0.08
            );

          font-size: 29px;
        }

        .awd-plan-name {
          display: block;

          color: white;

          font-size: 19px;
          font-weight: 900;
        }

        .awd-plan-sub {
          display: block;

          margin-top: 4px;

          color:
            #8191a8;

          font-size: 11px;
        }

        .awd-upgrade {
          min-height: 45px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding-inline: 18px;

          border: 1px solid
            var(
              --awd-orange
            );

          border-radius: 12px;

          background:
            var(
              --awd-orange
            );

          color: white;

          font-size: 13px;

          font-weight: 900;

          text-decoration:
            none;

          cursor: pointer;
        }

        .awd-progress {
          height: 8px;

          margin-top: 20px;

          overflow: hidden;

          border-radius:
            999px;

          background:
            #102037;
        }

        .awd-progress span {
          height: 100%;

          display: block;

          border-radius:
            inherit;

          background:
            linear-gradient(
              90deg,
              #ff6900,
              #ff944b
            );
        }

        .awd-plan-foot {
          display: flex;
          align-items: center;

          justify-content:
            space-between;

          gap: 10px;

          margin-top: 8px;

          color:
            #6f8199;

          font-size: 11px;
        }

        .awd-disclaimer {
          padding:
            28px
            8px
            18px;

          color:
            #52667f;

          text-align: center;

          font-size: 11px;

          line-height: 1.7;
        }

        /* ===============================================
           WORKSPACE
           =============================================== */

        .awd-workspace {
          margin-top: 25px;

          padding: 20px;

          scroll-margin-top:
            90px;

          border: 1px solid
            #162e49;

          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              #07172a,
              #030b16
            );
        }

        .awd-workspace-head {
          display: flex;

          justify-content:
            flex-end;

          margin-bottom: 13px;
        }

        .awd-workspace-close {
          min-height: 38px;

          padding-inline: 14px;

          border: 1px solid
            #1b3551;

          border-radius: 10px;

          background:
            #081a2e;

          color:
            #cbd5e1;

          cursor: pointer;
        }

        .awd-workspace input,
        .awd-workspace textarea,
        .awd-workspace select {
          max-width: 100%;
        }

        /* ===============================================
           BOTTOM NAV
           =============================================== */

        .awd-bottom-nav {
          position: fixed;

          inset-inline: 0;
          bottom: 0;

          z-index: 1500;

          min-height: 78px;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(                0,
                1fr
              )
            );

          align-items: center;

          padding:
            5px
            8px
            calc(
              5px +
                env(
                  safe-area-inset-bottom
                )
            );

          border-top: 1px solid
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
              0.97
            );

          backdrop-filter:
            blur(18px);
        }

        .awd-nav-link {
          width: 100%;
          min-height: 60px;

          display: flex;

          flex-direction:
            column;

          align-items: center;

          justify-content:
            center;

          gap: 4px;

          padding: 0;

          border: 0;

          border-radius: 15px;

          background:
            transparent;

          color:
            #61728a;

          text-decoration:
            none;

          text-align:
            center;

          font-size: 10px;

          cursor: pointer;
        }

        .awd-nav-icon {
          min-width: 46px;
          height: 31px;

          display: grid;
          place-items: center;

          border-radius:
            15px;

          font-size: 22px;
        }

        .awd-nav-link.active {
          color:
            #ff8540;
        }

        .awd-nav-link.active
          .awd-nav-icon {
          background:
            rgba(
              255,
              105,
              0,
              0.12
            );
        }

        /* ===============================================
           TABLET
           =============================================== */

        @media (
          max-width: 850px
        ) {
          .awd-shell {
            width: min(
              100% - 24px,
              680px
            );
          }

          .awd-hero {
            grid-template-columns:
              1fr;

            min-height: 0;

            padding: 34px;
          }

          .awd-hero-visual {
            display: none;
          }

          .awd-tools-grid {
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

        /* ===============================================
           MOBILE
           =============================================== */

        @media (
          max-width: 620px
        ) {
          .awd-shell {
            width: 100%;

            padding-inline:
              14px;
          }

          .awd-header {
            min-height: 70px;

            gap: 7px;
          }

          .awd-menu-button,
          .awd-icon-button {
            width: 40px;
            height: 40px;

            flex-basis: 40px;

            border-radius: 12px;
          }

          .awd-brand {
            gap: 8px;
          }

          .awd-brand-logo {
            width: 40px;
            height: 40px;

            flex-basis: 40px;

            border-radius: 12px;
          }

          .awd-brand-copy strong {
            font-size: 17px;
          }

          .awd-brand-copy small {
            display: none;
          }

          .awd-header-actions {
            gap: 5px;
          }

          .awd-hero-wrap {
            padding-top: 14px;
          }

          .awd-hero {
            display: block;

            padding:
              28px
              18px
              24px;

            border-radius: 24px;

            text-align: start;
          }

          .awd-hero::before {
            width: 170px;
            height: 170px;
          }

          .awd-eyebrow {
            margin-bottom: 14px;

            font-size: 10px;
          }

          .awd-hero h1 {
            font-size:
              clamp(
                31px,
                8vw,
                40px
              );

            line-height: 1.12;

            letter-spacing:
              -0.8px;
          }

          .awd-hero-description {
            margin-top: 16px;

            font-size: 14px;

            line-height: 1.75;
          }

          .awd-hero-buttons {
            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 8px;

            margin-top: 21px;
          }

          .awd-primary,
          .awd-secondary {
            width: 100%;

            min-width: 0;

            min-height: 48px;

            padding-inline: 8px;

            font-size: 13px;
          }

          .awd-trust-row {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 6px;

            margin-top: 18px;
          }

          .awd-trust {
            min-height: 63px;

            padding:
              6px
              4px;

            font-size: 9px;
          }

          .awd-dots {
            margin-top: 18px;
          }

          .awd-section {
            padding-top: 33px;
          }

          .awd-section-head {
            display: block;

            margin-bottom: 17px;
          }

          .awd-section-head h2 {
            font-size: 25px;
          }

          .awd-section-head p {
            font-size: 12px;

            line-height: 1.6;
          }

          .awd-view-all {
            display: inline-block;

            margin-top: 11px;
          }

          .awd-tools-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 9px;
          }

          .awd-tool-card {
            min-height: 255px;

            padding: 14px;

            border-radius: 18px;
          }

          .awd-tool-icon {
            width: 48px;
            height: 48px;

            border-radius: 14px;

            font-size: 22px;
          }

          .awd-new-badge {
            top: 13px;

            inset-inline-end:
              12px;

            padding:
              5px
              8px;

            font-size: 9px;
          }

          .awd-tool-card h3 {
            margin-top: 15px;

            font-size: 15px;

            line-height: 1.25;
          }

          .awd-tool-card p {
            font-size: 11px;

            line-height: 1.6;
          }

          .awd-tool-button {
            min-height: 43px;

            font-size: 11px;
          }

          .awd-plan {
            margin-top: 26px;

            padding: 18px;

            border-radius: 20px;
          }

          .awd-plan-top {
            grid-template-columns:
              52px
              minmax(
                0,
                1fr
              )
              auto;

            gap: 10px;
          }

          .awd-plan-icon {
            width: 52px;
            height: 52px;

            font-size: 24px;
          }

          .awd-plan-name {
            font-size: 16px;
          }

          .awd-plan-sub {
            font-size: 9px;
          }

          .awd-upgrade {
            min-height: 42px;

            padding-inline: 12px;

            font-size: 11px;
          }

          .awd-workspace {
            padding: 13px;

            border-radius: 18px;
          }

          .awd-bottom-nav {
            min-height: 76px;
          }
        }

        @media (
          max-width: 380px
        ) {
          .awd-shell {
            padding-inline:
              10px;
          }

          .awd-brand-copy strong {
            font-size: 15px;
          }

          .awd-tools-grid {
            gap: 7px;
          }

          .awd-tool-card {
            min-height: 250px;

            padding: 11px;
          }

          .awd-tool-card h3 {
            font-size: 14px;
          }

          .awd-tool-card p {
            font-size: 10px;
          }

          .awd-plan {
            padding: 14px;
          }
        }
      `}</style>

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
<BlogTicker isAr={isAr} />
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

