import "./globals.css";
import Script from "next/script";
import Feedback from "./feedback";
import AdSlot from "./adslot";

const ADS_ON = false;
const MONETAG_ZONE = "";
const LOGO = "/logov3.png";

export const metadata = {
  title: "AllWDbook™ — Amazon KDP Publisher Tools | All World Digital",
  description: "Free cover designer, keyword research, micro-niche generation and royalty calculator for Amazon KDP publishers. Designed by All World Digital.",
  authors: [{ name: "All World Digital" }],
  applicationName: "AllWDbook",
  icons: { icon: LOGO, apple: LOGO }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Feedback />
        <AdSlot />
        {ADS_ON && MONETAG_ZONE ? (
          <Script
            id="monetag"
            strategy="lazyOnload"
            src={"https://fpyf8.com/88/tag.min.js"}
            data-zone={MONETAG_ZONE}
            data-cfasync="false"
          />
        ) : null}
      </body>
    </html>
  );
}
