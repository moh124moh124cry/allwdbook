"use client";
import { useEffect, useState } from "react";
import { T } from "../lib/i18n";
import { NICHE_CATEGORIES } from "../lib/niches";
import { printCost, royaltyPerUnit, royaltyRate, marketInfo } from "../lib/estimate";
import CoverTool from "./covertool";
import KeywordsPanel from "./keywordspanel";

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
  if (code === "RATE_LIMITED") return t.errRate;
  if (code === "NO_API_KEY") return t.errNoKey;
  if (code === "SEARCH_FAILED" && detail.indexOf("402") >= 0) return t.errNoCredit;
  if (code === "SEARCH_FAILED") return t.errSearch;
  if (code === "MISSING_QUERY") return t.errMissing;
  if (code === "NETWORK") return t.errNetwork;
  if (code === "NO_AI_KEY" || code === "NO_GEMINI_KEY") return t.errAiKey;
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
        <img src="/logov3.png" alt="All World Digital" className="logo" />
        <div className="brandbox">
          <h1>AllWDbook<span className="tm">™</span></h1>
          <span className="mut">{t.tagline}</span>
        </div>
        <button className="lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          {lang === "ar" ? "EN" : "عر"}
        </button>
      </header>

      <label className="mut">{t.marketplace}</label>
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
      {tab === 0 && <KeywordsPanel t={t} domain={domain} seed={seedKw} />}
      {tab === 5 && <Calc t={t} domain={domain} />}
      {tab === 4 && <Formatter t={t} />}

      <footer className="foot">
        <img src="/logov3.png" alt="" />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  async function run(term) {
    const k = (term || q).trim();
    if (!k) return;
    setBusy(true);
    try {
      const r = await fetch("/api/keywords?q=" + encodeURIComponent(k) + "&domain=" + encodeURIComponent(domain));
      setD(await r.json());
    } catch (e) {
      setD({ error: "NETWORK" });
    }
    setBusy(false);
  }

  async function askAi() {
    if (!q.trim()) return;
    setAiBusy(true);
    try {
      const r = await fetch("/api/ai?q=" + encodeURIComponent(q.trim()) + "&limit=15");
      setAi(await r.json());
    } catch (e) {
      setAi({ error: "NETWORK", rows: [] });
    }
    setAiBusy(false);
  }

  function copyAi() {
    const list = ai && Array.isArray(ai.rows) ? ai.rows : [];
    navigator.clipboard.writeText(list.map(x => x.keyword).join("\n"));
  }

  const conf = d?.confidence || null;
  const measured = conf ? (conf.bsrSampleSize ?? 0) : 0;
  const total = conf ? (conf.totalResults ?? 0) : 0;
  const m = d?.metrics || null;
  const suggestions = Array.isArray(d?.suggestions) ? d.suggestions : [];
  const books = Array.isArray(d?.books) ? d.books : [];
  const aiRows = Array.isArray(ai?.rows) ? ai.rows : [];
  const symbol = d?.market?.symbol || marketInfo(domain).symbol;
  const num = v => (typeof v === "number" ? v.toLocaleString() : "—");

  return (
    <div className="card">
      <input
        placeholder={t.kwPlaceholder}
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === "Enter" && run()}
      />

      <button className="go" onClick={() => run()} disabled={busy}>
        {busy ? t.analyzing : t.analyze}
      </button>

      <button className="mini wide" onClick={askAi} disabled={aiBusy}>
        🤖 {aiBusy ? t.aiWorking : t.aiBtn}
      </button>

      {ai && (
        <div className="resultSection">
          {ai.error && <p className="mut">⏳ {errText(t, ai)}</p>}
          {aiRows.length > 0 && (
            <>
              <h3>🤖 {t.aiTitle}</h3>
              <div className="trustNote">
                <p>{t.aiNote}</p>
                <p>{t.aiVerify}</p>
                <small>{t.aiProvider}</small>
              </div>
              <div className="chips">
                {aiRows.map(x => (
                  <button
                    type="button"
                    key={x.keyword}
                    className="chip"
                    onClick={() => { setQ(x.keyword); run(x.keyword); }}
                  >
                    🤖 {x.keyword}
                  </button>
                ))}
              </div>
              <button className="mini" onClick={copyAi}>{t.copy}</button>
            </>
          )}
        </div>
      )}

      {d && (
        <>
          {d.error && (
            <div className="trustNote resultSection">
              <p>⏳ {errText(t, d)}</p>
              <small>{t.tryNiches}</small>
            </div>
          )}

          {conf && (
            <div className={"badge confidence b-" + (conf.level || "none")}>
              {t.confidence}: {t[conf.level] || conf.level || "—"} · {t.measuredOf} {measured} {t.ofBooks} {total} {t.booksWord}
            </div>
          )}

          {m && (
            <>
              <div className="grid resultSection">
                <div className="kpi"><b>{m.score ?? "—"}/100</b><span>{t.score}</span></div>
                <div className="kpi"><b>{num(m.avgBsr)}</b><span>{t.avgBsr} ({t.sample} {measured})</span></div>
                <div className="kpi"><b>{m.avgDailySales ?? "—"}</b><span>{t.dailySales}</span></div>
                <div className="kpi"><b>{typeof m.avgPrice === "number" ? symbol + m.avgPrice : "—"}</b><span>{t.avgPrice}</span></div>
                <div className="kpi"><b>{typeof m.measuredMonthlyRoyalty === "number" ? symbol + num(m.measuredMonthlyRoyalty) : "—"}</b><span>{t.nicheMonthly}</span></div>
                <div className="kpi"><b>{m.avgReviews ?? "—"}</b><span>{t.avgReviews}</span></div>
              </div>

              <p className="mut legend">{t.legend}</p>
              <p className="mut disclaimer">⚖️ {t.notAdvice}</p>
            </>
          )}

          {suggestions.length > 0 && (
            <>
              <h3>✅ {t.suggested}</h3>
              <div className="chips">
                {suggestions.map(s => (
                  <button type="button" key={s} className="chip" onClick={() => { setQ(s); run(s); }}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {books.length > 0 && (
            <>
              <h3>{t.topResults}</h3>
              {books.map(b => (
                <div key={b.asin} className="bookRow">
                  <b>{b.title || b.asin}</b>
                  <span className="mut">
                    {b.price != null ? symbol + b.price : "—"} · BSR {num(b.bsr)}
                    {b.source === "live" ? " 🟢" : " ⚪"} · ⭐{b.rating ?? "—"} ({b.reviews ?? "—"})
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
      <div className="trustNote"><p>{t.nicheNote}</p></div>

      <label className="mut">{t.nicheCat}</label>
      <select value={cat} onChange={e => setCat(e.target.value)}>
        {Object.keys(NICHE_CATEGORIES).map(k => <option key={k} value={k}>{label(k)}</option>)}
      </select>

      <label className="mut">{t.nicheCount}</label>
      <select value={count} onChange={e => setCount(Number(e.target.value))}>
        {[12, 24, 40, 60].map(n => <option key={n} value={n}>{n}</option>)}
      </select>

      <button className="go" onClick={load} disabled={busy}>
        {busy ? t.working : (rows.length ? t.nicheMore : t.nicheGen)}
      </button>

      {rows.length > 0 && (
        <>
          <div className="actionRow">
            <button className="mini" onClick={validateCurrent} disabled={busy}>{t.nicheValidate}</button>
            <button className="mini" onClick={copyAll}>{copied ? t.copied : t.copy}</button>
          </div>

          {rows.map(n => (
            <div key={n.keyword} className="nrow">
              <span className="nicheText">
                {n.keyword}
                {n.longTail && <small className="mut"> · {t.longTail}</small>}
              </span>
              <span className="nicheActions">
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDescription(x) {
  return x
    .slice(0, 4000)
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      if (p.startsWith("- ")) {
        const lis = p.split("\n")
          .filter(Boolean)
          .map(l => "<li>" + escapeHtml(l.replace(/^- /, "")) + "</li>")
          .join("");
        return "<ul>" + lis + "</ul>";
      }
      if (p.startsWith("# ")) return "<h4>" + escapeHtml(p.slice(2)) + "</h4>";
      return "<p>" + escapeHtml(p).replaceAll("\n", "<br>") + "</p>";
    })
    .join("");
}

function Formatter({ t }) {
  const [x, setX] = useState("");
  const [copied, setCopied] = useState(false);
  const html = formatDescription(x);

  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="card">
      <p className="mut">{t.fmtNote}</p>
      <textarea rows={8} maxLength={4000} value={x} onChange={e => setX(e.target.value)} />

      <h3>{t.preview}</h3>
      <div className="prev" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="formatterHead">
        <h3>{t.htmlCode}</h3>
        <button className="mini" onClick={copyHtml}>{copied ? t.copied : t.copyHtml}</button>
      </div>
      <textarea rows={5} readOnly value={html} />
      <p className="mut">{t.chars}: {x.length}/4000</p>
    </div>
  );
}

function Calc({ t, domain }) {
  const [p, setP] = useState(12.99);
  const [pg, setPg] = useState(120);
  const [ink, setInk] = useState("black");
  const [large, setLarge] = useState(false);

  const market = marketInfo(domain);
  const options = { domain, ink, large };
  const cost = printCost(pg, options);
  const rate = royaltyRate(p, domain);
  const roy = royaltyPerUnit(p, pg, options);

  return (
    <div className="card">
      <div className="trustNote">
        <p><b>{t.marketplace}:</b> {domain} · {market.currency}</p>
        <small>{t.calcNote}</small>
      </div>

      <label className="mut">{t.price}</label>
      <input type="number" min="0" step="0.01" value={p} onChange={e => setP(Number(e.target.value))} />

      <label className="mut">{t.pages}</label>
      <input type="number" min="24" max="828" value={pg} onChange={e => setPg(Number(e.target.value))} />

      <label className="mut">{t.printType}</label>
      <select value={ink} onChange={e => setInk(e.target.value)}>
        <option value="black">{t.blackInk}</option>
        <option value="premium">{t.premiumColor}</option>
        <option value="standard">{t.standardColor}</option>
      </select>

      <label className="mut">{t.trimClass}</label>
      <select value={large ? "large" : "regular"} onChange={e => setLarge(e.target.value === "large")}>
        <option value="regular">{t.regularTrim}</option>
        <option value="large">{t.largeTrim}</option>
      </select>

      {cost === null ? (
        <div className="trustNote warnNote"><p>⚠️ {t.invalidPrint}</p></div>
      ) : (
        <div className="grid resultSection">
          <div className="kpi"><b>{market.symbol}{cost.toFixed(2)}</b><span>{t.printCost}</span></div>
          <div className="kpi"><b>{rate ? Math.round(rate * 100) + "%" : "—"}</b><span>{t.royaltyRate}</span></div>
          <div className="kpi fullKpi"><b>{roy === null ? "—" : market.symbol + roy.toFixed(2)}</b><span>{t.royaltyUnit}</span></div>
        </div>
      )}

      <p className="mut disclaimer">⚖️ {t.notAdvice}</p>
    </div>
  );
}