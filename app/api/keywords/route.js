// AllWDbook v2.0.2 - keywords/route.js
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const domain = searchParams.get("domain") || "amazon.com";

  if (!q) {
    return NextResponse.json(
      { error: "MISSING_QUERY", message: "أدخل كلمة مفتاحية" },
      { status: 400 }
    );
  }

  if (!hasKey()) {
    return NextResponse.json(
      {
        error: "NO_API_KEY",
        message: "مفتاح البيانات غير مضبوط. لا نعرض أرقاماً تقديرية."
      },
      { status: 503 }
    );
  }

  let books = [];
  let suggestions = [];

  try {
    const both = await Promise.all([
      searchBooks(q, domain),
      amazonSuggestions(q, domain).catch(() => [])
    ]);
    books = both[0];
    suggestions = both[1];
  } catch (e) {
    return NextResponse.json(
      { error: "PROVIDER_FAILED", message: String(e.message || e) },
      { status: 502 }
    );
  }

  books = await enrichWithBsr(books, domain, 5);

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

  const avg = (arr, f) =>
    arr.length ? arr.reduce((s, x) => s + f(x), 0) / arr.length : null;

  const avgBsr = measured.length ? Math.round(avg(measured, b => b.bsr)) : null;
  const avgPrice = priced.length
    ? Math.round(avg(priced, b => b.price) * 100) / 100
    : null;
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
    version: "2.0.2",
    generatedAt: new Date().toISOString(),
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
