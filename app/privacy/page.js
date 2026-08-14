export const metadata = {
  title:
    "سياسة الخصوصية — AllWDbook | Privacy Policy",

  description:
    "سياسة خصوصية AllWDbook وتشمل حسابات Supabase واشتراكات Lemon Squeezy والتحليلات وأدوات البحث والذكاء الاصطناعي.",
};

const UPDATED =
  "14 August 2026";

const EMAIL =
  "anesscherfaoui@gmail.com";

const styles = {
  box: {
    background: "#ffffff",

    border:
      "2px solid #d9e2ef",

    borderRadius: 16,
    padding: 20,
    marginBottom: 18,

    color: "#172033",

    boxShadow:
      "0 16px 42px rgba(0,0,0,.22)",
  },

  h2: {
    fontSize: 22,
    margin: "0 0 7px",
    color: "#16864a",
  },

  h3: {
    fontSize: 16,
    margin: "20px 0 6px",
    color: "#1459a6",
  },

  p: {
    fontSize: 14,
    lineHeight: 1.9,
    margin: "0 0 8px",
    color: "#24334b",
  },

  muted: {
    fontSize: 12,
    color: "#65738a",
    lineHeight: 1.8,
  },

  note: {
    background: "#eafaf1",

    border:
      "1px solid #7ecb99",

    borderRadius: 11,
    padding: 12,
    marginTop: 12,

    fontSize: 13,
    lineHeight: 1.8,
    color: "#215c38",
  },
};

export default function PrivacyPage() {
  return (
    <main
      className="wrap"
      style={{
        paddingBottom: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 0",
        }}
      >
        <img
          src="/logov3.png"
          alt="AllWDbook"
          width="42"
          height="42"
          style={{
            borderRadius: "50%",
          }}
        />

        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 17,
              color: "#e8eefc",
            }}
          >
            AllWDbook
          </div>

          <div
            style={styles.muted}
          >
            All World Digital
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
        }}
      >
        <a
          href="/"
          style={{
            color: "#60a5fa",
            fontSize: 13,
          }}
        >
          الرجوع إلى الأداة /
          Back to the tool
        </a>
      </div>

      <section
        style={styles.box}
        dir="rtl"
      >
        <h2 style={styles.h2}>
          سياسة الخصوصية
        </h2>

        <div
          style={styles.muted}
        >
          آخر تحديث: {UPDATED}
        </div>

        <div
          style={styles.note}
        >
          يمكن استخدام الخطة المجانية
          دون إدخال بريد. نطلب البريد
          فقط عند تسجيل الدخول أو شراء
          واستعادة اشتراك. لا نخزن رقم
          البطاقة أو كلمة مرور PayPal
          أو بيانات حساب Amazon.
        </div>

        <h3 style={styles.h3}>
          1. الجهة المسؤولة والتواصل
        </h3>

        <p style={styles.p}>
          AllWDbook خدمة من All World
          Digital. للاستفسارات المتعلقة
          بالخصوصية أو طلبات البيانات،
          تواصل عبر {EMAIL}.
        </p>

        <h3 style={styles.h3}>
          2. استخدام الموقع كزائر
        </h3>

        <p style={styles.p}>
          عند الدخول كزائر، ينشئ
          Supabase حسابًا مجهولًا ومعرف
          مستخدم تقنيًا حتى تعمل حدود
          الاستخدام والحماية من
          الإساءة. لا يتضمن الحساب
          المجهول اسمك أو بريدك ما لم
          تختر لاحقًا تسجيل الدخول
          بالبريد.
        </p>

        <h3 style={styles.h3}>
          3. تسجيل الدخول بالبريد
        </h3>

        <p style={styles.p}>
          عند اختيار تسجيل الدخول أو
          شراء اشتراك، نعالج بريدك
          الإلكتروني ومعرف مستخدم
          Supabase وحالة الجلسة. يستخدم
          البريد لإرسال رابط الدخول
          وربط الاشتراك بالحساب الصحيح
          واستعادة الوصول المدفوع.
        </p>

        <h3 style={styles.h3}>
          4. الاشتراكات وLemon Squeezy
        </h3>

        <p style={styles.p}>
          تتم معالجة الدفع والضرائب
          والفواتير عبر Lemon Squeezy.
          قد نتلقى منها بريد العميل،
          ومعرف العميل والطلب
          والاشتراك، والمنتج والنسخة
          المشتراة، وحالة الاشتراك،
          وتواريخ التجديد أو الانتهاء،
          وحالة الإلغاء، وروابط إدارة
          الفوترة، ومعلومات تقنية عن
          حدث الدفع.
        </p>

        <p style={styles.p}>
          لا يستقبل AllWDbook رقم
          البطاقة الكامل أو رمز أمان
          البطاقة أو كلمة مرور PayPal.
          تخضع المعلومات المدخلة في
          صفحة الدفع أيضًا لسياسة
          Lemon Squeezy.
        </p>

        <h3 style={styles.h3}>
          5. البيانات التي تدخلها في
          الأدوات
        </h3>

        <p style={styles.p}>
          قد تدخل كلمة بحث، موضوع كتاب،
          سعرًا، عدد صفحات، نص وصف أو
          صورة غلاف. تعتمد المعالجة على
          الأداة. تجنب إدخال معلومات
          شخصية أو سرية في حقول البحث
          والذكاء الاصطناعي.
        </p>

        <h3 style={styles.h3}>
          6. البحث وبيانات السوق
        </h3>

        <p style={styles.p}>
          قد ترسل عبارات البحث إلى
          خدمات لازمة لجلب اقتراحات
          وبيانات عامة عن الكتب والسوق،
          بما في ذلك نقاط اقتراحات
          Amazon ومزودي بيانات الكتب.
          لا نطلب ربط عبارة البحث بكلمة
          مرور أو بيانات حساب Amazon.
        </p>

        <h3 style={styles.h3}>
          7. الذكاء الاصطناعي
        </h3>

        <p style={styles.p}>
          عند استخدام توليد الكلمات
          بالذكاء الاصطناعي، يرسل
          الموضوع المكتوب إلى مزود
          الذكاء الاصطناعي Groq لمعالجة
          الطلب. لا تدخل بيانات شخصية
          أو سرية أو محتوى لا تملك حق
          مشاركته.
        </p>

        <h3 style={styles.h3}>
          8. صور الأغلفة
        </h3>

        <p style={styles.p}>
          تعالج ميزة مصمم الغلاف الصورة
          داخل متصفحك على جهازك. لا
          ترسل الأداة صورة الغلاف إلى
          خادم AllWDbook لإجراء التصميم
          أو التصدير.
        </p>

        <h3 style={styles.h3}>
          9. حدود الاستخدام والحماية
        </h3>

        <p style={styles.p}>
          نخزن معرف المستخدم، ومعرف
          الأداة، وتاريخ الاستخدام،
          وعدد العمليات اللازمة لتطبيق
          الحدود اليومية وحماية
          الخدمات. قد تستخدم أنظمة
          الحماية معلومات تقنية مثل
          عنوان الشبكة وسجل الطلب لفترة
          مناسبة لمنع الاحتيال
          والطلبات الآلية المفرطة.
        </p>

        <h3 style={styles.h3}>
          10. التخزين المحلي والجلسات
        </h3>

        <p style={styles.p}>
          يستخدم الموقع التخزين المحلي
          وتقنيات الجلسة لحفظ اللغة،
          وجلسة Supabase، وتفضيلات أو
          بيانات مؤقتة. يمكنك حذفها من
          إعدادات المتصفح، لكن ذلك قد
          يسجل خروجك أو يعيد تعيين
          تفضيلاتك.
        </p>

        <h3 style={styles.h3}>
          11. الاستضافة والتحليلات
        </h3>

        <p style={styles.p}>
          يستضاف AllWDbook على Vercel
          ويستخدم Vercel Analytics. قد
          تعالج خدمات الاستضافة
          والتحليلات بيانات تقنية مثل
          نوع الجهاز والمتصفح وعنوان
          الشبكة والصفحات والأوقات
          وأداء الطلبات وفق سياسات تلك
          الخدمات.
        </p>

        <h3 style={styles.h3}>
          12. أسباب المعالجة
        </h3>

        <p style={styles.p}>
          نعالج البيانات لتنفيذ الخدمة
          والاشتراك، وتسجيل الدخول،
          وتطبيق الحدود، وتقديم الدعم،
          ومنع الاحتيال، وتحسين الأداء،
          والامتثال للالتزامات
          القانونية. عندما يتطلب
          القانون موافقة، نطلبها أو
          نوفر الخيارات المناسبة.
        </p>

        <h3 style={styles.h3}>
          13. الجهات التي قد تعالج
          البيانات
        </h3>

        <p style={styles.p}>
          تشمل الجهات المستخدمة حسب
          الميزة: Supabase للمصادقة
          وقاعدة البيانات، Vercel
          للاستضافة والتحليلات، Lemon
          Squeezy للدفع والاشتراكات،
          Groq للذكاء الاصطناعي، وخدمات
          اقتراحات وبيانات الكتب. لا
          نبيع بياناتك الشخصية.
        </p>

        <h3 style={styles.h3}>
          14. النقل الدولي
        </h3>

        <p style={styles.p}>
          قد تعمل الخدمات الخارجية من
          بلدان مختلفة، لذلك قد تعالج
          البيانات خارج بلدك وفق آليات
          الحماية والشروط التي يعتمدها
          كل مزود والقوانين المطبقة.
        </p>

        <h3 style={styles.h3}>
          15. مدة الاحتفاظ
        </h3>

        <p style={styles.p}>
          نحتفظ ببيانات الحساب
          والاشتراك بقدر الحاجة لتقديم
          الوصول، والدعم، ومنع
          الاحتيال، وحل النزاعات
          والالتزامات القانونية. سجلات
          الاستخدام التقنية تحفظ
          بالقدر الضروري للحدود
          والأمان. قد يحتفظ مزود الدفع
          بسجلات الفاتورة والضرائب وفق
          التزاماته الخاصة.
        </p>

        <h3 style={styles.h3}>
          16. حقوقك
        </h3>

        <p style={styles.p}>
          بحسب القانون المطبق، يمكنك
          طلب الوصول إلى بياناتك أو
          تصحيحها أو حذفها أو تقييد
          معالجتها أو الاعتراض عليها.
          بعض بيانات الدفع أو المعاملة
          قد يلزم الاحتفاظ بها لأسباب
          قانونية أو لمنع الاحتيال.
          أرسل الطلب من البريد المرتبط
          بالحساب إلى {EMAIL}.
        </p>

        <h3 style={styles.h3}>
          17. الأطفال
        </h3>

        <p style={styles.p}>
          الخدمة مخصصة لأدوات النشر
          والأعمال وليست موجهة عمدًا
          للأطفال دون 13 سنة. إذا علمت
          أن طفلًا أرسل بيانات شخصية
          دون إذن مناسب، تواصل معنا.
        </p>

        <h3 style={styles.h3}>
          18. الأمان
        </h3>

        <p style={styles.p}>
          نستخدم مصادقة Supabase،
          واتصالات مشفرة، والتحقق من
          توقيع Webhook، وسياسات وصول
          قاعدة البيانات وإجراءات
          حماية تقنية. لا يوجد نظام
          آمن بنسبة مطلقة، لذلك لا يمكن
          ضمان منع كل المخاطر.
        </p>

        <h3 style={styles.h3}>
          19. تحديث السياسة
        </h3>

        <p style={styles.p}>
          قد نحدّث السياسة عند تغيير
          الخدمة أو مزوديها أو
          المتطلبات القانونية. يظهر
          تاريخ آخر تحديث أعلى الصفحة.
        </p>

        <h3 style={styles.h3}>
          20. الصفحات المرتبطة
        </h3>

        <p style={styles.p}>
          راجع أيضًا{" "}
          <a
            href="/terms"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            شروط الاستخدام
          </a>{" "}
          و{" "}
          <a
            href="/refund"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            سياسة الاسترداد
          </a>
          .
        </p>
      </section>

      <section
        style={styles.box}
        dir="ltr"
      >
        <h2 style={styles.h2}>
          Privacy Policy
        </h2>

        <div
          style={styles.muted}
        >
          Last updated: {UPDATED}
        </div>

        <div
          style={styles.note}
        >
          The free plan can be used
          without entering an email
          address. We request email only
          for sign-in or purchasing and
          restoring a subscription. We
          do not store card numbers,
          PayPal passwords or Amazon
          account credentials.
        </div>

        <h3 style={styles.h3}>
          1. Controller and contact
        </h3>

        <p style={styles.p}>
          AllWDbook is a service by All
          World Digital. For privacy
          questions or data requests,
          contact {EMAIL}.
        </p>

        <h3 style={styles.h3}>
          2. Guest use
        </h3>

        <p style={styles.p}>
          When you enter as a guest,
          Supabase creates an anonymous
          account and a technical user
          identifier so usage limits and
          abuse prevention can work. The
          anonymous account does not
          contain your name or email
          unless you later choose email
          sign-in.
        </p>

        <h3 style={styles.h3}>
          3. Email sign-in
        </h3>

        <p style={styles.p}>
          When you choose sign-in or
          purchase a subscription, we
          process your email address,
          Supabase user identifier and
          session status. Email is used
          to send the sign-in link,
          connect a subscription to the
          correct account and restore
          paid access.
        </p>

        <h3 style={styles.h3}>
          4. Subscriptions and Lemon
          Squeezy
        </h3>

        <p style={styles.p}>
          Payments, taxes and invoices
          are processed by Lemon
          Squeezy. We may receive the
          customer email, customer,
          order and subscription IDs,
          purchased product and variant,
          subscription status, renewal
          or end dates, cancellation
          status, billing-management
          links and technical
          payment-event information.
        </p>

        <p style={styles.p}>
          AllWDbook does not receive the
          full card number, card
          security code or PayPal
          password. Information entered
          at checkout is also governed
          by the Lemon Squeezy privacy
          policy.
        </p>

        <h3 style={styles.h3}>
          5. Information entered in
          tools
        </h3>

        <p style={styles.p}>
          You may enter a search term,
          book topic, price, page count,
          description text or cover
          image. Processing depends on
          the tool. Avoid personal or
          confidential information in
          search and AI fields.
        </p>

        <h3 style={styles.h3}>
          6. Search and market data
        </h3>

        <p style={styles.p}>
          Search terms may be sent to
          services needed to obtain
          public book and market
          suggestions and data,
          including Amazon suggestion
          endpoints and book-data
          providers. We do not ask you
          to connect a search term with
          an Amazon password or account
          credentials.
        </p>

        <h3 style={styles.h3}>
          7. Artificial intelligence
        </h3>

        <p style={styles.p}>
          When AI keyword generation is
          used, the entered topic is
          sent to Groq to process the
          request. Do not enter
          personal, confidential or
          unauthorized content.
        </p>

        <h3 style={styles.h3}>
          8. Cover images
        </h3>

        <p style={styles.p}>
          Cover Designer processes the
          image inside your browser on
          your device. The cover image
          is not sent to an AllWDbook
          server for design or export.
        </p>

        <h3 style={styles.h3}>
          9. Usage limits and protection
        </h3>

        <p style={styles.p}>
          We store the user identifier,
          tool identifier, usage date
          and operation count required
          for daily limits and service
          protection. Protection systems
          may use technical information
          such as network address and
          request logs for an
          appropriate period to prevent
          fraud and excessive
          automation.
        </p>

        <h3 style={styles.h3}>
          10. Local storage and sessions
        </h3>

        <p style={styles.p}>
          The site uses local storage
          and session technologies for
          language, Supabase sessions,
          preferences and temporary
          data. Clearing browser data
          may sign you out or reset
          preferences.
        </p>

        <h3 style={styles.h3}>
          11. Hosting and analytics
        </h3>

        <p style={styles.p}>
          AllWDbook is hosted on Vercel
          and uses Vercel Analytics.
          Hosting and analytics services
          may process device type,
          browser, network address,
          visited pages, timing and
          request-performance data under
          their policies.
        </p>

        <h3 style={styles.h3}>
          12. Purposes and legal bases
        </h3>

        <p style={styles.p}>
          Data is processed to provide
          the service and subscription,
          authenticate users, apply
          limits, provide support,
          prevent fraud, improve
          performance and meet legal
          obligations. Where consent is
          legally required, we seek it
          or provide appropriate
          choices.
        </p>

        <h3 style={styles.h3}>
          13. Service providers
        </h3>

        <p style={styles.p}>
          Depending on the feature,
          providers include Supabase for
          authentication and database
          services, Vercel for hosting
          and analytics, Lemon Squeezy
          for payments and
          subscriptions, Groq for AI,
          and book-data or suggestion
          services. We do not sell
          personal data.
        </p>

        <h3 style={styles.h3}>
          14. International transfers
        </h3>

        <p style={styles.p}>
          External providers may operate
          in different countries, so
          information may be processed
          outside your country under
          provider safeguards, terms and
          applicable laws.
        </p>

        <h3 style={styles.h3}>
          15. Retention
        </h3>

        <p style={styles.p}>
          Account and subscription
          records are retained as needed
          for access, support, fraud
          prevention, disputes and legal
          obligations. Technical usage
          records are kept as needed for
          limits and security. Payment
          providers may retain invoice
          and tax records under their
          own duties.
        </p>

        <h3 style={styles.h3}>
          16. Your rights
        </h3>

        <p style={styles.p}>
          Depending on applicable law,
          you may request access,
          correction, deletion,
          restriction or objection. Some
          payment or transaction data
          may need to be retained for
          legal or fraud-prevention
          reasons. Send a request from
          the account email to {EMAIL}.
        </p>

        <h3 style={styles.h3}>
          17. Children
        </h3>

        <p style={styles.p}>
          The service is intended for
          publishing and business tools
          and is not intentionally
          directed to children under 13.
          Contact us if you believe a
          child submitted personal
          information without
          appropriate permission.
        </p>

        <h3 style={styles.h3}>
          18. Security
        </h3>

        <p style={styles.p}>
          We use Supabase authentication,
          encrypted connections,
          webhook-signature verification,
          database-access policies and
          technical safeguards. No
          system is completely secure,
          so elimination of all risk
          cannot be guaranteed.
        </p>

        <h3 style={styles.h3}>
          19. Policy updates
        </h3>

        <p style={styles.p}>
          This policy may be updated
          when the service, providers or
          legal requirements change. The
          latest revision date appears
          above.
        </p>

        <h3 style={styles.h3}>
          20. Related pages
        </h3>

        <p style={styles.p}>
          Please also review the{" "}
          <a
            href="/terms"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            Terms of Use
          </a>{" "}
          and{" "}
          <a
            href="/refund"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            Refund Policy
          </a>
          .
        </p>
      </section>

      <div
        style={{
          textAlign: "center",
          padding: "8px 0 26px",
          ...styles.muted,
        }}
      >
        ©{" "}
        {new Date().getFullYear()}{" "}
        All World Digital ·
        AllWDbook™
      </div>
    </main>
  );
}
