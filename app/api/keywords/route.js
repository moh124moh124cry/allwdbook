import { NextResponse } from "next/server";
import { amazonSuggestions, searchBooks, enrichWithBsr, hasKey } from "../../../lib/provider";
import { bsrToDailySales, monthlyRevenue, opportunityScore, confidenceLevel } from "../../../lib/estimate";

export const dynamic = "force-dynamic";
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const kw = (searchParams.get("q") || "").trim();
  const domain = searchParams.get("domain") || "amazon.com";
  const depth = Math.min(Number(searchParams.get("depth") || 5), 10);

  if (!kw) return NextResponse.json({ error: "MISSING_QUERY" }, { status: 400 });

  if (!hasKey()) {
    return NextResponse.json({
      error: "NO_API_KEY",
      message: "لم يُضبط RAINFOREST_API_KEY على الخادم. لا تُعرض أي بيانات تقديرية بديلة."
    }, { status: 503 });
  }

  let books = [];
  let suggestions = [];

  try {
    const r = await Promise.all([amazonSuggestions(kw), searchBooks(kw, domain)]);
    suggestions = r[0];
    books = await enrichWithBsr(r[1], domain, depth);
  } catch (e) {
    return NextResponse.json({ error: "UPSTREAM_FAILED", detail: String(e.message || e) }, { status: 502 });
  }

  const live = books.filter(b => Number.isFinite(b.bsr));
  const prices = books.map(b => b.price).filter(Number.isFinite);
  const revs = books.map(b => b.reviews).filter(Number.isFinite);

  const avgBsr = live.length ? Math.round(avg(live.map(b => b.bsr))) : null;
  const avgPrice = prices.length ? Math.round(avg(prices) * 100) / 100 : null;
  const avgReviews = revs.length ? Math.round(avg(revs)) : null;
  const avgDailySales = live.length ? Math.round(avg(live.map(b => bsrToDailySales(b.bsr, domain))) * 10) / 10 : null;

  let nicheMonthlyRoyalty = null;
  if (live.length) {
    let sum = 0;
    for (const b of live) {
      const m = monthlyRevenue(b.bsr, b.price, domain, b.pages || 120, false);
      if (m && Number.isFinite(m.royalty)) sum += m.royalty;
    }
    nicheMonthlyRoyalty = Math.round(sum);
  }

  return NextResponse.json({
    keyword: kw,
    domain,
    generatedAt: new Date().toISOString(),
    confidence: {
      measuredBooks: live.length,
      totalBooks: books.length,
      level: confidenceLevel(live.length),
      note: "BSR يُقرأ فعلياً لأول " + depth + " كتب فقط لتوفير الرصيد. الباقي غير مقاس."
    },
    metrics: {
      avgBsr,
      avgPrice,
      avgReviews,
      avgDailySales,
      nicheMonthlyRoyalty,
      score: opportunityScore({ avgBsr, competitors: books.length * 40, avgReviews })
    },
    suggestions,
    books
  });
}
