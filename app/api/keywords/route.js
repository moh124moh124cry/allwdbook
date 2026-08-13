import { NextResponse } from "next/server";
import { hasKey, searchBooks, enrichWithBsr } from "../../../lib/provider";
import { bsrToDailySales, royaltyPerUnit, opportunityScore, confidenceLevel, marketInfo } from "../../../lib/estimate";
import { checkRateLimit, rateLimitResponse } from "../../../lib/rateLimit";
import { normalizeDomain, measureKeyword, expandKeyword, VERSION as SIGNALS_VERSION } from "../../../lib/free-signals";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ROUTE_VERSION = "4.0.0-layered";

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms))
  ]);
}

function safeNumber(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function average(list, getter) {
  if (!list.length) return null;
  return list.reduce((sum, item) => sum + getter(item), 0) / list.length;
}

export async function GET(req) {
  const rate = checkRateLimit(req, {
    name: "keyword-research",
    limit: 10,
    windowMs: 60000
  });

  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 120);
  const domain = normalizeDomain(searchParams.get("domain") || "amazon.com");
  const wantExpand = searchParams.get("expand") !== "0";

  if (!q) {
    return NextResponse.json(
      { error: "MISSING_QUERY" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // ---------- LAYER 1 : FREE (always attempted, never requires a key) ----------

  const signal = await withTimeout(measureKeyword(q, domain), 9000, {
    ok: false,
    error: "UPSTREAM_TIMEOUT",
    measured: null,
    calculated: null
  });

  let expansion = { ok: false, keywords: [], error: null, partial: false };

  if (wantExpand) {
    expansion = await withTimeout(expandKeyword(q, domain, 40), 26000, {
      ok: false,
      keywords: [],
      error: "UPSTREAM_TIMEOUT",
      partial: false
    });
  }

  const freeOk = signal.ok === true || expansion.ok === true;

  const relatedFromSignal =
    signal.ok && signal.measured ? signal.measured.relatedKeywords : [];

  const relatedFromExpansion = expansion.ok
    ? expansion.keywords.map(row => row.keyword)
    : [];

  const suggestionSet = new Map();

  for (let i = 0; i < relatedFromSignal.length; i++) {
    suggestionSet.set(relatedFromSignal[i], true);
  }

  for (let i = 0; i < relatedFromExpansion.length; i++) {
    if (relatedFromExpansion[i] !== q.toLowerCase()) {
      suggestionSet.set(relatedFromExpansion[i], true);
    }
  }

  const suggestions = Array.from(suggestionSet.keys()).slice(0, 40);

  const longTail = expansion.ok
    ? expansion.keywords.filter(row => row.longTail).slice(0, 20)
    : [];

  // ---------- LAYER 2 : PAID (optional enrichment only) ----------

  const keyPresent = hasKey();

  let books = [];
  let paidOk = false;
  let paidError = null;

  if (keyPresent) {
    try {
      books = await withTimeout(searchBooks(q, domain), 20000, null);

      if (!Array.isArray(books)) {
        books = [];
        paidError = "SEARCH_TIMEOUT";
      } else {
        paidOk = true;
      }
    } catch (e) {
      books = [];
      paidError = String(e && e.message ? e.message : e).slice(0, 200);
    }

    if (paidOk && books.length) {
      try {
        await withTimeout(enrichWithBsr(books, domain, 5), 25000, null);
      } catch (e) {
        // Keep partial results when BSR enrichment fails.
      }

      for (const book of books) {
        book.dailySales = bsrToDailySales(book.bsr, domain);
        const pages = safeNumber(book.pages) || 120;

        book.royalty = royaltyPerUnit(book.price, pages, {
          domain,
          ink: "black",
          large: false
        });

        book.monthlyRoyalty =
          safeNumber(book.dailySales) === null || safeNumber(book.royalty) === null
            ? null
            : Math.round(book.dailySales * 30 * book.royalty);
      }
    }
  } else {
    paidError = "NOT_CONFIGURED";
  }

  // ---------- If BOTH layers failed, say so honestly ----------

  if (!freeOk && !paidOk) {
    return NextResponse.json(
      {
        error: "SIGNALS_UNAVAILABLE",
        detail: signal.error || expansion.error || paidError,
        keyword: q,
        domain
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  // ---------- MERGE ----------

  const mode = paidOk ? "full" : keyPresent ? "free_fallback" : "free";

  const measured = books.filter(b => safeNumber(b.bsr) !== null);
  const priced = books.filter(b => safeNumber(b.price) !== null);
  const reviewed = books.filter(b => safeNumber(b.reviews) !== null);

  const avgBsr = measured.length ? Math.round(average(measured, b => b.bsr)) : null;

  const avgPrice = priced.length
    ? Math.round(average(priced, b => b.price) * 100) / 100
    : null;

  const avgReviews = reviewed.length
    ? Math.round(average(reviewed, b => b.reviews))
    : null;

  const withSales = measured.filter(b => safeNumber(b.dailySales) !== null);

  const avgDailySales = withSales.length
    ? Math.round(average(withSales, b => b.dailySales) * 10) / 10
    : null;

  const royaltySample = measured
    .map(b => b.monthlyRoyalty)
    .filter(v => safeNumber(v) !== null);

  const measuredMonthlyRoyalty = royaltySample.length
    ? royaltySample.reduce((sum, value) => sum + value, 0)
    : null;

  const market = marketInfo(domain);

  return NextResponse.json(
    {
      keyword: q,
      domain,
      version: ROUTE_VERSION,
      signalsVersion: SIGNALS_VERSION,
      mode,
      generatedAt: new Date().toISOString(),

      market: {
        symbol: market.symbol,
        currency: market.currency
      },

      // FREE LAYER — real observations from Amazon autocomplete
      demand: {
        available: signal.ok === true,
        error: signal.ok ? null : signal.error,
        source: "amazon_autocomplete",
        measured: signal.ok ? signal.measured : null,
        calculated: signal.ok ? signal.calculated : null
      },

      expansion: {
        available: expansion.ok === true,
        error: expansion.ok ? null : expansion.error,
        partial: expansion.partial === true,
        total: expansion.ok ? expansion.keywords.length : 0,
        longTail
      },

      // PAID LAYER — present only when market data is configured and healthy
      marketData: {
        configured: keyPresent,
        available: paidOk,
        error: paidOk ? null : paidError
      },

      metrics: {
        avgBsr,
        avgPrice,
        avgReviews,
        avgDailySales,
        measuredMonthlyRoyalty,
        score: measured.length
          ? opportunityScore({ avgBsr, avgReviews, avgPrice })
          : null,
        demandSignalScore:
          signal.ok && signal.calculated
            ? signal.calculated.demandSignalScore
            : null
      },

      confidence: {
        totalResults: books.length,
        uniqueAsins: new Set(books.map(b => b.asin)).size,
        bsrSampleSize: measured.length,
        level: measured.length ? confidenceLevel(measured.length) : "signal_only",
        basis: paidOk ? "bsr_sample" : "autocomplete_only"
      },

      suggestions,
      books
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
