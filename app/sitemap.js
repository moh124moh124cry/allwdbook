const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://allwdbook-ex14.vercel.app";

export default function sitemap() {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];
}
