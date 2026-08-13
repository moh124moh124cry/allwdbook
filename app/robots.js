const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://allwdbook-ex14.vercel.app";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
