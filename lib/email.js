function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn("Transactional email is not configured");

    return {
      sent: false,
      reason: "EMAIL_NOT_CONFIGURED",
    };
  }

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Resend email failed:", data);

    return {
      sent: false,
      reason: "EMAIL_SEND_FAILED",
    };
  }

  return {
    sent: true,
    id: data?.id || null,
  };
}

export async function sendLifetimeCodeEmail({
  email,
  code,
}) {
  const safeCode = escapeHtml(code);

  return sendTransactionalEmail({
    to: email,
    subject: "AllWDbook — Lifetime access code",
    text:
      `Your AllWDbook Lifetime access is active. ` +
      `Recovery code: ${code}\nKeep this code private.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#172033">
        <h2>AllWDbook Lifetime Pro</h2>

        <p>Your lifetime access is active.</p>

        <p>Your private recovery code:</p>

        <div style="padding:14px;border-radius:10px;background:#f1f5f9;font-size:18px;font-weight:700;letter-spacing:1px">
          ${safeCode}
        </div>

        <p>
          Keep this code private. You can use it to restore
          access on another device.
        </p>

        <hr>

        <p dir="rtl">
          تم تفعيل وصولك مدى الحياة. احتفظ بهذا الرمز بشكل
          آمن لاستعادة وصولك على جهاز آخر.
        </p>
      </div>
    `,
  });
}

export async function sendLicenseOtpEmail({
  email,
  otp,
  purpose,
}) {
  const title =
    purpose === "reset_license"
      ? "AllWDbook — Reset security code"
      : "AllWDbook — Verify recovery email";

  return sendTransactionalEmail({
    to: email,
    subject: title,
    text:
      `AllWDbook verification code: ${otp}. ` +
      `This code expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#172033">
        <h2>AllWDbook</h2>

        <p>Your verification code is:</p>

        <div style="padding:14px;border-radius:10px;background:#f1f5f9;font-size:28px;font-weight:800;letter-spacing:6px;text-align:center">
          ${escapeHtml(otp)}
        </div>

        <p>
          This code expires in 10 minutes.
          Never share it with anyone.
        </p>

        <hr>

        <p dir="rtl">
          رمز التحقق صالح لمدة 10 دقائق.
          لا تشاركه مع أي شخص.
        </p>
      </div>
    `,
  });
}
