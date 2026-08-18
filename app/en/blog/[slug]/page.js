// app/en/blog/[slug]/page.js

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
      "en"
    );

  if (
    !article ||
    !article.published ||
    !article.content ||
    !article.meta
  ) {
    return {
      title: "Article Not Available | AllWDbook",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath =
    getBlogArticleUrl(
      "en",
      article.slug
    );

  const arabicPath =
    getBlogArticleUrl(
      "ar",
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
        en: getAbsoluteBlogUrl(
          canonicalPath
        ),

        ar: getAbsoluteBlogUrl(
          arabicPath
        ),
      },
    },

    openGraph: {
      type: "article",
      locale: "en_US",
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

export default async function EnglishBlogArticlePage({
  params,
}) {
  const { slug } = await params;

  const article =
    getCompleteBlogArticle(
      slug,
      "en"
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
      lang="en"
    />
  );
}
