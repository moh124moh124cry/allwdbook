// lib/blog/articles.js

export const BLOG_ARTICLES = [
  {
    id: "allwdbook-why-created",
    slug: "why-i-created-allwdbook",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: true,
    featured: true,
    featuredOrder: 1,
    publishDate: "2026-08-18",
    readingTime: {
      ar: 7,
      en: 6,
    },
    heroImage: "/blog/allwdbook/hero.webp",
    toolPath: null,
    ar: {
      title: "لماذا أنشأت AllWDbook؟ المشكلة التي أردت حلها للناشرين",
      shortTitle: "لماذا أنشأت AllWDbook؟",
      description:
        "القصة وراء إنشاء AllWDbook، والمشكلة العملية التي دفعت إلى بناء منصة تجمع أدوات يحتاجها ناشرو الكتب والمنتجات الرقمية.",
    },
    en: {
      title: "Why I Created AllWDbook: The Problem I Wanted to Solve for Publishers",
      shortTitle: "Why I Created AllWDbook",
      description:
        "The story behind AllWDbook and the practical publishing problem that led to building a focused platform for digital publishers.",
    },
  },

  {
    id: "allwdbook-from-idea-to-platform",
    slug: "from-simple-idea-to-real-platform",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: false,
    featured: true,
    featuredOrder: 2,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 7,
    },
    heroImage: "/blog/allwdbook/from-simple-idea-to-real-platform.webp",
    toolPath: null,
    ar: {
      title: "من فكرة بسيطة إلى منصة حقيقية: كيف بدأ بناء AllWDbook",
      shortTitle: "من فكرة بسيطة إلى منصة حقيقية",
      description:
        "نظرة عملية على المراحل الأولى لبناء AllWDbook، من تحديد المشكلة إلى تحويل الفكرة إلى منصة تعمل فعليًا على الويب.",
    },
    en: {
      title: "From a Simple Idea to a Real Platform: How AllWDbook Started",
      shortTitle: "From Idea to Real Platform",
      description:
        "A practical look at the early stages of AllWDbook, from identifying the problem to turning the idea into a functioning web platform.",
    },
  },

  {
    id: "allwdbook-visual-identity",
    slug: "how-allwdbook-visual-identity-was-designed",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 6,
      en: 6,
    },
    heroImage: "/blog/allwdbook/visual-identity.webp",
    toolPath: null,
    ar: {
      title: "كيف صممنا الهوية البصرية لـAllWDbook",
      shortTitle: "تصميم هوية AllWDbook",
      description:
        "كيف تم اختيار الطابع الأسود والبحري والبرتقالي وبناء هوية بصرية متناسقة مع طبيعة أدوات AllWDbook وتجربة الاستخدام على الهاتف.",
    },
    en: {
      title: "How We Designed the AllWDbook Visual Identity",
      shortTitle: "Designing AllWDbook's Identity",
      description:
        "How the black, night-navy, and orange identity was shaped to match AllWDbook's publishing tools and mobile-first experience.",
    },
  },

  {
    id: "allwdbook-fouc-fix",
    slug: "how-we-fixed-allwdbook-loading-flash",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: false,
    featured: true,
    featuredOrder: 3,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 7,
    },
    heroImage: "/blog/allwdbook/loading-flash-before-after.webp",
    toolPath: null,
    ar: {
      title: "المشكلة التي جعلت AllWDbook يومض عند التحميل وكيف أصلحناها",
      shortTitle: "مشكلة الوميض وكيف أصلحناها",
      description:
        "دراسة تقنية حقيقية لمشكلة FOUC التي ظهرت عند تحميل الصفحة، وكيف أدى نقل CSS من styled-jsx إلى ملف مستقل إلى حلها.",
    },
    en: {
      title: "The Loading Flash Problem in AllWDbook and How We Fixed It",
      shortTitle: "How We Fixed the Loading Flash",
      description:
        "A real technical case study of the FOUC issue that appeared during page load and how extracting CSS into a dedicated file solved it.",
    },
  },

  {
    id: "allwdbook-access-system",
    slug: "allwdbook-access-without-forced-account",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: false,
    featured: true,
    featuredOrder: 4,
    publishDate: null,
    readingTime: {
      ar: 7,
      en: 7,
    },
    heroImage: "/blog/allwdbook/access-key-system.webp",
    toolPath: "/subscription",
    ar: {
      title: "كيف يعمل نظام الوصول في AllWDbook بدون فرض إنشاء حساب",
      shortTitle: "نظام الوصول بدون فرض حساب",
      description:
        "لماذا اختير نظام AWD-KEY بدل فرض التسجيل بالبريد وكلمة المرور، وكيف يمكن للمستخدم استعادة الوصول على جهاز جديد.",
    },
    en: {
      title: "How AllWDbook Access Works Without Forcing Account Creation",
      shortTitle: "Access Without a Forced Account",
      description:
        "Why AllWDbook uses an AWD-KEY access model instead of mandatory email-password accounts, including access restoration on a new device.",
    },
  },

  {
    id: "allwdbook-60-day-build",
    slug: "60-days-building-allwdbook-before-monetization",
    category: "allwdbook",
    series: "AllWDbook Build Journal",
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 7,
      en: 7,
    },
    heroImage: "/blog/allwdbook/60-day-build-journal.webp",
    toolPath: null,
    ar: {
      title: "60 يومًا من بناء AllWDbook قبل مرحلة تحقيق الدخل",
      shortTitle: "60 يومًا من بناء AllWDbook",
      description:
        "خطة تحريرية وعملية لاستثمار الفترة الأولى بعد الإطلاق في تحسين المنصة وبناء محتوى أصلي قبل التوسع في تحقيق الدخل.",
    },
    en: {
      title: "60 Days of Building AllWDbook Before the Monetization Stage",
      shortTitle: "60 Days Building AllWDbook",
      description:
        "An editorial and product-building strategy for using the first post-launch period to improve the platform and create original content.",
    },
  },

  {
    id: "kdp-keyword-research",
    slug: "kdp-keyword-research-with-allwdbook",
    category: "kdp",
    series: null,
    published: false,
    featured: true,
    featuredOrder: 5,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/kdp/kdp-keyword-research.webp",
    toolPath: "/keywords",
    ar: {
      title: "كيف أبحث عن كلمات مفتاحية لكتاب KDP باستخدام AllWDbook",
      shortTitle: "البحث عن كلمات KDP",
      description:
        "خطوات عملية للانتقال من فكرة كتاب أولية إلى مجموعة كلمات مفتاحية منظمة يمكن تقييمها واستخدامها في مشروع KDP.",
    },
    en: {
      title: "How to Research KDP Keywords with AllWDbook",
      shortTitle: "KDP Keyword Research",
      description:
        "A practical workflow for moving from an initial book idea to an organized set of keywords that can be evaluated for a KDP project.",
    },
  },

  {
    id: "kdp-micro-niche",
    slug: "from-broad-idea-to-micro-niche",
    category: "kdp",
    series: null,
    published: false,
    featured: true,
    featuredOrder: 6,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/kdp/micro-niche-workflow.webp",
    toolPath: "/micro_niche",
    ar: {
      title: "من فكرة عامة إلى Micro Niche: تجربة عملية داخل AllWDbook",
      shortTitle: "Micro Niche داخل AllWDbook",
      description:
        "تجربة عملية توضح كيف يمكن تضييق موضوع واسع تدريجيًا حتى الوصول إلى Micro Niche أكثر تحديدًا وقابلية للدراسة.",
    },
    en: {
      title: "From a Broad Idea to a Micro Niche: A Practical AllWDbook Workflow",
      shortTitle: "Micro Niche in AllWDbook",
      description:
        "A practical example showing how to narrow a broad topic step by step into a more focused and researchable micro niche.",
    },
  },

  {
    id: "kdp-cover-concept",
    slug: "prepare-book-cover-idea-before-design",
    category: "kdp",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 7,
      en: 7,
    },
    heroImage: "/blog/kdp/book-cover-concept.webp",
    toolPath: "/cover",
    ar: {
      title: "كيف أجهز فكرة غلاف كتاب قبل بدء التصميم",
      shortTitle: "تجهيز فكرة غلاف الكتاب",
      description:
        "منهج عملي لتحديد فكرة الغلاف والرسالة والعناصر البصرية قبل الدخول في مرحلة التصميم الفعلية.",
    },
    en: {
      title: "How to Prepare a Book Cover Concept Before Designing",
      shortTitle: "Preparing a Book Cover Concept",
      description:
        "A practical method for defining the cover idea, message, and visual direction before starting the actual design process.",
    },
  },

  {
    id: "kdp-pricing-roi",
    slug: "book-pricing-and-profitability-before-publishing",
    category: "kdp",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/kdp/pricing-profitability.webp",
    toolPath: null,
    ar: {
      title: "التسعير والعائد: كيف أحسب جدوى الكتاب قبل النشر",
      shortTitle: "التسعير وجدوى الكتاب",
      description:
        "كيف يمكن التفكير في السعر والتكاليف والهامش والعائد المتوقع قبل اتخاذ قرار نشر كتاب رقمي أو مطبوع.",
    },
    en: {
      title: "Pricing and Returns: How to Evaluate a Book Before Publishing",
      shortTitle: "Book Pricing and Profitability",
      description:
        "How to think about price, costs, margins, and expected returns before deciding to publish a digital or print book.",
    },
  },

  {
    id: "kdp-book-description",
    slug: "turn-basic-book-description-into-publish-ready-copy",
    category: "kdp",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 7,
      en: 7,
    },
    heroImage: "/blog/kdp/book-description.webp",
    toolPath: null,
    ar: {
      title: "كيف أحول وصف كتاب عادي إلى وصف منظم وجاهز للنشر",
      shortTitle: "تحسين وصف الكتاب",
      description:
        "طريقة عملية لإعادة تنظيم وصف الكتاب ليصبح أوضح وأكثر قابلية للقراءة وأكثر ملاءمة لصفحة المنتج.",
    },
    en: {
      title: "How to Turn a Basic Book Description into Publish-Ready Copy",
      shortTitle: "Improving a Book Description",
      description:
        "A practical way to restructure a book description so it becomes clearer, easier to read, and better suited to a product page.",
    },
  },

  {
    id: "kdp-full-workflow",
    slug: "niche-to-keywords-to-book-workflow",
    category: "kdp",
    series: null,
    published: false,
    featured: true,
    featuredOrder: 7,
    publishDate: null,
    readingTime: {
      ar: 10,
      en: 10,
    },
    heroImage: "/blog/kdp/full-kdp-workflow.webp",
    toolPath: null,
    ar: {
      title: "من النيتش إلى الكلمات المفتاحية إلى الكتاب: Workflow كامل في AllWDbook",
      shortTitle: "Workflow كامل من النيتش إلى الكتاب",
      description:
        "مسار عملي متكامل يربط اكتشاف النيتش بالبحث عن الكلمات المفتاحية وتطوير فكرة الكتاب بصورة منظمة.",
    },
    en: {
      title: "From Niche to Keywords to Book: A Complete AllWDbook Workflow",
      shortTitle: "Complete Niche-to-Book Workflow",
      description:
        "A complete practical workflow connecting niche discovery, keyword research, and structured book idea development.",
    },
  },

  {
    id: "seo-www-domain",
    slug: "why-www-allwdbook-com-is-the-canonical-domain",
    category: "seo",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 6,
      en: 6,
    },
    heroImage: "/blog/seo/www-canonical-domain.webp",
    toolPath: null,
    ar: {
      title: "لماذا اخترنا www.allwdbook.com كعنوان رسمي للموقع",
      shortTitle: "لماذا اخترنا www.allwdbook.com",
      description:
        "شرح قرار اعتماد نطاق www كعنوان رسمي واحد للموقع، ودور إعادة التوجيه في منع تعدد النسخ المتاحة من نفس المحتوى.",
    },
    en: {
      title: "Why We Chose www.allwdbook.com as the Official Site Address",
      shortTitle: "Why We Chose www.allwdbook.com",
      description:
        "Why AllWDbook uses one official www domain and how redirects help prevent multiple accessible versions of the same site.",
    },
  },

  {
    id: "seo-sitemap-robots-canonical",
    slug: "allwdbook-sitemap-robots-canonical-setup",
    category: "seo",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/seo/sitemap-robots-canonical.webp",
    toolPath: null,
    ar: {
      title: "كيف أعددنا Sitemap وRobots وCanonical لموقع AllWDbook",
      shortTitle: "Sitemap وRobots وCanonical",
      description:
        "كيف تم تنظيم الإشارات الأساسية لمحركات البحث داخل AllWDbook باستخدام Sitemap وRobots وCanonical بصورة متناسقة.",
    },
    en: {
      title: "How We Set Up Sitemap, Robots, and Canonical URLs for AllWDbook",
      shortTitle: "Sitemap, Robots, and Canonical",
      description:
        "How AllWDbook's core search-engine signals were organized using a sitemap, robots configuration, and canonical URLs.",
    },
  },

  {
    id: "seo-performance",
    slug: "how-we-made-allwdbook-faster-without-changing-tools",
    category: "seo",
    series: null,
    published: false,
    featured: true,
    featuredOrder: 8,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/seo/allwdbook-performance.webp",
    toolPath: null,
    ar: {
      title: "كيف جعلنا AllWDbook أسرع بدون تغيير وظائف الأدوات",
      shortTitle: "كيف جعلنا AllWDbook أسرع",
      description:
        "تحسين الأداء من خلال معالجة طريقة تحميل الأنماط بدل تغيير منطق الأدوات أو المساس بتجربة الدفع والاستخدام.",
    },
    en: {
      title: "How We Made AllWDbook Faster Without Changing Tool Behavior",
      shortTitle: "How We Made AllWDbook Faster",
      description:
        "How performance improved by fixing stylesheet delivery instead of changing tool logic, payment behavior, or user workflows.",
    },
  },

  {
    id: "seo-bilingual",
    slug: "building-arabic-english-site-without-confusing-google",
    category: "seo",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 9,
      en: 9,
    },
    heroImage: "/blog/seo/bilingual-seo.webp",
    toolPath: null,
    ar: {
      title: "كيف نبني موقعًا عربيًا وإنجليزيًا بدون إرباك Google",
      shortTitle: "SEO لموقع عربي وإنجليزي",
      description:
        "لماذا يجب أن تكون لكل لغة روابط واضحة ومستقلة، وكيف تساعد Canonical وhreflang في تنظيم المحتوى ثنائي اللغة.",
    },
    en: {
      title: "How to Build an Arabic-English Website Without Confusing Google",
      shortTitle: "SEO for a Bilingual Website",
      description:
        "Why each language should have clear independent URLs and how canonical and hreflang signals help organize bilingual content.",
    },
  },

  {
    id: "seo-original-content",
    slug: "building-original-content-instead-of-repetitive-blog-posts",
    category: "seo",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/seo/original-content.webp",
    toolPath: null,
    ar: {
      title: "كيف نبني محتوى أصليًا بدل ملء المدونة بمقالات مكررة",
      shortTitle: "بناء محتوى أصلي",
      description:
        "منهج تحريري يعتمد على التجارب والصور والنتائج الحقيقية بدل نشر مقالات متشابهة لا تضيف قيمة جديدة للقارئ.",
    },
    en: {
      title: "How to Build Original Content Instead of Filling a Blog with Repetitive Posts",
      shortTitle: "Building Original Content",
      description:
        "An editorial approach based on real experiences, screenshots, and outcomes instead of repetitive articles that add little new value.",
    },
  },

  {
    id: "seo-adsense-preparation",
    slug: "prepare-new-site-for-adsense-without-sacrificing-quality",
    category: "seo",
    series: null,
    published: false,
    featured: true,
    featuredOrder: 9,
    publishDate: null,
    readingTime: {
      ar: 9,
      en: 9,
    },
    heroImage: "/blog/seo/adsense-preparation.webp",
    toolPath: null,
    ar: {
      title: "كيف أجهز موقعًا جديدًا لمرحلة AdSense بدون التضحية بجودة المحتوى",
      shortTitle: "تجهيز الموقع لمرحلة AdSense",
      description:
        "كيف يمكن الاستعداد لتحقيق الدخل عبر التركيز أولًا على جودة الموقع والمحتوى وتجربة المستخدم بدل بناء الموقع حول الإعلانات.",
    },
    en: {
      title: "How to Prepare a New Website for AdSense Without Sacrificing Content Quality",
      shortTitle: "Preparing a Site for AdSense",
      description:
        "How to prepare for monetization by prioritizing site quality, original content, and user experience instead of building around ads.",
    },
  },

  {
    id: "creator-real-problem-product",
    slug: "turn-real-problem-into-digital-product",
    category: "creator",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/creator/problem-to-product.webp",
    toolPath: null,
    ar: {
      title: "كيف تحول مشكلة حقيقية إلى فكرة منتج رقمي",
      shortTitle: "من المشكلة إلى المنتج",
      description:
        "طريقة عملية تبدأ بالمشكلة الفعلية للمستخدم وتنتهي بفكرة منتج رقمي محددة بدل البدء بفكرة عامة تبحث عن مشكلة.",
    },
    en: {
      title: "How to Turn a Real Problem into a Digital Product Idea",
      shortTitle: "From Problem to Product",
      description:
        "A practical process that starts with a real user problem and develops it into a focused digital product idea.",
    },
  },

  {
    id: "creator-github-vercel",
    slug: "building-real-project-with-github-and-vercel",
    category: "creator",
    series: null,
    published: false,
    featured: true,
    featuredOrder: 10,
    publishDate: null,
    readingTime: {
      ar: 9,
      en: 9,
    },
    heroImage: "/blog/creator/github-vercel-workflow.webp",
    toolPath: null,
    ar: {
      title: "كيف أستخدم GitHub وVercel لبناء وتحديث مشروع حقيقي",
      shortTitle: "GitHub وVercel في مشروع حقيقي",
      description:
        "تجربة عملية في إدارة ملفات المشروع عبر GitHub ونشر التحديثات على Vercel مع تقليل التغييرات الواسعة والمخاطر غير الضرورية.",
    },
    en: {
      title: "How I Use GitHub and Vercel to Build and Update a Real Project",
      shortTitle: "GitHub and Vercel in a Real Project",
      description:
        "A practical workflow for managing project files in GitHub and deploying updates through Vercel while minimizing risky broad changes.",
    },
  },

  {
    id: "creator-mobile-first",
    slug: "why-allwdbook-was-designed-mobile-first",
    category: "creator",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 7,
      en: 7,
    },
    heroImage: "/blog/creator/mobile-first.webp",
    toolPath: null,
    ar: {
      title: "لماذا صممنا AllWDbook للهاتف أولًا",
      shortTitle: "لماذا AllWDbook Mobile-First",
      description:
        "كيف يؤثر الاستخدام الفعلي للهاتف في قرارات التصميم والتنقل وحجم العناصر وترتيب المعلومات داخل منصة أدوات رقمية.",
    },
    en: {
      title: "Why We Designed AllWDbook Mobile-First",
      shortTitle: "Why AllWDbook Is Mobile-First",
      description:
        "How real mobile usage shapes decisions about navigation, element sizing, information hierarchy, and tool interaction.",
    },
  },

  {
    id: "creator-pricing",
    slug: "how-to-think-about-small-digital-product-pricing",
    category: "creator",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/creator/digital-product-pricing.webp",
    toolPath: "/subscription",
    ar: {
      title: "كيف تفكر في تسعير منتج رقمي صغير",
      shortTitle: "تسعير منتج رقمي صغير",
      description:
        "كيف يمكن الموازنة بين قيمة الأداة وسهولة الدخول إليها والاشتراك الشهري والخطط الأطول عند تسعير منتج رقمي صغير.",
    },
    en: {
      title: "How to Think About Pricing a Small Digital Product",
      shortTitle: "Pricing a Small Digital Product",
      description:
        "How to balance product value, accessibility, monthly subscriptions, and longer plans when pricing a small digital product.",
    },
  },

  {
    id: "creator-debugging",
    slug: "diagnose-real-technical-problem-without-random-patches",
    category: "creator",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 9,
      en: 9,
    },
    heroImage: "/blog/creator/technical-diagnosis.webp",
    toolPath: null,
    ar: {
      title: "كيف نشخص مشكلة تقنية حقيقية بدل إضافة ترقيعات عشوائية",
      shortTitle: "تشخيص المشكلة بدل الترقيع",
      description:
        "منهج عملي لعزل السبب الحقيقي للمشكلة التقنية قبل تعديل الملفات، مع الاستفادة من تجربة إصلاح مشكلة التحميل في AllWDbook.",
    },
    en: {
      title: "How to Diagnose a Real Technical Problem Instead of Adding Random Patches",
      shortTitle: "Diagnose Before Patching",
      description:
        "A practical method for isolating the real cause of a technical issue before editing files, based on a real AllWDbook debugging case.",
    },
  },

  {
    id: "creator-after-launch",
    slug: "what-happens-after-product-launch",
    category: "creator",
    series: null,
    published: false,
    featured: false,
    featuredOrder: null,
    publishDate: null,
    readingTime: {
      ar: 8,
      en: 8,
    },
    heroImage: "/blog/creator/after-launch.webp",
    toolPath: null,
    ar: {
      title: "ما الذي يحدث بعد إطلاق المنتج؟ القياس والتحسين والاستماع للمستخدم",
      shortTitle: "ماذا يحدث بعد الإطلاق؟",
      description:
        "الإطلاق ليس نهاية بناء المنتج؛ بل بداية دورة من القياس والملاحظة والتحسين واتخاذ قرارات مبنية على الاستخدام الحقيقي.",
    },
    en: {
      title: "What Happens After Product Launch? Measure, Improve, and Listen",
      shortTitle: "What Happens After Launch?",
      description:
        "Launching is not the end of product building. It begins a cycle of measurement, observation, improvement, and user-driven decisions.",
    },
  },
];

export const getAllBlogArticles = () =>
  BLOG_ARTICLES;

export const getPublishedBlogArticles = () =>
  BLOG_ARTICLES.filter(
    (article) => article.published
  );

export const getFeaturedBlogArticles = () =>
  BLOG_ARTICLES.filter(
    (article) =>
      article.featured &&
      article.published
  )
    .sort(
      (a, b) =>
        (a.featuredOrder ??
          Number.MAX_SAFE_INTEGER) -
        (b.featuredOrder ??
          Number.MAX_SAFE_INTEGER)
    )
    .slice(0, 10);

export const getBlogArticlesByCategory = (
  category
) =>
  BLOG_ARTICLES.filter(
    (article) =>
      article.category === category
  );

export const getBlogArticleBySlug = (
  slug
) =>
  BLOG_ARTICLES.find(
    (article) =>
      article.slug === slug
  ) ?? null;

export const getLocalizedBlogArticle = (
  article,
  lang = "en"
) => {
  if (!article) {
    return null;
  }

  const language =
    lang === "ar" ? "ar" : "en";

  return {
    ...article,
    lang: language,
    content: article[language],
  };
};

export const getBlogArticleUrl = (
  article,
  lang = "en"
) => {
  if (!article?.slug) {
    return null;
  }

  const language =
    lang === "ar" ? "ar" : "en";

  return `/${language}/blog/${article.slug}`;
};
