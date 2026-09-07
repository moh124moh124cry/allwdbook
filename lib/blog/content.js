// lib/blog/content.js

import { getBlogArticleBySlug } from "./articles";
import { getMarkdownArticle } from "./markdown";

import whyICreatedAllwdbook from "./posts/why-i-created-allwdbook";
import fromSimpleIdeaToRealPlatform from "./posts/from-simple-idea-to-real-platform";
import howAllwdbookVisualIdentityWasDesigned from "./posts/how-allwdbook-visual-identity-was-designed";
import howWeFixedAllwdbookLoadingFlash from "./posts/how-we-fixed-allwdbook-loading-flash";
import allwdbookAccessWithoutForcedAccount from "./posts/allwdbook-access-without-forced-account";
import choosingPaymentProvider from "./posts/choosing-payment-provider-lemon-squeezy-paddle-fastspring";
import kdpKeywordResearchWithAllwdbook from "./posts/kdp-keyword-research-with-allwdbook";
import fromBroadIdeaToMicroNiche from "./posts/from-broad-idea-to-micro-niche";

const BLOG_CONTENT = {
  "why-i-created-allwdbook": {
    ar: whyICreatedAllwdbook.ar,
    en: whyICreatedAllwdbook.en,
  },

  "from-simple-idea-to-real-platform": {
    ar: fromSimpleIdeaToRealPlatform.ar,
    en: fromSimpleIdeaToRealPlatform.en,
  },

  "how-allwdbook-visual-identity-was-designed": {
    ar: howAllwdbookVisualIdentityWasDesigned.ar,
    en: howAllwdbookVisualIdentityWasDesigned.en,
  },

  "how-we-fixed-allwdbook-loading-flash": {
    ar: howWeFixedAllwdbookLoadingFlash.ar,
    en: howWeFixedAllwdbookLoadingFlash.en,
  },

  "allwdbook-access-without-forced-account": {
    ar: allwdbookAccessWithoutForcedAccount.ar,
    en: allwdbookAccessWithoutForcedAccount.en,
  },

  "choosing-payment-provider-lemon-squeezy-paddle-fastspring": {
    ar: choosingPaymentProvider.ar,
    en: choosingPaymentProvider.en,
  },

  "kdp-keyword-research-with-allwdbook": {
    ar: kdpKeywordResearchWithAllwdbook.ar,
    en: kdpKeywordResearchWithAllwdbook.en,
  },

  "from-broad-idea-to-micro-niche": {
    ar: fromBroadIdeaToMicroNiche.ar,
    en: fromBroadIdeaToMicroNiche.en,
  },
};

/**
 * الحصول على محتوى المقال الثابت
 */
export const getBlogContentBySlug = (slug) =>
  BLOG_CONTENT[slug] ?? null;

/**
 * الحصول على محتوى المقال باللغة المطلوبة
 *
 * إذا لم يكن المقال موجودًا ضمن المقالات القديمة،
 * نحاول قراءته من Markdown الجديد.
 */
export const getLocalizedBlogContent = (
  slug,
  lang = "en"
) => {
  const language = lang === "ar" ? "ar" : "en";

  // المقالات القديمة
  const content = getBlogContentBySlug(slug);

  if (content?.[language]) {
    return content[language];
  }

  // المقالات الجديدة من Markdown
  const markdownArticle = getMarkdownArticle(
    slug,
    language
  );

  if (!markdownArticle) {
    return null;
  }

  return {
    title: markdownArticle.title,
    description: markdownArticle.description,
    content: markdownArticle.content,
    body: markdownArticle.content,
  };
};

/**
 * تحويل مقال Markdown إلى نفس البنية
 * التي يستخدمها قالب المقالات القديمة.
 */
function getMarkdownCompleteArticle(
  slug,
  language
) {
  const markdownArticle = getMarkdownArticle(
    slug,
    language
  );

  if (!markdownArticle) {
    return null;
  }

  return {
    id: `markdown-${language}-${slug}`,
    slug,
    category: markdownArticle.category || "allwdbook",
    series: null,

    published: Boolean(
      markdownArticle.publishedAt
    ),

    featured: Boolean(
      markdownArticle.featured
    ),

    featuredOrder: null,

    publishDate:
      markdownArticle.publishedAt || null,

    updatedAt:
      markdownArticle.updatedAt || null,

    readingTime: {
      [language]: markdownArticle.readingTime,
    },

    heroImage:
      markdownArticle.heroImage || null,

    toolPath:
      markdownArticle.toolPath || null,

    [language]: {
      title: markdownArticle.title,
      shortTitle: markdownArticle.title,
      description:
        markdownArticle.description || "",
    },

    lang: language,

    content: {
      title: markdownArticle.title,
      description:
        markdownArticle.description || "",
      content: markdownArticle.content,
      body: markdownArticle.content,
    },

    meta: {
      title:
        markdownArticle.seoTitle ||
        markdownArticle.title,

      description:
        markdownArticle.seoDescription ||
        markdownArticle.description ||
        "",
    },

    wordCount: markdownArticle.wordCount,
    author: markdownArticle.author,
    source: "markdown",
  };
};

/**
 * الحصول على المقال الكامل
 *
 * الأولوية:
 * 1. المقال القديم
 * 2. المقال الجديد من Markdown
 */
export const getCompleteBlogArticle = (
  slug,
  lang = "en"
) => {
  const language = lang === "ar" ? "ar" : "en";

  // البحث أولًا في المقالات القديمة
  const article = getBlogArticleBySlug(slug);

  if (article) {
    return {
      ...article,
      lang: language,
      content: getLocalizedBlogContent(
        slug,
        language
      ),
      meta: article[language],
    };
  }

  // البحث في مقالات Markdown الجديدة
  return getMarkdownCompleteArticle(
    slug,
    language
  );
};

/**
 * التحقق من وجود محتوى للمقال
 *
 * يدعم المقالات القديمة والجديدة.
 */
export const hasBlogContent = (
  slug,
  lang = "en"
) =>
  Boolean(
    getLocalizedBlogContent(
      slug,
      lang
    )
  );
