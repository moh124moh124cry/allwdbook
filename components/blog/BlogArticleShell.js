// components/blog/BlogArticleShell.js

export default function BlogArticleShell({
  article,
  lang = "ar",
}) {
  const isArabic = lang === "ar";

  if (!article) return null;

  return (
    <article
      dir={isArabic ? "rtl" : "ltr"}
      className="blogArticleShell"
    >
      <header className="blogArticleHeader">
        <img
          src="/logov3.png"
          alt="AllWDbook"
          className="blogLogo"
        />

        <p className="blogCategory">
          {article.category}
        </p>

        <h1>
          {article.meta.title}
        </h1>

        <p className="blogDescription">
          {article.meta.description}
        </p>

        <p className="blogReadingTime">
          {isArabic ? "وقت القراءة" : "Reading time"}:
          {" "}
          {isArabic
            ? `${article.readingTime.ar} دقائق`
            : `${article.readingTime.en} min`}
        </p>
      </header>

      {article.heroImage && (
        <div className="blogHero">
          <img
            src={article.heroImage}
            alt={article.meta.title}
          />
        </div>
      )}

      <section className="blogIntro">
        <p>
          {article.content.intro}
        </p>
      </section>

      <section className="blogSections">
        {article.content.sections.map((section) => (
          <section
            key={section.id}
            className="blogSection"
          >
            <h2>
              {section.heading}
            </h2>

            {section.paragraphs.map(
              (paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              )
            )}
          </section>
        ))}
      </section>

      <aside className="blogTakeaways">
        <h2>
          {isArabic
            ? "ما تعلمناه"
            : "What we learned"}
        </h2>

        <ul>
          {article.content.takeaways.map(
            (item, index) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>
      </aside>

      {article.content.relatedSlugs?.length > 0 && (
        <footer className="blogRelated">
          <h2>
            {isArabic
              ? "مقالات مرتبطة"
              : "Related articles"}
          </h2>

          <ul>
            {article.content.relatedSlugs.map(
              (slug) => (
                <li key={slug}>
                  {slug}
                </li>
              )
            )}
          </ul>
        </footer>
      )}
    </article>
  );
}
