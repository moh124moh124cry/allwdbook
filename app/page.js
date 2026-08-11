"use client";
import { useEffect, useState } from "react";
import { T } from "../lib/i18n";
import { NICHE_CATEGORIES } from "../lib/niches";
import { printCost } from "../lib/estimate";
import CoverTool from "./covertool";

const DOMAINS = ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.fr", "amazon.it", "amazon.es", "amazon.ca"];

const ORDER = [6, 1, 0, 5, 4];

const ICONS = ["🔑", "🎯", "📚", "📈", "✍️", "🧮"];

function tabLabel(t, lang, i) {
  if (i === 6) return "📐 " + (lang === "en" ? "Cover Designer" : "مصمم الغلاف");
  return ICONS[i] + " " + t.tabs[i];
}

function errText(t, d) {
  if (!d) return t.errGeneric;
  const code = String(d.error || "");
  const detail = String(d.detail || "");
  if (code === "NO_API_KEY") return t.errNoKey;
  if (code === "SEARCH_FAILED" && detail.indexOf("402") >= 0) return t.errNoCredit;
  if (code === "SEARCH_FAILED") return t.errSearch;
  if (code === "MISSING_QUERY") return t.errMissing;
  if (code === "NETWORK") return t.errNetwork;
  if (code === "NO_AI_KEY") return t.errAiKey;
  if (code === "NO_GEMINI_KEY") return t.errAiKey;
  if (code === "AI_FAILED") return t.errAiBusy;
  return t.errGeneric;
}

export default function Home() {
  const [lang, setLang] = useState("ar");
  const [tab, setTab] = useState(6);
  const [domain, setDomain] = useState("amazon.com");
  const [seedKw, setSeedKw] = useState("");
  const t = T[lang];

  useEffect(() => {
    const s = localStorage.getItem("awd_lang");
    if (s && T[s]) setLang(s);
  }, []);

  useEffect(() => {
    localStorage.setItem("awd_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  function sendToKeywords(kw) {
    setSeedKw(kw);
    setTab(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="wrap">
      <header>
        <img src="/logo-v2.png" alt="All World Digital" className="logo" />
        <div className="brandbox">
          <h1>AllWDbook<span className="tm">™</span></h1>
          <span className="mut">{t.tagline}</span>
        </div>
        <button className="lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          {lang === "ar" ? "EN" : "عر"}
        </button>
      </header>

      <select value={domain} onChange={e => setDomain(e.target.value)}>
        {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <div className="tabs">
        {ORDER.map(i => (
          <button key={i} className={"tab" + (i === tab ? " on" : "")} onClick={() => setTab(i)}>
            {tabLabel(t, lang, i)}
          </button>
        ))}
      </div>

      {tab === 6 && <CoverTool lang={lang} />}
      {tab === 1 && <Niches t={t} lang={lang} domain={domain} onAnalyze={sendToKeywords} />}
      {tab === 0 && <Keywords t={t} domain={domain} seed={seedKw} />}
      {tab === 5 && <Calc t={t} />}
      {tab === 4 && <Formatter t={t} />}

      <footer className="foot">
        <img src="/logo-v2.png" alt="" />
        <span>{t.by} <b>All World Digital</b> © {new Date().getFullYear()} · {t.rights}</span>
      </footer>
    </div>
  );
}

function Keywords({ t, domain, seed }) {
  const [q, setQ] = useState("");
  const [d, setD] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (seed) {
      setQ(seed);
      run(seed);
    }
  }, [seed]);

  async function run(term) {
    const k = term || q;
    if (!k) return;
    setBusy(true);
    try {
      const r = await fetch("/api/keywords?q=" + encodeURIComponent(k) + "&domain=" + domain);
      setD(await r.json());
    } catch (e) {
      setD({ error: "NETWORK" });
    }
    setBusy(false);
  }

  async function askAi() {
    if (!q) return;
    setAiBusy(true);
    try {
      const r = await fetch("/api/ai?q=" + encodeURIComponent(q) + "&limit=15");
      setAi(await r.json());
    } catch (e) {
      setAi({ error: "NETWORK", rows: [] });
    }
    setAiBusy(false);
  }

  function copyAi() {
    const list = (ai && Array.isArray(ai.rows)) ? ai.rows : [];
    navigator.clipboard.writeText(list.map(x => x.keyword).join("\n"));
  }

  const conf = d && d.confidence ? d.confidence : null;
  const measured = conf ? (conf.bsrSampleSize ?? conf.measuredBooks ?? 0) : 0;
  const total = conf ? (conf.totalResults ?? conf.totalBooks ?? 0) : 0;
  const m = (d && d.metrics) ? d.metrics : null;
  const suggestions = (d && Array.isArray(d.suggestions)) ? d.suggestions : [];
  const books = (d && Array.isArray(d.books)) ? d.books : [];
  const aiRows = (ai && Array.isArray(ai.rows)) ? ai.rows : [];

  const num = v => (typeof v === "number" ? v.toLocaleString() : "—");

  return (
    <div className="card">
      <input placeholder={t.kwPlaceholder} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} />

      <button className="go" onClick={() => run()}>{busy ? t.analyzing : t.analyze}</button>

      <button className="mini" style={{ marginTop: 8, width: "100%" }} onClick={askAi}>
        🤖 {aiBusy ? t.aiWorking : t.aiBtn}
      </button>

      {ai && (
        <div style={{ marginTop: 12 }}>
          {ai.error && <p className="mut">⏳ {errText(t, ai)}</p>}
          {aiRows.length > 0 && (
            <>
              <h3>🤖 {t.aiTitle}</h3>

              <div style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "10px", background: "rgba(245,158,11,0.08)" }}>
                <p style={{ margin: 0, fontSize: "13px" }}>{t.aiNote}</p>
                <p style={{ margin: "6px 0 0", fontSize: "13px" }}>{t.aiVerify}</p>
                <p className="mut" style={{ margin: "6px 0 0", fontSize: "11px" }}>{t.aiProvider}</p>
              </div>

              <div style={{ marginTop: 10 }}>
                {aiRows.map(x => (
                  <span key={x.keyword} className="chip" onClick={() => { setQ(x.keyword); run(x.keyword); }}>
                    🤖 {x.keyword}
                  </span>
                ))}
              </div>

              <button className="mini" style={{ marginTop: 8 }} onClick={copyAi}>{t.copy}</button>
            </>
          )}
        </div>
      )}

      {d && (
        <>
          {d.error && (
            <div style={{ marginTop: 12, padding: "12px", border: "1px solid var(--line)", borderRadius: "10px" }}>
              <p className="mut" style={{ margin: 0 }}>⏳ {errText(t, d)}</p>
              <p className="mut" style={{ margin: "6px 0 0", fontSize: "12px" }}>{t.tryNiches}</p>
            </div>
          )}

          {conf && (
            <div className={"badge b-" + (conf.level === "high" ? "high" : conf.level === "medium" ? "medium" : conf.level === "low" ? "low" : "none")}>
              {t.confidence}: {conf.level ? (t[conf.level] || conf.level) : "—"} · {t.measuredOf} {measured} {t.ofBooks} {total} {t.booksWord}
            </div>
          )}

          {m && (
            <>
              <div className="grid" style={{ marginTop: 12 }}>
                <div className="kpi"><b>{m.score ?? "—"}/100</b><span>{t.score}</span></div>
                <div className="kpi"><b>{num(m.avgBsr)}</b><span>{t.avgBsr} ({t.sample} {measured})</span></div>
                <div className="kpi"><b>{m.avgDailySales ?? "—"}</b><span>{t.dailySales}</span></div>
                <div className="kpi"><b>{typeof m.avgPrice === "number" ? "$" + m.avgPrice : "—"}</b><span>{t.avgPrice}</span></div>
                <div className="kpi"><b>{typeof m.nicheMonthlyRoyalty === "number" ? "$" + num(m.nicheMonthlyRoyalty) : "—"}</b><span>{t.nicheMonthly}</span></div>
                <div className="kpi"><b>{m.avgReviews ?? "—"}</b><span>{t.avgReviews}</span></div>
              </div>

              <p className="mut" style={{ fontSize: "12px", marginTop: "10px" }}>
                🟢 ⚪ 🤖 — {t.legend}
              </p>

              <p className="mut" style={{ fontSize: "11px", marginTop: "6px" }}>⚖️ {t.notAdvice}</p>
            </>
          )}

          {suggestions.length > 0 && (
            <>
              <h3>✅ {t.suggested}</h3>
              <div>{suggestions.map(s => <span key={s} className="chip" onClick={() => { setQ(s); run(s); }}>{s}</span>)}</div>
            </>
          )}

          {books.length > 0 && (
            <>
              <h3>{t.topResults}</h3>
              {books.map(b => (
                <div key={b.asin} className="row">
                  <span>{b.title}</span>
                  <span className="mut">
                    {b.price !== null && b.price !== undefined ? "$" + b.price : "—"} · BSR {num(b.bsr)}{b.source === "live" ? " 🟢" : " ⚪"} · ⭐{b.rating ?? "—"} ({b.reviews ?? "—"})
                  </span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Niches({ t, lang, domain, onAnalyze }) {
  const [cat, setCat] = useState("coloring");
  const [count, setCount] = useState(24);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setBusy(true);
    const seed = String(Date.now());
    try {
      const r = await fetch("/api/niches?cat=" + cat + "&domain=" + domain + "&count=" + count + "&seed=" + seed);
      const j = await r.json();
      setRows(j.rows || []);
    } catch (e) {
      setRows([]);
    }
    setBusy(false);
  }

  async function validateCurrent() {
    setBusy(true);
    try {
      const r = await fetch("/api/niches?cat=" + cat + "&domain=" + domain + "&count=" + count + "&seed=fixed&validate=1");
      const j = await r.json();
      setRows(j.rows || []);
    } catch (e) {}
    setBusy(false);
  }

  function copyAll() {
    navigator.clipboard.writeText(rows.map(r => r.keyword).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const label = k => (lang === "ar" ? NICHE_CATEGORIES[k].ar : NICHE_CATEGORIES[k].en);

  return (
    <div className="card">
      <p className="mut">{t.nicheNote}</p>
      <label className="mut">{t.nicheCat}</label>
      <select value={cat} onChange={e => setCat(e.target.value)}>
        {Object.keys(NICHE_CATEGORIES).map(k => <option key={k} value={k}>{label(k)}</option>)}
      </select>
      <label className="mut">{t.nicheCount}</label>
      <select value={count} onChange={e => setCount(Number(e.target.value))}>
        {[12, 24, 40, 60].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button className="go" onClick={load}>
        {busy ? t.working : (rows.length ? t.nicheMore : t.nicheGen)}
      </button>

      {rows.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="mini" onClick={validateCurrent}>{t.nicheValidate}</button>
            <button className="mini" onClick={copyAll}>{copied ? t.copied : t.copy}</button>
          </div>
          {rows.map(n => (
            <div key={n.keyword} className="nrow">
              <span>
                {n.keyword}
                {n.longTail && <span className="mut"> · {t.longTail}</span>}
              </span>
              <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className={"badge " + (n.demand ? "b-" + n.demand : "b-none")}>
                  {n.demand ? (t[n.demand] || n.demand) : t.untested}
                </span>
                <button className="mini" onClick={() => onAnalyze(n.keyword)}>{t.analyzeThis}</button>
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function Formatter({ t }) {
  const [x, setX] = useState("");
  const html = x
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => p.startsWith("- ") ? "<ul>" + p.split("\n").map(l => "<li>" + l.slice(2) + "</li>").join("") + "</ul>" : p.startsWith("# ") ? "<h4>" + p.slice(2) + "</h4>" : "<p>" + p + "</p>")
    .join("");

  return (
    <div className="card">
      <p className="mut">{t.fmtNote}</p>
      <textarea rows={8} value={x} onChange={e => setX(e.target.value)} />
      <h3>{t.preview}</h3>
      <div className="prev" dangerouslySetInnerHTML={{ __html: html }} />
      <h3>{t.htmlCode}</h3>
      <textarea rows={5} readOnly value={html} />
      <p className="mut">{t.chars}: {x.length}/4000</p>
    </div>
  );
}

function Calc({ t }) {
  const [p, setP] = useState(12.99);
  const [pg, setPg] = useState(120);
  const [color, setColor] = useState(false);

  const cost = printCost(pg, color);
  const roy = Math.max(0, p * 0.6 - cost);

  return (
    <div className="card">
      <label className="mut">{t.price}</label>
      <input type="number" value={p} onChange={e => setP(+e.target.value)} />
      <label className="mut">{t.pages}</label>
      <input type="number" value={pg} onChange={e => setPg(+e.target.value)} />
      <label className="mut">
        <input type="checkbox" checked={color} onChange={e => setColor(e.target.checked)} style={{ width: "auto", margin: "0 8px" }} />
        {t.colorPrint}
      </label>
      <div className="grid" style={{ marginTop: "12px" }}>
        <div className="kpi"><b>${cost.toFixed(2)}</b><span>{t.printCost}</span></div>
        <div className="kpi"><b>${roy.toFixed(2)}</b><span>{t.royaltyUnit}</span></div>
      </div>
      <p className="mut" style={{ fontSize: "12px", marginTop: "10px" }}>{t.calcNote}</p>
      <p className="mut" style={{ fontSize: "11px", marginTop: "6px" }}>⚖️ {t.notAdvice}</p>
    </div>
  );
}
