"use client";

import { useEffect } from "react";

export default function BlogRedirectPage() {
  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem(
        "awd_lang"
      );

    const language =
      savedLanguage === "en"
        ? "en"
        : "ar";

    window.location.replace(
      `/${language}/blog`
    );
  }, []);

  return null;
}
