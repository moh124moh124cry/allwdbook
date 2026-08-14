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

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session) {
          router.replace("/");
        }
      } catch {
        // Keep login page visible.
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSent(false);

    const normalizedEmail = normalizeEmail(email);

    const validation = validateEmail(normalizedEmail);

    if (!validation?.valid) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      const { error: signInError } =
        await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

      if (signInError) {
        throw signInError;
      }

      setSent(true);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "تعذر إرسال رابط تسجيل الدخول. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#081426",
        padding: 20,
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#101f38",
          border: "1px solid #263a59",
          borderRadius: 20,
          padding: 24,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          AllWDbook
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#9fb0c9",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Sign in with your email
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 14,
                borderRadius: 12,
                border: "1px solid #314667",
                background: "#081426",
                color: "#ffffff",
                fontSize: 16,
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 16,
                border: 0,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                fontWeight: 800,
                background: "#20c967",
                color: "#06150c",
                cursor: loading
                  ? "wait"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Sending..."
                : "Send sign-in link"}
            </button>
          </form>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "12px 0",
            }}
         
