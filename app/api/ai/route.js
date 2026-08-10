/* app/api/ai/route.js — v1.0.1 */

export const dynamic = "force-dynamic";

export async function GET(req) {
  let q = "";
  let limit = 15;

  try {
    const { searchParams } = new URL(req.url);
    q = (searchParams.get("q") || "").trim();
    limit = Math.min(30, Math.max(5, Number(searchParams.get("limit") || 15)));
  } catch (e) {
    return Response.json({ stage: "url", error: "BAD_URL", detail: String(e), rows: [] });
  }

  if (!q) {
    return Response.json({
      stage: "ok",
      version: "1.0.1",
      error: "MISSING_QUERY",
      message: "اكتب موضوعا اولا.",
      rows: []
    });
  }

  let mod;
  try {
    mod = await import("../../../lib/gemini");
  } catch (e) {
    return Response.json({ stage: "import", error: "IMPORT_FAILED", detail: String(e), rows: [] });
  }

  if (!mod.hasGemini()) {
    return Response.json({
      stage: "key",
      version: "1.0.1",
      error: "NO_GEMINI_KEY",
      message: "مفتاح Gemini غير مضبوط على الخادم.",
      rows: []
    });
  }

  try {
    const rows = await mod.seedKeywords(q, limit);
    return Response.json({
      stage: "ok",
      version: "1.0.1",
      topic: q,
      source: "gemini",
      status: "suggested",
      note: "اقتراحات مولدة اليا - غير مؤكدة من امازون.",
      count: rows.length,
      rows
    });
  } catch (e) {
    return Response.json({
      stage: "generate",
      error: "AI_FAILED",
      detail: String((e && e.message) || e),
      rows: []
    });
  }
}
