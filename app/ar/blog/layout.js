// app/ar/blog/layout.js

import "../../blog.css";
import "../../blog-category.css";

export default function ArabicBlogLayout({
  children,
}) {
  return (
    <div dir="rtl" lang="ar">
      {children}
    </div>
  );
}
