import crypto from "node:crypto";

const CODE_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

const CODE_GROUPS = 5;
const CODE_GROUP_SIZE = 4;
const CODE_PREFIX = "AWDLIFE";

function licenseSecret() {
  const value = String(
    process.env.LICENSE_SECRET || "",
  );

  if (value.length < 32) {
    throw new Error("LICENSE_SECRET_MISSING");
  }

  return value;
}

function randomCharacters(length) {
  const bytes = crypto.randomBytes(length);
  let result = "";

  for (const byte of bytes) {
    result +=
      CODE_ALPHABET[
        byte % CODE_ALPHABET.length
      ];
  }

  return result;
}

export function generateLicenseCode() {
  const groups = Array.from(
    { length: CODE_GROUPS },
    () => randomCharacters(CODE_GROUP_SIZE),
  );

  return `AWD-LIFE-${groups.join("-")}`;
}

export function normalizeLicenseCode(value) {
  const compact = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!compact.startsWith(CODE_PREFIX)) {
    return "";
  }

  const body = compact.slice(CODE_PREFIX.length);

  if (
    body.length !==
    CODE_GROUPS * CODE_GROUP_SIZE
  ) {
    return "";
  }

  for (const character of body) {
    if (!CODE_ALPHABET.includes(character)) {
      return "";
    }
  }

  const groups = body.match(
    new RegExp(
      `.{${CODE_GROUP_SIZE}}`,
      "g",
    ),
  );

  if (!groups || groups.length !== CODE_GROUPS) {
    return "";
  }

  return `AWD-LIFE-${groups.join("-")}`;
}

export function hashLicenseCode(code) {
  const normalized =
    normalizeLicenseCode(code);

  if (!normalized) {
    return "";
  }

  return crypto
    .createHmac(
      "sha256",
      licenseSecret(),
    )
    .update(normalized)
    .digest("hex");
}

export function encryptLicenseCode(code) {
  const normalized =
    normalizeLicenseCode(code);

  if (!normalized) {
    throw new Error(
      "INVALID_LICENSE_CODE",
    );
  }

  const key = crypto
    .createHash("sha256")
    .update(licenseSecret())
    .digest();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted]
    .map((part) =>
      part.toString("base64url"),
    )
    .join(".");
}

export function decryptLicenseCode(
  ciphertext,
) {
  const [
    ivValue,
    tagValue,
    encryptedValue,
  ] = String(ciphertext || "").split(".");

  if (
    !ivValue ||
    !tagValue ||
    !encryptedValue
  ) {
    throw new Error(
      "INVALID_LICENSE_CIPHERTEXT",
    );
  }

  const key = crypto
    .createHash("sha256")
    .update(licenseSecret())
    .digest();

  const decipher =
    crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(
        ivValue,
        "base64url",
      ),
    );

  decipher.setAuthTag(
    Buffer.from(
      tagValue,
      "base64url",
    ),
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(
        encryptedValue,
        "base64url",
      ),
    ),
    decipher.final(),
  ]).toString("utf8");

  const normalized =
    normalizeLicenseCode(decrypted);

  if (!normalized) {
    throw new Error(
      "INVALID_LICENSE_CODE",
    );
  }

  return normalized;
}

export function licenseHint(code) {
  const normalized =
    normalizeLicenseCode(code);

  if (!normalized) {
    return "";
  }

  const lastGroup =
    normalized.split("-").at(-1) || "";

  return (
    "AWD-LIFE-****-****-****-****-" +
    lastGroup
  );
}

export function generateEmailOtp() {
  return String(
    crypto.randomInt(
      100000,
      1000000,
    ),
  );
}

export function hashEmailOtp({
  licenseId,
  email,
  purpose,
  otp,
}) {
  const normalizedEmail = String(
    email || "",
  )
    .trim()
    .toLowerCase();

  return crypto
    .createHmac(
      "sha256",
      licenseSecret(),
    )
    .update(
      `${licenseId}:${normalizedEmail}:${purpose}:${otp}`,
    )
    .digest("hex");
}

export function safeEqualHex(
  first,
  second,
) {
  const left = Buffer.from(
    String(first || ""),
    "utf8",
  );

  const right = Buffer.from(
    String(second || ""),
    "utf8",
  );

  return (
    left.length === right.length &&
    crypto.timingSafeEqual(
      left,
      right,
    )
  );
}

export function acceptsTestMode(
  testMode,
) {
  return (
    testMode !== true ||
    process.env
      .LEMONSQUEEZY_ACCEPT_TEST_MODE ===
      "true"
  );
}

export async function createLifetimeLicense(
  supabase,
  {
    source = "purchase",
    purchaserEmail = null,
    recoveryEmail = null,
    emailVerified = false,
    maxActivations = 3,
    lemonOrderId = null,
    lemonCustomerId = null,
    lemonProductId = null,
    lemonVariantId = null,
    testMode = false,
    note = null,
    createdByEmail = null,
  } = {},
) {
  for (
    let attempt = 0;
    attempt < 4;
    attempt += 1
  ) {
    const code =
      generateLicenseCode();

    const record = {
      code_hash:
        hashLicenseCode(code),

      code_ciphertext:
        encryptLicenseCode(code),

      code_hint:
        licenseHint(code),

      status: "active",
      source,

      purchaser_email:
        purchaserEmail || null,

      recovery_email:
        recoveryEmail || null,

      email_verified_at:
        emailVerified
          ? new Date().toISOString()
          : null,

      max_activations: Math.max(
        1,
        Math.min(
          10,
          Number(maxActivations) || 3,
        ),
      ),

      lemon_order_id:
        lemonOrderId || null,

      lemon_customer_id:
        lemonCustomerId || null,

      lemon_product_id:
        lemonProductId || null,

      lemon_variant_id:
        lemonVariantId || null,

      test_mode:
        Boolean(testMode),

      note: note || null,

      created_by_email:
        createdByEmail || null,

      updated_at:
        new Date().toISOString(),
    };

    const {
      data,
      error,
    } = await supabase
      .from(
        "allwdbook_lifetime_licenses",
      )
      .insert(record)
      .select("*")
      .single();

    if (!error) {
      return {
        license: data,
        code,
      };
    }

    if (error.code !== "23505") {
      throw new Error(
        "LICENSE_CREATE_FAILED:" +
          error.message,
      );
    }
  }

  throw new Error(
    "LICENSE_CODE_COLLISION",
  );
}

export async function activateLifetimeLicense(
  supabase,
  license,
  userId,
) {
  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from(
      "allwdbook_license_activations",
    )
    .select("id, revoked_at")
    .eq(
      "license_id",
      license.id,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      "ACTIVATION_LOOKUP_FAILED:" +
        existingError.message,
    );
  }

  if (existing) {
    const {
      error,
    } = await supabase
      .from(
        "allwdbook_license_activations",
      )
      .update({
        revoked_at: null,

        last_seen_at:
          new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(
        "ACTIVATION_UPDATE_FAILED:" +
          error.message,
      );
    }

    return {
      allowed: true,
      existing: true,
    };
  }

  const {
    count,
    error: countError,
  } = await supabase
    .from(
      "allwdbook_license_activations",
    )
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "license_id",
      license.id,
    )
    .is("revoked_at", null);

  if (countError) {
    throw new Error(
      "ACTIVATION_COUNT_FAILED:" +
        countError.message,
    );
  }

  if (
    (count || 0) >=
    license.max_activations
  ) {
    return {
      allowed: false,
      reason:
        "ACTIVATION_LIMIT_REACHED",
    };
  }

  const {
    error,
  } = await supabase
    .from(
      "allwdbook_license_activations",
    )
    .insert({
      license_id: license.id,
      user_id: userId,
    });

  if (error) {
    throw new Error(
      "ACTIVATION_CREATE_FAILED:" +
        error.message,
    );
  }

  return {
    allowed: true,
    existing: false,
  };
}

export async function recordLicenseAudit(
  supabase,
  {
    licenseId,
    eventType,
    actorUserId = null,
    actorEmail = null,
    metadata = {},
  },
) {
  const {
    error,
  } = await supabase
    .from(
      "allwdbook_license_audit",
    )
    .insert({
      license_id:
        licenseId || null,

      event_type:
        eventType,

      actor_user_id:
        actorUserId || null,

      actor_email:
        actorEmail || null,

      metadata,
    });

  if (error) {
    console.error(
      "License audit failed:",
      error,
    );
  }
}
