// lib/blog/content.js

import { getBlogArticleBySlug } from "./articles";

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


export const getBlogContentBySlug = (slug) =>
  BLOG_CONTENT[slug] ?? null;


export const getLocalizedBlogContent = (
  slug,
  lang = "en"
) => {

  const content = getBlogContentBySlug(slug);

  if (!content) {
    return null;
  }

  const language = lang === "ar" ? "ar" : "en";

  return content[language] ?? null;

};


export const getCompleteBlogArticle = (
  slug,
  lang = "en"
) => {

  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const language = lang === "ar" ? "ar" : "en";

  return {
    ...article,
    lang: language,
    content: getLocalizedBlogContent(
      slug,
      language
    ),
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
