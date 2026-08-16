"use client";

import {
  useEffect,
  useState,
} from "react";

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

const DOMAINS = [
  "amazon.com",
  "amazon.co.uk",
  "amazon.de",
  "amazon.fr",
  "amazon.it",
  "amazon.es",
  "amazon.ca",
];

const ORDER = [6, 1, 0, 5, 4];

const ICONS = [
  "🔑",
  "🎯",
  "📚",
  "📈",
  "✍️",
  "🧮",
];

function tabLabel(t, lang, index) {
  if (index === 6) {
    return (
      "📐 " +
      (lang === "en"
        ? "Cover Designer"
        : "مصمم الغلاف")
    );
  }

  return (
    ICONS[index] +
    " " +
    t.tabs[index]
  );
}

export default function Home() {
  const [
    lang,
    setLang,
  ] = useState("ar");

  const [
    tab,
    setTab,
  ] = useState(6);

  const [
    domain,
    setDomain,
  ] = useState("amazon.com");

  const [
    seedKw,
    setSeedKw,
  ] = useState("");

  const t = T[lang];

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("awd_lang");

    if (
      savedLanguage &&
      T[savedLanguage]
    ) {
      setLang(savedLanguage);
    }

    function syncLanguage(event) {
      const nextLanguage =
        event?.detail ||
        localStorage.getItem(
          "awd_lang",
        );

      if (
        nextLanguage &&
        T[nextLanguage]
      ) {
        setLang(nextLanguage);
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
    localStorage.setItem(
      "awd_lang",
      lang,
    );

    document.documentElement.lang =
      lang;

    document.documentElement.dir =
      t.dir;
  }, [lang, t.dir]);

  function sendToKeywords(keyword) {
    setSeedKw(keyword);
    setTab(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <style jsx global>{`
        .awd-home {
          min-height: 100vh;
          background: #07101d;
          color: #f7f9fc;
          padding: 0 16px 28px;
        }

        .awd-shell {
          max-width: 1240px;
          margin: 0 auto;
        }

        .awd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 76px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .awd-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .awd-logo {
          width: 54px;
          height: 54px;
          object-fit: contain;
          border-radius: 14px;
          background: #101a2a;
        }

        .awd-brand-title {
          margin: 0;
          font-size: clamp(20px, 3vw, 28px);
          line-height: 1.05;
        }

        .awd-brand-sub {
          display: block;
          margin-top: 5px;
          color: #aeb9c9;
          font-size: 12px;
        }

        .awd-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .awd-lang {
          min-width: 44px;
          height: 42px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #0d1726;
          color: #fff;
          cursor: pointer;
        }

        .awd-hero {
          margin-top: 22px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 24px;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 75% 40%,
              rgba(255,103,0,.20),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #0d1830,
              #08111f 62%,
              #121a27
            );
          box-shadow:
            0 20px 60px rgba(0,0,0,.24);
        }

        .awd-hero-inner {
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          align-items: center;
          gap: 20px;
          padding: 28px;
        }

        .awd-kicker {
          color: #ff7a18;
          font-weight: 800;
          letter-spacing: .3px;
          margin-bottom: 8px;
        }

        .awd-hero h2 {
          margin: 0;
          font-size: clamp(28px, 5vw, 54px);
          line-height: 1.05;
        }

        .awd-hero h2 span {
          color: #ff7515;
        }

        .awd-hero p {
          color: #b8c3d4;
          line-height: 1.8;
          max-width: 650px;
        }

        .awd-hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .awd-primary {
          border: 0;
          border-radius: 12px;
          padding: 13px 20px;
          background: #ff6b0a;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 8px 24px rgba(255,107,10,.22);
        }

        .awd-secondary {
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 12px;
          padding: 13px 20px;
          background: #0d1726;
          color: #fff;
          cursor: pointer;
        }

        .awd-hero-logo {
          width: min(100%, 360px);
          max-height: 300px;
          object-fit: contain;
          display: block;
          margin: auto;
          filter:
            drop-shadow(
              0 18px 32px rgba(0,0,0,.35)
            );
        }

        .awd-trust {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
          padding: 0 28px 26px;
        }

        .awd-trust-item {
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,.035);
          color: #cbd4e1;
          text-align: center;
          font-size: 13px;
        }

        .awd-section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
          margin: 28px 0 14px;
        }

        .awd-section-head h2 {
          margin: 0;
          font-size: 24px;
        }

        .awd-section-head p {
          margin: 5px 0 0;
          color: #94a2b7;
          font-size: 13px;
        }

        .awd-tool-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          gap: 12px;
        }

        .awd-tool-card {
          min-height: 150px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          background: #0d1726;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .awd-tool-icon {
          font-size: 26px;
          margin-bottom: 8px;
        }

        .awd-tool-card h3 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .awd-tool-card p {
          margin: 0 0 12px;
          color: #9eabbd;
          font-size: 12px;
          line-height: 1.6;
        }

        .awd-tool-btn {
          width: 100%;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 9px;
          padding: 9px;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }

        .awd-tool-btn:hover {
          border-color: #ff6b0a;
          color: #ff8a3d;
        }

        .awd-disclaimer {
          margin: 22px 0 0;
          padding: 13px 15px;
          border-radius: 12px;
          background: rgba(255,107,10,.07);
          border: 1px solid rgba(255,107,10,.16);
          color: #aeb9c9;
          font-size: 12px;
          line-height: 1.7;
        }

        .awd-current-tool {
          margin-top: 22px;
        }

        .awd-market {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #9eabbd;
        }

        .awd-market select {
          max-width: 220px;
        }

        .awd-footer {
          margin-top: 30px;
          padding: 20px 0;
          border-top:
            1px solid rgba(255,255,255,.08);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #8e9bae;
          font-size: 12px;
          text-align: center;
        }

        .awd-footer img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: 10px;
        }

        @media (max-width: 900px) {
          .awd-hero-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .awd-hero p {
            margin-left: auto;
            margin-right: auto;
          }

          .awd-hero-logo {
            max-height: 250px;
          }

          .awd-tool-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .awd-trust {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .awd-home {
            padding: 0 10px 20px;
          }

          .awd-header {
            min-height: 66px;
          }

          .awd-logo {
            width: 45px;
            height: 45px;
          }

          .awd-brand-sub {
            font-size: 10px;
          }

          .awd-hero-inner {
            padding: 20px 16px 16px;
          }

          .awd-hero h2 {
            font-size: 31px;
          }

          .awd-hero-buttons {
            justify-content: center;
          }

          .awd-primary,
          .awd-secondary {
            width: 100%;
          }

          .awd-tool-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .awd-tool-card {
            min-height: 160px;
            padding: 12px;
          }

          .awd-tool-card h3 {
            font-size: 14px;
          }

          .awd-tool-card p {
            font-size: 11px;
          }

          .awd-section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .awd-market {
            flex-direction: column;
            align-items: stretch;
          }

          .awd-market select {
            max-width: none;
            width: 100%;
          }

          .awd-footer {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="awd-home">
        <div className="awd-shell">

          <header className="awd-header">

            <div className="awd-brand">
              <img
                className="awd-logo"
                src="/logov3.png"
                alt="AllWDbook"
              />

              <div>
                <h1 className="awd-brand-title">
                  AllWDbook
                </h1>

                <span className="awd-brand-sub">
                  KDP Tools &amp; Digital Publishing
                </span>
              </div>
            </div>

            <div className="awd-actions">
              <AccountMenu />

              <button
                className="awd-lang"
                type="button"
                aria-label={
                  lang === "ar"
                    ? "Switch to English"
                    : "التبديل إلى العربية"
                }
                onClick={() =>
                  setLang(
                    lang === "ar"
                      ? "en"
                      : "ar",
                  )
                }
              >
                {lang === "ar"
                  ? "🇺🇸"
                  : "🇩🇿"}
              </button>
            </div>

          </header>

          <section className="awd-hero">

            <div className="awd-hero-inner">

              <div>

                <div className="awd-kicker">
                  AllWDbook
                </div>

                <h2>
                  {lang === "ar"
                    ? "كل ما تحتاجه للنجاح في"
                    : "Everything you need to succeed with"}

                  <span>
                    {" "}
                    KDP
                  </span>
                </h2>

                <p>
                  {lang === "ar"
                    ? "مجموعة متكاملة من الأدوات الاحترافية للبحث والتحليل وتصميم الكتب والنشر الرقمي."
                    : "A focused suite of professional tools for research, analysis, book creation and digital publishing."}
                </p>

                <div className="awd-hero-buttons">

                  <button
                    className="awd-primary"
                    onClick={() =>
                      setTab(6)
                    }
                  >
                    {lang === "ar"
                      ? "ابدأ مجانًا 🚀"
                      : "Start Free 🚀"}
                  </button>

                  <button
                    className="awd-secondary"
                    onClick={() =>
                      document
                        .getElementById(
                          "awd-tools",
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                        })
                    }
                  >
                    {lang === "ar"
                      ? "استكشف الأدوات ▦"
                      : "Explore Tools ▦"}
                  </button>

                </div>
              </div>

              <img
                className="awd-hero-logo"
                src="/logov3.png"
                alt="AllWDbook KDP Tools"
              />

            </div>

            <div className="awd-trust">

              <div className="awd-trust-item">
                🛡️{" "}
                {lang === "ar"
                  ? "بدون بطاقة ائتمان"
                  : "No credit card required"}
              </div>

              <div className="awd-trust-item">
                ⚡{" "}
                {lang === "ar"
                  ? "نتائج دقيقة وسريعة"
                  : "Fast, practical results"}
              </div>

              <div className="awd-trust-item">
                ✓{" "}
                {lang === "ar"
                  ? "أدوات احترافية متكاملة"
                  : "Professional integrated tools"}
              </div>

            </div>

          </section>

          <div className="awd-market">

            <span>
              {t.marketplace}
            </span>

            <select
              value={domain}
              onChange={(event) =>
                setDomain(
                  event.target.value,
                )
              }
              aria-label={
                t.marketplace
              }
            >
              {DOMAINS.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>

          </div>

          <section id="awd-tools">

            <div className="awd-section-head">

              <div>
                <h2>
                  {lang === "ar"
                    ? "أدوات KDP الاحترافية"
                    : "Professional KDP Tools"}
                </h2>

                <p>
                  {lang === "ar"
                    ? "اختر الأداة التي تحتاجها وابدأ عملك."
                    : "Choose the tool you need and get started."}
                </p>
              </div>

            </div>

            <div className="awd-tool-grid">

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    🔎
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "بحث النيش المصغر"
                      : "Micro-Niche Research"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "اكتشف نيشات مناسبة ومنخفضة المنافسة."
                      : "Discover focused, lower-competition niches."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(1)
                  }
                >
                  {lang === "ar"
                    ? "استخدم الأداة"
                    : "Use Tool"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    🔑
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "بحث الكلمات المفتاحية"
                      : "Keyword Research"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "ابحث عن الكلمات المفتاحية لكتبك."
                      : "Research keywords for your books."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(0)
                  }
                >
                  {lang === "ar"
                    ? "استخدم الأداة"
                    : "Use Tool"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    ✎
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "مصمم الغلاف"
                      : "Cover Designer"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "صمم أغلفة كتبك باستخدام أداتك الحالية."
                      : "Create covers using your existing designer."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(6)
                  }
                >
                  {lang === "ar"
                    ? "استخدم الأداة"
                    : "Use Tool"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    🧮
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "حاسبة الأرباح"
                      : "Royalty Calculator"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "احسب تكلفة الطباعة والأرباح المتوقعة."
                      : "Estimate print cost and royalties."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(5)
                  }
                >
                  {lang === "ar"
                    ? "استخدم الأداة"
                    : "Use Tool"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    📝
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "منشئ وصف الكتاب"
                      : "Book Description Formatter"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "نسّق وصف كتابك بسهولة."
                      : "Format your book description."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(4)
                  }
                >
                  {lang === "ar"
                    ? "استخدم الأداة"
                    : "Use Tool"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    📐
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "أدوات المقاسات"
                      : "Book Size Tools"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "الوصول إلى أدوات المقاسات الحالية دون تغييرها."
                      : "Keep using your existing sizing tools."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(6)
                  }
                >
                  {lang === "ar"
                    ? "استكشف"
                    : "Explore"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    ✅
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "قائمة التحقق للنشر"
                      : "Publishing Checklist"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "راجع جاهزية كتابك قبل النشر."
                      : "Review your book before publishing."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(6)
                  }
                >
                  {lang === "ar"
                    ? "استكشف"
                    : "Explore"}
                </button>

              </div>

              <div className="awd-tool-card">

                <div>
                  <div className="awd-tool-icon">
                    🧰
                  </div>

                  <h3>
                    {lang === "ar"
                      ? "أدوات إضافية"
                      : "More Tools"}
                  </h3>

                  <p>
                    {lang === "ar"
                      ? "الأدوات الحالية تبقى كما هي دون إعادة كتابة."
                      : "Your existing tools remain untouched."}
                  </p>
                </div>

                <button
                  className="awd-tool-btn"
                  onClick={() =>
                    setTab(6)
                  }
                >
                  {lang === "ar"
                    ? "استكشف"
                    : "Explore"}
                </button>

              </div>

            </div>

          </section>

          <div className="awd-current-tool">

            {tab === 6 && (
              <CoverTool
                lang={lang}
              />
            )}

            {tab === 1 && (
              <Niches
                t={t}
                lang={lang}
                domain={domain}
                onAnalyze={
                  sendToKeywords
                }
              />
            )}

            {tab === 0 && (
              <KeywordsPanel
                t={t}
                domain={domain}
                seed={seedKw}
              />
            )}

            {tab === 5 && (
              <Calc
                t={t}
                domain={domain}
              />
            )}

            {tab === 4 && (
              <Formatter
                t={t}
              />
            )}

          </div>

          <div className="awd-disclaimer">
            {lang === "ar"
              ? "AllWDbook أداة مستقلة وليست تابعة أو معتمدة أو مدعومة من Amazon أو KDP."
              : "AllWDbook is an independent tool and is not affiliated with, endorsed by, or sponsored by Amazon or KDP."}
          </div>

          <footer className="awd-footer">

            <img
              src="/logov3.png"
              alt="AllWDbook"
            />

            <span>
              {t.by}{" "}
              <b>
                All World Digital
              </b>{" "}
              ©{" "}
              {new Date().getFullYear()}{" "}
              · {t.rights}
            </span>

          </footer>

        </div>
      </div>
    </>
  );
}

function Niches({
  t,
  lang,
  domain,
  onAnalyze,
}) {
  const [
    category,
    setCategory,
  ] = useState("coloring");

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
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    if (!session?.access_token) {
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

    if (!session?.access_token) {
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

    const response = await fetch(
      "/api/usage/consume",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          toolId: "microNiche",
        }),
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

    const seed = String(
      Date.now(),
    );

    try {
      const allowed =
        await canUseMicroNiche();

      if (!allowed) {
        return;
      }

      const response = await fetch(
        "/api/niches?cat=" +
          category +
          "&domain=" +
          domain +
          "&count=" +
          count +
          "&seed=" +
          seed,
      );

      const data =
        await response.json();

      setRows(data.rows || []);
    } catch {
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

      const response = await fetch(
        "/api/niches?cat=" +
          category +
          "&domain=" +
          domain +
          "&count=" +
          count +
          "&seed=fixed&validate=1",
      );

      const data =
        await response.json();

      setRows(data.rows || []);
    } catch {
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(
      rows
        .map(
          (row) => row.keyword,
        )
        .join("\n"),
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  function categoryLabel(key) {
    return lang === "ar"
      ? NICHE_CATEGORIES[key].ar
      : NICHE_CATEGORIES[key].en;
  }

  return (
    <div className="card">
      <div className="trustNote">
        <p>{t.nicheNote}</p>
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
            {categoryLabel(key)}
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
              {t.nicheValidate}
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

          {rows.map((row) => (
            <div
              key={row.keyword}
              className="nrow"
            >
              <span className="nicheText">
                {row.keyword}

                {row.longTail && (
                  <small className="mut">
                    {" "}
                    · {t.longTail}
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
                    ? t[row.demand] ||
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
                  {t.analyzeThis}
                </button>
              </span>
            </div>
          ))}
        </>
      )}

      <UpgradePrompt
        open={upgradeOpen}
        toolId="microNiche"
        onClose={() =>
          setUpgradeOpen(false)
        }
      />
    </div>
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDescription(value) {
  return value
    .slice(0, 4000)
    .split("\n\n")
    .map((paragraph) =>
      paragraph.trim(),
    )
    .filter(Boolean)
    .map((paragraph) => {
      if (
        paragraph.startsWith("- ")
      ) {
        const list = paragraph
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const cleanLine =
              line.startsWith("- ")
                ? line.slice(2)
                : line;

            return (
              "<li>" +
              escapeHtml(cleanLine) +
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
        paragraph.startsWith("# ")
      ) {
        return (
          "<h4>" +
          escapeHtml(
            paragraph.slice(2),
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
          "\u0001NLBR\u0001",
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
    formatDescription(value);

  async function copyHtml() {
    await navigator.clipboard.writeText(
      html,
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
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

      <h3>{t.preview}</h3>

      <div
        className="prev"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />

      <div className="formatterHead">
        <h3>{t.htmlCode}</h3>

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
        {t.chars}: {value.length}
        /4000
      </p>
    </div>
  );
}

function Calc({
  t,
  domain,
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

  const market =
    marketInfo(domain);

  const options = {
    domain,
    ink,
    large,
  };

  const cost = printCost(
    pages,
    options,
  );

  const rate = royaltyRate(
    price,
    domain,
  );

  const royalty = royaltyPerUnit(
    price,
    pages,
    options,
  );

  return (
    <div className="card">
      <div className="trustNote">
        <p>
          <b>{t.marketplace}:</b>{" "}
          {domain} ·{" "}
          {market.currency}
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
            event.target.value ===
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
            ⚠️ {t.invalidPrint}
          </p>
        </div>
      ) : (
        <div className="grid resultSection">
          <div className="kpi">
            <b>
              {market.symbol}
              {cost.toFixed(2)}
            </b>

            <span>
              {t.printCost}
            </span>
          </div>

          <div className="kpi">
            <b>
              {rate
                ? Math.round(
                    rate * 100,
                  ) + "%"
                : "—"}
            </b>

            <span>
              {t.royaltyRate}
            </span>
          </div>

          <div className="kpi fullKpi">
            <b>
              {royalty === null
                ? "—"
                : market.symbol +
                  royalty.toFixed(2)}
            </b>

            <span>
              {t.royaltyUnit}
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
