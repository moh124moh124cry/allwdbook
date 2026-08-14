"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";

export default function AdminButton() {
  const router = useRouter();
  const pathname = usePathname();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin(session) {
      const token = session?.access_token;

      if (!token) {
        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      try {
        const response = await fetch(
          "/api/admin/lifetime",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (mounted) {
          setIsAdmin(response.ok);
        }
      } catch {
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    async function initialize() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        await checkAdmin(session);
      } catch {
        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    }

    initialize();

    const supabase = getSupabase();

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

  if (
    checking ||
    !isAdmin ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/admin")}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        minWidth: 92,
        height: 42,
        padding: "0 15px",
        borderRadius: 14,
        border: "1px solid rgba(255, 204, 51, 0.55)",
        background:
          "linear-gradient(135deg, #3a2b00, #17130a)",
        color: "#ffd85a",
        fontSize: 14,
        fontWeight: 800,
        boxShadow:
          "0 8px 24px rgba(0, 0, 0, 0.28)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 18 }}>👑</span>
      <span>Admin</span>
    </button>
  );
}
