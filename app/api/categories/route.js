import { NextResponse } from "next/server";
import { CATEGORIES } from "../../../lib/provider";
import { bsrToDailySales } from "../../../lib/estimate";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || "amazon.com";
      const max = Number(searchParams.get("maxBsr") || 999999);

        const rows = CATEGORIES
            .filter(c => c.top100Bsr <= max)
                .map(c => ({
                      ...c,
                            salesToTop100: bsrToDailySales(c.top100Bsr, domain),
                                  difficulty: c.top100Bsr < 40000 ? "صعبة" : c.top100Bsr < 80000 ? "متوسطة" : "سهلة"
                                      }))
                                          .sort((a, b) => b.top100Bsr - a.top100Bsr);

                                            return NextResponse.json({ domain, count: rows.length, rows });
                                            }
                                            