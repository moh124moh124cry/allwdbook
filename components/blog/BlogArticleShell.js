// components/blog/BlogArticleShell.js

import Link from "next/link";

import {
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

  if (
    !article ||
    !article.meta ||
    !article.content
  ) {
    return null;
  }

  const category =
    getLocalizedBlogCategory(
      article.category,
      lang
    );

  const alternateLang =
    isArabic ? "en" : "ar";

  const alternateLabel =
    isArabic ? "English" : "العربية";

  const introParagraphs =
    String(article.content.intro || "")
      .split(/\n\s*\n/)
      .map((paragraph) =>
        paragraph.trim()
      )
      .filter(Boolean);

  const mediaItems =
    Array.isArray(article.content.media)
      ? article.content.media
      : [];

  const relatedArticles =
    (
      article.content.relatedSlugs ||
      []
    )
      .map((slug) =>
        getBlogArticleBySlug(slug)
      )
      .filter(
        (relatedArticle) =>
          relatedArticle &&
          relatedArticle.published
      );

  const publishedDate =
    article.publishDate
      ? new Intl.DateTimeFormat(
          isArabic
            ? "ar-DZ"
            : "en-US",
          {
            dateStyle: "long",
          }
        ).format(
          new Date(
            article.publishDate
          )
        )
      : null;

  function renderMedia(
    sectionId
  ) {
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
              alt={item.alt || ""}
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
          {article.meta.description}
        </p>

        <div className="blogMeta">
          <span className="blogReadingTime">
            {isArabic
              ? "وقت القراءة"
              : "Reading time"}
            :{" "}
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

      {article.heroImage && (
        <figure className="blogHero">
          <img
            src={article.heroImage}
            alt={article.meta.title}
          />
        </figure>
      )}

      {introParagraphs.length >
        0 && (
        <section className="blogIntro">
          {introParagraphs.map(
            (
              paragraph,
              index
            ) => (
              <p key={index}>
                {paragraph}
              </p>
            )
          )}
        </section>
      )}

      <section className="blogSections">
        {article.content.sections?.map(
          (section) => (
            <div
              key={section.id}
              className="blogSectionGroup"
            >
              <section className="blogSection">
                <h2>
                  {section.heading}
                </h2>

                {section.paragraphs?.map(
                  (
                    paragraph,
                    index
                  ) => (
                    <p
                      key={index}
                    >
                      {paragraph}
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

      {article.content
        .takeaways?.length >
        0 && (
        <aside className="blogTakeaways">
          <h2>
            {isArabic
              ? "ما تعلمناه"
              : "What we learned"}
          </h2>

          <ul>
            {article.content.takeaways.map(
              (
                item,
                index
              ) => (
                <li key={index}>
                  {item}
                </li>
              )
            )}
          </ul>
        </aside>
      )}

      {article.toolPath && (
        <aside className="blogToolCallout">
          <h2>
            {isArabic
              ? "جرّبه في AllWDbook"
              : "Try it in AllWDbook"}
          </h2>

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

      {relatedArticles.length >
        0 && (
        <footer className="blogRelated">
          <h2>
            {isArabic
              ? "مقالات مرتبطة"
              : "Related articles"}
          </h2>

          <ul>
            {relatedArticles.map(
              (
                relatedArticle
              ) => (
                <li
                  key={
                    relatedArticle.id
                  }
                >
                  <Link
                    href={getBlogArticleUrl(
                      lang,
                      relatedArticle.slug
                    )}
                  >
                    {
                      relatedArticle[
                        isArabic
                          ? "ar"
                          : "en"
                      ].title
                    }
                  </Link>
                </li>
              )
            )}
          </ul>
        </footer>
      )}
    </article>
  );
}
