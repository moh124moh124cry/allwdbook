import crypto from "node:crypto";

/* =========================================================
   ALLWDBOOK ACCESS KEY ENGINE
   =========================================================
   هذا الملف يعمل على السيرفر فقط.

   مسؤول عن:
   - توليد Access Key
   - Normalize
   - Hash
   - Encrypt / Decrypt
   - إخفاء الكود للـ Admin
   - إنشاء Access Key لأي خطة
   - البحث عن Access Key
   - تفعيل الكود على جهاز
   - التحقق من صلاحية الوصول
   - OTP للبريد
   - Audit Log
   ========================================================= */


/* =========================================================
   CODE CONFIG
   ========================================================= */

const CODE_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

const CODE_PREFIX =
  "AWD-KEY";

const COMPACT_PREFIX =
  "AWDKEY";

const CODE_GROUPS = 5;

const CODE_GROUP_SIZE = 4;


/* =========================================================
   SERVER SAFETY
   ========================================================= */

function assertServerOnly() {
  if (
    typeof window !==
    "undefined"
  ) {
    throw new Error(
      "ACCESS_KEY_SERVER_ONLY",
    );
  }
}


/* =========================================================
   SECRET
   =========================================================
   نستخدم نفس LICENSE_SECRET الموجود مسبقاً
   حتى لا نضيف Secret جديد بلا داعٍ.
   ========================================================= */

function accessSecret() {
  assertServerOnly();

  const value =
    String(
      process.env
        .LICENSE_SECRET ||
        "",
    );

  if (
    value.length < 32
  ) {
    throw new Error(
      "LICENSE_SECRET_MISSING",
    );
  }

  return value;
}


/* =========================================================
   EMAIL
   ========================================================= */

export function normalizeAccessEmail(
  value,
) {
  const email =
    String(
      value || "",
    )
      .trim()
      .toLowerCase();

  if (!email) {
    return "";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  ) {
    return "";
  }

  return email;
}


/* =========================================================
   RANDOM CHARACTERS
   ========================================================= */

function randomCharacters(
  length,
) {
  assertServerOnly();

  const bytes =
    crypto.randomBytes(
      length,
    );

  let result = "";

  for (
    const byte of bytes
  ) {
    result +=
      CODE_ALPHABET[
        byte %
          CODE_ALPHABET.length
      ];
  }

  return result;
}


/* =========================================================
   GENERATE ACCESS KEY
   =========================================================
   مثال:

   AWD-KEY-7K4M-X9DP-3QLR-W8HF-P6NT

   لا نضع اسم الخطة داخل الكود.
   السبب:
   الخطة يمكن للأدمن تغييرها مستقبلاً
   دون الحاجة إلى إصدار كود جديد.
   ========================================================= */

export function generateAccessKeyCode() {
  assertServerOnly();

  const groups =
    Array.from(
      {
        length:
          CODE_GROUPS,
      },
      () =>
        randomCharacters(
          CODE_GROUP_SIZE,
        ),
    );

  return `${CODE_PREFIX}-${groups.join(
    "-",
  )}`;
}


/* =========================================================
   NORMALIZE ACCESS KEY
   =========================================================
   المستخدم يستطيع الكتابة مثلاً:

   AWD-KEY-XXXX...
   awd key xxxx...
   AWDKEYXXXX...

   وسنحوّله للشكل الصحيح.
   ========================================================= */

export function normalizeAccessKeyCode(
  value,
) {
  const compact =
    String(
      value || "",
    )
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        "",
      );

  if (
    !compact.startsWith(
      COMPACT_PREFIX,
    )
  ) {
    return "";
  }

  const body =
    compact.slice(
      COMPACT_PREFIX.length,
    );

  const expectedLength =
    CODE_GROUPS *
    CODE_GROUP_SIZE;

  if (
    body.length !==
    expectedLength
  ) {
    return "";
  }

  for (
    const character of body
  ) {
    if (
      !CODE_ALPHABET.includes(
        character,
      )
    ) {
      return "";
    }
  }

  const groups =
    body.match(
      new RegExp(
        `.{${CODE_GROUP_SIZE}}`,
        "g",
      ),
    );

  if (
    !groups ||
    groups.length !==
      CODE_GROUPS
  ) {
    return "";
  }

  return `${CODE_PREFIX}-${groups.join(
    "-",
  )}`;
}


/* =========================================================
   HASH ACCESS KEY
   =========================================================
   نستخدم Hash للبحث في قاعدة البيانات.
   الكود الحقيقي لا يستخدم للبحث مباشرة.
   ========================================================= */

export function hashAccessKeyCode(
  code,
) {
  assertServerOnly();

  const normalized =
    normalizeAccessKeyCode(
      code,
    );

  if (!normalized) {
    return "";
  }

  return crypto
    .createHmac(
      "sha256",
      accessSecret(),
    )
    .update(normalized)
    .digest("hex");
}


/* =========================================================
   ENCRYPT ACCESS KEY
   =========================================================
   AES-256-GCM

   نحتاج نسخة مشفرة من الكود لأن:
   - صفحة نجاح الدفع يجب أن تعرضه للعميل.
   - Admin قد يحتاج Reveal أو Rotate.
   ========================================================= */

export function encryptAccessKeyCode(
  code,
) {
  assertServerOnly();

  const normalized =
    normalizeAccessKeyCode(
      code,
    );

  if (!normalized) {
    throw new Error(
      "INVALID_ACCESS_KEY",
    );
  }

  const key =
    crypto
      .createHash(
        "sha256",
      )
      .update(
        accessSecret(),
      )
      .digest();

  const iv =
    crypto.randomBytes(12);

  const cipher =
    crypto.createCipheriv(
      "aes-256-gcm",
      key,
      iv,
    );

  const encrypted =
    Buffer.concat([
      cipher.update(
        normalized,
        "utf8",
      ),

      cipher.final(),
    ]);

  const tag =
    cipher.getAuthTag();

  return [
    iv,
    tag,
    encrypted,
  ]
    .map((part) =>
      part.toString(
        "base64url",
      ),
    )
    .join(".");
}


/* =========================================================
   DECRYPT ACCESS KEY
   ========================================================= */

export function decryptAccessKeyCode(
  ciphertext,
) {
  assertServerOnly();

  const [
    ivValue,
    tagValue,
    encryptedValue,
  ] =
    String(
      ciphertext || "",
    ).split(".");

  if (
    !ivValue ||
    !tagValue ||
    !encryptedValue
  ) {
    throw new Error(
      "INVALID_ACCESS_KEY_CIPHERTEXT",
    );
  }

  const key =
    crypto
      .createHash(
        "sha256",
      )
      .update(
        accessSecret(),
      )
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

  const decrypted =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          encryptedValue,
          "base64url",
        ),
      ),

      decipher.final(),
    ]).toString("utf8");

  const normalized =
    normalizeAccessKeyCode(
      decrypted,
    );

  if (!normalized) {
    throw new Error(
      "INVALID_ACCESS_KEY",
    );
  }

  return normalized;
}


/* =========================================================
   KEY HINT
   =========================================================
   Admin لا يحتاج رؤية الكود كاملاً دائماً.

   مثال:

   AWD-KEY-****-****-****-****-P6NT
   ========================================================= */

export function accessKeyHint(
  code,
) {
  const normalized =
    normalizeAccessKeyCode(
      code,
    );

  if (!normalized) {
    return "";
  }

  const lastGroup =
    normalized
      .split("-")
      .at(-1) || "";

  return (
    "AWD-KEY-" +
    "****-****-****-****-" +
    lastGroup
  );
}


/* =========================================================
   SAFE EQUAL
   ========================================================= */

export function safeEqualHex(
  first,
  second,
) {
  assertServerOnly();

  const left =
    Buffer.from(
      String(
        first || "",
      ),
      "utf8",
    );

  const right =
    Buffer.from(
      String(
        second || "",
      ),
      "utf8",
    );

  return (
    left.length ===
      right.length &&
    crypto.timingSafeEqual(
      left,
      right,
    )
  );
}


/* =========================================================
   TEST MODE
   ========================================================= */

export function acceptsAccessTestMode(
  testMode,
) {
  return (
    testMode !== true ||
    process.env
      .LEMONSQUEEZY_ACCEPT_TEST_MODE ===
      "true"
  );
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function dateValue(
  value,
) {
  if (!value) {
    return null;
  }

  const timestamp =
    new Date(
      value,
    ).getTime();

  if (
    Number.isNaN(
      timestamp,
    )
  ) {
    return null;
  }

  return timestamp;
}


/* =========================================================
   ACCESS STATUS
   =========================================================
   cancelled:
   العميل ألغى التجديد، لكن يمكن أن تبقى
   الخطة صالحة حتى expires_at.

   revoked / refunded / expired:
   لا وصول.
   ========================================================= */

export function accessKeyAllowsAccess(
  accessKey,
  nowValue = Date.now(),
) {
  if (!accessKey) {
    return false;
  }

  if (
    accessKey.revoked_at
  ) {
    return false;
  }

  if (
    !acceptsAccessTestMode(
      accessKey.test_mode,
    )
  ) {
    return false;
  }

  const status =
    String(
      accessKey.status ||
        "",
    ).toLowerCase();

  if (
    status === "revoked" ||
    status === "refunded" ||
    status === "expired" ||
    status === "paused"
  ) {
    return false;
  }

  const startsAt =
    dateValue(
      accessKey.starts_at,
    );

  if (
    startsAt &&
    startsAt > nowValue
  ) {
    return false;
  }

  const expiresAt =
    dateValue(
      accessKey.expires_at,
    );

  if (
    expiresAt &&
    expiresAt <= nowValue
  ) {
    return false;
  }

  if (
    status === "active"
  ) {
    return true;
  }

  /*
   * cancelled:
   * صالح حتى expires_at فقط.
   */

  if (
    status ===
      "cancelled" &&
    expiresAt &&
    expiresAt > nowValue
  ) {
    return true;
  }

  return false;
}


/* =========================================================
   GET PLAN
   ========================================================= */

export async function getAccessPlan(
  supabase,
  planId,
) {
  if (
    !supabase ||
    !planId
  ) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_plans",
      )
      .select("*")
      .eq(
        "id",
        planId,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      "ACCESS_PLAN_LOOKUP_FAILED:" +
        error.message,
    );
  }

  return data || null;
}


/* =========================================================
   CREATE ACCESS KEY
   ========================================================= */

export async function createAccessKey(
  supabase,
  {
    planId,

    source =
      "purchase",

    purchasedByUserId =
      null,

    purchaserEmail =
      null,

    recoveryEmail =
      null,

    recoveryEmailVerified =
      false,

    maxActivations =
      3,

    lemonSubscriptionId =
      null,

    lemonOrderId =
      null,

    lemonCustomerId =
      null,

    lemonProductId =
      null,

    lemonVariantId =
      null,

    testMode =
      false,

    startsAt =
      null,

    expiresAt =
      null,

    note =
      null,

    createdByEmail =
      null,

    metadata =
      {},
  } = {},
) {
  assertServerOnly();

  if (!supabase) {
    throw new Error(
      "SUPABASE_REQUIRED",
    );
  }

  const cleanPlanId =
    String(
      planId || "",
    ).trim();

  if (!cleanPlanId) {
    throw new Error(
      "PLAN_ID_REQUIRED",
    );
  }

  const plan =
    await getAccessPlan(
      supabase,
      cleanPlanId,
    );

  if (!plan) {
    throw new Error(
      "PLAN_NOT_FOUND",
    );
  }

  /*
   * نسمح للأدمن بإنشاء كود
   * لخطة مخفية، لكن لا نسمح
   * لخطة تم حذف/تعطيل تعريفها.
   */

  if (
    plan.active !== true
  ) {
    throw new Error(
      "PLAN_NOT_ACTIVE",
    );
  }

  const cleanPurchaserEmail =
    purchaserEmail
      ? normalizeAccessEmail(
          purchaserEmail,
        )
      : "";

  const cleanRecoveryEmail =
    recoveryEmail
      ? normalizeAccessEmail(
          recoveryEmail,
        )
      : "";

  if (
    purchaserEmail &&
    !cleanPurchaserEmail
  ) {
    throw new Error(
      "INVALID_PURCHASER_EMAIL",
    );
  }

  if (
    recoveryEmail &&
    !cleanRecoveryEmail
  ) {
    throw new Error(
      "INVALID_RECOVERY_EMAIL",
    );
  }

  const activationLimit =
    Math.max(
      1,
      Math.min(
        20,
        Number(
          maxActivations,
        ) || 3,
      ),
    );

  for (
    let attempt = 0;
    attempt < 5;
    attempt += 1
  ) {
    const code =
      generateAccessKeyCode();

    const now =
      new Date().toISOString();

    const record = {
      plan_id:
        cleanPlanId,

      code_hash:
        hashAccessKeyCode(
          code,
        ),

      code_ciphertext:
        encryptAccessKeyCode(
          code,
        ),

      code_hint:
        accessKeyHint(
          code,
        ),

      status:
        "active",

      source,

      purchased_by_user_id:
        purchasedByUserId ||
        null,

      purchaser_email:
        cleanPurchaserEmail ||
        null,

      recovery_email:
        cleanRecoveryEmail ||
        null,

      recovery_email_verified_at:
        recoveryEmailVerified &&
        cleanRecoveryEmail
          ? now
          : null,

      max_activations:
        activationLimit,

      lemon_subscription_id:
        lemonSubscriptionId
          ? String(
              lemonSubscriptionId,
            )
          : null,

      lemon_order_id:
        lemonOrderId
          ? String(
              lemonOrderId,
            )
          : null,

      lemon_customer_id:
        lemonCustomerId
          ? String(
              lemonCustomerId,
            )
          : null,

      lemon_product_id:
        lemonProductId
          ? String(
              lemonProductId,
            )
          : null,

      lemon_variant_id:
        lemonVariantId
          ? String(
              lemonVariantId,
            )
          : null,

      test_mode:
        Boolean(
          testMode,
        ),

      starts_at:
        startsAt ||
        now,

      expires_at:
        expiresAt ||
        null,

      revoked_at:
        null,

      note:
        note || null,

      created_by_email:
        createdByEmail ||
        null,

      metadata:
        metadata &&
        typeof metadata ===
          "object"
          ? metadata
          : {},

      updated_at:
        now,
    };

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "allwdbook_access_keys",
        )
        .insert(
          record,
        )
        .select("*")
        .single();

    if (!error) {
      await recordAccessAudit(
        supabase,
        {
          accessKeyId:
            data.id,

          eventType:
            source ===
            "admin"
              ? "admin_created"
              : "access_key_created",

          actorUserId:
            purchasedByUserId ||
            null,

          actorEmail:
            createdByEmail ||
            cleanPurchaserEmail ||
            null,

          metadata: {
            planId:
              cleanPlanId,

            source,

            testMode:
              Boolean(
                testMode,
              ),
          },
        },
      );

      return {
        accessKey:
          data,

        code,

        plan,
      };
    }

    /*
     * PostgreSQL duplicate key.
     * إذا حدث تصادم عشوائي،
     * نولد كوداً جديداً.
     */

    if (
      error.code ===
        "23505" &&
      String(
        error.message ||
          "",
      )
        .toLowerCase()
        .includes(
          "code_hash",
        )
    ) {
      continue;
    }

    throw new Error(
      "ACCESS_KEY_CREATE_FAILED:" +
        error.message,
    );
  }

  throw new Error(
    "ACCESS_KEY_CODE_COLLISION",
  );
}


/* =========================================================
   FIND ACCESS KEY BY CODE
   ========================================================= */

export async function findAccessKeyByCode(
  supabase,
  code,
) {
  assertServerOnly();

  const normalized =
    normalizeAccessKeyCode(
      code,
    );

  if (!normalized) {
    return null;
  }

  const hash =
    hashAccessKeyCode(
      normalized,
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_keys",
      )
      .select("*")
      .eq(
        "code_hash",
        hash,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      "ACCESS_KEY_LOOKUP_FAILED:" +
        error.message,
    );
  }

  return data || null;
}


/* =========================================================
   FIND BY LEMON SUBSCRIPTION
   ========================================================= */

export async function findAccessKeyBySubscription(
  supabase,
  subscriptionId,
) {
  const cleanId =
    String(
      subscriptionId ||
        "",
    ).trim();

  if (!cleanId) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_keys",
      )
      .select("*")
      .eq(
        "lemon_subscription_id",
        cleanId,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      "ACCESS_KEY_SUBSCRIPTION_LOOKUP_FAILED:" +
        error.message,
    );
  }

  return data || null;
}


/* =========================================================
   FIND BY LEMON ORDER
   ========================================================= */

export async function findAccessKeyByOrder(
  supabase,
  orderId,
) {
  const cleanId =
    String(
      orderId ||
        "",
    ).trim();

  if (!cleanId) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_keys",
      )
      .select("*")
      .eq(
        "lemon_order_id",
        cleanId,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      "ACCESS_KEY_ORDER_LOOKUP_FAILED:" +
        error.message,
    );
  }

  return data || null;
}


/* =========================================================
   REVEAL ACCESS KEY
   ========================================================= */

export function revealAccessKeyCode(
  accessKey,
) {
  assertServerOnly();

  if (
    !accessKey
      ?.code_ciphertext
  ) {
    throw new Error(
      "ACCESS_KEY_CIPHERTEXT_MISSING",
    );
  }

  return decryptAccessKeyCode(
    accessKey
      .code_ciphertext,
  );
}


/* =========================================================
   COUNT ACTIVE DEVICES
   ========================================================= */

export async function countAccessKeyActivations(
  supabase,
  accessKeyId,
) {
  const {
    count,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "access_key_id",
        accessKeyId,
      )
      .is(
        "revoked_at",
        null,
      );

  if (error) {
    throw new Error(
      "ACCESS_KEY_ACTIVATION_COUNT_FAILED:" +
        error.message,
    );
  }

  return count || 0;
}


/* =========================================================
   ACTIVATE ACCESS KEY
   =========================================================
   userId = Supabase anonymous user ID

   إذا نفس الجهاز موجود سابقاً:
   - نعيد تفعيله
   - لا نستهلك Slot جديد

   إذا جهاز جديد:
   - نتحقق من max_activations
   ========================================================= */

export async function activateAccessKey(
  supabase,
  accessKey,
  userId,
  {
    deviceName =
      null,

    deviceInfo =
      {},
  } = {},
) {
  assertServerOnly();

  if (
    !supabase ||
    !accessKey ||
    !userId
  ) {
    throw new Error(
      "ACCESS_KEY_ACTIVATION_DATA_MISSING",
    );
  }

  if (
    !accessKeyAllowsAccess(
      accessKey,
    )
  ) {
    return {
      allowed:
        false,

      reason:
        "ACCESS_KEY_NOT_ACTIVE",
    };
  }

  const cleanUserId =
    String(
      userId,
    ).trim();

  const now =
    new Date().toISOString();

  const {
    data: existing,
    error:
      existingError,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .select("*")
      .eq(
        "access_key_id",
        accessKey.id,
      )
      .eq(
        "user_id",
        cleanUserId,
      )
      .maybeSingle();

  if (existingError) {
    throw new Error(
      "ACCESS_KEY_ACTIVATION_LOOKUP_FAILED:" +
        existingError.message,
    );
  }

  /*
   * نفس الجهاز:
   * نعيد تنشيطه.
   */

  if (existing) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "allwdbook_access_key_activations",
        )
        .update({
          revoked_at:
            null,

          last_seen_at:
            now,

          device_name:
            deviceName ||
            existing.device_name ||
            null,

          device_info:
            deviceInfo &&
            typeof deviceInfo ===
              "object"
              ? deviceInfo
              : existing.device_info ||
                {},
        })
        .eq(
          "id",
          existing.id,
        )
        .select("*")
        .single();

    if (error) {
      throw new Error(
        "ACCESS_KEY_ACTIVATION_UPDATE_FAILED:" +
          error.message,
      );
    }

    await recordAccessAudit(
      supabase,
      {
        accessKeyId:
          accessKey.id,

        eventType:
          "device_reactivated",

        actorUserId:
          cleanUserId,

        metadata: {
          activationId:
            existing.id,
        },
      },
    );

    return {
      allowed: true,

      existing: true,

      activation:
        data,
    };
  }

  const activeCount =
    await countAccessKeyActivations(
      supabase,
      accessKey.id,
    );

  const maxActivations =
    Math.max(
      1,
      Number(
        accessKey
          .max_activations,
      ) || 3,
    );

  if (
    activeCount >=
    maxActivations
  ) {
    await recordAccessAudit(
      supabase,
      {
        accessKeyId:
          accessKey.id,

        eventType:
          "activation_limit_reached",

        actorUserId:
          cleanUserId,

        metadata: {
          activeCount,

          maxActivations,
        },
      },
    );

    return {
      allowed: false,

      reason:
        "ACTIVATION_LIMIT_REACHED",

      activeCount,

      maxActivations,
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .insert({
        access_key_id:
          accessKey.id,

        user_id:
          cleanUserId,

        device_name:
          deviceName ||
          null,

        device_info:
          deviceInfo &&
          typeof deviceInfo ===
            "object"
            ? deviceInfo
            : {},

        activated_at:
          now,

        last_seen_at:
          now,

        revoked_at:
          null,
      })
      .select("*")
      .single();

  if (error) {
    /*
     * لو حصل طلبان في نفس اللحظة
     * وUnique constraint سبقنا،
     * نعيد البحث بدل فشل المستخدم.
     */

    if (
      error.code ===
        "23505"
    ) {
      const {
        data:
          duplicate,
      } =
        await supabase
          .from(
            "allwdbook_access_key_activations",
          )
          .select("*")
          .eq(
            "access_key_id",
            accessKey.id,
          )
          .eq(
            "user_id",
            cleanUserId,
          )
          .maybeSingle();

      if (duplicate) {
        return {
          allowed:
            true,

          existing:
            true,

          activation:
            duplicate,
        };
      }
    }

    throw new Error(
      "ACCESS_KEY_ACTIVATION_CREATE_FAILED:" +
        error.message,
    );
  }

  await recordAccessAudit(
    supabase,
    {
      accessKeyId:
        accessKey.id,

      eventType:
        "code_activated",

      actorUserId:
        cleanUserId,

      metadata: {
        activationId:
          data.id,

        activeCount:
          activeCount +
          1,

        maxActivations,
      },
    },
  );

  return {
    allowed: true,

    existing: false,

    activation:
      data,

    activeCount:
      activeCount + 1,

    maxActivations,
  };
}


/* =========================================================
   TOUCH ACTIVATION
   =========================================================
   يحدث last_seen_at عند استخدام الخطة.
   ========================================================= */

export async function touchAccessKeyActivation(
  supabase,
  accessKeyId,
  userId,
) {
  const {
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .update({
        last_seen_at:
          new Date().toISOString(),
      })
      .eq(
        "access_key_id",
        accessKeyId,
      )
      .eq(
        "user_id",
        userId,
      )
      .is(
        "revoked_at",
        null,
      );

  if (error) {
    console.error(
      "Access activation touch failed:",
      error,
    );
  }
}


/* =========================================================
   REVOKE DEVICE
   =========================================================
   مفيد لاحقاً في لوحة Admin.
   ========================================================= */

export async function revokeAccessKeyActivation(
  supabase,
  activationId,
  {
    actorUserId =
      null,

    actorEmail =
      null,

    reason =
      "manual",
  } = {},
) {
  const {
    data:
      activation,
    error:
      lookupError,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .select("*")
      .eq(
        "id",
        activationId,
      )
      .maybeSingle();

  if (lookupError) {
    throw new Error(
      "ACTIVATION_LOOKUP_FAILED:" +
        lookupError.message,
    );
  }

  if (!activation) {
    return false;
  }

  const now =
    new Date().toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .update({
        revoked_at:
          now,

        last_seen_at:
          now,
      })
      .eq(
        "id",
        activationId,
      );

  if (error) {
    throw new Error(
      "ACTIVATION_REVOKE_FAILED:" +
        error.message,
    );
  }

  await recordAccessAudit(
    supabase,
    {
      accessKeyId:
        activation
          .access_key_id,

      eventType:
        "device_removed",

      actorUserId,

      actorEmail,

      metadata: {
        activationId,

        reason,
      },
    },
  );

  return true;
}


/* =========================================================
   RESET ALL DEVICES
   =========================================================
   Admin يمكنه حذف جميع الأجهزة المرتبطة بالكود
   بدون حذف الكود نفسه.
   ========================================================= */

export async function resetAccessKeyDevices(
  supabase,
  accessKeyId,
  {
    actorEmail =
      null,

    reason =
      "admin_reset",
  } = {},
) {
  const now =
    new Date().toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_key_activations",
      )
      .update({
        revoked_at:
          now,
      })
      .eq(
        "access_key_id",
        accessKeyId,
      )
      .is(
        "revoked_at",
        null,
      );

  if (error) {
    throw new Error(
      "ACCESS_KEY_DEVICE_RESET_FAILED:" +
        error.message,
    );
  }

  await recordAccessAudit(
    supabase,
    {
      accessKeyId,

      eventType:
        "devices_reset",

      actorEmail,

      metadata: {
        reason,
      },
    },
  );

  return true;
}


/* =========================================================
   OTP
   ========================================================= */

export function generateAccessOtp() {
  assertServerOnly();

  return String(
    crypto.randomInt(
      100000,
      1000000,
    ),
  );
}


/* =========================================================
   HASH OTP
   ========================================================= */

export function hashAccessOtp({
  accessKeyId,
  email,
  purpose,
  otp,
}) {
  assertServerOnly();

  const normalizedEmail =
    normalizeAccessEmail(
      email,
    );

  if (
    !accessKeyId ||
    !normalizedEmail ||
    !purpose ||
    !otp
  ) {
    return "";
  }

  return crypto
    .createHmac(
      "sha256",
      accessSecret(),
    )
    .update(
      `${accessKeyId}:${normalizedEmail}:${purpose}:${otp}`,
    )
    .digest("hex");
}


/* =========================================================
   CREATE RECOVERY CHALLENGE
   ========================================================= */

export async function createAccessRecoveryChallenge(
  supabase,
  {
    accessKeyId,
    email,
    purpose =
      "verify_email",
    expiresMinutes =
      10,
  },
) {
  assertServerOnly();

  const normalizedEmail =
    normalizeAccessEmail(
      email,
    );

  if (
    !normalizedEmail
  ) {
    throw new Error(
      "INVALID_RECOVERY_EMAIL",
    );
  }

  const allowedPurposes =
    new Set([
      "verify_email",
      "recover_access",
      "rotate_key",
    ]);

  if (
    !allowedPurposes.has(
      purpose,
    )
  ) {
    throw new Error(
      "INVALID_RECOVERY_PURPOSE",
    );
  }

  const otp =
    generateAccessOtp();

  const expiresAt =
    new Date(
      Date.now() +
        Math.max(
          2,
          Math.min(
            30,
            Number(
              expiresMinutes,
            ) || 10,
          ),
        ) *
          60 *
          1000,
    ).toISOString();

  const otpHash =
    hashAccessOtp({
      accessKeyId,

      email:
        normalizedEmail,

      purpose,

      otp,
    });

  /*
   * نحذف التحديات القديمة غير المستخدمة
   * لنفس العملية.
   */

  await supabase
    .from(
      "allwdbook_access_recovery_challenges",
    )
    .delete()
    .eq(
      "access_key_id",
      accessKeyId,
    )
    .eq(
      "email",
      normalizedEmail,
    )
    .eq(
      "purpose",
      purpose,
    )
    .is(
      "consumed_at",
      null,
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_recovery_challenges",
      )
      .insert({
        access_key_id:
          accessKeyId,

        email:
          normalizedEmail,

        purpose,

        otp_hash:
          otpHash,

        expires_at:
          expiresAt,

        attempts:
          0,

        consumed_at:
          null,
      })
      .select("*")
      .single();

  if (error) {
    throw new Error(
      "RECOVERY_CHALLENGE_CREATE_FAILED:" +
        error.message,
    );
  }

  await recordAccessAudit(
    supabase,
    {
      accessKeyId,

      eventType:
        "recovery_code_requested",

      actorEmail:
        normalizedEmail,

      metadata: {
        purpose,

        challengeId:
          data.id,
      },
    },
  );

  return {
    challenge:
      data,

    otp,
  };
}


/* =========================================================
   VERIFY RECOVERY CHALLENGE
   ========================================================= */

export async function verifyAccessRecoveryChallenge(
  supabase,
  {
    challengeId,
    otp,
  },
) {
  assertServerOnly();

  const cleanOtp =
    String(
      otp || "",
    )
      .trim()
      .replace(
        /\D/g,
        "",
      );

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    return {
      verified: false,

      reason:
        "INVALID_OTP",
    };
  }

  const {
    data:
      challenge,
    error:
      lookupError,
  } =
    await supabase
      .from(
        "allwdbook_access_recovery_challenges",
      )
      .select("*")
      .eq(
        "id",
        challengeId,
      )
      .maybeSingle();

  if (lookupError) {
    throw new Error(
      "RECOVERY_CHALLENGE_LOOKUP_FAILED:" +
        lookupError.message,
    );
  }

  if (!challenge) {
    return {
      verified: false,

      reason:
        "CHALLENGE_NOT_FOUND",
    };
  }

  if (
    challenge
      .consumed_at
  ) {
    return {
      verified: false,

      reason:
        "CHALLENGE_ALREADY_USED",
    };
  }

  const expiresAt =
    dateValue(
      challenge
        .expires_at,
    );

  if (
    !expiresAt ||
    expiresAt <=
      Date.now()
  ) {
    return {
      verified: false,

      reason:
        "CHALLENGE_EXPIRED",
    };
  }

  const attempts =
    Number(
      challenge
        .attempts,
    ) || 0;

  if (
    attempts >= 5
  ) {
    return {
      verified: false,

      reason:
        "TOO_MANY_ATTEMPTS",
    };
  }

  const expected =
    hashAccessOtp({
      accessKeyId:
        challenge
          .access_key_id,

      email:
        challenge.email,

      purpose:
        challenge.purpose,

      otp:
        cleanOtp,
    });

  const matches =
    safeEqualHex(
      expected,
      challenge
        .otp_hash,
    );

  if (!matches) {
    await supabase
      .from(
        "allwdbook_access_recovery_challenges",
      )
      .update({
        attempts:
          attempts + 1,
      })
      .eq(
        "id",
        challenge.id,
      );

    return {
      verified: false,

      reason:
        "INVALID_OTP",
    };
  }

  const now =
    new Date().toISOString();

  const {
    error:
      consumeError,
  } =
    await supabase
      .from(
        "allwdbook_access_recovery_challenges",
      )
      .update({
        consumed_at:
          now,

        attempts:
          attempts + 1,
      })
      .eq(
        "id",
        challenge.id,
      );

  if (
    consumeError
  ) {
    throw new Error(
      "RECOVERY_CHALLENGE_CONSUME_FAILED:" +
        consumeError.message,
    );
  }

  await recordAccessAudit(
    supabase,
    {
      accessKeyId:
        challenge
          .access_key_id,

      eventType:
        "recovery_code_verified",

      actorEmail:
        challenge.email,

      metadata: {
        purpose:
          challenge.purpose,

        challengeId:
          challenge.id,
      },
    },
  );

  return {
    verified: true,

    challenge: {
      ...challenge,

      consumed_at:
        now,
    },
  };
}


/* =========================================================
   AUDIT
   ========================================================= */

export async function recordAccessAudit(
  supabase,
  {
    accessKeyId =
      null,

    eventType,

    actorUserId =
      null,

    actorEmail =
      null,

    metadata =
      {},
  },
) {
  if (
    !supabase ||
    !eventType
  ) {
    return;
  }

  const {
    error,
  } =
    await supabase
      .from(
        "allwdbook_access_audit",
      )
      .insert({
        access_key_id:
          accessKeyId ||
          null,

        event_type:
          String(
            eventType,
          ),

        actor_user_id:
          actorUserId ||
          null,

        actor_email:
          actorEmail ||
          null,

        metadata:
          metadata &&
          typeof metadata ===
            "object"
            ? metadata
            : {},
      });

  /*
   * فشل Audit لا يجب أن يمنع المستخدم
   * من الوصول إلى خطته.
   */

  if (error) {
    console.error(
      "Access audit failed:",
      error,
    );
  }
}
