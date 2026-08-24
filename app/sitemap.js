import {
  getPublishedBlogArticles,
} from "../lib/blog/articles";

import {
  hasBlogContent,
} from "../lib/blog/content";

import {
  BLOG_CATEGORIES,
} from "../lib/blog";

const SITE_URL =
  "https://www.allwdbook.com";

export default function sitemap() {
  const publishedArticles =
    getPublishedBlogArticles();

  const articlePages =
    publishedArticles.flatMap(
      (article) => {
        const pages = [];

        if (
          hasBlogContent(
            article.slug,
            "ar"
          )
        ) {
          pages.push({
            url: `${SITE_URL}/ar/blog/${article.slug}`,
            lastModified:
              article.publishDate ||
              undefined,
            changeFrequency:
              "monthly",
            priority: 0.8,
          });
        }

        if (
          hasBlogContent(
            article.slug,
            "en"
          )
        ) {
          pages.push({
            url: `${SITE_URL}/en/blog/${article.slug}`,
            lastModified:
              article.publishDate ||
              undefined,
            changeFrequency:
              "monthly",
            priority: 0.8,
          });
        }

        return pages;
      }
    );

  const categoryPages =
    BLOG_CATEGORIES.flatMap(
      (category) => [
        {
          url: `${SITE_URL}/ar/blog/category/${category.slug}`,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${SITE_URL}/en/blog/category/${category.slug}`,
          changeFrequency: "weekly",
          priority: 0.8,
        },
      ],
    );

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${SITE_URL}/ar/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/en/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    ...categoryPages,

    ...articlePages,

    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: `${SITE_URL}/refund`,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: `${SITE_URL}/subscription`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
