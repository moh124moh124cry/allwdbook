import { NextResponse } from "next/server";
import {
  hasKey,
  searchBooks,
  enrichWithBsr
} from "../../../lib/provider";
import {
  bsrToDailySales,
  royaltyPerUnit,
  opportunityScore,
  confidenceLevel,
  marketInfo
} from "../../../lib/estimate";
import {
  normalizeDomain,
  measureKeyword,
  expandKeyword,
  VERSION as SIGNALS_VERSION
} from "../../../lib/free-signals";
import {
  checkRateLimit,
  rateLimitResponse
} from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ROUTE_VERSION = "4.0.1-layered";

function safeNumber(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function average(list, getter) {
  if (!list.length) return null;
  return list.reduce((sum, item) => sum + getter(item), 0) / list.length;
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise(resolve =>
      setTimeout(() => resolve(fallback), ms)
    )
  ]);
}

function buildSuggestions(signal, expansion, query) {
  const seen = new Set();
  const out = [];
  const normalizedQuery = String(query || "").toLowerCase().trim();

  const add = value => {
    const clean = String(value || "").trim();
    if (!clean) return;
    if (clean.toLowerCase() === normalizedQuery) return;
    if (seen.has(clean)) return;

    seen.add(clean);
    out.push(clean);
  };

  if (
    signal &&
    signal.ok &&
    signal.measured &&
    Array.isArray(signal.measured.relatedKeywords)
  ) {
    signal.measured.relatedKeywords.forEach(add);
  }

  if (
    expansion &&
    expansion.ok &&
    Array.isArray(expansion.keywords)
  ) {
    expansion.keywords.forEach(row =>
      add(row && row.keyword)
    );
  }

  return out.slice(0, 40);
}

async function loadFreeLayer(q, domain, wantExpand) {
  const signalPromise = withTimeout(
    measureKeyword(q, domain),
    8000,
    {
      keyword: q.toLowerCase(),
      domain,
      ok: false,
      error: "UPSTREAM_TIMEOUT",
      measured: null,
      calculated: null
    }
  );

  const expansionPromise = wantExpand
    ? withTimeout(
        expandKeyword(q, domain, 40),
        24000,
        {
          ok: false,
          keywords: [],
          error: "UPSTREAM_TIMEOUT",
          requested: 0,
          succeeded: 0,
          partial: false
        }
      )
    : Promise.resolve({
        ok: false,
        keywords: [],
        error: null,
        requested: 0,
        succeeded: 0,
        partial: false,
        skipped: true
      });

  const [signal, expansion] = await Promise.all([
    signalPromise,
    expansionPromise
  ]);

  return {
    signal,
    expansion,
    available:
      Boolean(signal && signal.ok) ||
      Boolean(expansion && expansion.ok)
  };
}

function calculatePaidMetrics(books, domain) {
  for (const book of books) {
    book.dailySales = bsrToDailySales(book.bsr, domain);

    const pages = safeNumber(book.pages) || 120;

    book.royalty = royaltyPerUnit(book.price, pages, {
      domain,
      ink: "black",
      large: false
    });

    book.monthlyRoyalty =
      safeNumber(book.dailySales) === null ||
      safeNumber(book.royalty) === null
        ? null
        : Math.round(
            book.dailySales * 30 * book.royalty
          );
  }

  const measured = books.filter(
    book => safeNumber(book.bsr) !== null
  );

  const priced = books.filter(
    book => safeNumber(book.price) !== null
  );

  const reviewed = books.filter(
    book => safeNumber(book.reviews) !== null
  );

  const avgBsr = measured.length
    ? Math.round(
        average(measured, book => book.bsr)
      )
    : null;

  const avgPrice = priced.length
    ? Math.round(
        average(priced, book => book.price) * 100
      ) / 100
    : null;

  const avgReviews = reviewed.length
    ? Math.round(
        average(reviewed, book => book.reviews)
      )
    : null;

  const measuredWithSales = measured.filter(
    book => safeNumber(book.dailySales) !== null
  );

  const avgDailySales = measuredWithSales.length
    ? Math.round(
        average(
          measuredWithSales,
          book => book.dailySales
        ) * 10
      ) / 10
    : null;

  const royaltySample = measured
    .map(book => book.monthlyRoyalty)
    .filter(value => safeNumber(value) !== null);

  const measuredMonthlyRoyalty = royaltySample.length
    ? royaltySample.reduce(
        (sum, value) => sum + value,
        0
      )
    : null;

  return {
    metrics: {
      avgBsr,
      avgPrice,
      avgReviews,
      avgDailySales,
      measuredMonthlyRoyalty,
      score: measured.length
        ? opportunityScore({
            avgBsr,
            avgReviews,
            avgPrice
          })
        : null
    },

    confidence: {
      totalResults: books.length,
      uniqueAsins: new Set(
        books.map(book => book.asin).filter(Boolean)
      ).size,
      bsrSampleSize: measured.length,
      level: measured.length
        ? confidenceLevel(measured.length)
        : "none",
      basis: "bsr_sample"
    }
  };
}

async function loadPaidLayer(q, domain) {
  const keyPresent = hasKey();

  if (!keyPresent) {
    return {
      configured: false,
      available: false,
      status: "not_configured",
      error: null,
      books: [],
      metrics: null,
      confidence: null
    };
  }

  const searchResult = await withTimeout(
    searchBooks(q, domain),
    18000,
    null
  );

  if (!Array.isArray(searchResult)) {
    return {
      configured: true,
      available: false,
      status: "failed",
      error: "MARKET_SEARCH_UNAVAILABLE",
      books: [],
      metrics: null,
      confidence: null
    };
  }

  const books = searchResult;

  let enrichmentComplete = true;

  if (books.length) {
    const enrichment = await withTimeout(
      enrichWithBsr(books, domain, 5)
        .then(() => true)
        .catch(() => false),
      24000,
      false
    );

    enrichmentComplete = enrichment === true;
  }

  const paid = calculatePaidMetrics(books, domain);

  return {
    configured: true,
    available: true,
    status: enrichmentComplete ? "ok" : "partial",
    error: enrichmentComplete
      ? null
      : "BSR_ENRICH_PARTIAL",
    books,
    metrics: paid.metrics,
    confidence: paid.confidence
  };
}

export async function GET(req) {
  const rate = checkRateLimit(req, {
    name: "keyword-research",
    limit: 10,
    windowMs: 60_000
  });

  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "")
    .trim()
    .slice(0, 120);

  const domain = normalizeDomain(
    searchParams.get("domain") || "amazon.com"
  );

  const wantExpand =
    searchParams.get("expand") !== "0";

  if (!q) {
    return NextResponse.json(
      { error: "MISSING_QUERY" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  // Run the free and optional paid layers in parallel.
  // This keeps the route comfortably inside the 60s serverless budget.
  const [free, paid] = await Promise.all([
    loadFreeLayer(q, domain, wantExpand),
    loadPaidLayer(q, domain)
  ]);

  const signal = free.signal;
  const expansion = free.expansion;

  const freeAvailable = free.available;
  const paidAvailable = paid.available;

  if (!freeAvailable && !paidAvailable) {
    return NextResponse.json(
      {
        error: "SIGNALS_UNAVAILABLE",
        keyword: q,
        domain,
        version: ROUTE_VERSION,
        signalsVersion: SIGNALS_VERSION,
        generatedAt: new Date().toISOString(),

        demand: {
          available: false,
          error:
            signal && signal.error
              ? signal.error
              : "UPSTREAM_UNAVAILABLE",
          source: "amazon_autocomplete",
          measured: null,
          calculated: null
        },

        expansion: {
          available: false,
          error:
            expansion && expansion.error
              ? expansion.error
              : "UPSTREAM_UNAVAILABLE",
          partial: false,
          total: 0,
          longTail: []
        },

        marketData: {
          configured: paid.configured,
          available: false,
          status: paid.status,
          error: paid.error
        }
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  let mode = "free";

  if (freeAvailable && paidAvailable) {
    mode = "full";
  } else if (paidAvailable) {
    mode = "market_only";
  } else if (
    paid.configured &&
    paid.status === "failed"
  ) {
    mode = "free_fallback";
  }

  const suggestions = buildSuggestions(
    signal,
    expansion,
    q
  );

  const longTail =
    expansion &&
    expansion.ok &&
    Array.isArray(expansion.keywords)
      ? expansion.keywords
          .filter(row => row && row.longTail)
          .slice(0, 20)
      : [];

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

      demand: {
        available: Boolean(signal && signal.ok),
        error:
          signal && signal.ok
            ? null
            : signal && signal.error
              ? signal.error
              : "UPSTREAM_UNAVAILABLE",
        source: "amazon_autocomplete",
        measured:
          signal && signal.ok
            ? signal.measured
            : null,
        calculated:
          signal && signal.ok
            ? signal.calculated
            : null
      },

      expansion: {
        available: Boolean(
          expansion && expansion.ok
        ),
        error:
          expansion && expansion.ok
            ? null
            : expansion
              ? expansion.error
              : "UPSTREAM_UNAVAILABLE",
        partial: Boolean(
          expansion && expansion.partial
        ),
        total:
          expansion &&
          expansion.ok &&
          Array.isArray(expansion.keywords)
            ? expansion.keywords.length
            : 0,
        longTail
      },

      marketData: {
        configured: paid.configured,
        available: paid.available,
        status: paid.status,
        error: paid.error
      },

      metrics: paid.metrics,
      confidence: paid.confidence,
      suggestions,
      books: paid.books
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
