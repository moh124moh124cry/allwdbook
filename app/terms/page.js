export const metadata = {
  title:
    "شروط الاستخدام — AllWDbook | Terms of Use",

  description:
    "شروط استخدام AllWDbook وخدمات الاشتراك وأدوات Amazon KDP المقدمة من All World Digital.",

  alternates: {
    canonical:
      "/terms",
  },
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
    background: "#f7f9fc",

    border:
      "1px solid #d9e2ef",

    borderRadius: 11,
    padding: 12,
    marginTop: 12,

    fontSize: 13,
    lineHeight: 1.8,
    color: "#394a62",
  },
};

export default function TermsPage() {
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
          شروط الاستخدام
        </h2>

        <div
          style={styles.muted}
        >
          آخر تحديث: {UPDATED}
        </div>

        <div
          style={styles.note}
        >
          باستخدام AllWDbook فإنك
          توافق على هذه الشروط. إذا
          لم توافق عليها، فتوقف عن
          استخدام الموقع والخدمات
          المدفوعة.
        </div>

        <h3 style={styles.h3}>
          1. وصف الخدمة
        </h3>

        <p style={styles.p}>
          AllWDbook مجموعة أدوات
          تساعد ناشري Amazon KDP في
          تصميم الأغلفة، توليد أفكار
          Micro-Niche، بحث الكلمات
          المفتاحية، حساب التكاليف
          والأرباح وتنسيق أوصاف
          الكتب. بعض الأدوات مجانية
          بحدود استخدام، وبعضها متاح
          عبر اشتراك مدفوع.
        </p>

        <h3 style={styles.h3}>
          2. الاستقلالية عن Amazon
        </h3>

        <p style={styles.p}>
          AllWDbook منتج مستقل من
          All World Digital وليس
          تابعًا لـAmazon أو معتمدًا
          منها. Amazon وKDP والعلامات
          المرتبطة بهما ملك لأصحابها.
        </p>

        <h3 style={styles.h3}>
          3. الحساب والدخول
        </h3>

        <p style={styles.p}>
          يمكن استخدام الخطة
          المجانية كزائر. يتطلب شراء
          اشتراك أو استعادته تسجيل
          الدخول ببريد إلكتروني صالح.
          أنت مسؤول عن الوصول إلى
          بريدك وعن عدم مشاركة روابط
          تسجيل الدخول أو جلسة حسابك
          مع الآخرين.
        </p>

        <h3 style={styles.h3}>
          4. الاشتراكات والدفع
        </h3>

        <p style={styles.p}>
          تتم معالجة المدفوعات
          والفواتير والضرائب عبر
          Lemon Squeezy. لا يخزن
          AllWDbook رقم بطاقتك
          البنكية أو بيانات PayPal.
          الأسعار وفترة الفوترة تظهر
          قبل إتمام الشراء.
        </p>

        <p style={styles.p}>
          الاشتراكات الشهرية والسنوية
          تتجدد تلقائيًا ما لم يتم
          إلغاؤها قبل تاريخ التجديد.
          يمكنك إدارة الاشتراك أو
          وسيلة الدفع أو الإلغاء من
          رابط إدارة الاشتراك داخل
          قائمة حسابك.
        </p>

        <h3 style={styles.h3}>
          5. الإلغاء وانتهاء الصلاحية
        </h3>

        <p style={styles.p}>
          عند الإلغاء تبقى الصلاحية
          متاحة عادةً حتى نهاية فترة
          الفوترة المدفوعة، ثم يعود
          الحساب إلى الخطة المجانية.
          قد تتوقف الصلاحية عند انتهاء
          الاشتراك أو فشل الدفع وفق
          حالة الاشتراك لدى مزود
          الدفع.
        </p>

        <h3 style={styles.h3}>
          6. الاسترداد
        </h3>

        <p style={styles.p}>
          تخضع طلبات الاسترداد لسياسة
          الاسترداد المنشورة في صفحة{" "}
          <a
            href="/refund"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            سياسة الاسترداد
          </a>
          ، ولحقوق المستهلك الإلزامية
          التي تنطبق على عملية الشراء.
        </p>

        <h3 style={styles.h3}>
          7. الاستخدام المقبول
        </h3>

        <p style={styles.p}>
          يمنع إساءة استخدام الموقع،
          تجاوز حدود الاستخدام، مشاركة
          الحسابات المدفوعة، تشغيل
          طلبات آلية مفرطة، محاولة
          الوصول غير المصرح به، تعطيل
          الخدمة، نسخ الموقع أو إعادة
          بيع الخدمة دون إذن مكتوب.
        </p>

        <h3 style={styles.h3}>
          8. نتائج الأدوات وعدم ضمان
          الأرباح
        </h3>

        <p style={styles.p}>
          بيانات السوق والدرجات
          والمبيعات والأرباح المحتملة
          هي عينات أو تقديرات وليست
          ضمانًا للربح أو النجاح.
          اقتراحات الذكاء الاصطناعي
          والأفكار غير المختبرة تحتاج
          إلى التحقق. يجب مراجعة
          الملفات والأبعاد والأسعار
          داخل أدوات Amazon الرسمية
          قبل النشر.
        </p>

        <h3 style={styles.h3}>
          9. المحتوى الذي تدخله
        </h3>

        <p style={styles.p}>
          تحتفظ بحقوقك في النصوص
          والصور التي تدخلها. أنت
          مسؤول عن امتلاك الحقوق
          والتراخيص اللازمة، وعن عدم
          استخدام محتوى ينتهك حقوق
          الآخرين أو القوانين المعمول
          بها.
        </p>

        <h3 style={styles.h3}>
          10. توفر الخدمة والتغييرات
        </h3>

        <p style={styles.p}>
          قد تتغير الميزات أو الحدود
          أو الأسعار أو مزودو البيانات،
          وقد تتوقف بعض الوظائف مؤقتًا
          للصيانة أو بسبب خدمات
          خارجية. سنحاول الحفاظ على
          استقرار الخدمة، لكن لا نضمن
          توفرها دون انقطاع في كل وقت.
        </p>

        <h3 style={styles.h3}>
          11. حدود المسؤولية
        </h3>

        <p style={styles.p}>
          إلى الحد الذي يسمح به
          القانون، لا تتحمل All World
          Digital مسؤولية قرارات النشر
          أو رفض الكتب أو خسارة الأرباح
          أو الأضرار غير المباشرة
          الناتجة عن الاعتماد على
          تقديرات الأدوات. لا تستبعد
          هذه الشروط أي حقوق أو
          مسؤوليات لا يسمح القانون
          باستبعادها.
        </p>

        <h3 style={styles.h3}>
          12. الخصوصية
        </h3>

        <p style={styles.p}>
          توضح{" "}
          <a
            href="/privacy"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            سياسة الخصوصية
          </a>{" "}
          كيفية معالجة بيانات الحساب
          والاستخدام والدفع والخدمات
          الخارجية.
        </p>

        <h3 style={styles.h3}>
          13. تعديل الشروط
        </h3>

        <p style={styles.p}>
          قد نحدّث هذه الشروط عند تغيير
          الخدمة أو المتطلبات
          القانونية. يظهر تاريخ آخر
          تحديث أعلى الصفحة، ويعني
          استمرار استخدام الخدمة بعد
          التحديث قبول الشروط المعدلة
          حيث يسمح القانون.
        </p>

        <h3 style={styles.h3}>
          14. القانون والحقوق
          الإلزامية
        </h3>

        <p style={styles.p}>
          تخضع هذه الشروط للقوانين
          المطبقة على نشاط All World
          Digital، مع عدم الإخلال بحقوق
          المستهلك الإلزامية التي قد
          تنطبق في بلد العميل.
        </p>

        <h3 style={styles.h3}>
          15. التواصل
        </h3>

        <p style={styles.p}>
          للاستفسارات المتعلقة
          بالشروط: {EMAIL}
        </p>
      </section>

      <section
        style={styles.box}
        dir="ltr"
      >
        <h2 style={styles.h2}>
          Terms of Use
        </h2>

        <div
          style={styles.muted}
        >
          Last updated: {UPDATED}
        </div>

        <div
          style={styles.note}
        >
          By using AllWDbook, you
          agree to these terms. If you
          do not agree, stop using the
          website and paid services.
        </div>

        <h3 style={styles.h3}>
          1. Service description
        </h3>

        <p style={styles.p}>
          AllWDbook is a toolkit for
          Amazon KDP publishers,
          including cover preparation,
          Micro-Niche ideas, keyword
          research, royalty estimates
          and description formatting.
          Some tools are free with
          usage limits, while others
          are available through paid
          subscriptions.
        </p>

        <h3 style={styles.h3}>
          2. Independence from Amazon
        </h3>

        <p style={styles.p}>
          AllWDbook is an independent
          product by All World Digital
          and is not affiliated with or
          endorsed by Amazon. Amazon,
          KDP and related marks belong
          to their respective owners.
        </p>

        <h3 style={styles.h3}>
          3. Accounts and sign-in
        </h3>

        <p style={styles.p}>
          The free plan can be used as
          a guest. Purchasing or
          restoring a subscription
          requires sign-in with a valid
          email address. You are
          responsible for access to
          your email and for not
          sharing sign-in links or
          account sessions.
        </p>

        <h3 style={styles.h3}>
          4. Subscriptions and payments
        </h3>

        <p style={styles.p}>
          Payments, invoices and
          applicable taxes are
          processed by Lemon Squeezy.
          AllWDbook does not store your
          card number or PayPal payment
          details. Prices and billing
          periods are displayed before
          checkout.
        </p>

        <p style={styles.p}>
          Monthly and yearly
          subscriptions renew
          automatically unless
          cancelled before the renewal
          date. You can manage billing,
          payment methods and
          cancellation through the
          subscription-management link
          in your account menu.
        </p>

        <h3 style={styles.h3}>
          5. Cancellation and
          expiration
        </h3>

        <p style={styles.p}>
          After cancellation, access
          normally continues until the
          end of the paid billing
          period, then returns to the
          free plan. Access may end
          when a subscription expires
          or payment fails, depending
          on the status reported by the
          payment provider.
        </p>

        <h3 style={styles.h3}>
          6. Refunds
        </h3>

        <p style={styles.p}>
          Refund requests are handled
          under the published{" "}
          <a
            href="/refund"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            Refund Policy
          </a>{" "}
          and any mandatory consumer
          rights applicable to the
          purchase.
        </p>

        <h3 style={styles.h3}>
          7. Acceptable use
        </h3>

        <p style={styles.p}>
          You may not abuse the
          website, bypass usage limits,
          share paid accounts, run
          excessive automated
          requests, attempt
          unauthorized access, disrupt
          the service, copy the website
          or resell the service without
          written permission.
        </p>

        <h3 style={styles.h3}>
          8. Tool results and no
          earnings guarantee
        </h3>

        <p style={styles.p}>
          Market data, scores, sales
          figures and potential
          royalties are samples or
          estimates, not guarantees of
          profit or success. AI
          suggestions and untested
          ideas require validation.
          Files, dimensions and prices
          should be checked with Amazon
          official tools before
          publishing.
        </p>

        <h3 style={styles.h3}>
          9. Content you provide
        </h3>

        <p style={styles.p}>
          You retain your rights in the
          text and images you provide.
          You are responsible for
          having the required rights
          and licences and for not
          using content that violates
          third-party rights or
          applicable law.
        </p>

        <h3 style={styles.h3}>
          10. Availability and changes
        </h3>

        <p style={styles.p}>
          Features, limits, prices and
          data providers may change,
          and some functions may be
          temporarily unavailable
          because of maintenance or
          third-party services. We aim
          for reliable service but
          cannot guarantee
          uninterrupted availability
          at all times.
        </p>

        <h3 style={styles.h3}>
          11. Limitation of liability
        </h3>

        <p style={styles.p}>
          To the extent permitted by
          law, All World Digital is not
          responsible for publishing
          decisions, rejected books,
          lost profits or indirect
          losses caused by relying on
          tool estimates. Nothing in
          these terms excludes rights
          or liabilities that cannot
          legally be excluded.
        </p>

        <h3 style={styles.h3}>
          12. Privacy
        </h3>

        <p style={styles.p}>
          The{" "}
          <a
            href="/privacy"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            Privacy Policy
          </a>{" "}
          explains how account, usage,
          payment and third-party
          service data is handled.
        </p>

        <h3 style={styles.h3}>
          13. Changes to these terms
        </h3>

        <p style={styles.p}>
          We may update these terms
          when the service or legal
          requirements change. The
          latest revision date appears
          above. Continued use after an
          update means acceptance where
          permitted by law.
        </p>

        <h3 style={styles.h3}>
          14. Applicable law and
          mandatory rights
        </h3>

        <p style={styles.p}>
          These terms are governed by
          laws applicable to All World
          Digital operations, without
          limiting mandatory consumer
          rights that may apply in the
          customer country.
        </p>

        <h3 style={styles.h3}>
          15. Contact
        </h3>

        <p style={styles.p}>
          Questions about these terms:{" "}
          {EMAIL}
        </p>
      </section>

      <div
        style={{
          textAlign: "center",
          padding: "8px 0 26px",
          ...styles.muted,
        }}
      >
        © {new Date().getFullYear()}{" "}
        All World Digital · AllWDbook™
      </div>
    </main>
  );
}
