// components/blog/BlogCategoryPage.js

import Link from "next/link";

import {
  getAllBlogArticles,
  getPublishedBlogArticles,
  getBlogArticlesByCategory,
} from "../../lib/blog/articles";

import {
  hasBlogContent,
} from "../../lib/blog/content";

import {
  BLOG_CATEGORIES,
  getBlogArticleUrl,
  getBlogHomeUrl,
  getBlogCategoryUrl,
  getLocalizedBlogCategory,
  getBlogDirection,
  normalizeBlogLang,
  getBlogCategory,
} from "../../lib/blog";

const COPY = {
  ar: {
    backToHome: "العودة للمدونة",
    readArticle: "اقرأ المقال",
    readingTime: "دقائق قراءة",
    published: "منشورة",
    upcoming: "قادمة",
    noArticles: "لا توجد مقالات في هذا القسم حاليًا",
    otherCategories: "أقسام أخرى",
    footer: "جميع الحقوق محفوظة.",
  },
  en: {
    backToHome: "Back to Blog",
    readArticle: "Read Article",
    readingTime: "min read",
    published: "published",
    upcoming: "upcoming",
    noArticles: "No articles in this category yet",
    otherCategories: "Other sections",
    footer: "All rights reserved.",
  },
};

function CategoryIcon({ id, className = "" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  if (id === "allwdbook") {
    return (
      <svg {...common}>
        <path d="M5 18c3-1 5-3 6-6l2-5 4-2 2 4-2 5c-1 3-3 5-6 6l-3 1 1-3-4 0Z" />
        <path d="m14 8 2 2" />
        <path d="M8 15 5 12l-2 4 2 2" />
      </svg>
    );
  }

  if (id === "kdp") {
    return (
      <svg {...common}>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" />
      </svg>
    );
  }

  if (id === "seo") {
    return (
      <svg {...common}>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="m3 8 5-4 5 4 8-6" />
        <path d="M18 2h3v3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Z" />
      <path d="m4.5 6.5 7.5 4 7.5-4" />
      <path d="M12 10.5V22" />
    </svg>
  );
}

function formatDate(date, lang) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat(
      lang === "ar" ? "ar-DZ" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    ).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
}

export default function BlogCategoryPage({
  categorySlug,
  lang = "ar",
}) {
  const safeLang = normalizeBlogLang(lang);
  const isArabic = safeLang === "ar";
  const copy = COPY[safeLang];
  const direction = getBlogDirection(safeLang);
  const otherLang = isArabic ? "en" : "ar";

  const categoryData = getBlogCategory(categorySlug);

  if (!categoryData) {
    return (
      <main dir={direction} className="blogCategoryPage isNotFound">
        <div className="blogCategoryShell">
          <header className="blogCategoryHeader">
            <Link
              href={getBlogHomeUrl(safeLang)}
              className="blogCategoryBackLink"
            >
              ← {copy.backToHome}
            </Link>
            <h1>{isArabic ? "القسم غير موجود" : "Category Not Found"}</h1>
          </header>
        </div>
      </main>
    );
  }

  const category = getLocalizedBlogCategory(categoryData, safeLang);
  const publishedArticles = getPublishedBlogArticles()
    .filter(
      (article) =>
        article.category === categorySlug &&
        hasBlogContent(article.slug, safeLang)
    )
    .sort((a, b) =>
      String(b.publishDate || "").localeCompare(
        String(a.publishDate || "")
      )
    );

  const otherCategories = BLOG_CATEGORIES.filter(
    (cat) => cat.id !== categorySlug
  );

  return (
    <main dir={direction} className="blogCategoryPage">
      <div className="blogCategoryShell">
        <header className="blogCategoryHeader">
          <div className="blogCategoryHeaderTop">
            <Link
              href={getBlogHomeUrl(safeLang)}
              className="blogCategoryBackLink"
            >
              ← {copy.backToHome}
            </Link>
            <Link
              href={getBlogCategoryUrl(otherLang, categorySlug)}
              className="blogCategoryLanguageLink"
            >
              {otherLang === "ar" ? "العربية" : "English"}
            </Link>
          </div>

          <div className="blogCategoryIcon">
            <CategoryIcon id={categorySlug} />
          </div>

          <h1>{category.name}</h1>
          <p className="blogCategoryDescription">
            {category.description}
          </p>
        </header>

        <section className="blogCategoryArticles">
          {publishedArticles.length > 0 ? (
            <div className="blogCategoryArticlesList">
              {publishedArticles.map((article) => (
                <article
                  key={article.id}
                  className="blogCategoryArticleCard"
                >
                  <div className="blogCategoryArticleContent">
                    <h2>
                      <Link
                        href={getBlogArticleUrl(safeLang, article.slug)}
                      >
                        {article[safeLang]?.title ||
                          article[safeLang]?.shortTitle}
                      </Link>
                    </h2>

                    <p className="blogCategoryArticleDescription">
                      {article[safeLang]?.description}
                    </p>

                    <div className="blogCategoryArticleMeta">
                      {article.publishDate && (
                        <span className="blogCategoryArticleDate">
                          {formatDate(article.publishDate, safeLang)}
                        </span>
                      )}
                      <span className="blogCategoryArticleReadingTime">
                        {article.readingTime?.[safeLang]} {copy.readingTime}
                      </span>
                    </div>

                    <Link
                      href={getBlogArticleUrl(safeLang, article.slug)}
                      className="blogCategoryArticleLink"
                    >
                      {copy.readArticle}
                      <span aria-hidden="true">←</span>
                    </Link>
                  </div>

                  {article.heroImage && (
                    <div className="blogCategoryArticleImage">
                      <img
                        src={article.heroImage}
                        alt={article[safeLang]?.title}
                        loading="lazy"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="blogCategoryEmpty">
              <p>{copy.noArticles}</p>
            </div>
          )}
        </section>

        <section className="blogCategoryOthers">
          <h2>{copy.otherCategories}</h2>
          <div className="blogCategoryOthersList">
            {otherCategories.map((cat) => {
              const catLocalized = getLocalizedBlogCategory(cat, safeLang);
              const catArticleCount = getPublishedBlogArticles().filter(
                (article) =>
                  article.category === cat.id &&
                  hasBlogContent(article.slug, safeLang)
              ).length;

              return (
                <Link
                  href={getBlogCategoryUrl(safeLang, cat.id)}
                  key={cat.id}
                  className="blogCategoryOtherCard"
                >
                  <div className="blogCategoryOtherIcon">
                    <CategoryIcon id={cat.id} />
                  </div>
                  <div>
                    <h3>{catLocalized.shortName}</h3>
                    <p>{catArticleCount} {copy.published}</p>
                  </div>
                  <span className="blogCategoryOtherArrow">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="blogCategoryFooter">
          <p>© {new Date().getFullYear()} AllWDbook — {copy.footer}</p>
        </footer>
      </div>
    </main>
  );
}
