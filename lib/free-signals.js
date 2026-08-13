// AllWDbook v1.1.4 — Free demand signals from Amazon autocomplete.
// Single source of truth for the Keyword Research route only.
// Does NOT touch provider.js or Micro-Niche.
//
// LABELLING RULE
// measured.*   = facts observed in Amazon autocomplete
// calculated.* = AllWDbook indicators derived from those facts
//
// FAILURE RULE
// A failed measurement is NEVER reported as zero demand.
// Callers must check ok before reading measured/calculated.
//
// TIME BUDGET RULE
// Expansion has a total execution budget so partial upstream failures
// do not consume the full serverless execution window.

export const VERSION = "1.1.4";

export const MARKETPLACE_IDS = {
  "amazon.com": "ATVPDKIKX0DER",
  "amazon.co.uk": "A1F83G8C2ARO7P",
  "amazon.de": "A1PA6795UKMFR9",
  "amazon.fr": "A13V1IB3VIYZZH",
  "amazon.it": "APJ6JRA9NG5V4",
  "amazon.es": "A1RKKUPIHCS9HS",
  "amazon.ca": "A2EUQ1WTGCTBG2"
};

export const SIGNAL_SOURCE = "amazon_autocomplete";
export const SIGNAL_CALCULATED_BY = "AllWDbook";

export const ERRORS = {
  TOO_SHORT: "TOO_SHORT",
  UPSTREAM_TIMEOUT: "UPSTREAM_TIMEOUT",
  UPSTREAM_UNAVAILABLE: "UPSTREAM_UNAVAILABLE",
  UPSTREAM_BAD_RESPONSE: "UPSTREAM_BAD_RESPONSE"
};

const SUFFIXES = [
  "", " for kids", " for adults", " for women", " for men",
  " for beginners", " for seniors", " for teens", " large print",
  " easy", " simple", " funny", " gift", " christmas", " birthday"
];

export function normalizeDomain(domain) {
  return MARKETPLACE_IDS[domain] ? domain : "amazon.com";
}

// Returns { ok, keywords, error, httpStatus }
// Never throws. Never disguises a failure as an empty result.
export async function amazonSuggest(prefix, domain, timeoutMs) {
  const store = normalizeDomain(domain);
  const term = String(prefix || "").trim();

  if (!term) {
    return {
      ok: false,
      keywords: [],
      error: ERRORS.TOO_SHORT,
      httpStatus: null
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Number(timeoutMs) || 6000
  );

  try {
    const url = new URL(
      "https://completion." + store + "/api/2017/suggestions"
    );

    url.searchParams.set("mid", MARKETPLACE_IDS[store]);
    url.searchParams.set("alias", "stripbooks");
    url.searchParams.set("limit", "11");
    url.searchParams.set("suggestion-type", "KEYWORD");
    url.searchParams.set("prefix", term);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      return {
        ok: false,
        keywords: [],
        error: ERRORS.UPSTREAM_UNAVAILABLE,
        httpStatus: res.status
      };
    }

    let json = null;

    try {
      json = await res.json();
    } catch (parseError) {
      return {
        ok: false,
        keywords: [],
        error: ERRORS.UPSTREAM_BAD_RESPONSE,
        httpStatus: res.status
      };
    }

    if (!json || !Array.isArray(json.suggestions)) {
      return {
        ok: false,
        keywords: [],
        error: ERRORS.UPSTREAM_BAD_RESPONSE,
        httpStatus: res.status
      };
    }

    const keywords = json.suggestions
      .map(item =>
        item && item.value
          ? String(item.value).toLowerCase().trim()
          : ""
      )
      .filter(Boolean);

    return {
      ok: true,
      keywords,
      error: null,
      httpStatus: res.status
    };
  } catch (e) {
    const aborted =
      e &&
      (
        e.name === "AbortError" ||
        String(e.message || "").toLowerCase().includes("abort")
      );

    return {
      ok: false,
      keywords: [],
      error: aborted
        ? ERRORS.UPSTREAM_TIMEOUT
        : ERRORS.UPSTREAM_UNAVAILABLE,
      httpStatus: null
    };
  } finally {
    clearTimeout(timer);
  }
}

// AllWDbook indicator. NOT an Amazon metric. Range 1-100.
function demandSignalScore(depth, exact, zeroBasedPosition) {
  let score = 0;

  if (exact) score += 45;
  score += Math.min(35, depth * 3.5);

  if (
    exact &&
    zeroBasedPosition !== null &&
    zeroBasedPosition !== undefined
  ) {
    score += Math.max(0, 20 - zeroBasedPosition * 2);
  }

  return Math.max(1, Math.min(100, Math.round(score)));
}

function demandLevel(depth, exact) {
  if (exact && depth >= 8) return "high";
  if (exact) return "medium";
  if (depth >= 8) return "medium";
  if (depth >= 3) return "low";
  return "none";
}

export async function measureKeyword(keyword, domain) {
  const clean = String(keyword || "").toLowerCase().trim();
  const store = normalizeDomain(domain);

  if (clean.length < 2) {
    return {
      keyword: clean,
      domain: store,
      ok: false,
      error: ERRORS.TOO_SHORT,
      measured: null,
      calculated: null
    };
  }

  const attempt = await amazonSuggest(clean, store);

  if (!attempt.ok) {
    return {
      keyword: clean,
      domain: store,
      ok: false,
      error: attempt.error,
      httpStatus: attempt.httpStatus,
      measured: null,
      calculated: null
    };
  }

  const list = attempt.keywords;
  const depth = list.length;
  const zeroBased = list.indexOf(clean);
  const exact = zeroBased >= 0;

  return {
    keyword: clean,
    domain: store,
    ok: true,
    error: null,

    measured: {
      source: SIGNAL_SOURCE,
      suggestionDepth: depth,
      exactMatchPresent: exact,
      exactMatchPosition: exact ? zeroBased + 1 : null,
      relatedKeywords: list
        .filter(item => item !== clean)
        .slice(0, 10)
    },

    calculated: {
      metric: "demand_signal_score",
      calculatedBy: SIGNAL_CALCULATED_BY,
      basis: SIGNAL_SOURCE,
      isAmazonData: false,
      demandSignalScore: demandSignalScore(
        depth,
        exact,
        exact ? zeroBased : null
      ),
      demandLevel: demandLevel(depth, exact)
    }
  };
}

// Returns { ok, keywords, error, requested, succeeded, partial }
export async function expandKeyword(seed, domain, limit) {
  const clean = String(seed || "").toLowerCase().trim();
  const store = normalizeDomain(domain);
  const cap = Math.min(Number(limit) || 30, 60);

  if (clean.length < 2) {
    return {
      ok: false,
      keywords: [],
      error: ERRORS.TOO_SHORT,
      requested: 0,
      succeeded: 0,
      partial: false
    };
  }

  const found = new Map();
  let requested = 0;
  let succeeded = 0;
  let failedRequests = 0;
  let lastError = null;
  let stoppedByBudget = false;

  const startedAt = Date.now();
  const TOTAL_BUDGET_MS = 22000;

  for (let i = 0; i < SUFFIXES.length; i++) {
    if (found.size >= cap) break;

    if (Date.now() - startedAt >= TOTAL_BUDGET_MS) {
      lastError = ERRORS.UPSTREAM_TIMEOUT;
      stoppedByBudget = true;
      break;
    }

    requested += 1;

    const attempt = await amazonSuggest(
      clean + SUFFIXES[i],
      store,
      4500
    );

    if (!attempt.ok) {
      failedRequests += 1;
      lastError = attempt.error;

      if (
        succeeded === 0 &&
        requested >= 3 &&
        (
          attempt.error === ERRORS.UPSTREAM_TIMEOUT ||
          attempt.error === ERRORS.UPSTREAM_UNAVAILABLE
        )
      ) {
        break;
      }

      continue;
    }

    succeeded += 1;

    for (let j = 0; j < attempt.keywords.length; j++) {
      const phrase = attempt.keywords[j];

      if (found.has(phrase)) continue;

      const wordCount = phrase
        .split(" ")
        .filter(Boolean).length;

      found.set(phrase, {
        keyword: phrase,
        source: SIGNAL_SOURCE,
        words: wordCount,
        longTail: wordCount >= 4,
        autocompleteRank: j + 1,
        seedVariant:
          SUFFIXES[i]
            ? clean + SUFFIXES[i]
            : clean
      });

      if (found.size >= cap) break;
    }
  }

  const rows = Array.from(found.values()).sort(
    (a, b) => a.autocompleteRank - b.autocompleteRank
  );

  if (succeeded === 0) {
    return {
      ok: false,
      keywords: [],
      error: lastError || ERRORS.UPSTREAM_UNAVAILABLE,
      requested,
      succeeded: 0,
      partial: false
    };
  }

  return {
    ok: true,
    keywords: rows,
    error: null,
    requested,
    succeeded,
    partial:
      failedRequests > 0 ||
      stoppedByBudget
  };
}

export async function measureBatch(keywords, domain, max) {
  const cap = Math.min(Number(max) || 10, 15);
  const slice = (keywords || []).slice(0, cap);
  const results = [];

  for (let i = 0; i < slice.length; i++) {
    results.push(
      await measureKeyword(slice[i], domain)
    );
  }

  return results;
}
