"use client";

import { useEffect } from "react";

const card = {
  maxWidth: "620px",
  margin: "70px auto",
  padding: "28px 20px",
  background: "#131d33",
  border: "1px solid #22304f",
  borderRadius: "16px",
  textAlign: "center",
  color: "#e8eefc"
};

const title = {
  fontSize: "22px",
  margin: "8px 0 10px"
};

const text = {
  color: "#b8c5dd",
  fontSize: "14px",
  lineHeight: "1.9",
  margin: "0 auto 18px",
  maxWidth: "490px"
};

const retryButton = {
  border: "0",
  background: "#22c55e",
  color: "#07110b",
  fontWeight: "800",
  padding: "11px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "14px",
  margin: "4px"
};

const homeLink = {
  display: "inline-block",
  color: "#93c5fd",
  textDecoration: "none",
  padding: "10px 14px",
  fontSize: "13px",
  margin: "4px"
};

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="wrap">
      <section style={card}>
        <img
          src="/logov3.png"
          alt="AllWDbook"
          width="58"
          height="58"
          style={{
            borderRadius: "50%",
            marginBottom: "10px"
          }}
        />

        <div dir="rtl">
          <h1 style={title}>حدث خطأ غير متوقع</h1>
          <p style={text}>
            لم نتمكن من إكمال هذه العملية الآن. يمكنك إعادة المحاولة،
            وإذا استمرت المشكلة يمكنك الرجوع إلى الصفحة الرئيسية.
          </p>
        </div>

        <div dir="ltr">
          <h2 style={{ ...title, fontSize: "18px" }}>
            Something went wrong
          </h2>
          <p style={text}>
            AllWDbook could not complete this operation. Try again,
            or return to the main tool if the problem continues.
          </p>
        </div>

        <div>
          <button type="button" onClick={() => reset()} style={retryButton}>
            إعادة المحاولة · Try again
          </button>

          <a href="/" style={homeLink}>
            الرئيسية · Home
          </a>
        </div>
      </section>
    </main>
  );
}
