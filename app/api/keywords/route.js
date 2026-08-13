import { NextResponse } from "next/server";
import { hasKey, searchBooks, enrichWithBsr } from "../../../lib/provider";
import { bsrToDailySales, royaltyPerUnit, opportunityScore, confidenceLevel, marketInfo } from "../../../lib/estimate";
import { checkRateLimit, rateLimitResponse } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED_DOMAINS = new Set([
  "amazon.com",
  "amazon.co.uk",
  "amazon.de",
  "amazon.fr",
  "amazon.it",
  "amazon.es",
  "amazon.ca"
]);

const MARKETPLACE_IDS = {
  "amazon.com": "ATVPDKIKX0DER",
  "amazon.co.uk": "A1F83G8C2ARO7P",
  "amazon.de": "A1PA6795UKMFR9",
  "amazon.fr": "A13V1IB3VIYZZH",
  "amazon.it": "APJ6JRA9NG5V4",
  "amazon.es": "A1RKKUPIHCS9HS",
  "amazon.ca": "A2EUQ1WTGCTBG2"
};

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms))
  ]);
}

function safeNumber(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

async function keywordSuggestions(prefix, domain) {
  const mid = MARKETPLACE_IDS[domain];
  if (!mid || !prefix) return [];

  try {
    const url = new URL("https://completion." + domain + "/api/2017/suggestions");
    url.searchParams.set("mid", mid);
    url.searchParams.set("alias", "stripbooks");
    url.searchParams.set("limit", "11");
    url.searchParams.set("suggestion-type", "KEYWORD");
    url.searchParams.set("prefix", prefix);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) return [];

    const json = await res.json();
    const list = json && json.suggestions ? json.suggestions : [];

    return list.map(x => x && x.value).filter(Boolean).slice(0, 10);
  } catch (e) {
    return [];
  }
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
  const q = (searchParams.get("q") || "").trim().slice(0, 120);
  const requestedDomain = searchParams.get("domain") || "amazon.com";
  const domain = ALLOWED_DOMAINS.has(requestedDomain) ? requestedDomain : "amazon.com";

  if (!q) {
    return NextResponse.json(
      { error: "MISSING_QUERY" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!hasKey()) {
    return NextResponse.json(
      { error: "NO_API_KEY" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let books = [];

  try {
    books = await searchBooks(q, domain);
  } catch (e) {
    return NextResponse.json(
      {
        error: "SEARCH_FAILED",
        detail: String(e && e.message ? e.message : e).slice(0, 300)
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }

  const suggestions = await withTimeout(
    keywordSuggestions(q, domain),
    5000,
    []
  );

  try {
    await withTimeout(
      enrichWithBsr(books, domain, 5),
      35000,
      null
    );
  } catch (e) {
    // Keep partial live results when BSR enrichment times out.
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
      book.dailySales === null ||
      book.dailySales === undefined ||
      book.royalty === null ||
      book.royalty === undefined
        ? null
        : Math.round(book.dailySales * 30 * book.royalty);
  }

  const measured = books.filter(b => safeNumber(b.bsr) !== null);
  const priced = books.filter(b => safeNumber(b.price) !== null);
  const reviewed = books.filter(b => safeNumber(b.reviews) !== null);

  function average(list, getter) {
    if (!list.length) return null;
    return list.reduce((sum, item) => sum + getter(item), 0) / list.length;
  }

  const avgBsr = measured.length
    ? Math.round(average(measured, b => b.bsr))
    : null;

  const avgPrice = priced.length
    ? Math.round(average(priced, b => b.price) * 100) / 100
    : null;

  const avgReviews = reviewed.length
    ? Math.round(average(reviewed, b => b.reviews))
    : null;

  const measuredWithSales = measured.filter(
    b => safeNumber(b.dailySales) !== null
  );

  const avgDailySales = measuredWithSales.length
    ? Math.round(
        average(measuredWithSales, b => b.dailySales) * 10
      ) / 10
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
      version: "3.1.0-keywords",
      generatedAt: new Date().toISOString(),

      market: {
        symbol: market.symbol,
        currency: market.currency
      },

      metrics: {
        avgBsr,
        avgPrice,
        avgReviews,
        avgDailySales,
        measuredMonthlyRoyalty,
        score: opportunityScore({
          avgBsr,
          avgReviews,
          avgPrice
        })
      },

      confidence: {
        totalResults: books.length,
        uniqueAsins: new Set(books.map(b => b.asin)).size,
        bsrSampleSize: measured.length,
        level: confidenceLevel(measured.length)
      },

      suggestions,
      books
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
