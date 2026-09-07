import {
  generateArabicArticle,
  generateEnglishArticle,
} from "./pipeline.js";

import {
  publishArticleToGitHub,
  articleExistsOnGitHub,
} from "./github-publisher.js";

import { articleToMarkdown } from "./article-template.js";
import { validateArticle } from "./validator.js";

/**
 * نشر مقال كامل من البداية إلى GitHub.
 *
 * المسار:
 *
 * Topic
 *   ↓
 * AI Generator
 *   ↓
 * Validator
 *   ↓
 * Markdown
 *   ↓
 * GitHub
 */

function normalizeLanguage(language) {
  const value = String(language || "en").toLowerCase();

  if (value !== "ar" && value !== "en") {
    throw new Error(
      `Unsupported language "${language}". Expected "ar" or "en".`
    );
  }

  return value;
}

/**
 * إنشاء رسالة Commit مناسبة.
 */
function createCommitMessage(article) {
  const language =
    article.language === "ar"
      ? "AR"
      : "EN";

  return `Add ${language} blog article: ${article.slug}`;
}

/**
 * تجهيز Markdown النهائي.
 */
function prepareMarkdown(article) {
  const markdown = articleToMarkdown(article);

  if (!markdown || !markdown.trim()) {
    throw new Error("Generated Markdown is empty.");
  }

  return markdown;
}

/**
 * نشر مقال واحد.
 */
export async function publishGeneratedArticle({
  language = "en",
  topicId = null,
} = {}) {
  const normalizedLanguage =
    normalizeLanguage(language);

  const startedAt = new Date().toISOString();

  try {
    /**
     * 1. توليد المقال.
     */
    const pipeline =
      normalizedLanguage === "ar"
        ? await generateArabicArticle({
            topicId,
          })
        : await generateEnglishArticle({
            topicId,
          });

    if (!pipeline?.success) {
      throw new Error(
        "Article generation pipeline failed."
      );
    }

    const article = pipeline.article;

    /**
     * 2. التحقق النهائي.
     */
    const validation =
      validateArticle(article);

    if (!validation.valid) {
      throw new Error(
        `Final validation failed: ${validation.errors.join(
          " | "
        )}`
      );
    }

    /**
     * 3. إنشاء Markdown.
     */
    const markdown =
      prepareMarkdown(article);

    /**
     * 4. التأكد من عدم وجود المقال مسبقًا.
     */
    const exists =
      await articleExistsOnGitHub(
        article
      );

    if (exists) {
      return {
        success: false,
        status: "duplicate",
        message:
          "Article already exists on GitHub.",
        slug: article.slug,
        language:
          article.language,
      };
    }

    /**
     * 5. نشر المقال.
     */
    const githubResult =
      await publishArticleToGitHub({
        ...article,
        markdown,
        commitMessage:
          createCommitMessage(article),
      });

    return {
      success: true,
      status: "published",
      language:
        article.language,
      slug: article.slug,
      title: article.title,
      wordCount:
        article.wordCount,
      readingTime:
        article.readingTime,
      github: githubResult,
      validation,
      startedAt,
      completedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      status: "error",
      language: normalizedLanguage,
      error:
        error?.message ||
        "Unknown publishing error.",
      startedAt,
      completedAt:
        new Date().toISOString(),
    };
  }
}

/**
 * نشر مقال عربي.
 */
export async function publishArabicArticle({
  topicId = null,
} = {}) {
  return publishGeneratedArticle({
    language: "ar",
    topicId,
  });
}

/**
 * نشر مقال إنجليزي.
 */
export async function publishEnglishArticle({
  topicId = null,
} = {}) {
  return publishGeneratedArticle({
    language: "en",
    topicId,
  });
}

/**
 * نشر المقال باللغة المطلوبة.
 */
export async function publishArticle({
  language = "en",
  topicId = null,
} = {}) {
  return publishGeneratedArticle({
    language,
    topicId,
  });
}

/**
 * إعدادات النشر.
 */
export function getPublisherConfig() {
  return {
    supportedLanguages: [
      "ar",
      "en",
    ],

    minimumWordCount: 1200,

    storage:
      "GitHub Markdown",

    pipeline: [
      "topic-selection",
      "ai-generation",
      "validation",
      "markdown-generation",
      "duplicate-check",
      "github-publish",
    ],
  };
}
