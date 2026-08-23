const seoTechnicalAuditPlaybookForContentSites = {
  slug: "seo-technical-audit-playbook-for-content-sites",

  ar: {
    intro: `أغلب مشاكل SEO في مواقع المحتوى لا تكون في كتابة المقال فقط، بل في الطبقة التقنية التي تمنع الصفحة من الظهور أو تقلل قوتها.

هذا الدليل يقدم Workflow عملي لمراجعة الموقع قبل التوسع في النشر: الفهرسة، السرعة، البنية الداخلية، ثم متابعة التحسينات بالأرقام.`,

    sections: [
      {
        id: "indexing",
        heading: "ابدأ من الفهرسة: هل الصفحات المهمة قابلة للظهور أصلًا؟",
        paragraphs: [
          `أول خطوة هي التأكد أن الصفحات الأساسية ليست محجوبة عبر robots أو noindex بالخطأ. افحص صفحات الفئات والمقالات الجديدة وصفحات التحويل المهمة.`,
          `لو كانت الفهرسة غير مستقرة، أي تحسين محتوى لاحق سيعطي نتائج أبطأ من المتوقع لأن محرك البحث لا يرى كل الصفحات بشكل صحيح.`,
        ],
      },
      {
        id: "speed",
        heading: "سرعة وتجربة الصفحة: ركّز على مشاكل التحميل المؤثرة",
        paragraphs: [
          `بدل مطاردة كل تنبيه صغير، ركّز على العناصر التي تضر تجربة القراءة فعليًا: الصور الثقيلة، JavaScript غير الضروري، وتأخير تحميل الخطوط.`,
          `في المدونات، تحسين صورة الـHero وضغط صور المقالات وتحديد الأبعاد مسبقًا يرفع الاستقرار البصري ويقلل القفز أثناء التحميل.`,
        ],
      },
      {
        id: "internal-links",
        heading: "الربط الداخلي: كل مقالة يجب أن تكون ضمن مسار واضح",
        paragraphs: [
          `صفحة القسم يجب أن تقود للمقالات، والمقالة يجب أن تعيد القارئ للقسم والمدونة. هذا يحسن تجربة المستخدم ويسهل على محركات البحث فهم الهيكل.`,
          `أضف روابط منطقية بين المقالات المرتبطة، وحدث الصفحات الأقدم بروابط نحو المحتوى الأحدث داخل نفس الموضوع.`,
        ],
      },
      {
        id: "metadata",
        heading: "تأكد من Metadata وCanonical وhreflang",
        paragraphs: [
          `المواقع متعددة اللغة تحتاج روابط واضحة بين النسخ العربية والإنجليزية لكل قسم ومقالة.`,
          `وجود canonical صحيح لكل صفحة، مع alternates للغات، يقلل تضارب الفهرسة ويقوي جودة الظهور في نتائج البحث.`,
        ],
      },
      {
        id: "cadence",
        heading: "اجعل التدقيق دوريًا لا مهمة لمرة واحدة",
        paragraphs: [
          `اعمل مراجعة تقنية خفيفة أسبوعيًا، ومراجعة أعمق شهريًا.`,
          `سجل الأخطاء المتكررة، واحسب زمن الإغلاق لكل مشكلة. التحسن الحقيقي يظهر عندما ينخفض عدد المشاكل المفتوحة مع الوقت.`,
        ],
      },
    ],

    takeaways: [
      "ابدأ دائمًا من قابلية الفهرسة قبل أي تحسينات أخرى.",
      "تحسين الصور والأصول الثقيلة يعطي أثرًا سريعًا على تجربة المستخدم.",
      "هيكل الربط بين القسم والمقالة عنصر أساسي في SEO.",
      "الـMetadata متعددة اللغة يجب أن تكون دقيقة ومتناسقة.",
      "التدقيق التقني المستمر أفضل من إصلاحات متقطعة.",
    ],

    media: [
      {
        id: "seo-hero",
        type: "image",
        src: "/blog/articles/seo-technical-audit-hero.svg",
        alt: "SEO Technical Audit workflow",
        caption: "Workflow عملي لتدقيق SEO التقني في مواقع المحتوى.",
        afterSection: "indexing",
      },
    ],

    relatedSlugs: [
      "how-we-fixed-allwdbook-loading-flash",
      "from-simple-idea-to-real-platform",
    ],
  },

  en: {
    intro: `Most SEO bottlenecks on content sites are not writing problems. They are technical blockers that reduce crawling quality, indexing stability, and page experience.

This playbook gives a practical workflow to audit your site before scaling content: indexing, speed, internal structure, and measurable follow-up.`,

    sections: [
      {
        id: "indexing",
        heading: "Start with indexing: can important pages be discovered and indexed?",
        paragraphs: [
          `First, verify that your key pages are not accidentally blocked by robots rules or noindex directives. Check category pages, new posts, and high-value conversion pages.`,
          `If indexing is unstable, content improvements will underperform because search engines cannot consistently evaluate the full site structure.`,
        ],
      },
      {
        id: "speed",
        heading: "Page speed and UX: prioritize high-impact loading issues",
        paragraphs: [
          `Do not chase every minor warning. Prioritize issues that hurt real reading experience: oversized images, unnecessary JavaScript, and delayed font rendering.`,
          `On editorial pages, optimizing hero images, compressing post visuals, and setting dimensions in advance often improves visual stability immediately.`,
        ],
      },
      {
        id: "internal-links",
        heading: "Internal linking: each post should belong to a clear navigation path",
        paragraphs: [
          `Category pages should route users to their posts, and each post should offer a direct path back to its category and to the blog index.`,
          `Add contextual links between related posts and update older posts with references to newer relevant content.`,
        ],
      },
      {
        id: "metadata",
        heading: "Validate metadata, canonical tags, and hreflang alternates",
        paragraphs: [
          `Multilingual blogs need explicit language alternates between Arabic and English versions of each category and post.`,
          `Correct canonicals and language alternates reduce indexing conflicts and improve the quality of search appearance.`,
        ],
      },
      {
        id: "cadence",
        heading: "Turn audits into a cadence, not a one-time task",
        paragraphs: [
          `Run a lightweight technical review weekly and a deeper review monthly.`,
          `Track recurring issues and mean time to fix. Stable improvement comes from reducing repeated problems over time.`,
        ],
      },
    ],

    takeaways: [
      "Confirm indexing health before deeper optimization work.",
      "Image and asset optimization usually delivers fast UX gains.",
      "Category-to-post navigation improves both UX and crawl clarity.",
      "Multilingual metadata consistency is essential.",
      "Continuous audits outperform one-off cleanup rounds.",
    ],

    media: [
      {
        id: "seo-hero",
        type: "image",
        src: "/blog/articles/seo-technical-audit-hero.svg",
        alt: "SEO technical audit workflow",
        caption: "A practical SEO audit workflow for content-heavy websites.",
        afterSection: "indexing",
      },
    ],

    relatedSlugs: [
      "how-we-fixed-allwdbook-loading-flash",
      "from-simple-idea-to-real-platform",
    ],
  },
};

export default seoTechnicalAuditPlaybookForContentSites;
