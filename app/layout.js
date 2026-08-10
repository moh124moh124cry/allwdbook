import "./globals.css";
import Script from "next/script";

// ═══ مفتاح تشغيل الإعلانات ═══
// اتركه false حتى تحصل على نطاق خاص وتُقبل في Monetag.
// عند التفعيل: غيّره إلى true وضع رقم الموقع (Zone ID) بالأسفل.
const ADS_ON = false;
const MONETAG_ZONE = "";

export const metadata = {
  title: "AllWDbook™ — Amazon KDP Publisher Tools | All World Digital",
  description: "Keyword research, micro-niche generation, competitor tracking and category discovery for Amazon KDP publishers. Designed by All World Digital.",
  authors: [{ name: "All World Digital" }],
  applicationName: "AllWDbook",
  icons: { icon: "/logo.png", apple: "/logo.png" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
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
