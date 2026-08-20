// app/ar/blog/page.js

import "../../blog-home.css";

import BlogHomePage from "../../../components/blog/BlogHomePage";

import {
  getAbsoluteBlogUrl,
} from "../../../lib/blog";

const ARABIC_BLOG_URL =
  getAbsoluteBlogUrl("/ar/blog");

const ENGLISH_BLOG_URL =
  getAbsoluteBlogUrl("/en/blog");

export const metadata = {
  title: "مدونة AllWDbook",
  description:
    "تجارب ومقالات عملية حول رحلة AllWDbook وAmazon KDP والنشر الرقمي وSEO وبناء المنتجات الرقمية.",

  alternates: {
    canonical: ARABIC_BLOG_URL,

    languages: {
      ar: ARABIC_BLOG_URL,
      en: ENGLISH_BLOG_URL,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_DZ",
    title: "مدونة AllWDbook",
    description:
      "تجارب عملية حقيقية في بناء AllWDbook وKDP والنشر الرقمي وSEO وبناء المنتجات الرقمية.",
    url: ARABIC_BLOG_URL,
    siteName: "AllWDbook",
  },

  twitter: {
    card: "summary",
    title: "مدونة AllWDbook",
    description:
      "تجارب عملية حقيقية في بناء AllWDbook وKDP والنشر الرقمي وSEO وبناء المنتجات الرقمية.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function ArabicBlogPage({
  searchParams,
}) {
  const resolvedSearchParams =
    await searchParams;

  const query =
    typeof resolvedSearchParams?.q ===
    "string"
      ? resolvedSearchParams.q.trim()
      : "";

  return (
    <BlogHomePage
      lang="ar"
      query={query}
    />
  );
}

