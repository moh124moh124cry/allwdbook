import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { checkRateLimit } from "../../../../lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

function visitorHash(visitorId) {
  const secret = String(process.env.LICENSE_SECRET || "");

  if (secret.length < 32) {
    throw new Error("ANALYTICS_SECRET_MISSING");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(visitorId)
    .digest("hex");
}

function cleanPath(value) {
  let path = String(value || "/").trim().slice(0, 300);

  if (!path.startsWith("/")) {
    path = "/";
  }

  path = path.split("?")[0].split("#")[0];

  return path || "/";
}

function ignoredPath(path) {
  const blocked = [
    "/admin",
    "/login",
    "/test-access",
    "/api",
  ];

  return blocked.some(
    (prefix) =>
      path === prefix ||
      path.startsWith(prefix + "/")
  );
}

export async function POST(request) {
  const rate = checkRateLimit(request, {
    name: "analytics-visit",
    limit: 120,
    windowMs: 60 * 60 * 1000,
  });

  if (!rate.ok) {
    return json(
      {
        ok: false,
        error: "RATE_LIMITED",
        retryAfter: rate.retryAfter,
      },
      429
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      400
    );
  }

  const visitorId = String(
    body?.visitorId || ""
  )
    .trim()
    .toLowerCase();

  if (!UUID_RE.test(visitorId)) {
    return json(
      {
        ok: false,
        error: "INVALID_VISITOR_ID",
      },
      400
    );
  }

  const path = cleanPath(body?.path);

  if (ignoredPath(path)) {
    return json({
      ok: true,
      recorded: false,
      ignored: true,
    });
  }

  let hash;

  try {
    hash = visitorHash(visitorId);
  } catch (error) {
    console.error("Analytics secret error:", error);

    return json(
      {
        ok: false,
        error: "ANALYTICS_NOT_CONFIGURED",
      },
      503
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.rpc(
      "allwdbook_record_visit",
      {
        p_visitor_hash: hash,
      }
    );

    if (error) {
      console.error("Analytics RPC error:", error);

      return json(
        {
          ok: false,
          error: "VISIT_RECORD_FAILED",
        },
        500
      );
    }

    return json({
      ok: true,
      recorded: true,
    });
  } catch (error) {
    console.error("Analytics visit error:", error);

    return json(
      {
        ok: false,
        error: "VISIT_RECORD_FAILED",
      },
      500
    );
  }
}

export async function GET() {
  return json({
    ok: true,
    service: "AllWDbook Visitor Analytics",
    method: "POST",
    privacy: {
      rawVisitorIdStored: false,
      emailStored: false,
      accessKeyStored: false,
      ipStored: false,
    },
  });
}
