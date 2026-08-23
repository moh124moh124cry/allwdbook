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
      title: "Category Not Available | AllWDbook",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const localized = getLocalizedBlogCategory(category, "en");
  const canonicalPath = getBlogCategoryUrl("en", category.slug);
  const arabicPath = getBlogCategoryUrl("ar", category.slug);

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

export default async function EnglishBlogCategoryPage({
  params,
}) {
  const { slug } = await params;

  if (!getBlogCategory(slug)) {
    notFound();
  }

  return (
    <BlogCategoryPage
      categorySlug={slug}
      lang="en"
    />
  );
}
