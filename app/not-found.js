export const metadata = {
  title: "Page Not Found — AllWDbook",
  robots: {
    index: false,
    follow: false
  }
};

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

const code = {
  fontSize: "54px",
  fontWeight: "900",
  margin: "0",
  color: "#60a5fa"
};

const title = {
  fontSize: "22px",
  margin: "6px 0 12px"
};

const text = {
  color: "#b8c5dd",
  fontSize: "14px",
  lineHeight: "1.9",
  margin: "0 auto 18px",
  maxWidth: "480px"
};

const button = {
  display: "inline-block",
  background: "#22c55e",
  color: "#07110b",
  textDecoration: "none",
  fontWeight: "800",
  padding: "11px 18px",
  borderRadius: "10px",
  marginTop: "4px"
};

export default function NotFound() {
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
            marginBottom: "12px"
          }}
        />

        <p style={code}>404</p>

        <div dir="rtl">
          <h1 style={title}>الصفحة غير موجودة</h1>
          <p style={text}>
            الرابط الذي فتحته غير موجود أو تم نقله.
            يمكنك الرجوع مباشرة إلى أدوات AllWDbook ومتابعة عملك.
          </p>
        </div>

        <div dir="ltr">
          <h2 style={{ ...title, fontSize: "18px" }}>
            Page not found
          </h2>
          <p style={text}>
            The page you requested does not exist or may have moved.
            Return to AllWDbook and continue using the publisher tools.
          </p>
        </div>

        <a href="/" style={button}>
          العودة إلى AllWDbook · Back to AllWDbook
        </a>
      </section>
    </main>
  );
}
