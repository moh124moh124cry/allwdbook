// AllWDbook subscription plans
// Central configuration only — no tool algorithms are changed here.

export const LAUNCH_OFFER = Object.freeze({
  enabled: true,
  maxUsers: 100,
  proTrialDays: 30,
  requiresVerifiedEmail: true,
  requiresCard: false,
});

export const FREE_DAILY_LIMITS = Object.freeze({
  coverDesigner: 5,
  microNiche: 5,
  keywords: 5,
});

export const PLAN_IDS = Object.freeze({
  FREE: "free",
  COVER: "cover",
  MICRO_NICHE: "micro_niche",
  KEYWORDS: "keywords",
  PRO_MONTHLY: "pro_monthly",
  PRO_YEARLY: "pro_yearly",
  FOUNDERS_TRIAL: "founders_trial",
});

export const PLANS = Object.freeze({
  [PLAN_IDS.FREE]: {
    id: PLAN_IDS.FREE,
    name: "Free",
    priceUsd: 0,
    billingInterval: null,
    tools: {
      coverDesigner: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.coverDesigner,
      },
      microNiche: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.microNiche,
      },
      keywords: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.keywords,
      },
      calculator: {
        access: true,
        dailyLimit: null,
      },
      formatter: {
        access: true,
        dailyLimit: null,
      },
    },
  },

  [PLAN_IDS.COVER]: {
    id: PLAN_IDS.COVER,
    name: "Cover Designer",
    priceUsd: 2.49,
    billingInterval: "month",
    tools: {
      coverDesigner: { access: true, dailyLimit: null },
      microNiche: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.microNiche,
      },
      keywords: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.keywords,
      },
      calculator: { access: true, dailyLimit: null },
      formatter: { access: true, dailyLimit: null },
    },
  },

  [PLAN_IDS.MICRO_NICHE]: {
    id: PLAN_IDS.MICRO_NICHE,
    name: "Micro-Niche",
    priceUsd: 2.49,
    billingInterval: "month",
    tools: {
      coverDesigner: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.coverDesigner,
      },
      microNiche: { access: true, dailyLimit: null },
      keywords: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.keywords,
      },
      calculator: { access: true, dailyLimit: null },
      formatter: { access: true, dailyLimit: null },
    },
  },

  [PLAN_IDS.KEYWORDS]: {
    id: PLAN_IDS.KEYWORDS,
    name: "Keywords",
    priceUsd: 2.49,
    billingInterval: "month",
    tools: {
      coverDesigner: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.coverDesigner,
      },
      microNiche: {
        access: true,
        dailyLimit: FREE_DAILY_LIMITS.microNiche,
      },
      keywords: { access: true, dailyLimit: null },
      calculator: { access: true, dailyLimit: null },
      formatter: { access: true, dailyLimit: null },
    },
  },

  [PLAN_IDS.PRO_MONTHLY]: {
    id: PLAN_IDS.PRO_MONTHLY,
    name: "AllWDbook Pro Monthly",
    priceUsd: 5.99,
    billingInterval: "month",
    tools: {
      coverDesigner: { access: true, dailyLimit: null },
      microNiche: { access: true, dailyLimit: null },
      keywords: { access: true, dailyLimit: null },
      calculator: { access: true, dailyLimit: null },
      formatter: { access: true, dailyLimit: null },
    },
  },

  [PLAN_IDS.PRO_YEARLY]: {
    id: PLAN_IDS.PRO_YEARLY,
    name: "AllWDbook Pro Yearly",
    priceUsd: 55,
    billingInterval: "year",
    tools: {
      coverDesigner: { access: true, dailyLimit: null },
      microNiche: { access: true, dailyLimit: null },
      keywords: { access: true, dailyLimit: null },
      calculator: { access: true, dailyLimit: null },
      formatter: { access: true, dailyLimit: null },
    },
  },

  [PLAN_IDS.FOUNDERS_TRIAL]: {
    id: PLAN_IDS.FOUNDERS_TRIAL,
    name: "Founders 30-Day Pro Trial",
    priceUsd: 0,
    billingInterval: null,
    trialDays: LAUNCH_OFFER.proTrialDays,
    tools: {
      coverDesigner: { access: true, dailyLimit: null },
      microNiche: { access: true, dailyLimit: null },
      keywords: { access: true, dailyLimit: null },
      calculator: { access: true, dailyLimit: null },
      formatter: { access: true, dailyLimit: null },
    },
  },
});

export function getPlan(planId) {
  return PLANS[planId] || PLANS[PLAN_IDS.FREE];
}

export function getToolEntitlement(planId, toolId) {
  const plan = getPlan(planId);

  return (
    plan.tools?.[toolId] || {
      access: false,
      dailyLimit: 0,
    }
  );
}

export function isToolUnlimited(planId, toolId) {
  const entitlement = getToolEntitlement(planId, toolId);

  return entitlement.access === true && entitlement.dailyLimit === null;
}
