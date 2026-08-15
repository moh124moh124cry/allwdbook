"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getSupabase } from "./supabase";

const EMPTY_ACCESS = {
  loading: true,
  authenticated: false,
  lifetime: false,
  lifetimeLicense: null,
  email: null,
  plan: "free",
  plans: [],
  paid: false,
  subscriptions: [],
};

async function ensureSession() {
  const supabase = getSupabase();

  const {
    data: {
      session,
    },
  } = await supabase.auth.getSession();

  if (session) {
    return session;
  }

  const {
    data,
    error,
  } =
    await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  return data.session;
}

export function useAccess() {
  const [
    access,
    setAccess,
  ] = useState(EMPTY_ACCESS);

  const refresh =
    useCallback(async () => {
      setAccess((current) => ({
        ...current,
        loading: true,
      }));

      try {
        const session =
          await ensureSession();

        const response = await fetch(
          "/api/access",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },

            cache: "no-store",
          },
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.ok
        ) {
          throw new Error(
            data?.error ||
              "ACCESS_REQUEST_FAILED",
          );
        }

        setAccess({
          loading: false,

          authenticated: Boolean(
            data.authenticated,
          ),

          lifetime: Boolean(
            data.lifetime,
          ),

          lifetimeLicense:
            data.lifetimeLicense || null,

          email:
            data.email || null,

          plan:
            data.plan || "free",

          plans: Array.isArray(
            data.plans,
          )
            ? data.plans
            : [],

          paid: Boolean(
            data.paid,
          ),

          subscriptions:
            Array.isArray(
              data.subscriptions,
            )
              ? data.subscriptions
              : [],
        });
      } catch (error) {
        console.error(
          "Access refresh failed:",
          error,
        );

        setAccess({
          ...EMPTY_ACCESS,
          loading: false,
        });
      }
    }, []);

  useEffect(() => {
    const supabase = getSupabase();

    refresh();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          refresh();
        },
      );

    function handleRefresh() {
      refresh();
    }

    window.addEventListener(
      "allwdbook-access-refresh",
      handleRefresh,
    );

    return () => {
      listener.subscription.unsubscribe();

      window.removeEventListener(
        "allwdbook-access-refresh",
        handleRefresh,
      );
    };
  }, [refresh]);

  return {
    ...access,
    refresh,
    ensureSession,
  };
}
