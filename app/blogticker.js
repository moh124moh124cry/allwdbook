"use client";

export default function BlogTicker({
  isAr = true,
}) {
  const posts = isAr
    ? [
        {
          title:
            "كيف تختار الكلمات المفتاحية المناسبة لكتابك على Amazon KDP؟",
        },
        {
          title:
            "كيف تبحث عن Micro-Niche واعد قبل نشر كتابك؟",
        },
        {
          title:
            "دليل مقاسات أغلفة Amazon KDP",
        },
        {
          title:
            "كيف تحسب تكلفة الطباعة وأرباح كتابك؟",
        },
      ]
    : [
        {
          title:
            "How to choose the right Amazon KDP keywords",
        },
        {
          title:
            "How to research a promising Micro-Niche",
        },
        {
          title:
            "Amazon KDP cover size guide",
        },
        {
          title:
            "How to estimate printing costs and royalties",
        },
      ];

  /*
   * نكرر العناصر مرتين
   * للحصول على حركة مستمرة بلا فراغ.
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
          ? "أحدث مقالات المدونة"
          : "Latest blog articles"
      }
    >
      <div className="awd-blog-ticker-label">
        <span className="awd-blog-live-dot" />

        <strong>
          {isAr
            ? "من المدونة"
            : "From the Blog"}
        </strong>

        <span>📰</span>
      </div>

      <div className="awd-blog-ticker-window">
        <div className="awd-blog-ticker-track">
          {tickerItems.map(
            (post, index) => (
              <div
                className="awd-blog-ticker-item"
                key={`${post.title}-${index}`}
              >
                <span className="awd-blog-ticker-arrow">
                  {isAr ? "←" : "→"}
                </span>

                <span>
                  {post.title}
                </span>

                <span className="awd-blog-separator">
                  •
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        .awd-blog-ticker {
          width: 100%;

          min-height: 48px;

          display: grid;

          grid-template-columns:
            auto minmax(0, 1fr);

          align-items: center;

          overflow: hidden;

          margin-top: 20px;

          border: 1px solid
            rgba(
              255,
              105,
              0,
              0.2
            );

          border-radius: 14px;

          background:
            linear-gradient(
              90deg,
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
                0.82
              )
            );

          box-shadow:
            inset 0 1px 0
            rgba(
              255,
              255,
              255,
              0.025
            );
        }

        .awd-blog-ticker-label {
          position: relative;

          z-index: 3;

          min-height: 48px;

          display: flex;

          align-items: center;

          gap: 6px;

          padding-inline:
            13px;

          border-inline-end:
            1px solid
            rgba(
              255,
              105,
              0,
              0.18
            );

          background:
            rgba(
              255,
              105,
              0,
              0.08
            );

          color: #ff9855;

          white-space: nowrap;

          font-size: 10px;
        }

        .awd-blog-live-dot {
          width: 6px;
          height: 6px;

          flex: 0 0 6px;

          border-radius: 999px;

          background: #ff6900;

          box-shadow:
            0 0 0 4px
            rgba(
              255,
              105,
              0,
              0.1
            );

          animation:
            awdTickerPulse
            1.8s ease-in-out
            infinite;
        }

        .awd-blog-ticker-window {
          min-width: 0;

          overflow: hidden;

          mask-image:
            linear-gradient(
              to right,
              transparent,
              black 7%,
              black 93%,
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to right,
              transparent,
              black 7%,
              black 93%,
              transparent
            );
        }

        .awd-blog-ticker-track {
          width: max-content;

          display: flex;

          align-items: center;

          animation:
            awdTickerMove
            38s linear
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
          display: flex;

          align-items: center;

          gap: 8px;

          padding-inline:
            13px;

          color: #b4c2d4;

          white-space: nowrap;

          font-size: 11px;

          line-height: 48px;
        }

        .awd-blog-ticker-arrow {
          color: #ff7a21;

          font-weight: 900;
        }

        .awd-blog-separator {
          margin-inline:
            6px;

          color:
            rgba(
              255,
              105,
              0,
              0.65
            );

          font-size: 15px;
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

        @keyframes awdTickerPulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }
        }

        @media (
          max-width: 600px
        ) {
          .awd-blog-ticker {
            min-height: 44px;

            margin-top: 17px;

            border-radius: 12px;
          }

          .awd-blog-ticker-label {
            min-height: 44px;

            padding-inline:
              10px;

            font-size: 9px;
          }

          .awd-blog-ticker-item {
            padding-inline:
              10px;

            font-size: 10px;

            line-height: 44px;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .awd-blog-ticker-track,
          .awd-blog-live-dot {
            animation: none;
          }

          .awd-blog-ticker-window {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
