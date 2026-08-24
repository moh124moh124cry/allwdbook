// app/ar/blog/category/[slug]/page.js

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
      title: "القسم غير موجود | AllWDbook",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = getBlogCategoryUrl("ar", slug);
  const englishPath = getBlogCategoryUrl("en", slug);

  return {
    title: `${category.ar.name} | مدونة AllWDbook`,
    description: category.ar.description,

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
      title: `${category.ar.name} | مدونة AllWDbook`,
      description: category.ar.description,
      url: getAbsoluteBlogUrl(canonicalPath),
      siteName: "AllWDbook",
    },

    twitter: {
      card: "summary",
      title: `${category.ar.name} | مدونة AllWDbook`,
      description: category.ar.description,
    },

    robots: { index: true, follow: true },
  };
}

export default async function ArabicBlogCategoryPage({ params }) {
  const { slug } = await params;
  const category = getBlogCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <BlogCategoryPage
      categorySlug={slug}
      lang="ar"
    />
  );
}
