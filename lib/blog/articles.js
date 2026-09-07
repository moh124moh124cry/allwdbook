// lib/blog/articles.js

import {
  getPublishedMarkdownArticles,
} from "./markdown";

export const BLOG_ARTICLES = [
  {
    id: "allwdbook-why-created",
    slug: "why-i-created-allwdbook",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: true,
    featuredOrder: 1,
    publishDate: "2026-08-18",
    readingTime: {
      ar: 7,
      en: 6,
    },
    heroImage: "/blog/allwdbook/hero.webp",
    toolPath: null,
    ar: {
      title: "لماذا أنشأت AllWDbook؟ المشكلة التي أردت حلها للناشرين",
      shortTitle: "لماذا أنشأت AllWDbook؟",
      description:
        "القصة وراء إنشاء AllWDbook، والمشكلة العملية التي دفعت إلى بناء منصة تجمع أدوات يحتاجها ناشرو الكتب والمنتجات الرقمية.",
    },
    en: {
      title:
        "Why I Created AllWDbook: The Problem I Wanted to Solve for Publishers",
      shortTitle: "Why I Created AllWDbook",
      description:
        "The story behind AllWDbook and the practical publishing problem that led to building a focused platform for digital publishers.",
    },
  },

  {
    id: "allwdbook-from-idea-to-platform",
    slug: "from-simple-idea-to-real-platform",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: true,
    featuredOrder: 2,
    publishDate: "2026-08-19",
    readingTime: {
      ar: 8,
      en: 7,
    },
    heroImage:
      "/blog/allwdbook/from-simple-idea-to-real-platform.webp",
    toolPath: null,
    ar: {
      title:
        "من فكرة بسيطة إلى منصة حقيقية: كيف بدأ بناء AllWDbook",
      shortTitle: "من فكرة بسيطة إلى منصة حقيقية",
      description:
        "نظرة عملية على المراحل الأولى لبناء AllWDbook، من تحديد المشكلة إلى تحويل الفكرة إلى منصة تعمل فعليًا على الويب.",
    },
    en: {
      title:
        "From a Simple Idea to a Real Platform: How AllWDbook Started",
      shortTitle: "From Idea to Real Platform",
      description:
        "A practical look at the early stages of AllWDbook, from identifying the problem to turning the idea into a functioning web platform.",
    },
  },

  {
    id: "allwdbook-visual-identity",
    slug: "how-allwdbook-visual-identity-was-designed",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: false,
    featuredOrder: null,
    publishDate: "2026-08-20",
    readingTime: {
      ar: 6,
      en: 6,
    },
    heroImage: "/blog/allwdbook/visual-identity.webp",
    toolPath: null,
    ar: {
      title: "كيف صممنا الهوية البصرية لـAllWDbook",
      shortTitle: "تصميم هوية AllWDbook",
      description:
        "كيف تم اختيار الطابع الأسود والبحري والبرتقالي وبناء هوية بصرية متناسقة مع طبيعة أدوات AllWDbook وتجربة المستخدم.",
    },
    en: {
      title: "How We Designed the AllWDbook Visual Identity",
      shortTitle: "Designing AllWDbook's Identity",
      description:
        "How the black, night-navy, and orange identity was shaped to match AllWDbook's publishing tools and mobile-first experience.",
    },
  },

  {
    id: "allwdbook-fouc-fix",
    slug: "how-we-fixed-allwdbook-loading-flash",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: true,
    featuredOrder: 3,
    publishDate: "2026-08-20",
    readingTime: {
      ar: 8,
      en: 7,
    },
    heroImage:
      "/blog/allwdbook/loading-flash-before-after.webp",
    toolPath: null,
    ar: {
      title:
        "المشكلة التي جعلت AllWDbook يومض عند التحميل وكيف أصلحناها",
      shortTitle: "مشكلة الوميض وكيف أصلحناها",
      description:
        "دراسة تقنية حقيقية لمشكلة FOUC التي ظهرت عند تحميل الصفحة، وكيف أدى نقل CSS من styled-jsx إلى ملف مستقل إلى حلها.",
    },
    en: {
      title:
        "The Loading Flash Problem in AllWDbook and How We Fixed It",
      shortTitle: "How We Fixed the Loading Flash",
      description:
        "A real technical case study of the FOUC issue that appeared during page load and how extracting CSS into a dedicated file solved it.",
    },
  },

  {
    id: "allwdbook-access-system",
    slug: "allwdbook-access-without-forced-account",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: true,
    featuredOrder: 4,
    publishDate: "2026-08-20",
    readingTime: {
      ar: 7,
      en: 7,
    },
    heroImage:
      "/blog/allwdbook/access-key-system.webp",
    toolPath: "/subscription",
    ar: {
      title:
        "كيف يعمل نظام الوصول في AllWDbook بدون فرض إنشاء حساب",
      shortTitle: "نظام الوصول بدون فرض حساب",
      description:
        "لماذا اختير نظام AWD-KEY بدل فرض التسجيل بالبريد وكلمة المرور، وكيف يمكن للمستخدم استعادة الوصول على جهاز جديد.",
    },
    en: {
      title:
        "How AllWDbook Access Works Without Forcing Account Creation",
      shortTitle: "Access Without a Forced Account",
      description:
        "Why AllWDbook uses an AWD-KEY access model instead of mandatory email-password accounts, including access restoration on a new device.",
    },
  },

  {
    id: "allwdbook-payment-provider-journey",
    slug: "choosing-payment-provider-lemon-squeezy-paddle-fastspring",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: false,
    featuredOrder: null,
    publishDate: "2026-08-21",
    readingTime: {
      ar: 10,
      en: 10,
    },
    heroImage:
      "/blog/allwdbook/allwdbook-payment-provider-journey.webp",
    toolPath: null,
    ar: {
      title:
        "كيف بحثنا عن بوابة الدفع المناسبة لـAllWDbook: من Lemon Squeezy إلى Paddle ثم FastSpring",
      shortTitle: "رحلة اختيار بوابة الدفع",
      description:
        "تجربة حقيقية في البحث عن بوابة الدفع المناسبة لـAllWDbook، من Lemon Squeezy وتجميد المدفوعات إلى تجربة Paddle ثم الانتقال إلى FastSpring.",
    },
    en: {
      title:
        "Choosing a Payment Provider for AllWDbook: From Lemon Squeezy to Paddle and FastSpring",
      shortTitle: "Choosing a Payment Provider",
      description:
        "A real AllWDbook build journey through Lemon Squeezy, Paddle, and FastSpring, including payment freezes, onboarding obstacles, and the search for a stable provider.",
    },
  },

  {
    id: "kdp-keyword-research",
    slug: "kdp-keyword-research-with-allwdbook",
    category: "kdp",
    series: null,
    published: true,
    featured: true,
    featuredOrder: 5,
    publishDate: "2026-08-20",
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage:
      "/blog/allwdbook/kdp-keyword-research-hero.webp",
    toolPath: "/?tool=keywords",
    ar: {
      title:
        "كيف أبحث عن كلمات مفتاحية لكتاب KDP باستخدام AllWDbook",
      shortTitle: "البحث عن كلمات KDP",
      description:
        "خطوات عملية للانتقال من فكرة كتاب أولية إلى مجموعة كلمات مفتاحية منظمة يمكن تقييمها واستخدامها في مشروع KDP.",
    },
    en: {
      title: "How to Research KDP Keywords with AllWDbook",
      shortTitle: "KDP Keyword Research",
      description:
        "A practical workflow for moving from an initial book idea to an organized set of keywords that can be evaluated for a KDP project.",
    },
  },

  {
    id: "kdp-micro-niche",
    slug: "from-broad-idea-to-micro-niche",
    category: "kdp",
    series: null,
    published: true,
    featured: true,
    featuredOrder: 6,
    publishDate: "2026-08-21",
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage:
      "/blog/allwdbook/micro-niche-workflow.webp",
    toolPath: "/?tool=micro-niche",
    ar: {
      title:
        "من فكرة عامة إلى Micro Niche: تجربة عملية داخل AllWDbook",
      shortTitle: "Micro Niche داخل AllWDbook",
      description:
        "تجربة عملية توضح كيف يمكن تضييق موضوع واسع تدريجيًا حتى الوصول إلى Micro Niche أكثر تحديدًا وقابلية للدراسة.",
    },
    en: {
      title:
        "From a Broad Idea to a Micro Niche: A Practical AllWDbook Workflow",
      shortTitle: "Micro Niche in AllWDbook",
      description:
        "A practical example showing how to narrow a broad topic step by step into a more focused and researchable micro niche.",
    },
  },
];

/**
 * تحويل مقال Markdown إلى نفس البنية
 * التي يستخدمها قالب المدونة القديم.
 */
function normalizeMarkdownArticle(article) {
  if (!article) {
    return null;
  }

  const language =
    article.language === "ar" ? "ar" : "en";

  return {
    id: `markdown-${language}-${article.slug}`,

    slug: article.slug,

    category: article.category || "allwdbook",

    series: null,

    published: Boolean(article.publishedAt),

    featured: Boolean(article.featured),

    featuredOrder: null,

    publishDate: article.publishedAt || null,

    updatedAt: article.updatedAt || null,

    readingTime: {
      [language]: article.readingTime || 1,
    },

    heroImage: article.heroImage || null,

    toolPath: article.toolPath || null,

    [language]: {
      title: article.title,
      shortTitle: article.title,
      description: article.description || "",
    },

    source: "markdown",

    wordCount: article.wordCount || 0,
  };
}

/**
 * الحصول على المقالات الجديدة من Markdown.
 */
function getMarkdownBlogArticles() {
  const articles = getPublishedMarkdownArticles();

  return articles.map(normalizeMarkdownArticle);
}

/**
 * دمج المقالات القديمة مع المقالات الجديدة.
 *
 * المقالات القديمة لها الأولوية لمنع التكرار.
 */
function getMergedBlogArticles() {
  const legacyArticles = BLOG_ARTICLES;
  const markdownArticles = getMarkdownBlogArticles();

  const legacySlugs = new Set(
    legacyArticles.map((article) => article.slug)
  );

  const newArticles = markdownArticles.filter(
    (article) => !legacySlugs.has(article.slug)
  );

  return [
    ...legacyArticles,
    ...newArticles,
  ];
}

/**
 * جميع المقالات.
 */
export const getAllBlogArticles = () =>
  getMergedBlogArticles();

/**
 * المقالات المنشورة.
 */
export const getPublishedBlogArticles = () =>
  getMergedBlogArticles().filter(
    (article) => article.published
  );

/**
 * المقالات المميزة.
 */
export const getFeaturedBlogArticles = () =>
  getMergedBlogArticles()
    .filter(
      (article) =>
        article.featured &&
        article.published
    )
    .sort(
      (a, b) =>
        (a.featuredOrder ??
          Number.MAX_SAFE_INTEGER) -
        (b.featuredOrder ??
          Number.MAX_SAFE_INTEGER)
    )
    .slice(0, 10);

/**
 * المقالات حسب القسم.
 */
export const getBlogArticlesByCategory = (
  category
) =>
  getMergedBlogArticles().filter(
    (article) =>
      article.category === category
  );

/**
 * البحث عن مقال بواسطة Slug.
 */
export const getBlogArticleBySlug = (
  slug
) =>
  getMergedBlogArticles().find(
    (article) =>
      article.slug === slug
  ) ?? null;

/**
 * الحصول على المقال باللغة المطلوبة.
 */
export const getLocalizedBlogArticle = (
  article,
  lang = "en"
) => {
  if (!article) {
    return null;
  }

  const language =
    lang === "ar" ? "ar" : "en";

  return {
    ...article,
    lang: language,
    content: article[language],
  };
};

/**
 * إنشاء رابط المقال.
 */
export const getBlogArticleUrl = (
  article,
  lang = "en"
) => {
  if (!article?.slug) {
    return null;
  }

  const language =
    lang === "ar" ? "ar" : "en";

  return `/${language}/blog/${article.slug}`;
};
