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
  lang = "en",
}) {
  if (!article) {
    return null;
  }

  const meta = article.meta || {};
  const content = article.content || {};

  const title = meta.title || article.title || "";
  const description =
    meta.description ||
    article.description ||
    "";

  const category =
    getLocalizedBlogCategory(
      meta.category || article.category || "",
      lang
    );

  const series =
    meta.series ||
    article.series ||
    "";

  const readingTime =
    meta.readingTime ||
    article.readingTime ||
    "";

  const publishedDate =
    meta.publishedAt ||
    meta.date ||
    article.publishedAt ||
    article.date ||
    "";

  const hero =
    meta.hero ||
    meta.image ||
    article.hero ||
    article.image ||
    "";

  const slug =
    meta.slug ||
    article.slug ||
    "";

  const alternateLang =
    lang === "ar" ? "en" : "ar";

  const articleUrl = getBlogArticleUrl(
    lang,
    slug
  );

  const heroUrl = hero
    ? getAbsoluteBlogUrl(hero)
    : null;

  const sections =
    Array.isArray(content.sections)
      ? content.sections
      : Array.isArray(article.sections)
        ? article.sections
        : [];

  const intro =
    Array.isArray(content.intro)
      ? content.intro
      : Array.isArray(article.intro)
        ? article.intro
        : [];

  const takeaways =
    Array.isArray(content.takeaways)
      ? content.takeaways
      : Array.isArray(article.takeaways)
        ? article.takeaways
        : [];

  const relatedArticles =
    Array.isArray(article.relatedArticles)
      ? article.relatedArticles
      : [];

  const tool =
    content.tool ||
    article.tool ||
    null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getAbsoluteBlogUrl(articleUrl),
    },
    ...(heroUrl
      ? {
          image: [heroUrl],
        }
      : {}),
    ...(publishedDate
      ? {
          datePublished: publishedDate,
        }
      : {}),
  };

  return (
    <div
      className="blogArticleShell"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* =====================================================
          FORCE ARTICLE START AT TOP
          ===================================================== */}

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              if (typeof window !== "undefined") {
                window.history.scrollRestoration = "manual";

                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "instant"
                });

                requestAnimationFrame(function () {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "instant"
                  });
                });
              }
            })();
          `,
        }}
      />

      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="blogArticleHeader">
        <div className="blogTopBar">
          <Link
            href={getBlogArticleUrl(
              lang,
              ""
            )}
            className="blogBackLink"
            scroll={true}
          >
            {lang === "ar"
              ? "← العودة إلى المدونة"
              : "← Back to Blog"}
          </Link>

          <Link
            href={getBlogArticleUrl(
              alternateLang,
              slug
            )}
            className="blogLanguageLink"
            scroll={true}
          >
            {lang === "ar"
              ? "English"
              : "العربية"}
          </Link>
        </div>

        {/* ===================================================
            BRAND
            =================================================== */}

        <div className="blogArticleBrand">
          <Link
            href={getBlogArticleUrl(
              lang,
              ""
            )}
            aria-label="ALLWDBOOK Blog"
          >
            <img
              src="/logov3.png"
              alt="ALLWDBOOK"
              className="blogLogo"
            />
          </Link>
        </div>

        {/* ===================================================
            ARTICLE HEADER
            =================================================== */}

        {category && (
          <div className="blogCategory">
            {category}
          </div>
        )}

        {series && (
          <p className="blogSeries">
            {series}
          </p>
        )}

        <h1>{title}</h1>

        {description && (
          <p className="blogDescription">
            {description}
          </p>
        )}

        <div className="blogMeta">
          {readingTime && (
            <p className="blogReadingTime">
              {readingTime}
            </p>
          )}

          {publishedDate && (
            <p className="blogPublishDate">
              {publishedDate}
            </p>
          )}
        </div>
      </header>

      {/* =====================================================
          HERO IMAGE
          ===================================================== */}

      {heroUrl && (
        <div className="blogHero">
          <img
            src={heroUrl}
            alt={title}
          />
        </div>
      )}

      {/* =====================================================
          ARTICLE LAYOUT
          ===================================================== */}

      <div className="blogArticleLayout">

        {/* ===================================================
            ARTICLE CONTENT
            =================================================== */}

        <main className="blogArticleMain">

          {/* INTRO */}

          {intro.length > 0 && (
            <section className="blogIntro">
              {intro.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </section>
          )}

          {/* SECTIONS */}

          {sections.length > 0 && (
            <div className="blogSections">
              {sections.map(
                (section, index) => {
                  const sectionTitle =
                    section?.title ||
                    section?.heading ||
                    "";

                  const paragraphs =
                    Array.isArray(
                      section?.paragraphs
                    )
                      ? section.paragraphs
                      : Array.isArray(
                            section?.content
                          )
                        ? section.content
                        : section?.content
                          ? [section.content]
                          : [];

                  const media =
                    section?.image ||
                    section?.media ||
                    null;

                  const sectionId =
                    `blog-section-${index + 1}`;

                  return (
                    <section
                      key={sectionId}
                      id={sectionId}
                      className="blogSectionGroup"
                    >
                      <article className="blogSection">

                        {sectionTitle && (
                          <h2>
                            <span className="blogSectionNumber">
                              {index + 1}
                            </span>

                            <span>
                              {sectionTitle}
                            </span>
                          </h2>
                        )}

                        {paragraphs.map(
                          (
                            paragraph,
                            paragraphIndex
                          ) => (
                            <p
                              key={
                                paragraphIndex
                              }
                            >
                              {paragraph}
                            </p>
                          )
                        )}

                        {media && (
                          <figure className="blogInlineMedia">
                            <img
                              src={getAbsoluteBlogUrl(
                                media
                              )}
                              alt={
                                sectionTitle ||
                                title
                              }
                            />
                          </figure>
                        )}

                      </article>
                    </section>
                  );
                }
              )}
            </div>
          )}

          {/* TAKEAWAYS */}

          {takeaways.length > 0 && (
            <section className="blogTakeaways">
              <h2>
                {lang === "ar"
                  ? "أهم النقاط"
                  : "Key Takeaways"}
              </h2>

              <ul>
                {takeaways.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {/* TOOL CTA */}

          {tool && (
            <section className="blogToolCallout">
              <h2>
                {tool.title ||
                  (lang === "ar"
                    ? "جرّب أدوات ALLWDBOOK"
                    : "Try ALLWDBOOK Tools")}
              </h2>

              {tool.description && (
                <p>
                  {tool.description}
                </p>
              )}

              {tool.href && (
                <Link
                  href={tool.href}
                  className="blogToolLink"
                  scroll={true}
                >
                  {tool.label ||
                    (lang === "ar"
                      ? "استخدم الأداة"
                      : "Use Tool")}
                </Link>
              )}
            </section>
          )}

        </main>

        {/* ===================================================
            TABLE OF CONTENTS
            =================================================== */}

        {sections.length > 0 && (
          <aside
            className="blogArticleToc"
            aria-label={
              lang === "ar"
                ? "فهرس المقال"
                : "Table of contents"
            }
          >
            <h2>
              {lang === "ar"
                ? "محتويات المقال"
                : "Table of Contents"}
            </h2>

            <ol>
              {sections.map(
                (section, index) => {
                  const sectionTitle =
                    section?.title ||
                    section?.heading ||
                    "";

                  if (!sectionTitle) {
                    return null;
                  }

                  return (
                    <li
                      key={
                        `toc-${index + 1}`
                      }
                    >
                      <a
                        href={
                          `#blog-section-${index + 1}`
                        }
                      >
                        {sectionTitle}
                      </a>
                    </li>
                  );
                }
              )}
            </ol>
          </aside>
        )}
      </div>

      {/* =====================================================
          RELATED ARTICLES
          ===================================================== */}

      {relatedArticles.length > 0 && (
        <section className="blogRelated">
          <h2>
            {lang === "ar"
              ? "مقالات قد تهمك"
              : "You May Also Like"}
          </h2>

          <div className="blogRelatedGrid">
            {relatedArticles.map(
              (related, index) => {
                const relatedSlug =
                  related?.slug || "";

                const relatedTitle =
                  related?.title || "";

                const relatedCategory =
                  related?.category || "";

                if (!relatedSlug) {
                  return null;
                }

                return (
                  <Link
                    key={
                      relatedSlug ||
                      index
                    }
                    href={getBlogArticleUrl(
                      lang,
                      relatedSlug
                    )}
                    className="blogRelatedCard"
                    scroll={true}
                  >
                    {relatedCategory && (
                      <span className="blogCardEyebrow">
                        {
                          relatedCategory
                        }
                      </span>
                    )}

                    <h3>
                      {relatedTitle}
                    </h3>
                  </Link>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="blogArticleFooter">
        <Link
          href={getBlogArticleUrl(
            lang,
            ""
          )}
          className="blogBackToBlog"
          scroll={true}
        >
          {lang === "ar"
            ? "استكشف جميع مقالات ALLWDBOOK"
            : "Explore All ALLWDBOOK Articles"}
        </Link>
      </footer>

      {/* =====================================================
          SEO STRUCTURED DATA
          ===================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLd
          ),
        }}
      />
    </div>
  );
}
