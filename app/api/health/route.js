import { NextResponse } from "next/server";
import { hasKey } from "../../../lib/provider";
import { AUDIENCES, THEMES, FORMATS, OCCASIONS, NICHE_CATEGORIES, generateNiches } from "../../../lib/niches";
import { printCost, royaltyPerUnit } from "../../../lib/estimate";

export const dynamic = "force-dynamic";

export async function GET() {
  let sample = [];
  let engineError = null;
  try {
    sample = generateNiches("coloring", 3, "health-check").map(s => s.keyword);
  } catch (e) {
    engineError = String(e.message || e);
  }

  return NextResponse.json({
    version: "2.0.0",
    hasRainforestKey: hasKey(),
    engine: {
      categories: Object.keys(NICHE_CATEGORIES || {}).length,
      audiences: (AUDIENCES || []).length,
      themes: (THEMES || []).length,
      formats: (FORMATS || []).length,
      occasions: (OCCASIONS || []).length,
      error: engineError
    },
    calculator: {
      mono60: printCost(60, false),
      mono120: Math.round(printCost(120, false) * 100) / 100,
      color100: printCost(100, true),
      royalty_12_99_120: royaltyPerUnit(12.99, 120, false)
    },
    sample,
    checkedAt: new Date().toISOString()
  });
}
