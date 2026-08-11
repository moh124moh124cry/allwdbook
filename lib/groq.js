const VERSION = "1.0.0";
const MODEL = "llama-3.3-70b-versatile";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const ALLOWED = "abcdefghijklmnopqrstuvwxyz0123456789 -'";
const TTL = 12 * 60 * 60 * 1000;

const cache = new Map();

export function hasGroq() {
  const k = process.env.GROQ_API_KEY;
  return typeof k === "string" && k.length > 10;
}

export function groqVersion() {
  return VERSION;
}

function stripEdges(s) {
  let a = 0;
  let b = s.length;
  while (a < b && s.charAt(a) === " ") a = a + 1;
  while (b > a && s.charAt(b - 1) === " ") b = b - 1;
  return s.slice(a, b);
}

function dropLeadingMarks(s) {
  const marks = "0123456789.)-*#• \t";
  let i = 0;
  while (i < s.length && marks.indexOf(s.charAt(i)) >= 0) i = i + 1;
  return s.slice(i);
}

function clean(line) {
  const low = dropLeadingMarks(String(line)).toLowerCase();
  let out = "";
  let lastSpace = false;
  for (let i = 0; i < low.length; i++) {
    const ch = low.charAt(i);
    if (ALLOWED.indexOf(ch) < 0) continue;
    if (ch === " ") {
      if (lastSpace) continue;
      lastSpace = true;
    } else {
      lastSpace = false;
    }
    out = out + ch;
  }
  return stripEdges(out);
}

function parseRows(text, limit) {
  const lines = String(text).split("\n");
  const seen = {};
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const k = clean(lines[i]);
    if (k.length < 6) continue;
    if (k.length > 70) continue;
    if (k.indexOf(" ") < 0) continue;
    if (seen[k]) continue;
    seen[k] = true;
    rows.push({ keyword: k, source: "ai" });
    if (rows.length >= limit) break;
  }
  return rows;
}

const SYSTEM = [
  "You are an Amazon KDP keyword research assistant.",
  "The user gives a book topic in any language, including Arabic.",
  "You always answer with English keywords that real buyers type on Amazon.",
  "Rules:",
  "1. Output plain lines only. No numbering, no bullets, no quotes, no extra text.",
  "2. Each line is one long tail keyword phrase of two to six words.",
  "3. Lowercase only. No punctuation except hyphen and apostrophe.",
  "4. No years, no dates, no numbers.",
  "5. No brand names and no author names.",
  "6. Focus on buyer intent phrases used for low content and coloring books.",
  "7. Never repeat a phrase."
].join(" ");

export async function seedKeywords(topic, limit) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.length < 10) throw new Error("NO_GROQ_KEY");

  const q = stripEdges(String(topic || ""));
  if (q.length < 2) throw new Error("MISSING_QUERY");

  const max = Math.min(Math.max(Number(limit) || 15, 5), 30);
  const ck = q.toLowerCase() + "|" + max;
  const hit = cache.get(ck);
  const now = Date.now();
  if (hit && now - hit.at < TTL) return hit.rows;

  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, 18000);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: "Book topic: " + q + ". Give exactly " + max + " keyword lines." }
        ]
      })
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error("GROQ_NETWORK");
  }
  clearTimeout(timer);

  if (!res.ok) throw new Error("GROQ_" + res.status);

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("GROQ_BAD_JSON");
  }

  const choices = data && data.choices ? data.choices : [];
  const first = choices.length > 0 ? choices[0] : null;
  const msg = first && first.message ? first.message : null;
  const text = msg && msg.content ? msg.content : "";

  const rows = parseRows(text, max);
  if (rows.length === 0) throw new Error("GROQ_EMPTY");

  cache.set(ck, { at: now, rows: rows });
  return rows;
}
