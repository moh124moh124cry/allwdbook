const SITE_URL =
  "https://www.allwdbook.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",

        disallow: [
          "/api/",
          "/admin/",
          "/login",
        ],
      },
    ],

    sitemap:
      `${SITE_URL}/sitemap.xml`,

    host: SITE_URL,
  };
}
