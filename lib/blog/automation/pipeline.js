/**
 * AllWDbook Blog Automation
 * Article Generation Pipeline
 *
 * المرحلة الحالية:
 *
 * 1. اختيار موضوع
 * 2. فحص المقالات السابقة
 * 3. توليد المقال
 * 4. التحقق من الجودة
 * 5. تجهيز المقال للحفظ
 *
 * ملاحظة:
 * هذا الملف لا يكتب إلى GitHub.
 * سيتم إضافة GitHub Publisher في مرحلة لاحقة.
 */

import {
  selectRandomTopic,
} from "./topics.js";

import {
  buildHistoryContext,
  isTopicAvailable,
  findSimilarArticle,
} from "./history.js";

import {
  generateBlogArticle,
} from "./generator.js";

import {
  createArticle,
} from "./article-template.js";

import {
  validateArticle,
} from "./validator.js";

/**
 * الحد الأدنى للمقالات.
 */
const MIN_WORDS = 1200;

/**
 * إنشاء مقال كامل.
 */
export async function generateArticlePipeline({
  language = "en",
  topicId = null,
} = {}) {
  /**
   * --------------------------------------------------
   * المرحلة 1: اختيار الموضوع
   * --------------------------------------------------
   */

  let topic;

  if (topicId) {
    const { getTopicById } =
      await import("./topics.js");

    topic =
      getTopicById(
        topicId,
        language
      );
  } else {
    topic =
      selectRandomTopic(
        language
      );
  }

  if (!topic) {
    throw new Error(
      "No blog topic is available."
    );
  }

  /**
   * --------------------------------------------------
   * المرحلة 2: معرفة المقالات السابقة
   * --------------------------------------------------
   */

  const historyContext =
    buildHistoryContext(
      language,
      30
    );

  /**
   * --------------------------------------------------
   * المرحلة 3: فحص تشابه الموضوع
   * --------------------------------------------------
   */

  const topicCheck =
    findSimilarArticle(
      topic.topic,
      language,
      0.7
    );

  if (topicCheck.similar) {
    throw new Error(
      `A similar article already exists: ${topicCheck.article?.title || "unknown article"}`
    );
  }

  /**
   * --------------------------------------------------
   * المرحلة 4: التأكد من توفر الموضوع
   * --------------------------------------------------
   */

  if (
    !isTopicAvailable(
      topic.topic,
      language
    )
  ) {
    throw new Error(
      "Selected topic is already used."
    );
  }

  /**
   * --------------------------------------------------
   * المرحلة 5: توليد المقال
   * --------------------------------------------------
   */

  const generated =
    await generateBlogArticle({
      topic: topic.topic,

      keywords:
        topic.keywords || [],

      language,

      category:
        topic.category || "kdp",

      historyContext,
    });

  /**
   * --------------------------------------------------
   * المرحلة 6: إنشاء كائن المقال
   * --------------------------------------------------
   */

  const article =
    createArticle({
      title:
        extractTitle(
          generated.content,
          topic.topic
        ),

      description:
        createDescription(
          generated.content,
          topic.topic
        ),

      content:
        generated.content,

      language,

      category:
        topic.category || "kdp",

      tags:
        topic.keywords || [],

      toolPath:
        topic.toolPath || "",

      publishedAt:
        null,

      featured:
        false,

      author:
        "AllWDbook",

      seoTitle:
        extractTitle(
          generated.content,
          topic.topic
        ),

      seoDescription:
        createDescription(
          generated.content,
          topic.topic
        ),
    });

  /**
   * --------------------------------------------------
   * المرحلة 7: فحص المقال
   * --------------------------------------------------
   */

  const validation =
    validateArticle(
      article
    );

  if (!validation.valid) {
    throw new Error(
      [
        "Article failed validation.",

        ...validation.errors.map(
          (error) =>
            `- ${error}`
        ),
      ].join("\n")
    );
  }

  /**
   * --------------------------------------------------
   * المرحلة 8: نتيجة Pipeline
   * --------------------------------------------------
   */

  return {
    success: true,

    status: "validated",

    article,

    validation,

    generated: {
      model:
        generated.model,

      generatedAt:
        generated.generatedAt,

      topic:
        generated.topic,
    },

    nextStep:
      "github-publisher",
  };
}

/**
 * استخراج عنوان H1 من المقال.
 */
function extractTitle(
  content = "",
  fallback = ""
) {
  const match =
    String(content).match(
      /^#\s+(.+)$/m
    );

  if (match && match[1]) {
    return match[1]
      .trim()
      .replace(/^["']|["']$/g, "");
  }

  return fallback;
}

/**
 * إنشاء وصف مختصر من بداية المقال.
 *
 * لاحقًا يمكن استبداله بمخرجات SEO
 * مخصصة من الذكاء الاصطناعي.
 */
function createDescription(
  content = "",
  fallback = ""
) {
  const cleanText =
    String(content)
      .replace(/^#.*$/gm, "")
      .replace(/[*_`>#\[\]]/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\s+/g, " ")
      .trim();

  if (!cleanText) {
    return fallback;
  }

  /**
   * نحاول إبقاء الوصف مناسبًا
   * لمحركات البحث.
   */
  return cleanText.length > 155
    ? `${cleanText.slice(0, 152)}...`
    : cleanText;
}

/**
 * تشغيل المقال باللغة العربية.
 */
export async function generateArabicArticle(
  options = {}
) {
  return generateArticlePipeline({
    ...options,
    language: "ar",
  });
}

/**
 * تشغيل المقال باللغة الإنجليزية.
 */
export async function generateEnglishArticle(
  options = {}
) {
  return generateArticlePipeline({
    ...options,
    language: "en",
  });
}

/**
 * معلومات النظام.
 */
export function getPipelineConfig() {
  return {
    minimumWords:
      MIN_WORDS,

    stages: [
      "topic-selection",
      "history-check",
      "duplicate-check",
      "ai-generation",
      "article-creation",
      "quality-validation",
      "github-publisher",
    ],

    publishingEnabled:
      false,
  };
}
