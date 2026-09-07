"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BlogScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}
