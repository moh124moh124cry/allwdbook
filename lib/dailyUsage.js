import { FREE_DAILY_LIMITS } from "./plans";
import { getLifetimeAccess } from "./lifetimeAccess";
import { getSupabaseAdmin } from "./supabaseAdmin";

const ALLOWED_TOOLS = new Set([
  "coverDesigner",
  "microNiche",
  "keywords",
]);

export async function consumeToolUse(
  request,
  toolId
) {
  if (!ALLOWED_TOOLS.has(toolId)) {
    return {
      allowed: false,
      reason: "INVALID_TOOL",
      used: 0,
      remaining: 0,
      unlimited: false,
    };
  }

  const access =
    await getLifetimeAccess(request);

  if (!access.authenticated) {
    return {
      allowed: false,
      reason: "LOGIN_REQUIRED",
      used: 0,
      remaining: 0,
      unlimited: false,
    };
  }

  if (access.lifetime) {
    return {
      allowed: true,
      reason: null,
      used: null,
      remaining: null,
      unlimited: true,
      plan: "lifetime_pro",
    };
  }

  const dailyLimit = Number(
    FREE_DAILY_LIMITS?.[toolId] ?? 5
  );

  const userId = access.user?.id;

  if (!userId) {
    return {
      allowed: false,
      reason: "USER_REQUIRED",
      used: 0,
      remaining: 0,
      unlimited: false,
    };
  }

  const supabase = getSupabaseAdmin();

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const { data, error } =
    await supabase.rpc(
      "allwdbook_consume_daily_use",
      {
        p_user_id: userId,
        p_tool_id: toolId,
        p_limit: dailyLimit,
        p_usage_date: today,
      }
    );

  if (error) {
    console.error(
      "Daily usage error:",
      error
    );

    return {
      allowed: false,
      reason: "USAGE_CHECK_FAILED",
      used: 0,
      remaining: 0,
      unlimited: false,
    };
  }

  const result = Array.isArray(data)
    ? data[0]
    : data;

  return {
    allowed: Boolean(result?.allowed),
    reason: result?.allowed
      ? null
      : "DAILY_LIMIT_REACHED",
    used: Number(result?.used ||
