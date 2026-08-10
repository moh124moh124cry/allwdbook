import { NextResponse } from "next/server";
import { getBookByAsin } from "../../../lib/provider";
import { monthlyRevenue, bsrToDailySales, bsrSalesRange } from "../../../lib/estimate";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
    const asin = (searchParams.get("asin") || "").trim();
      const domain = searchParams.get("domain") || "amazon.com";

        if (!asin) {
            return NextResponse.json({ error: "missing asin" }, { status: 400 });
              }

                try {
                    const b = await getBookByAsin(asin, domain);

                        if (b.mock) {
                              return NextResponse.json({
                                      ...b,
                                              domain,
                                                      dailySales: null,
                                                              dailySalesRange: null,
                                                                      monthly: { units: null, gross: null, royalty: null, estimated: true },
                                                                              checkedAt: new Date().toISOString()
                                                                                    });
                                                                                        }

                                                                                            return NextResponse.json({
                                                                                                  ...b,
                                                                                                        domain,
                                                                                                              dailySales: b.bsr ? bsrToDailySales(b.bsr, domain) : null,
                                                                                                                    dailySalesRange: b.bsr ? bsrSalesRange(b.bsr, domain) : null,
                                                                                                                          monthly: b.bsr && b.price
                                                                                                                                  ? monthlyRevenue(b.bsr, b.price, domain, 120, "black", "regular")
                                                                                                                                          : { units: null, gross: null, royalty: null, estimated: true },
                                                                                                                                                checkedAt: new Date().toISOString()
                                                                                                                                                    });
                                                                                                                                                      } catch (e) {
                                                                                                                                                          return NextResponse.json(
                                                                                                                                                                { error: e.message || "book lookup failed", asin, domain },
                                                                                                                                                                      { status: 502 }
                                                                                                                                                                          );
                                                                                                                                                                            }
                                                                                                                                                                            }
                                                                                                                                                                            