/* lib/gemini.js — v1.0.2
   نسخة خالية من التعابير النمطية بالكامل.
   Gemini يقترح كلمات فقط. لا يُنتج أي رقم إطلاقاً. */

const KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.0-flash";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";

export function hasGemini() {
  return KEY.length > 10;
}

const CACHE = new Map();
const TTL = 12 * 60 * 60 * 1000;

function cacheGet(k) {
  const e = CACHE.get(k);
  if (!e) return null;
  if (Date.now() - e.t > TTL) { CACHE.delete(k); return null; }
  return e.v;
}

function cacheSet(k, v) {
  if (CACHE.size > 400) CACHE.clear();
  CACHE.set(k, { t: Date.now(), v });
}

async function ask(prompt, ms) {
  if (!hasGemini()) throw new Error("NO_GEMINI_KEY");
  const wait = ms || 18000;
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, wait);
  try {
    const res = await fetch(ENDPOINT + "?key=" + encodeURIComponent(KEY), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.95,
          maxOutputTokens: 900,
          responseMimeType: "application/json"
        }
      }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error("GEMINI_" + res.status);
    const j = await res.json();
    let txt = "";
    if (j && j.candidates && j.candidates[0] && j.candidates[0].content) {
      const parts = j.candidates[0].content.parts;
      if (parts && parts[0] && parts[0].text) txt = parts[0].text;
    }
    if (!txt) throw new Error("GEMINI_EMPTY");
    return txt;
  } finally {
    clearTimeout(timer);
  }
}

const ALLOWED = "abcdefghijklmnopqrstuvwxyz0123456789 -'";
const LEAD_JUNK = " \t-*.)(\"'0123456789";
const TAIL_JUNK = " \t,;.\"'";

function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}

function stripEdges(input) {
  let s = String(input || "").trim();
  while (s.length > 0 && LEAD_JUNK.indexOf(s.charAt(0)) >= 0) s = s.slice(1);
  while (s.length > 0 && TAIL_JUNK.indexOf(s.charAt(s.length - 1)) >= 0) s = s.slice(0, -1);
  return s.trim();
}

function normalize(input) {
  const src = String(input || "").toLowerCase();
  let out = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src.charAt(i);
    out += ALLOWED.indexOf(ch) >= 0 ? ch : " ";
  }
  return out.split(" ").filter(Boolean).join(" ");
}

function parseList(txt) {
  try {
    const j = JSON.parse(txt);
    if (Array.isArray(j)) return j;
    if (j && Array.isArray(j.keywords)) return j.keywords;
    if (j && Array.isArray(j.rows)) return j.rows;
  } catch (e) {}
  return String(txt).split("\n").map(stripEdges).filter(Boolean);
}

function clean(list, limit) {
  const out = [];
  const seen = {};
  for (let i = 0; i < list.length; i++) {
    const s = normalize(list[i]);
    if (!s) continue;
    if (isDigit(s.charAt(s.length - 1))) continue;
    const words = s.split(" ").filter(Boolean).length;
    if (words < 2 || words > 8) continue;
    if (seen[s]) continue;
    seen[s] = true;
    out.push({
      keyword: s,
      words: words,
      longTail: words >= 4,
      status: "suggested",
      source: "gemini"
    });
    if (out.length >= limit) break;
  }
  return out;
}

export async function seedKeywords(topic, limit) {
  const max = limit || 15;
  const key = "seed:" + String(topic).toLowerCase() + ":" + max;
  const hit = cacheGet(key);
  if (hit) return hit;

  const lines = [
    "You are an Amazon KDP low-content book market researcher.",
    "The user topic may be written in Arabic, English, or French: " + topic,
    "",
    "Return " + (max + 8) + " realistic ENGLISH Amazon search phrases that real buyers would type when looking for a low-content or no-content book on this topic.",
    "",
    "Strict rules:",
    "- English only.",
    "- Between 2 and 8 words each.",
    "- Never append numbers. Bad examples: log book 1, journal 2.",
    "- No brand names, no ISBN, no years.",
    "- Favor specific buyer intent: audience, occasion, style, format.",
    "- No duplicates and no near duplicates.",
    "",
    "Return ONLY a JSON array of strings. Nothing else."
  ];

  const txt = await ask(lines.join("\n"));
  const rows = clean(parseList(txt), max);
  if (rows.length > 0) cacheSet(key, rows);
  return rows;
}
