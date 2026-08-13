import { getToolEntitlement } from "./plans.js";

function safeCount(value) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return Math.floor(count);
}

export function getToolAccess({
  planId,
  toolId,
  usedToday = 0,
}) {
  const entitlement = getToolEntitlement(planId, toolId);
  const used = safeCount(usedToday);

  if (!entitlement.access) {
    return {
      allowed: false,
      access: false,
      unlimited: false,
      limit: 0,
      usedToday: used,
      remaining: 0,
      reason: "NO_ACCESS",
    };
  }

  if (entitlement.dailyLimit === null) {
    return {
      allowed: true,
      access: true,
      unlimited: true,
      limit: null,
      usedToday: used,
      remaining: null,
      reason: null,
    };
  }

  const limit = safeCount(entitlement.dailyLimit);
  const remaining = Math.max(0, limit - used);

  return {
    allowed: remaining > 0,
    access: true,
    unlimited: false,
    limit,
    usedToday: used,
    remaining,
    reason: remaining > 0 ? null : "DAILY_LIMIT_REACHED",
  };
}

export function canUseTool(options) {
  return getToolAccess(options).allowed;
}

export function getRemainingUses(options) {
  return getToolAccess(options).remaining;
}
