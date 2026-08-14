"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";

export default function AdminButton() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  async function checkAdmin(session) {
    const token = session?.access_token;

    if (!token) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/lifetime",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      setIsAdmin(response.ok);
    } catch {
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const supabase = getSupabase();

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          await checkAdmin(session);
        }
      } catch {
        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setChecking(true);
          await checkAdmin(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checking || !isAdmin) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/admin")}
      style={{
        border: "1px solid rgba(255, 215, 0, 0.45)",
        borderRadius: 10,
        padding: "8px 12px",
        background:
          "linear-gradient(135deg, #2a2105, #17130a)",
        color: "#ffd95a",
        fontWeight: 800,
        fontSize: 14,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      title="AllWDbook Admin"
    >
      👑 Admin
    </button>
  );
}
