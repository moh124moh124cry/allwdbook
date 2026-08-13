// AllWDbook v3.0.0 — KDP estimate engine
// Sources: current Amazon KDP paperback royalty + printing-cost tables.
// Supports the marketplaces exposed by the current AllWDbook UI.

export const MARKETS = {
  "amazon.com": {
    symbol: "$", currency: "USD", royalty60At: 9.99,
    black: {
      shortMax: 110,
      regular: { shortFixed: 2.30, fixed: 1.00, perPage: 0.012 },
      large:   { shortFixed: 2.84, fixed: 1.00, perPage: 0.017 }
    },
    premium: {
      shortMax: 40,
      regular: { shortFixed: 3.60, fixed: 1.00, perPage: 0.065 },
      large:   { shortFixed: 4.20, fixed: 1.00, perPage: 0.080 }
    },
    standard: {
      minPages: 72, maxPages: 600,
      regular: { fixed: 1.00, perPage: 0.0255 },
      large:   { fixed: 1.00, perPage: 0.0402 }
    }
  },
  "amazon.ca": {
    symbol: "C$", currency: "CAD", royalty60At: 13.99,
    black: {
      shortMax: 110,
      regular: { shortFixed: 2.99, fixed: 1.26, perPage: 0.016 },
      large:   { shortFixed: 3.53, fixed: 1.26, perPage: 0.021 }
    },
    premium: {
      shortMax: 40,
      regular: { shortFixed: 4.66, fixed: 1.26, perPage: 0.085 },
      large:   { shortFixed: 5.26, fixed: 1.26, perPage: 0.100 }
    },
    standard: {
      minPages: 72, maxPages: 600,
      regular: { fixed: 1.26, perPage: 0.037 },
      large:   { fixed: 1.26, perPage: 0.052 }
    }
  },
  "amazon.co.uk": {
    symbol: "£", currency: "GBP", royalty60At: 7.99,
    black: {
      shortMax: 110,
      regular: { shortFixed: 1.93, fixed: 0.85, perPage: 0.010 },
      large:   { shortFixed: 2.15, fixed: 0.85, perPage: 0.012 }
    },
    premium: {
      shortMax: 40,
      regular: { shortFixed: 2.59, fixed: 0.85, perPage: 0.0435 },
      large:   { shortFixed: 3.24, fixed: 0.85, perPage: 0.0598 }
    },
    standard: {
      minPages: 72, maxPages: 600,
      regular: { fixed: 0.85, perPage: 0.020 },
      large:   { fixed: 0.85, perPage: 0.027 }
    }
  },
  "amazon.de": null,
  "amazon.fr": null,
  "amazon.it": null,
  "amazon.es": null
};

// KDP uses the same EUR paperback table for these stores.
const EU = {
  symbol: "€", currency: "EUR", royalty60At: 9.99,
  black: {
    shortMax: 110,
    regular: { shortFixed: 2.05, fixed: 0.75, perPage: 0.012 },
    large:   { shortFixed: 2.48, fixed: 0.75, perPage: 0.016 }
  },
  premium: {
    shortMax: 40,
    regular: { shortFixed: 2.85, fixed: 0.75, perPage: 0.0525 },
    large:   { shortFixed: 3.61, fixed: 0.75, perPage: 0.0715 }
  },
  standard: {
    minPages: 72, maxPages: 600,
    regular: { fixed: 0.75, perPage: 0.024 },
    large:   { fixed: 0.75, perPage: 0.035 }
  }
};
["amazon.de", "amazon.fr", "amazon.it", "amazon.es"].forEach(k => { MARKETS[k] = EU; });

export function marketInfo(domain = "amazon.com") {
  return MARKETS[domain] || MARKETS["amazon.com"];
}

export function isLargeTrim(widthIn, heightIn) {
  return Number(widthIn) > 6.12 || Number(heightIn) > 9;
}

function roundMoney(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function royaltyRate(price, domain = "amazon.com") {
  const p = Number(price);
  if (!isFinite(p) || p <= 0) return null;
  const market = marketInfo(domain);
  return p >= market.royalty60At ? 0.60 : 0.50;
}

// options:
// { domain: "amazon.com", ink: "black"|"premium"|"standard", large: false }
// Backward compatibility: passing true/false as second arg means premium/black on amazon.com.
export function printCost(pages = 120, options = {}) {
  const n = Number(pages);
  if (!Number.isFinite(n) || n < 24) return null;

  if (typeof options === "boolean") {
    options = { domain: "amazon.com", ink: options ? "premium" : "black", large: false };
  }

  const domain = options.domain || "amazon.com";
  const ink = options.ink || "black";
  const large = !!options.large;
  const market = marketInfo(domain);
  const table = market[ink];
  if (!table) return null;

  if (ink === "standard") {
    if (n < table.minPages || n > table.maxPages) return null;
    const rate = large ? table.large : table.regular;
    return roundMoney(rate.fixed + n * rate.perPage);
  }

  if (n > 828) return null;
  const rate = large ? table.large : table.regular;
  if (n <= table.shortMax) return roundMoney(rate.shortFixed);
  return roundMoney(rate.fixed + n * rate.perPage);
}

export function royaltyPerUnit(price, pages = 120, options = {}) {
  if (typeof options === "boolean") {
    options = { domain: "amazon.com", ink: options ? "premium" : "black", large: false };
  }
  const domain = options.domain || "amazon.com";
  const rate = royaltyRate(price, domain);
  const cost = printCost(pages, options);
  if (rate === null || cost === null) return null;
  return roundMoney(Math.max(0, Number(price) * rate - cost));
}

export function bsrToDailySales(bsr, domain = "amazon.com") {
  // Heuristic only — not an official Amazon conversion.
  const CURVES = {
    "amazon.com":   { A: 120000, B: 0.86 },
    "amazon.co.uk": { A: 30000,  B: 0.85 },
    "amazon.de":    { A: 26000,  B: 0.85 },
    "amazon.fr":    { A: 14000,  B: 0.84 },
    "amazon.it":    { A: 9000,   B: 0.84 },
    "amazon.es":    { A: 9000,   B: 0.84 },
    "amazon.ca":    { A: 11000,  B: 0.84 }
  };
  if (bsr === null || bsr === undefined) return null;
  const n = Number(bsr);
  if (!isFinite(n) || n <= 0) return null;
  const m = CURVES[domain] || CURVES["amazon.com"];
  const s = m.A / Math.pow(n, m.B);
  return Math.max(0, Math.round(s * 10) / 10);
}

export function monthlyRevenue(bsr, price, domain = "amazon.com", pages = 120, options = {}) {
  const daily = bsrToDailySales(bsr, domain);
  const royalty = royaltyPerUnit(price, pages, { ...options, domain });
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
