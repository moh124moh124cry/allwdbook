import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import Feedback from "./feedback";
import AdSlot from "./adslot";

const ADS_ON = false;
const MONETAG_ZONE = "";
const LOGO = "/logov3.png";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://allwdbook-ex14.vercel.app";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220"
};

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "AllWDbook™ — Amazon KDP Publisher Tools",
    template: "%s | AllWDbook™"
  },

  description:
    "AllWDbook provides Amazon KDP tools for cover design, keyword research, micro-niche ideas, description formatting and paperback royalty estimates.",

  applicationName: "AllWDbook",

  authors: [{ name: "All World Digital" }],
  creator: "All World Digital",
  publisher: "All World Digital",

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
    title: "AllWDbook™ — Amazon KDP Publisher Tools",
    description:
      "Cover design, keyword research, micro-niche ideas, formatting and KDP royalty estimates in one toolkit.",
    images: [
      {
        url: LOGO,
        alt: "AllWDbook by All World Digital"
      }
    ],
    locale: "ar_DZ",
    alternateLocale: ["en_US"]
  },

  twitter: {
    card: "summary",
    title: "AllWDbook™ — Amazon KDP Publisher Tools",
    description:
      "Tools for Amazon KDP publishers: covers, keywords, niche ideas, formatting and royalty estimates.",
    images: [LOGO]
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Feedback />
        <AdSlot />
        <Analytics />

        {ADS_ON && MONETAG_ZONE ? (
          <Script
            id="monetag"
            strategy="lazyOnload"
            src="https://fpyf8.com/88/tag.min.js"
            data-zone={MONETAG_ZONE}
            data-cfasync="false"
          />
        ) : null}
      </body>
    </html>
  );
}
