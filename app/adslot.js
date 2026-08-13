const ADS_ON = false;

const bar = {
  position: "static",
  width: "100%",
  minHeight: "52px",
  background: "#0f1830",
  borderTop: "1px solid #22304f",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 14px",
  boxSizing: "border-box",
  flexWrap: "wrap"
};

const link = {
  color: "#93a4c4",
  fontSize: "12px",
  textDecoration: "none",
  padding: "6px 8px"
};

const sep = {
  color: "#22304f",
  fontSize: "12px"
};

const slot = {
  minWidth: "150px",
  height: "36px",
  padding: "0 12px",
  border: "1px dashed #22304f",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3d4c6b",
  fontSize: "11px",
  letterSpacing: "1px"
};

export default function AdSlot() {
  return (
    <div style={bar}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >
        <a href="/about" style={link}>
          عن الأداة
        </a>
        <span style={sep}>·</span>

        <a href="/about" style={link}>
          About
        </a>
        <span style={sep}>·</span>

        <a href="/privacy" style={link}>
          الخصوصية
        </a>
        <span style={sep}>·</span>

        <a href="/privacy" style={link}>
          Privacy
        </a>
        <span style={sep}>·</span>

        <a
          href="mailto:anesscherfaoui@gmail.com"
          style={link}
        >
          التواصل
        </a>
      </div>

      {ADS_ON ? (
        <div id="awd-ad-bottom" style={slot}></div>
      ) : (
        <div style={slot}>AllWDbook™</div>
      )}
    </div>
  );
}
