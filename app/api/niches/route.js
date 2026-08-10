            import { NextResponse } from "next/server";
            import { amazonSuggestions, searchBooks, hasLiveProvider } from "../../../lib/provider";

            const seeds = {
              coloring: ["coloring book", "color by number", "bold easy coloring"],
                journal: ["journal", "guided journal", "prompt journal"],
                  planner: ["planner", "undated planner", "weekly planner"],
                    workbook: ["workbook", "activity workbook", "practice workbook"],
                      puzzle: ["puzzle book", "word search", "activity book"]
                      };

                      async function generate(cat, domain, count) {
                        const qs = seeds[cat] || seeds.coloring;
                          const lists = await Promise.all(qs.map(q => amazonSuggestions(q, domain)));
                            const merged = [...new Set(lists.flat().map(x => x.trim()).filter(Boolean))];
                              return merged.slice(0, count);
                              }

                              export async function GET(request) {
                                const { searchParams } = new URL(request.url);
                                  const cat = searchParams.get("cat") || "coloring";
                                    const domain = searchParams.get("domain") || "amazon.com";
                                      const count = Math.min(Math.max(parseInt(searchParams.get("count")) || 24, 1), 60);
                                        const validate = searchParams.get("validate") === "1";

                                          try {
                                              const keywords = await generate(cat, domain, count);

                                                  if (!validate || !hasLiveProvider()) {
                                                        return NextResponse.json({
                                                                source: "amazon-autocomplete",
                                                                        validated: false,
                                                                                rows: keywords.map(keyword => ({
                                                                                          keyword,
                                                                                                    longTail: keyword.split(/\s+/).length >= 4,
                                                                                                              demand: null,
                                                                                                                        avgBsr: null,
                                                                                                                                  resultCount: null
                                                                                                                                          }))
                                                                                                                                                });
                                                                                                                                                    }

                                                                                                                                                        // Validation is deliberately capped to control API usage.
                                                                                                                                                            const sample = keywords.slice(0, Math.min(count, 12));
                                                                                                                                                                const rows = [];
                                                                                                                                                                    for (const keyword of sample) {
                                                                                                                                                                          const books = await searchBooks(keyword, domain, 6);
                                                                                                                                                                                const ranks = books.map(b => Number(b.bsr)).filter(x => Number.isFinite(x) && x > 0);
                                                                                                                                                                                      const avgBsr = ranks.length ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length) : null;

                                                                                                                                                                                            let demand = null;
                                                                                                                                                                                                  if (avgBsr != null) {
                                                                                                                                                                                                          demand = avgBsr <= 50000 ? "high" : avgBsr <= 150000 ? "medium" : "low";
                                                                                                                                                                                                                }

                                                                                                                                                                                                                      rows.push({
                                                                                                                                                                                                                              keyword,
                                                                                                                                                                                                                                      longTail: keyword.split(/\s+/).length >= 4,
                                                                                                                                                                                                                                              demand,
                                                                                                                                                                                                                                                      avgBsr,
                                                                                                                                                                                                                                                              rankedCount: ranks.length
                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                            return NextResponse.json({
                                                                                                                                                                                                                                                                                  source: "amazon-autocomplete+rainforest",
                                                                                                                                                                                                                                                                                        validated: true,
                                                                                                                                                                                                                                                                                              rows
                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                    } catch (e) {
                                                                                                                                                                                                                                                                                                        return NextResponse.json(
                                                                                                                                                                                                                                                                                                              { error: e.message || "niche generation failed", rows: [] },
                                                                                                                                                                                                                                                                                                                    { status: 502 }
                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                          