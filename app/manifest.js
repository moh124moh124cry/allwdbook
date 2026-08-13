export default function manifest() {
  return {
    name: "AllWDbook — Amazon KDP Publisher Tools",
    short_name: "AllWDbook",
    description:
      "Cover design, keyword research, micro-niche ideas, formatting and royalty tools for Amazon KDP publishers.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    orientation: "any",
    lang: "ar",
    dir: "rtl",
    categories: [
      "books",
      "business",
      "productivity"
    ],
    icons: [
      {
        src: "/logov3.png",
        sizes: "any",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
