import { NextResponse } from "next/server";
import { generateNiches, NICHE_CATEGORIES } from "../../../lib/niches";
import { amazonSuggestions } from "../../../lib/provider";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat") || "coloring";
  const domain = searchParams.get("domain") || "amazon.com";
  const count = Math.min(Number(searchParams.get("count") || 24), 60);
  const seed = searchParams.get("seed") || "";
  const validate = searchParams.get("validate") === "1";

  if (!NICHE_CATEGORIES[cat]) {
    return NextResponse.json({ error: "unknown category" }, { status: 400 });
  }

  let rows = generateNiches(cat, count, seed);

  if (validate) {
    const head = rows.slice(0, 12);
    const checks = await Promise.all(head.map(async n => {
      const s = await amazonSuggestions(n.keyword, domain);
      const low = s.map(x => String(x).toLowerCase());
      return { depth: low.length, exact: low.includes(n.keyword) };
    }));

    head.forEach((n, i) => {
      n.depth = checks[i].depth;
      n.exact = checks[i].exact;
      n.demand = checks[i].exact ? "high" : checks[i].depth >= 8 ? "medium" : "low";
    });

    head.sort((a, b) => (Number(b.exact) - Number(a.exact)) || (b.depth - a.depth));
    rows = head.concat(rows.slice(12));
  }

  return NextResponse.json({ category: cat, domain, validated: validate, count: rows.length, rows });
}
