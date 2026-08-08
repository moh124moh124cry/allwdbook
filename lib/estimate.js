// تحويل ترتيب المبيعات (BSR) إلى مبيعات يومية تقديرية.
// منحنى قوى: sales = A * bsr^(-B)، معايَر تقريبياً لكل سوق.
export const MARKETS = {
  "amazon.com": { name: "الولايات المتحدة", cur: "USD", A: 120000, B: 0.86 },
    "amazon.co.uk": { name: "بريطانيا", cur: "GBP", A: 30000, B: 0.85 },
      "amazon.de": { name: "ألمانيا", cur: "EUR", A: 26000, B: 0.85 },
        "amazon.fr": { name: "فرنسا", cur: "EUR", A: 14000, B: 0.84 },
          "amazon.it": { name: "إيطاليا", cur: "EUR", A: 9000, B: 0.84 },
            "amazon.es": { name: "إسبانيا", cur: "EUR", A: 9000, B: 0.84 },
              "amazon.ca": { name: "كندا", cur: "CAD", A: 11000, B: 0.84 }
              };

              export function bsrToDailySales(bsr, domain = "amazon.com") {
                const m = MARKETS[domain] || MARKETS["amazon.com"];
                  if (!bsr || bsr <= 0) return 0;
                    const s = m.A * Math.pow(bsr, -m.B);
                      return Math.max(0, Math.round(s * 10) / 10);
                      }

                      // عائد الطباعة عند الطلب: 60% من السعر ناقص تكلفة الطباعة
                      export function royaltyPerUnit(price, pages = 120, color = false) {
                        const printCost = color ? 0.85 + pages * 0.07 : 0.85 + pages * 0.012;
                          return Math.max(0, Math.round((price * 0.6 - printCost) * 100) / 100);
                          }

                          export function monthlyRevenue(bsr, price, domain, pages, color) {
                            const units = bsrToDailySales(bsr, domain) * 30;
                              return {
                                  units: Math.round(units),
                                      gross: Math.round(units * price),
                                          royalty: Math.round(units * royaltyPerUnit(price, pages, color))
                                            };
                                            }

                                            // درجة الفرصة: طلب عالٍ + منافسة ضعيفة = درجة أعلى (0-100)
                                            export function opportunityScore({ avgBsr, competitors, avgReviews }) {
                                              const demand = Math.max(0, 100 - Math.log10(Math.max(avgBsr, 1)) * 14);
                                                const comp = Math.min(100, Math.log10(Math.max(competitors, 1)) * 22 + Math.log10(Math.max(avgReviews, 1)) * 12);
                                                  return Math.max(0, Math.min(100, Math.round(demand * 0.65 + (100 - comp) * 0.35)));
                                                  }
                                                  