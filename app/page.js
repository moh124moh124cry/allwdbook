"use client";

import { useEffect, useState } from "react";
import { T } from "../lib/i18n";
import { NICHE_CATEGORIES } from "../lib/niches";
import {
  printCost,
  royaltyPerUnit,
  royaltyRate,
  marketInfo
} from "../lib/estimate";
import CoverTool from "./covertool";
import KeywordsPanel from "./keywordspanel";
import AccountMenu from "./accountmenu";

const DOMAINS = [
  "amazon.com",
  "amazon.co.uk",
  "amazon.de",
  "amazon.fr",
  "amazon.it",
  "amazon.es",
  "amazon.ca"
];

const ORDER = [6, 1, 0, 5, 4];

const ICONS = [
  "🔑",
  "🎯",
  "📚",
  "📈",
  "✍️",
  "🧮"
];

function tabLabel(t, lang, i) {
  if (i === 6) {
    return (
      "📐 " +
      (
        lang === "en"
          ? "Cover Designer"
          : "مصمم الغلاف"
      )
    );
  }

  return ICONS[i] + " " + t.tabs[i];
}

function errText(t, d) {
  if (!d) {
    return t.errGeneric;
  }

  const code = String(
    d.error || ""
  );

  const detail = String(
    d.detail || ""
  );

  if (code === "RATE_LIMITED") {
    return t.errRate;
  }

  if (code === "NO_API_KEY") {
    return t.errNoKey;
  }

  if (
    code === "SEARCH_FAILED" &&
    detail.indexOf("402") >= 0
  ) {
    return t.errNoCredit;
  }

  if (code === "SEARCH_FAILED") {
    return t.errSearch;
  }

  if (code === "MISSING_QUERY") {
    return t.errMissing;
  }

  if (code === "NETWORK") {
    return t.errNetwork;
  }

  if (
    code === "NO_AI_KEY" ||
    code === "NO_GEMINI_KEY"
  ) {
    return t.errAiKey;
  }

  if (code === "AI_FAILED") {
    return t.errAiBusy;
  }

  return t.errGeneric;
}

export default function Home() {
  const [lang, setLang] =
    useState("ar");

  const [tab, setTab] =
    useState(6);

  const [domain, setDomain] =
    useState("amazon.com");

  const [seedKw, setSeedKw] =
    useState("");

  const t = T[lang];

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "awd_lang"
      );

    if (
      savedLanguage &&
      T[savedLanguage]
    ) {
      setLang(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "awd_lang",
      lang
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
      behavior: "smooth"
    });
  }

  return (
    <div className="wrap">
      <header>
        <AccountMenu />

        <div className="brandbox">
          <h1>
            AllWDbook
            <span className="tm">
              ™
            </span>
          </h1>

          <span className="mut">
            {t.tagline}
          </span>
        </div>

        <button
          className="lang"
          type="button"
          aria-label={
            lang === "ar"
              ? "Switch to English"
              : "التبديل إلى اللغة العربية"
          }
          title={
            lang === "ar"
              ? "English"
              : "العربية"
          }
          onClick={() =>
            setLang(
              lang === "ar"
                ? "en"
                : "ar"
            )
          }
          style={{
            width: 48,
            height: 42,
            padding: 0,
            display: "grid",
            placeItems: "center",
            fontSize: 24,
            lineHeight: 1
          }}
        >
          {lang === "ar"
            ? "🇺🇸"
            : "🇩🇿"}
        </button>
      </header>

      <label className="mut">
        {t.marketplace}
      </label>

      <select
        value={domain}
        onChange={(event) =>
          setDomain(
            event.target.value
          )
        }
      >
        {DOMAINS.map(
          (marketDomain) => (
            <option
              key={marketDomain}
              value={marketDomain}
            >
              {marketDomain}
            </option>
          )
        )}
      </select>

      <div className="tabs">
        {ORDER.map((index) => (
          <button
            key={index}
            className={
              "tab" +
              (
                index === tab
                  ? " on"
                  : ""
              )
            }
            onClick={() =>
              setTab(index)
            }
          >
            {tabLabel(
              t,
              lang,
              index
            )}
          </button>
        ))}
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

      <footer className="foot">
        <img
          src="/logov3.png"
          alt=""
        />

        <span>
          {t.by}{" "}
          <b>
            All World Digital
          </b>{" "}
          ©{" "}
          {new Date().getFullYear()}
          {" · "}
          {t.rights}
        </span>
      </footer>
    </div>
  );
}

function Keywords({
  t,
  domain,
  seed
}) {
  const [q, setQ] =
    useState("");

  const [d, setD] =
    useState(null);

  const [busy, setBusy] =
    useState(false);

  const [ai, setAi] =
    useState(null);

  const [aiBusy, setAiBusy] =
    useState(false);

  useEffect(() => {
    if (seed) {
      setQ(seed);
      run(seed);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  async function run(term) {
    const keyword =
      (term || q).trim();

    if (!keyword) {
      return;
    }

    setBusy(true);

    try {
      const response =
        await fetch(
          "/api/keywords?q=" +
            encodeURIComponent(
              keyword
            ) +
            "&domain=" +
            encodeURIComponent(
              domain
            )
        );

      setD(
        await response.json()
      );
    } catch {
      setD({
        error: "NETWORK"
      });
    }

    setBusy(false);
  }

  async function askAi() {
    if (!q.trim()) {
      return;
    }

    setAiBusy(true);

    try {
      const response =
        await fetch(
          "/api/ai?q=" +
            encodeURIComponent(
              q.trim()
            ) +
            "&limit=15"
        );

      setAi(
        await response.json()
      );
    } catch {
      setAi({
        error: "NETWORK",
        rows: []
      });
    }

    setAiBusy(false);
  }

  function copyAi() {
    const list =
      ai &&
      Array.isArray(ai.rows)
        ? ai.rows
        : [];

    navigator.clipboard.writeText(
      list
        .map(
          (item) =>
            item.keyword
        )
        .join("\n")
    );
  }

  const confidence =
    d?.confidence || null;

  const measured =
    confidence
      ? (
          confidence
            .bsrSampleSize ?? 0
        )
      : 0;

  const total =
    confidence
      ? (
          confidence
            .totalResults ?? 0
        )
      : 0;

  const metrics =
    d?.metrics || null;

  const suggestions =
    Array.isArray(
      d?.suggestions
    )
      ? d.suggestions
      : [];

  const books =
    Array.isArray(d?.books)
      ? d.books
      : [];

  const aiRows =
    Array.isArray(ai?.rows)
      ? ai.rows
      : [];

  const symbol =
    d?.market?.symbol ||
    marketInfo(domain).symbol;

  const numberText = (value) =>
    typeof value === "number"
      ? value.toLocaleString()
      : "—";

  return (
    <div className="card">
      <input
        placeholder={
          t.kwPlaceholder
        }
        value={q}
        onChange={(event) =>
          setQ(
            event.target.value
          )
        }
        onKeyDown={(event) =>
          event.key === "Enter" &&
          run()
        }
      />

      <button
        className="go"
        onClick={() => run()}
        disabled={busy}
      >
        {busy
          ? t.analyzing
          : t.analyze}
      </button>

      <button
        className="mini wide"
        onClick={askAi}
        disabled={aiBusy}
      >
        🤖{" "}
        {aiBusy
          ? t.aiWorking
          : t.aiBtn}
      </button>

      {ai && (
        <div className="resultSection">
          {ai.error && (
            <p className="mut">
              ⏳{" "}
              {errText(t, ai)}
            </p>
          )}

          {aiRows.length > 0 && (
            <>
              <h3>
                🤖 {t.aiTitle}
              </h3>

              <div className="trustNote">
                <p>
                  {t.aiNote}
                </p>

                <p>
                  {t.aiVerify}
                </p>

                <small>
                  {t.aiProvider}
                </small>
              </div>

              <div className="chips">
                {aiRows.map(
                  (item) => (
                    <button
                      type="button"
                      key={
                        item.keyword
                      }
                      className="chip"
                      onClick={() => {
                        setQ(
                          item.keyword
                        );

                        run(
                          item.keyword
                        );
                      }}
                    >
                      🤖{" "}
                      {
                        item.keyword
                      }
                    </button>
                  )
                )}
              </div>

              <button
                className="mini"
                onClick={copyAi}
              >
                {t.copy}
              </button>
            </>
          )}
        </div>
      )}

      {d && (
        <>
          {d.error && (
            <div className="trustNote resultSection">
              <p>
                ⏳{" "}
                {errText(t, d)}
              </p>

              <small>
                {t.tryNiches}
              </small>
            </div>
          )}

          {confidence && (
            <div
              className={
                "badge confidence b-" +
                (
                  confidence.level ||
                  "none"
                )
              }
            >
              {t.confidence}:{" "}
              {t[
                confidence.level
              ] ||
                confidence.level ||
                "—"}
              {" · "}
              {t.measuredOf}{" "}
              {measured}{" "}
              {t.ofBooks}{" "}
              {total}{" "}
              {t.booksWord}
            </div>
          )}

          {metrics && (
            <>
              <div className="grid resultSection">
                <div className="kpi">
                  <b>
                    {metrics.score ??
                      "—"}
                    /100
                  </b>

                  <span>
                    {t.score}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {numberText(
                      metrics.avgBsr
                    )}
                  </b>

                  <span>
                    {t.avgBsr} (
                    {t.sample}{" "}
                    {measured})
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {metrics
                      .avgDailySales ??
                      "—"}
                  </b>

                  <span>
                    {t.dailySales}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {typeof metrics
                      .avgPrice ===
                    "number"
                      ? symbol +
                        metrics
                          .avgPrice
                      : "—"}
                  </b>

                  <span>
                    {t.avgPrice}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {typeof metrics
                      .measuredMonthlyRoyalty ===
                    "number"
                      ? symbol +
                        numberText(
                          metrics
                            .measuredMonthlyRoyalty
                        )
                      : "—"}
                  </b>

                  <span>
                    {t.nicheMonthly}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {metrics
                      .avgReviews ??
                      "—"}
                  </b>

                  <span>
                    {t.avgReviews}
                  </span>
                </div>
              </div>

              <p className="mut legend">
                {t.legend}
              </p>

              <p className="mut disclaimer">
                ⚖️ {t.notAdvice}
              </p>
            </>
          )}

          {suggestions.length >
            0 && (
            <>
              <h3>
                ✅ {t.suggested}
              </h3>

              <div className="chips">
                {suggestions.map(
                  (
                    suggestion
                  ) => (
                    <button
                      type="button"
                      key={
                        suggestion
                      }
                      className="chip"
                      onClick={() => {
                        setQ(
                          suggestion
                        );

                        run(
                          suggestion
                        );
                      }}
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {books.length > 0 && (
            <>
              <h3>
                {t.topResults}
              </h3>

              {books.map(
                (book) => (
                  <div
                    key={
                      book.asin
                    }
                    className="bookRow"
                  >
                    <b>
                      {book.title ||
                        book.asin}
                    </b>

                    <span className="mut">
                      {book.price !=
                      null
                        ? symbol +
                          book.price
                        : "—"}
                      {" · BSR "}
                      {numberText(
                        book.bsr
                      )}

                      {book.source ===
                      "live"
                        ? " 🟢"
                        : " ⚪"}

                      {" · ⭐"}
                      {book.rating ??
                        "—"}
                      {" ("}
                      {book.reviews ??
                        "—"}
                      {")"}
                    </span>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Niches({
  t,
  lang,
  domain,
  onAnalyze
}) {
  const [cat, setCat] =
    useState("coloring");

  const [count, setCount] =
    useState(24);

  const [rows, setRows] =
    useState([]);

  const [busy, setBusy] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  async function load() {
    setBusy(true);

    const seed =
      String(Date.now());

    try {
      const response =
        await fetch(
          "/api/niches?cat=" +
            cat +
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
    }

    setBusy(false);
  }

  async function validateCurrent() {
    setBusy(true);

    try {
      const response =
        await fetch(
          "/api/niches?cat=" +
            cat +
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
    } catch {}

    setBusy(false);
  }

  function copyAll() {
    navigator.clipboard.writeText(
      rows
        .map(
          (item) =>
            item.keyword
        )
        .join("\n")
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  const categoryLabel =
    (key) =>
      lang === "ar"
        ? NICHE_CATEGORIES[
            key
          ].ar
        : NICHE_CATEGORIES[
            key
          ].en;

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
        value={cat}
        onChange={(event) =>
          setCat(
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

          {rows.map(
            (item) => (
              <div
                key={
                  item.keyword
                }
                className="nrow"
              >
                <span className="nicheText">
                  {item.keyword}

                  {item.longTail && (
                    <small className="mut">
                      {" · "}
                      {t.longTail}
                    </small>
                  )}
                </span>

                <span className="nicheActions">
                  <span
                    className={
                      "badge " +
                      (
                        item.demand
                          ? "b-" +
                            item.demand
                          : "b-none"
                      )
                    }
                  >
                    {item.demand
                      ? t[
                          item.demand
                        ] ||
                        item.demand
                      : t.untested}
                  </span>

                  <button
                    className="mini"
                    onClick={() =>
                      onAnalyze(
                        item.keyword
                      )
                    }
                  >
                    {
                      t.analyzeThis
                    }
                  </button>
                </span>
              </div>
            )
          )}
        </>
      )}
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
        paragraph.startsWith(
          "- "
        )
      ) {
        const listItems =
          paragraph
            .split("\n")
            .filter(Boolean)
            .map(
              (line) =>
                "<li>" +
                escapeHtml(
                  line.replace(
                    /^- /,
                    ""
                  )
                ) +
                "</li>"
            )
            .join("");

        return (
          "<ul>" +
          listItems +
          "</ul>"
        );
      }

      if (
        paragraph.startsWith(
          "# "
        )
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
  const [value, setValue] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const html =
    formatDescription(value);

  async function copyHtml() {
    await navigator.clipboard
      .writeText(html);

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
          __html: html
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
        {value.length}/4000
      </p>
    </div>
  );
}

function Calc({
  t,
  domain
}) {
  const [price, setPrice] =
    useState(12.99);

  const [pages, setPages] =
    useState(120);

  const [ink, setInk] =
    useState("black");

  const [large, setLarge] =
    useState(false);

  const market =
    marketInfo(domain);

  const options = {
    domain,
    ink,
    large
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
          {domain}
          {" · "}
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
            ⚠️{" "}
            {t.invalidPrint}
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
                  royalty.toFixed(
                    2
                  )}
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
