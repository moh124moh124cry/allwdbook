const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL =
  process.env.GROQ_BLOG_MODEL || "llama-3.3-70b-versatile";

const MIN_WORD_COUNT = 1200;

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return apiKey;
}

function extractText(data) {
  if (!data) {
    return "";
  }

  const content =
    data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  return "";
}

function cleanMarkdown(text) {
  return String(text || "")
    .replace(/^```markdown\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function countWords(text) {
  return String(text || "")
    .replace(/[#*_`~>\[\]()-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function buildSystemPrompt() {
  return `
You are the professional AI content writer for AllWDbook.

AllWDbook is a website focused on:
- Amazon KDP
- Kindle Direct Publishing
- KDP keyword research
- KDP micro-niche research
- Book cover design
- Book descriptions
- KDP royalty calculations
- Self-publishing
- Digital publishing
- AI tools for authors and publishers

Your job is to write high-quality, useful and original blog articles that are directly relevant to AllWDbook and its KDP audience.

STRICT REQUIREMENTS:

1. Write at least 1200 words.
2. Prefer approximately 1500-2000 words.
3. Use clear Markdown.
4. Start with one H1 title.
5. Use H2 and H3 headings where appropriate.
6. Give practical and actionable information.
7. Explain concepts clearly for beginners while remaining useful for experienced authors.
8. Include examples when they improve understanding.
9. Do not invent statistics.
10. Do not invent quotes.
11. Do not invent Amazon policies.
12. Do not make unrealistic income or ranking guarantees.
13. Do not claim that a strategy guarantees sales, rankings or profits.
14. Keep the article strongly related to Amazon KDP and AllWDbook.
15. Mention AllWDbook naturally when relevant.
16. Use internal links only when a valid internal path is provided in the topic information.
17. Never invent external URLs.
18. Avoid keyword stuffing.
19. Make the article natural and readable.
20. Do not include a bibliography unless sources are explicitly provided.
21. Do not include comments about being an AI.
22. Return ONLY the finished Markdown article.
23. Do not wrap the entire response inside a code block.
`.trim();
}

function buildUserPrompt({
  topic,
  language,
  historyContext,
}) {
  const languageInstruction =
    language === "ar"
      ? "Write the entire article in Modern Standard Arabic. Keep technical terms such as Amazon KDP, keywords, micro niche and SEO understandable."
      : "Write the entire article in professional English.";

  return `
Create a new AllWDbook blog article.

LANGUAGE:
${languageInstruction}

TOPIC:
${topic?.title || ""}

TOPIC DESCRIPTION:
${topic?.description || ""}

CATEGORY:
${topic?.category || ""}

KEYWORDS:
${Array.isArray(topic?.keywords)
    ? topic.keywords.join(", ")
    : ""}

ALLWDbook TOOL PATH:
${topic?.toolPath || ""}

PREVIOUS ARTICLE HISTORY:
${historyContext || "No previous article history was provided."}

IMPORTANT:
- Do not copy or closely imitate previous articles.
- Create a distinct title.
- Avoid repeating the same angle as previous articles.
- The article must be at least ${MIN_WORD_COUNT} words.
- Make the content genuinely useful to an AllWDbook visitor.
- Include practical steps where appropriate.
- If the topic concerns a specific AllWDbook tool, explain how that type of tool can help without inventing features that were not provided.
- Do not invent URLs.
- Do not invent product statistics or Amazon policies.

Return only the final Markdown article.
`.trim();
}

async function callGroq({
  systemPrompt,
  userPrompt,
  model = DEFAULT_MODEL,
}) {
  const apiKey = getGroqApiKey();

  const response = await fetch(GROQ_API_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model,

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],

      temperature: 0.7,

      max_tokens: 7000,

      stream: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `Groq API request failed with status ${response.status}.`;

    throw new Error(message);
  }

  const text = extractText(data);

  if (!text) {
    throw new Error(
      "Groq returned an empty article."
    );
  }

  return text;
}

export async function generateBlogArticle({
  topic,
  language = "en",
  historyContext = "",
  model = DEFAULT_MODEL,
}) {
  if (!topic) {
    throw new Error("A blog topic is required.");
  }

  const normalizedLanguage =
    language === "ar" ? "ar" : "en";

  const systemPrompt =
    buildSystemPrompt();

  const userPrompt =
    buildUserPrompt({
      topic,
      language: normalizedLanguage,
      historyContext,
    });

  const rawArticle =
    await callGroq({
      systemPrompt,
      userPrompt,
      model,
    });

  const article =
    cleanMarkdown(rawArticle);

  const wordCount =
    countWords(article);

  if (wordCount < MIN_WORD_COUNT) {
    throw new Error(
      `Generated article contains ${wordCount} words. Minimum required is ${MIN_WORD_COUNT}.`
    );
  }

  return {
    content: article,
    wordCount,
    model,
    provider: "groq",
    language: normalizedLanguage,
  };
}

export function getGeneratorConfig() {
  return {
    provider: "groq",

    api: GROQ_API_URL,

    model: DEFAULT_MODEL,

    minimumWordCount: MIN_WORD_COUNT,

    configured:
      Boolean(process.env.GROQ_API_KEY),
  };
}

export { MIN_WORD_COUNT };
