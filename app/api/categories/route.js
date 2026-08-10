  import { NextResponse } from "next/server";
  import { CATEGORIES } from "../../../lib/provider";

  export async function GET(req) {
    const { searchParams } = new URL(req.url);
      const domain = searchParams.get("domain") || "amazon.com";

        // We intentionally do NOT fabricate "Top 100 BSR", sales/day, or difficulty.
          // These are reference category ideas until a live category-rank source is added.
            const rows = CATEGORIES.map(c => ({
                ...c,
                    source: "reference",
                        top100Bsr: null,
                            salesToTop100: null,
                                difficulty: null
                                  }));

                                    return NextResponse.json({
                                        domain,
                                            count: rows.length,
                                                rows,
                                                    note: "Reference category paths only; no fabricated BSR or sales estimates."
                                                      });
                                                      }
                                                      