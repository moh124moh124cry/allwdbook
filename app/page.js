"use client";

import { useEffect, useState } from "react";

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
    color: "#ff7214",
    ar: "حاسبة الأرباح",
    en: "Royalty Calculator",
    dar: "احسب أرباح الكتاب المتوقعة قبل النشر.",
    den: "Estimate your expected book royalties.",
    isNew: false,
  },
  {
    id: 6,
    icon: "📐",
    color: "#8557ee",
    ar: "مصمم الأغلفة",
    en: "Cover Designer",
    dar: "صمم غلافًا احترافيًا جاهزًا في دقائق.",
    den: "Design a professional cover in minutes.",
    isNew: true,
  },
  {
    id: 0,
    icon: "🔑",
    color: "#3f7ff0",
    ar: "بحث الكلمات المفتاحية",
    en: "Keyword Research",
    dar: "اكتشف أفضل الكلمات لزيادة ظهور كتابك.",
    den: "Find the best keywords to boost visibility.",
    isNew: false,
  },
  {
    id: 1,
    icon: "🎯",
    color: "#10b889",
    ar: "بحث النيش المصغر",
    en: "Micro-Niche Research",
    dar: "اكتشف نيشات مربحة ومتخصصة للمنافسة.",
    den: "Discover profitable, focused niches.",
    isNew: false,
  },
  {
    id: 4,
    icon: "✍️",
    color: "#ec4899",
    ar: "وصف الكتاب",
    en: "Book Description",
    dar: "أنشئ وصفًا احترافيًا يساعد على زيادة المبيعات.",
    den: "Create a persuasive description that sells.",
    isNew: false,
  },
];

const HERO_SLIDES = [
  {
    ar: "كل ما تحتاجه للنجاح مع KDP",
    en: "Everything you need to succeed with KDP",
  },
  {
    ar: "أدوات احترافية للنشر الرقمي في مكان واحد",
    en: "Professional publishing tools in one place",
  },
  {
    ar: "ابحث، حلّل، صمّم وانشر بثقة",
    en: "Research, analyze, design and publish with confidence",
  },
];

/* =========================================================
   HOME
   ========================================================= */

export default function Home() {
  const [lang, setLang] = useState("ar");
  const [tab, setTab] = useState(null);

  const [marketCode, setMarketCode] =
    useState("amazon.com");

  const [seedKw, setSeedKw] =
    useState("");

  const [slide, setSlide] =
    useState(0);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [usage, setUsage] = useState({
    used: 0,
    limit: 50000,
    planNameAr: "الخطة المجانية",
    planNameEn: "Free Plan",
    endsAt: null,
  });

  const t = T[lang] || T.ar;
  const isAr = lang === "ar";

  /* =======================================================
     LANGUAGE
     ======================================================= */

  useEffect(() => {
    const saved =
      window.localStorage.getItem("awd_lang");

    if (saved && T[saved]) {
      setLang(saved);
    }

    function syncLanguage(event) {
      const next =
        event?.detail ||
        window.localStorage.getItem(
          "awd_lang",
        );

      if (next && T[next]) {
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
      isAr ? "rtl" : "ltr";
  }, [lang, isAr]);

  function toggleLanguage() {
    const next =
      isAr ? "en" : "ar";

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
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow = "";
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
            data?.session || null;
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

              cache: "no-store",
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

        setUsage((current) => ({
          ...current,

          used:
            Number(data?.used) ||
            0,

          limit:
            Number(data?.limit) ||
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
        }));
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
        5500,
      );

    return () =>
      window.clearInterval(timer);
  }, []);

  const market =
    MARKETS.find(
      (item) =>
        item.code === marketCode,
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
    setTab(id);

    window.setTimeout(() => {
      document
        .getElementById(
          "awd-workspace",
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
  }

  function sendToKeywords(
    keyword,
  ) {
    setSeedKw(keyword);
    openTool(0);
  }

  function scrollToTools() {
    document
      .getElementById(
        "awd-tools",
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main
      className="awd-page"
      dir={isAr ? "rtl" : "ltr"}
    >
      <style jsx global>{`
        :root {
          --awd-bg: #06111f;
          --awd-bg-deep: #050f1c;
          --awd-surface: #0d1a2d;
          --awd-surface-2: #101e31;
          --awd-border: #233249;
          --awd-text: #f3f6fc;
          --awd-muted: #95a3b9;
          --awd-orange: #ff6b00;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--awd-bg);
          overflow-x: hidden;
        }

        .awd-page,
        .awd-page * {
          box-sizing: border-box;
        }

        .awd-page {
          width: 100%;
          min-height: 100dvh;
          overflow-x: hidden;
          background: var(--awd-bg);
          color: var(--awd-text);
          padding-bottom: calc(
            92px +
              env(
                safe-area-inset-bottom
              )
          );
        }

        .awd-shell {
          width: min(
            1120px,
            calc(100% - 32px)
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
          background: rgba(
            6,
            17,
            31,
            0.96
          );
          backdrop-filter: blur(16px);
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.075
            );
        }

        .awd-header {
          min-height: 86px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .awd-menu-btn,
        .awd-header-btn {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border: 1px solid
            var(--awd-border);
          border-radius: 15px;
          background: #0d1929;
          color: white;
          cursor: pointer;
          font-size: 22px;
          padding: 0;
        }

        .awd-menu-lines {
          width: 22px;
          display: grid;
          gap: 5px;
        }

        .awd-menu-lines span {
          height: 2px;
          border-radius: 50px;
          background: white;
        }

        .awd-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .awd-brand-logo {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          object-fit: cover;
          border-radius: 14px;
        }

        .awd-brand-title {
          margin: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: clamp(
            18px,
            2vw,
            25px
          );
          font-weight: 900;
          letter-spacing: -0.4px;
        }

        .awd-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
        }

        .awd-header-btn {
          position: relative;
          font-size: 21px;
        }

        .awd-notification {
          position: absolute;
          top: -5px;
          inset-inline-end: -5px;
          min-width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border: 2px solid
            var(--awd-bg);
          border-radius: 999px;
          background: #ef4338;
          color: white;
          padding-inline: 4px;
          font-size: 10px;
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
          background: rgba(
            0,
            0,
            0,
            0.62
          );
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.22s
            ease;
        }

        .awd-drawer-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .awd-drawer {
          position: fixed;
          top: 0;
          bottom: 0;
          inset-inline-start: 0;
          z-index: 2000;
          width: min(
            310px,
            84vw
          );
          padding:
            22px
            16px
            calc(
              24px +
                env(
                  safe-area-inset-bottom
                )
            );
          overflow-y: auto;
          background: #091728;
          border-inline-end: 1px
            solid var(--awd-border);
          transform: translateX(
            -105%
          );
          transition: transform
            0.25s ease;
          box-shadow: 20px 0 60px
            rgba(0, 0, 0, 0.3);
        }

        [dir="rtl"] .awd-drawer {
          transform: translateX(
            105%
          );
        }

        .awd-drawer.open,
        [dir="rtl"]
          .awd-drawer.open {
          transform: translateX(0);
        }

        .awd-drawer-head {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 4px 4px 20px;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          margin-bottom: 12px;
        }

        .awd-drawer-head img {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          object-fit: cover;
        }

        .awd-drawer-head strong {
          flex: 1;
          font-size: 19px;
        }

        .awd-drawer-close {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          border: 1px solid
            var(--awd-border);
          background: #101e31;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }

        .awd-drawer-links {
          display: grid;
          gap: 5px;
        }

        .awd-drawer-links a {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 13px;
          color: #dfe7f4;
          text-decoration: none;
          font-size: 15px;
        }

        .awd-drawer-links a:hover {
          background: #101e31;
        }

        /* ===============================================
           MARKET
           =============================================== */

        .awd-market {
          display: grid;
          grid-template-columns:
            auto minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          padding-block: 18px;
        }

        .awd-market label {
          color: var(--awd-muted);
          font-size: 14px;
          font-weight: 600;
        }

        .awd-market select {
          width: 100%;
          max-width: 520px;
          min-height: 48px;
          padding-inline: 14px;
          border: 1px solid
            var(--awd-border);
          border-radius: 14px;
          outline: none;
          background: #0c1a2d;
          color: white;
          font-size: 15px;
        }

        /* ===============================================
           HERO
           =============================================== */

        .awd-hero {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns:
            minmax(0, 1.2fr)
            minmax(230px, 0.8fr);
          align-items: center;
          gap: 25px;
          min-height: 410px;
          padding: 44px;
          border: 1px solid
            var(--awd-border);
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 90% 10%,
              rgba(
                255,
                107,
                0,
                0.16
              ),
              transparent 36%
            ),
            linear-gradient(
              140deg,
              #0b182b,
              #101b30
            );
        }

        [dir="rtl"] .awd-hero {
          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(
                255,
                107,
                0,
                0.16
              ),
              transparent 36%
            ),
            linear-gradient(
              140deg,
              #0b182b,
              #101b30
            );
        }

        .awd-hero-content {
          min-width: 0;
        }

        .awd-hero h2 {
          max-width: 720px;
          margin: 0;
          font-size: clamp(
            34px,
            4.7vw,
            56px
          );
          line-height: 1.08;
          letter-spacing: -1.3px;
          font-weight: 900;
        }

        .awd-hero-description {
          max-width: 650px;
          margin: 22px 0 0;
          color: #aeb9cc;
          font-size: 17px;
          line-height: 1.85;
        }

        .awd-hero-buttons {
          display: flex;
          gap: 12px;
          margin-top: 26px;
        }

        .awd-hero-buttons button {
          min-height: 52px;
          padding: 12px 25px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .awd-start {
          border: 1px solid
            var(--awd-orange);
          background: var(
            --awd-orange
          );
          color: white;
        }

        .awd-explore {
          border: 1px solid
            var(--awd-border);
          background: #0b1728;
          color: white;
        }

        .awd-features {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 10px;
          margin-top: 25px;
        }

        .awd-feature {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px;
          text-align: center;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.025
          );
          color: #d4deed;
          font-size: 13px;
          line-height: 1.35;
        }

        .awd-slider-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 25px;
        }

        .awd-slider-dot {
          width: 38px;
          height: 8px;
          padding: 0;
          border: 0;
          border-radius: 50px;
          background: #38455a;
          cursor: pointer;
          transition:
            width 0.2s ease,
            background 0.2s ease;
        }

        .awd-slider-dot.active {
          width: 55px;
          background: var(
            --awd-orange
          );
        }

        .awd-hero-art {
          display: grid;
          place-items: center;
        }

        .awd-hero-art img {
          width: min(
            100%,
            310px
          );
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 28px;
          filter: drop-shadow(
            0 25px 38px
              rgba(
                255,
                102,
                0,
                0.2
              )
          );
        }

        /* ===============================================
           TOOLS
           =============================================== */

        .awd-tools-section {
          scroll-margin-top: 100px;
          padding-top: 38px;
        }

        .awd-tools-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 21px;
        }

        .awd-tools-head h2 {
          margin: 0;
          font-size: clamp(
            25px,
            3vw,
            34px
          );
          line-height: 1.15;
        }

        .awd-tools-head p {
          margin: 8px 0 0;
          color: var(--awd-muted);
          font-size: 15px;
          line-height: 1.5;
        }

        .awd-view-all {
          flex: 0 0 auto;
          color: var(
            --awd-orange
          );
          text-decoration: none;
          font-weight: 900;
          font-size: 16px;
        }

        .awd-tools-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 16px;
        }

        .awd-tool-card {
          position: relative;
          min-width: 0;
          min-height: 285px;
          display: flex;
          flex-direction: column;
          padding: 22px;
          border: 1px solid
            var(--awd-border);
          border-radius: 24px;
          background:
            linear-gradient(
              150deg,
              #0e1b2e,
              #091625
            );
        }

        .awd-tool-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          flex: 0 0 62px;
          border-radius: 17px;
          font-size: 29px;
        }

        .awd-new {
          position: absolute;
          top: 20px;
          inset-inline-end: 20px;
          min-width: 68px;
          text-align: center;
          padding: 7px 14px;
          border-radius: 999px;
          background: #8655e9;
          color: white;
          font-size: 13px;
          font-weight: 900;
        }

        .awd-tool-card h3 {
          margin: 20px 0 9px;
          color: #f3f6fc;
          font-size: 21px;
          line-height: 1.15;
          overflow-wrap: anywhere;
        }

        .awd-tool-card p {
          margin: 0;
          color: var(--awd-muted);
          font-size: 15px;
          line-height: 1.7;
        }

        .awd-use-tool {
          width: 100%;
          min-height: 50px;
          margin-top: auto;
          padding: 10px 12px;
          border: 1px solid
            #2d3c52;
          border-radius: 13px;
          background: #101e31;
          color: white;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .awd-use-tool:hover {
          border-color: var(
            --awd-orange
          );
        }

        /* ===============================================
           PLAN CARD
           =============================================== */

        .awd-plan-card {
          margin-top: 34px;
          padding: 28px;
          border: 1px solid
            var(--awd-border);
          border-radius: 25px;
          background:
            linear-gradient(
              145deg,
              #0d1a2d,
              #101d30
            );
        }

        .awd-plan-inner {
          display: grid;
          grid-template-columns:
            78px minmax(0, 1fr);
          align-items: center;
          gap: 22px;
        }

        .awd-crown {
          width: 78px;
          height: 78px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: rgba(
            255,
            184,
            0,
            0.11
          );
          font-size: 40px;
        }

        .awd-plan-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .awd-plan-name {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
        }

        .awd-plan-expiry {
          margin-top: 5px;
          color: var(--awd-muted);
          font-size: 14px;
        }

        .awd-upgrade {
          min-height: 48px;
          padding: 10px 24px;
          border: 0;
          border-radius: 14px;
          background: var(
            --awd-orange
          );
          color: white;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .awd-progress {
          width: 100%;
          height: 11px;
          margin-top: 21px;
          overflow: hidden;
          border-radius: 999px;
          background: #1d2a3d;
        }

        .awd-progress-fill {
          display: block;
          height: 100%;
          min-width: 0;
          border-radius: inherit;
          background: var(
            --awd-orange
          );
          transition: width
            0.35s ease;
        }

        .awd-plan-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          color: var(--awd-muted);
          font-size: 14px;
        }

        .awd-disclaimer {
          padding: 31px 8px 22px;
          text-align: center;
          color: #77869d;
          font-size: 13px;
          line-height: 1.8;
        }

        /* ===============================================
           WORKSPACE
           =============================================== */

        .awd-workspace {
          scroll-margin-top: 105px;
          margin-top: 25px;
          padding: 22px;
          border: 1px solid
            var(--awd-border);
          border-radius: 24px;
          background: #091625;
        }

        .awd-workspace-head {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 14px;
        }

        .awd-workspace-close {
          min-height: 40px;
          padding-inline: 16px;
          border: 1px solid
            var(--awd-border);
          border-radius: 11px;
          background: #101e31;
          color: white;
          cursor: pointer;
        }

        .awd-workspace .card {
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
          min-height: 82px;
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );
          align-items: center;
          padding:
            7px
            max(
              8px,
              env(
                safe-area-inset-left
              )
            )
            calc(
              7px +
                env(
                  safe-area-inset-bottom
                )
            );
          border-top: 1px solid
            #1d2b40;
          background: rgba(
            5,
            15,
            28,
            0.98
          );
          backdrop-filter: blur(18px);
        }

        .awd-nav-link {
          min-width: 0;
          min-height: 62px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 17px;
          color: #8896aa;
          text-decoration: none;
          font-size: 12px;
        }

        .awd-nav-icon {
          min-width: 48px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          font-size: 25px;
        }

        .awd-nav-link.active {
          color: var(
            --awd-orange
          );
        }

        .awd-nav-link.active
          .awd-nav-icon {
          background: rgba(
            255,
            107,
            0,
            0.16
          );
        }

        /* ===============================================
           EXISTING TOOL CONTENT
           =============================================== */

        .awd-workspace input,
        .awd-workspace select,
        .awd-workspace textarea {
          max-width: 100%;
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

          .awd-header {
            min-height: 78px;
          }

          .awd-hero {
            grid-template-columns:
              1fr;
            min-height: 0;
            padding: 32px;
          }

          .awd-hero-art {
            display: none;
          }

          .awd-hero-content {
            text-align: center;
          }

          .awd-hero h2,
          .awd-hero-description {
            margin-inline: auto;
          }

          .awd-hero-buttons {
            justify-content: center;
          }

          .awd-tools-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .awd-plan-inner {
            grid-template-columns:
              1fr;
          }

          .awd-crown {
            margin-inline: auto;
          }
        }

        /* ===============================================
           MOBILE — الشكل المطلوب
           =============================================== */

        @media (
          max-width: 620px
        ) {
          .awd-page {
            padding-bottom: calc(
              90px +
                env(
                  safe-area-inset-bottom
                )
            );
          }

          .awd-shell {
            width: 100%;
            padding-inline: 16px;
          }

          .awd-header {
            width: 100%;
            min-height: 78px;
            gap: 8px;
          }

          .awd-menu-btn,
          .awd-header-btn {
            width: 43px;
            height: 43px;
            flex-basis: 43px;
            border-radius: 13px;
          }

          .awd-menu-lines {
            width: 19px;
          }

          .awd-brand {
            gap: 7px;
          }

          .awd-brand-logo {
            width: 43px;
            height: 43px;
            flex-basis: 43px;
            border-radius: 13px;
          }

          .awd-brand-title {
            font-size: 19px;
          }

          .awd-actions {
            gap: 5px;
          }

          .awd-actions
            > div:last-child {
            transform: scale(
              0.88
            );
            transform-origin: center;
            margin-inline: -3px;
          }

          .awd-market {
            padding-block: 17px;
            gap: 9px;
          }

          .awd-market label {
            font-size: 13px;
          }

          .awd-market select {
            min-height: 46px;
            max-width: none;
            font-size: 14px;
          }

          .awd-hero {
            display: block;
            min-height: 0;
            margin-top: 0;
            padding:
              28px
              20px
              24px;
            border-radius: 24px;
            text-align: center;
          }

          .awd-hero-art {
            display: none;
          }

          .awd-hero h2 {
            max-width: 100%;
            font-size: clamp(
              30px,
              8.2vw,
              38px
            );
            line-height: 1.1;
            letter-spacing: -0.9px;
          }

          .awd-hero-description {
            margin-top: 20px;
            font-size: 15px;
            line-height: 1.75;
          }

          .awd-hero-buttons {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 10px;
            margin-top: 24px;
          }

          .awd-hero-buttons
            button {
            width: 100%;
            min-width: 0;
            min-height: 50px;
            padding-inline: 8px;
            font-size: 15px;
          }

          .awd-features {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
            gap: 7px;
            margin-top: 21px;
          }

          .awd-feature {
            min-width: 0;
            min-height: 68px;
            padding: 7px 4px;
            font-size: 11px;
            line-height: 1.3;
          }

          .awd-slider-dots {
            margin-top: 21px;
          }

          .awd-slider-dot {
            width: 32px;
            height: 7px;
          }

          .awd-slider-dot.active {
            width: 48px;
          }

          .awd-tools-section {
            padding-top: 34px;
          }

          .awd-tools-head {
            display: block;
            margin-bottom: 18px;
          }

          .awd-tools-head h2 {
            font-size: 27px;
          }

          .awd-tools-head p {
            font-size: 14px;
          }

          .awd-view-all {
            display: inline-block;
            margin-top: 15px;
            font-size: 16px;
          }

          .awd-tools-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
            gap: 11px;
          }

          .awd-tool-card {
            min-height: 274px;
            padding: 15px;
            border-radius: 20px;
          }

          .awd-tool-icon {
            width: 52px;
            height: 52px;
            flex-basis: 52px;
            border-radius: 15px;
            font-size: 25px;
          }

          .awd-new {
            top: 15px;
            inset-inline-end: 14px;
            min-width: 58px;
            padding: 6px 10px;
            font-size: 12px;
          }

          .awd-tool-card h3 {
            margin-top: 18px;
            margin-bottom: 8px;
            font-size: 18px;
            line-height: 1.18;
          }

          .awd-tool-card p {
            font-size: 14px;
            line-height: 1.65;
          }

          .awd-use-tool {
            min-height: 48px;
            margin-top: 15px;
            font-size: 15px;
          }

          .awd-plan-card {
            margin-top: 32px;
            padding: 25px 19px;
            border-radius: 24px;
          }

          .awd-plan-inner {
            display: block;
          }

          .awd-crown {
            width: 70px;
            height: 70px;
            margin:
              0 auto
              20px;
            border-radius: 19px;
            font-size: 37px;
          }

          .awd-plan-top {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              auto;
            align-items: center;
            gap: 10px;
            text-align: start;
          }

          .awd-plan-name {
            font-size: 22px;
          }

          .awd-plan-expiry {
            font-size: 13px;
          }

          .awd-upgrade {
            min-height: 48px;
            padding-inline: 17px;
            font-size: 15px;
          }

          .awd-progress {
            margin-top: 21px;
          }

          .awd-plan-foot {
            font-size: 13px;
          }

          .awd-disclaimer {
            padding-top: 30px;
            padding-bottom: 20px;
            font-size: 12px;
          }

          .awd-workspace {
            padding: 14px;
            border-radius: 20px;
          }

          .awd-bottom-nav {
            min-height: 82px;
          }

          .awd-nav-link {
            font-size: 11px;
          }

          .awd-nav-icon {
            font-size: 23px;
          }
        }

        /* ===============================================
           SMALL PHONES
           =============================================== */

        @media (
          max-width: 390px
        ) {
          .awd-shell {
            padding-inline: 12px;
          }

          .awd-header {
            gap: 5px;
          }

          .awd-menu-btn,
          .awd-header-btn {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .awd-brand-logo {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .awd-brand-title {
            font-size: 16px;
          }

          .awd-actions {
            gap: 3px;
          }

          .awd-actions
            > div:last-child {
            transform: scale(
              0.8
            );
            margin-inline: -5px;
          }

          .awd-hero {
            padding-inline: 15px;
          }

          .awd-hero h2 {
            font-size: 29px;
          }

          .awd-feature {
            font-size: 10px;
          }

          .awd-tool-card {
            min-height: 270px;
            padding: 13px;
          }

          .awd-tool-card h3 {
            font-size: 16px;
          }

          .awd-tool-card p {
            font-size: 13px;
          }

          .awd-new {
            min-width: auto;
            font-size: 10px;
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
        aria-hidden={!drawerOpen}
      >
        <div className="awd-drawer-head">
          <img
            src="/logov3.png"
            alt="AllWDbook"
          />

          <strong>
            AllWDbook
          </strong>

          <button
            type="button"
            className="awd-drawer-close"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
            aria-label={
              isAr
                ? "إغلاق القائمة"
                : "Close menu"
            }
          >
            ✕
          </button>
        </div>

        <nav className="awd-drawer-links">
          <a
            href="/"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            🏠
            <span>
              {isAr
                ? "الرئيسية"
                : "Home"}
            </span>
          </a>

          <a
            href="/tools"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            🧰
            <span>
              {isAr
                ? "كل الأدوات"
                : "All Tools"}
            </span>
          </a>

          <a
            href="/subscription"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            👑
            <span>
              {isAr
                ? "الاشتراك"
                : "Subscription"}
            </span>
          </a>

          <a
            href="/blog"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            📰
            <span>
              {isAr
                ? "المدونة"
                : "Blog"}
            </span>
          </a>

          <a
            href="/about"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            ℹ️
            <span>
              {isAr
                ? "حول"
                : "About"}
            </span>
          </a>

          <a
            href="/privacy"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            🔒
            <span>
              {isAr
                ? "الخصوصية"
                : "Privacy"}
            </span>
          </a>

          <a
            href="/terms"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            📄
            <span>
              {isAr
                ? "الشروط"
                : "Terms"}
            </span>
          </a>

          <a
            href="/refund"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
          >
            ↩️
            <span>
              {isAr
                ? "الاسترداد"
                : "Refund"}
            </span>
          </a>
        </nav>
      </aside>

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="awd-header-wrap">
        <div className="awd-shell">
          <header className="awd-header">
            <button
              type="button"
              className="awd-menu-btn"
              onClick={() =>
                setDrawerOpen(true)
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

            <div className="awd-brand">
              <img
                src="/logov3.png"
                className="awd-brand-logo"
                alt="AllWDbook"
              />

              <h1 className="awd-brand-title">
                AllWDbook
              </h1>
            </div>

            <div className="awd-actions">
              <button
                type="button"
                className="awd-header-btn"
                onClick={
                  toggleLanguage
                }
                aria-label={
                  isAr
                    ? "تغيير اللغة إلى الإنجليزية"
                    : "Change language to Arabic"
                }
              >
                🌐
              </button>

              <button
                type="button"
                className="awd-header-btn"
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

              <AccountMenu />
            </div>
          </header>
        </div>
      </div>

      <div className="awd-shell">
        {/* =================================================
            MARKET
            ================================================= */}

        <div className="awd-market">
          <label htmlFor="awd-market">
            {isAr
              ? "السوق"
              : "Marketplace"}
          </label>

          <select
            id="awd-market"
            value={marketCode}
            onChange={(event) =>
              setMarketCode(
                event.target.value,
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

        {/* =================================================
            HERO
            ================================================= */}

        <section className="awd-hero">
          <div className="awd-hero-content">
            <h2>
              {isAr
                ? HERO_SLIDES[
                    slide
                  ].ar
                : HERO_SLIDES[
                    slide
                  ].en}
            </h2>

            <p className="awd-hero-description">
              {isAr
                ? "مجموعة متكاملة من الأدوات الاحترافية للبحث والتحليل والتصميم والنشر الرقمي — في مكان واحد."
                : "A complete set of professional tools for research, analysis, design and digital publishing — in one place."}
            </p>

            <div className="awd-hero-buttons">
              <button
                type="button"
                className="awd-start"
                onClick={() =>
                  openTool(5)
                }
              >
                {isAr
                  ? "ابدأ مجانًا 🚀"
                  : "Start Free 🚀"}
              </button>

              <button
                type="button"
                className="awd-explore"
                onClick={
                  scrollToTools
                }
              >
                {isAr
                  ? "استكشف الأدوات ▦"
                  : "Explore Tools ▦"}
              </button>
            </div>

            <div className="awd-features">
              <div className="awd-feature">
                ✅{" "}
                {isAr
                  ? "أدوات احترافية متكاملة"
                  : "Complete pro tools"}
              </div>

              <div className="awd-feature">
                ⚡{" "}
                {isAr
                  ? "نتائج سريعة ودقيقة"
                  : "Fast, accurate results"}
              </div>

              <div className="awd-feature">
                🛡️{" "}
                {isAr
                  ? "بدون بطاقة ائتمان"
                  : "No credit card"}
              </div>
            </div>

            <div className="awd-slider-dots">
              {HERO_SLIDES.map(
                (_, index) => (
                  <button
                    key={
                      index
                    }
                    type="button"
                    className={
                      "awd-slider-dot" +
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

          <div className="awd-hero-art">
            <img
              src="/logov3.png"
              alt="AllWDbook"
            />
          </div>
        </section>

        {/* =================================================
            TOOLS
            ================================================= */}

        <section
          id="awd-tools"
          className="awd-tools-section"
        >
          <div className="awd-tools-head">
            <div>
              <h2>
                {isAr
                  ? "أدوات KDP الاحترافية"
                  : "Professional KDP Tools"}
              </h2>

              <p>
                {isAr
                  ? "اختر الأداة التي تحتاجها وابدأ رحلتك نحو النجاح."
                  : "Pick the tool you need and start your journey to success."}
              </p>
            </div>

            <a
              href="/tools"
              className="awd-view-all"
            >
              {isAr
                ? "عرض الكل ‹"
                : "View all ›"}
            </a>
          </div>

          <div className="awd-tools-grid">
            {TOOLS.map(
              (tool) => (
                <article
                  className="awd-tool-card"
                  key={tool.id}
                >
                  {tool.isNew && (
                    <span className="awd-new">
                      {isAr
                        ? "جديد"
                        : "New"}
                    </span>
                  )}

                  <div
                    className="awd-tool-icon"
                    style={{
                      background:
                        tool.color,
                    }}
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
                    className="awd-use-tool"
                    onClick={() =>
                      openTool(
                        tool.id,
                      )
                    }
                  >
                    {isAr
                      ? "استخدم الأداة"
                      : "Use Tool"}
                  </button>
                </article>
              ),
            )}
          </div>
        </section>

        {/* =================================================
            PLAN
            ================================================= */}

        <section className="awd-plan-card">
          <div className="awd-plan-inner">
            <div className="awd-crown">
              👑
            </div>

            <div>
              <div className="awd-plan-top">
                <div>
                  <h3 className="awd-plan-name">
                    {isAr
                      ? usage.planNameAr
                      : usage.planNameEn}
                  </h3>

                  <div className="awd-plan-expiry">
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
                        ? "خطة مجانية — بلا انتهاء"
                        : "Free plan — no expiry"}
                  </div>
                </div>

                <button
                  type="button"
                  className="awd-upgrade"
                  onClick={() => {
                    window.location.href =
                      "/subscription";
                  }}
                >
                  {isAr
                    ? "ترقية ⚡"
                    : "Upgrade ⚡"}
                </button>
              </div>

              <div className="awd-progress">
                <span
                  className="awd-progress-fill"
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
                    ? "استخدام هذا الشهر"
                    : "uses this month"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            DISCLAIMER
            ================================================= */}

        <div className="awd-disclaimer">
          {isAr
            ? "AllWDbook أداة مستقلة وليست تابعة لأي منصة نشر أو شركة."
            : "AllWDbook is an independent tool and is not affiliated with any publishing platform or company."}
        </div>

        {/* =================================================
            WORKSPACE
            ================================================= */}

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
                seed={seedKw}
              />
            )}

            {tab === 5 && (
              <Calc
                t={t}
                lang={lang}
                domain={
                  marketCode
                }
                market={market}
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
        <a
          href="/tools"
          className="awd-nav-link"
        >
          <span className="awd-nav-icon">
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
          className="awd-nav-link active"
        >
          <span className="awd-nav-icon">
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
        </a>

        <a
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
        </a>
      </nav>
    </main>
  );
}

/* =========================================================
   MICRO-NICHE
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
        data?.session || null;
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
      setUpgradeOpen(true);
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

          body: JSON.stringify(
            {
              toolId:
                "microNiche",
            },
          ),
        },
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (
      !response.ok &&
      data?.error ===
        "DAILY_LIMIT_REACHED"
    ) {
      setUpgradeOpen(true);

      return false;
    }

    return response.ok;
  }

  async function load() {
    setBusy(true);

    const seed =
      String(Date.now());

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

  function categoryLabel(key) {
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
            event.target.value,
          )
        }
      >
        {Object.keys(
          NICHE_CATEGORIES,
        ).map((key) => (
          <option
            key={key}
            value={key}
          >
            {categoryLabel(
              key,
            )}
          </option>
        ))}
      </select>

      <label className="mut">
        {t.nicheCount}
      </label>

      <select
        value={count}
        onChange={(event) =>
          setCount(
            Number(
              event.target.value,
            ),
          )
        }
      >
        {[12, 24, 40, 60].map(
          (number) => (
            <option
              key={number}
              value={number}
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
              disabled={busy}
            >
              {
                t.nicheValidate
              }
            </button>

            <button
              className="mini"
              onClick={copyAll}
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
        open={upgradeOpen}
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
   BOOK DESCRIPTION FORMATTER
   ========================================================= */

function escapeHtml(value) {
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

function formatDescription(value) {
  return String(
    value || "",
  )
    .slice(0, 4000)
    .split("\n\n")
    .map((paragraph) =>
      paragraph.trim(),
    )
    .filter(Boolean)
    .map((paragraph) => {
      if (
        paragraph.startsWith(
          "- ",
        )
      ) {
        const list =
          paragraph
            .split("\n")
            .filter(Boolean)
            .map((line) => {
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
            })
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
    })
    .join("");
}

function Formatter({ t }) {
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
        maxLength={4000}
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value,
          )
        }
      />

      <h3>
        {t.preview}
      </h3>

      <div
        className="prev"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />

      <div className="formatterHead">
        <h3>
          {t.htmlCode}
        </h3>

        <button
          className="mini"
          onClick={copyHtml}
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
  ] = useState(12.99);

  const [
    pages,
    setPages,
  ] = useState(120);

  const [
    ink,
    setInk,
  ] = useState("black");

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

  const label = market
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
            {t.marketplace}:
          </b>{" "}
          {label} ·{" "}
          {mInfo.currency}
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
              event.target.value,
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
              event.target.value,
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
            event.target.value,
          )
        }
      >
        <option value="black">
          {t.blackInk}
        </option>

        <option value="premium">
          {t.premiumColor}
        </option>

        <option value="standard">
          {t.standardColor}
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
          {t.regularTrim}
        </option>

        <option value="large">
          {t.largeTrim}
        </option>
      </select>

      {cost === null ? (
        <div className="trustNote warnNote">
          <p>
            ⚠️{" "}
            {t.invalidPrint}
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
              {t.printCost}
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
        ⚖️ {t.notAdvice}
      </p>
    </div>
  );
}
