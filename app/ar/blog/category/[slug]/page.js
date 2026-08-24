import { notFound } from "next/navigation";

import BlogCategoryPage from "../../../../../components/blog/BlogCategoryPage";

import {
  BLOG_CATEGORIES,
  getAbsoluteBlogUrl,
  getBlogCategory,
  getBlogCategoryUrl,
  getLocalizedBlogCategory,
} from "../../../../../lib/blog";

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;
  const category = getBlogCategory(slug);

  if (!category) {
    return {
      title: "القسم غير متاح | AllWDbook",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const localized = getLocalizedBlogCategory(category, "ar");
  const canonicalPath = getBlogCategoryUrl("ar", category.slug);
  const englishPath = getBlogCategoryUrl("en", category.slug);

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
      images: localized.image
        ? [
            {
              url: getAbsoluteBlogUrl(localized.image),
              alt: localized.name,
            },
          ]
        : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ArabicBlogCategoryPage({
  params,
}) {
  const { slug } = await params;

  if (!getBlogCategory(slug)) {
    notFound();
  }

  return (
    <BlogCategoryPage
      categorySlug={slug}
      lang="ar"
    />
  );
}
