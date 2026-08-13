// AllWDbook — lightweight API rate-limit helper
// This file does nothing until an API route imports and uses it.
// It is intentionally dependency-free.
//
// Note: this is per server instance. It is useful as a first protection layer,
// but for strict global limits at scale, use a durable store later.

const store =
  globalThis.__allwdbookRateLimitStore ||
  (globalThis.__allwdbookRateLimitStore = new Map());

function clientId(req) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim();

  return (
    ip ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  req,
  {
    name = "api",
    limit = 10,
    windowMs = 60_000
  } = {}
) {
  const now = Date.now();
  const key = `${name}:${clientId(req)}`;

  let bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = {
      count: 0,
      resetAt: now + windowMs
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  // Small cleanup to stop the in-memory map from growing forever.
  if (store.size > 3000) {
    for (const [k, value] of store.entries()) {
      if (now >= value.resetAt) {
        store.delete(k);
      }
    }
  }

  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfter: Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000)
    )
  };
}

export function rateLimitResponse(result) {
  return new Response(
    JSON.stringify({
      error: "RATE_LIMITED",
      retryAfter: result.retryAfter
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": String(result.retryAfter)
      }
    }
  );
}
