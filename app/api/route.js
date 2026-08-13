// AllWDbook — Keyword Research accuracy patch
// IMPORTANT: This route changes Keyword Research only.
// Micro-Niche files and behavior are not modified.

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

// Official Amazon marketplace IDs.
// This helper is LOCAL to Keyword Research so Micro-Niche remains untouched.
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
    const url = new URL(`https://completion.${domain}/api/2017/suggestions`);
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

    return (json?.suggestions || [])
      .map(x => x?.value)
      .filter(Boolean)
      .slice(0, 10);
  } catch {
    // For trust, do not silently use US suggestions for another marketplace.
    return [];
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim().slice(0, 120);

  const requestedDomain = searchParams.get("domain") || "amazon.com";
  const domain = ALLOWED_DOMAINS.has(requestedDomain)
    ? requestedDomain
    : "amazon.com";

  if (!q) {
    return NextResponse.json(
      { error: "MISSING_QUERY" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!hasKey()) {
    return NextResponse.json(
      { error: "NO_API_KEY" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  let books = [];

  try {
    books = await searchBooks(q, domain);
  } catch (e) {
    return NextResponse.json(
      {
        error: "SEARCH_FAILED",
        detail: String(e?.message || e)
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Keyword autocomplete is isolated here so Micro-Niche stays exactly as before.
  const suggestions = await withTimeout(
    keywordSuggestions(q, domain),
    5000,
    []
  );

  try {
    // Previous route measured only 3 books.
    // 5 measurements make "High confidence" actually reachable.
    await withTimeout(
      enrichWithBsr(books, domain, 5),
      35000,
      null
    );
  } catch {
    // Keep partial results instead of fabricating missing BSR.
  }

  for (const book of books) {
    book.dailySales = bsrToDailySales(book.bsr, domain);

    // Use 120 pages only when Amazon did not return page count.
    // This is still an estimate and the UI labels it as such.
    const pages = safeNumber(book.pages) || 120;

    book.royalty = royaltyPerUnit(
      book.price,
      pages,
      {
        domain,
        ink: "black",
        large: false
      }
    );

    book.monthlyRoyalty =
      book.dailySales === null ||
      book.dailySales === undefined ||
      book.royalty === null ||
      book.royalty === undefined
        ? null
        : Math.round(book.dailySales * 30 * book.royalty);
  }

  const measured = books.filter(
    b => safeNumber(b.bsr) !== null
  );

  const priced = books.filter(
    b => safeNumber(b.price) !== null
  );

  const reviewed = books.filter(
    b => safeNumber(b.reviews) !== null
  );

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

  // IMPORTANT:
  // This is the total estimated royalty of the measured sample,
  // NOT the total revenue of the whole niche.
  const measuredMonthlyRoyalty = royaltySample.length
    ? royaltySample.reduce((sum, value) => sum + value, 0)
    : null;

  const market = marketInfo(domain);

  return NextResponse.json(
    {
      keyword: q,
      domain,
      version: "3.0.0-keywords",
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
