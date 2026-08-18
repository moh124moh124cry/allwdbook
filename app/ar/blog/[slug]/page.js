// app/ar/blog/[slug]/page.js

import { notFound } from "next/navigation";

import BlogArticleShell from "../../../../components/blog/BlogArticleShell";

import {
  getCompleteBlogArticle,
} from "../../../../lib/blog/content";

import {
  getAbsoluteBlogUrl,
  getBlogArticleUrl,
} from "../../../../lib/blog";

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  const article =
    getCompleteBlogArticle(
      slug,
      "ar"
    );

  if (
    !article ||
    !article.published ||
    !article.content ||
    !article.meta
  ) {
    return {
      title: "المقال غير متاح | AllWDbook",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath =
    getBlogArticleUrl(
      "ar",
      article.slug
    );

  const englishPath =
    getBlogArticleUrl(
      "en",
      article.slug
    );

  return {
    title: article.meta.title,
    description:
      article.meta.description,

    alternates: {
      canonical:
        getAbsoluteBlogUrl(
          canonicalPath
        ),

      languages: {
        ar: getAbsoluteBlogUrl(
          canonicalPath
        ),

        en: getAbsoluteBlogUrl(
          englishPath
        ),
      },
    },

    openGraph: {
      type: "article",
      locale: "ar_DZ",
      title: article.meta.title,
      description:
        article.meta.description,
      url: getAbsoluteBlogUrl(
        canonicalPath
      ),
      siteName: "AllWDbook",

      ...(article.publishDate
        ? {
            publishedTime:
              article.publishDate,
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: article.meta.title,
      description:
        article.meta.description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ArabicBlogArticlePage({
  params,
}) {
  const { slug } = await params;

  const article =
    getCompleteBlogArticle(
      slug,
      "ar"
    );

  if (
    !article ||
    !article.published ||
    !article.content ||
    !article.meta
  ) {
    notFound();
  }

  return (
    <BlogArticleShell
      article={article}
      lang="ar"
    />
  );
}
