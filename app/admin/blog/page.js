import {
  getAllArticles,
  getBlogStats,
} from "@/lib/blog/utils";

export const metadata = {
  title: "Blog Manager",
};

export default function BlogManagerPage() {
  const articles = getAllArticles();
  const stats = getBlogStats();

  return (
    <main className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Blog Manager
          </h1>

          <p className="text-gray-500">
            Manage AllWDbook articles
          </p>
        </div>

        <button
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + New Article
        </button>
      </div>

      <section className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">
            Total
          </p>
          <p className="text-2xl font-bold">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">
            Published
          </p>
          <p className="text-2xl font-bold">
            {stats.published}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">
            Drafts
          </p>
          <p className="text-2xl font-bold">
            {stats.drafts}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">
            Featured
          </p>
          <p className="text-2xl font-bold">
            {stats.featured}
          </p>
        </div>
      </section>

      <section className="rounded-xl border">
        <div className="border-b p-4 font-semibold">
          Articles
        </div>

        <div className="divide-y">
          {articles.map((article) => (
            <div
              key={article.slug}
              className="flex items-center justify-between p-4"
            >
              <div>
                <h2 className="font-medium">
                  {article.title?.en ||
                    article.title ||
                    article.slug}
                </h2>

                <p className="text-sm text-gray-500">
                  {article.category || "No category"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm">
                  {article.published
                    ? "Published"
                    : "Draft"}
                </p>

                <p className="text-xs text-gray-500">
                  {article.publishDate || "-"}
                </p>
              </div>
            </div>
          ))}

          {articles.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No articles found
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
