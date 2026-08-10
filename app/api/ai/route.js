/* app/api/ai/route.js — v1.0.0
   يُرجع اقتراحات نصية فقط. لا يُرجع BSR ولا مبيعات ولا أرباح.
   استهلاك رصيد Rainforest: صفر. */

import { hasGemini, seedKeywords } from "../../../lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(30, Math.max(5, Number(searchParams.get("limit") || 15)));

  const base = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    source: "gemini",
    status: "suggested",
    note: "اقتراحات مولّدة آلياً — غير مؤكدة من أمازون. اضغط أي كلمة لقياسها بأرقام حقيقية."
  };

  if (!q) {
    return Response.json({ ...base, error: "MISSING_QUERY", message: "اكتب موضوعاً أولاً.", rows: [] });
  }

  if (!hasGemini()) {
    return Response.json({ ...base, error: "NO_GEMINI_KEY", message: "مفتاح Gemini غير مضبوط على الخادم.", rows: [] });
  }

  try {
    const rows = await seedKeywords(q, limit);
    return Response.json({ ...base, topic: q, count: rows.length, rows });
  } catch (e) {
    const msg = String((e && e.message) || e);
    return Response.json({
      ...base,
      error: "AI_FAILED",
      detail: msg,
      message: msg.indexOf("abort") >= 0 ? "انتهت المهلة. حاول مرة أخرى." : "تعذّر التوليد الآن.",
      rows: []
    });
  }
}
