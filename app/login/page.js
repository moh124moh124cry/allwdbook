"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";
import {
  normalizeEmail,
  validateEmail,
} from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (active && session?.user) {
          router.replace("/");
        }
      } catch {
        // Ignore here. The user can still use the login form.
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function sendCode(event) {
    event?.preventDefault();

    setError("");
    setMessage("");

    const result = validateEmail(email);

    if (!result.valid) {
      setError(
        result.error === "EMAIL_REQUIRED"
          ? "أدخل بريدك الإلكتروني."
          : "البريد الإلكتروني غير صحيح."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const normalizedEmail = normalizeEmail(result.email);

      const { error: sendError } =
        await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: true,
          },
        });

      if (sendError) {
        throw sendError;
      }

      setEmail(normalizedEmail);
      setStep("code");

      setMessage(
        "أرسلنا رمز الدخول إلى بريدك الإلكتروني."
      );
    } catch (err) {
      setError(
        err?.message ||
          "تعذر إرسال الرمز. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event) {
    event?.preventDefault();

    setError("");
    setMessage("");

    const token = String(code || "")
      .replace(/\D/g, "")
      .trim();

    if (token.length < 6) {
      setError("أدخل رمز التحقق الذي وصلك بالبريد.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      const { error: verifyError } =
        await supabase.auth.verifyOtp({
          email: normalizeEmail(email),
          token,
          type: "email",
        });

      if (verifyError) {
        throw verifyError;
      }

      setMessage("تم تسجيل الدخول بنجاح.");

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err?.message ||
          "الرمز غير صحيح أو انتهت صلاحيته."
      );
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    setStep("email");
    setCode("");
    setError("");
    setMessage("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#f7f8fb",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#ffffff",
          border: "1px solid #e7e9ef",
          borderRadius: 20,
          padding: 24,
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            AllWDbook
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#667085",
              lineHeight: 1.6,
            }}
          >
            تسجيل سريع بالبريد الإلكتروني فقط
            <br />
            Email-only sign in
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={sendCode}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              البريد الإلكتروني
            </label>

            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="name@example.com"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 15px",
                fontSize: 16,
                borderRadius: 12,
                border: "1px solid #d0d5dd",
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "14px 16px",
                border: 0,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading
                  ? "wait"
                  : "pointer",
                background: "#111827",
                color: "#ffffff",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "جارٍ الإرسال..."
                : "إرسال رمز الدخول"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <p
              style={{
                marginTop: 0,
                color: "#475467",
                lineHeight: 1.6,
              }}
            >
              أدخل الرمز المرسل إلى:
              <br />
              <strong>{email}</strong>
            </p>

            <label
              htmlFor="code"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              رمز التحقق
            </label>

            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 8)
                )
              }
              placeholder="123456"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 15px",
                fontSize: 22,
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: 6,
                borderRadius: 12,
                border: "1px solid #d0d5dd",
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "14px 16px",
                border: 0,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading
                  ? "wait"
                  : "pointer",
                background: "#111827",
                color: "#ffffff",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "جارٍ التحقق..."
                : "تسجيل الدخول"}
            </button>

            <button
              type="button"
              onClick={sendCode}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 10,
                padding: 10,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              إعادة إرسال الرمز
            </button>

            <button
              type="button"
              onClick={changeEmail}
              disabled={loading}
              style={{
                width: "100%",
                padding: 10,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "#667085",
              }}
            >
              تغيير البريد الإلكتروني
            </button>
          </form>
        )}

        {message && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              background: "#ecfdf3",
              color: "#027a48",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              background: "#fef3f2",
              color: "#b42318",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            margin: "22px 0 0",
            textAlign: "center",
            color: "#98a2b3",
            fontSize: 13,
          }}
        >
          لا كلمة مرور · لا رقم هاتف · لا معلومات إضافية
        </p>
      </section>
    </main>
  );
}
