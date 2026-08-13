// AllWDbook v3.0.0 — live Amazon data provider
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

const MARKETPLACE_IDS = {
  "amazon.com": "ATVPDKIKX0DER",
  "amazon.co.uk": "A1F83G8C2ARO7P",
  "amazon.de": "A1PA6795UKMFR9",
  "amazon.fr": "A13V1IB3VIYZZH",
  "amazon.it": "APJ6JRA9NG5V4",
  "amazon.es": "A1RKKUPIHCS9HS",
  "amazon.ca": "A2EUQ1WTGCTBG2"
};

export function marketplaceId(domain = "amazon.com") {
  return MARKETPLACE_IDS[domain] || MARKETPLACE_IDS["amazon.com"];
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
  const safeDomain = MARKETPLACE_IDS[domain] ? domain : "amazon.com";
  const ck = "sug:" + safeDomain + ":" + prefix;
  const hit = cacheGet(ck);
  if (hit) return hit;

  try {
    const host = "https://completion." + safeDomain;
    const u = host + "/api/2017/suggestions"
      + "?mid=" + encodeURIComponent(marketplaceId(safeDomain))
      + "&alias=stripbooks&limit=11"
      + "&suggestion-type=KEYWORD&prefix=" + encodeURIComponent(prefix);

    const r = await fetch(u, {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!r.ok) return [];

    const j = await r.json();
    const out = (j?.suggestions || [])
      .map(s => s?.value)
      .filter(Boolean)
      .slice(0, 10);

    cacheSet(ck, out);
    return out;
  } catch (e) {
    // Never silently fall back to another marketplace: that would mislabel data.
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
      asin,
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
    asin
  });
  const p = j?.product;
  if (!p) return null;
  const rank = bestRank(p);
  return {
    asin,
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
  const jobs = [];
  for (let i = 0; i < n; i++) {
    jobs.push(
      getBookByAsin(books[i].asin, domain)
        .then(d => {
          if (d && d.bsr !== null) {
            books[i].bsr = d.bsr;
            books[i].pages = d.pages;
            books[i].source = "live";
          }
        })
        .catch(() => {})
    );
  }
  await Promise.all(jobs);
  return books;
}

export const CATEGORIES = [
  { id: "11060", path: "Books > Self-Help > Journal Writing", static: true },
  { id: "11061", path: "Books > Crafts > Coloring Books for Grown-Ups", static: true },
  { id: "11062", path: "Books > Business > Small Business > Bookkeeping", static: true },
  { id: "11063", path: "Books > Health > Diets > Low Carb", static: true },
  { id: "11064", path: "Books > Education > Study Guides > Test Prep", static: true },
  { id: "11065", path: "Books > Religion > Islam > History", static: true },
  { id: "11066", path: "Books > Parenting > Activities > Puzzles", static: true },
  { id: "11067", path: "Books > Calendars > Planners > Undated", static: true }
];
