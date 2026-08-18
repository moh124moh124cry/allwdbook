import { redirect } from "next/navigation";

export const metadata = {
  title:
    "أدوات AllWDbook للنشر الرقمي | KDP Tools",

  description:
    "استكشف أدوات AllWDbook للبحث عن الكلمات المفتاحية والنيشات، تصميم الأغلفة، حساب الأرباح وتجهيز محتوى الكتب.",

  alternates: {
    canonical:
      "/",
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function ToolsPage() {
  redirect(
    "/#awd-tools",
  );
}
