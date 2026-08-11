export const metadata = {
  title: "سياسة الخصوصية — AllWDbook | Privacy Policy",
  description: "سياسة خصوصية أداة AllWDbook من All World Digital. Privacy policy for AllWDbook by All World Digital."
};

const UPDATED = "11 August 2026";
const EMAIL = "anesscherfaoui@gmail.com";

const box = {
  background: "#131d33",
  border: "1px solid #22304f",
  borderRadius: "12px",
  padding: "18px",
  marginBottom: "18px",
  color: "#e8eefc"
};

const h2 = {
  fontSize: "20px",
  margin: "0 0 6px 0",
  color: "#22c55e"
};

const h3 = {
  fontSize: "15px",
  margin: "16px 0 4px 0",
  color: "#3b82f6"
};

const p = {
  fontSize: "14px",
  lineHeight: "1.9",
  margin: "0 0 6px 0",
  color: "#e8eefc"
};

const mut = {
  fontSize: "12px",
  color: "#93a4c4",
  lineHeight: "1.8"
};

export default function Privacy() {
  return (
    <main className="wrap" style={{ paddingBottom: "120px" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 0" }}>
        <img src="/logov3.png" alt="AllWDbook" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
        <div>
          <div style={{ fontWeight: "bold", fontSize: "17px", color: "#e8eefc" }}>AllWDbook</div>
          <div style={mut}>All World Digital</div>
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <a href="/" style={{ color: "#3b82f6", fontSize: "13px", textDecoration: "none" }}>
          الرجوع الى الاداة / Back to the tool
        </a>
      </div>

      <div style={box} dir="rtl">
        <h2 style={h2}>سياسة الخصوصية</h2>
        <div style={mut}>آخر تحديث: {UPDATED}</div>

        <h3 style={h3}>1. ملخص سريع</h3>
        <p style={p}>
          AllWDbook اداة مجانية لناشري كتب امازون. لا نطلب تسجيل حساب، ولا نجمع بياناتك الشخصية،
          ولا نبيع اي معلومات لاي جهة.
        </p>

        <h3 style={h3}>2. ما لا نجمعه ابدا</h3>
        <p style={p}>
          لا نجمع الاسم، ولا رقم الهاتف، ولا كلمات المرور، ولا بيانات الدفع، ولا معلومات حساب امازون الخاص بك.
        </p>

        <h3 style={h3}>3. صور الاغلفة</h3>
        <p style={p}>
          كل معالجة الصور في مصمم الغلاف تتم داخل متصفح هاتفك فقط. الصورة لا ترفع الى اي خادم،
          ولا نحتفظ بنسخة منها، وتختفي بمجرد اغلاق الصفحة.
        </p>

        <h3 style={h3}>4. الذكاء الاصطناعي</h3>
        <p style={p}>
          عند استخدام مولد الكلمات المفتاحية، يرسل النص الذي كتبته الى مزود الذكاء الاصطناعي Groq
          لتوليد اقتراحات. لا نرسل معه اي معرف شخصي.
        </p>

        <h3 style={h3}>5. التخزين المحلي</h3>
        <p style={p}>
          نحفظ اختيار اللغة وقائمة الكتب التي تتابعها داخل ذاكرة المتصفح على جهازك فقط.
          يمكنك محوها بمسح بيانات الموقع من اعدادات المتصفح.
        </p>

        <h3 style={h3}>6. نموذج الاقتراحات</h3>
        <p style={p}>
          عند ارسال اقتراح او شكوى، تفتح رسالتك في واتساب او البريد الالكتروني على جهازك،
          وانت من يضغط زر الارسال. لا نخزن الرسالة في اي قاعدة بيانات.
        </p>

        <h3 style={h3}>7. سجلات الاستضافة</h3>
        <p style={p}>
          الموقع مستضاف على Vercel، وهي تحتفظ بسجلات تقنية مؤقتة مثل نوع المتصفح وعنوان IP
          لاغراض الامان ومنع اساءة الاستخدام.
        </p>

        <h3 style={h3}>8. الاعلانات</h3>
        <p style={p}>
          قد نعرض مستقبلا اعلانات لتغطية تكاليف التشغيل. عند تفعيلها سنحدث هذه الصفحة
          ونوضح اسم شبكة الاعلانات المستخدمة.
        </p>

        <h3 style={h3}>9. روابط الشركاء</h3>
        <p style={p}>
          قد تحتوي بعض الروابط على معرف تسويق بالعمولة من امازون. هذا لا يزيد السعر عليك اطلاقا.
        </p>

        <h3 style={h3}>10. الاطفال</h3>
        <p style={p}>
          الاداة موجهة للناشرين البالغين ولا تستهدف الاطفال دون سن الثالثة عشرة.
        </p>

        <h3 style={h3}>11. اخلاء مسؤولية</h3>
        <p style={p}>
          الارقام والاقتراحات في الاداة تقديرية للاسترشاد فقط وليست نصيحة مالية.
          راجع دائما Print Previewer الرسمي قبل النشر.
          AllWDbook اداة مستقلة وغير تابعة لشركة امازون ولا معتمدة منها.
        </p>

        <h3 style={h3}>12. التواصل</h3>
        <p style={p}>
          لاي سؤال حول الخصوصية راسلنا على: <span style={{ color: "#22c55e" }}>{EMAIL}</span>
        </p>
      </div>

      <div style={box} dir="ltr">
        <h2 style={h2}>Privacy Policy</h2>
        <div style={mut}>Last updated: {UPDATED}</div>

        <h3 style={h3}>1. Quick summary</h3>
        <p style={p}>
          AllWDbook is a free tool for Amazon book publishers. No account is required,
          we do not collect your personal data, and we never sell information to anyone.
        </p>

        <h3 style={h3}>2. What we never collect</h3>
        <p style={p}>
          We do not collect your name, phone number, passwords, payment details,
          or your Amazon account credentials.
        </p>

        <h3 style={h3}>3. Cover images</h3>
        <p style={p}>
          All image processing in the Cover Designer happens inside your own browser.
          Your artwork is never uploaded to any server and disappears when you close the page.
        </p>

        <h3 style={h3}>4. Artificial intelligence</h3>
        <p style={p}>
          When you use the keyword generator, the topic you typed is sent to the Groq AI provider
          to produce suggestions. No personal identifier is attached to that request.
        </p>

        <h3 style={h3}>5. Local storage</h3>
        <p style={p}>
          We store your language choice and your tracked book list inside your own browser storage.
          You can erase it by clearing site data in your browser settings.
        </p>

        <h3 style={h3}>6. Feedback form</h3>
        <p style={p}>
          When you send feedback, your message opens in WhatsApp or your email app on your device,
          and you press send yourself. We do not store it in any database.
        </p>

        <h3 style={h3}>7. Hosting logs</h3>
        <p style={p}>
          The site is hosted on Vercel, which keeps temporary technical logs such as browser type
          and IP address for security and abuse prevention.
        </p>

        <h3 style={h3}>8. Advertising</h3>
        <p style={p}>
          We may display ads in the future to cover running costs. When that happens we will update
          this page and name the advertising network we use.
        </p>

        <h3 style={h3}>9. Affiliate links</h3>
        <p style={p}>
          Some links may carry an Amazon affiliate identifier. This never increases the price you pay.
        </p>

        <h3 style={h3}>10. Children</h3>
        <p style={p}>
          This tool is intended for adult publishers and is not directed at children under thirteen.
        </p>

        <h3 style={h3}>11. Disclaimer</h3>
        <p style={p}>
          All numbers and suggestions are estimates for guidance only and are not financial advice.
          Always verify with the official Print Previewer before publishing.
          AllWDbook is an independent tool and is not affiliated with or endorsed by Amazon.
        </p>

        <h3 style={h3}>12. Contact</h3>
        <p style={p}>
          For any privacy question, write to us at: <span style={{ color: "#22c55e" }}>{EMAIL}</span>
        </p>
      </div>

      <div style={{ textAlign: "center", padding: "10px 0 30px 0", ...mut }}>
        © {new Date().getFullYear()} All World Digital · AllWDbook™
      </div>

    </main>
  );
}
