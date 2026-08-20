"use client";

import Link from "next/link";
import "./blogticker.css";

import {
  BLOG_ARTICLES,
} from "../lib/blog/articles";

export default function BlogTicker({
  isAr = true,
}) {
  const language =
    isAr ? "ar" : "en";

  /*
   * نعرض أول 10 عناوين من سجل المدونة.
   *
   * المقالة المنشورة:
   * يمكن الضغط عليها والانتقال إليها.
   *
   * المقالة غير المنشورة:
   * يظهر عنوانها فقط بدون فتح رابط غير جاهز.
   */
  const posts =
    BLOG_ARTICLES
      .slice(0, 10)
      .map((article) => ({
        id: article.id,

        title:
          article[language]
            ?.title ||
          article[language]
            ?.shortTitle ||
          article.slug,

        href:
          article.published
            ? `/${language}/blog/${article.slug}`
            : null,

        published:
          article.published,
      }));

  /*
   * نكرر المجموعة كاملة مرتين
   * حتى تستمر الحركة بدون فراغ.
   *
   * 10 + 10 = 20 عنصرًا داخل المسار،
   * لكن المحتوى الفعلي هو 10 عناوين مختلفة.
   */
  const tickerItems = [
    ...posts,
    ...posts,
  ];

  return (
    <div
      className="awd-blog-ticker"
      dir={
        isAr
          ? "rtl"
          : "ltr"
      }
      aria-label={
        isAr
          ? "عناوين مقالات المدونة"
          : "Blog article titles"
      }
    >
      <div className="awd-blog-ticker-window">
        <div className="awd-blog-ticker-track">
          {tickerItems.map(
            (
              item,
              index,
            ) => {
              const content = (
                <>
                  <span className="awd-blog-ticker-title">
                    {item.title}
                  </span>

                  <span
                    className="awd-blog-ticker-dot"
                    aria-hidden="true"
                  >
                    •
                  </span>
                </>
              );

              if (
                item.published &&
                item.href
              ) {
                return (
                  <Link
                    href={
                      item.href
                    }
                    className="awd-blog-ticker-item awd-blog-ticker-link"
                    key={`${item.id}-${index}`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  className="awd-blog-ticker-item awd-blog-ticker-draft"
                  key={`${item.id}-${index}`}
                >
                  {content}
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

