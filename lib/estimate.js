// AllWDbook v2.0.0 - estimate.js
export const MARKETS = {
  "amazon.com":   { A: 120000, B: 0.86, sym: "$" },
  "amazon.co.uk": { A: 30000,  B: 0.85, sym: "£" },
  "amazon.de":    { A: 26000,  B: 0.85, sym: "€" },
  "amazon.fr":    { A: 14000,  B: 0.84, sym: "€" },
  "amazon.it":    { A: 9000,   B: 0.84, sym: "€" },
  "amazon.es":    { A: 9000,   B: 0.84, sym: "€" },
  "amazon.ca":    { A: 11000,  B: 0.84, sym: "C$" }
};

export function bsrToDailySales(bsr, domain = "amazon.com") {
  if (bsr === null || bsr === undefined) return null;
  const n = Number(bsr);
  if (!isFinite(n) || n <= 0) return null;
  const m = MARKETS[domain] || MARKETS["amazon.com"];
  const s = m.A / Math.pow(n, m.B);
  return Math.max(0, Math.round(s * 10) / 10);
}

export function printCost(pages = 120, color = false) {
  const p = Number(pages) || 120;
  if (color) return p < 110 ? 3.65 : 0.85 + p * 0.07;
  return p < 110 ? 2.30 : 0.85 + p * 0.012;
}

export function royaltyPerUnit(price, pages = 120, color = false) {
  if (price === null || price === undefined) return null;
  const p = Number(price);
  if (!isFinite(p) || p <= 0) return null;
  const r = p * 0.6 - printCost(pages, color);
  return Math.max(0, Math.round(r * 100) / 100);
}

export function monthlyRevenue(bsr, price, domain = "amazon.com", pages = 120, color = false) {
  const daily = bsrToDailySales(bsr, domain);
  const royalty = royaltyPerUnit(price, pages, color);
  if (daily === null || royalty === null) return null;
  return Math.round(daily * 30 * royalty);
}

export function opportunityScore({ avgBsr, avgReviews, avgPrice }) {
  if (avgBsr == null || avgReviews == null || avgPrice == null) return null;
  const demand = Math.min(100, (50000 / Math.max(avgBsr, 1)) * 100);
  const competition = Math.min(100, avgReviews / 50);
  const money = Math.min(100, (avgPrice / 15) * 100);
  const s = demand * 0.5 + (100 - competition) * 0.3 + money * 0.2;
  return Math.max(1, Math.min(100, Math.round(s)));
}

export function confidenceLevel(sampleSize = 0) {
  if (sampleSize >= 5) return "high";
  if (sampleSize >= 3) return "medium";
  if (sampleSize >= 1) return "low";
  return "none";
}
