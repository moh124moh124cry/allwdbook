/*
 * AllWDbook Blog — shared configuration and URL helpers.
 *
 * This file intentionally contains no React code and no browser-only APIs.
 * It can be imported safely by Server Components, Client Components,
 * metadata functions, the sitemap, and the homepage ticker.
 */

export const BLOG_DEFAULT_LANG = "ar";

export const BLOG_LANGS = Object.freeze([
  "ar",
  "en",
]);

export const BLOG_FEATURED_LIMIT = 10;

export const BLOG_BRAND = Object.freeze({
  name: "AllWDbook",
  siteUrl: "https://www.allwdbook.com",
  logo: "/logov3.png",
  theme: {
    black: "#02060d",
    navy: "#061326",
    navySoft: "#091a30",
    orange: "#ff6900",
    orangeSoft: "#ff8734",
    text: "#f7f9fd",
    muted: "#8d9db5",
  },
});

/*
 * The four permanent editorial sections.
 *
 * Keep category IDs and slugs stable after articles are indexed.
 * Display names and descriptions can evolve without changing URLs.
 */
export const BLOG_CATEGORIES = Object.freeze([
  Object.freeze({
    id: "allwdbook",
    slug: "allwdbook",
    icon: "🚀",
    ar: Object.freeze({
      name: "AllWDbook — من الفكرة إلى الإطلاق",
      shortName: "رحلة AllWDbook",
      description:
        "القصة الحقيقية لبناء AllWDbook: الفكرة، التصميم، التطوير، الأداء، الإطلاق والتحديثات.",
    }),
    en: Object.freeze({
      name: "AllWDbook — From Idea to Launch",
      shortName: "AllWDbook Journey",
      description:
        "The real story of building AllWDbook: idea, design, development, performance, launch, and product updates.",
    }),
  }),

  Object.freeze({
    id: "kdp",
    slug: "kdp",
    icon: "📚",
    ar: Object.freeze({
      name: "مختبر KDP والنشر الرقمي",
      shortName: "مختبر KDP",
      description:
        "تجارب عملية حول الكلمات المفتاحية، النيتش، الأغلفة، الوصف، التسعير وسير عمل النشر الرقمي.",
    }),
    en: Object.freeze({
      name: "KDP & Digital Publishing Lab",
      shortName: "KDP Lab",
      description:
        "Practical experiments with keywords, niches, covers, descriptions, pricing, and digital publishing workflows.",
    }),
  }),

  Object.freeze({
    id: "seo",
    slug: "seo",
    icon: "📈",
    ar: Object.freeze({
      name: "SEO والنمو وتحقيق الدخل",
      shortName: "SEO والنمو",
      description:
        "كيف نبني الظهور في البحث، نحسن الأداء، نطور المحتوى ونهيئ الموقع للنمو وتحقيق الدخل.",
    }),
    en: Object.freeze({
      name: "SEO, Growth & Monetization",
      shortName: "SEO & Growth",
      description:
        "How we improve search visibility, performance, content quality, growth, and monetization readiness.",
    }),
  }),

  Object.freeze({
    id: "creator",
    slug: "creator",
    icon: "🛠️",
    ar: Object.freeze({
      name: "بناء المنتجات الرقمية",
      shortName: "بناء المنتجات",
      description:
        "دروس عملية في تحويل مشكلة إلى منتج، تصميم تجربة الهاتف، إدارة التطوير، التسعير والإطلاق.",
    }),
    en: Object.freeze({
      name: "Creator & Product Building",
      shortName: "Product Building",
      description:
        "Practical lessons in turning a problem into a product, mobile-first UX, development, pricing, and launch.",
    }),
  }),
]);

export function normalizeBlogLang(value) {
  return BLOG_LANGS.includes(value)
    ? value
    : BLOG_DEFAULT_LANG;
}

export function isBlogLang(value) {
  return BLOG_LANGS.includes(value);
}

export function getBlogDirection(lang) {
  return normalizeBlogLang(lang) === "ar"
    ? "rtl"
    : "ltr";
}

export function getBlogCategory(categoryId) {
  return (
    BLOG_CATEGORIES.find(
      (category) =>
        category.id === categoryId ||
        category.slug === categoryId,
    ) || null
  );
}

export function getLocalizedBlogCategory(
  categoryId,
  lang,
) {
  const category =
    typeof categoryId === "string"
      ? getBlogCategory(categoryId)
      : categoryId;

  if (!category) {
    return null;
  }

  const safeLang = normalizeBlogLang(lang);

  return {
    id: category.id,
    slug: category.slug,
    icon: category.icon,
    ...category[safeLang],
  };
}

export function getAllLocalizedBlogCategories(lang) {
  return BLOG_CATEGORIES.map((category) =>
    getLocalizedBlogCategory(category, lang),
  );
}

export function getBlogHomeUrl(lang) {
  const safeLang = normalizeBlogLang(lang);

  return `/${safeLang}/blog`;
}

export function getBlogCategoryUrl(
  lang,
  categorySlug,
) {
  const safeLang = normalizeBlogLang(lang);

  return `/${safeLang}/blog?category=${encodeURIComponent(
    categorySlug,
  )}`;
}

export function getBlogArticleUrl(
  lang,
  slug,
) {
  const safeLang = normalizeBlogLang(lang);
  const safeSlug = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return `/${safeLang}/blog/${safeSlug}`;
}

export function getAlternateBlogLanguage(lang) {
  return normalizeBlogLang(lang) === "ar"
    ? "en"
    : "ar";
}

export function getAlternateBlogArticleUrl(
  lang,
  slug,
) {
  return getBlogArticleUrl(
    getAlternateBlogLanguage(lang),
    slug,
  );
}

export function getAbsoluteBlogUrl(pathname) {
  const path = String(pathname || "/");

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${BLOG_BRAND.siteUrl}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;
}
