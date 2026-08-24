import { blogArticles } from "./articles";

/**
 * Return all blog articles
 */
export function getAllArticles() {
  return blogArticles || [];
}

/**
 * Return only published articles
 */
export function getPublishedArticles() {
  return getAllArticles().filter(
    (article) => article.published === true
  );
}

/**
 * Return featured articles
 */
export function getFeaturedArticles() {
  return getAllArticles()
    .filter((article) => article.featured === true)
    .sort(
      (a, b) =>
        (a.featuredOrder || 999) -
        (b.featuredOrder || 999)
    );
}

/**
 * Return draft articles
 * Compatible with future status system
 */
export function getDraftArticles() {
  return getAllArticles().filter(
    (article) =>
      article.published === false ||
      article.status === "draft"
  );
}

/**
 * Find article by slug
 */
export function getArticleBySlug(slug) {
  return getAllArticles().find(
    (article) => article.slug === slug
  );
}

/**
 * Count articles by status
 */
export function getBlogStats() {
  const articles = getAllArticles();

  return {
    total: articles.length,
    published: articles.filter(
      (article) => article.published === true
    ).length,
    drafts: getDraftArticles().length,
    featured: getFeaturedArticles().length,
  };
}
