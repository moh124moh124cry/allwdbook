"use client";
import { useState, useEffect } from "react";

const WHATSAPP = "447576046023";
const EMAIL = "anesscherfaoui@gmail.com";

const L = {
  ar: {
    dir: "rtl",
    open: "اقتراح أو شكوى",
    title: "✏️ اقتراح أو شكوى",
    sub: "رأيك يطوّر الأداة. نقرأ كل رسالة.",
    fEmail: "بريدك الإلكتروني",
    phEmail: "name@example.com",
    fMsg: "اكتب اقتراحك أو مشكلتك",
    phMsg: "مثال: أريد مقاس غلاف للكتب المجلدة...",
    wa: "إرسال عبر واتساب",
    mail: "إرسال عبر البريد",
    close: "إغلاق",
    errMsg: "اكتب رسالة من 5 أحرف على الأقل.",
    errMail: "تحقق من صيغة البريد الإلكتروني.",
    ok: "شكراً لك. أكمل الإرسال في التطبيق الذي فُتح.",
    subject: "اقتراح أو شكوى",
    priv: "لا نحتفظ برسالتك في قاعدة بيانات AllWDbook."
  },
  en: {
    dir: "ltr",
    open: "Feedback",
    title: "✏️ Feedback or issue",
    sub: "Your input shapes this tool. We read every message.",
    fEmail: "Your email",
    phEmail: "name@example.com",
    fMsg: "Write your suggestion or problem",
    phMsg: "Example: please add hardcover trim sizes...",
    wa: "Send via WhatsApp",
    mail: "Send via Email",
    close: "Close",
    errMsg: "Please write at least 5 characters.",
    errMail: "Please check the email format.",
    ok: "Thank you. Finish sending in the app that opened.",
    subject: "Feedback",
    priv: "We do not store your message in an AllWDbook database."
  }
};

export default function Feedback() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("ar");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(function () {
    try {
      const s = localStorage.getItem("awd_lang");
      if (s === "en" || s === "ar") setLang(s);
    } catch (e) {}
  }, [open]);

  const t = L[lang];

  function goodEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function body() {
    return [
      "AllWDbook — " + t.subject,
      t.fEmail + ": " + (email.trim() || "-"),
      t.fMsg + ":",
      msg.trim()
    ].join("\n");
  }

  function check() {
    if (msg.trim().length < 5) {
      setErr(t.errMsg);
      return false;
    }
    if (email.trim() && !goodEmail(email)) {
      setErr(t.errMail);
      return false;
    }
    setErr("");
    return true;
  }

  function sendWa() {
    if (!check()) return;
    const url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(body());
    window.open(url, "_blank", "noopener,noreferrer");
    setDone(true);
  }

  function sendMail() {
    if (!check()) return;
    const url =
      "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent("AllWDbook — " + t.subject) +
      "&body=" + encodeURIComponent(body());
    window.location.href = url;
    setDone(true);
  }

  function reset() {
    setOpen(false);
    setErr("");
    setDone(false);
    setMsg("");
  }

  const fab = {
    position: "fixed",
    bottom: "calc(14px + env(safe-area-inset-bottom))",
    insetInlineEnd: "14px",
    zIndex: 60,
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    border: "1px solid #22304f",
    background: "#22c55e",
    color: "#062012",
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.35)"
  };

  const panel = {
    position: "fixed",
    bottom: "calc(68px + env(safe-area-inset-bottom))",
    insetInlineEnd: "14px",
    zIndex: 61,
    width: "320px",
    maxWidth: "calc(100vw - 28px)",
    maxHeight: "calc(100vh - 96px)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    background: "#131d33",
    border: "1px solid #22304f",
    borderRadius: "14px",
    padding: "14px",
    boxSizing: "border-box",
    direction: t.dir,
    textAlign: t.dir === "rtl" ? "right" : "left",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)"
  };

  const field = {
    width: "100%",
    boxSizing: "border-box",
    background: "#0b1220",
    color: "#e8eefc",
    border: "1px solid #22304f",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "14px",
    marginTop: "6px",
    fontFamily: "inherit"
  };

  const btn = {
    width: "100%",
    boxSizing: "border-box",
    border: "none",
    borderRadius: "10px",
    padding: "11px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px"
  };

  return (
    <div>
      {open ? (
        <div style={panel}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#e8eefc" }}>{t.title}</div>
          <div style={{ fontSize: "12px", color: "#93a4c4", marginTop: "4px" }}>{t.sub}</div>

          <div style={{ fontSize: "12px", color: "#93a4c4", marginTop: "10px" }}>{t.fEmail}</div>
          <input
            style={field}
            type="email"
            value={email}
            placeholder={t.phEmail}
            onChange={function (e) { setEmail(e.target.value); }}
          />

          <div style={{ fontSize: "12px", color: "#93a4c4", marginTop: "10px" }}>{t.fMsg}</div>
          <textarea
            style={{ ...field, height: "90px", resize: "vertical" }}
            value={msg}
            placeholder={t.phMsg}
            onChange={function (e) { setMsg(e.target.value); }}
          />

          {err ? (
            <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "8px" }}>⚠️ {err}</div>
          ) : null}

          {done ? (
            <div style={{ fontSize: "12px", color: "#22c55e", marginTop: "8px" }}>✅ {t.ok}</div>
          ) : null}

          <button style={{ ...btn, background: "#22c55e", color: "#062012" }} onClick={sendWa}>
            🟢 {t.wa}
          </button>

          <button
            style={{ ...btn, background: "#0b1220", color: "#e8eefc", border: "1px solid #22304f" }}
            onClick={sendMail}
          >
            ✉️ {t.mail}
          </button>

          <button
            style={{ ...btn, background: "transparent", color: "#93a4c4", marginTop: "4px" }}
            onClick={reset}
          >
            {t.close}
          </button>

          <div style={{ fontSize: "10px", color: "#93a4c4", marginTop: "8px" }}>🔒 {t.priv}</div>
        </div>
      ) : null}

      <button
        style={fab}
        title={t.open}
        aria-label={t.open}
        onClick={function () { setOpen(!open); }}
      >
        {open ? "×" : "✏️"}
      </button>
    </div>
  );
}
