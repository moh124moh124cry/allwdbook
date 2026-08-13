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
        background: "#f7f8
