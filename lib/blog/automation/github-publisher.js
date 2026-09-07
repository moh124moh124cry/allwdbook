const GITHUB_API_BASE = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "moh124moh124cry";
  const repo = process.env.GITHUB_REPO || "allwdbook";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }

  return {
    token,
    owner,
    repo,
    branch,
  };
}

function normalizeLanguage(language) {
  const value = String(language || "en").toLowerCase();

  if (value !== "ar" && value !== "en") {
    throw new Error(
      `Unsupported language "${language}". Expected "ar" or "en".`
    );
  }

  return value;
}

function normalizeSlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Article slug is required.");
  }

  const value = slug.trim();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value)) {
    throw new Error(
      "Invalid slug. Only letters, numbers and hyphens are allowed."
    );
  }

  return value;
}

function getArticlePath(article) {
  const language = normalizeLanguage(article.language);
  const slug = normalizeSlug(article.slug);

  return `content/blog/${language}/${slug}.md`;
}

function encodeBase64(text) {
  return Buffer.from(text, "utf8").toString("base64");
}

function decodeBase64(content) {
  return Buffer.from(content, "base64").toString("utf8");
}

async function githubRequest(endpoint, options = {}) {
  const config = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      `GitHub API request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

/**
 * الحصول على معلومات الملف من GitHub.
 *
 * إذا كان الملف غير موجود يرجع null.
 */
export async function getGitHubArticleFile(article) {
  const config = getConfig();
  const filePath = getArticlePath(article);

  try {
    return await githubRequest(
      `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
        config.repo
      )}/contents/${filePath}?ref=${encodeURIComponent(config.branch)}`
    );
  } catch (error) {
    if (
      error.message &&
      error.message.toLowerCase().includes("not found")
    ) {
      return null;
    }

    throw error;
  }
}

/**
 * التأكد من عدم وجود المقال مسبقًا.
 */
export async function articleExistsOnGitHub(article) {
  const file = await getGitHubArticleFile(article);

  return Boolean(file);
}

/**
 * نشر مقال جديد إلى GitHub.
 *
 * لا يقوم باستبدال مقال موجود.
 */
export async function publishArticleToGitHub(article) {
  if (!article || typeof article !== "object") {
    throw new Error("Article object is required.");
  }

  if (!article.content || !article.slug || !article.language) {
    throw new Error(
      "Article must contain language, slug and content."
    );
  }

  const config = getConfig();
  const filePath = getArticlePath(article);

  const existingFile = await getGitHubArticleFile(article);

  if (existingFile) {
    throw new Error(
      `Article already exists on GitHub: ${filePath}`
    );
  }

  const markdown =
    typeof article.markdown === "string"
      ? article.markdown
      : article.content;

  if (!markdown.trim()) {
    throw new Error("Article Markdown content is empty.");
  }

  const message =
    article.commitMessage ||
    `Add blog article: ${article.slug}`;

  const result = await githubRequest(
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repo
    )}/contents/${filePath}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: encodeBase64(markdown),
        branch: config.branch,
      }),
    }
  );

  return {
    success: true,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    path: filePath,
    sha: result?.content?.sha || null,
    commitSha: result?.commit?.sha || null,
    htmlUrl: result?.content?.html_url || null,
  };
}

/**
 * تحديث مقال موجود في GitHub.
 *
 * هذه الدالة منفصلة عن النشر الجديد لتجنب
 * تعديل المقالات الموجودة بالخطأ.
 */
export async function updateArticleOnGitHub(article) {
  if (!article || typeof article !== "object") {
    throw new Error("Article object is required.");
  }

  const config = getConfig();
  const filePath = getArticlePath(article);

  const existingFile = await getGitHubArticleFile(article);

  if (!existingFile) {
    throw new Error(
      `Article does not exist on GitHub: ${filePath}`
    );
  }

  const markdown =
    typeof article.markdown === "string"
      ? article.markdown
      : article.content;

  if (!markdown || !markdown.trim()) {
    throw new Error("Article Markdown content is empty.");
  }

  const message =
    article.commitMessage ||
    `Update blog article: ${article.slug}`;

  const result = await githubRequest(
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repo
    )}/contents/${filePath}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: encodeBase64(markdown),
        branch: config.branch,
        sha: existingFile.sha,
      }),
    }
  );

  return {
    success: true,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    path: filePath,
    sha: result?.content?.sha || null,
    commitSha: result?.commit?.sha || null,
    htmlUrl: result?.content?.html_url || null,
  };
}

/**
 * حذف مقال من GitHub.
 *
 * هذه الدالة موجودة للإدارة المستقبلية فقط.
 */
export async function deleteArticleFromGitHub(article) {
  if (!article || typeof article !== "object") {
    throw new Error("Article object is required.");
  }

  const config = getConfig();
  const filePath = getArticlePath(article);

  const existingFile = await getGitHubArticleFile(article);

  if (!existingFile) {
    return {
      success: false,
      reason: "not-found",
      path: filePath,
    };
  }

  const message =
    article.commitMessage ||
    `Delete blog article: ${article.slug}`;

  const result = await githubRequest(
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repo
    )}/contents/${filePath}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        message,
        sha: existingFile.sha,
        branch: config.branch,
      }),
    }
  );

  return {
    success: true,
    path: filePath,
    commitSha: result?.commit?.sha || null,
  };
}

/**
 * قراءة محتوى مقال من GitHub.
 */
export async function readArticleFromGitHub(article) {
  const file = await getGitHubArticleFile(article);

  if (!file) {
    return null;
  }

  if (!file.content) {
    throw new Error(
      "GitHub returned the file without content."
    );
  }

  return {
    path: file.path,
    sha: file.sha,
    content: decodeBase64(
      file.content.replace(/\n/g, "")
    ),
    htmlUrl: file.html_url || null,
  };
}

/**
 * فحص إعدادات GitHub Publisher.
 */
export function getGitHubPublisherConfig() {
  return {
    configured: Boolean(process.env.GITHUB_TOKEN),
    owner:
      process.env.GITHUB_OWNER ||
      "moh124moh124cry",
    repo:
      process.env.GITHUB_REPO ||
      "allwdbook",
    branch:
      process.env.GITHUB_BRANCH ||
      "main",
    apiBase: GITHUB_API_BASE,
  };
}
