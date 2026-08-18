export const metadata = {
  title:
    "عن AllWDbook — المنهجية والمصادر | About & Methodology",

  description:
    "كيف تعمل أدوات AllWDbook، وما الفرق بين بيانات السوق الفعلية والتقديرات الحسابية واقتراحات الذكاء الاصطناعي.",

  alternates: {
    canonical:
      "/about",
  },
};

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
  margin: "0 0 8px",
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

const tag = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#0e1729",
  border: "1px solid #2b3c63",
  fontSize: "12px",
  margin: "3px 3px 6px",
  color: "#cbd5e1"
};

export default function About() {
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
        <h2 style={h2}>عن AllWDbook والمنهجية</h2>

        <p style={p}>
          AllWDbook مجموعة أدوات مساعدة لناشري Amazon KDP. الهدف هو
          جمع البحث والتقدير والتنسيق وتصميم الغلاف في مكان واحد،
          مع توضيح مصدر كل نتيجة بدل تقديم التقديرات على أنها حقائق
          مضمونة.
        </p>

        <div>
          <span style={tag}>🟢 بيانات سوق</span>
          <span style={tag}>🧮 تقدير حسابي</span>
          <span style={tag}>🤖 اقتراح AI</span>
          <span style={tag}>💡 فكرة غير مختبرة</span>
        </div>

        <h3 style={h3}>1. Keyword Research</h3>
        <p style={p}>
          البحث يجلب نتائج كتب وبيانات متاحة للسوق المحدد، ويستخدم
          اقتراحات بحث Amazon عندما تكون متاحة. السعر وBSR والمراجعات
          المعروضة تأتي من عينة النتائج التي استطاعت الأداة قياسها.
        </p>
        <p style={p}>
          المبيعات اليومية والأرباح الشهرية ليست أرقام مبيعات صادرة
          من Amazon؛ هي تقديرات مشتقة من BSR والسعر وعدد الصفحات
          ومعادلات الأداة. لذلك نعرض أيضًا حجم العينة ومستوى الثقة.
        </p>

        <h3 style={h3}>2. Opportunity Score</h3>
        <p style={p}>
          الدرجة من 100 هي مؤشر داخلي للمقارنة بين الكلمات المفتاحية،
          مبني على المقاييس المتاحة مثل BSR والمراجعات والسعر. ليست
          ضمانًا للربح ولا حكمًا نهائيًا على نجاح النيتش.
        </p>

        <h3 style={h3}>3. Micro-Niche</h3>
        <p style={p}>
          مولد Micro-Niche ينشئ أفكارًا يمكن استخدامها كنقطة بداية.
          قبل التحقق تعتبر الفكرة غير مختبرة.
        </p>
        <p style={p}>
          عند استخدام زر التحقق، تقارن الأداة جزءًا من الأفكار
          باقتراحات Amazon وتعرض مستوى طلب تقريبيًا اعتمادًا على
          وجود العبارة وعمق الاقتراحات. هذا المؤشر ليس حجم بحث شهريًا
          ولا بيانات مبيعات.
        </p>

        <h3 style={h3}>4. اقتراحات الذكاء الاصطناعي</h3>
        <p style={p}>
          اقتراحات AI يتم توليدها عبر Groq لتوسيع الأفكار والكلمات
          المحتملة. ظهور عبارة في اقتراحات AI لا يعني أن عليها طلبًا
          مثبتًا؛ الأفضل تحليلها بعد ذلك في Keyword Research.
        </p>

        <h3 style={h3}>5. حاسبة KDP</h3>
        <p style={p}>
          الحاسبة تستخدم السعر وعدد الصفحات ونوع الطباعة والسوق لإنتاج
          تقدير لتكلفة الطباعة ونسبة وإيراد الوحدة. القيم مفيدة
          للتخطيط، لكن يجب التحقق من القيم النهائية داخل أدوات Amazon
          الرسمية قبل النشر.
        </p>

        <h3 style={h3}>6. مصمم الغلاف</h3>
        <p style={p}>
          مصمم الغلاف يحسب الأبعاد والكعب والهوامش حسب مدخلاتك،
          ويعالج الصورة داخل المتصفح. يجب دائمًا تمرير الملف النهائي
          عبر Print Previewer الرسمي قبل نشر الكتاب.
        </p>

        <h3 style={h3}>7. Formatter</h3>
        <p style={p}>
          أداة التنسيق تحول النص الذي تدخله إلى HTML منسق داخل
          المتصفح. لا تقيس السوق ولا تستخدم الذكاء الاصطناعي.
        </p>

        <h3 style={h3}>8. مبدأ الشفافية</h3>
        <p style={p}>
          عندما تكون النتيجة تقديرًا نسميها تقديرًا، وعندما تكون فكرة
          غير مختبرة نوضح ذلك، وعندما تأتي البيانات من عينة نعرض حجم
          العينة قدر الإمكان. الهدف أن تساعدك الأداة في اتخاذ قرار
          أفضل، لا أن تستبدل التحقق المهني قبل النشر.
        </p>

        <h3 style={h3}>9. الاستقلالية</h3>
        <p style={p}>
          AllWDbook منتج مستقل من All World Digital، وليس تابعًا
          لـAmazon ولا معتمدًا منها. Amazon وKDP والعلامات المرتبطة
          بهما تعود إلى أصحابها.
        </p>
      </section>

      <section style={box} dir="ltr">
        <h2 style={h2}>About AllWDbook & Methodology</h2>

        <p style={p}>
          AllWDbook is a toolkit for Amazon KDP publishers. Its purpose
          is to bring research, estimation, formatting and cover
          preparation into one place while clearly separating measured
          market data from estimates and generated ideas.
        </p>

        <div>
          <span style={tag}>🟢 Market data</span>
          <span style={tag}>🧮 Calculated estimate</span>
          <span style={tag}>🤖 AI suggestion</span>
          <span style={tag}>💡 Untested idea</span>
        </div>

        <h3 style={h3}>1. Keyword Research</h3>
        <p style={p}>
          Keyword Research retrieves book results for the selected
          marketplace and uses Amazon search suggestions when available.
          Displayed price, BSR and review metrics are calculated from the
          result sample the tool was able to measure.
        </p>
        <p style={p}>
          Daily sales and monthly royalty figures are not Amazon sales
          reports. They are estimates derived from BSR, price, page
          count and AllWDbook calculation models. Sample size and a
          confidence level are shown to provide context.
        </p>

        <h3 style={h3}>2. Opportunity Score</h3>
        <p style={p}>
          The score out of 100 is an internal comparison indicator based
          on available metrics such as BSR, reviews and price. It is not
          a profit guarantee or a final verdict on a niche.
        </p>

        <h3 style={h3}>3. Micro-Niche</h3>
        <p style={p}>
          Micro-Niche generates ideas intended as starting points.
          Before validation, an idea should be treated as untested.
        </p>
        <p style={p}>
          When validation is requested, a subset of ideas is compared
          with Amazon suggestions. The demand badge is a heuristic based
          on phrase presence and suggestion depth. It is not monthly
          search volume and it is not sales data.
        </p>

        <h3 style={h3}>4. AI suggestions</h3>
        <p style={p}>
          AI keyword suggestions are generated through Groq to expand
          possible ideas. An AI-generated phrase does not prove market
          demand; it should be checked with Keyword Research afterward.
        </p>

        <h3 style={h3}>5. KDP Calculator</h3>
        <p style={p}>
          The calculator uses list price, page count, print type and
          marketplace to estimate printing cost, royalty rate and
          royalty per unit. Final publishing figures should always be
          verified with Amazon's official tools.
        </p>

        <h3 style={h3}>6. Cover Designer</h3>
        <p style={p}>
          Cover Designer calculates dimensions, spine width and margins
          from your inputs and processes the image in the browser. Always
          verify the exported file with the official Print Previewer
          before publishing.
        </p>

        <h3 style={h3}>7. Formatter</h3>
        <p style={p}>
          Formatter converts the text you enter into formatted HTML in
          the browser. It does not perform market research or use AI.
        </p>

        <h3 style={h3}>8. Transparency principle</h3>
        <p style={p}>
          Estimates are labeled as estimates, untested ideas are labeled
          as such, and sample size is shown where possible. The goal is
          to support better decisions, not replace professional
          verification before publishing.
        </p>

        <h3 style={h3}>9. Independence</h3>
        <p style={p}>
          AllWDbook is an independent product by All World Digital and
          is not affiliated with or endorsed by Amazon. Amazon, KDP and
          related marks belong to their respective owners.
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
