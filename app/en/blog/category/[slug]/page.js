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
    ? getLocalizedBlogCategory(categoryData, "en")
    : null;
  const canonical =
    getAbsoluteBlogUrl(
      getBlogCategoryUrl("en", categorySlug),
    );
  const arabicUrl =
    getAbsoluteBlogUrl(
      getBlogCategoryUrl("ar", categorySlug),
    );

  return {
    title: category?.name || "Blog sections",
    description:
      category?.description ||
      "Browse AllWDbook blog sections and articles.",
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: arabicUrl,
      },
    },
    openGraph: {
      title: category?.name || "Blog sections",
      description:
        category?.description ||
        "Browse AllWDbook blog sections and articles.",
      url: canonical,
      siteName: "AllWDbook",
      images: category?.heroImage
        ? [category.heroImage]
        : undefined,
    },
  };
}

export default async function EnglishBlogCategoryPage({
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
      lang="en"
    />
  );
}
