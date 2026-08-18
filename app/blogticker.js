"use client";

import Link from "next/link";

export default function BlogTicker({
  isAr = true,
}) {
  const post = isAr
    ? {
        title:
          "لماذا أنشأت AllWDbook؟ المشكلة التي أردت حلها للناشرين",
        href:
          "/ar/blog/why-i-created-allwdbook",
      }
    : {
        title:
          "Why I Created AllWDbook: The Problem I Wanted to Solve for Publishers",
        href:
          "/en/blog/why-i-created-allwdbook",
      };

  const tickerItems =
    Array.from(
      { length: 6 },
      () => post
    );

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
      <div className="awd-blog-ticker-window">
        <div className="awd-blog-ticker-track">
          {tickerItems.map(
            (item, index) => (
              <Link
                href={item.href}
                className="awd-blog-ticker-item"
                key={`${item.href}-${index}`}
              >
                {item.title}

                <span className="awd-blog-ticker-dot">
                  •
                </span>
              </Link>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.awd-hero-description) {
          display: none !important;
        }

        .awd-blog-ticker {
          width: 100%;

          min-height: 96px;

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
              0.28
            );

          border-radius: 22px;

          background:
            linear-gradient(
              90deg,
              rgba(
                255,
                105,
                0,
                0.11
              ),
              rgba(
                7,
                22,
                40,
                0.94
              ),
              rgba(
                255,
                105,
                0,
                0.08
              )
            );

          box-shadow:
            inset 0 1px 0
              rgba(
                255,
                255,
                255,
                0.04
              ),
            0 12px 32px
              rgba(
                0,
                0,
                0,
                0.16
              );
        }

        .awd-blog-ticker-window {
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

          gap: 80px;

          animation:
            awdTickerMove
            34s linear
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
          min-height: 96px;

          display: flex;

          align-items: center;

          gap: 44px;

          padding-inline: 18px;

          color: #f5f7fb;

          white-space: nowrap;

          font-size: 25px;

          font-weight: 800;

          line-height: 1.35;

          text-decoration: none;

          transition:
            color 0.2s ease;
        }

        .awd-blog-ticker-item:hover {
          color: #ff8a3d;
        }

        .awd-blog-ticker-dot {
          color: #ff6900;

          font-size: 30px;

          line-height: 1;
        }

        .awd-blog-ticker-item:focus-visible {
          outline: 2px solid
            rgba(
              255,
              105,
              0,
              0.75
            );

          outline-offset: -5px;

          border-radius: 12px;
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
            min-height: 88px;

            margin-top: 22px;
            margin-bottom: 24px;

            border-radius: 18px;
          }

          .awd-blog-ticker-track {
            gap: 60px;

            animation-duration:
              30s;
          }

          .awd-blog-ticker-item {
            min-height: 88px;

            padding-inline: 14px;

            gap: 34px;

            font-size: 21px;

            font-weight: 800;
          }

          .awd-blog-ticker-dot {
            font-size: 26px;
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
        }
      `}</style>
    </div>
  );
}
