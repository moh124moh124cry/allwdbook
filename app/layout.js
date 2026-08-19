import "./globals.css";
import "./payment-freeze.css";

import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

import Feedback from "./feedback";
import AdSlot from "./adslot";
import AdminButton from "./adminbutton";

const ADS_ON = false;
const MONETAG_ZONE = "";
const LOGO = "/logov3.png";

const SITE_URL =
  "https://www.allwdbook.com";


/* =========================================================
   ALLWDBOOK VISITOR TRACKER
   =========================================================
   - معرف عشوائي محفوظ على الجهاز.
   - لا بريد.
   - لا AWD-KEY.
   - لا بيانات شخصية.
   - الخادم يحوله إلى Hash قبل Supabase.
   ========================================================= */

const VISITOR_TRACKER = `
(function () {
  "use strict";

  var STORAGE_KEY = "awd_visitor_id";
  var lastPath = "";
  var lastSentAt = 0;

  function fallbackUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
      .replace(/[xy]/g, function (c) {
        var r =
          Math.random() * 16 | 0;

        var v =
          c === "x"
            ? r
            : (r & 3) | 8;

        return v.toString(16);
      });
  }

  function getVisitorId() {
    try {
      var existing =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (existing) {
        return existing;
      }

      var visitorId =
        window.crypto &&
        typeof window.crypto.randomUUID ===
          "function"
          ? window.crypto.randomUUID()
          : fallbackUuid();

      window.localStorage.setItem(
        STORAGE_KEY,
        visitorId
      );

      return visitorId;
    } catch (error) {
      return fallbackUuid();
    }
  }

  function currentPath() {
    try {
      return (
        window.location.pathname ||
        "/"
      );
    } catch (error) {
      return "/";
    }
  }

  function shouldIgnore(path) {
    var blocked = [
      "/admin",
      "/login",
      "/test-access",
      "/api"
    ];

    return blocked.some(
      function (prefix) {
        return (
          path === prefix ||
          path.indexOf(
            prefix + "/"
          ) === 0
        );
      }
    );
  }

  function recordVisit() {
    var path =
      currentPath();

    if (shouldIgnore(path)) {
      return;
    }

    var now =
      Date.now();

    /*
     * يمنع التسجيل المكرر الناتج عن
     * pushState/replaceState المتتالي
     * في أقل من ثانية.
     */
    if (
      path === lastPath &&
      now - lastSentAt < 1000
    ) {
      return;
    }

    lastPath = path;
    lastSentAt = now;

    var visitorId =
      getVisitorId();

    fetch(
      "/api/analytics/visit",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            visitorId: visitorId,
            path: path
          }),

        keepalive: true,

        credentials:
          "same-origin"
      }
    ).catch(
      function () {
        /*
         * الإحصاءات لا يجب أن تعطل الموقع
         * إذا فشل الاتصال.
         */
      }
    );
  }

  function patchHistoryMethod(
    methodName
  ) {
    try {
      var original =
        window.history[
          methodName
        ];

      if (
        typeof original !==
          "function"
      ) {
        return;
      }

      window.history[
        methodName
      ] =
        function () {
          var result =
            original.apply(
              this,
              arguments
            );

          window.setTimeout(
            recordVisit,
            0
          );

          return result;
        };
    } catch (error) {}
  }

  patchHistoryMethod(
    "pushState"
  );

  patchHistoryMethod(
    "replaceState"
  );

  window.addEventListener(
    "popstate",
    function () {
      window.setTimeout(
        recordVisit,
        0
      );
    }
  );

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      recordVisit,
      {
        once: true
      }
    );
  } else {
    recordVisit();
  }
})();
`;


/* =========================================================
   VIEWPORT
   ========================================================= */

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220"
};


/* =========================================================
   METADATA
   ========================================================= */

export const metadata = {
  metadataBase:
    new URL(SITE_URL),

  title: {
    default:
      "AllWDbook™ — Amazon KDP Publisher Tools",

    template:
      "%s | AllWDbook™"
  },

  description:
    "AllWDbook provides Amazon KDP tools for cover design, keyword research, micro-niche ideas, description formatting and paperback royalty estimates.",

  applicationName:
    "AllWDbook",

  authors: [
    {
      name:
        "All World Digital"
    }
  ],

  creator:
    "All World Digital",

  publisher:
    "All World Digital",

  keywords: [
    "Amazon KDP",
    "KDP tools",
    "KDP keyword research",
    "KDP cover designer",
    "KDP royalty calculator",
    "Amazon books",
    "self publishing",
    "micro niche",
    "AllWDbook"
  ],

  alternates: {
    canonical: "/"
  },

  icons: {
    icon: LOGO,
    apple: LOGO
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: "AllWDbook",

    title:
      "AllWDbook™ — Amazon KDP Publisher Tools",

    description:
      "Cover design, keyword research, micro-niche ideas, formatting and KDP royalty estimates in one toolkit.",

    images: [
      {
        url: LOGO,
        alt:
          "AllWDbook by All World Digital"
      }
    ],

    locale: "ar_DZ",

    alternateLocale: [
      "en_US"
    ]
  },

  twitter: {
    card: "summary",

    title:
      "AllWDbook™ — Amazon KDP Publisher Tools",

    description:
      "Tools for Amazon KDP publishers: covers, keywords, niche ideas, formatting and royalty estimates.",

    images: [
      LOGO
    ]
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1
    }
  }
};


/* =========================================================
   ROOT LAYOUT
   ========================================================= */

export default function RootLayout({
  children
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <body>

        {children}


        {/* ===============================================
            ADMIN BUTTON — ADMIN ACCOUNT ONLY
            =============================================== */}

        <div
          style={{
            position: "fixed",
            top: 14,
            right: 14,
            zIndex: 30000
          }}
        >
          <AdminButton />
        </div>


        <Feedback />

        <AdSlot />


        {/* ===============================================
            CUSTOM SUPABASE VISITOR ANALYTICS
            =============================================== */}

        <Script
          id="allwdbook-visitor-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              VISITOR_TRACKER
          }}
        />


        {/* ===============================================
            VERCEL ANALYTICS
            =============================================== */}

        <Analytics />


        {/* ===============================================
            ADS — CURRENTLY DISABLED
            =============================================== */}

        {ADS_ON &&
        MONETAG_ZONE ? (
          <Script
            id="monetag"
            strategy="lazyOnload"
            src="https://fpyf8.com/88/tag.min.js"
            data-zone={
              MONETAG_ZONE
            }
            data-cfasync="false"
          />
        ) : null}

      </body>
    </html>
  );
}
