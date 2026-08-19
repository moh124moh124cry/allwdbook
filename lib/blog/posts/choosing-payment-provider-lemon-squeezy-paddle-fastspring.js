// lib/blog/posts/choosing-payment-provider-lemon-squeezy-paddle-fastspring.js

const choosingPaymentProvider = {
  slug:
    "choosing-payment-provider-lemon-squeezy-paddle-fastspring",

  ar: {
    intro: `اختيار بوابة الدفع لم يكن مجرد خطوة تقنية صغيرة في بناء AllWDbook.

عندما بدأت مرحلة التفكير في تحقيق الدخل، كان المطلوب أكثر من زر يدفع المستخدم من خلاله. كنا نحتاج إلى مزود دفع يمكن دمجه مع المنصة، والتعامل معه بصورة عملية، والمحافظة في الوقت نفسه على نظام الوصول الموجود بالفعل داخل AllWDbook.

بدأت الرحلة مع Lemon Squeezy، ثم وصلنا إلى مرحلة اضطررنا فيها إلى تجميد المدفوعات الجديدة أثناء انتظار التحقق. بعد ذلك درسنا Paddle وحاولنا استخدام بيئة Sandbox، لكن تجربة التسجيل والإعداد لم تكن مناسبة لمسار المشروع في تلك المرحلة. ومن هناك انتقل البحث إلى FastSpring، حيث ظهرت عقبة جديدة مرتبطة باستخدام بريد إلكتروني شخصي، ثم تم إرسال طلب استثناء وانتظار الرد.

هذه المقالة لا تحاول إعلان أن إحدى هذه الشركات هي الأفضل للجميع. إنها توثق تجربة حقيقية داخل AllWDbook، وكيف يمكن أن يتحول قرار يبدو بسيطًا مثل اختيار بوابة دفع إلى مجموعة من القرارات التقنية والتجارية وتجربة المستخدم.`,

    sections: [
      {
        id:
          "payment-provider-is-product-decision",

        heading:
          "بوابة الدفع ليست مجرد زر Checkout",

        paragraphs: [
          `عند النظر إلى بوابات الدفع من الخارج، يبدو القرار بسيطًا: نختار شركة، نضيف رابط الدفع، ثم يبدأ المستخدمون في الاشتراك.`,

          `لكن داخل منتج حقيقي توجد طبقات أخرى يجب أخذها في الاعتبار. كيف يتم تأكيد عملية الشراء؟ كيف تصل المنصة إلى معلومة أن المستخدم أصبح مدفوعًا؟ ماذا يحدث إذا تعطل مزود الدفع؟ وكيف نحافظ على حق مستخدم اشترى سابقًا إذا قررنا تغيير المزود لاحقًا؟`,

          `في AllWDbook كان هذا مهمًا بصورة خاصة لأن نظام الوصول لم يكن مرتبطًا فقط بصفحة Checkout. لدينا AWD-KEY والاستعادة وحالات وصول سابقة يجب ألا تتوقف لمجرد أن بوابة الدفع الجديدة لم تصبح جاهزة بعد.`,

          `لهذا أصبح قرار مزود الدفع قرارًا في بنية المنتج نفسه، وليس قرارًا منفصلًا عن بقية النظام.`,
        ],
      },

      {
        id:
          "starting-with-lemon-squeezy",

        heading:
          "البداية مع Lemon Squeezy",

        paragraphs: [
          `كان Lemon Squeezy جزءًا من أول بنية دفع تم إعدادها في AllWDbook. تم بناء التكامل بحيث تستطيع المنصة التعامل مع شراء الخطط ومنح الوصول للمستخدم بعد نجاح العملية.`,

          `وجود نظام يعمل بالفعل مهم جدًا في أي مشروع، لأن التكامل لا يمثل مجرد رابط خارجي. هناك مسارات داخل التطبيق تعتمد على النتيجة القادمة من مزود الدفع، وهناك مستخدمون قد يكون لديهم وصول سابق يجب الحفاظ عليه.`,

          `لكن مع تطور المشروع ظهرت مرحلة تحقق جعلت استمرار استقبال المدفوعات الجديدة غير مناسب مؤقتًا.`,

          `هنا كان القرار الأكثر أمانًا هو عدم محاولة تجاوز مرحلة التحقق، بل تجميد المدفوعات الجديدة حتى تصبح الصورة واضحة.`,
        ],
      },

      {
        id:
          "freezing-payments",

        heading:
          "تجميد المدفوعات دون تجميد المنتج",

        paragraphs: [
          `إيقاف استقبال عمليات شراء جديدة لا يجب أن يعني تعطيل الموقع بالكامل.`,

          `لذلك تم فصل حالة الدفع عن بقية AllWDbook. الأدوات المجانية بقيت تعمل، ونظام AWD-KEY بقي متاحًا، والاستعادة بقيت تعمل، كما لم يتم إلغاء الوصول الذي حصل عليه مستخدمون سابقون.`,

          `هذه النقطة أصبحت من أهم الدروس في بنية المشروع: مزود الدفع يجب ألا يكون نقطة فشل توقف المنتج كله.`,

          `إذا كانت كل وظائف المنصة مرتبطة مباشرة بحالة Checkout، فإن أي مشكلة في مزود خارجي قد تتحول إلى مشكلة لجميع المستخدمين، حتى الذين لا يحاولون الدفع أصلًا.`,
        ],
      },

      {
        id:
          "why-we-kept-old-integration",

        heading:
          "لماذا لم نحذف تكامل Lemon Squeezy القديم؟",

        paragraphs: [
          `عندما يبدأ البحث عن مزود جديد، قد يبدو حذف التكامل السابق وإعادة البناء من الصفر حلًا نظيفًا. لكنه لم يكن الخيار الصحيح في AllWDbook.`,

          `التكامل القديم يمثل جزءًا من تاريخ عمليات الوصول السابقة. وقد توجد بيانات أو معاملات أو مفاتيح وصول تم إنشاؤها عندما كان ذلك النظام يعمل.`,

          `حذف الكود لمجرد أننا نبحث عن بديل يمكن أن يجعل صيانة الوصول السابق أصعب، أو يقطع مسارات استعادة ما زالت مهمة للمستخدمين.`,

          `لذلك كان المبدأ هو الحفاظ على النظام القديم بما يخدم المستخدمين السابقين، وبناء أي مزود جديد للمدفوعات الجديدة بصورة منفصلة قدر الإمكان.`,
        ],
      },

      {
        id:
          "exploring-paddle",

        heading:
          "المحطة الثانية: تجربة Paddle",

        paragraphs: [
          `بعد تجميد المدفوعات الجديدة بدأ البحث عن بديل يمكن تجربته قبل اتخاذ قرار نهائي.`,

          `كان Paddle أحد الخيارات التي تمت دراستها، وكانت الفكرة أن نبدأ أولًا ببيئة اختبار Sandbox حتى لا نربط النظام الحقيقي قبل التأكد من طريقة العمل.`,

          `لكن تجربة التسجيل والوصول إلى بيئة الاختبار لم تكن بالوضوح الذي احتجناه في تلك المرحلة. بدل الدخول سريعًا إلى Sandbox والبدء في اختبار التكامل، أصبحت عملية الإعداد نفسها عائقًا.`,

          `وهنا اتخذنا قرارًا مهمًا: لا يجب أن نستمر في مزود فقط لأننا بدأنا معه. إذا كانت الخطوات الأولى تستهلك وقتًا أكبر من قيمتها للمشروع الحالي، فمن الطبيعي تقييم خيار آخر.`,
        ],
      },

      {
        id:
          "sandbox-lesson",

        heading:
          "بيئة Sandbox نفسها جزء من تقييم المزود",

        paragraphs: [
          `غالبًا ما تتم مقارنة بوابات الدفع بناءً على الرسوم أو قائمة المزايا، لكن تجربة المطور تبدأ قبل أول عملية دفع حقيقية.`,

          `وجود مسار اختبار مفهوم، ووثائق يمكن تطبيقها، وطريقة واضحة للانتقال من الاختبار إلى الإنتاج، كلها تؤثر مباشرة في تكلفة التكامل من ناحية الوقت.`,

          `في مشروع صغير أو متوسط، الوقت الذي يُصرف على فهم نظام معقد هو تكلفة حقيقية حتى إذا لم تظهر في فاتورة مالية.`,

          `تجربة Paddle ذكرتنا بأننا لا نختار المنتج النهائي فقط؛ نحن نختار أيضًا عملية التطوير والصيانة التي سنعيش معها بعد الإطلاق.`,
        ],
      },

      {
        id:
          "moving-to-fastspring",

        heading:
          "الانتقال إلى FastSpring",

        paragraphs: [
          `بعد تجربة Paddle انتقل البحث إلى FastSpring كخيار آخر يمكن تقييمه.`,

          `لكن هذه المرة ظهرت العقبة في مرحلة مبكرة جدًا: نموذج التواصل أو التسجيل لم يقبل البريد الشخصي المستخدم في البداية، وطُلب بريد عمل أو بريد مرتبط بنطاق تجاري.`,

          `بالنسبة إلى مشروع رقمي مستقل، هذه التفاصيل قد تبدو صغيرة، لكنها تؤثر فعليًا في قدرة صاحب المشروع على بدء العلاقة مع المزود.`,

          `بدل التوقف عند الرسالة الأولى، تم إرسال طلب استثناء إلى FastSpring لشرح الحالة والاستفسار عن إمكانية المتابعة.`,
        ],
      },

      {
        id:
          "fastspring-inquiry",

        heading:
          "طلب الاستثناء وانتظار الرد",

        paragraphs: [
          `بعد إرسال الطلب ظهرت رسالة تؤكد أن FastSpring استلم الاستفسار وأن الفريق سيتواصل لاحقًا.`,

          `في هذه المرحلة لم يكن من المنطقي كتابة تكامل جديد قبل معرفة ما إذا كان الحساب سيُقبل وما هي الخطوات التالية.`,

          `لذلك بقي الدفع في AllWDbook متوقفًا للعمليات الجديدة، بينما استمرت بقية المنصة في العمل بصورة مستقلة.`,

          `هذه المقالة تم إعدادها كتوثيق أثناء الرحلة. قبل نشرها نهائيًا سيتم تحديث هذا الجزء بنتيجة التواصل مع FastSpring، سواء تم اعتمادها كمزود جديد أو تم الانتقال إلى خيار آخر.`,
        ],
      },

      {
        id:
          "what-we-actually-compare",

        heading:
          "ما الذي نقارنه فعلًا عند اختيار مزود دفع؟",

        paragraphs: [
          `بعد المرور بهذه المراحل أصبح واضحًا أن المقارنة لا يجب أن تنحصر في سؤال واحد مثل: من يملك الرسوم الأقل؟`,

          `بالنسبة إلى AllWDbook أصبح التقييم يشمل سهولة بدء الحساب، وضوح عملية التحقق، سهولة الاختبار، تجربة التكامل، طريقة التعامل مع العمليات بعد الدفع، واستقرار العلاقة بين المزود ونظام الوصول داخل المنصة.`,

          `كما نحتاج إلى التفكير في تجربة المستخدم. عملية الدفع يجب أن تكون مفهومة ولا تجعل المشتري يشعر أنه خرج إلى مسار غريب أو غير مرتبط بالمنتج الذي كان يستخدمه.`,

          `وأخيرًا تأتي قابلية الصيانة: إذا احتجنا بعد عام إلى تغيير شيء في الخطط أو نظام الوصول، هل سيكون التكامل واضحًا بما يكفي لتعديله دون إعادة بناء المشروع؟`,
        ],
      },

      {
        id:
          "separate-payment-from-access",

        heading:
          "أهم قرار تقني: فصل الدفع عن حق الوصول",

        paragraphs: [
          `أهم نتيجة خرجنا بها من هذه الرحلة لم تكن اسم شركة معينة، بل مبدأ في تصميم AllWDbook.`,

          `الدفع هو حدث يمنح المستخدم حقًا معينًا، لكنه لا يجب أن يصبح الطريقة الوحيدة التي يعرف بها النظام أن هذا الحق موجود.`,

          `بعد نجاح عملية الشراء يمكن تسجيل الاستحقاق داخل نظام AllWDbook، ومن هناك تعمل AWD-KEY والاستعادة وبقية آليات الوصول بصورة مستقلة عن صفحة الدفع نفسها.`,

          `هذا الفصل يجعل تغيير مزود الدفع في المستقبل أقل خطورة، ويحمي المستخدم من فقدان الوصول بسبب تغييرات تجارية أو تقنية لا علاقة له بها.`,
        ],
      },

      {
        id:
          "no-rush-to-enable-payments",

        heading:
          "لماذا لا نستعجل إعادة تشغيل الدفع؟",

        paragraphs: [
          `من السهل الشعور بأن وجود زر شراء أهم من الانتظار، خصوصًا بعد أن تصبح المنصة جاهزة للاستخدام.`,

          `لكن تشغيل مدفوعات جديدة قبل التأكد من المزود والتكامل والاستعادة قد يخلق مشكلات أكبر من خسارة بعض المبيعات المؤقتة.`,

          `الأولوية هي أن تكون أول عملية دفع بعد إعادة التفعيل قابلة للتتبع والاستعادة، وأن يحصل المستخدم على ما دفع مقابله دون خطوات يدوية غامضة.`,

          `لهذا بقي قرار إعادة تفعيل الدفع منفصلًا عن تطوير الأدوات والمقالات وتحسين تجربة الموقع. المنتج يستمر في النمو، بينما بوابة الدفع تأخذ الوقت اللازم للوصول إلى حل مستقر.`,
        ],
      },

      {
        id:
          "lesson",

        heading:
          "ما الذي علمتنا إياه رحلة Lemon Squeezy وPaddle وFastSpring؟",

        paragraphs: [
          `اختيار مزود الدفع ليس مسابقة للعثور على اسم مثالي، بل عملية للعثور على الخيار المناسب لمرحلة المشروع وبنيته واحتياجات مستخدميه.`,

          `ما يعمل بصورة ممتازة لمشروع كبير قد يكون أكثر تعقيدًا من اللازم لمشروع في بدايته، وما يبدو سهلًا في البداية قد يصبح أقل ملاءمة عندما تبدأ متطلبات التحقق أو الاستعادة أو الصيانة.`,

          `كما أن تغيير المزود ليس فشلًا في التخطيط. أحيانًا يكون نتيجة طبيعية لأننا تعلمنا أكثر عن احتياجات المنتج أثناء البناء.`,

          `بالنسبة إلى AllWDbook ستنتهي هذه الرحلة فقط عندما نستطيع إعادة تشغيل المدفوعات الجديدة بثقة، مع الحفاظ على بساطة الاستخدام وحماية الوصول السابق.`,
        ],
      },
    ],

    takeaways: [
      "بوابة الدفع جزء من بنية المنتج وليست مجرد زر Checkout.",
      "يمكن إيقاف المدفوعات الجديدة دون تعطيل الأدوات المجانية أو الوصول السابق.",
      "لا يجب حذف تكامل قديم إذا كان ما يزال مرتبطًا بحقوق مستخدمين سابقين.",
      "سهولة Sandbox وتجربة المطور جزء من تقييم مزود الدفع.",
      "متطلبات التسجيل والتحقق قد تكون مهمة بقدر المزايا التقنية.",
      "الدفع وحق الوصول يجب أن يكونا طبقتين منفصلتين قدر الإمكان.",
      "عدم استعجال تفعيل الدفع أفضل من إطلاق تكامل غير مستقر.",
      "المقالة ستُحدّث بنتيجة تجربة FastSpring قبل نشرها النهائي.",
    ],

    media: [],

    relatedSlugs: [
      "why-i-created-allwdbook",
      "from-simple-idea-to-real-platform",
      "allwdbook-access-without-forced-account",
    ],
  },

  en: {
    intro: `Choosing a payment provider was never a small technical detail in the development of AllWDbook.

When the platform reached the monetization stage, the requirement was larger than adding a button that sends a customer to checkout. We needed a payment provider that could fit the product architecture while preserving the access system that already existed inside AllWDbook.

The journey started with Lemon Squeezy. Later, new payments were intentionally paused while a verification process was unresolved. We then explored Paddle and attempted to begin with its Sandbox environment, but the registration and setup experience did not fit the development path we needed at that stage. The search then moved to FastSpring, where a different obstacle appeared: the initial personal email address was not accepted, so an exception inquiry was submitted and a response was awaited.

This article is not intended to declare one company the best payment provider for everyone. It documents a real AllWDbook development journey and shows how a decision that looks as simple as choosing a payment gateway can affect product architecture, operations, and user experience.`,

    sections: [
      {
        id:
          "payment-provider-is-product-decision",

        heading:
          "A payment provider is more than a checkout button",

        paragraphs: [
          `From the outside, payment integration can look simple: choose a provider, add a checkout link, and start accepting subscriptions.`,

          `Inside a real product, there are additional questions. How is a successful purchase confirmed? How does the application know that access should be granted? What happens when the provider is unavailable? And how do we protect customers who purchased previously if the payment provider changes later?`,

          `This mattered particularly for AllWDbook because access was not designed around checkout alone. AWD-KEY, recovery, and existing paid access all needed to continue working even while new payments were paused.`,

          `That turned payment-provider selection into an architectural product decision rather than an isolated billing task.`,
        ],
      },

      {
        id:
          "starting-with-lemon-squeezy",

        heading:
          "Starting with Lemon Squeezy",

        paragraphs: [
          `Lemon Squeezy was part of the first payment architecture prepared for AllWDbook. The integration connected successful purchases with the platform's access process.`,

          `Once a payment system is connected to a real product, it becomes more than an external link. Application workflows depend on its results, and previous customers may have access that must remain valid.`,

          `As the project progressed, a verification stage made it inappropriate to continue accepting new payments temporarily.`,

          `Rather than trying to work around that process, the safer decision was to pause new payments until the situation became clear.`,
        ],
      },

      {
        id:
          "freezing-payments",

        heading:
          "Pausing payments without pausing the product",

        paragraphs: [
          `Stopping new purchases should not mean shutting down the platform.`,

          `AllWDbook therefore separated payment availability from the rest of the product. Free tools continued to work, AWD-KEY remained available, recovery continued to function, and previously granted access was not removed.`,

          `This became an important architectural lesson: an external payment provider should not become a single point of failure for the entire product.`,

          `If every feature depends directly on the checkout state, a provider problem can affect users who are not trying to purchase anything at all.`,
        ],
      },

      {
        id:
          "why-we-kept-old-integration",

        heading:
          "Why we did not delete the old Lemon Squeezy integration",

        paragraphs: [
          `When evaluating a replacement provider, deleting the previous integration and starting from zero can look cleaner. For AllWDbook, that would have been the wrong approach.`,

          `The existing integration is connected to the history of previous access events. There may be transactions or access keys created while that system was active.`,

          `Removing the code simply because a new provider is being considered can make historical access and recovery harder to maintain.`,

          `The principle became clear: preserve the old system where it still protects previous customers, while designing any new payment provider primarily for new transactions.`,
        ],
      },

      {
        id:
          "exploring-paddle",

        heading:
          "The second stop: exploring Paddle",

        paragraphs: [
          `After new payments were paused, we began evaluating another provider that could be tested before making a production decision.`,

          `Paddle was one of the options considered, and the plan was to begin in a Sandbox environment so the integration could be understood without touching real transactions.`,

          `However, the registration and Sandbox setup experience did not provide the straightforward development path we needed at that stage. Instead of quickly reaching a test environment, the onboarding process itself became friction.`,

          `That led to another useful decision: a project does not need to continue with a provider simply because evaluation has already started. When the setup cost becomes disproportionate to the current need, evaluating another option can be the more efficient choice.`,
        ],
      },

      {
        id:
          "sandbox-lesson",

        heading:
          "The Sandbox experience is part of the provider evaluation",

        paragraphs: [
          `Payment providers are often compared by pricing or feature lists, but the developer experience begins before the first real payment.`,

          `A clear testing path, understandable setup, and a predictable transition from development to production all affect the real cost of integration.`,

          `For a small or growing product, developer time is a genuine cost even when it does not appear on an invoice.`,

          `The Paddle evaluation reinforced the idea that we are not only choosing a checkout service. We are also choosing the development and maintenance workflow that comes with it.`,
        ],
      },

      {
        id:
          "moving-to-fastspring",

        heading:
          "Moving the evaluation to FastSpring",

        paragraphs: [
          `After the Paddle attempt, the search moved to FastSpring as another option worth evaluating.`,

          `This time the first obstacle appeared even earlier. The initial personal email address was not accepted in the inquiry or registration flow, which expected a business-oriented email address.`,

          `For an independent digital product, a requirement like this may appear minor, but it can determine whether the founder can even begin the provider relationship.`,

          `Instead of stopping there, an exception inquiry was submitted to FastSpring explaining the situation and asking whether the process could continue.`,
        ],
      },

      {
        id:
          "fastspring-inquiry",

        heading:
          "Submitting the exception inquiry and waiting",

        paragraphs: [
          `After the inquiry was submitted, FastSpring displayed confirmation that the request had been received and that the team would follow up.`,

          `At that point it would not have made sense to build another payment integration before knowing whether the account could proceed and what the next requirements would be.`,

          `New payments therefore remained paused while the rest of AllWDbook continued to operate independently.`,

          `This article is being prepared as a build journal during the process. Before final publication, this section will be updated with the actual FastSpring outcome or the next provider decision.`,
        ],
      },

      {
        id:
          "what-we-actually-compare",

        heading:
          "What we actually compare when choosing a payment provider",

        paragraphs: [
          `After going through these stages, it became clear that the comparison cannot be reduced to a single question such as which provider has the lowest fee.`,

          `For AllWDbook, the evaluation now includes account onboarding, verification clarity, testing workflow, integration experience, post-payment handling, and how cleanly the provider can connect with the platform's own access system.`,

          `User experience also matters. Checkout should feel understandable and connected to the product the customer was already using.`,

          `Maintainability matters as well. If plans or access rules change later, the integration should be understandable enough to evolve without rebuilding the product around a payment company.`,
        ],
      },

      {
        id:
          "separate-payment-from-access",

        heading:
          "The most important technical decision: separate payment from access",

        paragraphs: [
          `The most valuable outcome of this journey was not the name of a particular payment company. It was an architectural principle for AllWDbook.`,

          `A payment is an event that grants a user a right, but the payment provider should not remain the only place where that right exists.`,

          `Once a purchase is confirmed, entitlement can be represented inside the AllWDbook access system, where AWD-KEY, recovery, and other access mechanisms can continue independently from the checkout page.`,

          `That separation makes future provider changes safer and helps protect customers from losing access because of external commercial or technical changes.`,
        ],
      },

      {
        id:
          "no-rush-to-enable-payments",

        heading:
          "Why we are not rushing to enable new payments",

        paragraphs: [
          `It is easy to feel that having an active purchase button is more important than waiting, especially after the product itself is already usable.`,

          `But accepting payments before the provider, integration, and recovery workflow are properly understood can create larger problems than temporarily missing a few sales.`,

          `The priority is for the first purchase after reactivation to be traceable and recoverable, with the customer receiving exactly the access that was promised.`,

          `For that reason, payment reactivation remains separate from the ongoing development of tools, content, and user experience. The product can continue improving while the payment layer receives the time required to become stable.`,
        ],
      },

      {
        id:
          "lesson",

        heading:
          "What Lemon Squeezy, Paddle, and FastSpring taught us",

        paragraphs: [
          `Choosing a payment provider is not a competition to find a universally perfect company. It is a process of finding the provider that fits the current product stage, architecture, and customer requirements.`,

          `A solution that works extremely well for a large company may introduce unnecessary complexity for an early-stage product, while something that looks easy initially may become less suitable when verification, recovery, and maintenance requirements appear.`,

          `Changing direction is not necessarily a failure of planning. It can be the natural result of learning more about the product while building it.`,

          `For AllWDbook, this journey will be complete only when new payments can be reactivated with confidence while preserving simple usage and protecting existing access.`,
        ],
      },
    ],

    takeaways: [
      "A payment provider is part of product architecture, not just a checkout button.",
      "New payments can be paused without disabling free tools or previous access.",
      "An old integration should not be removed when it still protects historical customer access.",
      "Sandbox and developer experience are part of provider evaluation.",
      "Onboarding and verification requirements can matter as much as technical features.",
      "Payment processing and access entitlement should remain separate layers whenever possible.",
      "Waiting for a stable integration is better than rushing an unreliable payment launch.",
      "The article will be updated with the FastSpring outcome before final publication.",
    ],

    media: [],

    relatedSlugs: [
      "why-i-created-allwdbook",
      "from-simple-idea-to-real-platform",
      "allwdbook-access-without-forced-account",
    ],
  },
};

export default choosingPaymentProvider;
