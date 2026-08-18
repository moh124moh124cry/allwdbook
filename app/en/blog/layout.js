// app/en/blog/layout.js

import "../../blog.css";

export default function EnglishBlogLayout({
  children,
}) {
  return (
    <div dir="ltr" lang="en">
      {children}
    </div>
  );
}
