"use client";

import Link from "next/link";

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
      dir={isAr ? "rtl" : "ltr"}
      aria-label={
        isAr
          ? "عناوين مقالات المدونة"
          : "Blog article titles"
      }
    >
      <div className="awd-blog-ticker-window">
        <div className="awd-blog-ticker-track">
          {tickerItems.map(
            (item, index) => {
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
                    href={item.href}
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
            }
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.awd-hero-description) {
          display: none !important;
        }

        .awd-blog-ticker {
          position: relative;

          width: 100%;
          min-height: 108px;

          display: flex;
          align-items: center;

          overflow: hidden;

          margin-top: 26px;
          margin-bottom: 28px;

          border: 1px solid
            rgba(
              255,
              105,
              0,
              0.34
            );

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 85% 50%,
              rgba(
                255,
                105,
                0,
                0.11
              ),
              transparent 38%
            ),
            linear-gradient(
              105deg,
              rgba(
                255,
                105,
                0,
                0.09
              ),
              rgba(
                7,
                22,
                40,
                0.97
              ) 44%,
              rgba(
                5,
                15,
                29,
                0.98
              )
            );

          box-shadow:
            inset 0 1px 0
              rgba(
                255,
                255,
                255,
                0.045
              ),
            inset 0 -1px 0
              rgba(
                255,
                105,
                0,
                0.08
              ),
            0 14px 36px
              rgba(
                0,
                0,
                0,
                0.2
              );
        }

        .awd-blog-ticker::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          border-radius: inherit;

          background:
            linear-gradient(
              115deg,
              transparent 10%,
              rgba(
                255,
                255,
                255,
                0.025
              ) 40%,
              transparent 65%
            );
        }

        .awd-blog-ticker-window {
          position: relative;

          z-index: 1;

          width: 100%;

          overflow: hidden;

          mask-image:
            linear-gradient(
              to right,
              transparent,
              black 5%,
              black 95%,
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to right,
              transparent,
              black 5%,
              black 95%,
              transparent
            );
        }

        .awd-blog-ticker-track {
          width: max-content;

          display: flex;
          align-items: center;

          gap: 92px;

          animation:
            awdTickerMove
            82s linear
            infinite;

          will-change: transform;
        }

        .awd-blog-ticker:hover
          .awd-blog-ticker-track,
        .awd-blog-ticker:focus-within
          .awd-blog-ticker-track {
          animation-play-state:
            paused;
        }

        .awd-blog-ticker-item {
          min-height: 108px;

          display: flex;
          align-items: center;

          flex: 0 0 auto;

          gap: 50px;

          padding-inline: 23px;

          white-space: nowrap;

          color: inherit;

          text-decoration: none !important;
          text-decoration-line: none !important;

          border-bottom: 0 !important;

          outline: none;

          -webkit-tap-highlight-color:
            transparent;
        }

        .awd-blog-ticker-link {
          cursor: pointer;
        }

        .awd-blog-ticker-draft {
          cursor: default;
        }

        .awd-blog-ticker-title {
          display: inline-block;

          color: #fff8ef;

          font-family:
            "Segoe Print",
            "Bradley Hand",
            "Comic Sans MS",
            "Noto Naskh Arabic",
            "Traditional Arabic",
            cursive;

          font-size: 30px;

          font-weight: 950;

          line-height: 1.45;

          letter-spacing: 0.15px;

          text-decoration: none !important;
          text-decoration-line: none !important;

          -webkit-text-stroke:
            1.05px
            #ff6900;

          paint-order:
            stroke fill;

          text-shadow:
            1px 1px 0
              #ff6900,
            2px 2px 0
              #da5200,
            3px 3px 0
              #a63e00,
            4px 4px 0
              #6f2900,
            6px 8px 12px
              rgba(
                0,
                0,
                0,
                0.65
              ),
            0 0 15px
              rgba(
                255,
                105,
                0,
                0.17
              );

          transform:
            rotate(-0.35deg)
            translateY(-1px);

          transform-origin:
            center;

          transition:
            color 0.2s ease,
            transform 0.2s ease,
            text-shadow 0.2s ease,
            -webkit-text-stroke-color
              0.2s ease;
        }

        [dir="rtl"]
          .awd-blog-ticker-title {
          transform:
            rotate(0.3deg)
            translateY(-1px);
        }

        .awd-blog-ticker-link:hover
          .awd-blog-ticker-title {
          color: #ffffff;

          -webkit-text-stroke-color:
            #ff8a3d;

          transform:
            translateY(-3px)
            scale(1.025)
            rotate(-0.15deg);

          text-shadow:
            1px 1px 0
              #ff7a21,
            2px 2px 0
              #e25700,
            3px 3px 0
              #b24100,
            5px 5px 0
              #762a00,
            7px 10px 16px
              rgba(
                0,
                0,
                0,
                0.72
              ),
            0 0 22px
              rgba(
                255,
                105,
                0,
                0.3
              );
        }

        [dir="rtl"]
          .awd-blog-ticker-link:hover
          .awd-blog-ticker-title {
          transform:
            translateY(-3px)
            scale(1.025)
            rotate(0.15deg);
        }

        .awd-blog-ticker-dot {
          color: #ff6900;

          font-size: 34px;

          font-weight: 900;

          line-height: 1;

          text-shadow:
            0 0 12px
              rgba(
                255,
                105,
                0,
                0.6
              );
        }

        .awd-blog-ticker-link:focus-visible {
          border-radius: 14px;

          box-shadow:
            inset 0 0 0 2px
              rgba(
                255,
                105,
                0,
                0.82
              );
        }

        @keyframes awdTickerMove {
          from {
            transform:
              translateX(0);
          }

          to {
            transform:
              translateX(-50%);
          }
        }

        [dir="rtl"]
          .awd-blog-ticker-track {
          animation-name:
            awdTickerMoveRtl;
        }

        @keyframes awdTickerMoveRtl {
          from {
            transform:
              translateX(0);
          }

          to {
            transform:
              translateX(50%);
          }
        }

        @media (
          max-width: 600px
        ) {
          .awd-blog-ticker {
            min-height: 100px;

            margin-top: 22px;
            margin-bottom: 25px;

            border-radius: 18px;
          }

          .awd-blog-ticker-track {
            gap: 72px;

            animation-duration:
              72s;
          }

          .awd-blog-ticker-item {
            min-height: 100px;

            gap: 38px;

            padding-inline: 16px;
          }

          .awd-blog-ticker-title {
            font-size: 24px;

            font-weight: 950;

            line-height: 1.45;

            -webkit-text-stroke:
              0.9px
              #ff6900;

            text-shadow:
              1px 1px 0
                #ff6900,
              2px 2px 0
                #d94f00,
              3px 3px 0
                #853000,
              5px 7px 10px
                rgba(
                  0,
                  0,
                  0,
                  0.7
                ),
              0 0 12px
                rgba(
                  255,
                  105,
                  0,
                  0.16
                );
          }

          .awd-blog-ticker-dot {
            font-size: 28px;
          }
        }

        @media (
          max-width: 390px
        ) {
          .awd-blog-ticker-title {
            font-size: 22px;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .awd-blog-ticker-track {
            animation: none;
          }

          .awd-blog-ticker-window {
            overflow-x: auto;
          }

          .awd-blog-ticker-title {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
