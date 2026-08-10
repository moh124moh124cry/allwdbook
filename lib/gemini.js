/* lib/gemini.js — v1.0.0
   طبقة التوليد فقط. Gemini يقترح كلمات، ولا يُنتج أي رقم إطلاقاً.
   كل رقم في هذه الأداة مصدره أمازون حصراً. */

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

async function ask(prompt, ms = 18000) {
  if (!hasGemini()) throw new Error("NO_GEMINI_KEY");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
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
    const txt = j && j.candidates && j.candidates[0] && j.candidates[0].content
      && j.candidates[0].content.parts && j.candidates[0].content.parts[0]
      ? j.candidates[0].content.parts[0].text : "";
    if (!txt) throw new Error("GEMINI_EMPTY");
    return txt;
  } finally {
    clearTimeout(timer);
  }
}

function parseList(txt) {
  try {
    const j = JSON.parse(txt);
    if (Array.isArray(j)) return j;
    if (j && Array.isArray(j.keywords)) return j.keywords;
    if (j && Array.isArray(j.rows)) return j.rows;
  } catch (e) {}
  return String(txt)
    .split("\n")
    .map(s => s.replace(/^[\s\-\*\d\.\)"'\[\]]+/, "").replace(/["',\]]+$/, "").trim())
    .filter(Boolean);
}

/* تنظيف صارم:
   - إنجليزية فقط
   - 2 إلى 8 كلمات
   - رفض أي كلمة تنتهي برقم (هذا كان عيب المولّد القديم)
   - بلا تكرار */
function clean(list, limit) {
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    let s = String(raw || "")
      .toLowerCase()
      .replace(//g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!s) continue;
    if (/\d\s*$/.test(s)) continue;
    const w = s.split(" ").filter(Boolean).length;
    if (w < 2 || w > 8) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push({ keyword: s, words: w, longTail: w >= 4, status: "suggested", source: "gemini" });
    if (out.length >= limit) break;
  }
  return out;
}

export async function seedKeywords(topic, limit = 15) {
  const key = "seed:" + topic.toLowerCase() + ":" + limit;
  const hit = cacheGet(key);
  if (hit) return hit;

  const prompt =
    'You are an Amazon KDP low-content book market researcher.\n' +
    'The user topic may be written in Arabic, English, or French: "' + topic + '"\n\n' +
    'Return ' + (limit + 8) + ' realistic ENGLISH Amazon search phrases that real buyers would type when looking for a low-content or no-content book on this topic.\n\n' +
    'Strict rules:\n' +
    '- English only.\n' +
    '- Between 2 and 8 words each.\n' +
    '- NEVER append numbers (bad: "log book 1", "journal 2").\n' +
    '- No brand names, no ISBN, no years.\n' +
    '- Favor specific buyer intent (audience, occasion, style, format).\n' +
    '- No duplicates, no near-duplicates.\n\n' +
    'Return ONLY a JSON array of strings. Nothing else.';

  const txt = await ask(prompt);
  const rows = clean(parseList(txt), limit);
  if (rows.length) cacheSet(key, rows);
  return rows;
}
