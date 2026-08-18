// app/en/blog/page.js

import Link from "next/link";
import { getPublishedBlogArticles } from "../../../lib/blog/articles";

export const metadata = {
  title: "AllWDbook Blog",
  description:
    "Articles, experiments, and practical lessons about AllWDbook, KDP, digital publishing, SEO, and product building.",
};

export default function EnglishBlogPage() {
  const articles = getPublishedBlogArticles();

  return (
    <main dir="ltr">
      <header>
        <img
          src="/logov3.png"
          alt="AllWDbook"
        />

        <h1>
          AllWDbook Blog
        </h1>

        <p>
          Practical publishing experiments, product-building stories,
          and lessons from building AllWDbook.
        </p>
      </header>

      <section>
        {articles.length === 0 ? (
          <p>
            Articles will be published soon.
          </p>
        ) : (
          articles.map((article) => (
            <article key={article.id}>
              <h2>
                <Link href={`/en/blog/${article.slug}`}>
                  {article.en.title}
                </Link>
              </h2>

              <p>
                {article.en.description}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
