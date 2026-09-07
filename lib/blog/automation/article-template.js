/**
 * AllWDbook Blog Automation
 * Article Template
 *
 * يبني بيانات المقال التي سيستخدمها
 * نظام التوليد التلقائي لاحقًا.
 */

import { countArticleWords } from "./validator.js";

/**
 * تنظيف Slug
 */
export function createSlug(title = "") {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * حساب وقت القراءة.
 */
export function calculateReadingTime(content = "") {
  const wordCount = countArticleWords(content);

  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * إنشاء المقال النهائي.
 */
export function createArticle({
  title,
  description,
  content,
  language = "en",
  category = "kdp",
  tags = [],
  heroImage = "",
  toolPath = "",
  publishedAt = null,
  featured = false,
  author = "AllWDbook",
  seoTitle = "",
  seoDescription = "",
}) {
  const wordCount = countArticleWords(content);

  return {
    slug: createSlug(title),

    language,

    title: String(title || "").trim(),

    description: String(description || "").trim(),

    content: String(content || "").trim(),

    category,

    tags: Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],

    heroImage,

    toolPath,

    publishedAt,

    updatedAt: new Date().toISOString(),

    featured,

    author,

    seoTitle:
      String(seoTitle || "").trim() ||
      String(title || "").trim(),

    seoDescription:
      String(seoDescription || "").trim() ||
      String(description || "").trim(),

    wordCount,

    readingTime: calculateReadingTime(content),

    minimumWordCount: 1200,

    aiGenerated: true,

    source: "allwdbook-automation",

    status: publishedAt ? "published" : "draft",
  };
}

/**
 * تحويل المقال إلى Front Matter + Markdown.
 *
 * هذا هو الشكل الذي سيتم حفظه لاحقًا
 * داخل:
 *
 * content/blog/ar/
 * content/blog/en/
 */
export function articleToMarkdown(article) {
  if (!article) {
    throw new Error("Article is required.");
  }

  const tags = Array.isArray(article.tags)
    ? article.tags.join(", ")
    : "";

  const frontMatter = [
    "---",
    `title: "${escapeYaml(article.title)}"`,
    `description: "${escapeYaml(article.description)}"`,
    `category: "${escapeYaml(article.category)}"`,
    `language: "${escapeYaml(article.language)}"`,
    `tags: "${escapeYaml(tags)}"`,
    `heroImage: "${escapeYaml(article.heroImage || "")}"`,
    `toolPath: "${escapeYaml(article.toolPath || "")}"`,
    `publishedAt: "${escapeYaml(article.publishedAt || "")}"`,
    `updatedAt: "${escapeYaml(article.updatedAt || "")}"`,
    `featured: ${article.featured ? "true" : "false"}`,
    `author: "${escapeYaml(article.author || "AllWDbook")}"`,
    `seoTitle: "${escapeYaml(article.seoTitle || article.title)}"`,
    `seoDescription: "${escapeYaml(
      article.seoDescription || article.description
    )}"`,
    `wordCount: ${Number(article.wordCount || 0)}`,
    `readingTime: ${Number(article.readingTime || 1)}`,
    "---",
    "",
  ].join("\n");

  return `${frontMatter}${article.content.trim()}\n`;
}

/**
 * حماية علامات الاقتباس في Front Matter.
 */
function escapeYaml(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " ");
}

/**
 * إنشاء مسار ملف المقال.
 */
export function getArticleFilePath(article) {
  if (!article || !article.slug) {
    throw new Error("Article slug is required.");
  }

  const language = article.language === "ar"
    ? "ar"
    : "en";

  return `content/blog/${language}/${article.slug}.md`;
}
