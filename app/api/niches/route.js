import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
    const cat = searchParams.get("cat") || "coloring";
      const count = parseInt(searchParams.get("count")) || 24;
        const validate = searchParams.get("validate");

          const prefixes = cat === "coloring" ? ["kids", "adult", "toddler", "mandala"] : ["daily", "weekly", "funny", "blank"];
            const suffixes = cat === "coloring" ? ["coloring book", "coloring pages", "color by number"] : ["log book", "journal", "tracker"];

              const rows = Array.from({ length: count }).map((_, i) => {
                  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
                      const s = suffixes[Math.floor(Math.random() * suffixes.length)];
                          const keyword = `${p} ${s} ${i + 1}`;
                              const demands = ["high", "medium", "low", null];
                                  return {
                                        keyword,
                                              longTail: Math.random() > 0.5,
                                                    demand: validate ? demands[Math.floor(Math.random() * demands.length)] : null,
                                                        };
                                                          });

                                                            return NextResponse.json({ rows });
                                                            }
                                                            