// AllWDbook v2.0.1 - provider.js
const KEY = process.env.RAINFOREST_API_KEY || "";

export function hasKey() {
  return KEY.length > 5;
}

const CACHE = new Map();
const TTL = 6 * 60 * 60 * 1000;

function cacheGet(k) {
  const hit = CACHE.get(k);
  if (!hit) return null;
  if (Date.now() - hit.t > TTL) { CACHE.delete(k); return null; }
  return hit.v;
}

function cacheSet(k, v) {
  if (CACHE.size > 500) CACHE.clear();
  CACHE.set(k, { t: Date.now(), v });
}

export function cacheSize() { return CACHE.size; }

function num(v) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}

async function callRainforest(params) {
  if (!hasKey()) throw new Error("NO_API_KEY");
  const url = new URL("https://api.rainforestapi.com/request");
  url.searchParams.set("api_key", KEY);
  for (const k of Object.keys(params)) {
    if (params[k] !== undefined && params[k] !== null) {
      url.searchParams.set(k, String(params[k]));
    }
  }
  const ck = "rf:" + JSON.stringify(params);
  const hit = cacheGet(ck);
  if (hit) return hit;
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("RAINFOREST_" + res.status);
  const json = await res.json();
  cacheSet(ck, json);
  return json;
}

export function pagesFrom(product) {
  const list = []
    .concat(product?.specifications || [])
    .concat(product?.attributes || []);
  for (const s of list) {
    if (/print length|pages|صفحات/i.test(String(s?.name || ""))) {
      const m = String(s?.value || "").match(/\d+/);
      if (m) {
        const p = Number(m[0]);
        if (p > 0 && p < 3000) return p;
      }
    }
  }
  return null;
}

export function bestRank(product) {
  const ranks = product?.bestsellers_rank || [];
  const clean = [];
  for (const r of ranks) {
    const v = num(r?.rank);
    if (v === null) continue;
    const nm = String(r?.category || r?.name || "").trim();
    clean.push({ rank: v, name: nm });
  }
  if (!clean.length) return null;
  const main = clean.find(x => /^books$/i.test(x.name));
  if (main) return main.rank;
  return Math.max.apply(null, clean.map(x => x.rank));
}

export async function amazonSuggestions(prefix, domain = "amazon.com") {
  const ck = "sug:" + domain + ":" + prefix;
  const hit = cacheGet(ck);
  if (hit) return hit;
  try {
    const u = "https://completion.amazon.com/api/2017/suggestions"
      + "?mid=ATVPDKIKX0DER&alias=stripbooks&limit=11"
      + "&suggestion-type=KEYWORD&prefix=" + encodeURIComponent(prefix);
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const out = (j?.suggestions || [])
      .map(s => s?.value)
      .filter(Boolean)
      .slice(0, 10);
    cacheSet(ck, out);
    return out;
  } catch (e) {
    return [];
  }
}

export async function searchBooks(term, domain = "amazon.com") {
  const j = await callRainforest({
    type: "search",
    amazon_domain: domain,
    search_term: term,
    category_id: "283155"
  });
  const raw = j?.search_results || [];
  const seen = new Set();
  const out = [];
  for (const x of raw) {
    const asin = x?.asin;
    if (!asin || seen.has(asin)) continue;
    seen.add(asin);
    out.push({
      asin: asin,
      title: x?.title || null,
      image: x?.image || null,
      price: num(x?.price?.value),
      reviews: num(x?.ratings_total),
      rating: num(x?.rating),
      bsr: null,
      pages: null,
      source: "none"
    });
    if (out.length >= 20) break;
  }
  return out;
}

export async function getBookByAsin(asin, domain = "amazon.com") {
  const j = await callRainforest({
    type: "product",
    amazon_domain: domain,
    asin: asin
  });
  const p = j?.product;
  if (!p) return null;
  const rank = bestRank(p);
  return {
    asin: asin,
    title: p?.title || null,
    image: p?.main_image?.link || null,
    price: num(p?.buybox_winner?.price?.value) || num(p?.price?.value),
    reviews: num(p?.ratings_total),
    rating: num(p?.rating),
    bsr: rank,
    pages: pagesFrom(p),
    categories: (p?.categories || []).map(c => c?.name).filter(Boolean),
    source: rank === null ? "none" : "live"
  };
}

export async function enrichWithBsr(books, domain = "amazon.com", limit = 5) {
  const n = Math.min(limit, books.length);
  for (let i = 0; i < n; i++) {
    try {
      const d = await getBookByAsin(books[i].asin, domain);
      if (d && d.bsr !== null) {
        books[i].bsr = d.bsr;
        books[i].pages = d.pages;
        books[i].source = "live";
      }
    } catch (e) {
      // نتجاهل الفشل ونترك القيمة null
    }
  }
  return books;
}

export const CATEGORIES = [
  { id: "11060", path: "Books > Self-Help > Journal Writing", bsrCap: 42000, static: true },
  { id: "11061", path: "Books > Crafts > Coloring Books for Grown-Ups", bsrCap: 61000, static: true },
  { id: "11062", path: "Books > Business > Small Business > Bookkeeping", bsrCap: 88000, static: true },
  { id: "11063", path: "Books > Health > Diets > Low Carb", bsrCap: 35000, static: true },
  { id: "11064", path: "Books > Education > Study Guides > Test Prep", bsrCap: 51000, static: true },
  { id: "11065", path: "Books > Religion > Islam > History", bsrCap: 120000, static: true },
  { id: "11066", path: "Books > Parenting > Activities > Puzzles", bsrCap: 74000, static: true },
  { id: "11067", path: "Books > Calendars > Planners > Undated", bsrCap: 96000, static: true }
];

export async function realTop100Bsr(categoryId, domain = "amazon.com") {
  try {
    const j = await callRainforest({
      type: "bestsellers",
      amazon_domain: domain,
      category_id: categoryId,
      page: 2
    });
    const list = j?.bestsellers || [];
    const last = list[list.length - 1];
    return bestRank(last) || null;
  } catch (e) {
    return null;
  }
}
