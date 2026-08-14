"use client";

import { useEffect, useRef, useState } from "react";
import {
  PAPER,
  TRIMS,
  coverSize,
  interiorSize,
  gutterFor,
  checkImage,
  layout,
  mm,
} from "../lib/cover";
import { getSupabase } from "../lib/supabase";
import UpgradePrompt, {
  shouldBlockRememberedLimit,
} from "./upgradeprompt";

const BOOK_TYPES = [
  {
    ar: "كتاب تلوين / أنشطة",
    en: "Coloring / Activity book",
    ti: 12,
    paper: "white",
    bleed: true,
    pages: 60,
  },
  {
    ar: "كتاب تمارين ومراجعة",
    en: "Workbook",
    ti: 12,
    paper: "white",
    bleed: false,
    pages: 100,
  },
  {
    ar: "دفتر يوميات / جورنال",
    en: "Journal",
    ti: 3,
    paper: "cream",
    bleed: false,
    pages: 120,
  },
  {
    ar: "مفكرة / بلانر",
    en: "Planner",
    ti: 12,
    paper: "white",
    bleed: false,
    pages: 130,
  },
  {
    ar: "كتاب ألغاز وكلمات متقاطعة",
    en: "Puzzle book",
    ti: 6,
    paper: "white",
    bleed: false,
    pages: 110,
  },
  {
    ar: "كتاب طبخ ملون",
    en: "Cookbook (color)",
    ti: 9,
    paper: "premium",
    bleed: true,
    pages: 90,
  },
  {
    ar: "قصة أطفال مصورة ملونة",
    en: "Children picture book",
    ti: 11,
    paper: "premium",
    bleed: true,
    pages: 32,
  },
  {
    ar: "رواية صغيرة",
    en: "Small novel",
    ti: 0,
    paper: "cream",
    bleed: false,
    pages: 200,
  },
  {
    ar: "رواية وأدب",
    en: "Novel / Literature",
    ti: 1,
    paper: "cream",
    bleed: false,
    pages: 220,
  },
  {
    ar: "رواية ومذكرات",
    en: "Novel / Memoir",
    ti: 2,
    paper: "cream",
    bleed: false,
    pages: 240,
  },
  {
    ar: "تطوير ذات وكتب عامة",
    en: "Self-help / General",
    ti: 3,
    paper: "white",
    bleed: false,
    pages: 180,
  },
  {
    ar: "كتاب أكاديمي",
    en: "Academic book",
    ti: 4,
    paper: "white",
    bleed: false,
    pages: 260,
  },
  {
    ar: "كتاب غير خيالي",
    en: "Non-fiction",
    ti: 5,
    paper: "white",
    bleed: false,
    pages: 240,
  },
  {
    ar: "كتاب تعليمي",
    en: "Educational book",
    ti: 6,
    paper: "white",
    bleed: false,
    pages: 150,
  },
  {
    ar: "كتاب كبير الحجم",
    en: "Large format book",
    ti: 7,
    paper: "white",
    bleed: false,
    pages: 150,
  },
  {
    ar: "كتاب مصور",
    en: "Illustrated book",
    ti: 8,
    paper: "white",
    bleed: true,
    pages: 120,
  },
  {
    ar: "كتاب تعليم وفن",
    en: "Art / Teaching book",
    ti: 9,
    paper: "white",
    bleed: true,
    pages: 120,
  },
  {
    ar: "كتاب مربع",
    en: "Square book",
    ti: 10,
    paper: "white",
    bleed: true,
    pages: 60,
  },
  {
    ar: "كتاب مربع كبير",
    en: "Large square book",
    ti: 11,
    paper: "white",
    bleed: true,
    pages: 60,
  },
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
    warnFix:
      "التكبير لا يخترع تفاصيل جديدة. للرسم الخطي النتيجة جيدة، وللصور الفوتوغرافية يفضل اعادة التصدير من المصدر.",
    undo: "رجوع للصورة الأصلية",
    spineOk: "نص الكعب مسموح",
    spineNo: "نص الكعب غير مسموح (أقل من 79 صفحة)",
    front: "الأمامي",
    back: "الخلفي",
    sp: "الكعب",
    err24: "الحد الأدنى 24 صفحة",
    err828: "الحد الأقصى 828 صفحة",
    disc:
      "الارقام محسوبة بمعادلات امازون الرسمية. راجع دائما Print Previewer قبل النشر.",
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
    warnFix:
      "Upscaling cannot invent detail. Line art upscales well; photos are better re-exported from source.",
    undo: "Back to original image",
    spineOk: "Spine text allowed",
    spineNo: "Spine text not allowed (under 79 pages)",
    front: "FRONT",
    back: "BACK",
    sp: "SPINE",
    err24: "Minimum is 24 pages",
    err828: "Maximum is 828 pages",
    disc:
      "Values use official Amazon formulas. Always check Print Previewer before publishing.",
  },
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
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const cv = useRef(null);

  const trim = TRIMS[ti] || TRIMS[3];
  const n = Number(pages) || 0;
  const cs = coverSize(trim.w, trim.h, n, paper);
  const ins = interiorSize(trim.w, trim.h, bleed);
  const lay = layout(trim.w, trim.h, n, paper, rtl);

  const chk = src
    ? checkImage(dim.w, dim.h, cs.widthPx, cs.heightPx)
    : { level: "none", ratio: 0 };

  const needFix = chk.level === "warn" || chk.level === "bad";

  function applyType(event) {
    const index = Number(event.target.value);
    setBt(index);

    if (index < 0) return;

    const bookType = BOOK_TYPES[index];
    if (!bookType) return;

    setTi(bookType.ti);
    setPaper(bookType.paper);
    setBleed(bookType.bleed);
    setPages(bookType.pages);
  }

  function pickTrim(event) {
    setTi(Number(event.target.value));
    setBt(-1);
  }

  function cover(context, image, imageWidth, imageHeight, width, height) {
    const imageRatio = imageWidth / imageHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (imageRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imageRatio;
    } else {
      drawWidth = width;
      drawHeight = width / imageRatio;
    }

    context.drawImage(
      image,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  }

  function paint(context, scale, withGuides) {
    const width = cs.widthIn * scale;
    const height = cs.heightIn * scale;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    if (src) {
      cover(context, src, dim.w, dim.h, width, height);
    }

    if (!withGuides) return;

    const unit = (value) => value * scale;

    context.lineWidth = Math.max(1, scale / 150);
    context.strokeStyle = "#e11d48";

    context.strokeRect(
      unit(0.125),
      unit(0.125),
      unit(cs.widthIn - 0.25),
      unit(cs.heightIn - 0.25),
    );

    context.strokeStyle = "#2563eb";

    for (const zone of lay.zones) {
      context.beginPath();
      context.moveTo(unit(zone.xIn), 0);
      context.lineTo(unit(zone.xIn), height);
      context.stroke();

      context.beginPath();
      context.moveTo(unit(zone.xIn + zone.wIn), 0);
      context.lineTo(unit(zone.xIn + zone.wIn), height);
      context.stroke();
    }

    context.strokeStyle = "#16a34a";
    context.setLineDash([unit(0.06), unit(0.06)]);

    for (const zone of lay.zones) {
      if (zone.id === "spine") continue;

      context.strokeRect(
        unit(zone.xIn + 0.125),
        unit(0.25),
        unit(zone.wIn - 0.25),
        unit(cs.heightIn - 0.5),
      );
    }

    context.setLineDash([]);

    const backZone = lay.zones[rtl ? 2 : 0];

    context.strokeStyle = "#f59e0b";

    context.strokeRect(
      unit(backZone.xIn + backZone.wIn - 2.25),
      unit(cs.heightIn - 1.575),
      unit(2),
      unit(1.2),
    );

    context.fillStyle = "#111827";
    context.font = "bold " + Math.round(scale / 6) + "px sans-serif";
    context.textAlign = "center";

    for (const zone of lay.zones) {
      const name =
        zone.id === "spine"
          ? t.sp
          : zone.id === "front"
            ? t.front
            : t.back;

      if (zone.id === "spine" && zone.wIn < 0.5) continue;

      context.fillText(
        name,
        unit(zone.xIn + zone.wIn / 2),
        unit(0.55),
      );
    }
  }

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;

    const scale = 860 / cs.widthIn;

    canvas.width = Math.round(cs.widthIn * scale);
    canvas.height = Math.round(cs.heightIn * scale);

    paint(canvas.getContext("2d"), scale, guides);
  });

  function setArtwork(image) {
    setSrc(image);
    setDim({
      w: image.width,
      h: image.height,
    });

    setOrig(image);
    setOrigDim({
      w: image.width,
      h: image.height,
    });

    setFixed(false);
  }

  function imageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  async function pdfFirstPageToImage(file) {
    const pdfjsLib = await import(
      "pdfjs-dist/legacy/build/pdf.mjs"
    );

    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();

    const data = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data,
    }).promise;

    const page = await pdf.getPage(1);

    const baseViewport = page.getViewport({
      scale: 1,
    });

    const targetScale = Math.min(
      300 / 72,
      6000 /
        Math.max(
          baseViewport.width,
          baseViewport.height,
        ),
    );

    const viewport = page.getViewport({
      scale: Math.max(1, targetScale),
    });

    const canvas = document.createElement("canvas");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return imageFromUrl(
      canvas.toDataURL("image/png"),
    );
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileStatus("");

    const name = String(file.name || "").toLowerCase();
    const type = String(file.type || "").toLowerCase();

    const isPdf =
      type === "application/pdf" ||
      name.endsWith(".pdf");

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

        const image =
          await pdfFirstPageToImage(file);

        setArtwork(image);
        setFileStatus(t.pdfLoaded);
        return;
      }

      const reader = new FileReader();

      const url = await new Promise(
        (resolve, reject) => {
          reader.onload = (loadEvent) =>
            resolve(loadEvent.target.result);

          reader.onerror = reject;
          reader.readAsDataURL(file);
        },
      );

      const image = await imageFromUrl(url);

      setArtwork(image);
      setFileStatus("");
    } catch (error) {
      console.error(
        "Cover file load failed:",
        error,
      );

      setFileStatus(t.fileReadFail);
    }
  }

  function autoFix() {
    if (!src) return;

    setBusy(t.fixing);

    setTimeout(() => {
      const targetWidth = cs.widthPx;
      const targetHeight = cs.heightPx;

      let current = src;
      let currentWidth = dim.w;
      let currentHeight = dim.h;
      let steps = 0;

      while (
        (currentWidth * 2 < targetWidth ||
          currentHeight * 2 < targetHeight) &&
        steps < 6
      ) {
        const newWidth = Math.round(
          currentWidth * 2,
        );

        const newHeight = Math.round(
          currentHeight * 2,
        );

        const temporaryCanvas =
          document.createElement("canvas");

        temporaryCanvas.width = newWidth;
        temporaryCanvas.height = newHeight;

        const temporaryContext =
          temporaryCanvas.getContext("2d");

        temporaryContext.imageSmoothingEnabled =
          true;

        temporaryContext.imageSmoothingQuality =
          "high";

        temporaryContext.drawImage(
          current,
          0,
          0,
          newWidth,
          newHeight,
        );

        current = temporaryCanvas;
        currentWidth = newWidth;
        currentHeight = newHeight;
        steps++;
      }

      const output =
        document.createElement("canvas");

      output.width = targetWidth;
      output.height = targetHeight;

      const outputContext =
        output.getContext("2d");

      outputContext.fillStyle = "#ffffff";

      outputContext.fillRect(
        0,
        0,
        targetWidth,
        targetHeight,
      );

      outputContext.imageSmoothingEnabled =
        true;

      outputContext.imageSmoothingQuality =
        "high";

      try {
        outputContext.filter =
          "contrast(1.12) saturate(1.04)";
      } catch {}

      cover(
        outputContext,
        current,
        currentWidth,
        currentHeight,
        targetWidth,
        targetHeight,
      );

      setSrc(output);

      setDim({
        w: targetWidth,
        h: targetHeight,
      });

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
    const canvas =
      document.createElement("canvas");

    canvas.width = cs.widthPx;
    canvas.height = cs.heightPx;

    paint(
      canvas.getContext("2d"),
      300,
      false,
    );

    return canvas;
  }

  async function canExportCover() {
    const supabase = getSupabase();

    let {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      const {
        data,
        error,
      } =
        await supabase.auth.signInAnonymously();

      if (error) {
        console.error(
          "Anonymous sign-in failed:",
          error,
        );

        return false;
      }

      session = data?.session || null;
    }

    if (!session?.access_token) {
      return false;
    }

    const rememberedLimit =
      await shouldBlockRememberedLimit(
        "coverDesigner",
        session.access_token,
      );

    if (rememberedLimit) {
      setUpgradeOpen(true);
      return false;
    }

    const response = await fetch(
      "/api/usage/consume",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          toolId: "coverDesigner",
        }),
      },
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (
      !response.ok &&
      data?.error ===
        "DAILY_LIMIT_REACHED"
    ) {
      setUpgradeOpen(true);
      return false;
    }

    return response.ok;
  }

  async function savePng() {
    const allowed =
      await canExportCover();

    if (!allowed) return;

    setBusy(t.working);

    setTimeout(() => {
      const canvas = bigCanvas();

      const link =
        document.createElement("a");

      link.href =
        canvas.toDataURL("image/png");

      link.download =
        "allwdbook-cover.png";

      link.click();
      setBusy("");
    }, 60);
  }

  async function savePdf() {
    const allowed =
      await canExportCover();

    if (!allowed) return;

    setBusy(t.working);

    setTimeout(() => {
      import("jspdf").then((module) => {
        const canvas = bigCanvas();

        const data =
          canvas.toDataURL(
            "image/jpeg",
            0.95,
          );

        const pdf = new module.jsPDF({
          orientation:
            cs.widthIn >= cs.heightIn
              ? "landscape"
              : "portrait",

          unit: "in",

          format: [
            cs.widthIn,
            cs.heightIn,
          ],
        });

        pdf.addImage(
          data,
          "JPEG",
          0,
          0,
          cs.widthIn,
          cs.heightIn,
        );

        pdf.save(
          "allwdbook-cover.pdf",
        );

        setBusy("");
      });
    }, 60);
  }

  const badge =
    chk.level === "good"
      ? t.good
      : chk.level === "warn"
        ? t.warn
        : chk.level === "bad"
          ? t.bad
          : t.none;

  const badgeColor =
    chk.level === "good"
      ? "#16a34a"
      : chk.level === "warn"
        ? "#f59e0b"
        : chk.level === "bad"
          ? "#e11d48"
          : "#93a4c4";

  return (
    <div
      className="card"
      dir={isAr ? "rtl" : "ltr"}
    >
      <h3>📐 {t.title}</h3>

      <p className="mut">
        {t.note}
      </p>

      <div className="mut">
        📚 {t.btype}
      </div>

      <select
        value={bt}
        onChange={applyType}
      >
        <option value="-1">
          {t.custom}
        </option>

        {BOOK_TYPES.map(
          (bookType, index) => (
            <option
              key={index}
              value={index}
            >
              {isAr
                ? bookType.ar
                : bookType.en}
            </option>
          ),
        )}
      </select>

      <p className="mut">
        📏 {t.hint}: {trim.w} x{" "}
        {trim.h} in · {mm(trim.w)} x{" "}
        {mm(trim.h)} mm
      </p>

      <div className="grid">
        <div>
          <div className="mut">
            {t.trim}
          </div>

          <select
            value={ti}
            onChange={pickTrim}
          >
            {TRIMS.map(
              (trimOption, index) => (
                <option
                  key={index}
                  value={index}
                >
                  {trimOption.w} x{" "}
                  {trimOption.h} in
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <div className="mut">
            {t.pages}
          </div>

          <input
            type="number"
            value={pages}
            onChange={(event) =>
              setPages(
                event.target.value,
              )
            }
          />
        </div>

        <div>
          <div className="mut">
            {t.paper}
          </div>

          <select
            value={paper}
            onChange={(event) =>
              setPaper(
                event.target.value,
              )
            }
          >
            {Object.keys(PAPER).map(
              (key) => (
                <option
                  key={key}
                  value={key}
                >
                  {isAr
                    ? PAPER[key].ar
                    : PAPER[key].en}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <div className="mut">
            {t.dir}
          </div>

          <select
            value={
              rtl ? "1" : "0"
            }
            onChange={(event) =>
              setRtl(
                event.target.value ===
                  "1",
              )
            }
          >
            <option value="0">
              {t.ltr}
            </option>

            <option value="1">
              {t.rtlL}
            </option>
          </select>
        </div>
      </div>

      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={bleed}
            onChange={(event) =>
              setBleed(
                event.target.checked,
              )
            }
          />{" "}
          {t.bleed}
        </label>

        <label>
          <input
            type="checkbox"
            checked={guides}
            onChange={(event) =>
              setGuides(
                event.target.checked,
              )
            }
          />{" "}
          {t.guides}
        </label>
      </div>

      {n < 24 && (
        <p className="mut">
          ⚠️ {t.err24}
        </p>
      )}

      {n > 828 && (
        <p className="mut">
          ⚠️ {t.err828}
        </p>
      )}

      <div className="grid">
        <div className="kpi">
          <b>{cs.spineIn}</b>

          <span>
            {t.spine} · {cs.spineMm} mm
          </span>
        </div>

        <div className="kpi">
          <b>
            {cs.widthIn} x{" "}
            {cs.heightIn}
          </b>

          <span>
            {t.cover}
          </span>
        </div>

        <div className="kpi">
          <b>
            {cs.widthPx} x{" "}
            {cs.heightPx}
          </b>

          <span>
            {t.need} · 300 DPI
          </span>
        </div>

        <div className="kpi">
          <b>
            {ins.widthIn} x{" "}
            {ins.heightIn}
          </b>

          <span>
            {t.inside}
          </span>
        </div>

        <div className="kpi">
          <b>
            {gutterFor(n)}
          </b>

          <span>
            {t.gutter}
          </span>
        </div>

        <div className="kpi">
          <b>
            {cs.spineText
              ? "✅"
              : "⛔"}
          </b>

          <span>
            {cs.spineText
              ? t.spineOk
              : t.spineNo}
          </span>
        </div>
      </div>

      <div className="row">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={onFile}
        />
      </div>

      <p
        className="mut"
        style={{
          marginTop: 4,
        }}
      >
        {t.fileTypes}
      </p>

      {fileStatus && (
        <div
          className="trustNote"
          style={{
            marginTop: 8,
          }}
        >
          <p>
            {fileStatus}
          </p>
        </div>
      )}

      <p
        style={{
          color: badgeColor,
          fontWeight: 700,
        }}
      >
        {t.yours}:{" "}

        {src
          ? dim.w +
            " x " +
            dim.h +
            " (" +
            chk.ratio +
            "%)"
          : "-"}

        {" — "}
        {badge}
      </p>

      {needFix && (
        <div className="row">
          <button
            className="go"
            onClick={autoFix}
            disabled={busy !== ""}
          >
            {busy ||
              "🪄 " + t.fix}
          </button>
        </div>
      )}

      {fixed && (
        <div>
          <p
            style={{
              color: "#16a34a",
              fontWeight: 700,
            }}
          >
            ✅ {t.okFix}
          </p>

          <p className="mut">
            ⚠️ {t.warnFix}
          </p>

          <div className="row">
            <button
              className="go"
              onClick={undoFix}
              disabled={busy !== ""}
            >
              ↩️ {t.undo}
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          overflowX: "auto",
          background: "#0b1220",
          padding: 8,
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <canvas
          ref={cv}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 6,
          }}
        />
      </div>

      <div className="actionRow">
        <button
          className="go"
          onClick={savePdf}
          disabled={busy !== ""}
        >
          {busy ||
            "📄 " + t.pdf}
        </button>

        <button
          className="go"
          onClick={savePng}
          disabled={busy !== ""}
        >
          🖼️ {t.png}
        </button>
      </div>

      <p className="mut disclaimer">
        {t.disc}
      </p>

      <UpgradePrompt
        open={upgradeOpen}
        toolId="coverDesigner"
        onClose={() =>
          setUpgradeOpen(false)
        }
      />
    </div>
  );
}
