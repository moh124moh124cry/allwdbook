import { PLAN_IDS } from "./plans.js";

const ACTIVE_STATUSES = new Set([
  "active",
  "on_trial",
  "trialing",
]);

function asDate(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isFuture(value, now = new Date()) {
  const date = asDate(value);
  return Boolean(date && date.getTime() > now.getTime());
}

export function isFoundersTrialActive(account, now = new Date()) {
  if (!account) return false;

  if (account.foundersTrial !== true) {
    return false;
  }

  return isFuture(account.trialEndsAt, now);
}

export function isPaidSubscriptionActive(subscription, now = new Date()) {
  if (!subscription) return false;

  const status = String(subscription.status || "").toLowerCase();

  if (!ACTIVE_STATUSES.has(status)) {
    return false;
  }

  if (!subscription.endsAt) {
    return true;
  }

  return isFuture(subscription.endsAt, now);
}

export function resolvePlanId({
  account = null,
  subscription = null,
  now = new Date(),
} = {}) {
  if (isPaidSubscriptionActive(subscription, now)) {
    const planId = subscription.planId;

    if (
      planId === PLAN_IDS.COVER ||
      planId === PLAN_IDS.MICRO_NICHE ||
      planId === PLAN_IDS.KEYWORDS ||
      planId === PLAN_IDS.PRO_MONTHLY ||
      planId === PLAN_IDS.PRO_YEARLY
    ) {
      return planId;
    }
  }

  if (isFoundersTrialActive(account, now)) {
    return PLAN_IDS.FOUNDERS_TRIAL;
  }

  return PLAN_IDS.FREE;
}

export function getSubscriptionState({
  account = null,
  subscription = null,
  now = new Date(),
} = {}) {
  const planId = resolvePlanId({
    account,
    subscription,
    now,
  });

  return {
    planId,
    isFree: planId === PLAN_IDS.FREE,
    isTrial: planId === PLAN_IDS.FOUNDERS_TRIAL,
    isPaid:
      planId !== PLAN_IDS.FREE &&
      planId !== PLAN_IDS.FOUNDERS_TRIAL,
  };
}
