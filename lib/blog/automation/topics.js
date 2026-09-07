/**
 * AllWDbook Blog Automation
 * Topic Engine
 *
 * المواضيع هنا مرتبطة مباشرة بـ:
 * - KDP
 * - Keyword Research
 * - Micro Niche Research
 * - Book Covers
 * - Book Description
 * - Royalty Calculator
 * - Self Publishing
 * - AI for Authors
 */

/**
 * قائمة المواضيع الأساسية.
 *
 * النظام سيختار منها لاحقًا بشكل تلقائي،
 * مع منع تكرار الموضوعات.
 */
export const BLOG_TOPICS = [
  {
    id: "kdp-keyword-research",
    category: "kdp",
    toolPath: "/?tool=keywords",

    en: {
      topic:
        "How to Find Better KDP Keywords for a New Book",
      keywords: [
        "KDP keywords",
        "Amazon KDP keywords",
        "keyword research",
        "KDP book keywords",
      ],
    },

    ar: {
      topic:
        "كيف تجد كلمات مفتاحية أفضل لكتاب جديد على KDP",
      keywords: [
        "كلمات KDP المفتاحية",
        "الكلمات المفتاحية لكتب أمازون",
        "بحث الكلمات المفتاحية",
        "KDP",
      ],
    },
  },

  {
    id: "micro-niche-research",
    category: "kdp",
    toolPath: "/?tool=micro-niche",

    en: {
      topic:
        "How to Turn a Broad Book Idea Into a Profitable Micro Niche",
      keywords: [
        "KDP micro niche",
        "book niche research",
        "micro niche research",
        "KDP niches",
      ],
    },

    ar: {
      topic:
        "كيف تحول فكرة كتاب عامة إلى Micro Niche قابلة للدراسة",
      keywords: [
        "Micro Niche",
        "تخصصات الكتب",
        "أفكار كتب KDP",
        "بحث النيتش",
      ],
    },
  },

  {
    id: "kdp-book-cover",
    category: "kdp",
    toolPath: "/?tool=cover",

    en: {
      topic:
        "How to Create a KDP Book Cover That Looks Professional",
      keywords: [
        "KDP book cover",
        "Amazon KDP cover",
        "book cover design",
        "self publishing cover",
      ],
    },

    ar: {
      topic:
        "كيف تصمم غلاف كتاب KDP احترافيًا وجذابًا",
      keywords: [
        "غلاف كتاب KDP",
        "تصميم غلاف كتاب",
        "غلاف أمازون KDP",
        "النشر الذاتي",
      ],
    },
  },

  {
    id: "kdp-book-description",
    category: "kdp",
    toolPath: "/?tool=description",

    en: {
      topic:
        "How to Write a Better Amazon KDP Book Description",
      keywords: [
        "KDP book description",
        "Amazon book description",
        "book description",
        "KDP publishing",
      ],
    },

    ar: {
      topic:
        "كيف تكتب وصفًا احترافيًا لكتابك على Amazon KDP",
      keywords: [
        "وصف كتاب KDP",
        "وصف الكتاب",
        "Amazon KDP",
        "النشر على أمازون",
      ],
    },
  },

  {
    id: "kdp-royalties",
    category: "kdp",
    toolPath: "/?tool=royalty",

    en: {
      topic:
        "KDP Royalties Explained: What Authors Should Understand",
      keywords: [
        "KDP royalties",
        "Amazon KDP royalties",
        "KDP pricing",
        "book royalties",
      ],
    },

    ar: {
      topic:
        "أرباح KDP: ما الذي يجب أن يعرفه المؤلف قبل نشر كتابه",
      keywords: [
        "أرباح KDP",
        "Amazon KDP",
        "سعر الكتاب",
        "أرباح الكتب",
      ],
    },
  },

  {
    id: "kdp-publishing-process",
    category: "kdp",
    toolPath: "",

    en: {
      topic:
        "A Practical KDP Publishing Checklist for New Authors",
      keywords: [
        "KDP publishing checklist",
        "Amazon KDP publishing",
        "self publishing",
        "KDP for beginners",
      ],
    },

    ar: {
      topic:
        "دليل عملي لنشر كتابك عبر KDP للمبتدئين",
      keywords: [
        "نشر كتاب KDP",
        "Amazon KDP",
        "النشر الذاتي",
        "KDP للمبتدئين",
      ],
    },
  },

  {
    id: "ai-for-authors",
    category: "kdp",
    toolPath: "",

    en: {
      topic:
        "How Authors Can Use AI to Improve Their KDP Publishing Workflow",
      keywords: [
        "AI for authors",
        "AI KDP",
        "AI publishing tools",
        "KDP workflow",
      ],
    },

    ar: {
      topic:
        "كيف يمكن للمؤلف استخدام الذكاء الاصطناعي لتحسين سير عمل KDP",
      keywords: [
        "الذكاء الاصطناعي للمؤلفين",
        "AI KDP",
        "أدوات النشر",
        "KDP",
      ],
    },
  },

  {
    id: "kdp-market-research",
    category: "kdp",
    toolPath: "/?tool=micro-niche",

    en: {
      topic:
        "How to Research a KDP Book Market Before Writing",
      keywords: [
        "KDP market research",
        "book market research",
        "Amazon KDP research",
        "KDP competition",
      ],
    },

    ar: {
      topic:
        "كيف تدرس سوق KDP قبل البدء في كتابة الكتاب",
      keywords: [
        "دراسة سوق KDP",
        "بحث سوق الكتب",
        "منافسة KDP",
        "Amazon KDP",
      ],
    },
  },

  {
    id: "kdp-keywords-mistakes",
    category: "kdp",
    toolPath: "/?tool=keywords",

    en: {
      topic:
        "Common KDP Keyword Research Mistakes Authors Should Avoid",
      keywords: [
        "KDP keyword mistakes",
        "KDP keywords",
        "keyword research mistakes",
        "Amazon KDP SEO",
      ],
    },

    ar: {
      topic:
        "أخطاء شائعة في البحث عن كلمات KDP المفتاحية يجب تجنبها",
      keywords: [
        "أخطاء كلمات KDP",
        "الكلمات المفتاحية",
        "بحث الكلمات",
        "SEO KDP",
      ],
    },
  },

  {
    id: "kdp-micro-niche-mistakes",
    category: "kdp",
    toolPath: "/?tool=micro-niche",

    en: {
      topic:
        "Common Micro Niche Research Mistakes in KDP Publishing",
      keywords: [
        "KDP micro niche mistakes",
        "micro niche research",
        "KDP niche research",
        "book niches",
      ],
    },

    ar: {
      topic:
        "أخطاء شائعة عند اختيار Micro Niche لكتب KDP",
      keywords: [
        "Micro Niche",
        "أخطاء اختيار النيتش",
        "كتب KDP",
        "بحث النيتش",
      ],
    },
  },
];

/**
 * إرجاع كل المواضيع للغة المطلوبة.
 */
export function getTopics(language = "en") {
  const lang = language === "ar" ? "ar" : "en";

  return BLOG_TOPICS.map((item) => ({
    id: item.id,
    category: item.category,
    toolPath: item.toolPath,
    topic: item[lang].topic,
    keywords: item[lang].keywords,
    language: lang,
  }));
}

/**
 * الحصول على موضوع بواسطة ID.
 */
export function getTopicById(id, language = "en") {
  const topic = BLOG_TOPICS.find(
    (item) => item.id === id
  );

  if (!topic) {
    return null;
  }

  const lang = language === "ar" ? "ar" : "en";

  return {
    id: topic.id,
    category: topic.category,
    toolPath: topic.toolPath,
    topic: topic[lang].topic,
    keywords: topic[lang].keywords,
    language: lang,
  };
}

/**
 * اختيار موضوع بشكل شبه عشوائي.
 *
 * لاحقًا سيتم استبدال هذا الاختيار
 * بخوارزمية تعتمد على:
 * - المقالات المنشورة
 * - آخر موضوع مستخدم
 * - الأولوية
 * - التكرار
 * - الكلمات المفتاحية
 */
export function selectRandomTopic(language = "en") {
  const topics = getTopics(language);

  if (!topics.length) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * topics.length
  );

  return topics[randomIndex];
}

/**
 * الحصول على قائمة مواضيع يمكن استخدامها
 * في لوحة إدارة المدونة.
 */
export function getTopicCatalog() {
  return BLOG_TOPICS.map((item) => ({
    id: item.id,
    category: item.category,
    toolPath: item.toolPath,
    en: item.en,
    ar: item.ar,
  }));
}
