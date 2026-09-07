import fs from "fs";
import path from "path";

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");

/**
 * قراءة جميع ملفات Markdown من لغة محددة
 */
function getLanguageDirectory(language) {
  return path.join(BLOG_ROOT, language);
}

/**
 * استخراج Front Matter من ملف Markdown
 *
 * مثال:
 *
 * ---
 * title: "KDP Keyword Research"
 * description: "..."
 * category: "kdp"
 * publishedAt: "2026-09-07"
 * ---
 *
 * # Article
 *
 * Content...
 */
function parseFrontMatter(source) {
  const match = source.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

  if (!match) {
    return {
      metadata: {},
      content: source.trim(),
    };
  }

  const frontMatter = match[1];
  const content = match[2].trim();

  const metadata = {};

  frontMatter.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    // إزالة علامات الاقتباس
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // تحويل القيم المنطقية
    if (value === "true") value = true;
    if (value === "false") value = false;

    metadata[key] = value;
  });

  return {
    metadata,
    content,
  };
}

/**
 * حساب عدد الكلمات
 */
function countWords(text) {
  if (!text) return 0;

  return text
    .replace(/[#*_>`~[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * حساب وقت القراءة التقريبي
 */
function calculateReadingTime(wordCount) {
  const wordsPerMinute = 200;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * قراءة مقال Markdown واحد
 */
export function getMarkdownArticle(slug, language = "en") {
  const filePath = path.join(
    getLanguageDirectory(language),
    `${slug}.md`
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const source = fs.readFileSync(filePath, "utf8");

  const { metadata, content } = parseFrontMatter(source);

  const wordCount = countWords(content);

  return {
    slug,
    language,
    title: metadata.title || slug,
    description: metadata.description || "",
    category: metadata.category || "allwdbook",
    tags: metadata.tags
      ? String(metadata.tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    heroImage: metadata.heroImage || "",
    seoTitle: metadata.seoTitle || metadata.title || slug,
    seoDescription:
      metadata.seoDescription ||
      metadata.description ||
      "",
    publishedAt: metadata.publishedAt || null,
    updatedAt: metadata.updatedAt || null,
    featured: metadata.featured === true,
    toolPath: metadata.toolPath || "",
    author: metadata.author || "AllWDbook",
    wordCount,
    readingTime: calculateReadingTime(wordCount),
    content,
    source: "markdown",
  };
}

/**
 * قراءة جميع المقالات للغة معينة
 */
export function getMarkdownArticles(language = "en") {
  const directory = getLanguageDirectory(language);

  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = fs
    .readdirSync(directory)
    .filter((file) => file.toLowerCase().endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/i, "");

      return getMarkdownArticle(slug, language);
    })
    .filter(Boolean)
    .filter((article) => article.publishedAt);
}

/**
 * قراءة المقالات المنشورة فقط
 */
export function getPublishedMarkdownArticles(language = "en") {
  return getMarkdownArticles(language)
    .filter((article) => {
      const publishedDate = new Date(article.publishedAt);

      return (
        !Number.isNaN(publishedDate.getTime()) &&
        publishedDate <= new Date()
      );
    })
    .sort((a, b) => {
      return (
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
      );
    });
}

/**
 * البحث عن مقال في Markdown
 */
export function findMarkdownArticle(slug, language = "en") {
  return getMarkdownArticle(slug, language);
}

/**
 * التحقق من الحد الأدنى لعدد الكلمات
 *
 * المقالات الآلية في مشروع AllWDbook
 * يجب ألا تقل عن 1200 كلمة.
 */
export function isArticleLongEnough(article, minimumWords = 1200) {
  if (!article) return false;

  return Number(article.wordCount || 0) >= minimumWords;
}

/**
 * التحقق من أن المقال جاهز للنشر
 */
export function validateMarkdownArticle(article) {
  if (!article) {
    return {
      valid: false,
      errors: ["Article does not exist."],
    };
  }

  const errors = [];

  if (!article.title) {
    errors.push("Missing article title.");
  }

  if (!article.description) {
    errors.push("Missing article description.");
  }

  if (!article.content) {
    errors.push("Missing article content.");
  }

  if (!isArticleLongEnough(article, 1200)) {
    errors.push(
      `Article must contain at least 1200 words. Current: ${article.wordCount}.`
    );
  }

  if (!article.publishedAt) {
    errors.push("Missing publishedAt date.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
