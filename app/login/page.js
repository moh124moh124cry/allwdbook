"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";
import {
  normalizeEmail,
  isValidEmail,
} from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkLogin() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.replace("/");
        }
      } catch {}
    }

    checkLogin();
  }, [router]);

  async function login(event) {
    event.preventDefault();

    setError("");

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      const { error: loginError } =
        await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            emailRedirectTo:
              `${window.location.origin}/`,
          },
        });

      if (loginError) {
        throw loginError;
      }

      setSent(true);
    } catch (err) {
      console.error(err);

      setError(
        "تعذر إرسال رابط تسجيل الدخول."
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
        padding: 20,
        background: "#081426",
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,
          borderRadius: 18,
          background: "#101f38",
          border: "1px solid #263a59",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginTop: 0,
          }}
        >
          AllWDbook
        </h1>

        {!sent ? (
          <form onSubmit={login}>
            <p
              style={{
                textAlign: "center",
                color: "#aebed4",
              }}
            >
              Sign in with your email
            </p>

            <input
              type="email"
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
                marginTop: 10,
                borderRadius: 10,
                border: "1px solid #314667",
                background: "#081426",
                color: "white",
                fontSize: 16,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 15,
                padding: 14,
                border: 0,
                borderRadius: 10,
                background: "#20c967",
                color: "#06150c",
                fontWeight: 800,
                fontSize: 16,
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
              padding: 20,
            }}
          >
            <div style={{ fontSize: 45 }}>
              📧
            </div>

            <h2>Check your email</h2>

            <p
              style={{
                color: "#aebed4",
                lineHeight: 1.7,
              }}
            >
              افتح بريدك واضغط على
              {" "}
              <strong>Sign in</strong>
              {" "}
              للدخول إلى AllWDbook.
            </p>

            <button
              type="button"
              onClick={() => setSent(false)}
              style={{
                background: "transparent",
                border: 0,
                color: "#8fbfff",
              }}
            >
              استخدام بريد آخر
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 15,
              padding: 12,
              borderRadius: 10,
              background: "#3b171b",
              color: "#ffb4bb",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
