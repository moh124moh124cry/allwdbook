const ADS_ON = false;
const VERSION = "1.0.0";

const bar = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  height: "60px",
  background: "#0f1830",
  borderTop: "1px solid #22304f",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  boxSizing: "border-box"
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
  flex: 1,
  height: "44px",
  marginInlineStart: "10px",
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

      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
        <a href="/privacy" style={link}>الخصوصية</a>
        <span style={sep}>·</span>
        <a href="/privacy" style={link}>Privacy</a>
        <span style={sep}>·</span>
        <a href="mailto:anesscherfaoui@gmail.com" style={link}>التواصل</a>
      </div>

      {ADS_ON ? (
        <div id="awd-ad-bottom" style={{ flex: 1, height: "44px", marginInlineStart: "10px" }}></div>
      ) : (
        <div style={slot}>AllWDbook™</div>
      )}

    </div>
  );
}
