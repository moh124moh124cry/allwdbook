// app/en/blog/page.js

import "../../blog-home.css";

import BlogHomePage from "../../../components/blog/BlogHomePage";

import {
  getAbsoluteBlogUrl,
} from "../../../lib/blog";

const ENGLISH_BLOG_URL =
  getAbsoluteBlogUrl("/en/blog");

const ARABIC_BLOG_URL =
  getAbsoluteBlogUrl("/ar/blog");

export const metadata = {
  title: "AllWDbook Blog",
  description:
    "Practical articles and real experiments from the AllWDbook journey, Amazon KDP, digital publishing, SEO, growth, and digital product building.",

  alternates: {
    canonical: ENGLISH_BLOG_URL,

    languages: {
      en: ENGLISH_BLOG_URL,
      ar: ARABIC_BLOG_URL,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    title: "AllWDbook Blog",
    description:
      "Real practical experiments in building AllWDbook, KDP, digital publishing, SEO, growth, and digital products.",
    url: ENGLISH_BLOG_URL,
    siteName: "AllWDbook",
  },

  twitter: {
    card: "summary",
    title: "AllWDbook Blog",
    description:
      "Real practical experiments in building AllWDbook, KDP, digital publishing, SEO, growth, and digital products.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function EnglishBlogPage({
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
      lang="en"
      query={query}
    />
  );
}

