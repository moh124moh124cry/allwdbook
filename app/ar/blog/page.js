// app/ar/blog/page.js

import Link from "next/link";
import { getPublishedBlogArticles } from "@/lib/blog/articles";

export const metadata = {
  title: "مدونة AllWDbook",
  description:
    "مقالات وتجارب حول AllWDbook و KDP والنشر الرقمي وبناء المنتجات.",
};

export default function ArabicBlogPage() {
  const articles = getPublishedBlogArticles();

  return (
    <main dir="rtl">
      <header>
        <img
          src="/logov3.png"
          alt="AllWDbook"
        />

        <h1>
          مدونة AllWDbook
        </h1>

        <p>
          تجارب وأفكار حول النشر الرقمي وبناء الأدوات للناشرين.
        </p>
      </header>

      <section>
        {articles.length === 0 ? (
          <p>
            سيتم نشر المقالات قريبًا.
          </p>
        ) : (
          articles.map((article) => (
            <article key={article.id}>
              <h2>
                <Link href={`/ar/blog/${article.slug}`}>
                  {article.ar.title}
                </Link>
              </h2>

              <p>
                {article.ar.description}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
