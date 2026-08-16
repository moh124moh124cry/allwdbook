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
  const [lang, setLang] = useState("ar");
  const [tab, setTab] = useState(6);
  const [domain, setDomain] = useState("amazon.com");
  const [seedKw, setSeedKw] = useState("");

  const t = T[lang];

  useEffect(() => {
    const savedLanguage = localStorage.getItem("awd_lang");

    if (savedLanguage && T[savedLanguage]) {
      setLang(savedLanguage);
    }

    function syncLanguage(event) {
      const nextLanguage =
        event?.detail ||
        localStorage.getItem("awd_lang");

      if (nextLanguage && T[nextLanguage]) {
        setLang(nextLanguage);
      }
    }

    window.addEventListener(
      "awd-language-change",
      syncLanguage
    );

    return () =>
      window.removeEventListener(
        "awd-language-change",
        syncLanguage
      );
  }, []);

  useEffect(() => {
    localStorage.setItem("awd_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  function sendToKeywords(keyword) {
    setSeedKw(keyword);
    setTab(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const tools = [
    {
      id: 1,
      icon: "🎯",
      title:
        lang === "en"
          ? "Micro-Niche Research"
          : "بحث النيش المصغر",
      text:
        lang === "en"
          ? "Discover focused KDP niches."
          : "اكتشف نيشات KDP دقيقة ومناسبة.",
    },

    {
      id: 0,
      icon: "🔑",
      title:
        lang === "en"
          ? "Keyword Research"
          : "بحث الكلمات المفتاحية",
      text:
        lang === "en"
          ? "Find keywords to improve discoverability."
          : "ابحث عن الكلمات المفتاحية لزيادة ظهور كتبك.",
    },

    {
      id: 6,
      icon: "📐",
      title:
        lang === "en"
          ? "Cover Designer"
          : "مصمم أغلفة الكتب",
      text:
        lang === "en"
          ? "Create professional KDP-ready covers."
          : "صمم أغلفة احترافية لكتبك.",
    },

    {
      id: 5,
      icon: "🧮",
      title:
        lang === "en"
          ? "Royalty Calculator"
          : "حاسبة الأرباح",
      text:
        lang === "en"
          ? "Estimate your expected book royalties."
          : "احسب أرباحك المتوقعة قبل النشر.",
    },

    {
      id: 4,
      icon: "✍️",
      title:
        lang === "en"
          ? "Book Description"
          : "منشئ وصف الكتاب",
      text:
        lang === "en"
          ? "Create a persuasive book description."
          : "أنشئ وصفًا احترافيًا يجذب القراء.",
    },
  ];

  return (
    <div
      className="awd-v2"
      style={{ minHeight: "100vh" }}
    >
      <style jsx>{`
        .awd-v2{
          background:#07101d;
          color:#eef4ff;
          min-height:100vh;
          padding-bottom:30px
        }

        .awd-shell{
          width:min(1180px,calc(100% - 28px));
          margin:0 auto
        }

        .awd-header{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          padding:16px 0;
          border-bottom:1px solid rgba(255,255,255,.08);
          position:sticky;
          top:0;
          z-index:30;
          background:rgba(7,16,29,.94);
          backdrop-filter:blur(14px)
        }

        .awd-brand{
          display:flex;
          align-items:center;
          gap:12px;
          min-width:0
        }

        .awd-logo{
          width:54px;
          height:54px;
          object-fit:contain;
          border-radius:14px;
          background:#07101d
        }

        .awd-brand h1{
          font-size:22px;
          margin:0;
          letter-spacing:.2px
        }

        .awd-brand p{
          margin:2px 0 0;
          color:#9aa9bf;
          font-size:12px
        }

        .awd-actions{
          display:flex;
          align-items:center;
          gap:8px
        }

        .awd-lang{
          border:1px solid rgba(255,255,255,.12);
          background:#101b2c;
          color:#fff;
          border-radius:12px;
          padding:10px 12px;
          cursor:pointer
        }

        .awd-market{
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:10px;
          padding:14px 0
        }

        .awd-market select{
          width:auto;
          min-width:170px
        }

        .awd-hero{
          margin-top:10px;
          border:1px solid rgba(255,255,255,.10);
          border-radius:24px;
          padding:28px;
          display:grid;
          grid-template-columns:1.15fr .85fr;
          gap:22px;
          align-items:center;
          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(255,100,0,.18),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #0a1728,
              #101b32 60%,
              #111c2d
            );
          overflow:hidden
        }

        .awd-hero h2{
          font-size:clamp(30px,5vw,56px);
          line-height:1.08;
          margin:0 0 14px
        }

        .awd-hero h2 span{
          color:#ff6a00
        }

        .awd-hero p{
          color:#aebbd0;
          font-size:16px;
          line-height:1.8;
          max-width:620px
        }

        .awd-cta{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:20px
        }

        .awd-cta button{
          cursor:pointer;
          border-radius:12px;
          padding:12px 20px;
          border:1px solid rgba(255,255,255,.14);
          font-weight:700
        }

        .awd-primary{
          background:#ff6a00;
          color:#fff
        }

        .awd-secondary{
          background:#0c1625;
          color:#fff
        }

        .awd-hero-logo{
          display:flex;
          justify-content:center;
          align-items:center
        }

        .awd-hero-logo img{
          width:min(360px,100%);
          max-height:290px;
          object-fit:contain;
          filter:drop-shadow(
            0 18px 35px rgba(0,0,0,.35)
          )
        }

        .awd-features{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:10px;
          margin-top:18px
        }

        .awd-feature{
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.025);
          padding:12px;
          border-radius:14px;
          text-align:center;
          color:#dce6f5;
          font-size:13px
        }

        .awd-tools-head{
          display:flex;
          align-items:end;
          justify-content:space-between;
          gap:12px;
          margin:28px 0 12px
        }

        .awd-tools-head h2{
          margin:0;
          font-size:25px
        }

        .awd-tools-head p{
          margin:6px 0 0;
          color:#9aa9bf
        }

        .awd-tools-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:14px
        }

        .awd-tool{
          border:1px solid rgba(255,255,255,.09);
          border-radius:18px;
          background:
            linear-gradient(
              145deg,
              #0d192a,
              #0a1422
            );
          padding:18px;
          min-height:190px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          box-shadow:
            0 12px 30px rgba(0,0,0,.12)
        }

        .awd-icon{
          width:48px;
          height:48px;
          display:grid;
          place-items:center;
          border-radius:14px;
          background:rgba(255,106,0,.12);
          font-size:25px
        }

        .awd-tool h3{
          margin:12px 0 6px;
          font-size:17px
        }

        .awd-tool p{
          margin:0;
          color:#93a2b7;
          font-size:13px;
          line-height:1.6
        }

        .awd-use{
          margin-top:14px;
          width:100%;
          border:1px solid rgba(255,255,255,.12);
          background:#101d2e;
          color:#fff;
          border-radius:10px;
          padding:10px;
          cursor:pointer
        }

        .awd-use:hover{
          border-color:#ff6a00
        }

        .awd-sub{
          margin-top:18px;
          border:1px solid rgba(255,255,255,.08);
          border-radius:20px;
          padding:20px;
          background:
            linear-gradient(
              100deg,
              #0d1829,
              #121d2d
            )
        }

        .awd-sub-row{
          display:flex;
          justify-content:space-between;
          gap:18px;
          align-items:center
        }

        .awd-progress{
          height:8px;
          background:#1d293a;
          border-radius:99px;
          overflow:hidden;
          margin:12px 0
        }

        .awd-progress span{
          display:block;
          width:35%;
          height:100%;
          background:#ff6a00;
          border-radius:99px
        }

        .awd-upgrade{
          border:0;
          background:#ff6a00;
          color:#fff;
          border-radius:10px;
          padding:10px 18px;
          font-weight:700;
          cursor:pointer
        }

        .awd-disclaimer{
          margin-top:18px;
          text-align:center;
          color:#74849b;
          font-size:11px;
          line-height:1.7
        }

        .awd-footer{
          margin-top:28px;
          padding:18px 0;
          text-align:center;
          color:#7f8da2;
          border-top:1px solid rgba(255,255,255,.08)
        }

        .awd-footer img{
          width:44px;
          height:44px;
          object-fit:contain;
          vertical-align:middle;
          margin-inline-end:8px
        }

        @media(max-width:820px){
          .awd-shell{
            width:min(100% - 18px,620px)
          }

          .awd-header{
            padding:10px 0
          }

          .awd-logo{
            width:44px;
            height:44px
          }

          .awd-brand h1{
            font-size:18px
          }

          .awd-brand p{
            font-size:10px
          }

          .awd-market{
            justify-content:stretch
          }

          .awd-market select{
            width:100%
          }

          .awd-hero{
            grid-template-columns:1fr;
            padding:20px;
            text-align:center
          }

          .awd-hero-logo{
            order:-1
          }

          .awd-hero-logo img{
            width:min(280px,85vw);
            max-height:230px
          }

          .awd-hero h2{
            font-size:32px
          }

          .awd-hero p{
            font-size:14px
          }

          .awd-cta{
            justify-content:center
          }

          .awd-cta button{
            flex:1;
            min-width:130px
          }

          .awd-features{
            grid-template-columns:repeat(3,1fr)
          }

          .awd-tools-head{
            align-items:start;
            flex-direction:column
          }

          .awd-tools-grid{
            grid-template-columns:repeat(2,1fr);
            gap:10px
          }

          .awd-tool{
            padding:14px;
            min-height:180px
          }

          .awd-tool h3{
            font-size:15px
          }

          .awd-tool p{
            font-size:12px
          }

          .awd-sub-row{
            flex-direction:column;
            align-items:stretch
          }

          .awd-upgrade{
            width:100%
          }
        }

        @media(max-width:480px){
          .awd-tools-grid{
            grid-template-columns:1fr 1fr
          }

          .awd-tool{
            min-height:175px
          }

          .awd-brand p{
            display:none
          }

          .awd-actions .lang{
            font-size:12px
          }

          .awd-hero h2{
            font-size:28px
          }

          .awd-features{
            grid-template-columns:repeat(3,1fr);
            gap:8px
          }

          .awd-feature{
            padding:10px 5px;
            font-size:12px
          }
        }
      `}</style>

      <div className="awd-shell">

        <header className="awd-header">

          <div className="awd-brand">
            <img
              className="awd-logo"
              src="/logov3.png"
              alt="AllWDbook"
            />

            <div>
              <h1>AllWDbook</h1>
              <p>
                KDP Tools & Digital Publishing
              </p>
            </div>
          </div>

          <div className="awd-actions">

            {/* تم حذف AccountMenu هنا فقط */}

            <button
              className="awd-lang"
              type="button"
              onClick={() =>
                setLang(
                  lang === "ar"
                    ? "en"
                    : "ar"
                )
              }
              aria-label={
                lang === "ar"
                  ? "Switch to English"
                  : "التبديل إلى العربية"
              }
            >
              {lang === "ar"
                ? "🇺🇸 English"
                : "🇩🇿 العربية"}
            </button>

          </div>

        </header>

        <div className="awd-market">

          <label
            className="mut"
            htmlFor="marketplace"
          >
            {t.marketplace}
          </label>

          <select
            id="marketplace"
            value={domain}
            onChange={(event) =>
              setDomain(
                event.target.value
              )
            }
          >
            {DOMAINS.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

        </div>

        <section className="awd-hero">

          <div>

            <h2>
              {lang === "en" ? (
                <>
                  Everything you need
                  to succeed with{" "}
                  <span>KDP</span>
                </>
              ) : (
                <>
                  كل ما تحتاجه للنجاح
                  في <span>KDP</span>
                </>
              )}
            </h2>

            <p>
              {lang === "en"
                ? "Professional tools for research, keywords, covers, calculations and digital publishing — in one place."
                : "مجموعة متكاملة من الأدوات الاحترافية للبحث والكلمات المفتاحية وتصميم الأغلفة والحسابات والنشر الرقمي في مكان واحد."}
            </p>

            <div className="awd-cta">

              <button
                className="awd-primary"
                type="button"
                onClick={() =>
                  setTab(1)
                }
              >
                {lang === "en"
                  ? "Start Free 🚀"
                  : "ابدأ مجانًا 🚀"}
              </button>

              <button
                className="awd-secondary"
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "awd-tools"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              >
                {lang === "en"
                  ? "Explore Tools ▦"
                  : "استكشف الأدوات ▦"}
              </button>

            </div>

            <div className="awd-features">

              <div className="awd-feature">
                🛡️{" "}
                {lang === "en"
                  ? "Secure"
                  : "آمن"}
              </div>

              <div className="awd-feature">
                ⚡{" "}
                {lang === "en"
                  ? "Fast Results"
                  : "نتائج سريعة"}
              </div>

              <div className="awd-feature">
                ✓{" "}
                {lang === "en"
                  ? "Professional Tools"
                  : "أدوات احترافية"}
              </div>

            </div>

          </div>

          <div className="awd-hero-logo">
            <img
              src="/logov3.png"
              alt="AllWDbook KDP tools"
            />
          </div>

        </section>

        <section id="awd-tools">

          <div className="awd-tools-head">

            <div>

              <h2>
                {lang === "en"
                  ? "Professional KDP Tools"
                  : "أدوات KDP الاحترافية"}
              </h2>

              <p>
                {lang === "en"
                  ? "Choose a tool and continue using the existing powerful workflow."
                  : "اختر الأداة التي تحتاجها واستمر باستخدام الأكواد الحالية القوية."}
              </p>

            </div>

          </div>

          <div className="awd-tools-grid">

            {tools.map((tool) => (

              <article
                className="awd-tool"
                key={tool.id}
              >

                <div>

                  <div className="awd-icon">
                    {tool.icon}
                  </div>

                  <h3>
                    {tool.title}
                  </h3>

                  <p>
                    {tool.text}
                  </p>

                </div>

                <button
                  className="awd-use"
                  type="button"
                  onClick={() => {
                    setTab(tool.id);

                    window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    });
                  }}
                >
                  {lang === "en"
                    ? "Use Tool"
                    : "استخدم الأداة"}
                </button>

              </article>

            ))}

          </div>

        </section>

        <section className="awd-sub">

          <div className="awd-sub-row">

            <div>

              <strong
                style={{
                  fontSize: 18,
                }}
              >
                {lang === "en"
                  ? "Subscription"
                  : "خطة الاشتراك"}
              </strong>

              <div
                className="mut"
                style={{
                  marginTop: 4,
                }}
              >
                {lang === "en"
                  ? "Your usage and plan will continue using the current system."
                  : "سيستمر نظام الاستخدام والاشتراك الحالي كما هو."}
              </div>

            </div>

            <button
              className="awd-upgrade"
              type="button"
              onClick={() =>
                (window.location.href =
                  "/upgrade")
              }
            >
              {lang === "en"
                ? "Upgrade ⚡"
                : "ترقية الخطة ⚡"}
            </button>

          </div>

          <div className="awd-progress">
            <span />
          </div>

        </section>

        <div className="awd-disclaimer">

          {lang === "en"
            ? "AllWDbook is an independent tool and is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc."
            : "AllWDbook أداة مستقلة وليست تابعة لشركة Amazon.com, Inc. أو معتمدة أو مدعومة من طرفها."}

        </div>

        {tab === 6 && (
          <CoverTool lang={lang} />
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
          <Formatter t={t} />
        )}

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
          error
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
        session.access_token
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

          body: JSON.stringify({
            toolId: "microNiche",
          }),
        }
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
          "/api/niches?cat=" +
          category +
          "&domain=" +
          domain +
          "&count=" +
          count +
          "&seed=" +
          seed
        );

      const data =
        await response.json();

      setRows(
        data.rows || []
      );

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

      const response =
        await fetch(
          "/api/niches?cat=" +
          category +
          "&domain=" +
          domain +
          "&count=" +
          count +
          "&seed=fixed&validate=1"
        );

      const data =
        await response.json();

      setRows(
        data.rows || []
      );

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
          (row) =>
            row.keyword
        )
        .join("\n")
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
            event.target.value
          )
        }
      >

        {Object.keys(
          NICHE_CATEGORIES
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
              event.target.value
            )
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

          )
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
                    (
                      row.demand
                        ? "b-" +
                          row.demand
                        : "b-none"
                    )
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
                      row.keyword
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
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function formatDescription(value) {

  return value
    .slice(0, 4000)
    .split("\n\n")
    .map(
      (paragraph) =>
        paragraph.trim()
    )
    .filter(Boolean)
    .map((paragraph) => {

      if (
        paragraph.startsWith("- ")
      ) {

        const list =
          paragraph
            .split("\n")
            .filter(Boolean)
            .map((line) => {

              const cleanLine =
                line.startsWith("- ")
                  ? line.slice(2)
                  : line;

              return (
                "<li>" +
                escapeHtml(
                  cleanLine
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
        paragraph.startsWith("# ")
      ) {

        return (
          "<h4>" +
          escapeHtml(
            paragraph.slice(2)
          ) +
          "</h4>"
        );
      }

      return (
        "<p>" +
        escapeHtml(
          paragraph
        ).replaceAll(
          "\n",
          "NLBR"
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
      html
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
            event.target.value
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

  const cost =
    printCost(
      pages,
      options
    );

  const rate =
    royaltyRate(
      price,
      domain
    );

  const royalty =
    royaltyPerUnit(
      price,
      pages,
      options
    );

  return (

    <div className="card">

      <div className="trustNote">

        <p>

          <b>
            {t.marketplace}:
          </b>{" "}

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
              event.target.value
            )
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
              event.target.value
            )
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
            event.target.value
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
              "large"
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
                    rate * 100
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
