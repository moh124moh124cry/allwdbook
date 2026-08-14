"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";

export function useAccess() {
  const [state, setState] = useState({
    loading: true,
    authenticated: false,
    plan: "free",
    lifetime: false,
    email: null,
  });

  useEffect(() => {
    let mounted = true;

    async function loadAccess(session) {
      try {
        const token = session?.access_token;

        if (!token) {
          if (mounted) {
            setState({
              loading: false,
              authenticated: false,
              plan: "free",
              lifetime: false,
              email: null,
            });
          }

          return;
        }

        const response = await fetch(
          "/api/access",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(
            data?.error || "ACCESS_CHECK_FAILED"
          );
        }

        if (mounted) {
          setState({
            loading: false,
            authenticated:
              Boolean(data.authenticated),
            plan: data.plan || "free",
            lifetime:
              Boolean(data.lifetime),
            email: data.email || null,
          });
        }
      } catch (error) {
        console.error(
          "Access status error:",
          error
        );

        if (mounted) {
          setState({
            loading: false,
            authenticated: false,
            plan: "free",
            lifetime: false,
            email: null,
          });
        }
      }
    }

    async function initialize() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        await loadAccess(session);
      } catch {
        if (mounted) {
          setState({
            loading: false,
            authenticated: false,
            plan: "free",
            lifetime: false,
            email: null,
          });
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
          setState((current) => ({
            ...current,
            loading: true,
          }));

          await loadAccess(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
