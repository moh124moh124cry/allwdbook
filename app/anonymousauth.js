"use client";

import { useEffect } from "react";
import { getSupabase } from "../lib/supabase";

export default function AnonymousAuth() {
  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        // المستخدم مسجل أصلًا، لا نفعل شيئًا
        if (session) return;

        // لا توجد جلسة: إنشاء حساب زائر تلقائي
        const { error } =
          await supabase.auth.signInAnonymously();

        if (error) {
          console.error(
            "Anonymous sign-in failed:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Anonymous auth error:",
          error
        );
      }
    }

    ensureSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
