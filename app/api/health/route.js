import { NextResponse } from "next/server";
import { hasKey } from "../../../lib/provider";
import { hasGroq } from "../../../lib/groq";
import { NICHE_CATEGORIES, generateNiches } from "../../../lib/niches";
import { printCost, royaltyPerUnit } from "../../../lib/estimate";

export const dynamic = "force-dynamic";

const VERSION = "3.2.0";

export async function GET() {
  let nicheOk = true;
  let nicheSample = [];
  let nicheError = null;

  let calculatorOk = true;
  let calculator = {};
  let calculatorError = null;

  try {
    nicheSample = generateNiches("coloring", 3, "health-check").map(item => item.keyword);
  } catch (e) {
    nicheOk = false;
    nicheError = String(e && e.message ? e.message : e).slice(0, 200);
  }

  try {
    const options = { domain: "amazon.com", ink: "black", large: false };
    const cost = printCost(120, options);
    const royalty = royaltyPerUnit(12.99, 120, options);

    calculator = {
      marketplace: "amazon.com",
      pages: 120,
      listPrice: 12.99,
      printCost: typeof cost === "number" ? Math.round(cost * 100) / 100 : null,
      royalty: typeof royalty === "number" ? Math.round(royalty * 100) / 100 : null
    };

    if (calculator.printCost === null || calculator.royalty === null) {
      calculatorOk = false;
      calculatorError = "calculator returned null";
    }
  } catch (e) {
    calculatorOk = false;
    calculatorError = String(e && e.message ? e.message : e).slice(0, 200);
  }

  const coreOk = nicheOk && calculatorOk;
  const aiOk = hasGroq();
  const marketDataOk = hasKey();

  let status = "ok";
  if (!coreOk) {
    status = "down";
  } else if (!aiOk) {
    status = "degraded";
  } else if (!marketDataOk) {
    status = "limited";
  }

  return NextResponse.json(
    {
      app: "AllWDbook",
      version: VERSION,
      status,

      summary: {
        coverDesigner: "ok",
        calculator: calculatorOk ? "ok" : "down",
        formatter: "ok",
        microNiche: nicheOk ? "ok" : "down",
        aiKeywords: aiOk ? "ok" : "disabled",
        marketData: marketDataOk ? "ok" : "not_configured"
      },

      services: {
        rainforestConfigured: marketDataOk,
        groqConfigured: aiOk,
        nicheEngine: {
          ok: nicheOk,
          categories: Object.keys(NICHE_CATEGORIES || {}).length,
          sample: nicheSample,
          error: nicheError
        },
        calculator: {
          ok: calculatorOk,
          sample: calculator,
          error: calculatorError
        }
      },

      note: "Market data is optional. The tool stays fully usable without it.",
      checkedAt: new Date().toISOString()
    },
    {
      status: coreOk ? 200 : 503,
      headers: { "Cache-Control": "no-store" }
    }
  );
}
