// AllWDbook v2.0.3 - keywords/route.js
import { NextResponse } from "next/server";
import {
  hasKey,
  searchBooks,
  enrichWithBsr,
  amazonSuggestions
} from "../../../lib/provider";
import {
  bsrToDailySales,
  royaltyPerUnit,
  opportunityScore,
  confidenceLevel
} from "../../../lib/estimate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(res => setTimeout(() => res(fallback), ms))
  ]);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const domain = searchParams.get("domain") || "amazon.com";
  const noBsr = searchParams.get("nobsr") === "1";

  if (!q) {
    return NextResponse.json({ error: "MISSING_QUERY" }, { status: 200 });
  }
  if (!hasKey()) {
    return NextResponse.json({ error: "NO_API_KEY" }, { status: 200 });
  }

  let books = [];
  let suggestions = [];
  const notes = [];

  try {
    books = await searchBooks(q, domain);
  } catch (e) {
    return NextResponse.json(
      { error: "SEARCH_FAILED", detail: String(e && e.message ? e.message : e) },
      { status: 200 }
    );
  }

  try {
    suggestions = await withTimeout(amazonSuggestions(q, domain), 5000, []);
  } catch (e) {
    suggestions = [];
  }

  if (noBsr) {
    notes.push("BSR skipped by request");
  } else {
    try {
      await withTimeout(enrichWithBsr(books, domain, 3), 25000, null);
    } catch (e) {
      notes.push("BSR failed: " + String(e && e.message ? e.message : e));
    }
  }

  for (const b of books) {
    b.dailySales = bsrToDailySales(b.bsr, domain);
    b.royalty = royaltyPerUnit(b.price, b.pages || 120, false);
    b.monthlyRoyalty =
      b.dailySales === null || b.royalty === null
        ? null
        : Math.round(b.dailySales * 30 * b.royalty);
  }

  const measured = books.filter(b => b.bsr !== null);
  const priced = books.filter(b => b.price !== null);
  const rated = books.filter(b => b.reviews !== null);
  const avg = (a, f) => (a.length ? a.reduce((s, x) => s + f(x), 0) / a.length : null);

  const avgBsr = measured.length ? Math.round(avg(measured, b => b.bsr)) : null;
  const avgPrice = priced.length ? Math.round(avg(priced, b => b.price) * 100) / 100 : null;
  const avgReviews = rated.length ? Math.round(avg(rated, b => b.reviews)) : null;
  const avgDailySales = measured.length
    ? Math.round(avg(measured, b => b.dailySales || 0) * 10) / 10
    : null;

  const nicheMonthlyRoyalty = measured
    .map(b => b.monthlyRoyalty)
    .filter(v => v !== null)
    .reduce((s, v) => s + v, 0);

  return NextResponse.json({
    keyword: q,
    domain: domain,
    version: "2.0.3",
    generatedAt: new Date().toISOString(),
    notes: notes,
    metrics: {
      avgBsr: avgBsr,
      avgPrice: avgPrice,
      avgReviews: avgReviews,
      avgDailySales: avgDailySales,
      nicheMonthlyRoyalty: measured.length ? nicheMonthlyRoyalty : null,
      score: opportunityScore({ avgBsr, avgReviews, avgPrice })
    },
    confidence: {
      totalResults: books.length,
      uniqueAsins: new Set(books.map(b => b.asin)).size,
      bsrSampleSize: measured.length,
      level: confidenceLevel(measured.length)
    },
    suggestions: suggestions,
    books: books
  });
}
