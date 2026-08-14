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

  function resetMessages() {
    setMessage("");
    setError("");
  }

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
    if (!session?.access_token) {
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/admin/lifetime"
      );

      setItems(
        Array.isArray(data?.items)
          ? data.items
          : []
      );
    } catch (err) {
      if (
        err?.status === 401 ||
        err?.status === 403
      ) {
        setError(
          "ليس لديك صلاحية الدخول إلى لوحة الإدارة."
        );
      } else {
        setError(
          "تعذر تحميل قائمة Lifetime."
        );
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

        if (!mounted) {
          return;
        }

        if (!currentSession) {
          router.replace("/login");
          return;
        }

        setSession(currentSession);
      } catch {
        if (mounted) {
          setError(
            "تعذر التحقق من تسجيل الدخول."
          );
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

    resetMessages();

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError("أدخل البريد الإلكتروني.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest(
        "/api/admin/lifetime",
        {
          method: "POST",
          body: JSON.stringify({
            email: normalizedEmail,
            note: String(note || "").trim(),
          }),
        }
      );

      setEmail("");
      setNote("");

      setMessage(
        "✅ تم تفعيل Lifetime Pro لهذا البريد."
      );

      await loadItems();
    } catch (err) {
      if (err?.message === "INVALID_EMAIL") {
        setError(
          "البريد الإلكتروني غير صحيح."
        );
      } else if (
        err?.status === 401 ||
        err?.status === 403
      ) {
        setError(
          "ليس لديك صلاحية تنفيذ هذه العملية."
        );
      } else {
        setError(
          "تعذر تفعيل Lifetime. حاول مرة أخرى."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeLifetime(targetEmail) {
    const confirmed = window.confirm(
      `هل تريد حذف Lifetime من:\n${targetEmail} ؟`
    );

    if (!confirmed) {
      return;
    }

    resetMessages();
    setSaving(true);

    try {
      await apiRequest(
        "/api/admin/lifetime",
        {
          method: "DELETE",
          body: JSON.stringify({
            email: targetEmail,
          }),
        }
      );

      setMessage(
        "تم حذف Lifetime من الحساب."
      );

      await loadItems();
    } catch (err) {
      if (
        err?.status === 401 ||
        err?.status === 403
      ) {
        setError(
          "ليس لديك صلاحية تنفيذ هذه العملية."
        );
      } else {
        setError(
          "تعذر حذف البريد."
        );
      }
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
        padding: "20px 14px 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            👑 AllWDbook Admin
          </h1>

          <p
            style={{
              color: "#9fb0c9",
              lineHeight: 1.7,
            }}
          >
            إدارة حسابات Lifetime Pro
          </p>

          {session?.user?.email && (
            <div
              style={{
                fontSize: 14,
                color: "#8ca0bd",
                marginTop: 8,
              }}
            >
              المدير: {session.user.email}
            </div>
          )}
        </header>

        <section
          style={{
            background: "#101f38",
            border: "1px solid #243653",
            borderRadius: 18,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 21,
            }}
          >
            ➕ إضافة Lifetime Pro
          </h2>

          <form onSubmit={addLifetime}>
            <label
              htmlFor="lifetime-email"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              البريد الإلكتروني
            </label>

            <input
              id="lifetime-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#081426",
                color: "#ffffff",
                border: "1px solid #314667",
                borderRadius: 12,
                padding: "14px",
                fontSize: 16,
                outline: "none",
                direction: "ltr",
              }}
            />

            <label
              htmlFor="lifetime-note"
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
              id="lifetime-note"
              type="text"
              maxLength={300}
              placeholder="مثلاً: Owner / Partner / Gift"
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              disabled={saving}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#081426",
                color: "#ffffff",
                border: "1px solid #314667",
                borderRadius: 12,
                padding: "14px",
                fontSize: 16,
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                border: 0,
                borderRadius: 12,
                padding: "15px",
                marginTop: 16,
                fontSize: 17,
                fontWeight: 800,
                cursor: saving
                  ? "wait"
                  : "pointer",
                background: "#20c967",
                color: "#06150c",
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
              padding: 14,
              borderRadius: 12,
              background: "#103522",
              border: "1px solid #1e7144",
              marginBottom: 18,
              color: "#8ff0b6",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#3b171b",
              border: "1px solid #81313a",
              marginBottom: 18,
              color: "#ffb4bb",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: "#101f38",
            border: "1px solid #243653",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 21,
                }}
              >
                ♾️ حسابات Lifetime
              </h2>

              <div
                style={{
                  marginTop: 6,
                  color: "#91a3bd",
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
                background: "#172a49",
                color: "#ffffff",
                border: "1px solid #314667",
                borderRadius: 10,
                padding: "10px 13px",
                cursor: "pointer",
              }}
            >
              🔄 تحديث
            </button>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: 30,
                color: "#91a3bd",
              }}
            >
              جارٍ التحميل...
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 30,
                color: "#91a3bd",
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
                    border: "1px solid #243653",
                    borderRadius: 13,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      direction: "ltr",
                      textAlign: "left",
                      fontWeight: 800,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.email}
                  </div>

                  {item.note && (
                    <div
                      style={{
                        marginTop: 7,
                        color: "#9fb0c9",
                        fontSize: 14,
                      }}
                    >
                      {item.note}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 8,
                      color: item.active
                        ? "#75e7a0"
                        : "#ffbd66",
                      fontSize: 14,
                    }}
                  >
                    {item.active
                      ? "✅ Lifetime Pro مفعل"
                      : "غير مفعل"}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeLifetime(item.email)
                    }
                    disabled={saving}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      border: "1px solid #833842",
                      borderRadius: 10,
                      background: "#35171c",
                      color: "#ffb8bf",
                      padding: 11,
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
            marginTop: 22,
            border: "1px solid #314667",
            borderRadius: 12,
            background: "transparent",
            color: "#aebed4",
            padding: 13,
            cursor: "pointer",
          }}
        >
          تسجيل الخروج
        </button>
      </div>
    </main>
  );
}
