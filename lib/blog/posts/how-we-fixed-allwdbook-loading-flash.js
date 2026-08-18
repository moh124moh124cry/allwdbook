// lib/blog/posts/how-we-fixed-allwdbook-loading-flash.js

const howWeFixedAllwdbookLoadingFlash = {
  slug:
    "how-we-fixed-allwdbook-loading-flash",

  ar: {
    intro: `من أكثر المشكلات إزعاجًا في واجهات الويب تلك التي لا تمنع الموقع من العمل، لكنها تجعل المستخدم يشعر فورًا أن هناك شيئًا غير مستقر.

هذا بالضبط ما حدث في الصفحة الرئيسية لـ AllWDbook. كانت الصفحة تفتح وتعمل، لكن عند التحميل كان يظهر وميض بصري قصير قبل استقرار التصميم. في بعض اللحظات كان المستخدم يرى المحتوى قبل أن تكتمل الهيئة البصرية النهائية للصفحة.

المشكلة لم تكن في الأدوات نفسها، ولا في نظام الدفع أو الوصول، ولا في البيانات. كانت مرتبطة بالطريقة التي يتم بها تحميل جزء كبير من CSS الخاص بالصفحة الرئيسية.

بدل إضافة طبقات من الحلول المؤقتة لإخفاء الوميض، رجعنا إلى بنية الصفحة نفسها. والنتيجة كانت إصلاحًا أبسط وأكثر استقرارًا: نقل CSS الكبير من styled-jsx داخل الصفحة إلى ملف CSS مستقل يتم استيراده بصورة مباشرة.

هذه المقالة توثق المشكلة، طريقة التفكير فيها، ولماذا كان إصلاح السبب الحقيقي أفضل من إضافة patch آخر فوق الأعراض.`,

    sections: [
      {
        id:
          "what-the-user-saw",

        heading:
          "ما الذي كان يراه المستخدم؟",

        paragraphs: [
          `المشكلة كانت قصيرة زمنيًا، لكنها واضحة بصريًا. عند فتح الصفحة الرئيسية، كان جزء من المحتوى يظهر للحظة قبل أن تستقر الألوان والمسافات وبعض عناصر التصميم في شكلها النهائي.`,

          `مثل هذا النوع من المشكلات يعرف غالبًا باسم Flash of Unstyled Content أو FOUC. الفكرة ببساطة هي أن المتصفح يستطيع إظهار جزء من HTML قبل أن تكون قواعد التنسيق المطلوبة جاهزة بالشكل المتوقع.`,

          `المستخدم لا يحتاج إلى معرفة الاسم التقني للمشكلة حتى يشعر بها. بالنسبة إليه، الموقع يومض أو يعيد ترتيب نفسه للحظة عند الفتح.`,

          `ومع أن الصفحة تصبح طبيعية بعد ذلك مباشرة، فإن الانطباع الأول يتأثر، خصوصًا في صفحة رئيسية يُفترض أن تكون مدخلًا مستقرًا لبقية المنصة.`,
        ],
      },

      {
        id:
          "why-small-flash-mattered",

        heading:
          "لماذا كان وميض صغير مشكلة مهمة؟",

        paragraphs: [
          `من السهل تجاهل مشكلة تستمر جزءًا من الثانية، خاصة إذا كانت كل الوظائف تعمل بعد ذلك. لكن في واجهة رقمية، الاستقرار البصري جزء من جودة المنتج.`,

          `الصفحة الرئيسية في AllWDbook تحمل الشعار، الرسالة الأساسية، الوصول إلى الأدوات، والأزرار الرئيسية. أي اهتزاز أو وميض في هذه المنطقة يحدث في اللحظة التي يبني فيها الزائر أول انطباع عن المنصة.`,

          `كما أن المشكلة تصبح أكثر ملاحظة على بعض الهواتف أو الاتصالات التي تستغرق وقتًا أطول قليلًا في تحميل الموارد.`,

          `لذلك لم يكن الهدف جعل الاختبار التقني ينجح فقط. كان الهدف أن تبدأ الصفحة بالشكل الصحيح من أول إطار يراه المستخدم قدر الإمكان.`,
        ],
      },

      {
        id:
          "first-place-to-investigate",

        heading:
          "بدأنا من مكان التنسيق نفسه",

        paragraphs: [
          `عندما تظهر مشكلة أثناء التحميل، توجد أسباب كثيرة محتملة: JavaScript، الخطوط، الصور، المكونات، hydration، أو CSS. ولهذا فإن إضافة حل عشوائي قد تخفي العرض دون أن تفسر السبب.`,

          `في حالة AllWDbook كان من المهم النظر إلى الصفحة الرئيسية نفسها، لأنها كانت تحمل كمية كبيرة من التنسيق داخل المكون عبر styled-jsx global.`,

          `هذا يعني أن جزءًا كبيرًا من الشكل النهائي للصفحة كان مرتبطًا بكود المكون بدل أن يكون موجودًا في stylesheet مستقل يتم تحميله بصورة مباشرة ضمن بنية الصفحة.`,

          `هذه الملاحظة لم تعنِ تلقائيًا أن كل styled-jsx سيئ. المشكلة كانت في حجم واستخدام CSS عالمي كبير داخل صفحة رئيسية معقدة، وفي تأثير ذلك على لحظة ظهور الواجهة.`,
        ],
      },

      {
        id:
          "avoid-random-patches",

        heading:
          "لم نرد إخفاء المشكلة بحل بصري آخر",

        paragraphs: [
          `هناك حلول يمكن أن تجعل الوميض أقل وضوحًا دون معالجة سببه، مثل إخفاء الصفحة حتى اكتمال التحميل، أو إضافة overlay، أو تأخير إظهار أجزاء من المحتوى.`,

          `هذه الحلول قد تعطي نتيجة سريعة، لكنها تضيف حالة تحميل جديدة فوق الصفحة. وإذا لم يكن السبب الحقيقي هو بطء البيانات، فإننا نكون قد أضفنا تعقيدًا جديدًا فقط لإخفاء مشكلة موجودة أصلًا في طريقة تقديم التنسيق.`,

          `في AllWDbook كان القرار هو تجنب إضافة شاشة انتظار لم نكن نحتاج إليها.`,

          `بدل ذلك، كان السؤال: هل يمكن جعل CSS الأساسي جزءًا أبسط وأكثر مباشرة من مسار تحميل الصفحة؟`,
        ],
      },

      {
        id:
          "move-css-out",

        heading:
          "الإصلاح: نقل CSS إلى ملف مستقل",

        paragraphs: [
          `تم استخراج تنسيقات الصفحة الرئيسية الكبيرة من styled-jsx global ووضعها في ملف مستقل باسم home.css داخل مجلد app.`,

          `بعد ذلك أصبحت الصفحة تستورد هذا الملف بصورة مباشرة، بدل حمل كتلة CSS عالمية كبيرة داخل المكون نفسه.`,

          `هذا التغيير لم يكن إعادة تصميم للصفحة. الألوان، الهوية، التخطيط، الأزرار والأدوات بقيت كما هي. الذي تغير هو مكان وطريقة تقديم قواعد التنسيق.`,

          `وهذه نقطة مهمة في الإصلاحات التقنية: عندما نستطيع حل مشكلة الأداء أو العرض دون تغيير تجربة المستخدم المستقرة، يكون نطاق التعديل أصغر ومخاطره أقل.`,
        ],
      },

      {
        id:
          "why-it-helped",

        heading:
          "لماذا أدى هذا التغيير إلى نتيجة أفضل؟",

        paragraphs: [
          `ملف CSS المستقل يمكن لـ Next.js التعامل معه كجزء واضح من موارد الصفحة، بدل انتظار معالجة كتلة تنسيق مرتبطة بمكون كبير في الواجهة.`,

          `النتيجة العملية في AllWDbook كانت اختفاء الوميض الذي كان يظهر عند فتح الصفحة، وأصبحت الواجهة تصل إلى شكلها النهائي بصورة أكثر استقرارًا.`,

          `كما أصبح فصل المسؤوليات أوضح: page.js مسؤول بدرجة أكبر عن بنية الصفحة ومنطقها، بينما home.css يحمل تنسيق الصفحة الرئيسية.`,

          `هذا لا يحسن لحظة التحميل فقط، بل يجعل الصيانة لاحقًا أسهل لأن تعديلات الشكل لا تحتاج إلى البحث داخل كتلة ضخمة من JavaScript.`,
        ],
      },

      {
        id:
          "clean-related-css",

        heading:
          "تنظيف ما حول الإصلاح كان مهمًا أيضًا",

        paragraphs: [
          `بعد نقل التنسيق الأساسي، كان من المهم ألا تبقى حلول قديمة أو قواعد مكررة تحاول حل المشكلة نفسها من أماكن متعددة.`,

          `تم الحفاظ على globals.css للقواعد العامة الحقيقية، بينما بقيت قواعد الصفحة الرئيسية في home.css. هذا الفصل يقلل احتمال وجود قواعد متنافسة أو تعديلات غير واضحة المصدر.`,

          `كما أن تجنب إعادة إضافة overlays أو ملفات انتقال غير ضرورية حافظ على مسار التحميل بسيطًا.`,

          `كلما كان لدينا مصدر واضح لكل نوع من التنسيق، أصبح تشخيص أي مشكلة مستقبلية أسهل.`,
        ],
      },

      {
        id:
          "performance-without-breaking-product",

        heading:
          "تحسين السرعة دون العبث بوظائف المنتج",

        paragraphs: [
          `أحد المبادئ المهمة في هذا الإصلاح كان عدم توسيع نطاق التغيير إلى أجزاء لا علاقة لها بالمشكلة.`,

          `لم نكن بحاجة إلى تعديل الدفع أو نظام الوصول أو الأدوات أو API أو المحتوى. المشكلة كانت في الصفحة الرئيسية وتقديم CSS، لذلك بقي الإصلاح داخل هذا النطاق.`,

          `هذا النوع من الحدود مهم جدًا في مشروع يعمل فعليًا. كل تعديل إضافي غير ضروري يضيف فرصة جديدة لظهور خطأ بعيد عن المشكلة الأصلية.`,

          `الإصلاح الجيد ليس الأكبر. الإصلاح الجيد هو الذي يعالج السبب بأقل مساحة تغيير ممكنة مع نتيجة يمكن ملاحظتها والتحقق منها.`,
        ],
      },

      {
        id:
          "diagnosis-lesson",

        heading:
          "الدرس: شخّص قبل أن تضيف patch",

        paragraphs: [
          `هذه المشكلة أصبحت مثالًا مفيدًا داخل تطوير AllWDbook على الفرق بين معالجة العرض ومعالجة السبب.`,

          `لو أضفنا شاشة تحميل فوق الصفحة، ربما اختفى الوميض عن العين، لكن بنية تحميل CSS لم تكن ستتغير. كنا سنملك مشكلتين: التنسيق المتأخر وحالة تحميل إضافية.`,

          `عندما نقلنا CSS نفسه، استهدفنا الجزء المرتبط مباشرة بما يحدث في اللحظة التي تظهر فيها الصفحة.`,

          `لهذا أصبح التشخيص قبل التعديل قاعدة عملية: حدد أين يبدأ السلوك غير المرغوب، اختبر الفرضية، ثم غيّر أقل عدد ممكن من الأشياء.`,
        ],
      },

      {
        id:
          "lesson",

        heading:
          "ما الذي تعلمناه من مشكلة الوميض؟",

        paragraphs: [
          `المشكلات الصغيرة في الواجهة يمكن أن تكشف قرارات بنيوية أكبر. وميض يستمر لحظة واحدة قاد إلى تحسين طريقة تنظيم CSS في الصفحة الرئيسية.`,

          `كما أكد أن الأداء ليس دائمًا مسألة ضغط صور أو تقليل طلبات الشبكة فقط. أحيانًا تكون المشكلة في توقيت وصول التنسيق الأساسي إلى المتصفح.`,

          `والأهم أن إصلاح الأداء لا يحتاج إلى إعادة بناء المنتج بالكامل. في هذه الحالة، إعادة تنظيم مكان CSS كانت كافية لإحداث فرق واضح.`,

          `بالنسبة إلى AllWDbook، أصبحت النتيجة صفحة رئيسية أكثر ثباتًا عند الفتح، وبنية تنسيق أوضح يمكن البناء عليها في التطويرات القادمة.`,
        ],
      },
    ],

    takeaways: [
      "الوميض أثناء التحميل قد يكون مشكلة في تقديم CSS وليس في البيانات أو الأدوات.",
      "إخفاء الصفحة مؤقتًا ليس بديلًا عن تشخيص السبب الحقيقي.",
      "نقل CSS الكبير إلى ملف مستقل يمكن أن يحسن استقرار العرض ويبسّط الصيانة.",
      "الإصلاحات الآمنة تحافظ على نطاق صغير ولا تغيّر وظائف لا علاقة لها بالمشكلة.",
      "التشخيص قبل إضافة patches يقلل التعقيد والمشكلات المستقبلية.",
    ],

    media: [],

    relatedSlugs: [
      "from-simple-idea-to-real-platform",
      "how-allwdbook-visual-identity-was-designed",
      "how-we-made-allwdbook-faster-without-changing-tools",
      "diagnose-real-technical-problem-without-random-patches",
    ],
  },

  en: {
    intro: `Some of the most frustrating web interface problems do not stop a site from working. Instead, they make the product feel unstable during the first moment a visitor sees it.

That happened on the AllWDbook homepage. The page loaded and the tools still worked, but a brief visual flash appeared before the final styling settled. For a moment, parts of the page could become visible before the complete visual presentation was ready.

The problem was not caused by the publishing tools, payments, access logic, or application data. It was connected to how a large amount of homepage CSS was being delivered.

Rather than adding another loading layer to hide the symptom, we went back to the structure of the homepage itself. The eventual fix was simpler and more durable: moving the large global styled-jsx block out of the page component and into a dedicated CSS file imported directly by the page.

This article documents the problem, the reasoning behind the diagnosis, and why fixing the underlying cause was better than adding another patch over the symptom.`,

    sections: [
      {
        id:
          "what-the-user-saw",

        heading:
          "What the user actually saw",

        paragraphs: [
          `The issue was brief, but visually noticeable. When the homepage opened, parts of the content could appear for a moment before colors, spacing, and other visual rules reached their final state.`,

          `This type of behavior is commonly described as a Flash of Unstyled Content, or FOUC. In simple terms, the browser can display HTML before all of the styling required for the final presentation is available in the expected way.`,

          `A visitor does not need to know the technical name to notice the problem. From their point of view, the site simply flashes or rearranges itself during loading.`,

          `Even if everything becomes normal immediately afterward, that first moment matters on a homepage that acts as the main entrance to the platform.`,
        ],
      },

      {
        id:
          "why-small-flash-mattered",

        heading:
          "Why a small flash still mattered",

        paragraphs: [
          `It is easy to ignore an issue that lasts only a fraction of a second, especially when every feature works afterward. But visual stability is part of product quality.`,

          `The AllWDbook homepage carries the logo, primary message, tool navigation, and major calls to action. A visual jump in that area occurs at exactly the moment a visitor is forming a first impression.`,

          `The issue can also become more noticeable on certain phones or slower connections where resources do not arrive at exactly the same speed.`,

          `The goal therefore was not simply to pass a technical test. It was to make the homepage appear in its intended form as consistently as possible from the first visible frame.`,
        ],
      },

      {
        id:
          "first-place-to-investigate",

        heading:
          "We started by investigating the styling path",

        paragraphs: [
          `Loading problems can have many possible causes: JavaScript, fonts, images, components, hydration, or CSS. Adding a random fix can hide the symptom without explaining the behavior.`,

          `In AllWDbook, attention turned to the homepage itself because a large amount of its styling was included inside the component through global styled-jsx.`,

          `That meant an important portion of the page's final presentation was tied to component code instead of living in a dedicated stylesheet loaded as a clear part of the page structure.`,

          `This does not mean styled-jsx is automatically a problem. The relevant issue was the size and global nature of the CSS inside a large homepage component and how that affected the initial visual presentation.`,
        ],
      },

      {
        id:
          "avoid-random-patches",

        heading:
          "We did not want another visual patch",

        paragraphs: [
          `There are several ways to make a loading flash less visible without correcting its source. A page can be hidden until loading finishes, an overlay can be added, or content can be intentionally delayed.`,

          `Those approaches may produce a quick visual result, but they also introduce a new loading state. If the underlying problem is not slow data, that extra layer only adds complexity over the existing issue.`,

          `For AllWDbook, the decision was to avoid adding a waiting screen that the product did not actually need.`,

          `The more useful question was whether the core homepage CSS could become a simpler and more direct part of the loading path.`,
        ],
      },

      {
        id:
          "move-css-out",

        heading:
          "The fix: moving CSS into a dedicated file",

        paragraphs: [
          `The large homepage styles were extracted from global styled-jsx and moved into a dedicated home.css file inside the app directory.`,

          `The homepage then imported that stylesheet directly instead of carrying a large global CSS block inside the component.`,

          `This was not a homepage redesign. The colors, identity, layout, buttons, and tools remained the same. What changed was where and how the styling rules were delivered.`,

          `That distinction matters in technical fixes. When a loading problem can be solved without changing stable user-facing behavior, the change remains easier to control and verify.`,
        ],
      },

      {
        id:
          "why-it-helped",

        heading:
          "Why the change helped",

        paragraphs: [
          `A dedicated stylesheet gives Next.js a clearer CSS resource to include with the page rather than relying on a large block of global styling attached to a complex component.`,

          `In AllWDbook, the practical result was that the visible loading flash disappeared and the homepage reached its final visual state more consistently.`,

          `The separation also improved organization. page.js became more focused on page structure and behavior, while home.css became responsible for the homepage presentation.`,

          `That helps maintenance as well. Future visual adjustments no longer require navigating a very large block of CSS embedded inside JavaScript.`,
        ],
      },

      {
        id:
          "clean-related-css",

        heading:
          "Cleaning the surrounding CSS mattered too",

        paragraphs: [
          `After moving the main styling, it was important not to leave older workarounds or duplicate rules trying to solve the same problem from several places.`,

          `Global rules remained in globals.css where they were genuinely global, while homepage-specific styling stayed in home.css. That separation reduces the chance of competing or difficult-to-trace rules.`,

          `Avoiding unnecessary loading overlays and transition files also kept the loading path simpler.`,

          `The clearer the ownership of each style rule becomes, the easier future interface problems are to diagnose.`,
        ],
      },

      {
        id:
          "performance-without-breaking-product",

        heading:
          "Improving performance without disturbing the product",

        paragraphs: [
          `An important principle in this fix was keeping the scope limited to the part of the product that was actually involved.`,

          `There was no reason to modify payments, access logic, publishing tools, APIs, or content. The problem concerned the homepage and its CSS delivery, so the fix stayed within that boundary.`,

          `That kind of discipline matters in a working product. Every unrelated change creates another opportunity for a regression somewhere far from the original issue.`,

          `A good fix is not necessarily a large fix. It is one that addresses the cause with the smallest reasonable change and produces a result that can be observed and verified.`,
        ],
      },

      {
        id:
          "diagnosis-lesson",

        heading:
          "The lesson: diagnose before adding patches",

        paragraphs: [
          `The loading flash became a useful example inside the development of AllWDbook of the difference between hiding a symptom and correcting its source.`,

          `If we had added a loading screen, the flash might have disappeared from view, but the CSS delivery structure would not have changed. We would simply have added another state on top of it.`,

          `Moving the CSS targeted the part of the page that was directly connected to what happened during the initial render.`,

          `That led to a practical rule for future debugging: identify where the unwanted behavior begins, test the most likely cause, and change as few unrelated things as possible.`,
        ],
      },

      {
        id:
          "lesson",

        heading:
          "What the loading flash taught us",

        paragraphs: [
          `Small interface problems can reveal larger structural decisions. A flash lasting only a moment led to a cleaner organization of the homepage styling.`,

          `It also reinforced that performance is not only about compressing images or reducing network requests. Sometimes the important issue is when essential styling becomes available to the browser.`,

          `Most importantly, a performance fix does not always require rebuilding the product. In this case, reorganizing where the CSS lived was enough to make a visible difference.`,

          `For AllWDbook, the result was a more stable homepage during loading and a clearer styling structure for future development.`,
        ],
      },
    ],

    takeaways: [
      "A loading flash can be caused by CSS delivery rather than application data or tools.",
      "Hiding a page during loading is not a substitute for diagnosing the underlying cause.",
      "Moving large homepage CSS into a dedicated stylesheet can improve visual stability and maintainability.",
      "Safer fixes keep a narrow scope and avoid changing unrelated working features.",
      "Diagnosis before patches helps prevent unnecessary complexity.",
    ],

    media: [],

    relatedSlugs: [
      "from-simple-idea-to-real-platform",
      "how-allwdbook-visual-identity-was-designed",
      "how-we-made-allwdbook-faster-without-changing-tools",
      "diagnose-real-technical-problem-without-random-patches",
    ],
  },
};

export default howWeFixedAllwdbookLoadingFlash;
