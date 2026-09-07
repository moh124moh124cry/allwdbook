// components/blog/BlogArticleShell.js

import Link from "next/link";

import {
  getAbsoluteBlogUrl,
  getBlogArticleUrl,
  getLocalizedBlogCategory,
} from "../../lib/blog";

import {
  getBlogArticleBySlug,
} from "../../lib/blog/articles";

export default function BlogArticleShell({
  article,
  lang = "ar",
}) {
  const isArabic = lang === "ar";

  if (!article || !article.meta || !article.content) {
    return null;
  }

  const category = getLocalizedBlogCategory(
    article.category,
    lang
  );

  const alternateLang = isArabic ? "en" : "ar";
  const alternateLabel = isArabic ? "English" : "العربية";

  const articlePath = getBlogArticleUrl(
    lang,
    article.slug
  );

  const articleUrl = getAbsoluteBlogUrl(
    articlePath
  );

  const heroImageUrl = article.heroImage
    ? getAbsoluteBlogUrl(article.heroImage)
    : null;

  const sections = Array.isArray(
    article.content.sections
  )
    ? article.content.sections
    : [];

  const relatedArticles = (
    article.content.relatedSlugs || []
  )
    .map((slug) =>
      getBlogArticleBySlug(slug)
    )
    .filter(
      (relatedArticle) =>
        relatedArticle &&
        relatedArticle.published
    );

  const publishedDate = article.publishDate
    ? new Intl.DateTimeFormat(
        isArabic ? "ar-DZ" : "en-US",
        {
          dateStyle: "long",
        }
      ).format(new Date(article.publishDate))
    : null;

  /*
   * Structured data for SEO
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",

    headline: article.meta.title,

    description:
      article.meta.description,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    url: articleUrl,

    inLanguage: isArabic
      ? "ar"
      : "en",

    ...(category?.name
      ? {
          articleSection:
            category.name,
        }
      : {}),

    ...(article.publishDate
      ? {
          datePublished:
            article.publishDate,

          dateModified:
            article.publishDate,
        }
      : {}),

    ...(heroImageUrl
      ? {
          image: [heroImageUrl],
        }
      : {}),

    author: {
      "@type": "Organization",

      name: "AllWDbook",

      url:
        "https://www.allwdbook.com",
    },

    publisher: {
      "@type": "Organization",

      name: "AllWDbook",

      url:
        "https://www.allwdbook.com",

      logo: {
        "@type": "ImageObject",

        url:
          "https://www.allwdbook.com/logov3.png",
      },
    },
  };

  /*
   * Introduction
   */
  const introParagraphs = String(
    article.content.intro || ""
  )
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph.trim()
    )
    .filter(Boolean);

  /*
   * Inline media
   */
  const mediaItems = Array.isArray(
    article.content.media
  )
    ? article.content.media
    : [];

  function renderMedia(sectionId) {
    const sectionMedia =
      mediaItems.filter(
        (item) =>
          item.afterSection ===
          sectionId
      );

    if (
      sectionMedia.length === 0
    ) {
      return null;
    }

    return sectionMedia.map(
      (item) => {
        if (
          item.type !== "image"
        ) {
          return null;
        }

        return (
          <figure
            key={item.id}
            className="blogInlineMedia"
          >
            <img
              src={item.src}
              alt={
                item.alt || ""
              }
              loading="lazy"
            />

            {item.caption && (
              <figcaption>
                {item.caption}
              </figcaption>
            )}
          </figure>
        );
      }
    );
  }

  return (
    <article
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
      className="blogArticleShell"
    >

      {/* =========================
          SEO STRUCTURED DATA
      ========================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              schema
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      {/* =========================
          ARTICLE HEADER
      ========================== */}

      <header className="blogArticleHeader">

        <div className="blogTopBar">

          <Link
            href="/"
            aria-label="AllWDbook"
          >
            <img
              src="/logov3.png"
              alt="AllWDbook"
              className="blogLogo"
            />
          </Link>

          <Link
            href={getBlogArticleUrl(
              alternateLang,
              article.slug
            )}
            className="blogLanguageLink"
          >
            {alternateLabel}
          </Link>

        </div>

        <Link
          href={getBlogArticleUrl(
            lang,
            ""
          )}
          className="blogBackLink"
        >
          {isArabic
            ? "← العودة إلى المدونة"
            : "← Back to blog"}
        </Link>

        {category && (
          <p className="blogCategory">

            <span>
              {category.icon}
            </span>

            {" "}

            {category.name}

          </p>
        )}

        {article.series && (
          <p className="blogSeries">
            {article.series}
          </p>
        )}

        <h1>
          {article.meta.title}
        </h1>

        <p className="blogDescription">
          {
            article.meta
              .description
          }
        </p>

        <div className="blogMeta">

          <span className="blogReadingTime">

            {isArabic
              ? "وقت القراءة"
              : "Reading time"}

            :

            {" "}

            {isArabic
              ? `${article.readingTime.ar} دقائق`
              : `${article.readingTime.en} min`}

          </span>

          {publishedDate && (
            <span className="blogPublishDate">
              {publishedDate}
            </span>
          )}

        </div>

      </header>

      {/* =========================
          HERO IMAGE
      ========================== */}

      {article.heroImage && (
        <figure className="blogHero">

          <img
            src={article.heroImage}
            alt={
              article.meta.title
            }
          />

        </figure>
      )}

      {/* =========================
          ARTICLE LAYOUT
      ========================== */}

      <div className="blogArticleLayout">

        {/* =========================
            TABLE OF CONTENTS
        ========================== */}

        <aside
          className="blogArticleToc"
          aria-label={
            isArabic
              ? "محتويات المقال"
              : "Article contents"
          }
        >

          <div className="blogTocInner">

            <p className="blogTocLabel">

              {isArabic
                ? "في هذا المقال"
                : "In this article"}

            </p>

            <ol>

              {sections.map(
                (section) => (
                  <li
                    key={
                      section.id
                    }
                  >

                    <a
                      href={`#${section.id}`}
                    >
                      {
                        section.heading
                      }
                    </a>

                  </li>
                )
              )}

            </ol>

          </div>

        </aside>

        {/* =========================
            MAIN ARTICLE
        ========================== */}

        <div className="blogArticleMain">

          {/* INTRO */}

          {introParagraphs.length >
            0 && (

            <section className="blogIntro">

              {introParagraphs.map(
                (
                  paragraph,
                  index
                ) => (
                  <p
                    key={
                      index
                    }
                  >
                    {paragraph}
                  </p>
                )
              )}

            </section>

          )}

          {/* =========================
              ARTICLE SECTIONS
          ========================== */}

          <section className="blogSections">

            {sections.map(
              (
                section,
                index
              ) => (

                <div
                  key={
                    section.id
                  }
                  className="blogSectionGroup"
                >

                  <section
                    id={
                      section.id
                    }
                    className="blogSection"
                  >

                    <span className="blogSectionNumber">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </span>

                    <h2>
                      {
                        section.heading
                      }
                    </h2>

                    {section.paragraphs?.map(
                      (
                        paragraph,
                        paragraphIndex
                      ) => (

                        <p
                          key={
                            paragraphIndex
                          }
                        >
                          {
                            paragraph
                          }
                        </p>

                      )
                    )}

                  </section>

                  {renderMedia(
                    section.id
                  )}

                </div>

              )
            )}

          </section>

          {/* =========================
              KEY TAKEAWAYS
          ========================== */}

          {article.content
            .takeaways
            ?.length >
            0 && (

            <aside className="blogTakeaways">

              <p className="blogCardEyebrow">

                {isArabic
                  ? "الخلاصة"
                  : "Key takeaways"}

              </p>

              <h2>

                {isArabic
                  ? "أهم النقاط التي تستحق التذكر"
                  : "The key points to remember"}

              </h2>

              <ul>

                {article.content.takeaways.map(
                  (
                    item,
                    index
                  ) => (

                    <li
                      key={
                        index
                      }
                    >
                      {item}
                    </li>

                  )
                )}

              </ul>

            </aside>

          )}

          {/* =========================
              TOOL CTA
          ========================== */}

          {article.toolPath && (

            <aside className="blogToolCallout">

              <p className="blogCardEyebrow">
                AllWDbook
              </p>

              <h2>

                {isArabic
                  ? "حوّل المعرفة إلى نتيجة"
                  : "Turn the knowledge into action"}

              </h2>

              <p>

                {isArabic
                  ? "جرّب الأداة المرتبطة بهذا المقال وابدأ مباشرة."
                  : "Use the related AllWDbook tool and put this guide into practice."}

              </p>

              <Link
                href={
                  article.toolPath
                }
                className="blogToolLink"
              >

                {isArabic
                  ? "فتح الأداة"
                  : "Open the tool"}

              </Link>

            </aside>

          )}

        </div>

      </div>

      {/* =========================
          RELATED ARTICLES
      ========================== */}

      {relatedArticles.length >
        0 && (

        <footer className="blogRelated">

          <div className="blogRelatedHeader">

            <div>

              <p className="blogCardEyebrow">

                {isArabic
                  ? "واصل القراءة"
                  : "Keep reading"}

              </p>

              <h2>

                {isArabic
                  ? "مقالات مرتبطة"
                  : "Related articles"}

              </h2>

            </div>

          </div>

          <div className="blogRelatedGrid">

            {relatedArticles.map(
              (
                relatedArticle
              ) => (

                <Link
                  key={
                    relatedArticle.id
                  }
                  href={getBlogArticleUrl(
                    lang,
                    relatedArticle.slug
                  )}
                  className="blogRelatedCard"
                >

                  <span className="blogRelatedCategory">

                    {
                      getLocalizedBlogCategory(
                        relatedArticle.category,
                        lang
                      )?.name ||
                      "AllWDbook"
                    }

                  </span>

                  <h3>

                    {
                      relatedArticle[
                        isArabic
                          ? "ar"
                          : "en"
                      ].title
                    }

                  </h3>

                  <span className="blogRelatedArrow">

                    {isArabic
                      ? "اقرأ المقال ←"
                      : "Read article →"}

                  </span>

                </Link>

              )
            )}

          </div>

          <div className="blogArticleFooter">

            <Link
              href={getBlogArticleUrl(
                lang,
                ""
              )}
              className="blogBackToBlog"
            >

              {isArabic
                ? "استكشف جميع المقالات"
                : "Explore all articles"}

            </Link>

          </div>

        </footer>

      )}

    </article>
  );
}
