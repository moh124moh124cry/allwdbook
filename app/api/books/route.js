import { NextResponse } from "next/server";
import { getBookByAsin, hasKey } from "../../../lib/provider";
import { bsrToDailySales, monthlyRevenue } from "../../../lib/estimate";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const asin = (searchParams.get("asin") || "").trim().toUpperCase();
  const domain = searchParams.get("domain") || "amazon.com";

  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ error: "BAD_ASIN", message: "الرمز يجب أن يكون 10 خانات من الرابط بعد /dp/" }, { status: 400 });
  }

  if (!hasKey()) return NextResponse.json({ error: "NO_API_KEY" }, { status: 503 });

  let b;
  try {
    b = await getBookByAsin(asin, domain);
  } catch (e) {
    return NextResponse.json({ error: "UPSTREAM_FAILED", detail: String(e.message || e) }, { status: 502 });
  }

  if (!b.title) return NextResponse.json({ error: "NOT_FOUND", asin }, { status: 404 });

  return NextResponse.json({
    asin,
    domain,
    title: b.title,
    image: b.image,
    link: b.link,
    price: b.price,
    reviews: b.reviews,
    rating: b.rating,
    bsr: b.bsr,
    pages: b.pages,
    categories: b.categories,
    source: b.bsr === null ? "partial" : "live",
    dailySales: bsrToDailySales(b.bsr, domain),
    monthly: monthlyRevenue(b.bsr, b.price, domain, b.pages || 120, false),
    checkedAt: new Date().toISOString()
  });
}
