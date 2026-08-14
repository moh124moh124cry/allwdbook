"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function apiRequest(path, options = {}) {
    if (!session?.access_token) {
      throw new Error("NO_SESSION");
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {}),
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(data?.error || "REQUEST_FAILED");
      err.status = response.status;
      throw err;
    }

    return data;
  }

  const loadItems = useCallback(async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/admin/lifetime");
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setError("ليس لديك صلاحية الدخول إلى لوحة الإدارة.");
      } else {
        setError("تعذر تحميل حسابات Lifetime.");
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const supabase = getSupabase();

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!currentSession) {
          router.replace("/login");
          return;
        }

        setSession(currentSession);
      } catch {
        if (mounted) {
          setError("تعذر التحقق من تسجيل الدخول.");
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (session?.access_token) {
      loadItems();
    }
  }, [session, loadItems]);

  async function addLifetime(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      setError("أدخل البريد الإلكتروني.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest("/api/admin/lifetime", {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          note: String(note || "").trim(),
        }),
      });

      setEmail("");
      setNote("");
      setMessage("✅ تم تفعيل Lifetime Pro بنجاح.");
      await loadItems();
    } catch (err) {
      if (err?.message === "INVALID_EMAIL") {
        setError("البريد الإلكتروني غير صحيح.");
      } else {
        setError("تعذر تفعيل Lifetime Pro.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeLifetime(targetEmail) {
    const confirmed = window.confirm(
      `هل تريد حذف Lifetime من:\n${targetEmail} ؟`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");
    setSaving(true);

    try {
      await apiRequest("/api/admin/lifetime", {
        method: "DELETE",
        body: JSON.stringify({
          email: targetEmail,
        }),
      });

      setMessage("تم حذف Lifetime من الحساب.");
      await loadItems();
    } catch {
      setError("تعذر حذف الحساب.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#081426",
        color: "#ffffff",
        padding: "28px 14px 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 30,
              background: "#13233e",
              border: "1px solid #2c4265",
            }}
          >
            👑
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.2,
            }}
          >
            AllWDbook Admin
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#91a4c0",
              fontSize: 15,
            }}
          >
            إدارة حسابات Lifetime Pro
          </p>

          {session?.user?.email && (
            <div
              style={{
                marginTop: 12,
                display: "inline-block",
                maxWidth: "100%",
                padding: "8px 12px",
                borderRadius: 12,
                background: "#0d1b30",
                border: "1px solid #223957",
                color: "#a7b8cf",
                fontSize: 13,
                direction: "ltr",
                overflowWrap: "anywhere",
              }}
            >
              {session.user.email}
            </div>
          )}
        </header>

        <section
          style={{
            background: "#10203a",
            border: "1px solid #283c5b",
            borderRadius: 20,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 20,
            }}
          >
            ➕ إضافة Lifetime Pro
          </h2>

          <form onSubmit={addLifetime}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              البريد الإلكتروني
            </label>

            <input
              type="email"
              inputMode="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 15px",
                borderRadius: 13,
                border: "1px solid #324a70",
                background: "#081426",
                color: "#ffffff",
                fontSize: 16,
                outline: "none",
                direction: "ltr",
              }}
            />

            <label
              style={{
                display: "block",
                marginTop: 16,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              ملاحظة اختيارية
            </label>

            <input
              type="text"
              maxLength={300}
              placeholder="Owner / Partner / Gift"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 15px",
                borderRadius: 13,
                border: "1px solid #324a70",
                background: "#081426",
                color: "#ffffff",
                fontSize: 16,
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                marginTop: 18,
                padding: "15px",
                border: 0,
                borderRadius: 13,
                background: "#20c967",
                color: "#06150c",
                fontWeight: 900,
                fontSize: 16,
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "جارٍ التنفيذ..."
                : "تفعيل Lifetime Pro"}
            </button>
          </form>
        </section>

        {message && (
          <div
            style={{
              marginBottom: 18,
              padding: 13,
              borderRadius: 13,
              background: "#103522",
              border: "1px solid #1e7144",
              color: "#8ff0b6",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: 13,
              borderRadius: 13,
              background: "#3b171b",
              border: "1px solid #81313a",
              color: "#ffb4bb",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: "#10203a",
            border: "1px solid #283c5b",
            borderRadius: 20,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                ♾️ حسابات Lifetime
              </h2>

              <div
                style={{
                  marginTop: 6,
                  color: "#91a4c0",
                  fontSize: 14,
                }}
              >
                العدد: {items.length}
              </div>
            </div>

            <button
              type="button"
              onClick={loadItems}
              disabled={loading || saving}
              style={{
                border: "1px solid #324a70",
                borderRadius: 11,
                background: "#172b4a",
                color: "#ffffff",
                padding: "10px 13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔄 تحديث
            </button>
          </div>

          {loading ? (
            <div
              style={{
                padding: 28,
                textAlign: "center",
                color: "#91a4c0",
              }}
            >
              جارٍ التحميل...
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                padding: "30px 10px",
                textAlign: "center",
                color: "#91a4c0",
              }}
            >
              لا توجد حسابات Lifetime بعد.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {items.map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: "#081426",
                    border: "1px solid #263b5c",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      direction: "ltr",
                      textAlign: "left",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.email}
                  </div>

                  {item.note && (
                    <div
                      style={{
                        marginTop: 8,
                        color: "#91a4c0",
                        fontSize: 14,
                      }}
                    >
                      {item.note}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 8,
                      color: "#75e7a0",
                      fontSize: 14,
                    }}
                  >
                    ✅ Lifetime Pro مفعل
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLifetime(item.email)}
                    disabled={saving}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      padding: 11,
                      borderRadius: 10,
                      border: "1px solid #793640",
                      background: "#34171c",
                      color: "#ffb6bd",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    حذف Lifetime
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={signOut}
          style={{
            width: "100%",
            marginTop: 18,
            padding: 14,
            borderRadius: 13,
            border: "1px solid #2b4264",
            background: "#0c192d",
            color: "#aebed4",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          تسجيل الخروج
        </button>
      </div>
    </main>
  );
}
