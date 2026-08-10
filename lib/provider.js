import { MARKETS } from "./estimate";

const RAINFOREST = process.env.RAINFOREST_API_KEY || "";
const API = "https://api.rainforestapi.com/request";

export function hasKey() {
  return RAINFOREST.length > 10;
}

const CACHE = new Map();
const TTL = 1000 * 60 * 60 * 6;

function cacheGet(k) {
  const v = CACHE.get(k);
  if (!v) return undefined;
  if (Date.now() - v.t > TTL) {
    CACHE.delete(k);
    return undefined;
  }
  return v.d;
}

function cacheSet(k, d) {
  if (CACHE.size > 500) CACHE.clear();
  CACHE.set(k, { t: Date.now(), d });
  return d;
}

async function callRainforest(params) {
  if (!hasKey()) throw new Error("NO_API_KEY");
  const u = new URL(API);
  u.searchParams.set("api_key", RAINFOREST);
  for (const k of Object.keys(params)) u.searchParams.set(k, String(params[k]));
  const r = await fetch(u.toString(), { cache: "no-store" });
  if (!r.ok) throw new Error("RAINFOREST_HTTP_" + r.status);
  return r.json();
}

function pagesFrom(product) {
  const specs = product.specifications || [];
  const hit = specs.find(s => /print length|pages|صفحات/i.test(s.name || ""));
  const n = hit ? parseInt(String(hit.value).replace(/[^0-9]/g, ""), 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function bestRank(product) {
  const ranks = (product.bestsellers_rank || []).map(x => x.rank).filter(Boolean);
  return ranks.length ? Math.min.apply(null, ranks) : null;
}

export async function amazonSuggestions(keyword) {
  const key = "sug:" + keyword;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  try {
    const u = "https://completion.amazon.com/api/2017/suggestions" +
      "?mid=ATVPDKIKX0DER&alias=stripbooks&limit=11&suggestion-type=KEYWORD&prefix=" +
      encodeURIComponent(keyword);
    const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0" }, cache: "no-store" });
    const j = await r.json();
    const out = (j.suggestions || []).map(s => s.value).filter(Boolean);
    return cacheSet(key, out);
  } catch {
    return [];
  }
}

export async function searchBooks(keyword, domain = "amazon.com") {
  const key = "srch:" + domain + ":" + keyword.toLowerCase();
  const c = cacheGet(key);
  if (c !== undefined) return c;
  const j = await callRainforest({
    type: "search",
    amazon_domain: domain,
    search_term: keyword,
    category_id: "283155"
  });
  const seen = new Set();
  const rows = [];
  for (const x of (j.search_results || [])) {
    if (!x.asin || seen.has(x.asin)) continue;
    seen.add(x.asin);
    rows.push({
      asin: x.asin,
      title: x.title || "",
      image: x.image || "",
      link: x.link || ("https://www." + domain + "/dp/" + x.asin),
      price: typeof x.price?.value === "number" ? x.price.value : null,
      reviews: typeof x.ratings_total === "number" ? x.ratings_total : null,
      rating: typeof x.rating === "number" ? x.rating : null,
      bsr: null,
      pages: null,
      source: "search"
    });
    if (rows.length >= 20) break;
  }
  return cacheSet(key, rows);
}

export async function getBookByAsin(asin, domain = "amazon.com") {
  const key = "prod:" + domain + ":" + asin;
  const c = cacheGet(key);
  if (c !== undefined) return c;
  const j = await callRainforest({ type: "product", amazon_domain: domain, asin });
  const p = j.product || {};
  const out = {
    asin,
    title: p.title || null,
    image: p.main_image?.link || "",
    link: p.link || ("https://www." + domain + "/dp/" + asin),
    price: p.buybox_winner?.price?.value ?? p.price?.value ?? null,
    reviews: typeof p.ratings_total === "number" ? p.ratings_total : null,
    rating: typeof p.rating === "number" ? p.rating : null,
    bsr: bestRank(p),
    pages: pagesFrom(p),
    categories: (p.bestsellers_rank || []).map(r => ({ name: r.category, rank: r.rank })),
    source: "product"
  };
  return cacheSet(key, out);
}

export async function enrichWithBsr(books, domain = "amazon.com", limit = 5) {
  const head = books.slice(0, limit);
  const details = await Promise.all(head.map(b =>
    getBookByAsin(b.asin, domain).catch(() => null)
  ));
  details.forEach((d, i) => {
    if (!d) return;
    head[i].bsr = d.bsr;
    head[i].pages = d.pages;
    if (head[i].price === null) head[i].price = d.price;
    head[i].source = d.bsr === null ? "search" : "live";
  });
  return books;
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

export async function realTop100Bsr(categoryId, domain = "amazon.com") {
  if (!hasKey()) return null;
  try {
    const jb = await callRainforest({
      type: "bestsellers",
      amazon_domain: domain,
      category_id: categoryId,
      page: 2
    });
    const list = jb.bestsellers || [];
    const last = list[list.length - 1];
    if (!last?.asin) return null;
    const d = await getBookByAsin(last.asin, domain);
    return d.bsr;
  } catch {
    return null;
  }
}

export { MARKETS };
