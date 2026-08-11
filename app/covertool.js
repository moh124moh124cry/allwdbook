"use client";
import { useEffect, useRef, useState } from "react";
import { PAPER, TRIMS, coverSize, interiorSize, gutterFor, checkImage, layout } from "../lib/cover";

const L = {
  ar: {
    title: "مصمم الغلاف",
    note: "كل الحساب يتم داخل هاتفك. لا ترفع صورتك لاي خادم.",
    trim: "مقاس الكتاب",
    pages: "عدد الصفحات",
    paper: "نوع الورق",
    dir: "اتجاه الكتاب",
    ltr: "انجليزي (يسار الى يمين)",
    rtlL: "عربي (يمين الى يسار)",
    bleed: "المحتوى الداخلي فيه نزيف",
    guides: "اظهار الخطوط الارشادية",
    spine: "عرض الكعب",
    cover: "مقاس الغلاف الكامل",
    inside: "مقاس الصفحة الداخلية",
    gutter: "الهامش الداخلي",
    need: "الابعاد المطلوبة",
    yours: "ابعاد صورتك",
    good: "ممتازة وجاهزة للطباعة",
    warn: "قريبة لكن اقل من المطلوب",
    bad: "منخفضة جدا وستظهر مشوشة",
    none: "لم ترفع صورة بعد",
    pdf: "تصدير PDF",
    png: "تصدير PNG",
    working: "جاري التصدير...",
    fix: "اصلح الصورة تلقائيا",
    fixing: "جاري الاصلاح...",
    okFix: "تم الاصلاح. الابعاد الان مطابقة تماما لمتطلبات امازون.",
    warnFix: "التكبير لا يخترع تفاصيل جديدة. للرسم الخطي النتيجة جيدة، وللصور الفوتوغرافية يفضل اعادة التصدير من المصدر.",
    undo: "رجوع للصورة الاصلية",
    spineOk: "نص الكعب مسموح",
    spineNo: "نص الكعب ممنوع (اقل من 79 صفحة)",
    front: "الامامي",
    back: "الخلفي",
    sp: "الكعب",
    err24: "الحد الادنى 24 صفحة",
    err828: "الحد الاقصى 828 صفحة",
    disc: "الارقام محسوبة بمعادلات امازون الرسمية. راجع دائما Print Previewer قبل النشر."
  },
  en: {
    title: "Cover Designer",
    note: "All math runs on your device. Your image is never uploaded.",
    trim: "Trim size",
    pages: "Page count",
    paper: "Paper type",
    dir: "Book direction",
    ltr: "English (left to right)",
    rtlL: "Arabic (right to left)",
    bleed: "Interior uses bleed",
    guides: "Show guide lines",
    spine: "Spine width",
    cover: "Full cover size",
    inside: "Interior page size",
    gutter: "Gutter margin",
    need: "Required pixels",
    yours: "Your image",
    good: "Excellent, print ready",
    warn: "Close but below target",
    bad: "Too low, will print blurry",
    none: "No image uploaded yet",
    pdf: "Export PDF",
    png: "Export PNG",
    working: "Exporting...",
    fix: "Auto fix this image",
    fixing: "Fixing...",
    okFix: "Fixed. Dimensions now match Amazon exactly.",
    warnFix: "Upscaling cannot invent detail. Line art upscales well; photos are better re-exported from source.",
    undo: "Back to original image",
    spineOk: "Spine text allowed",
    spineNo: "Spine text not allowed (under 79 pages)",
    front: "FRONT",
    back: "BACK",
    sp: "SPINE",
    err24: "Minimum is 24 pages",
    err828: "Maximum is 828 pages",
    disc: "Values use official Amazon formulas. Always check Print Previewer before publishing."
  }
};

export default function CoverTool({ lang }) {
  const t = L[lang === "en" ? "en" : "ar"];
  const isAr = lang !== "en";
  const [ti, setTi] = useState(3);
  const [pages, setPages] = useState(124);
  const [paper, setPaper] = useState("white");
  const [rtl, setRtl] = useState(false);
  const [bleed, setBleed] = useState(true);
  const [guides, setGuides] = useState(true);
  const [src, setSrc] = useState(null);
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const [orig, setOrig] = useState(null);
  const [origDim, setOrigDim] = useState({ w: 0, h: 0 });
  const [fixed, setFixed] = useState(false);
  const [busy, setBusy] = useState("");
  const cv = useRef(null);

  const trim = TRIMS[ti] || TRIMS[3];
  const n = Number(pages) || 0;
  const cs = coverSize(trim.w, trim.h, n, paper);
  const ins = interiorSize(trim.w, trim.h, bleed);
  const lay = layout(trim.w, trim.h, n, paper, rtl);
  const chk = src ? checkImage(dim.w, dim.h, cs.widthPx, cs.heightPx) : { level: "none", ratio: 0 };
  const needFix = chk.level === "warn" || chk.level === "bad";

  function cover(ctx, s, sw, sh, W, H) {
    const ir = sw / sh;
    const cr = W / H;
    let dw = W;
    let dh = H;
    if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
    ctx.drawImage(s, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }

  function paint(ctx, scale, withGuides) {
    const W = cs.widthIn * scale;
    const H = cs.heightIn * scale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    if (src) cover(ctx, src, dim.w, dim.h, W, H);
    if (!withGuides) return;
    const u = function (i) { return i * scale; };
    ctx.lineWidth = Math.max(1, scale / 150);
    ctx.strokeStyle = "#e11d48";
    ctx.strokeRect(u(0.125), u(0.125), u(cs.widthIn - 0.25), u(cs.heightIn - 0.25));
    ctx.strokeStyle = "#2563eb";
    for (let k = 0; k < lay.zones.length; k++) {
      const z = lay.zones[k];
      ctx.beginPath();
      ctx.moveTo(u(z.xIn), 0);
      ctx.lineTo(u(z.xIn), H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(u(z.xIn + z.wIn), 0);
      ctx.lineTo(u(z.xIn + z.wIn), H);
      ctx.stroke();
    }
    ctx.strokeStyle = "#16a34a";
    ctx.setLineDash([u(0.06), u(0.06)]);
    for (let k = 0; k < lay.zones.length; k++) {
      const z = lay.zones[k];
      if (z.id === "spine") continue;
      ctx.strokeRect(u(z.xIn + 0.125), u(0.25), u(z.wIn - 0.25), u(cs.heightIn - 0.5));
    }
    ctx.setLineDash([]);
    const bz = lay.zones[rtl ? 2 : 0];
    ctx.strokeStyle = "#f59e0b";
    ctx.strokeRect(u(bz.xIn + bz.wIn - 2.25), u(cs.heightIn - 1.575), u(2), u(1.2));
    ctx.fillStyle = "#111827";
    ctx.font = "bold " + Math.round(scale / 6) + "px sans-serif";
    ctx.textAlign = "center";
    for (let k = 0; k < lay.zones.length; k++) {
      const z = lay.zones[k];
      const nm = z.id === "spine" ? t.sp : (z.id === "front" ? t.front : t.back);
      if (z.id === "spine" && z.wIn < 0.5) continue;
      ctx.fillText(nm, u(z.xIn + z.wIn / 2), u(0.55));
    }
  }

  useEffect(function () {
    const c = cv.current;
    if (!c) return;
    const scale = 860 / cs.widthIn;
    c.width = Math.round(cs.widthIn * scale);
    c.height = Math.round(cs.heightIn * scale);
    paint(c.getContext("2d"), scale, guides);
  });

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = function (ev) {
      const im = new Image();
      im.onload = function () {
        setSrc(im);
        setDim({ w: im.width, h: im.height });
        setOrig(im);
        setOrigDim({ w: im.width, h: im.height });
        setFixed(false);
      };
      im.src = ev.target.result;
    };
    rd.readAsDataURL(f);
  }

  function autoFix() {
    if (!src) return;
    setBusy(t.fixing);
    setTimeout(function () {
      const tw = cs.widthPx;
      const th = cs.heightPx;
      let cur = src;
      let cw = dim.w;
      let ch = dim.h;
      let steps = 0;
      while ((cw * 2 < tw || ch * 2 < th) && steps < 6) {
        const nw = Math.round(cw * 2);
        const nh = Math.round(ch * 2);
        const tmp = document.createElement("canvas");
        tmp.width = nw;
        tmp.height = nh;
        const tc = tmp.getContext("2d");
        tc.imageSmoothingEnabled = true;
        tc.imageSmoothingQuality = "high";
        tc.drawImage(cur, 0, 0, nw, nh);
        cur = tmp;
        cw = nw;
        ch = nh;
        steps = steps + 1;
      }
      const out = document.createElement("canvas");
      out.width = tw;
      out.height = th;
      const oc = out.getContext("2d");
      oc.fillStyle = "#ffffff";
      oc.fillRect(0, 0, tw, th);
      oc.imageSmoothingEnabled = true;
      oc.imageSmoothingQuality = "high";
      try { oc.filter = "contrast(1.12) saturate(1.04)"; } catch (err) { }
      cover(oc, cur, cw, ch, tw, th);
      setSrc(out);
      setDim({ w: tw, h: th });
      setFixed(true);
      setBusy("");
    }, 60);
  }

  function undoFix() {
    if (!orig) return;
    setSrc(orig);
    setDim({ w: origDim.w, h: origDim.h });
    setFixed(false);
  }

  function bigCanvas() {
    const c = document.createElement("canvas");
    c.width = cs.widthPx;
    c.height = cs.heightPx;
    paint(c.getContext("2d"), 300, false);
    return c;
  }

  function savePng() {
    setBusy(t.working);
    setTimeout(function () {
      const c = bigCanvas();
      const a = document.createElement("a");
      a.href = c.toDataURL("image/png");
      a.download = "allwdbook-cover.png";
      a.click();
      setBusy("");
    }, 60);
  }

  function savePdf() {
    setBusy(t.working);
    setTimeout(function () {
      import("jspdf").then(function (m) {
        const c = bigCanvas();
        const data = c.toDataURL("image/jpeg", 0.95);
        const pdf = new m.jsPDF({
          orientation: cs.widthIn >= cs.heightIn ? "landscape" : "portrait",
          unit: "in",
          format: [cs.widthIn, cs.heightIn]
        });
        pdf.addImage(data, "JPEG", 0, 0, cs.widthIn, cs.heightIn);
        pdf.save("allwdbook-cover.pdf");
        setBusy("");
      });
    }, 60);
  }

  const badge = chk.level === "good" ? t.good : chk.level === "warn" ? t.warn : chk.level === "bad" ? t.bad : t.none;
  const badgeColor = chk.level === "good" ? "#16a34a" : chk.level === "warn" ? "#f59e0b" : chk.level === "bad" ? "#e11d48" : "#93a4c4";

  return (
    <div className="card" dir={isAr ? "rtl" : "ltr"}>
      <h3>📐 {t.title}</h3>
      <p className="mut">{t.note}</p>

      <div className="grid">
        <div>
          <div className="mut">{t.trim}</div>
          <select value={ti} onChange={function (e) { setTi(Number(e.target.value)); }}>
            {TRIMS.map(function (x, i) {
              return <option key={i} value={i}>{x.w} x {x.h} in</option>;
            })}
          </select>
        </div>
        <div>
          <div className="mut">{t.pages}</div>
          <input type="number" value={pages} onChange={function (e) { setPages(e.target.value); }} />
        </div>
        <div>
          <div className="mut">{t.paper}</div>
          <select value={paper} onChange={function (e) { setPaper(e.target.value); }}>
            {Object.keys(PAPER).map(function (k) {
              return <option key={k} value={k}>{isAr ? PAPER[k].ar : PAPER[k].en}</option>;
            })}
          </select>
        </div>
        <div>
          <div className="mut">{t.dir}</div>
          <select value={rtl ? "1" : "0"} onChange={function (e) { setRtl(e.target.value === "1"); }}>
            <option value="0">{t.ltr}</option>
            <option value="1">{t.rtlL}</option>
          </select>
        </div>
      </div>

      <div className="row">
        <label><input type="checkbox" checked={bleed} onChange={function (e) { setBleed(e.target.checked); }} /> {t.bleed}</label>
        <label><input type="checkbox" checked={guides} onChange={function (e) { setGuides(e.target.checked); }} /> {t.guides}</label>
      </div>

      {n < 24 ? <p className="mut">⏳ {t.err24}</p> : null}
      {n > 828 ? <p className="mut">⏳ {t.err828}</p> : null}

      <div className="grid">
        <div className="kpi"><b>{cs.spineIn}</b><span>{t.spine} · {cs.spineMm} mm</span></div>
        <div className="kpi"><b>{cs.widthIn} x {cs.heightIn}</b><span>{t.cover}</span></div>
        <div className="kpi"><b>{cs.widthPx} x {cs.heightPx}</b><span>{t.need} · 300 DPI</span></div>
        <div className="kpi"><b>{ins.widthIn} x {ins.heightIn}</b><span>{t.inside}</span></div>
        <div className="kpi"><b>{gutterFor(n)}</b><span>{t.gutter}</span></div>
        <div className="kpi"><b>{cs.spineText ? "✅" : "⛔"}</b><span>{cs.spineText ? t.spineOk : t.spineNo}</span></div>
      </div>

      <div className="row">
        <input type="file" accept="image/*" onChange={onFile} />
      </div>

      <p style={{ color: badgeColor, fontWeight: 700 }}>
        {t.yours}: {src ? dim.w + " x " + dim.h + " (" + chk.ratio + "%)" : "-"} — {badge}
      </p>

      {needFix ? (
        <div className="row">
          <button className="go" onClick={autoFix} disabled={busy !== ""}>
            {busy !== "" ? busy : "🪄 " + t.fix}
          </button>
        </div>
      ) : null}

      {fixed ? (
        <div>
          <p style={{ color: "#16a34a", fontWeight: 700 }}>✅ {t.okFix}</p>
          <p className="mut">⚠️ {t.warnFix}</p>
          <div className="row">
            <button className="go" onClick={undoFix} disabled={busy !== ""}>↩️ {t.undo}</button>
          </div>
        </div>
      ) : null}

      <div style={{ overflowX: "auto", background: "#0b1220", padding: 8, borderRadius: 10 }}>
        <canvas ref={cv} style={{ width: "100%", height: "auto", borderRadius: 6 }} />
      </div>

      <div className="row">
        <button className="go" onClick={savePdf} disabled={busy !== ""}>{busy !== "" ? busy : "📄 " + t.pdf}</button>
        <button className="go" onClick={savePng} disabled={busy !== ""}>{"🖼️ " + t.png}</button>
      </div>

      <p className="mut">{t.disc}</p>
    </div>
  );
}
