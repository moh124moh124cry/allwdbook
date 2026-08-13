import { hasGroq, seedKeywords } from "../../../lib/groq";
import { checkRateLimit, rateLimitResponse } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

const VERSION = "2.1.0";
const MAX_QUERY_LENGTH = 120;
const MAX_LIMIT = 20;

function out(obj, code = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status: code,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

export async function GET(req) {
  const rate = checkRateLimit(req, {
    name: "ai-keywords",
    limit: 6,
    windowMs: 60_000
  });

  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  let q = "";
  let limit = 15;

  try {
    const u = new URL(req.url);

    q = String(u.searchParams.get("q") || "")
      .trim()
      .slice(0, MAX_QUERY_LENGTH);

    const requestedLimit = Number(u.searchParams.get("limit") || 15);

    if (Number.isFinite(requestedLimit)) {
      limit = Math.max(1, Math.min(Math.floor(requestedLimit), MAX_LIMIT));
    }
  } catch (e) {
    return out({
      version: VERSION,
      stage: "url",
      error: "BAD_URL",
      rows: []
    }, 400);
  }

  if (q.length < 2) {
    return out({
      version: VERSION,
      stage: "query",
      error: "MISSING_QUERY",
      rows: []
    }, 400);
  }

  if (!hasGroq()) {
    return out({
      version: VERSION,
      stage: "key",
      provider: "groq",
      error: "NO_AI_KEY",
      rows: []
    }, 503);
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
      rows
    });
  } catch (e) {
    const detail =
      e && e.message
        ? String(e.message).slice(0, 300)
        : "UNKNOWN";

    return out({
      version: VERSION,
      stage: "generate",
      provider: "groq",
      error: "AI_FAILED",
      detail,
      rows: []
    }, 502);
  }
}
