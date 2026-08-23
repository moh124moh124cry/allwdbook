// app/en/blog/category/[slug]/page.js

import { notFound } from "next/navigation";

import "../../../../blog-category.css";

import BlogCategoryPage from "../../../../../components/blog/BlogCategoryPage";

import {
  getBlogCategory,
  getAbsoluteBlogUrl,
  getBlogCategoryUrl,
} from "../../../../../lib/blog";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getBlogCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found | AllWDbook",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = getBlogCategoryUrl("en", slug);
  const arabicPath = getBlogCategoryUrl("ar", slug);

  return {
    title: `${category.en.name} | AllWDbook Blog`,
    description: category.en.description,

    alternates: {
      canonical: getAbsoluteBlogUrl(canonicalPath),
      languages: {
        en: getAbsoluteBlogUrl(canonicalPath),
        ar: getAbsoluteBlogUrl(arabicPath),
      },
    },

    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${category.en.name} | AllWDbook Blog`,
      description: category.en.description,
      url: getAbsoluteBlogUrl(canonicalPath),
      siteName: "AllWDbook",
    },

    twitter: {
      card: "summary",
      title: `${category.en.name} | AllWDbook Blog`,
      description: category.en.description,
    },

    robots: { index: true, follow: true },
  };
}

export default async function EnglishBlogCategoryPage({ params }) {
  const { slug } = await params;
  const category = getBlogCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <BlogCategoryPage
      categorySlug={slug}
      lang="en"
    />
  );
}
