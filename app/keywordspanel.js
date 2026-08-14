"use client";

import { useEffect, useState } from "react";
import { marketInfo } from "../lib/estimate";
import { getSupabase } from "../lib/supabase";

function errText(t, d) {
  if (!d) return t.errGeneric;

  const code = String(d.error || "");
  const detail = String(d.detail || "");

  if (code === "RATE_LIMITED") return t.errRate;
  if (code === "NO_API_KEY") return t.errNoKey;

  if (
    code === "SEARCH_FAILED" &&
    detail.indexOf("402") >= 0
  ) {
    return t.errNoCredit;
  }

  if (code === "SEARCH_FAILED") return t.errSearch;
  if (code === "MISSING_QUERY") return t.errMissing;
  if (code === "NETWORK") return t.errNetwork;
  if (code === "SIGNALS_UNAVAILABLE") return t.errSignals;

  if (
    code === "NO_AI_KEY" ||
    code === "NO_GEMINI_KEY"
  ) {
    return t.errAiKey;
  }

  if (code === "AI_FAILED") return t.errAiBusy;

  if (code === "DAILY_LIMIT_REACHED") {
    return (
      detail ||
      "You have used your 5 free Keyword Research searches for today."
    );
  }

  if (code === "USAGE_CHECK_FAILED") {
    return "Unable to verify your daily usage. Please try again.";
  }

  return t.errGeneric;
}

function modeText(t, mode) {
  if (mode === "full") return t.modeFull;

  if (mode === "free_fallback") {
    return t.modeFallback;
  }

  if (mode === "market_only") {
    return t.modeMarketOnly;
  }

  return t.modeFree;
}

export default function KeywordsPanel({
  t,
  domain,
  seed,
}) {
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
      const supabase = getSupabase();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const usageResponse = await fetch(
        "/api/usage/consume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            toolId: "keywords",
          }),
        }
      );

      const usageData =
        await usageResponse
          .json()
          .catch(() => ({}));

      if (!usageResponse.ok) {
        if (
          usageResponse.status === 401 ||
          usageData?.error === "LOGIN_REQUIRED"
        ) {
          window.location.href = "/login";
          return;
        }

        if (
          usageData?.error ===
          "DAILY_LIMIT_REACHED"
        ) {
          setD({
            error: "DAILY_LIMIT_REACHED",
            detail:
              "You have used your 5 free Keyword Research searches for today.",
          });

          return;
        }

        setD({
          error: "USAGE_CHECK_FAILED",
        });

        return;
      }

      const r = await fetch(
        "/api/keywords?q=" +
          encodeURIComponent(k) +
          "&domain=" +
          encodeURIComponent(domain),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setD(await r.json());
    } catch (e) {
      setD({
        error: "NETWORK",
      });
    } finally {
      setBusy(false);
    }
  }

  async function askAi() {
    if (!q.trim()) return;

    setAiBusy(true);

    try {
      const r = await fetch(
        "/api/ai?q=" +
          encodeURIComponent(q.trim()) +
          "&limit=15"
      );

      setAi(await r.json());
    } catch (e) {
      setAi({
        error: "NETWORK",
        rows: [],
      });
    }

    setAiBusy(false);
  }

  function copyAi() {
    const list =
      ai && Array.isArray(ai.rows)
        ? ai.rows
        : [];

    navigator.clipboard.writeText(
      list
        .map(x => x.keyword)
        .join("\n")
    );
  }

  const demand = d?.demand || null;

  const measuredDemand =
    demand?.measured || null;

  const calculatedDemand =
    demand?.calculated || null;

  const expansion =
    d?.expansion || null;

  const longTail =
    Array.isArray(expansion?.longTail)
      ? expansion.longTail
      : [];

  const conf =
    d?.confidence || null;

  const measured =
    conf
      ? conf.bsrSampleSize ?? 0
      : 0;

  const total =
    conf
      ? conf.totalResults ?? 0
      : 0;

  const m =
    d?.metrics || null;

  const suggestions =
    Array.isArray(d?.suggestions)
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

  const num = value =>
    typeof value === "number"
      ? value.toLocaleString()
      : "—";

  const demandLevel =
    calculatedDemand?.demandLevel ||
    "none";

  const demandScore =
    typeof calculatedDemand
      ?.demandSignalScore === "number"
      ? calculatedDemand
          .demandSignalScore
      : null;

  const hasPaidMetrics =
    m &&
    (
      typeof m.avgBsr === "number" ||
      typeof m.avgPrice === "number" ||
      typeof m.avgReviews === "number" ||
      typeof m.avgDailySales === "number" ||
      typeof m.measuredMonthlyRoyalty ===
        "number" ||
      typeof m.score === "number"
    );

  return (
    <div className="card">
      <input
        placeholder={t.kwPlaceholder}
        value={q}
        onChange={e =>
          setQ(e.target.value)
        }
        onKeyDown={e =>
          e.key === "Enter" &&
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
              ⏳ {errText(t, ai)}
            </p>
          )}

          {aiRows.length > 0 && (
            <>
              <h3>
                🤖 {t.aiTitle}
              </h3>

              <div className="trustNote">
                <p>{t.aiNote}</p>
                <p>{t.aiVerify}</p>
                <small>
                  {t.aiProvider}
                </small>
              </div>

              <div className="chips">
                {aiRows.map(x => (
                  <button
                    type="button"
                    key={x.keyword}
                    className="chip"
                    onClick={() => {
                      setQ(x.keyword);
                      run(x.keyword);
                    }}
                  >
                    🤖 {x.keyword}
                  </button>
                ))}
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
                ⏳ {errText(t, d)}
              </p>

              {d.error !==
                "DAILY_LIMIT_REACHED" && (
                <small>
                  {t.tryNiches}
                </small>
              )}
            </div>
          )}

          {!d.error &&
            d.mode && (
              <div className="trustNote resultSection">
                <p>
                  {modeText(
                    t,
                    d.mode
                  )}
                </p>

                {d.marketData &&
                  d.marketData
                    .configured ===
                    false && (
                    <small>
                      {
                        t.marketDataOff
                      }
                    </small>
                  )}
              </div>
            )}

          {!d.error &&
            demand &&
            demand.available &&
            measuredDemand &&
            calculatedDemand && (
              <div className="resultSection">
                <h3>
                  🔎 {t.demandTitle}
                </h3>

                <div className="grid">
                  <div className="kpi">
                    <b>
                      {demandScore !==
                      null
                        ? demandScore +
                          "/100"
                        : "—"}
                    </b>

                    <span>
                      {t.demandScore}
                    </span>
                  </div>

                  <div className="kpi">
                    <b>
                      {t[
                        demandLevel
                      ] ||
                        demandLevel ||
                        "—"}
                    </b>

                    <span>
                      {
                        t.demandLevelLabel
                      }
                    </span>
                  </div>

                  <div className="kpi">
                    <b>
                      {num(
                        measuredDemand
                          .suggestionDepth
                      )}
                    </b>

                    <span>
                      {t.depthLabel}
                    </span>
                  </div>

                  <div className="kpi">
                    <b>
                      {measuredDemand
                        .exactMatchPresent
                        ? "✅"
                        : "—"}
                    </b>

                    <span>
                      {measuredDemand
                        .exactMatchPresent
                        ? t.exactYes
                        : t.exactNo}
                    </span>
                  </div>

                  <div className="kpi">
                    <b>
                      {measuredDemand
                        .exactMatchPosition ??
                        "—"}
                    </b>

                    <span>
                      {t.positionLabel}
                    </span>
                  </div>
                </div>

                <div className="trustNote">
                  <p>
                    {t.demandBasis}
                  </p>

                  <small>
                    {
                      t.demandScoreOwner
                    }
                  </small>
                </div>
              </div>
            )}

          {!d.error &&
            demand &&
            demand.available ===
              false && (
              <div className="trustNote resultSection">
                <p>
                  ⚠️ {t.errSignals}
                </p>
              </div>
            )}

          {!d.error &&
            expansion &&
            expansion.available && (
              <div className="resultSection">
                <h3>
                  🔑{" "}
                  {t.expansionTitle}
                </h3>

                <p className="mut">
                  {num(
                    expansion.total
                  )}{" "}
                  {t.expansionTotal}
                </p>

                {expansion.partial && (
                  <div className="trustNote">
                    <p>
                      {t.partialNote}
                    </p>
                  </div>
                )}

                {longTail.length >
                  0 && (
                  <>
                    <h3>
                      🧩{" "}
                      {
                        t.longTailTitle
                      }
                    </h3>

                    <div className="chips">
                      {longTail.map(
                        row => (
                          <button
                            type="button"
                            key={
                              row.keyword
                            }
                            className="chip"
                            onClick={() => {
                              setQ(
                                row.keyword
                              );
                              run(
                                row.keyword
                              );
                            }}
                          >
                            {
                              row.keyword
                            }
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          {conf &&
            conf.basis ===
              "bsr_sample" && (
              <div
                className={
                  "badge confidence b-" +
                  (
                    conf.level ||
                    "none"
                  )
                }
              >
                {t.confidence}:{" "}
                {t[conf.level] ||
                  conf.level ||
                  "—"}{" "}
                · {t.measuredOf}{" "}
                {measured}{" "}
                {t.ofBooks} {total}{" "}
                {t.booksWord}
              </div>
            )}

          {hasPaidMetrics && (
            <>
              <div className="grid resultSection">
                <div className="kpi">
                  <b>
                    {typeof m.score ===
                    "number"
                      ? m.score +
                        "/100"
                      : "—"}
                  </b>

                  <span>
                    {t.score}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {num(
                      m.avgBsr
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
                    {typeof m
                      .avgDailySales ===
                    "number"
                      ? m.avgDailySales
                      : "—"}
                  </b>

                  <span>
                    {t.dailySales}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {typeof m
                      .avgPrice ===
                    "number"
                      ? symbol +
                        m.avgPrice
                      : "—"}
                  </b>

                  <span>
                    {t.avgPrice}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {typeof m
                      .measuredMonthlyRoyalty ===
                    "number"
                      ? symbol +
                        num(
                          m.measuredMonthlyRoyalty
                        )
                      : "—"}
                  </b>

                  <span>
                    {t.nicheMonthly}
                  </span>
                </div>

                <div className="kpi">
                  <b>
                    {typeof m
                      .avgReviews ===
                    "number"
                      ? m.avgReviews
                      : "—"}
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
                  s => (
                    <button
                      type="button"
                      key={s}
                      className="chip"
                      onClick={() => {
                        setQ(s);
                        run(s);
                      }}
                    >
                      {s}
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

              {books.map(b => (
                <div
                  key={b.asin}
                  className="bookRow"
                >
                  <b>
                    {b.title ||
                      b.asin}
                  </b>

                  <span className="mut">
                    {b.price != null
                      ? symbol +
                        b.price
                      : "—"}{" "}
                    · BSR{" "}
                    {num(b.bsr)}
                    {b.source ===
                    "live"
                      ? " 🟢"
                      : " ⚪"}{" "}
                    · ⭐
                    {b.rating ??
                      "—"}{" "}
                    (
                    {b.reviews ??
                      "—"}
                    )
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
