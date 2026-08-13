export const AUTH_CONFIG = Object.freeze({
  method: "email_otp",
  emailOnly: true,
  requireVerifiedEmail: true,

  requirePassword: false,
  requireUsername: false,
  requirePhone: false,
  requireFullName: false,

  foundersTrial: {
    enabled: true,
    maxVerifiedUsers: 100,
    trialDays: 30,
  },
});

export function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);

  if (!email || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateEmail(value) {
  const email = normalizeEmail(value);

  if (!email) {
    return {
      valid: false,
      email: "",
      error: "EMAIL_REQUIRED",
    };
  }

  if (!isValidEmail(email)) {
    return {
      valid: false,
      email,
      error: "INVALID_EMAIL",
    };
  }

  return {
    valid: true,
    email,
    error: null,
  };
}
