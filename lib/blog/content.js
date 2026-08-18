// lib/blog/content.js

import {
  getBlogArticleBySlug,
} from "./articles";

import whyICreatedAllwdbook from "./posts/why-i-created-allwdbook";

const BLOG_CONTENT = {
  "why-i-created-allwdbook": {
    ar: whyICreatedAllwdbook.ar,
    en: whyICreatedAllwdbook.en,
  },

  "from-simple-idea-to-real-platform": {
    ar: null,
    en: null,
  },

  "how-allwdbook-visual-identity-was-designed": {
    ar: null,
    en: null,
  },

  "how-we-fixed-allwdbook-loading-flash": {
    ar: null,
    en: null,
  },

  "allwdbook-access-without-forced-account": {
    ar: null,
    en: null,
  },

  "60-days-building-allwdbook-before-monetization": {
    ar: null,
    en: null,
  },

  "kdp-keyword-research-with-allwdbook": {
    ar: null,
    en: null,
  },

  "from-broad-idea-to-micro-niche": {
    ar: null,
    en: null,
  },

  "prepare-book-cover-idea-before-design": {
    ar: null,
    en: null,
  },

  "book-pricing-and-profitability-before-publishing": {
    ar: null,
    en: null,
  },

  "turn-basic-book-description-into-publish-ready-copy": {
    ar: null,
    en: null,
  },

  "niche-to-keywords-to-book-workflow": {
    ar: null,
    en: null,
  },

  "why-www-allwdbook-com-is-the-canonical-domain": {
    ar: null,
    en: null,
  },

  "allwdbook-sitemap-robots-canonical-setup": {
    ar: null,
    en: null,
  },

  "how-we-made-allwdbook-faster-without-changing-tools": {
    ar: null,
    en: null,
  },

  "building-arabic-english-site-without-confusing-google": {
    ar: null,
    en: null,
  },

  "building-original-content-instead-of-repetitive-blog-posts": {
    ar: null,
    en: null,
  },

  "prepare-new-site-for-adsense-without-sacrificing-quality": {
    ar: null,
    en: null,
  },

  "turn-real-problem-into-digital-product": {
    ar: null,
    en: null,
  },

  "building-real-project-with-github-and-vercel": {
    ar: null,
    en: null,
  },

  "why-allwdbook-was-designed-mobile-first": {
    ar: null,
    en: null,
  },

  "how-to-think-about-small-digital-product-pricing": {
    ar: null,
    en: null,
  },

  "diagnose-real-technical-problem-without-random-patches": {
    ar: null,
    en: null,
  },

  "what-happens-after-product-launch": {
    ar: null,
    en: null,
  },
};

const BLOG_IMAGE_OVERRIDES = {
  "why-i-created-allwdbook": {
    heroImage:
      "/blog/allwdbook/hero.webp",

    media: {
      "/blog/allwdbook/why-i-created-allwdbook-tools.webp":
        "/blog/allwdbook/tools.webp",
    },
  },
};

function applyBlogImageOverrides(
  slug,
  content
) {
  if (!content) {
    return null;
  }

  const overrides =
    BLOG_IMAGE_OVERRIDES[slug];

  if (
    !overrides?.media ||
    !Array.isArray(content.media)
  ) {
    return content;
  }

  return {
    ...content,

    media: content.media.map(
      (item) => ({
        ...item,

        src:
          overrides.media[
            item.src
          ] || item.src,
      })
    ),
  };
}

export const getBlogContentBySlug = (
  slug
) =>
  BLOG_CONTENT[slug] ?? null;

export const getLocalizedBlogContent = (
  slug,
  lang = "en"
) => {
  const content =
    getBlogContentBySlug(slug);

  if (!content) {
    return null;
  }

  const language =
    lang === "ar" ? "ar" : "en";

  return (
    content[language] ?? null
  );
};

export const getCompleteBlogArticle = (
  slug,
  lang = "en"
) => {
  const article =
    getBlogArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const language =
    lang === "ar" ? "ar" : "en";

  const rawContent =
    getLocalizedBlogContent(
      slug,
      language
    );

  const content =
    applyBlogImageOverrides(
      slug,
      rawContent
    );

  const imageOverrides =
    BLOG_IMAGE_OVERRIDES[slug];

  return {
    ...article,

    heroImage:
      imageOverrides?.heroImage ||
      article.heroImage,

    lang: language,
    content,
    meta: article[language],
  };
};

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
