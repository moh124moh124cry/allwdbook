import { NextResponse } from "next/server";
import { amazonSuggestions, searchBooks } from "../../../lib/provider";
import { bsrToDailySales, opportunityScore, monthlyRevenue } from "../../../lib/estimate";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
    const kw = searchParams.get("q") || "";
      const domain = searchParams.get("domain") || "amazon.com";
        if (!kw) return NextResponse.json({ error: "missing q" }, { status: 400 });

          const [suggestions, books] = await Promise.all([
              amazonSuggestions(kw, domain),
                  searchBooks(kw, domain)
                    ]);

                      const avgBsr = Math.round(books.reduce((a, b) => a + b.bsr, 0) / (books.length || 1));
                        const avgReviews = Math.round(books.reduce((a, b) => a + b.reviews, 0) / (books.length || 1));
                          const avgPrice = Math.round((books.reduce((a, b) => a + b.price, 0) / (books.length || 1)) * 100) / 100;
                            const totalMonthly = books.reduce((a, b) => a + monthlyRevenue(b.bsr, b.price, domain, 120, false).royalty, 0);

                              return NextResponse.json({
                                  keyword: kw,
                                      domain,
                                          mock: books[0]?.mock ?? true,
                                              metrics: {
                                                    avgBsr,
                                                          avgReviews,
                                                                avgPrice,
                                                                      avgDailySales: Math.round(books.reduce((a, b) => a + bsrToDailySales(b.bsr, domain), 0) / (books.length || 1) * 10) / 10,
                                                                            nicheMonthlyRoyalty: Math.round(totalMonthly),
                                                                                  score: opportunityScore({ avgBsr, competitors: books.length * 40, avgReviews })
                                                                                      },
                                                                                          suggestions,
                                                                                              books
                                                                                                });
                                                                                                }
                                                                                                