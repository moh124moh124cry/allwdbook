import "../../../../blog-category.css";

import BlogCategoryPage from "../../../../../components/blog/BlogCategoryPage";

import {
  getAbsoluteBlogUrl,
  getBlogCategory,
  getBlogCategoryUrl,
  getLocalizedBlogCategory,
} from "../../../../../lib/blog";

export async function generateMetadata({
  params,
}) {
  const resolvedParams = await params;
  const categorySlug =
    typeof resolvedParams?.slug === "string"
      ? resolvedParams.slug
      : "";
  const categoryData =
    getBlogCategory(categorySlug);
  const category = categoryData
    ? getLocalizedBlogCategory(categoryData, "ar")
    : null;
  const canonical =
    getAbsoluteBlogUrl(
      getBlogCategoryUrl("ar", categorySlug),
    );
  const englishUrl =
    getAbsoluteBlogUrl(
      getBlogCategoryUrl("en", categorySlug),
    );

  return {
    title: category?.name || "أقسام المدونة",
    description:
      category?.description ||
      "تصفح مقالات أقسام مدونة AllWDbook.",
    alternates: {
      canonical,
      languages: {
        ar: canonical,
        en: englishUrl,
      },
    },
    openGraph: {
      title: category?.name || "أقسام المدونة",
      description:
        category?.description ||
        "تصفح مقالات أقسام مدونة AllWDbook.",
      url: canonical,
      siteName: "AllWDbook",
      images: category?.heroImage
        ? [category.heroImage]
        : undefined,
    },
  };
}

export default async function ArabicBlogCategoryPage({
  params,
}) {
  const resolvedParams = await params;
  const categorySlug =
    typeof resolvedParams?.slug === "string"
      ? resolvedParams.slug
      : "";

  return (
    <BlogCategoryPage
      categorySlug={categorySlug}
      lang="ar"
    />
  );
}
