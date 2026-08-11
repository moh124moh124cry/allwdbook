// lib/cover.js  v1.0.0
// KDP geometry. Pure math. No deps. No network.

export const VERSION = "1.0.0";
export const DPI = 300;
export const BLEED = 0.125;

export const PAPER = {
  white:    { perPage: 0.002252, en: "White (B&W)",    ar: "ابيض" },
  cream:    { perPage: 0.0025,   en: "Cream (B&W)",    ar: "كريمي" },
  premium:  { perPage: 0.002347, en: "Premium Color",  ar: "ملون ممتاز" },
  standard: { perPage: 0.002252, en: "Standard Color", ar: "ملون قياسي" }
};

export const TRIMS = [
  { w: 5,    h: 8    },
  { w: 5.25, h: 8    },
  { w: 5.5,  h: 8.5  },
  { w: 6,    h: 9    },
  { w: 6.14, h: 9.21 },
  { w: 6.69, h: 9.61 },
  { w: 7,    h: 10   },
  { w: 7.44, h: 9.69 },
  { w: 7.5,  h: 9.25 },
  { w: 8,    h: 10   },
  { w: 8.25, h: 8.25 },
  { w: 8.5,  h: 8.5  },
  { w: 8.5,  h: 11   }
];

export const GUTTERS = [
  { max: 150, g: 0.375 },
  { max: 300, g: 0.5   },
  { max: 500, g: 0.625 },
  { max: 700, g: 0.75  },
  { max: 828, g: 0.875 }
];

export function px(inches) {
  return Math.round(inches * DPI);
}

export function mm(inches) {
  return Math.round(inches * 25.4 * 100) / 100;
}

export function r3(n) {
  return Math.round(n * 1000) / 1000;
}

export function spineWidth(pages, paperKey) {
  const p = PAPER[paperKey] || PAPER.white;
  const n = Number(pages) || 0;
  return r3(n * p.perPage);
}

export function gutterFor(pages) {
  const n = Number(pages) || 0;
  for (let i = 0; i < GUTTERS.length; i++) {
    if (n <= GUTTERS[i].max) return GUTTERS[i].g;
  }
  return 0.875;
}

export function interiorSize(trimW, trimH, useBleed) {
  const w = useBleed ? trimW + 0.125 : trimW;
  const h = useBleed ? trimH + 0.25 : trimH;
  return {
    widthIn: r3(w),
    heightIn: r3(h),
    widthPx: px(w),
    heightPx: px(h),
    widthMm: mm(w),
    heightMm: mm(h),
    outerMargin: useBleed ? 0.375 : 0.25
  };
}

export function coverSize(trimW, trimH, pages, paperKey) {
  const spine = spineWidth(pages, paperKey);
  const w = trimW * 2 + spine + 0.25;
  const h = trimH + 0.25;
  return {
    spineIn: spine,
    spineMm: mm(spine),
    widthIn: r3(w),
    heightIn: r3(h),
    widthPx: px(w),
    heightPx: px(h),
    widthMm: mm(w),
    heightMm: mm(h),
    spineText: Number(pages) >= 79
  };
}

export function layout(trimW, trimH, pages, paperKey, rtl) {
  const c = coverSize(trimW, trimH, pages, paperKey);
  const first = rtl ? "front" : "back";
  const last = rtl ? "back" : "front";
  const x0 = 0.125;
  const x1 = x0 + trimW;
  const x2 = x1 + c.spineIn;
  return {
    cover: c,
    rtl: !!rtl,
    zones: [
      { id: first, xIn: x0, wIn: trimW },
      { id: "spine", xIn: x1, wIn: c.spineIn },
      { id: last, xIn: x2, wIn: trimW }
    ],
    safeIn: 0.125,
    spineSafeIn: 0.0625,
    foldTolIn: 0.0625,
    barcodeIn: { wIn: 2, hIn: 1.2 }
  };
}

export function checkImage(imgW, imgH, needW, needH) {
  const w = Number(imgW) || 0;
  const h = Number(imgH) || 0;
  if (!w || !h) return { level: "none", ratio: 0 };
  const ratio = Math.min(w / needW, h / needH);
  let level = "bad";
  if (ratio >= 1) level = "good";
  else if (ratio >= 0.8) level = "warn";
  return { level: level, ratio: Math.round(ratio * 100) };
}

export function validate(pages, paperKey) {
  const n = Number(pages) || 0;
  const out = [];
  if (n < 24) out.push("MIN_24");
  if (n > 828) out.push("MAX_828");
  if (n < 79) out.push("NO_SPINE_TEXT");
  if (!PAPER[paperKey]) out.push("BAD_PAPER");
  return out;
}
