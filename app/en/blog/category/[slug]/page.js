// app/en/blog/category/[slug]/page.js

import "../../../../blog-category.css";

import { notFound } from "next/navigation";

import BlogCategoryPage from "../../../../../components/blog/BlogCategoryPage";

import {
  getBlogCategory,
  getLocalizedBlogCategory,
  getAbsoluteBlogUrl,
  getBlogCategoryUrl,
} from "../../../../../lib/blog";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const categoryData = getBlogCategory(slug);

  if (!categoryData) {
    return {
      title: "Category Not Found | AllWDbook",
      robots: { index: false, follow: false },
    };
  }

  const localized = getLocalizedBlogCategory(categoryData, "en");

  const canonicalPath = getBlogCategoryUrl("en", slug);
  const arabicPath = getBlogCategoryUrl("ar", slug);

  return {
    title: `${localized.name} | AllWDbook Blog`,
    description: localized.description,

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
      title: `${localized.name} | AllWDbook Blog`,
      description: localized.description,
      url: getAbsoluteBlogUrl(canonicalPath),
      siteName: "AllWDbook",
    },

    twitter: {
      card: "summary",
      title: `${localized.name} | AllWDbook Blog`,
      description: localized.description,
    },

    robots: { index: true, follow: true },
  };
}

export default async function EnglishBlogCategoryPage({ params }) {
  const { slug } = await params;

  const categoryData = getBlogCategory(slug);

  if (!categoryData) {
    notFound();
  }

  return <BlogCategoryPage lang="en" categorySlug={slug} />;
}
