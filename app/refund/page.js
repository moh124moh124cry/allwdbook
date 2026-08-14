export const metadata = {
  title:
    "سياسة الاسترداد — AllWDbook | Refund Policy",

  description:
    "سياسة إلغاء واسترداد اشتراكات AllWDbook المدفوعة عبر Lemon Squeezy.",
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
    background: "#fff8e8",

    border:
      "1px solid #e4b34f",

    borderRadius: 11,
    padding: 12,
    marginTop: 12,

    fontSize: 13,
    lineHeight: 1.8,
    color: "#704800",
  },
};

export default function RefundPage() {
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
          سياسة الاسترداد
        </h2>

        <div
          style={styles.muted}
        >
          آخر تحديث: {UPDATED}
        </div>

        <div
          style={styles.note}
        >
          نريد أن يكون قرار الاشتراك
          واضحًا وعادلًا. لا تؤثر هذه
          السياسة على أي حقوق إلزامية
          يمنحها قانون حماية المستهلك
          المطبق على عملية الشراء.
        </div>

        <h3 style={styles.h3}>
          1. طلب استرداد الاشتراك
          الأول
        </h3>

        <p style={styles.p}>
          يمكنك طلب مراجعة استرداد
          الدفعة الأولى خلال 14 يومًا
          تقويميًا من تاريخ الشراء.
          أرسل الطلب من بريد الشراء،
          مع رقم الطلب وسبب مختصر
          للمساعدة في معالجة الطلب.
        </p>

        <h3 style={styles.h3}>
          2. تجديد الاشتراك
        </h3>

        <p style={styles.p}>
          يمكن طلب مراجعة دفعة التجديد
          خلال 7 أيام تقويمية من تاريخ
          التجديد إذا لم يحدث استخدام
          جوهري للأدوات المدفوعة بعد
          التجديد. إلغاء الاشتراك بعد
          التجديد لا ينشئ استردادًا
          تلقائيًا للدفعة المكتملة.
        </p>

        <h3 style={styles.h3}>
          3. الحالات التي نقبل
          مراجعتها دائمًا
        </h3>

        <p style={styles.p}>
          نراجع بعناية حالات الخصم
          المكرر، أو شراء خطة خاطئة ثم
          شراء الخطة الصحيحة، أو عدم
          تفعيل الاشتراك بسبب خطأ تقني
          من AllWDbook، أو عملية دفع
          غير مصرح بها. قد نطلب
          معلومات تساعد على التحقق،
          لكن لا نطلب رقم البطاقة
          الكامل أو كلمة مرور PayPal.
        </p>

        <h3 style={styles.h3}>
          4. الحالات غير القابلة
          للاسترداد عادةً
        </h3>

        <p style={styles.p}>
          لا تمنح المبالغ عادةً عند
          الاستخدام الجوهري للخدمة،
          أو مخالفة شروط الاستخدام،
          أو محاولة تجاوز الحدود، أو
          مشاركة الحساب، أو عدم الحاجة
          إلى الأداة بعد استخدامها، أو
          نسيان الإلغاء خارج مهلة
          مراجعة التجديد، إلا إذا تطلب
          القانون خلاف ذلك.
        </p>

        <h3 style={styles.h3}>
          5. الإلغاء مقابل الاسترداد
        </h3>

        <p style={styles.p}>
          الإلغاء يوقف التجديدات
          المستقبلية، لكنه لا يعني
          تلقائيًا استرداد دفعة سابقة.
          بعد الإلغاء تبقى الصلاحية
          عادةً حتى نهاية الفترة
          المدفوعة. يمكنك الإلغاء من
          زر إدارة الاشتراك والفواتير
          داخل قائمة الحساب.
        </p>

        <h3 style={styles.h3}>
          6. طريقة تقديم الطلب
        </h3>

        <p style={styles.p}>
          أرسل رسالة إلى {EMAIL} تتضمن
          بريد الشراء، ورقم طلب Lemon
          Squeezy، واسم الخطة، وتاريخ
          الدفع، وسبب الطلب. لا ترسل
          بيانات البطاقة أو كلمة مرور
          أي حساب.
        </p>

        <h3 style={styles.h3}>
          7. معالجة الاسترداد
        </h3>

        <p style={styles.p}>
          تتم المدفوعات والاستردادات
          عبر Lemon Squeezy. عند
          الموافقة، يعاد المبلغ إلى
          وسيلة الدفع الأصلية. يختلف
          وقت ظهور المبلغ حسب مزود
          الدفع أو البنك ولا يتحكم
          AllWDbook في مدة التسوية
          النهائية.
        </p>

        <h3 style={styles.h3}>
          8. النزاعات وعمليات رد
          المبالغ
        </h3>

        <p style={styles.p}>
          تواصل معنا أولًا إذا لم
          تتعرف على العملية أو واجهت
          مشكلة. تقديم نزاع أو
          Chargeback كاذب قد يؤدي إلى
          تعليق الحساب، مع بقاء حق
          العميل في استخدام وسائل
          الاعتراض القانونية المشروعة.
        </p>

        <h3 style={styles.h3}>
          9. تغيير السياسة
        </h3>

        <p style={styles.p}>
          قد نحدّث هذه السياسة عند
          تغيير الخطط أو مزود الدفع أو
          المتطلبات القانونية. يطبق
          الإصدار المنشور وقت تقديم
          الطلب، مع احترام الحقوق
          الإلزامية المرتبطة بتاريخ
          الشراء.
        </p>

        <h3 style={styles.h3}>
          10. الصفحات المرتبطة
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
            href="/privacy"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            سياسة الخصوصية
          </a>
          .
        </p>
      </section>

      <section
        style={styles.box}
        dir="ltr"
      >
        <h2 style={styles.h2}>
          Refund Policy
        </h2>

        <div
          style={styles.muted}
        >
          Last updated: {UPDATED}
        </div>

        <div
          style={styles.note}
        >
          We want subscription
          decisions to be clear and
          fair. This policy does not
          limit mandatory consumer
          rights that apply to a
          purchase.
        </div>

        <h3 style={styles.h3}>
          1. First subscription payment
        </h3>

        <p style={styles.p}>
          You may request a review of
          the first subscription
          payment within 14 calendar
          days of purchase. Contact us
          from the purchase email and
          include the order number and
          a short reason for the
          request.
        </p>

        <h3 style={styles.h3}>
          2. Subscription renewals
        </h3>

        <p style={styles.p}>
          A renewal payment may be
          reviewed within 7 calendar
          days of renewal if there has
          been no substantial use of
          the paid tools after renewal.
          Cancelling after renewal does
          not automatically refund a
          completed payment.
        </p>

        <h3 style={styles.h3}>
          3. Cases we always review
        </h3>

        <p style={styles.p}>
          We carefully review duplicate
          charges, purchasing the wrong
          plan before purchasing the
          correct one, failure to
          activate because of an
          AllWDbook technical error,
          and unauthorized payments. We
          may request verification
          details, but never your full
          card number or PayPal
          password.
        </p>

        <h3 style={styles.h3}>
          4. Normally non-refundable
          cases
        </h3>

        <p style={styles.p}>
          Refunds are normally
          unavailable after substantial
          service use, a breach of the
          Terms of Use, attempts to
          bypass limits, account
          sharing, no longer needing a
          tool after using it, or
          forgetting to cancel outside
          the renewal-review period,
          unless applicable law requires
          otherwise.
        </p>

        <h3 style={styles.h3}>
          5. Cancellation versus refund
        </h3>

        <p style={styles.p}>
          Cancellation stops future
          renewals but does not
          automatically refund a
          previous payment. Access
          normally remains available
          until the end of the paid
          period. You can cancel using
          the subscription and billing
          link in the account menu.
        </p>

        <h3 style={styles.h3}>
          6. How to submit a request
        </h3>

        <p style={styles.p}>
          Email {EMAIL} with the
          purchase email, Lemon Squeezy
          order number, plan name,
          payment date and reason for
          the request. Never send card
          details or any account
          password.
        </p>

        <h3 style={styles.h3}>
          7. Refund processing
        </h3>

        <p style={styles.p}>
          Payments and refunds are
          processed through Lemon
          Squeezy. When approved, funds
          are returned to the original
          payment method. The time
          required to appear depends on
          the payment provider or bank
          and is outside AllWDbook final
          settlement control.
        </p>

        <h3 style={styles.h3}>
          8. Disputes and chargebacks
        </h3>

        <p style={styles.p}>
          Contact us first if you do
          not recognize a payment or
          experience a problem. A
          fraudulent dispute or
          chargeback may result in
          account suspension, without
          limiting a customer right to
          use legitimate legal dispute
          procedures.
        </p>

        <h3 style={styles.h3}>
          9. Policy changes
        </h3>

        <p style={styles.p}>
          This policy may be updated
          when plans, payment providers
          or legal requirements change.
          The version published when a
          request is submitted applies,
          subject to mandatory rights
          connected to the purchase
          date.
        </p>

        <h3 style={styles.h3}>
          10. Related pages
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
            href="/privacy"
            style={{
              color: "#1459a6",
              fontWeight: 800,
            }}
          >
            Privacy Policy
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
