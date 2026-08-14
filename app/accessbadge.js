"use client";

import { useAccess } from "../lib/useAccess";

export default function AccessBadge() {
  const access = useAccess();

  if (
    access.loading ||
    !access.authenticated ||
    !access.lifetime
  ) {
    return null;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(52, 211, 153, 0.45)",
        background: "rgba(6, 78, 59, 0.95)",
        color: "#a7f3d0",
        fontSize: 13,
        fontWeight: 800,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
      }}
    >
      <span>♾️</span>
      <span>Lifetime Pro</span>
    </div>
  );
}
