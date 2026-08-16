"use client";

import { useEffect, useState } from "react";
import { T } from "../lib/i18n";
import { NICHE_CATEGORIES } from "../lib/niches";
import { printCost, royaltyPerUnit, royaltyRate, marketInfo } from "../lib/estimate";
import CoverTool from "./covertool";
import KeywordsPanel from "./keywordspanel";
import AccountMenu from "./accountmenu";
import UpgradePrompt, { shouldBlockRememberedLimit } from "./upgradeprompt";
import { getSupabase } from "../lib/supabase";

/* =========================================================
   الأسواق: نعرض اسم الدولة + العلم للمستخدم،
   ونُبقي الكود الداخلي للحسابات دون إظهار "amazon".
   ========================================================= */
const MARKETS = [
  { code: "amazon.com",    flag: "🇺", ar: "الولايات المتحدة", en: "United States", sym: "$" },
  { code: "amazon.co.uk",  flag: "🇬🇧", ar: "المملكة المتحدة",  en: "United Kingdom",  sym: "£" },
  { code: "amazon.de",     flag: "🇩🇪", ar: "ألمانيا",          en: "Germany",         sym: "€" },
  { code: "amazon.fr",     flag: "🇫🇷", ar: "فرنسا",            en: "France",          sym: "€" },
  { code: "amazon.it",     flag: "🇮🇹", ar: "إيطاليا",          en: "Italy",           sym: "€" },
  { code: "amazon.es",     flag: "🇸", ar: "إسبانيا",          en: "Spain",           sym: "€" },
  { code: "amazon.ca",     flag: "🇨🇦", ar: "كندا",             en: "Canada",          sym: "C$" },
];

/* =========================================================
   الأدوات الخمس — بنفس ألوان التصميم
   ========================================================= */
const TOOLS = [
  { id: 5, icon: "🧮", color: "#ff7a1a", ar: "حاسبة الأرباح",        en: "Royalty Calculator",   dar: "احسب أرباحك المتوقعة قبل النشر.",        den: "Estimate your expected book royalties.", isNew: false },
  { id: 6, icon: "📐", color: "#8b5cf6", ar: "مصمم أغلفة الكتب",     en: "Cover Designer",         dar: "صمم غلافًا احترافيًا جاهزًا في دقائق.",  den: "Design a professional cover in minutes.", isNew: true  },
  { id: 0, icon: "🔑", color: "#3b82f6", ar: "بحث الكلمات المفتاحية", en: "Keyword Research",       dar: "ابحث عن أفضل الكلمات لزيادة ظهور كتابك.", den: "Find the best keywords to boost visibility.", isNew: false },
  { id: 1, icon: "🎯", color: "#10b981", ar: "بحث النيش المصغر",     en: "Micro-Niche Research",   dar: "اكتشف نيشات مربحة ومتخصصة للمنافسة.",     den: "Discover profitable, focused niches.",     isNew: false },
  { id: 4, icon: "✍️", color: "#ec4899", ar: "منشئ وصف الكتاب",      en: "Book Description",       dar: "أنشئ وصفًا احترافيًا يجذب القراء ويزيد المبيعات.", den: "Create a persuasive description that sells.", isNew: false },
];

export default function Home() {
  const [lang, setLang] = useState("ar");
  const [tab, setTab] = useState(null);          // الأداة تظهر فقط بعد الضغط
  const [marketCode, setMarketCode] = useState("amazon.com");
  const [seedKw, setSeedKw] = useState("");
  const [slide, setSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* بيانات الاشتراك الحقيقية */
  const [usage, setUsage] = useState({ used: 0, limit: 50000, planNameAr: "الخطة المجانية", planNameEn: "Free Plan", endsAt: null });

  const t = T[lang];
  const isAr = lang === "ar";

  /* ---- اللغة ---- */
  useEffect(() => {
    const saved = localStorage.getItem("awd_lang");
    if (saved && T[saved]) setLang(saved);
    const sync = (e) => { const n = e?.detail || localStorage.getItem("awd_lang"); if (n && T[n]) setLang(n); };
    window.addEventListener("awd-language-change", sync);
    return () => window.removeEventListener("awd-language-change", sync);
  }, []);

  useEffect(() => {
    localStorage.setItem("awd_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
  }, [lang, isAr]);

  /* ---- جلب بيانات الاستخدام/الخطة ---- */
  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabase();
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          const { data } = await supabase.auth.signInAnonymously();
          session = data?.session || null;
        }
        if (!session?.access_token) return;
        const res = await fetch("/api/usage/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (res.ok) {
          const d = await res.json();
          setUsage((u) => ({ ...u, used: d.used ?? 0, limit: d.limit ?? 50000 }));
        }
      } catch {}
    })();
  }, []);

  /* ---- سلايدر الهيرو ---- */
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % 3), 5000);
    return () => clearInterval(id);
  }, []);

  const market = MARKETS.find((m) => m.code === marketCode);

  function openTool(id) {
    setTab(id);
    setTimeout(() => document.getElementById("awd-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  function sendToKeywords(keyword) { setSeedKw(keyword); openTool(0); }

  const HERO_SLIDES = [
    { ar: <>كل ما تحتاجه للنجاح في <span>KDP</span></>, en: <>Everything you need to succeed with <span>KDP</span></> },
    { ar: <>أدواتك الاحترافية للنشر الرقمي في <span>مكان واحد</span></>, en: <>Your professional digital publishing tools in <span>one place</span></> },
    { ar: <>ابحث، حلّل، صمّم وانشر <span>بثقة</span></>, en: <>Research, analyze, design and publish <span>with confidence</span></> },
  ];

  return (
    <div className="awd-v2">
      <style jsx>{`
        .awd-v2{background:#07101d;color:#eef4ff;min-height:100vh;padding-bottom:96px}
        .awd-shell{width:min(1180px,calc(100% - 28px));margin:0 auto}

        /* ===== الهيدر ===== */
        .awd-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;z-index:40;background:rgba(7,16,29,.94);backdrop-filter:blur(14px)}
        .awd-brand{display:flex;align-items:center;gap:11px;min-width:0}
        .awd-logo{width:46px;height:46px;object-fit:contain;border-radius:13px}
        .awd-brand h1{font-size:19px;margin:0;letter-spacing:.2px}
        .awd-brand p{margin:2px 0 0;color:#9aa9bf;font-size:11px}
        .awd-actions{display:flex;align-items:center;gap:6px}
        .awd-ibtn{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#101b2c;color:#fff;cursor:pointer;font-size:18px;position:relative}
        .awd-badge{position:absolute;top:-5px;right:-5px;background:#ff3b30;color:#fff;font-size:10px;font-weight:700;min-width:17px;height:17px;border-radius:99px;display:grid;place-items:center;padding:0 4px}

        /* ===== الدرج ===== */
        .awd-drawer-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:60;display:none}
        .awd-drawer-bg.open{display:block}
        .awd-drawer{position:fixed;top:0;bottom:0;width:280px;max-width:82vw;background:#0b1626;z-index:70;padding:22px 18px;transform:translateX(-100%);transition:transform .25s;border-inline-end:1px solid rgba(255,255,255,.08)}
        .awd-drawer.open{transform:translateX(0)}
        [dir=rtl] .awd-drawer{left:auto;right:0;transform:translateX(100%)}
        [dir=rtl] .awd-drawer.open{transform:translateX(0)}
        .awd-drawer a{display:block;padding:13px 12px;border-radius:11px;color:#dbe6f5;text-decoration:none;font-size:15px;margin-bottom:4px}
        .awd-drawer a:hover{background:rgba(255,255,255,.06)}

        /* ===== الهيرو ===== */
        .awd-hero{margin-top:14px;border:1px solid rgba(255,255,255,.10);border-radius:24px;padding:26px;display:grid;grid-template-columns:1.2fr .8fr;gap:20px;align-items:center;background:radial-gradient(circle at 85% 20%,rgba(255,100,0,.18),transparent 35%),linear-gradient(135deg,#0a1728,#101b32 60%,#111c2d);overflow:hidden}
        .awd-hero h2{font-size:clamp(28px,4.4vw,46px);line-height:1.12;margin:0 0 12px}
        .awd-hero h2 span{color:#ff6a00}
        .awd-hero p{color:#aebbd0;font-size:15px;line-height:1.8;max-width:560px}
        .awd-hero-art{display:grid;place-items:center}
        .awd-hero-art img{width:100%;max-width:300px;object-fit:contain;filter:drop-shadow(0 18px 40px rgba(255,106,0,.25))}
        .awd-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
        .awd-cta button{cursor:pointer;border-radius:12px;padding:12px 20px;border:1px solid rgba(255,255,255,.14);font-weight:700;font-size:14px}
        .awd-primary{background:#ff6a00;color:#fff;border-color:#ff6a00!important}
        .awd-secondary{background:#0c1625;color:#fff}
        .awd-features{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:16px}
        .awd-feature{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);padding:11px 8px;border-radius:13px;text-align:center;color:#dce6f5;font-size:12px}
        .awd-dots{display:flex;gap:7px;justify-content:center;margin-top:16px}
        .awd-dot{width:22px;height:6px;border-radius:99px;background:rgba(255,255,255,.18);border:0;cursor:pointer}
        .awd-dot.on{background:#ff6a00;width:30px}

        /* ===== رأس قسم الأدوات ===== */
        .awd-tools-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:30px 0 14px}
        .awd-tools-head h2{margin:0;font-size:23px}
        .awd-tools-head p{margin:6px 0 0;color:#9aa9bf;font-size:13px}
        .awd-viewall{color:#ff6a00;text-decoration:none;font-weight:700;font-size:14px;white-space:nowrap}

        /* ===== شبكة الأدوات ===== */
        .awd-tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
        .awd-tool{position:relative;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:linear-gradient(145deg,#0d192a,#0a1422);padding:18px;min-height:188px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 30px rgba(0,0,0,.12)}
        .awd-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:13px;font-size:22px;color:#fff}
        .awd-new{position:absolute;top:14px;inset-inline-end:14px;background:#8b5cf6;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px}
        .awd-tool h3{margin:13px 0 6px;font-size:16px}
        .awd-tool p{margin:0;color:#93a2b7;font-size:13px;line-height:1.6}
        .awd-use{margin-top:14px;width:100%;border:1px solid rgba(255,255,255,.12);background:#101d2e;color:#fff;border-radius:10px;padding:10px;cursor:pointer;font-weight:600}
        .awd-use:hover{border-color:#ff6a00}

        /* ===== بطاقة الاشتراك ===== */
        .awd-sub{margin-top:22px;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:20px;background:linear-gradient(100deg,#0d1829,#121d2d);display:flex;align-items:center;gap:18px}
        .awd-crown{width:58px;height:58px;border-radius:16px;background:rgba(255,170,0,.12);display:grid;place-items:center;font-size:28px;flex-shrink:0}
        .awd-sub-body{flex:1;min-width:0}
        .awd-sub-top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}
        .awd-sub-body strong{font-size:17px}
        .awd-sub-body .mut{color:#9aa9bf;font-size:12px;margin-top:3px}
        .awd-progress{height:8px;background:#1d293a;border-radius:99px;overflow:hidden;margin:11px 0 6px}
        .awd-progress span{display:block;height:100%;background:linear-gradient(90deg,#ff6a00,#ff9a3d);border-radius:99px}
        .awd-sub-foot{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#9aa9bf}
        .awd-upgrade{border:0;background:#ff6a00;color:#fff;border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer;white-space:nowrap}

        .awd-disclaimer{margin-top:18px;text-align:center;color:#74849b;font-size:11px;line-height:1.7}

        /* ===== الشريط السفلي ===== */
        .awd-tabbar{position:fixed;bottom:0;left:0;right:0;z-index:50;background:rgba(8,17,30,.97);backdrop-filter:blur(14px);border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-around;padding:8px 4px calc(8px + env(safe-area-inset-bottom))}
        .awd-tab{flex:1;background:none;border:0;color:#7f8da2;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:11px;padding:6px 2px;border-radius:12px;text-decoration:none}
        .awd-tab .ic{font-size:20px}
        .awd-tab.active{color:#ff6a00}
        .awd-tab.active .ic{background:rgba(255,106,0,.16);width:46px;height:30px;border-radius:14px;display:grid;place-items:center}

        /* ===== مساحة العمل ===== */
        .awd-workspace{margin-top:24px;scroll-margin-top:90px}

        /* ===== التجاوب ===== */
        @media(max-width:820px){
          .awd-shell{width:min(100% - 18px,620px)}
          .awd-hero{grid-template-columns:1fr;text-align:center;padding:22px}
          .awd-hero p{margin-left:auto;margin-right:auto}
          .awd-hero-art{order:-1}
          .awd-hero-art img{max-width:200px}
          .awd-cta{justify-content:center}
          .awd-cta button{flex:1;min-width:130px}
          .awd-tools-head{flex-direction:column;align-items:flex-start}
          .awd-tools-grid{grid-template-columns:1fr 1fr;gap:11px}
          .awd-tool{min-height:178px;padding:15px}
          .awd-sub{flex-direction:column;align-items:stretch;text-align:center}
          .awd-sub-top{justify-content:center}
          .awd-crown{margin:0 auto}
        }
        @media(max-width:420px){
          .awd-tools-grid{grid-template-columns:1fr 1fr}
          .awd-feature{font-size:10px;padding:9px 4px}
          .awd-brand p{display:none}
        }
      `}</style>

      {/* ===== الدرج الجانبي ===== */}
      <div className={"awd-drawer-bg" + (drawerOpen ? " open" : "")} onClick={() => setDrawerOpen(false)} />
      <nav className={"awd-drawer" + (drawerOpen ? " open" : "")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <img src="/logov3.png" alt="AllWDbook" className="awd-logo" />
          <strong>AllWDbook</strong>
        </div>
        <a href="/tools" onClick={() => setDrawerOpen(false)}>🧰 {isAr ? "كل الأدوات" : "All Tools"}</a>
        <a href="/subscription" onClick={() => setDrawerOpen(false)}>👑 {isAr ? "الاشتراك" : "Subscription"}</a>
        <a href="/blog" onClick={() => setDrawerOpen(false)}>📰 {isAr ? "المدونة" : "Blog"}</a>
        <a href="/about" onClick={() => setDrawerOpen(false)}>ℹ️ {isAr ? "حول" : "About"}</a>
        <a href="/privacy" onClick={() => setDrawerOpen(false)}>🔒 {isAr ? "الخصوصية" : "Privacy"}</a>
        <a href="/terms" onClick={() => setDrawerOpen(false)}>📄 {isAr ? "الشروط" : "Terms"}</a>
        <a href="/refund" onClick={() => setDrawerOpen(false)}>↩️ {isAr ? "الاسترداد" : "Refund"}</a>
      </nav>

      <div className="awd-shell">

        {/* ===== الهيدر ===== */}
        <header className="awd-header">
          <button className="awd-ibtn" type="button" aria-label="menu" onClick={() => setDrawerOpen(true)}>☰</button>
          <div className="awd-brand">
            <img src="/logov3.png" alt="AllWDbook" className="awd-logo" />
            <div>
              <h1>AllWDbook</h1>
              <p>KDP Tools &amp; Digital Publishing</p>
            </div>
          </div>
          <div className="awd-actions">
            <button className="awd-ibtn" type="button" aria-label="language"
              onClick={() => setLang(isAr ? "en" : "ar")} title={isAr ? "English" : "العربية"}>🌐</button>
            <button className="awd-ibtn" type="button" aria-label="notifications">
              🔔<span className="awd-badge">3</span>
            </button>
            <AccountMenu />
          </div>
        </header>

        {/* ===== اختيار السوق (أسماء دول، بدون amazon) ===== */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0" }}>
          <label className="mut" htmlFor="mkt" style={{ color: "#9aa9bf", fontSize: 13 }}>
            {isAr ? "السوق" : "Marketplace"}
          </label>
          <select id="mkt" value={marketCode} onChange={(e) => setMarketCode(e.target.value)}
            style={{ flex: 1, maxWidth: 260, background: "#101b2c", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "10px 12px" }}>
            {MARKETS.map((m) => (
              <option key={m.code} value={m.code}>{m.flag} {isAr ? m.ar : m.en}</option>
            ))}
          </select>
        </div>

        {/* ===== الهيرو ===== */}
        <section className="awd-hero">
          <div>
            <h2>{isAr ? HERO_SLIDES[slide].ar : HERO_SLIDES[slide].en}</h2>
            <p>
              {isAr
                ? "مجموعة متكاملة من الأدوات الاحترافية للبحث، التحليل، التصميم والنشر الرقمي في مكان واحد."
                : "A complete set of professional tools for research, analysis, design and digital publishing — in one place."}
            </p>
            <div className="awd-cta">
              <button className="awd-primary" type="button" onClick={() => openTool(1)}>
                {isAr ? "ابدأ مجانًا 🚀" : "Start Free 🚀"}
              </button>
              <button className="awd-secondary" type="button"
                onClick={() => document.getElementById("awd-tools")?.scrollIntoView({ behavior: "smooth" })}>
                {isAr ? "استكشف الأدوات ▦" : "Explore Tools ▦"}
              </button>
            </div>
            <div className="awd-features">
              <div className="awd-feature">✅ {isAr ? "أدوات احترافية متكاملة" : "Complete pro tools"}</div>
              <div className="awd-feature">⚡ {isAr ? "نتائج دقيقة وسريعة" : "Fast, accurate results"}</div>
              <div className="awd-feature">🛡️ {isAr ? "بدون بطاقة ائتمان" : "No credit card"}</div>
            </div>
            <div className="awd-dots">
              {[0, 1, 2].map((i) => (
                <button key={i} className={"awd-dot" + (slide === i ? " on" : "")} onClick={() => setSlide(i)} aria-label={"slide " + (i + 1)} />
              ))}
            </div>
          </div>
          <div className="awd-hero-art">
            <img src="/logov3.png" alt="AllWDbook" />
          </div>
        </section>

        {/* ===== الأدوات الخمس ===== */}
        <section id="awd-tools">
          <div className="awd-tools-head">
            <div>
              <h2>{isAr ? "أدوات KDP الاحترافية" : "Professional KDP Tools"}</h2>
              <p>{isAr ? "اختر الأداة التي تحتاجها وابدأ رحلتك نحو النجاح." : "Pick the tool you need and start your journey to success."}</p>
            </div>
            <a href="/tools" className="awd-viewall">{isAr ? "عرض الكل ‹" : "View all ›"}</a>
          </div>

          <div className="awd-tools-grid">
            {TOOLS.map((tool) => (
              <article className="awd-tool" key={tool.id}>
                {tool.isNew && <span className="awd-new">{isAr ? "جديد" : "New"}</span>}
                <div>
                  <div className="awd-icon" style={{ background: tool.color }}>{tool.icon}</div>
                  <h3>{isAr ? tool.ar : tool.en}</h3>
                  <p>{isAr ? tool.dar : tool.den}</p>
                </div>
                <button className="awd-use" type="button" onClick={() => openTool(tool.id)}>
                  {isAr ? "استخدم الأداة" : "Use Tool"}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ===== بطاقة الاشتراك (بيانات حقيقية) ===== */}
        <section className="awd-sub">
          <div className="awd-crown">👑</div>
          <div className="awd-sub-body">
            <div className="awd-sub-top">
              <div>
                <strong>{isAr ? usage.planNameAr : usage.planNameEn}</strong>
                <div className="mut">
                  {usage.endsAt
                    ? (isAr ? "تنتهي في " : "Ends on ") + new Date(usage.endsAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })
                    : (isAr ? "خطة مجانية — بلا انتهاء" : "Free plan — no expiry")}
                </div>
              </div>
              <button className="awd-upgrade" type="button" onClick={() => (window.location.href = "/subscription")}>
                {isAr ? "ترقية الخطة ⚡" : "Upgrade ⚡"}
              </button>
            </div>
            <div className="awd-progress">
              <span style={{ width: Math.min(100, (usage.used / usage.limit) * 100) + "%" }} />
            </div>
            <div className="awd-sub-foot">
              <span>{usage.used.toLocaleString()} / {usage.limit.toLocaleString()}</span>
              <span>{isAr ? "استخدام هذا الشهر" : "uses this month"}</span>
            </div>
          </div>
        </section>

        <div className="awd-disclaimer">
          {isAr
            ? "AllWDbook أداة مستقلة غير تابعة لأي منصة أو شركة نشر."
            : "AllWDbook is an independent tool and is not affiliated with any publishing platform or company."}
        </div>

        {/* ===== مساحة عمل الأداة (تظهر بعد الاختيار) ===== */}
        {tab !== null && (
          <div id="awd-workspace" className="awd-workspace">
            {tab === 6 && <CoverTool lang={lang} />}
            {tab === 1 && <Niches t={t} lang={lang} domain={marketCode} onAnalyze={sendToKeywords} />}
            {tab === 0 && <KeywordsPanel t={t} domain={marketCode} seed={seedKw} />}
            {tab === 5 && <Calc t={t} domain={marketCode} market={market} />}
            {tab === 4 && <Formatter t={t} />}
          </div>
        )}
      </div>

      {/* ===== الشريط السفلي ===== */}
      <nav className="awd-tabbar">
        <a href="/tools" className="awd-tab"><span className="ic">🧰</span>{isAr ? "الأدوات" : "Tools"}</a>
        <a href="/" className="awd-tab active"><span className="ic">🏠</span>{isAr ? "الرئيسية" : "Home"}</a>
        <a href="/subscription" className="awd-tab"><span className="ic">👑</span>{isAr ? "الاشتراك" : "Plan"}</a>
        <a href="/blog" className="awd-tab"><span className="ic">📰</span>{isAr ? "المدونة" : "Blog"}</a>
      </nav>
    </div>
  );
}

/* =========================================================
   MICRO NICHE — محفوظ كما هو
   ========================================================= */
function Niches({ t, lang, domain, onAnalyze }) {
  const [category, setCategory] = useState("coloring");
  const [count, setCount] = useState(24);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function canUseMicroNiche() {
    const supabase = getSupabase();
    let { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) { console.error("Anonymous sign-in failed:", error); return false; }
      session = data?.session || null;
    }
    if (!session?.access_token) return false;
    const blocked = await shouldBlockRememberedLimit("microNiche", session.access_token);
    if (blocked) { setUpgradeOpen(true); return false; }
    const response = await fetch("/api/usage/consume", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ toolId: "microNiche" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok && data?.error === "DAILY_LIMIT_REACHED") { setUpgradeOpen(true); return false; }
    return response.ok;
  }

  async function load() {
    setBusy(true);
    const seed = String(Date.now());
    try {
      const allowed = await canUseMicroNiche();
      if (!allowed) return;
      const response = await fetch(`/api/niches?cat=${category}&domain=${domain}&count=${count}&seed=${seed}`);
      const data = await response.json();
      setRows(data.rows || []);
    } catch { setRows([]); } finally { setBusy(false); }
  }

  async function validateCurrent() {
    setBusy(true);
    try {
      const allowed = await canUseMicroNiche();
      if (!allowed) return;
      const response = await fetch(`/api/niches?cat=${category}&domain=${domain}&count=${count}&seed=fixed&validate=1`);
      const data = await response.json();
      setRows(data.rows || []);
    } catch { setRows([]); } finally { setBusy(false); }
  }

  function copyAll() {
    navigator.clipboard.writeText(rows.map((r) => r.keyword).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const categoryLabel = (k) => (lang === "ar" ? NICHE_CATEGORIES[k].ar : NICHE_CATEGORIES[k].en);

  return (
    <div className="card">
      <div className="trustNote"><p>{t.nicheNote}</p></div>
      <label className="mut">{t.nicheCat}</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {Object.keys(NICHE_CATEGORIES).map((k) => <option key={k} value={k}>{categoryLabel(k)}</option>)}
      </select>
      <label className="mut">{t.nicheCount}</label>
      <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
        {[12, 24, 40, 60].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <button className="go" onClick={load} disabled={busy}>{busy ? t.working : rows.length ? t.nicheMore : t.nicheGen}</button>
      {rows.length > 0 && (
        <>
          <div className="actionRow">
            <button className="mini" onClick={validateCurrent} disabled={busy}>{t.nicheValidate}</button>
            <button className="mini" onClick={copyAll}>{copied ? t.copied : t.copy}</button>
          </div>
          {rows.map((row) => (
            <div key={row.keyword} className="nrow">
              <span className="nicheText">{row.keyword}{row.longTail && <small className="mut"> · {t.longTail}</small>}</span>
              <span className="nicheActions">
                <span className={"badge " + (row.demand ? "b-" + row.demand : "b-none")}>{row.demand ? t[row.demand] || row.demand : t.untested}</span>
                <button className="mini" onClick={() => onAnalyze(row.keyword)}>{t.analyzeThis}</button>
              </span>
            </div>
          ))}
        </>
      )}
      <UpgradePrompt open={upgradeOpen} toolId="microNiche" onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}

/* =========================================================
   FORMATTER — محفوظ كما هو
   ========================================================= */
function escapeHtml(v) {
  return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function formatDescription(v) {
  return v.slice(0, 4000).split("\n\n").map((p) => p.trim()).filter(Boolean).map((p) => {
    if (p.startsWith("- ")) {
      const list = p.split("\n").filter(Boolean).map((l) => "<li>" + escapeHtml(l.startsWith("- ") ? l.slice(2) : l) + "</li>").join("");
      return "<ul>" + list + "</ul>";
    }
    if (p.startsWith("# ")) return "<h4>" + escapeHtml(p.slice(2)) + "</h4>";
    return "<p>" + escapeHtml(p).replaceAll("\n", "<br/>") + "</p>";
  }).join("");
}
function Formatter({ t }) {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const html = formatDescription(value);
  async function copyHtml() { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  return (
    <div className="card">
      <p className="mut">{t.fmtNote}</p>
      <textarea rows={8} maxLength={4000} value={value} onChange={(e) => setValue(e.target.value)} />
      <h3>{t.preview}</h3>
      <div className="prev" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="formatterHead"><h3>{t.htmlCode}</h3><button className="mini" onClick={copyHtml}>{copied ? t.copied : t.copyHtml}</button></div>
      <textarea rows={5} readOnly value={html} />
      <p className="mut">{t.chars}: {value.length}/4000</p>
    </div>
  );
}

/* =========================================================
   ROYALTY CALCULATOR — محفوظ كما هو (+ عرض اسم السوق)
   ========================================================= */
function Calc({ t, domain, market }) {
  const [price, setPrice] = useState(12.99);
  const [pages, setPages] = useState(120);
  const [ink, setInk] = useState("black");
  const [large, setLarge] = useState(false);
  const mInfo = marketInfo(domain);
  const options = { domain, ink, large };
  const cost = printCost(pages, options);
  const rate = royaltyRate(price, domain);
  const royalty = royaltyPerUnit(price, pages, options);
  const sym = market?.sym || mInfo.symbol;
  const label = market ? `${market.flag} ${document.documentElement.lang === "ar" ? market.ar : market.en}` : domain;

  return (
    <div className="card">
      <div className="trustNote">
        <p><b>{t.marketplace}:</b> {label} · {mInfo.currency}</p>
        <small>{t.calcNote}</small>
      </div>
      <label className="mut">{t.price}</label>
      <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <label className="mut">{t.pages}</label>
      <input type="number" min="24" max="828" value={pages} onChange={(e) => setPages(Number(e.target.value))} />
      <label className="mut">{t.printType}</label>
      <select value={ink} onChange={(e) => setInk(e.target.value)}>
        <option value="black">{t.blackInk}</option>
        <option value="premium">{t.premiumColor}</option>
        <option value="standard">{t.standardColor}</option>
      </select>
      <label className="mut">{t.trimClass}</label>
      <select value={large ? "large" : "regular"} onChange={(e) => setLarge(e.target.value === "large")}>
        <option value="regular">{t.regularTrim}</option>
        <option value="large">{t.largeTrim}</option>
      </select>
      {cost === null ? (
        <div className="trustNote warnNote"><p>⚠️ {t.invalidPrint}</p></div>
      ) : (
        <div className="grid resultSection">
          <div className="kpi"><b>{sym}{cost.toFixed(2)}</b><span>{t.printCost}</span></div>
          <div className="kpi"><b>{rate ? Math.round(rate * 100) + "%" : "—"}</b><span>{t.royaltyRate}</span></div>
          <div className="kpi fullKpi"><b>{royalty === null ? "—" : sym + royalty.toFixed(2)}</b><span>{t.royaltyUnit}</span></div>
        </div>
      )}
      <p className="mut disclaimer">⚖️ {t.notAdvice}</p>
    </div>
  );
}
