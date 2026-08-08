import { NextResponse } from "next/server";
import { searchBooks } from "../../../lib/provider";
import { monthlyRevenue, bsrToDailySales } from "../../../lib/estimate";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
    const asin = searchParams.get("asin");
      const domain = searchParams.get("domain") || "amazon.com";
        if (!asin) return NextResponse.json({ error: "missing asin" }, { status: 400 });

          const list = await searchBooks(asin, domain);
            const b = list[0];
              const rev = monthlyRevenue(b.bsr, b.price, domain, 120, false);

                return NextResponse.json({
                    asin,
                        domain,
                            title: b.title,
                                price: b.price,
                                    bsr: b.bsr,
                                        reviews: b.reviews,
                                            rating: b.rating,
                                                mock: b.mock,
                                                    dailySales: bsrToDailySales(b.bsr, domain),
                                                        monthly: rev,
                                                            checkedAt: new Date().toISOString()
                                                              });
                                                              }
                                                              