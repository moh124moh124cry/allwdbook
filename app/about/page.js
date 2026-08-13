export const metadata = {
  title: "سياسة الخصوصية — AllWDbook | Privacy Policy",
  description:
    "سياسة خصوصية AllWDbook من All World Digital، وتشمل الاستضافة والتحليلات وخدمات البحث والذكاء الاصطناعي."
};

const UPDATED = "13 August 2026";
const EMAIL = "anesscherfaoui@gmail.com";

const box = {
  background: "#131d33",
  border: "1px solid #22304f",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "18px",
  color: "#e8eefc"
};

const h2 = {
  fontSize: "21px",
  margin: "0 0 6px",
  color: "#22c55e"
};

const h3 = {
  fontSize: "15px",
  margin: "18px 0 5px",
  color: "#60a5fa"
};

const p = {
  fontSize: "14px",
  lineHeight: "1.9",
  margin: "0 0 7px",
  color: "#e8eefc"
};

const mut = {
  fontSize: "12px",
  color: "#93a4c4",
  lineHeight: "1.8"
};

const note = {
  background: "#0e1729",
  border: "1px solid #2b3c63",
  borderRadius: "10px",
  padding: "11px 12px",
  marginTop: "12px",
  fontSize: "13px",
  lineHeight: "1.8",
  color: "#cbd5e1"
};

export default function Privacy() {
  return (
    <main className="wrap" style={{ paddingBottom: "50px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 0"
        }}
      >
        <img
          src="/logov3.png"
          alt="AllWDbook"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%"
          }}
        />
        <div>
          <div
            style={{
              fontWeight: "800",
              fontSize: "17px",
              color: "#e8eefc"
            }}
          >
            AllWDbook
          </div>
          <div style={mut}>All World Digital</div>
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <a
          href="/"
          style={{
            color: "#60a5fa",
            fontSize: "13px",
            textDecoration: "none"
          }}
        >
          الرجوع إلى الأداة / Back to the tool
        </a>
      </div>

      <section style={box} dir="rtl">
        <h2 style={h2}>سياسة الخصوصية</h2>
        <div style={mut}>آخر تحديث: {UPDATED}</div>

        <div style={note}>
          هدف هذه الصفحة هو توضيح ما يحدث لبياناتك عند استخدام
          AllWDbook. الأداة لا تتطلب إنشاء حساب ولا تطلب بيانات دفع
          أو كلمة مرور لحساب Amazon.
        </div>

        <h3 style={h3}>1. البيانات التي تدخلها في الأدوات</h3>
        <p style={p}>
          قد تدخل كلمات بحث، موضوع كتاب، معلومات حسابية مثل السعر
          وعدد الصفحات، أو صورة غلاف. طريقة معالجة هذه البيانات تختلف
          حسب الأداة المستخدمة كما هو موضح أدناه.
        </p>

        <h3 style={h3}>2. Keyword Research وبيانات السوق</h3>
        <p style={p}>
          عند استخدام البحث عن الكلمات المفتاحية، قد يتم إرسال عبارة
          البحث إلى خدمات خارجية لازمة لجلب اقتراحات وبيانات عامة عن
          السوق، بما في ذلك خدمات بيانات الكتب ونقاط اقتراحات Amazon.
          لا نطلب إرفاق اسمك أو رقم هاتفك أو بيانات حساب Amazon بهذه
          العبارة.
        </p>

        <h3 style={h3}>3. الذكاء الاصطناعي</h3>
        <p style={p}>
          عند استخدام ميزة توليد الكلمات بالذكاء الاصطناعي، يتم إرسال
          الموضوع الذي كتبته إلى مزود الذكاء الاصطناعي Groq لتنفيذ
          الطلب. تجنب إدخال معلومات شخصية أو سرية في حقل الموضوع.
        </p>

        <h3 style={h3}>4. صور الأغلفة</h3>
        <p style={p}>
          في النسخة الحالية من مصمم الغلاف، تتم قراءة ومعالجة الصورة
          داخل المتصفح على جهازك. لا ترسل ميزة تصميم الغلاف الصورة إلى
          خادم AllWDbook لمعالجتها.
        </p>

        <h3 style={h3}>5. التخزين على جهازك</h3>
        <p style={p}>
          قد تستخدم بعض الميزات التخزين المحلي في المتصفح لحفظ
          تفضيلات أو بيانات مؤقتة على جهازك. يمكنك حذفها عبر مسح بيانات
          الموقع من إعدادات المتصفح.
        </p>

        <h3 style={h3}>6. الاستضافة والتحليلات التقنية</h3>
        <p style={p}>
          AllWDbook مستضاف على Vercel ويستخدم Vercel Analytics.
          لذلك قد تتم معالجة بيانات تقنية واستخدامية مرتبطة بطلبات
          الموقع، مثل معلومات الجهاز أو المتصفح وعنوان الشبكة وبيانات
          الزيارة، وفق آليات وخدمات مزود الاستضافة والتحليلات.
        </p>

        <h3 style={h3}>7. الاقتراحات والتواصل</h3>
        <p style={p}>
          نموذج الملاحظات في AllWDbook يجهز الرسالة ثم يفتح تطبيق
          البريد الإلكتروني أو WhatsApp على جهازك. لا يتم إرسال الرسالة
          من AllWDbook تلقائيًا؛ أنت من يقرر الإرسال. عند إرسالها تصبح
          الرسالة خاضعة أيضًا لسياسة الخدمة التي اخترتها.
        </p>

        <h3 style={h3}>8. الأمان ومنع إساءة الاستخدام</h3>
        <p style={p}>
          نستخدم إجراءات تقنية لتقليل الطلبات الآلية المفرطة وحماية
          خدمات البحث والذكاء الاصطناعي. وقد تعتمد هذه الإجراءات على
          معلومات تقنية للطلب مثل عنوان الشبكة لفترة محدودة.
        </p>

        <h3 style={h3}>9. الإعلانات والروابط التابعة</h3>
        <p style={p}>
          الإعلانات غير مفعلة حاليًا داخل AllWDbook. إذا تم تفعيل شبكة
          إعلانات أو برنامج روابط تسويق بالعمولة مستقبلًا فسنحدّث هذه
          السياسة بما يعكس الاستخدام الفعلي.
        </p>

        <h3 style={h3}>10. الأطفال</h3>
        <p style={p}>
          AllWDbook أداة مخصصة للنشر وأبحاث الكتب وليست موجهة عمدًا
          للأطفال دون سن الثالثة عشرة.
        </p>

        <h3 style={h3}>11. خدمات وأطراف خارجية</h3>
        <p style={p}>
          تعتمد بعض وظائف AllWDbook على خدمات خارجية لتنفيذ الطلبات
          أو الاستضافة أو التحليلات. قد تطبق هذه الجهات سياسات الخصوصية
          الخاصة بها على البيانات التي تصل إليها عند استخدام الوظيفة
          المرتبطة بها.
        </p>

        <h3 style={h3}>12. الاستقلالية وإخلاء المسؤولية</h3>
        <p style={p}>
          AllWDbook أداة مستقلة من All World Digital وليست تابعة
          لـAmazon أو معتمدة منها. بيانات السوق والحسابات والاقتراحات
          تقدم للمساعدة في البحث واتخاذ القرار ويجب التحقق منها عند
          النشر باستخدام أدوات Amazon الرسمية.
        </p>

        <h3 style={h3}>13. تغييرات السياسة</h3>
        <p style={p}>
          قد نحدّث هذه الصفحة عند إضافة مزود خدمة أو تغيير طريقة معالجة
          البيانات. سيظهر تاريخ آخر تحديث أعلى الصفحة.
        </p>

        <h3 style={h3}>14. التواصل</h3>
        <p style={p}>
          لأي سؤال يتعلق بالخصوصية:
          {" "}
          <span style={{ color: "#22c55e" }}>{EMAIL}</span>
        </p>
      </section>

      <section style={box} dir="ltr">
        <h2 style={h2}>Privacy Policy</h2>
        <div style={mut}>Last updated: {UPDATED}</div>

        <div style={note}>
          This page explains what happens to information when you use
          AllWDbook. The tool does not require an account and does not
          ask for payment details or your Amazon password.
        </div>

        <h3 style={h3}>1. Information you enter</h3>
        <p style={p}>
          You may enter search terms, a book topic, calculator inputs
          such as price and page count, or a cover image. How that data
          is handled depends on the feature you use.
        </p>

        <h3 style={h3}>2. Keyword Research and market data</h3>
        <p style={p}>
          When Keyword Research is used, the search phrase may be sent
          to external services needed to obtain suggestions and public
          market data, including book-data services and Amazon
          suggestion endpoints. We do not ask you to attach your name,
          phone number, or Amazon account credentials to that phrase.
        </p>

        <h3 style={h3}>3. Artificial intelligence</h3>
        <p style={p}>
          When you use AI keyword generation, the topic you enter is
          sent to the Groq AI provider to process the request. Do not
          enter personal or confidential information in the topic field.
        </p>

        <h3 style={h3}>4. Cover images</h3>
        <p style={p}>
          In the current Cover Designer, your image is read and processed
          inside your browser. The cover-design feature does not send the
          image to an AllWDbook server for processing.
        </p>

        <h3 style={h3}>5. Storage on your device</h3>
        <p style={p}>
          Some features may use browser local storage to keep preferences
          or temporary data on your device. You can remove this by
          clearing site data in your browser settings.
        </p>

        <h3 style={h3}>6. Hosting and technical analytics</h3>
        <p style={p}>
          AllWDbook is hosted on Vercel and uses Vercel Analytics.
          Technical and usage data related to site requests may therefore
          be processed by the hosting and analytics services, such as
          device or browser information, network address, and visit data.
        </p>

        <h3 style={h3}>7. Feedback and contact</h3>
        <p style={p}>
          The feedback form prepares a message and opens your email app
          or WhatsApp on your device. AllWDbook does not send the message
          automatically; you choose whether to send it. Once sent, the
          selected communication service also applies its own privacy
          terms.
        </p>

        <h3 style={h3}>8. Security and abuse prevention</h3>
        <p style={p}>
          We use technical controls to reduce excessive automated
          requests and protect search and AI services. These controls
          may temporarily rely on request information such as a network
          address.
        </p>

        <h3 style={h3}>9. Advertising and affiliate links</h3>
        <p style={p}>
          Advertising is currently disabled in AllWDbook. If an ad
          network or affiliate-link program is enabled in the future,
          this policy will be updated to reflect the actual use.
        </p>

        <h3 style={h3}>10. Children</h3>
        <p style={p}>
          AllWDbook is a publishing and book-research tool and is not
          intentionally directed to children under thirteen.
        </p>

        <h3 style={h3}>11. External service providers</h3>
        <p style={p}>
          Some AllWDbook features depend on third-party services for
          processing, hosting, analytics, or market-data requests. Those
          providers may apply their own privacy policies to information
          they receive through the relevant feature.
        </p>

        <h3 style={h3}>12. Independence and disclaimer</h3>
        <p style={p}>
          AllWDbook is an independent tool by All World Digital and is
          not affiliated with or endorsed by Amazon. Market data,
          calculations, and suggestions are provided to support research
          and should be verified with official Amazon tools when
          publishing.
        </p>

        <h3 style={h3}>13. Policy changes</h3>
        <p style={p}>
          We may update this page when a service provider is added or
          our data handling changes. The latest revision date appears at
          the top of this page.
        </p>

        <h3 style={h3}>14. Contact</h3>
        <p style={p}>
          For privacy questions:
          {" "}
          <span style={{ color: "#22c55e" }}>{EMAIL}</span>
        </p>
      </section>

      <div
        style={{
          textAlign: "center",
          padding: "8px 0 26px",
          ...mut
        }}
      >
        © {new Date().getFullYear()} All World Digital · AllWDbook™
      </div>
    </main>
  );
}
