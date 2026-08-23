// app/ar/blog/category/[slug]/page.js

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
      title: "القسم غير موجود | AllWDbook",
      robots: { index: false, follow: false },
    };
  }

  const localized = getLocalizedBlogCategory(categoryData, "ar");

  const canonicalPath = getBlogCategoryUrl("ar", slug);
  const englishPath = getBlogCategoryUrl("en", slug);

  return {
    title: `${localized.name} | مدونة AllWDbook`,
    description: localized.description,

    alternates: {
      canonical: getAbsoluteBlogUrl(canonicalPath),
      languages: {
        ar: getAbsoluteBlogUrl(canonicalPath),
        en: getAbsoluteBlogUrl(englishPath),
      },
    },

    openGraph: {
      type: "website",
      locale: "ar_DZ",
      title: `${localized.name} | مدونة AllWDbook`,
      description: localized.description,
      url: getAbsoluteBlogUrl(canonicalPath),
      siteName: "AllWDbook",
    },

    twitter: {
      card: "summary",
      title: `${localized.name} | مدونة AllWDbook`,
      description: localized.description,
    },

    robots: { index: true, follow: true },
  };
}

export default async function ArabicBlogCategoryPage({ params }) {
  const { slug } = await params;

  const categoryData = getBlogCategory(slug);

  if (!categoryData) {
    notFound();
  }

  return <BlogCategoryPage lang="ar" categorySlug={slug} />;
}
