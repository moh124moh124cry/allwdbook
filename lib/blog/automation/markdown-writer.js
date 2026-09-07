import fs from "fs/promises";
import path from "path";

import { articleToMarkdown, getArticleFilePath } from "./article-template.js";
import { validateArticle } from "./validator.js";

/**
 * يحفظ المقال كملف Markdown داخل:
 *
 * content/blog/ar/
 * content/blog/en/
 *
 * ملاحظة:
 * هذا الملف مخصص لمرحلة تجهيز وحفظ المقال محليًا.
 * في الخطوة التالية سنربطه بالنشر التلقائي عبر GitHub.
 */

/**
 * الحصول على المسار المطلق لمجلد المقالات.
 */
function getContentBlogDirectory() {
  return path.join(process.cwd(), "content", "blog");
}

/**
 * التأكد من أن لغة المقال صحيحة.
 */
function normalizeLanguage(language) {
  const value = String(language || "en").toLowerCase();

  if (value !== "ar" && value !== "en") {
    throw new Error(
      `Unsupported article language: ${language}. Expected "ar" or "en".`
    );
  }

  return value;
}

/**
 * التأكد من أن اسم الملف آمن.
 */
function validateFileName(fileName) {
  if (!fileName || typeof fileName !== "string") {
    throw new Error("Invalid article file name.");
  }

  if (
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("..")
  ) {
    throw new Error("Unsafe article file name.");
  }

  if (!fileName.endsWith(".md")) {
    throw new Error("Article file must use the .md extension.");
  }

  return true;
}

/**
 * إنشاء المسار الكامل للمقال.
 */
function getAbsoluteArticlePath(article) {
  const language = normalizeLanguage(article.language);

  const relativePath = getArticleFilePath({
    ...article,
    language,
  });

  const contentDirectory = getContentBlogDirectory();

  const absolutePath = path.resolve(contentDirectory, relativePath);

  const allowedDirectory = path.resolve(
    contentDirectory,
    language
  );

  if (
    absolutePath !== allowedDirectory &&
    !absolutePath.startsWith(`${allowedDirectory}${path.sep}`)
  ) {
    throw new Error("Article path is outside the allowed blog directory.");
  }

  return absolutePath;
}

/**
 * التأكد من عدم وجود المقال مسبقًا.
 */
async function ensureArticleDoesNotExist(filePath) {
  try {
    await fs.access(filePath);

    throw new Error(
      `Article already exists and will not be overwritten: ${filePath}`
    );
  } catch (error) {
    if (error?.code === "ENOENT") {
      return true;
    }

    throw error;
  }
}

/**
 * حفظ المقال كملف Markdown.
 */
export async function saveArticleToMarkdown(article) {
  if (!article || typeof article !== "object") {
    throw new Error("Article object is required.");
  }

  const validation = validateArticle(article);

  if (!validation.valid) {
    throw new Error(
      `Article validation failed: ${validation.errors.join(" | ")}`
    );
  }

  const language = normalizeLanguage(article.language);

  const markdown = articleToMarkdown({
    ...article,
    language,
  });

  if (!markdown || !markdown.trim()) {
    throw new Error("Generated Markdown is empty.");
  }

  const filePath = getAbsoluteArticlePath({
    ...article,
    language,
  });

  const fileName = path.basename(filePath);

  validateFileName(fileName);

  await ensureArticleDoesNotExist(filePath);

  await fs.mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await fs.writeFile(filePath, markdown, {
    encoding: "utf8",
    flag: "wx",
  });

  return {
    success: true,
    language,
    fileName,
    filePath,
    markdown,
    wordCount: article.wordCount,
    slug: article.slug,
  };
}

/**
 * التحقق فقط من إمكانية حفظ المقال
 * بدون إنشاء الملف.
 */
export async function canSaveArticleToMarkdown(article) {
  if (!article || typeof article !== "object") {
    return {
      valid: false,
      errors: ["Article object is required."],
    };
  }

  try {
    const validation = validateArticle(article);

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
      };
    }

    const language = normalizeLanguage(article.language);

    const filePath = getAbsoluteArticlePath({
      ...article,
      language,
    });

    try {
      await fs.access(filePath);

      return {
        valid: false,
        errors: ["An article with this slug already exists."],
        filePath,
      };
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    return {
      valid: true,
      errors: [],
      filePath,
      language,
      slug: article.slug,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error.message || "Unable to validate article file."],
    };
  }
}

/**
 * قراءة مقال Markdown محفوظ.
 */
export async function readSavedMarkdownArticle(article) {
  if (!article || typeof article !== "object") {
    throw new Error("Article object is required.");
  }

  const language = normalizeLanguage(article.language);

  const filePath = getAbsoluteArticlePath({
    ...article,
    language,
  });

  return fs.readFile(filePath, "utf8");
}

/**
 * حذف مقال Markdown محفوظ.
 *
 * لن نستخدم هذه الدالة في النشر التلقائي حاليًا،
 * لكنها مفيدة أثناء الاختبار والتطوير.
 */
export async function deleteSavedMarkdownArticle(article) {
  if (!article || typeof article !== "object") {
    throw new Error("Article object is required.");
  }

  const language = normalizeLanguage(article.language);

  const filePath = getAbsoluteArticlePath({
    ...article,
    language,
  });

  await fs.unlink(filePath);

  return {
    success: true,
    filePath,
    slug: article.slug,
    language,
  };
}

/**
 * معلومات إعداد الكاتب.
 */
export function getMarkdownWriterConfig() {
  return {
    directory: getContentBlogDirectory(),
    languages: ["ar", "en"],
    extension: ".md",
    overwriteExisting: false,
    storage: "github-markdown",
  };
}
