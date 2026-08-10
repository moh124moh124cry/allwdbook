// 15 صنفاً × معدّلات تركيبية = عشرات الآلاف من التركيبات الممكنة
export const NICHE_CATEGORIES = {
  coloring: { ar: "كتب التلوين", en: "Coloring Books", base: ["coloring book", "coloring pages", "color by number book", "grayscale coloring book"] },
  journals: { ar: "المفكرات واليوميات", en: "Journals & Diaries", base: ["journal", "guided journal", "prompt journal", "gratitude journal"] },
  planners: { ar: "المخططات", en: "Planners", base: ["planner", "weekly planner", "undated planner", "daily planner"] },
  notebooks: { ar: "الدفاتر", en: "Notebooks", base: ["notebook", "composition notebook", "lined notebook", "dot grid notebook"] },
  puzzles: { ar: "الألغاز", en: "Puzzle Books", base: ["sudoku puzzle book", "word search book", "crossword puzzle book", "maze book"] },
  activity: { ar: "كتب الأنشطة", en: "Activity Books", base: ["activity book", "dot to dot book", "sticker activity book", "cut and paste book"] },
  workbooks: { ar: "كتب التمارين", en: "Workbooks", base: ["workbook", "practice workbook", "handwriting practice book", "tracing book"] },
  logbooks: { ar: "سجلات التتبع", en: "Log & Tracker Books", base: ["log book", "tracker notebook", "record book", "checklist book"] },
  recipe: { ar: "كتب الطبخ", en: "Recipe Books", base: ["recipe book", "blank cookbook", "meal planner", "recipe journal"] },
  faith: { ar: "الكتب الدينية", en: "Faith & Devotional", base: ["prayer journal", "devotional journal", "bible study workbook", "islamic activity book"] },
  business: { ar: "الأعمال والمال", en: "Business & Finance", base: ["budget planner", "bookkeeping ledger", "invoice book", "expense tracker"] },
  education: { ar: "التعليم", en: "Education & Test Prep", base: ["study guide", "flashcard book", "test prep workbook", "vocabulary workbook"] },
  health: { ar: "الصحة واللياقة", en: "Health & Fitness", base: ["fitness journal", "workout log book", "food diary", "self care journal"] },
  hobbies: { ar: "الهوايات والحرف", en: "Hobbies & Crafts", base: ["sketchbook", "knitting journal", "gardening journal", "fishing log book"] },
  kids: { ar: "كتب الأطفال", en: "Children's Books", base: ["kids activity book", "toddler coloring book", "learn to write book", "counting practice book"] }
};

export const AUDIENCES = ["for adults", "for kids", "for teens", "for toddlers", "for beginners", "for seniors", "for women", "for men", "for boys", "for girls", "for students", "for teachers", "for nurses", "for moms", "for couples", "for kids ages 4-8", "for kids ages 8-12", "for ages 2-4", "for grandparents", "for travelers"];
export const THEMES = ["floral", "animals", "mandala", "cats", "dogs", "dinosaurs", "unicorn", "space", "ocean", "cottagecore", "kawaii", "halloween", "christmas", "gothic", "botanical", "vintage", "japanese", "islamic", "farmhouse", "fantasy", "horses", "birds", "butterflies", "mushroom", "cars", "trucks", "princess", "mermaid", "dragons", "desert", "forest", "coffee"];
export const OCCASIONS = ["christmas gift", "birthday gift", "mothers day gift", "fathers day gift", "valentines day gift", "back to school", "stocking stuffer", "teacher appreciation gift", "graduation gift", "ramadan gift"];
export const FORMATS = ["large print", "easy", "advanced", "100 pages", "travel size", "pocket size", "one sided pages", "bold and easy", "simple designs", "stress relief", "extra large", "beginner friendly"];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export function generateNiches(categoryKey, count = 24, seedText = "") {
  const cat = NICHE_CATEGORIES[categoryKey];
  if (!cat) return [];
  const r = rng(hash(categoryKey + "|" + seedText + "|" + count));
  const pick = a => a[Math.floor(r() * a.length)];
  const out = new Map();
  let guard = 0;
  while (out.size < count && guard++ < count * 40) {
    const base = pick(cat.base);
    const p = Math.floor(r() * 6);
    let kw;
    if (p === 0) kw = pick(THEMES) + " " + base + " " + pick(AUDIENCES);
    else if (p === 1) kw = pick(FORMATS) + " " + base + " " + pick(AUDIENCES);
    else if (p === 2) kw = base + " " + pick(THEMES);
    else if (p === 3) kw = base + " " + pick(AUDIENCES) + " " + pick(OCCASIONS);
    else if (p === 4) kw = pick(FORMATS) + " " + pick(THEMES) + " " + base;
    else kw = pick(THEMES) + " " + base + " " + pick(FORMATS);
    
    kw = kw.replace(/\s+/g, " ").trim().toLowerCase();
    const words = kw.split(" ").length;
    if (words < 3 || words > 9) continue;
    if (!out.has(kw)) out.set(kw, { keyword: kw, words, category: categoryKey, longTail: words >= 5 });
  }
  return Array.from(out.values());
}
