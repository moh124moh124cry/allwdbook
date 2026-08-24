// lib/blog/posts/improving-core-web-vitals-nextjs-blog.js

const improvingCoreWebVitals = {
  slug: "improving-core-web-vitals-nextjs-blog",

  ar: {
    intro: `
# كيف حسّنا Core Web Vitals لمدونة AllWDbook بـ Next.js

عندما أطلقنا مدونة AllWDbook، لم نكن نعلم أن أداء الصفحة سيكون التحدي الأكبر أمام ظهورها في نتائج البحث.

كانت المدونة تعمل بشكل صحيح من الناحية الوظيفية، لكن أدوات القياس مثل Lighthouse وGoogle Search Console كانت تشير إلى مشكلات في:

- **LCP (Largest Contentful Paint)**: الوقت اللازم لعرض أكبر عنصر مرئي في الصفحة
- **CLS (Cumulative Layout Shift)**: مقدار التحركات غير المتوقعة في تخطيط الصفحة أثناء التحميل
- **FID / INP**: مدى استجابة الصفحة لتفاعل المستخدم

هذه المقاييس لم تعد مجرد أرقام تقنية — أصبحت جزءًا من خوارزمية Google لترتيب المواقع.

في هذا المقال نشاركك بالضبط ما فعلناه لتحسين Core Web Vitals في مشروع Next.js حقيقي.
`,

    sections: [
      {
        id: "lcp-problem",
        heading: "مشكلة LCP: الصور كانت السبب الرئيسي",
        paragraphs: [
          `
في معظم صفحات المدونة، كان العنصر الأكبر هو صورة المقال (Hero Image).

المشكلة أن هذه الصورة كانت تُحمَّل كصورة عادية دون أي أولوية، مما كان يجعل LCP يتجاوز 3 ثواني على الشبكات المتوسطة.

الحل كان بسيطًا لكن فعّالًا: استخدام \`priority\` prop في مكون \`<Image>\` من Next.js للصورة الأولى فقط في الصفحة.

\`\`\`jsx
<Image
  src={article.heroImage}
  alt={article.meta.title}
  priority
  width={1200}
  height={630}
/>
\`\`\`

هذا يخبر Next.js بتحميل هذه الصورة مسبقًا (preload) قبل باقي الموارد.
`,
        ],
      },
      {
        id: "cls-problem",
        heading: "مشكلة CLS: الخطوط والصور بدون أبعاد",
        paragraphs: [
          `
كان CLS يتحرك كثيرًا عند تحميل الصفحة، وكان السبب رئيسيًا:

1. **الخطوط**: كانت الخطوط الخارجية تتحمّل بعد عرض النص، مما يسبب تغييرًا في حجم الكتلة النصية.

الحل: استخدام \`font-display: swap\` في تعريفات الخطوط ووضع CSS المهم في ملف منفصل يُحمَّل مبكرًا.

2. **الصور بدون أبعاد**: بعض الصور لم تكن لها \`width\` و\`height\` ثابتان، فكان المتصفح يغير حجمها عند اكتمال التحميل.

الحل: تحديد \`width\` و\`height\` لكل صورة، أو استخدام \`aspect-ratio\` في CSS لحجز المساحة مسبقًا.
`,
        ],
      },
      {
        id: "results",
        heading: "النتائج بعد التحسينات",
        paragraphs: [
          `
بعد تطبيق هذه التحسينات، تحسنت النتائج بشكل ملحوظ:

- **LCP**: انتقل من 3.2 ثانية إلى 1.8 ثانية
- **CLS**: انخفض من 0.15 إلى 0.03
- **درجة Lighthouse**: ارتفعت من 68 إلى 94

الأهم من الأرقام أن المستخدمين بدأوا يقضون وقتًا أطول في الصفحات، وانخفض معدل الارتداد (Bounce Rate) بشكل ملحوظ.

Core Web Vitals ليست مجرد تحسين للـ SEO — هي تحسين لتجربة المستخدم الحقيقية.
`,
        ],
      },
    ],

    relatedArticles: [
      "how-we-fixed-allwdbook-loading-flash",
      "from-simple-idea-to-real-platform",
    ],
  },

  en: {
    intro: `
# How We Improved Core Web Vitals for the AllWDbook Next.js Blog

When we launched the AllWDbook blog, we didn't realize that page performance would be the biggest challenge for search visibility.

The blog worked fine functionally, but measurement tools like Lighthouse and Google Search Console were flagging issues with:

- **LCP (Largest Contentful Paint)**: The time to render the largest visible element on the page
- **CLS (Cumulative Layout Shift)**: The amount of unexpected layout movement during load
- **FID / INP**: Page responsiveness to user interaction

These metrics are no longer just technical numbers — they're now part of Google's ranking algorithm.

In this article we share exactly what we did to improve Core Web Vitals on a real Next.js project.
`,

    sections: [
      {
        id: "lcp-problem",
        heading: "The LCP Problem: Images Were the Main Cause",
        paragraphs: [
          `
On most blog pages, the largest element was the article hero image.

The problem was that this image was loaded as a regular image with no priority, causing LCP to exceed 3 seconds on average networks.

The fix was simple but effective: using the \`priority\` prop on the \`<Image>\` component from Next.js for the first image only.

\`\`\`jsx
<Image
  src={article.heroImage}
  alt={article.meta.title}
  priority
  width={1200}
  height={630}
/>
\`\`\`

This tells Next.js to preload this image before other resources.
`,
        ],
      },
      {
        id: "cls-problem",
        heading: "The CLS Problem: Fonts and Images Without Dimensions",
        paragraphs: [
          `
CLS was shifting significantly on page load, mainly due to two causes:

1. **Fonts**: External fonts loaded after text was already rendered, causing text block size changes.

Fix: Use \`font-display: swap\` in font definitions and load critical CSS in a separate file that loads early.

2. **Images without dimensions**: Some images had no fixed \`width\` and \`height\`, so the browser resized them after load.

Fix: Specify \`width\` and \`height\` for every image, or use CSS \`aspect-ratio\` to reserve space in advance.
`,
        ],
      },
      {
        id: "results",
        heading: "Results After the Improvements",
        paragraphs: [
          `
After applying these improvements, results improved significantly:

- **LCP**: Dropped from 3.2s to 1.8s
- **CLS**: Reduced from 0.15 to 0.03
- **Lighthouse score**: Jumped from 68 to 94

More important than the numbers, users started spending more time on pages and bounce rate dropped noticeably.

Core Web Vitals aren't just an SEO improvement — they're a real user experience improvement.
`,
        ],
      },
    ],

    relatedArticles: [
      "how-we-fixed-allwdbook-loading-flash",
      "from-simple-idea-to-real-platform",
    ],
  },
};

export default improvingCoreWebVitals;
