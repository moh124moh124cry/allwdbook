import "./globals.css";

export const metadata = {
  title: "AllWDbook — تحليل وتسويق كتب أمازون KDP",
    description: "أدوات بحث الكلمات المفتاحية، تتبع المنافسين، مكتشف الفئات ومنسق الوصف لناشري KDP"
    };

    export default function RootLayout({ children }) {
      return (
          <html lang="ar" dir="rtl">
                <body>{children}</body>
                    </html>
                      );
                      }
                      