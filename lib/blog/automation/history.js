/**
 * AllWDbook Blog Automation
 * Article History
 *
 * هذا الملف مسؤول عن:
 * - معرفة المقالات الموجودة حاليًا
 * - منع تكرار الموضوعات
 * - منع تكرار Slug
 * - إعطاء النظام قائمة بالمواضيع المستخدمة
 *
 * لا يقوم هذا الملف بنشر أو حذف أي مقال.
 */

import {
  getPublishedMarkdownArticles,
} from "../markdown.js";

import {
  getPublishedBlogArticles,
} from "../articles.js";

/**
 * الحصول على جميع المقالات الحالية.
 *
 * نقرأ:
 * 1. المقالات الجديدة من Markdown
 * 2. المقالات القديمة الموجودة في النظام الحالي
 */
export function getExistingArticles(language = "en") {
  const markdownArticles =
    getPublishedMarkdownArticles(language);

  const legacyArticles =
    getPublishedBlogArticles().filter(
      (article) => {
        return (
          article.language === language ||
          !article.language
        );
      }
    );

  /**
   * دمج المقالات بدون تكرار Slug.
   */
  const articles = [
    ...legacyArticles,
    ...markdownArticles,
  ];

  const unique = new Map();

  for (const article of articles) {
    if (!article || !article.slug) {
      continue;
    }

    const key = `${language}:${article.slug}`;

    if (!unique.has(key)) {
      unique.set(key, article);
    }
  }

  return Array.from(unique.values());
}

/**
 * الحصول على Slugs المستخدمة.
 */
export function getUsedSlugs(language = "en") {
  return getExistingArticles(language)
    .map((article) => article.slug)
    .filter(Boolean);
}

/**
 * معرفة هل Slug مستخدم مسبقًا.
 */
export function isSlugUsed(
  slug,
  language = "en"
) {
  if (!slug) {
    return false;
  }

  const normalizedSlug = String(slug)
    .trim()
    .toLowerCase();

  return getUsedSlugs(language).some(
    (usedSlug) =>
      String(usedSlug).trim().toLowerCase() ===
      normalizedSlug
  );
}

/**
 * استخراج عناوين المقالات الموجودة.
 */
export function getExistingTitles(
  language = "en"
) {
  return getExistingArticles(language)
    .map((article) => article.title)
    .filter(Boolean);
}

/**
 * استخراج المواضيع/العناوين المستخدمة.
 *
 * تستخدم هذه القائمة لاحقًا حتى لا يقوم
 * الذكاء الاصطناعي بإعادة إنتاج نفس المقال.
 */
export function getUsedTopics(
  language = "en"
) {
  return getExistingArticles(language)
    .map((article) => ({
      title: article.title || "",
      description: article.description || "",
      category: article.category || "",
      slug: article.slug || "",
    }))
    .filter(
      (item) =>
        item.title ||
        item.description ||
        item.slug
    );
}

/**
 * إنشاء نص مختصر عن المقالات الحالية
 * لإرساله لاحقًا إلى نظام توليد المقال.
 *
 * لا نرسل المحتوى الكامل للمقالات القديمة،
 * لأن ذلك غير ضروري ويزيد حجم الطلب.
 */
export function buildHistoryContext(
  language = "en",
  limit = 30
) {
  const articles = getUsedTopics(language)
    .slice(0, limit);

  if (!articles.length) {
    return "No previous articles are available.";
  }

  return articles
    .map((article, index) => {
      return [
        `${index + 1}. ${article.title}`,
        `Category: ${article.category}`,
        `Slug: ${article.slug}`,
      ].join(" | ");
    })
    .join("\n");
}

/**
 * حساب تشابه بسيط بين عنوانين.
 *
 * هذه ليست خوارزمية AI،
 * لكنها تمنع التكرار الواضح.
 */
export function calculateTitleSimilarity(
  titleA = "",
  titleB = ""
) {
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean);

  const wordsA = new Set(normalize(titleA));
  const wordsB = new Set(normalize(titleB));

  if (!wordsA.size || !wordsB.size) {
    return 0;
  }

  let common = 0;

  for (const word of wordsA) {
    if (wordsB.has(word)) {
      common++;
    }
  }

  const denominator =
    Math.max(wordsA.size, wordsB.size);

  return common / denominator;
}

/**
 * البحث عن مقال مشابه.
 */
export function findSimilarArticle(
  title,
  language = "en",
  threshold = 0.7
) {
  const articles =
    getExistingArticles(language);

  for (const article of articles) {
    const similarity =
      calculateTitleSimilarity(
        title,
        article.title
      );

    if (similarity >= threshold) {
      return {
        similar: true,
        article,
        similarity,
      };
    }
  }

  return {
    similar: false,
    article: null,
    similarity: 0,
  };
}

/**
 * التحقق النهائي من أن الموضوع جديد.
 */
export function isTopicAvailable(
  title,
  language = "en"
) {
  if (!title) {
    return false;
  }

  const result =
    findSimilarArticle(
      title,
      language,
      0.7
    );

  return !result.similar;
}

/**
 * إحصائيات المدونة.
 */
export function getBlogHistoryStats(
  language = "en"
) {
  const articles =
    getExistingArticles(language);

  return {
    language,
    totalArticles: articles.length,

    featuredArticles:
      articles.filter(
        (article) => article.featured
      ).length,

    categories: [
      ...new Set(
        articles
          .map(
            (article) =>
              article.category
          )
          .filter(Boolean)
      ),
    ],

    latestArticle:
      articles.length > 0
        ? articles
            .slice()
            .sort(
              (a, b) =>
                new Date(
                  b.publishedAt || 0
                ).getTime() -
                new Date(
                  a.publishedAt || 0
                ).getTime()
            )[0]
        : null,
  };
}
