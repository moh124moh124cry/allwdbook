"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getSupabase,
} from "./supabase";

const EMPTY_ACCESS = {
  loading: true,
  authenticated: false,
  plan: "free",
  plans: [],
  paid: false,
  lifetime: false,
  email: null,
  subscriptions: [],
  billingUrl: null,
};

export function useAccess() {
  const [state, setState] =
    useState(EMPTY_ACCESS);

  useEffect(() => {
    let mounted = true;

    function setEmpty(
      loading = false
    ) {
      if (!mounted) {
        return;
      }

      setState({
        ...EMPTY_ACCESS,
        loading,
      });
    }

    async function loadAccess(
      session
    ) {
      try {
        const token =
          session?.access_token;

        if (!token) {
          setEmpty(false);
          return;
        }

        const response =
          await fetch(
            "/api/access",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.ok
        ) {
          throw new Error(
            data?.error ||
              "ACCESS_CHECK_FAILED"
          );
        }

        if (!mounted) {
          return;
        }

        setState({
          loading: false,

          authenticated:
            Boolean(
              data.authenticated
            ),

          plan:
            data.plan || "free",

          plans:
            Array.isArray(
              data.plans
            )
              ? data.plans
              : [],

          paid:
            Boolean(data.paid),

          lifetime:
            Boolean(
              data.lifetime
            ),

          email:
            data.email || null,

          subscriptions:
            Array.isArray(
              data.subscriptions
            )
              ? data.subscriptions
              : [],

          billingUrl:
            data.billingUrl ||
            null,
        });
      } catch (error) {
        console.error(
          "Access status error:",
          error
        );

        setEmpty(false);
      }
    }

    async function initialize() {
      try {
        const supabase =
          getSupabase();

        const {
          data: { session },
        } =
          await supabase.auth
            .getSession();

        await loadAccess(
          session
        );
      } catch (error) {
        console.error(
          "Access initialization error:",
          error
        );

        setEmpty(false);
      }
    }

    initialize();

    const supabase =
      getSupabase();

    const {
      data: { subscription },
    } =
      supabase.auth
        .onAuthStateChange(
          async (
            _event,
            session
          ) => {
            if (!mounted) {
              return;
            }

            setState(
              (current) => ({
                ...current,
                loading: true,
              })
            );

            await loadAccess(
              session
            );
          }
        );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
