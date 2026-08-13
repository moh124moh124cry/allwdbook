import { NextResponse } from "next/server";
import { hasKey } from "../../../lib/provider";
import { hasGroq } from "../../../lib/groq";
import {
  NICHE_CATEGORIES,
  generateNiches
} from "../../../lib/niches";
import {
  printCost,
  royaltyPerUnit
} from "../../../lib/estimate";

export const dynamic = "force-dynamic";

const VERSION = "3.1.0";

export async function GET() {
  let nicheOk = true;
  let nicheSample = [];
  let nicheError = null;

  let calculatorOk = true;
  let calculator = {};
  let calculatorError = null;

  try {
    nicheSample = generateNiches(
      "coloring",
      3,
      "health-check"
    ).map(item => item.keyword);
  } catch (e) {
    nicheOk = false;
    nicheError = String(
      e && e.message ? e.message : e
    ).slice(0, 200);
  }

  try {
    const mono120 = printCost(120, {
      domain: "amazon.com",
      ink: "black",
      large: false
    });

    const royalty = royaltyPerUnit(
      12.99,
      120,
      {
        domain: "amazon.com",
        ink: "black",
        large: false
      }
    );

    calculator = {
      marketplace: "amazon.com",
      pages: 120,
      listPrice: 12.99,
      printCost:
        typeof mono120 === "number"
          ? Math.round(mono120 * 100) / 100
          : null,
      royalty:
        typeof royalty === "number"
          ? Math.round(royalty * 100) / 100
          : null
    };
  } catch (e) {
    calculatorOk = false;
    calculatorError = String(
      e && e.message ? e.message : e
    ).slice(0, 200);
  }

  const healthy =
    nicheOk &&
    calculatorOk &&
    hasKey() &&
    hasGroq();

  return NextResponse.json(
    {
      app: "AllWDbook",
      version: VERSION,
      status: healthy ? "ok" : "degraded",

      services: {
        rainforestConfigured: hasKey(),
        groqConfigured: hasGroq(),
        nicheEngine: {
          ok: nicheOk,
          categories: Object.keys(
            NICHE_CATEGORIES || {}
          ).length,
          sample: nicheSample,
          error: nicheError
        },
        calculator: {
          ok: calculatorOk,
          sample: calculator,
          error: calculatorError
        }
      },

      checkedAt: new Date().toISOString()
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
