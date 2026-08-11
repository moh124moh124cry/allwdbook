import { hasGroq, seedKeywords } from "../../../lib/groq";

export const dynamic = "force-dynamic";

const VERSION = "2.0.0";

function out(obj, code) {
  return new Response(JSON.stringify(obj), {
    status: code || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

export async function GET(req) {
  let q = "";
  let limit = 15;

  try {
    const u = new URL(req.url);
    q = u.searchParams.get("q") || "";
    limit = Number(u.searchParams.get("limit") || 15);
  } catch (e) {
    return out({ version: VERSION, stage: "url", error: "BAD_URL", rows: [] });
  }

  if (!q || q.length < 2) {
    return out({ version: VERSION, stage: "query", error: "MISSING_QUERY", rows: [] });
  }

  if (!hasGroq()) {
    return out({ version: VERSION, stage: "key", provider: "groq", error: "NO_AI_KEY", rows: [] });
  }

  try {
    const rows = await seedKeywords(q, limit);
    return out({
      version: VERSION,
      stage: "ok",
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      trust: "suggested",
      measured: false,
      count: rows.length,
      rows: rows
    });
  } catch (e) {
    const detail = e && e.message ? String(e.message) : "UNKNOWN";
    return out({
      version: VERSION,
      stage: "generate",
      provider: "groq",
      error: "AI_FAILED",
      detail: detail,
      rows: []
    });
  }
}
