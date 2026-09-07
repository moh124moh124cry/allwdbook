/**
 * AllWDbook Blog Automation
 *
 * مسؤول عن توليد مسودة مقال باستخدام OpenAI.
 *
 * مهم:
 * - لا يقوم هذا الملف بالنشر.
 * - لا يكتب مباشرة إلى GitHub.
 * - لا يضع مفتاح API داخل الكود.
 *
 * المتغير المطلوب في Vercel:
 *
 * OPENAI_API_KEY
 *
 * والمتغير الاختياري:
 *
 * OPENAI_BLOG_MODEL
 *
 * القيمة الافتراضية:
 *
 * gpt-5.6-luna
 */

const OPENAI_API_URL =
  "https://api.openai.com/v1/responses";

const DEFAULT_MODEL =
  process.env.OPENAI_BLOG_MODEL ||
  "gpt-5.6-luna";

const MIN_WORDS = 1200;

/**
 * التأكد من وجود مفتاح OpenAI.
 */
function getApiKey() {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured."
    );
  }

  return apiKey;
}

/**
 * تنظيف النص الناتج.
 */
function cleanGeneratedText(text = "") {
  return String(text)
    .replace(/^```markdown\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * حساب الكلمات.
 */
function countWords(text = "") {
  return String(text)
    .replace(/[#>*_~`[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

/**
 * إنشاء تعليمات المقال.
 */
function buildPrompt({
  topic,
  keywords = [],
  language = "en",
  category = "kdp",
  historyContext = "",
}) {
  const languageName =
    language === "ar"
      ? "Arabic"
      : "English";

  const keywordList =
    keywords.length > 0
      ? keywords.join(", ")
      : "Use relevant KDP terminology naturally.";

  return `
You are the senior editorial writer for AllWDbook.

AllWDbook is a KDP Tools & Digital Publishing platform.

Your task is to write one original, useful, long-form blog article.

ARTICLE LANGUAGE:
${languageName}

MAIN TOPIC:
${topic}

CATEGORY:
${category}

TARGET KEYWORDS:
${keywordList}

IMPORTANT REQUIREMENTS:

1. Write at least ${MIN_WORDS} words.
2. Prefer approximately 1500–2000 words when the topic supports it.
3. The article must be genuinely useful to KDP authors.
4. Keep the article directly relevant to AllWDbook and KDP Tools & Digital Publishing.
5. Do not write generic filler just to increase word count.
6. Do not repeat the same idea in different paragraphs.
7. Use clear Markdown headings.
8. Start with one H1 heading.
9. Use multiple H2 sections.
10. Use H3 headings when useful.
11. Include practical examples.
12. Include actionable advice.
13. Explain technical terms when necessary.
14. Do not make unsupported claims.
15. Do not invent statistics, studies, quotes, or official Amazon policies.
16. If a fact may change over time, clearly avoid presenting an uncertain number as permanent fact.
17. Do not claim that AllWDbook guarantees sales, rankings, income, or publishing success.
18. Mention AllWDbook naturally rather than turning the article into an advertisement.
19. Include relevant internal links when appropriate.
20. Use Markdown links.
21. Do not include HTML.
22. Do not include a Sources section unless actual sources are supplied.
23. Do not fabricate URLs.
24. Do not use excessive keyword repetition.
25. Do not write a conclusion that merely repeats the introduction.

INTERNAL ALLWDBOOK CONTEXT:

Useful tools include:

- Keyword Research:
  /?tool=keywords

- Micro-Niche Research:
  /?tool=micro-niche

- Book Cover Designer:
  /?tool=cover

- Book Description:
  /?tool=description

- Royalty Calculator:
  /?tool=royalty

When relevant, naturally link to these tools.

PREVIOUS ARTICLES:

The following titles already exist.
Do NOT create an article that is substantially the same as one of them.

${historyContext || "No previous article titles are available."}

OUTPUT FORMAT:

Return ONLY the complete Markdown article.

The first line must be an H1 title.

Do not add:
- editorial notes
- explanations about being an AI
- JSON
- code fences
- word-count comments
- comments to the website owner

Write the article now.
`;
}

/**
 * استخراج النص من Responses API.
 *
 * نحاول أولًا استخدام output_text،
 * ثم نستخدم fallback أكثر مرونة.
 */
function extractResponseText(data) {
  if (
    data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text.trim();
  }

  if (
    data &&
    Array.isArray(data.output)
  ) {
    const parts = [];

    for (const item of data.output) {
      if (
        !item ||
        !Array.isArray(item.content)
      ) {
        continue;
      }

      for (const content of item.content) {
        if (
          content &&
          typeof content.text === "string"
        ) {
          parts.push(content.text);
        }
      }
    }

    return parts.join("\n").trim();
  }

  return "";
}

/**
 * استدعاء OpenAI.
 */
export async function generateBlogArticle({
  topic,
  keywords = [],
  language = "en",
  category = "kdp",
  historyContext = "",
}) {
  if (!topic) {
    throw new Error(
      "Blog topic is required."
    );
  }

  const apiKey = getApiKey();

  const prompt = buildPrompt({
    topic,
    keywords,
    language,
    category,
    historyContext,
  });

  const response = await fetch(
    OPENAI_API_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model: DEFAULT_MODEL,

        input: prompt,

        max_output_tokens: 7000,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `OpenAI request failed with status ${response.status}.`;

    throw new Error(message);
  }

  const content =
    cleanGeneratedText(
      extractResponseText(data)
    );

  if (!content) {
    throw new Error(
      "OpenAI returned an empty article."
    );
  }

  const wordCount =
    countWords(content);

  if (wordCount < MIN_WORDS) {
    throw new Error(
      `Generated article contains only ${wordCount} words. Minimum required is ${MIN_WORDS}.`
    );
  }

  return {
    content,

    wordCount,

    model: DEFAULT_MODEL,

    language,

    category,

    topic,

    generatedAt:
      new Date().toISOString(),
  };
}

/**
 * إرجاع إعدادات النظام.
 *
 * مفيد للوحة الإدارة لاحقًا.
 */
export function getGeneratorConfig() {
  return {
    model: DEFAULT_MODEL,

    minimumWords: MIN_WORDS,

    apiConfigured:
      Boolean(
        process.env.OPENAI_API_KEY
      ),
  };
}
