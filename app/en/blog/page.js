// app/en/blog/page.js

import Link from "next/link";

import {
  getPublishedBlogArticles,
} from "../../../lib/blog/articles";

import {
  hasBlogContent,
} from "../../../lib/blog/content";

import {
  getAbsoluteBlogUrl,
  getBlogArticleUrl,
  getLocalizedBlogCategory,
} from "../../../lib/blog";

const ENGLISH_BLOG_URL =
  getAbsoluteBlogUrl("/en/blog");

const ARABIC_BLOG_URL =
  getAbsoluteBlogUrl("/ar/blog");

export const metadata = {
  title: "AllWDbook Blog",
  description:
    "Practical articles and real experiments about AllWDbook, Amazon KDP, digital publishing, SEO, and digital product building.",

  alternates: {
    canonical: ENGLISH_BLOG_URL,

    languages: {
      en: ENGLISH_BLOG_URL,
      ar: ARABIC_BLOG_URL,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    title: "AllWDbook Blog",
    description:
      "Practical articles and real experiments about AllWDbook, Amazon KDP, digital publishing, SEO, and digital product building.",
    url: ENGLISH_BLOG_URL,
    siteName: "AllWDbook",
  },

  twitter: {
    card: "summary",
    title: "AllWDbook Blog",
    description:
      "Practical articles and real experiments about AllWDbook, Amazon KDP, digital publishing, SEO, and digital product building.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function EnglishBlogPage() {
  const articles =
    getPublishedBlogArticles()
      .filter((article) =>
        hasBlogContent(
          article.slug,
          "en"
        )
      );

  return (
    <main
      dir="ltr"
      className="blogIndexPage"
    >
      <header className="blogIndexHeader">
        <div className="blogIndexTopBar">
          <Link
            href="/"
            aria-label="AllWDbook"
          >
            <img
              src="/logov3.png"
              alt="AllWDbook"
              className="blogIndexLogo"
            />
          </Link>

          <Link
            href="/ar/blog"
            className="blogLanguageLink"
          >
            العربية
          </Link>
        </div>

        <p className="blogIndexEyebrow">
          AllWDbook Editorial
        </p>

        <h1>
          AllWDbook Blog
        </h1>

        <p className="blogIndexDescription">
          Real experiments and practical
          lessons from building AllWDbook,
          working with Amazon KDP, digital
          publishing, search visibility,
          and digital product development.
        </p>
      </header>

      <section
        className="blogIndexContent"
        aria-label="AllWDbook articles"
      >
        {articles.length === 0 ? (
          <div className="blogEmptyState">
            <p className="blogEmptyBadge">
              Coming Soon
            </p>

            <h2>
              We are preparing the first
              AllWDbook articles
            </h2>

            <p>
              This blog will publish original
              practical stories based on the
              real AllWDbook building journey
              and digital publishing work,
              supported by real examples and
              project screenshots.
            </p>
          </div>
        ) : (
          <div className="blogIndexGrid">
            {articles.map(
              (article) => {
                const category =
                  getLocalizedBlogCategory(
                    article.category,
                    "en"
                  );

                return (
                  <article
                    key={article.id}
                    className="blogIndexCard"
                  >
                    {category && (
                      <p className="blogIndexCardCategory">
                        <span>
                          {category.icon}
                        </span>

                        {" "}

                        {category.shortName}
                      </p>
                    )}

                    {article.series && (
                      <p className="blogIndexCardSeries">
                        {article.series}
                      </p>
                    )}

                    <h2>
                      <Link
                        href={getBlogArticleUrl(
                          "en",
                          article.slug
                        )}
                      >
                        {article.en.title}
                      </Link>
                    </h2>

                    <p className="blogIndexCardDescription">
                      {
                        article.en
                          .description
                      }
                    </p>

                    <div className="blogIndexCardFooter">
                      <span>
                        Reading time:{" "}
                        {
                          article
                            .readingTime
                            .en
                        }{" "}
                        min
                      </span>

                      <Link
                        href={getBlogArticleUrl(
                          "en",
                          article.slug
                        )}
                        className="blogIndexReadLink"
                      >
                        Read article
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}
