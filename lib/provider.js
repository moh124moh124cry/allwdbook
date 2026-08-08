import { MARKETS } from "./estimate";

const RAINFOREST = process.env.RAINFOREST_API_KEY;

function hash(str) {
  let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
              }
                return Math.abs(h);
                }

                // اقتراحات أمازون الحقيقية (مجانية، بدون مفتاح)
                export async function amazonSuggestions(keyword, domain = "amazon.com") {
                  const alias = {
                      "amazon.com": "amazon-intl",
                          "amazon.co.uk": "amazon-intl"
                            };
                              const url = `https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=stripbooks&prefix=${encodeURIComponent(keyword)}&limit=11&suggestion-type=KEYWORD`;
                                try {
                                    const r = await fetch(url, {
                                          headers: { "user-agent": "Mozilla/5.0" },
                                                next: { revalidate: 3600 }
                                                    });
                                                        const j = await r.json();
                                                            return (j.suggestions || []).map(s => s.value).filter(Boolean);
                                                              } catch {
                                                                  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
                                                                      return letters.slice(0, 10).map(l => `${keyword} ${l}`);
                                                                        }
                                                                        }

                                                                        // نتائج بحث الكتب: حقيقية عند وجود المفتاح، وإلا وضع تجريبي
                                                                        export async function searchBooks(keyword, domain = "amazon.com") {
                                                                          if (RAINFOREST) {
                                                                              const u = `https://api.rainforestapi.com/request?api_key=${RAINFOREST}&type=search&amazon_domain=${domain}&search_term=${encodeURIComponent(keyword)}&category_id=283155`;
                                                                                  const r = await fetch(u);
                                                                                      const j = await r.json();
                                                                                          return (j.search_results || []).slice(0, 20).map(x => ({
                                                                                                asin: x.asin,
                                                                                                      title: x.title,
                                                                                                            image: x.image,
                                                                                                                  price: x.price?.value || 0,
                                                                                                                        reviews: x.ratings_total || 0,
                                                                                                                              rating: x.rating || 0,
                                                                                                                                    bsr: x.bestsellers_rank?.[0]?.rank || 200000,
                                                                                                                                          mock: false
                                                                                                                                              }));
                                                                                                                                                }

                                                                                                                                                  const seed = hash(keyword + domain);
                                                                                                                                                    return Array.from({ length: 12 }, (_, i) => {
                                                                                                                                                        const r1 = ((seed >> (i % 12)) % 1000) / 1000;
                                                                                                                                                            return {
                                                                                                                                                                  asin: "B0" + String(seed % 100000000).padStart(8, "0") + i,
                                                                                                                                                                        title: `${keyword} — ${["Workbook", "Journal", "Planner", "Coloring Book", "Notebook", "Guide"][i % 6]} ${2024 + (i % 3)}`,
                                                                                                                                                                              image: "",
                                                                                                                                                                                    price: Math.round((7 + r1 * 15) * 100) / 100,
                                                                                                                                                                                          reviews: Math.round(r1 * 900),
                                                                                                                                                                                                rating: Math.round((3.8 + r1) * 10) / 10,
                                                                                                                                                                                                      bsr: Math.round(2000 + r1 * 480000),
                                                                                                                                                                                                            mock: true
                                                                                                                                                                                                                };
                                                                                                                                                                                                                  });
                                                                                                                                                                                                                  }

                                                                                                                                                                                                                  export const CATEGORIES = [
                                                                                                                                                                                                                    { id: "11060", path: "Books > Self-Help > Journal Writing", top100Bsr: 42000 },
                                                                                                                                                                                                                      { id: "11061", path: "Books > Crafts > Coloring Books for Grown-Ups", top100Bsr: 61000 },
                                                                                                                                                                                                                        { id: "11062", path: "Books > Business > Small Business > Bookkeeping", top100Bsr: 88000 },
                                                                                                                                                                                                                          { id: "11063", path: "Books > Health > Diets > Low Carb", top100Bsr: 35000 },
                                                                                                                                                                                                                            { id: "11064", path: "Books > Education > Study Guides > Test Prep", top100Bsr: 51000 },
                                                                                                                                                                                                                              { id: "11065", path: "Books > Religion > Islam > History", top100Bsr: 120000 },
                                                                                                                                                                                                                                { id: "11066", path: "Books > Parenting > Activities > Puzzles", top100Bsr: 74000 },
                                                                                                                                                                                                                                  { id: "11067", path: "Books > Calendars > Planners > Undated", top100Bsr: 96000 }
                                                                                                                                                                                                                                  ];

                                                                                                                                                                                                                                  export { MARKETS };
                                                                                                                                                                                                                                  