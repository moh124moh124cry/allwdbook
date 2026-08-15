"use client";

import {
  useEffect,
  useState,
} from "react";

const SEEN_KEY =
  "awd_welcome_seen_v1";

const CONTENT = {
  ar: {
    title:
      "مرحبًا بك في AllWDbook",

    description:
      "أدوات احترافية تساعد ناشري Amazon KDP على اكتشاف الأفكار، تجهيز الأغلفة وتحويل المشاريع إلى كتب جاهزة للنشر.",

    motivation:
      "ابدأ مجانًا، جرّب الأدوات وحوّل فكرتك إلى كتاب ناجح.",

    start: "ابدأ مجانًا",
  },

  en: {
    title:
      "Welcome to AllWDbook",

    description:
      "Professional tools that help Amazon KDP publishers discover ideas, prepare covers, and turn projects into publishable books.",

    motivation:
      "Start for free, explore the tools, and turn your idea into a successful book.",

    start: "Start for free",
  },
};

export default function WelcomeOverlay() {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    language,
    setLanguage,
  ] = useState("ar");

  useEffect(() => {
    try {
      const savedLanguage =
        localStorage.getItem("awd_lang");

      if (
        savedLanguage === "ar" ||
        savedLanguage === "en"
      ) {
        setLanguage(savedLanguage);
      }

      if (
        localStorage.getItem(
          SEEN_KEY,
        ) !== "yes"
      ) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) {
    return null;
  }

  const text = CONTENT[language];

  const isEnglish =
    language === "en";

  function chooseLanguage(
    nextLanguage,
  ) {
    setLanguage(nextLanguage);

    try {
      localStorage.setItem(
        "awd_lang",
        nextLanguage,
      );
    } catch {}

    document.documentElement.lang =
      nextLanguage;

    document.documentElement.dir =
      nextLanguage === "en"
        ? "ltr"
        : "rtl";

    window.dispatchEvent(
      new CustomEvent(
        "awd-language-change",
        {
          detail: nextLanguage,
        },
      ),
    );
  }

  function start() {
    try {
      localStorage.setItem(
        SEEN_KEY,
        "yes",
      );

      localStorage.setItem(
        "awd_lang",
        language,
      );
    } catch {}

    window.dispatchEvent(
      new CustomEvent(
        "awd-language-change",
        {
          detail: language,
        },
      ),
    );

    setOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30000,
        display: "grid",
        placeItems: "center",
        padding: 18,
        background:
          "rgba(3, 10, 22, .88)",
        backdropFilter: "blur(8px)",
      }}
    >
      <section
        dir={
          isEnglish ? "ltr" : "rtl"
        }
        style={{
          width: "min(570px, 100%)",
          boxSizing: "border-box",
          padding: "26px 22px",
          borderRadius: 24,
          background:
            "linear-gradient(145deg, #ffffff, #f2f7ff)",
          color: "#172033",
          textAlign: "center",
          border:
            "2px solid #d9e6f5",
          boxShadow:
            "0 30px 100px rgba(0,0,0,.55)",
        }}
      >
        <img
          src="/logov3.png"
          alt="AllWDbook"
          width="82"
          height="82"
          style={{
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 10,
            margin: "18px 0",
          }}
        >
          <button
            type="button"
            onClick={() =>
              chooseLanguage("ar")
            }
            style={{
              padding: 12,
              borderRadius: 12,

              border:
                language === "ar"
                  ? "2px solid #16864a"
                  : "1px solid #ccd7e6",

              background:
                language === "ar"
                  ? "#eafaf1"
                  : "#ffffff",

              color: "#172033",
              fontWeight: 900,
            }}
          >
            🇩🇿 العربية
          </button>

          <button
            type="button"
            onClick={() =>
              chooseLanguage("en")
            }
            style={{
              padding: 12,
              borderRadius: 12,

              border:
                language === "en"
                  ? "2px solid #2776d2"
                  : "1px solid #ccd7e6",

              background:
                language === "en"
                  ? "#eaf3ff"
                  : "#ffffff",

              color: "#172033",
              fontWeight: 900,
            }}
          >
            🇺🇸 English
          </button>
        </div>

        <h1
          style={{
            margin: "8px 0 12px",
            fontSize: 29,
          }}
        >
          {text.title}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#53647a",
            lineHeight: 1.9,
          }}
        >
          {text.description}
        </p>

        <p
          style={{
            margin: "14px 0 20px",
            color: "#16864a",
            fontWeight: 900,
            lineHeight: 1.8,
          }}
        >
          {text.motivation}
        </p>

        <button
          type="button"
          onClick={start}
          style={{
            width: "100%",
            minHeight: 54,
            border: 0,
            borderRadius: 14,

            background:
              "linear-gradient(135deg, #ff8a00, #f05a20)",

            color: "#ffffff",
            fontSize: 18,
            fontWeight: 900,

            boxShadow:
              "0 12px 28px rgba(240,90,32,.3)",
          }}
        >
          {text.start} 🚀
        </button>
      </section>
    </div>
  );
}
