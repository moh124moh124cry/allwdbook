"use client";
import { useEffect, useRef, useState } from "react";
import { PAPER, TRIMS, coverSize, interiorSize, gutterFor, checkImage, layout, mm } from "../lib/cover";

const BOOK_TYPES = [
  { ar: "كتاب تلوين / أنشطة", en: "Coloring / Activity book", ti: 12, paper: "white", bleed: true, pages: 60 },
  { ar: "كتاب تمارين ومراجعة", en: "Workbook", ti: 12, paper: "white", bleed: false, pages: 100 },
  { ar: "دفتر يوميات / جورنال", en: "Journal", ti: 3, paper: "cream", bleed: false, pages: 120 },
  { ar: "مفكرة / بلانر", en: "Planner", ti: 12, paper: "white", bleed: false, pages: 130 },
  { ar: "كتاب ألغاز وكلمات متقاطعة", en: "Puzzle book", ti: 6, paper: "white", bleed: false, pages: 110 },
  { ar: "كتاب طبخ ملون", en: "Cookbook (color)", ti: 9, paper: "premium", bleed: true, pages: 90 },
  { ar: "قصة أطفال مصورة ملونة", en: "Children picture book", ti: 11, paper: "premium", bleed: true, pages: 32 },
  { ar: "رواية صغيرة", en: "Small novel", ti: 0, paper: "cream", bleed: false, pages: 200 },
  { ar: "رواية وأدب", en: "Novel / Literature", ti: 1, paper: "cream", bleed: false, pages: 220 },
  { ar: "رواية ومذكرات", en: "Novel / Memoir", ti: 2, paper: "cream", bleed: false, pages: 240 },
  { ar: "تطوير ذات وكتب عامة", en: "Self-help / General", ti: 3, paper: "white", bleed: false, pages: 180 },
  { ar: "كتاب أكاديمي", en: "Academic book", ti: 4, paper: "white", bleed: false, pages: 260 },
  { ar: "كتاب غير خيالي", en: "Non-fiction", ti: 5, paper: "white", bleed: false, pages: 240 },
  { ar: "كتاب تعليمي", en: "Educational book", ti: 6, paper: "white", bleed: false, pages: 150 },
  { ar: "كتاب كبير الحجم", en: "Large format book", ti: 7, paper: "white", bleed: false, pages: 150 },
  { ar: "كتاب مصور", en: "Illustrated book", ti: 8, paper: "white", bleed: true, pages: 120 },
  { ar: "كتاب تعليم وفن", en: "Art / Teaching book", ti: 9, paper: "white", bleed: true, pages: 120 },
  { ar: "كتاب مربع", en: "Square book", ti: 10, paper: "white", bleed: true, pages: 60 },
  { ar: "كتاب مربع كبير", en: "Large square book", ti: 11, paper: "white", bleed: true, pages: 60 }
];

const L = {
  ar: {
    title: "مصمم الغلاف",
    note: "كل الحساب يتم داخل هاتفك. لا ترفع صورتك لاي خادم.",
    btype: "نوع الكتاب (يضبط المقاس تلقائيا)",
    custom: "مخصص — اختر يدويا",
    hint: "المقاس المختار",
    trim: "مقاس الكتاب",
    pages: "عدد الصفحات",
    paper: "نوع الورق",
    dir: "اتجاه الكتاب",
    ltr: "انجليزي (يسار الى يمين)",
    rtlL: "عربي (يمين الى يسار)",
    bleed: "المحتوى الداخلي فيه نزيف",
    guides: "إظهار الخطوط الإرشادية",
    spine: "عرض الكعب",
    cover: "مقاس الغلاف الكامل",
    inside: "مقاس الصفحة الداخلية",
    gutter: "الهامش الداخلي",
    need: "الأبعاد المطلوبة",
    yours: "أبعاد صورتك",
    good: "ممتازة وجاهزة للطباعة",
    warn: "قريبة لكن أقل من المطلوب",
    bad: "منخفضة جدا وستظهر مشوشة",
    none: "لم ترفع صورة بعد",
    fileTypes: "يمكنك رفع PDF أو JPG أو PNG",
    pdfLoaded: "تم تحميل PDF واستخدام الصفحة الأولى في المعاينة.",
    pdfReading: "جاري قراءة ملف PDF...",
    badFile: "الملف غير مدعوم. اختر PDF أو JPG أو PNG.",
    fileReadFail: "تعذر قراءة الملف. حاول بملف آخر.",
    pdf: "تصدير PDF",
    png: "تصدير PNG",
    working: "جاري التصدير...",
    fix: "اصلح الصورة تلقائيا",
    fixing: "جاري الاصلاح...",
    okFix: "تم الاصلاح. الابعاد الان مطابقة تماما لمتطلبات امازون.",
    warnFix: "التكبير لا يخترع تفاصيل جديدة. للرسم الخطي النتيجة جيدة، وللصور الفوتوغرافية يفضل اعادة التصدير من المصدر.",
    undo: "رجوع للصورة الأصلية",
    spineOk: "نص الكعب مسموح",
    spineNo: "نص الكعب غير مسموح (أقل من 79 صفحة)",
    front: "الأمامي",
    back: "الخلفي",
    sp: "الكعب",
    err24: "الحد الأدنى 24 صفحة",
    err828: "الحد الأقصى 828 صفحة",
    disc: "الارقام محسوبة بمعادلات امازون الرسمية. راجع دائما Print Previewer قبل النشر."
  },
  en: {
    title: "Cover Designer",
    note: "All math runs on your device. Your image is never uploaded.",
    btype: "Book type (sets the size for you)",
    custom: "Custom — choose manually",
    hint: "Selected size",
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
    fileTypes: "You can upload PDF, JPG or PNG",
    pdfLoaded: "PDF loaded. The first page is used in the preview.",
    pdfReading: "Reading PDF...",
    badFile: "Unsupported file. Choose PDF, JPG or PNG.",
    fileReadFail: "Could not read this file. Try another file.",
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
  const [bt, setBt] = useState(0);
  const [ti, setTi] = useState(12);
  const [pages, setPages] = useState(60);
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
  const [fileStatus, setFileStatus] = useState("");
  const cv = useRef(null);

  const trim = TRIMS[ti] || TRIMS[3];
  const n = Number(pages) || 0;
  const cs = coverSize(trim.w, trim.h, n, paper);
  const ins = interiorSize(trim.w, trim.h, bleed);
  const lay = layout(trim.w, trim.h, n, paper, rtl);
  const chk = src ? checkImage(dim.w, dim.h, cs.widthPx, cs.heightPx) : { level: "none", ratio: 0 };
  const needFix = chk.level === "warn" || chk.level === "bad";

  function applyType(e) {
    const i = Number(e.target.value);
    setBt(i);
    if (i < 0) return;
    const b = BOOK_TYPES[i];
    if (!b) return;
    setTi(b.ti); setPaper(b.paper); setBleed(b.bleed); setPages(b.pages);
  }

  function pickTrim(e) {
    setTi(Number(e.target.value));
    setBt(-1);
  }

  function cover(ctx, s, sw, sh, W, H) {
    const ir = sw / sh;
    const cr = W / H;
    let dw = W, dh = H;
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

    const u = i => i * scale;
    ctx.lineWidth = Math.max(1, scale / 150);
    ctx.strokeStyle = "#e11d48";
    ctx.strokeRect(u(0.125), u(0.125), u(cs.widthIn - 0.25), u(cs.heightIn - 0.25));

    ctx.strokeStyle = "#2563eb";
    for (const z of lay.zones) {
      ctx.beginPath(); ctx.moveTo(u(z.xIn), 0); ctx.lineTo(u(z.xIn), H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(u(z.xIn + z.wIn), 0); ctx.lineTo(u(z.xIn + z.wIn), H); ctx.stroke();
    }

    ctx.strokeStyle = "#16a34a";
    ctx.setLineDash([u(0.06), u(0.06)]);
    for (const z of lay.zones) {
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
    for (const z of lay.zones) {
      const nm = z.id === "spine" ? t.sp : (z.id === "front" ? t.front : t.back);
      if (z.id === "spine" && z.wIn < 0.5) continue;
      ctx.fillText(nm, u(z.xIn + z.wIn / 2), u(0.55));
    }
  }

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const scale = 860 / cs.widthIn;
    c.width = Math.round(cs.widthIn * scale);
    c.height = Math.round(cs.heightIn * scale);
    paint(c.getContext("2d"), scale, guides);
  });

  function setArtwork(im) {
    setSrc(im);
    setDim({ w: im.width, h: im.height });
    setOrig(im);
    setOrigDim({ w: im.width, h: im.height });
    setFixed(false);
  }

  function imageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
  }

  async function pdfFirstPageToImage(file) {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const page = await pdf.getPage(1);

    const baseViewport = page.getViewport({ scale: 1 });
    const targetScale = Math.min(
      300 / 72,
      6000 / Math.max(baseViewport.width, baseViewport.height)
    );
    const viewport = page.getViewport({
      scale: Math.max(1, targetScale)
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    return imageFromUrl(canvas.toDataURL("image/png"));
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFileStatus("");

    const name = String(f.name || "").toLowerCase();
    const type = String(f.type || "").toLowerCase();
    const isPdf = type === "application/pdf" || name.endsWith(".pdf");
    const isImage =
      type === "image/png" ||
      type === "image/jpeg" ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg");

    if (!isPdf && !isImage) {
      setFileStatus(t.badFile);
      return;
    }

    try {
      if (isPdf) {
        setFileStatus(t.pdfReading);
        const im = await pdfFirstPageToImage(f);
        setArtwork(im);
        setFileStatus(t.pdfLoaded);
        return;
      }

      const rd = new FileReader();

      const url = await new Promise((resolve, reject) => {
        rd.onload = ev => resolve(ev.target.result);
        rd.onerror = reject;
        rd.readAsDataURL(f);
      });

      const im = await imageFromUrl(url);
      setArtwork(im);
      setFileStatus("");
    } catch (err) {
      console.error("Cover file load failed:", err);
      setFileStatus(t.fileReadFail);
    }
  }

  function autoFix() {
    if (!src) return;
    setBusy(t.fixing);
    setTimeout(() => {
      const tw = cs.widthPx, th = cs.heightPx;
      let cur = src, cw = dim.w, ch = dim.h, steps = 0;

      while ((cw * 2 < tw || ch * 2 < th) && steps < 6) {
        const nw = Math.round(cw * 2), nh = Math.round(ch * 2);
        const tmp = document.createElement("canvas");
        tmp.width = nw; tmp.height = nh;
        const tc = tmp.getContext("2d");
        tc.imageSmoothingEnabled = true;
        tc.imageSmoothingQuality = "high";
        tc.drawImage(cur, 0, 0, nw, nh);
        cur = tmp; cw = nw; ch = nh; steps++;
      }

      const out = document.createElement("canvas");
      out.width = tw; out.height = th;
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
    setDim(origDim);
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
    setTimeout(() => {
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
    setTimeout(() => {
      import("jspdf").then(m => {
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

  const badge =
    chk.level === "good" ? t.good :
    chk.level === "warn" ? t.warn :
    chk.level === "bad" ? t.bad : t.none;

  const badgeColor =
    chk.level === "good" ? "#16a34a" :
    chk.level === "warn" ? "#f59e0b" :
    chk.level === "bad" ? "#e11d48" : "#93a4c4";

  return (
    <div className="card" dir={isAr ? "rtl" : "ltr"}>
      <h3>📐 {t.title}</h3>
      <p className="mut">{t.note}</p>

      <div className="mut">📚 {t.btype}</div>
      <select value={bt} onChange={applyType}>
        <option value="-1">{t.custom}</option>
        {BOOK_TYPES.map((b, i) => <option key={i} value={i}>{isAr ? b.ar : b.en}</option>)}
      </select>

      <p className="mut">📏 {t.hint}: {trim.w} x {trim.h} in · {mm(trim.w)} x {mm(trim.h)} mm</p>

      <div className="grid">
        <div>
          <div className="mut">{t.trim}</div>
          <select value={ti} onChange={pickTrim}>
            {TRIMS.map((x, i) => <option key={i} value={i}>{x.w} x {x.h} in</option>)}
          </select>
        </div>
        <div>
          <div className="mut">{t.pages}</div>
          <input type="number" value={pages} onChange={e => setPages(e.target.value)} />
        </div>
        <div>
          <div className="mut">{t.paper}</div>
          <select value={paper} onChange={e => setPaper(e.target.value)}>
            {Object.keys(PAPER).map(k => <option key={k} value={k}>{isAr ? PAPER[k].ar : PAPER[k].en}</option>)}
          </select>
        </div>
        <div>
          <div className="mut">{t.dir}</div>
          <select value={rtl ? "1" : "0"} onChange={e => setRtl(e.target.value === "1")}>
            <option value="0">{t.ltr}</option>
            <option value="1">{t.rtlL}</option>
          </select>
        </div>
      </div>


      <div className="row">
        <label><input type="checkbox" checked={bleed} onChange={e => setBleed(e.target.checked)} /> {t.bleed}</label>
        <label><input type="checkbox" checked={guides} onChange={e => setGuides(e.target.checked)} /> {t.guides}</label>
      </div>

      {n < 24 && <p className="mut">⚠️ {t.err24}</p>}
      {n > 828 && <p className="mut">⚠️ {t.err828}</p>}

      <div className="grid">
        <div className="kpi"><b>{cs.spineIn}</b><span>{t.spine} · {cs.spineMm} mm</span></div>
        <div className="kpi"><b>{cs.widthIn} x {cs.heightIn}</b><span>{t.cover}</span></div>
        <div className="kpi"><b>{cs.widthPx} x {cs.heightPx}</b><span>{t.need} · 300 DPI</span></div>
        <div className="kpi"><b>{ins.widthIn} x {ins.heightIn}</b><span>{t.inside}</span></div>
        <div className="kpi"><b>{gutterFor(n)}</b><span>{t.gutter}</span></div>
        <div className="kpi"><b>{cs.spineText ? "✅" : "⛔"}</b><span>{cs.spineText ? t.spineOk : t.spineNo}</span></div>
      </div>

      <div className="row">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={onFile}
        />
      </div>
      <p className="mut" style={{ marginTop: 4 }}>{t.fileTypes}</p>
      {fileStatus && (
        <div className="trustNote" style={{ marginTop: 8 }}>
          <p>{fileStatus}</p>
        </div>
      )}

      <p style={{ color: badgeColor, fontWeight: 700 }}>
        {t.yours}: {src ? dim.w + " x " + dim.h + " (" + chk.ratio + "%)" : "-"} — {badge}
      </p>

      {needFix && (
        <div className="row">
          <button className="go" onClick={autoFix} disabled={busy !== ""}>
            {busy || "🪄 " + t.fix}
          </button>
        </div>
      )}

      {fixed && (
        <div>
          <p style={{ color: "#16a34a", fontWeight: 700 }}>✅ {t.okFix}</p>
          <p className="mut">⚠️ {t.warnFix}</p>
          <div className="row">
            <button className="go" onClick={undoFix} disabled={busy !== ""}>↩️ {t.undo}</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", background: "#0b1220", padding: 8, borderRadius: 10, marginTop: 10 }}>
        <canvas ref={cv} style={{ width: "100%", height: "auto", borderRadius: 6 }} />
      </div>

      <div className="actionRow">
        <button className="go" onClick={savePdf} disabled={busy !== ""}>{busy || "📄 " + t.pdf}</button>
        <button className="go" onClick={savePng} disabled={busy !== ""}>🖼️ {t.png}</button>
      </div>

      <p className="mut disclaimer">{t.disc}</p>
    </div>
  );
}
