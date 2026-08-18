// app/ar/blog/page.js

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

const ARABIC_BLOG_URL =
  getAbsoluteBlogUrl("/ar/blog");

const ENGLISH_BLOG_URL =
  getAbsoluteBlogUrl("/en/blog");

export const metadata = {
  title: "مدونة AllWDbook",
  description:
    "تجارب ومقالات عملية حول AllWDbook وAmazon KDP والنشر الرقمي وSEO وبناء المنتجات الرقمية.",

  alternates: {
    canonical: ARABIC_BLOG_URL,

    languages: {
      ar: ARABIC_BLOG_URL,
      en: ENGLISH_BLOG_URL,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_DZ",
    title: "مدونة AllWDbook",
    description:
      "تجارب ومقالات عملية حول AllWDbook وAmazon KDP والنشر الرقمي وSEO وبناء المنتجات الرقمية.",
    url: ARABIC_BLOG_URL,
    siteName: "AllWDbook",
  },

  twitter: {
    card: "summary",
    title: "مدونة AllWDbook",
    description:
      "تجارب ومقالات عملية حول AllWDbook وAmazon KDP والنشر الرقمي وSEO وبناء المنتجات الرقمية.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ArabicBlogPage() {
  const articles =
    getPublishedBlogArticles()
      .filter((article) =>
        hasBlogContent(
          article.slug,
          "ar"
        )
      );

  return (
    <main
      dir="rtl"
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
            href="/en/blog"
            className="blogLanguageLink"
          >
            English
          </Link>
        </div>

        <p className="blogIndexEyebrow">
          AllWDbook Editorial
        </p>

        <h1>
          مدونة AllWDbook
        </h1>

        <p className="blogIndexDescription">
          تجارب حقيقية ودروس عملية من بناء
          AllWDbook، والعمل على Amazon KDP،
          والنشر الرقمي، وتحسين الظهور في
          محركات البحث، وبناء المنتجات
          الرقمية.
        </p>
      </header>

      <section
        className="blogIndexContent"
        aria-label="مقالات AllWDbook"
      >
        {articles.length === 0 ? (
          <div className="blogEmptyState">
            <p className="blogEmptyBadge">
              قريبًا
            </p>

            <h2>
              نعمل على إعداد أول مقالات
              AllWDbook
            </h2>

            <p>
              سننشر هنا تجارب عملية أصلية
              مبنية على رحلة تطوير AllWDbook
              والعمل في النشر الرقمي، مع
              أمثلة وصور حقيقية من المشروع.
            </p>
          </div>
        ) : (
          <div className="blogIndexGrid">
            {articles.map(
              (article) => {
                const category =
                  getLocalizedBlogCategory(
                    article.category,
                    "ar"
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
                          "ar",
                          article.slug
                        )}
                      >
                        {article.ar.title}
                      </Link>
                    </h2>

                    <p className="blogIndexCardDescription">
                      {
                        article.ar
                          .description
                      }
                    </p>

                    <div className="blogIndexCardFooter">
                      <span>
                        وقت القراءة:{" "}
                        {
                          article
                            .readingTime
                            .ar
                        }{" "}
                        دقائق
                      </span>

                      <Link
                        href={getBlogArticleUrl(
                          "ar",
                          article.slug
                        )}
                        className="blogIndexReadLink"
                      >
                        قراءة المقال
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
