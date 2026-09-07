/**
 * AllWDbook Blog Automation
 * Article Quality Validator
 *
 * هذا الملف لا ينشر أي مقال.
 * وظيفته فقط فحص المقال قبل السماح للنظام بنشره.
 */

const MIN_WORD_COUNT = 1200;

/**
 * تنظيف النص من Markdown
 */
function cleanMarkdown(text = "") {
  return String(text)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * حساب عدد الكلمات.
 *
 * يدعم العربية والإنجليزية بشكل بسيط
 * باستخدام تقسيم المسافات.
 */
export function countArticleWords(content = "") {
  const cleanText = cleanMarkdown(content);

  if (!cleanText) {
    return 0;
  }

  return cleanText
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

/**
 * استخراج عناوين Markdown
 */
function getHeadings(content = "") {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line));
}

/**
 * التحقق من بنية المقال
 */
function validateStructure(article) {
  const errors = [];
  const warnings = [];

  const content = article.content || "";

  const headings = getHeadings(content);

  if (headings.length < 3) {
    errors.push(
      "Article must contain at least 3 Markdown headings."
    );
  }

  if (!/^#\s+.+/m.test(content)) {
    warnings.push(
      "Article does not contain a main H1 heading."
    );
  }

  if (!/##\s+.+/m.test(content)) {
    errors.push(
      "Article must contain at least one H2 heading."
    );
  }

  return {
    errors,
    warnings,
  };
}

/**
 * التحقق من البيانات الأساسية
 */
function validateMetadata(article) {
  const errors = [];
  const warnings = [];

  if (!article.title || String(article.title).trim().length < 10) {
    errors.push("Article title is missing or too short.");
  }

  if (
    !article.description ||
    String(article.description).trim().length < 50
  ) {
    errors.push(
      "Article description must contain at least 50 characters."
    );
  }

  if (!article.slug) {
    errors.push("Article slug is missing.");
  }

  if (!article.language) {
    errors.push("Article language is missing.");
  }

  if (!["ar", "en"].includes(article.language)) {
    errors.push(
      "Article language must be either 'ar' or 'en'."
    );
  }

  if (!article.category) {
    warnings.push("Article category is missing.");
  }

  return {
    errors,
    warnings,
  };
}

/**
 * التحقق من ارتباط المقال بـ AllWDbook
 *
 * المقالات الآلية يجب أن تكون مرتبطة بالمشروع
 * أو بأحد أدواته.
 */
function validateAllWDbookRelevance(article) {
  const errors = [];

  const content = `${article.title || ""} ${
    article.description || ""
  } ${article.content || ""}`.toLowerCase();

  const relevantTerms = [
    "allwdbook",
    "kdp",
    "kindle direct publishing",
    "keyword research",
    "micro niche",
    "book cover",
    "book description",
    "royalty",
    "self publishing",
    "self-publishing",
    "amazon kdp",
  ];

  const isRelevant = relevantTerms.some((term) =>
    content.includes(term)
  );

  if (!isRelevant) {
    errors.push(
      "Article does not appear to be relevant to AllWDbook or KDP."
    );
  }

  return errors;
}

/**
 * التحقق من الروابط الداخلية
 */
function validateInternalLinks(article) {
  const warnings = [];

  const content = article.content || "";

  const hasInternalLink =
    content.includes("allwdbook.com") ||
    content.includes("tool=keywords") ||
    content.includes("tool=micro-niche") ||
    content.includes("/blog/");

  if (!hasInternalLink) {
    warnings.push(
      "Article does not contain an internal AllWDbook link."
    );
  }

  return warnings;
}

/**
 * التحقق النهائي من المقال
 */
export function validateArticle(article) {
  const errors = [];
  const warnings = [];

  if (!article) {
    return {
      valid: false,
      errors: ["Article object is missing."],
      warnings: [],
      wordCount: 0,
    };
  }

  const content = article.content || "";

  const wordCount = countArticleWords(content);

  /**
   * الحد الأدنى الإجباري:
   * 1200 كلمة
   */
  if (wordCount < MIN_WORD_COUNT) {
    errors.push(
      `Article contains ${wordCount} words. Minimum required is ${MIN_WORD_COUNT} words.`
    );
  }

  const metadataResult = validateMetadata(article);

  errors.push(...metadataResult.errors);
  warnings.push(...metadataResult.warnings);

  const structureResult = validateStructure(article);

  errors.push(...structureResult.errors);
  warnings.push(...structureResult.warnings);

  errors.push(
    ...validateAllWDbookRelevance(article)
  );

  warnings.push(
    ...validateInternalLinks(article)
  );

  /**
   * منع المقالات القصيرة جدًا حتى لو تم تمرير
   * البيانات الأخرى.
   */
  const valid =
    errors.length === 0 &&
    wordCount >= MIN_WORD_COUNT;

  return {
    valid,
    errors,
    warnings,
    wordCount,
    minimumWordCount: MIN_WORD_COUNT,
  };
}

/**
 * دالة مختصرة تستخدمها خدمة النشر الآلي.
 */
export function isArticleValid(article) {
  return validateArticle(article).valid;
}

/**
 * تصدير الحد الأدنى للاستخدام في ملفات أخرى.
 */
export { MIN_WORD_COUNT };
