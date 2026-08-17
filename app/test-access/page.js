"use client";

import {
  useState,
} from "react";

import {
  getSupabase,
} from "../../lib/supabase";


const PLANS = [
  {
    id: "pro_monthly",
    label: "AllWDbook Pro — شهري",
  },
  {
    id: "cover",
    label: "مصمم الأغلفة",
  },
  {
    id: "micro_niche",
    label: "Micro-Niche",
  },
  {
    id: "keywords",
    label: "الكلمات المفتاحية",
  },
  {
    id: "pro_yearly",
    label: "AllWDbook Pro — سنوي",
  },
  {
    id: "lifetime",
    label: "Lifetime",
  },
];


async function ensureSession() {
  const supabase =
    getSupabase();

  const {
    data: {
      session,
    },
  } =
    await supabase.auth.getSession();

  if (session) {
    return session;
  }

  const {
    data,
    error,
  } =
    await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (
    !data?.session
  ) {
    throw new Error(
      "SESSION_MISSING",
    );
  }

  return data.session;
}


function deviceInfo() {
  return {
    platform:
      navigator.platform ||
      "",

    language:
      navigator.language ||
      "",

    mobile:
      /Android|iPhone|iPad|iPod|Mobile/i.test(
        navigator.userAgent ||
          "",
      ),
  };
}


export default function TestAccessPage() {
  const [
    secret,
    setSecret,
  ] =
    useState("");

  const [
    planId,
    setPlanId,
  ] =
    useState(
      "pro_monthly",
    );

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState(null);

  const [
    copied,
    setCopied,
  ] =
    useState(false);


  async function grantAccess(
    event,
  ) {
    event.preventDefault();

    if (
      !secret.trim()
    ) {
      setError(
        "أدخل مفتاح الاختبار السري الموجود في Vercel.",
      );

      return;
    }


    setBusy(true);
    setError("");
    setResult(null);
    setCopied(false);


    try {
      const session =
        await ensureSession();


      const response =
        await fetch(
          "/api/access-key/test-grant",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                secret:
                  secret.trim(),

                planId,

                deviceName:
                  "جهاز اختبار AllWDbook",

                deviceInfo:
                  deviceInfo(),
              }),
          },
        );


      const data =
        await response
          .json()
          .catch(
            () => ({}),
          );


      if (
        !response.ok
      ) {
        if (
          data?.error ===
          "INVALID_TEST_SECRET"
        ) {
          setError(
            "مفتاح الاختبار السري غير صحيح.",
          );
        } else if (
          data?.error ===
          "TEST_GRANT_DISABLED"
        ) {
          setError(
            "نظام الاختبار معطّل في Vercel.",
          );
        } else if (
          data?.error ===
          "TEST_SECRET_NOT_CONFIGURED"
        ) {
          setError(
            "مفتاح الاختبار غير مضبوط في Vercel.",
          );
        } else if (
          data?.error ===
          "RATE_LIMITED"
        ) {
          setError(
            "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.",
          );
        } else if (
          data?.error ===
          "INVALID_TEST_PLAN"
        ) {
          setError(
            "الخطة المختارة غير صالحة للاختبار.",
          );
        } else if (
          data?.error ===
          "ACTIVATION_LIMIT_REACHED"
        ) {
          setError(
            "وصل مفتاح الاختبار إلى الحد الأقصى للأجهزة.",
          );
        } else {
          setError(
            `فشل منح الخطة: ${
              data?.error ||
              "TEST_GRANT_FAILED"
            }`,
          );
        }

        return;
      }


      setResult({
        planId:
          data?.planId ||
          planId,

        code:
          data?.code ||
          "",

        codeHint:
          data?.codeHint ||
          "",

        reused:
          Boolean(
            data?.reused,
          ),

        accessKeyId:
          data?.accessKeyId ||
          "",
      });


      /*
       * نطلب من بقية الموقع
       * تحديث حالة الوصول.
       */
      window.dispatchEvent(
        new Event(
          "allwdbook-access-refresh",
        ),
      );
    } catch (grantError) {
      console.error(
        "Test access grant failed:",
        grantError,
      );

      setError(
        "تعذر إنشاء جلسة الاختبار أو الاتصال بالخادم.",
      );
    } finally {
      setBusy(false);
    }
  }


  async function copyCode() {
    if (
      !result?.code
    ) {
      return;
    }

    try {
      await navigator
        .clipboard
        .writeText(
          result.code,
        );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1600,
      );
    } catch {
      setError(
        "تعذر نسخ الرمز تلقائيًا.",
      );
    }
  }


  return (
    <main
      className="test-page"
      dir="rtl"
    >
      <div className="test-wrap">

        <section className="test-card">

          <div className="test-logo">
            <img
              src="/logov3.png"
              alt="AllWDbook"
            />
          </div>


          <div className="test-badge">
            🧪 اختبار داخلي مؤقت
          </div>


          <h1>
            منح خطة اختبار
          </h1>


          <p className="test-description">
            هذه الصفحة مخصصة فقط
            لاختبار نظام AWD-KEY
            وبريد الحماية والاستعادة.
            لا يوجد أي دفع حقيقي.
          </p>


          {!result ? (
            <form
              onSubmit={
                grantAccess
              }
            >

              <label
                className="test-label"
                htmlFor="test-plan"
              >
                الخطة التجريبية
              </label>

              <select
                id="test-plan"
                className="test-input"
                value={
                  planId
                }
                onChange={(
                  event,
                ) =>
                  setPlanId(
                    event
                      .target
                      .value,
                  )
                }
                disabled={
                  busy
                }
              >
                {PLANS.map(
                  (plan) => (
                    <option
                      key={
                        plan.id
                      }
                      value={
                        plan.id
                      }
                    >
                      {
                        plan.label
                      }
                    </option>
                  ),
                )}
              </select>


              <label
                className="test-label"
                htmlFor="test-secret"
              >
                مفتاح الاختبار السري
              </label>

              <input
                id="test-secret"
                className="test-input"
                type="password"
                dir="ltr"
                autoComplete="off"
                spellCheck="false"
                placeholder="ALLWDBOOK_TEST_GRANT_SECRET"
                value={
                  secret
                }
                onChange={(
                  event,
                ) =>
                  setSecret(
                    event
                      .target
                      .value,
                  )
                }
                disabled={
                  busy
                }
              />


              <div className="test-warning">
                🔒 لا ترسل هذا السر لأي شخص
                ولا تضعه داخل GitHub.
                اكتبه هنا فقط أثناء الاختبار.
              </div>


              {error && (
                <div
                  className="test-error"
                  role="alert"
                >
                  {error}
                </div>
              )}


              <button
                type="submit"
                className="test-primary"
                disabled={
                  busy
                }
              >
                {busy
                  ? "جارٍ إنشاء الخطة..."
                  : "⚡ منح هذا الجهاز Pro للاختبار"}
              </button>

            </form>
          ) : (
            <div>

              <div className="test-success-icon">
                ✓
              </div>


              <h2>
                تم منح الخطة بنجاح
              </h2>


              <p className="test-success-text">
                هذا الجهاز أصبح مرتبطًا
                بخطة الاختبار.
              </p>


              <div className="test-info">

                <small>
                  الخطة
                </small>

                <strong>
                  {
                    result.planId
                  }
                </strong>

              </div>


              {result.code ? (
                <>
                  <div className="test-code">
                    {
                      result.code
                    }
                  </div>

                  <button
                    type="button"
                    className="test-secondary"
                    onClick={
                      copyCode
                    }
                  >
                    {copied
                      ? "تم النسخ ✓"
                      : "📋 نسخ AWD-KEY"}
                  </button>
                </>
              ) : result.codeHint ? (
                <div className="test-code">
                  {
                    result.codeHint
                  }
                </div>
              ) : null}


              {result.reused && (
                <div className="test-note">
                  ♻️ تم استخدام مفتاح
                  اختبار موجود مسبقًا
                  بدل إنشاء مفتاح جديد.
                </div>
              )}


              <a
                href="/"
                className="test-primary test-link"
              >
                🚀 العودة إلى AllWDbook
              </a>

            </div>
          )}

        </section>


        <p className="test-footer">
          احذف هذه الصفحة وعطّل
          نظام الاختبار بعد الانتهاء.
        </p>

      </div>


      <style jsx>{`

        .test-page,
        .test-page * {
          box-sizing:
            border-box;
        }


        .test-page {
          min-height:
            100dvh;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            24px 16px;

          background:
            radial-gradient(
              circle at
              50% 0%,
              rgba(
                255,
                107,
                0,
                0.12
              ),
              transparent
              36%
            ),
            #020c18;

          color:
            white;

          font-family:
            inherit;
        }


        .test-wrap {
          width:
            min(
              100%,
              460px
            );
        }


        .test-card {
          padding:
            24px 20px;

          border:
            1px solid
            #263b57;

          border-radius:
            26px;

          background:
            linear-gradient(
              160deg,
              #0d1b2f,
              #071424
            );

          box-shadow:
            0 30px 80px
            rgba(
              0,
              0,
              0,
              0.48
            );
        }


        .test-logo {
          width:
            72px;

          height:
            72px;

          margin:
            0 auto 14px;

          padding:
            5px;

          border-radius:
            20px;

          background:
            rgba(
              255,
              107,
              0,
              0.08
            );
        }


        .test-logo img {
          width:
            100%;

          height:
            100%;

          display:
            block;

          border-radius:
            16px;

          object-fit:
            cover;
        }


        .test-badge {
          width:
            fit-content;

          margin:
            0 auto 14px;

          padding:
            7px 11px;

          border:
            1px solid
            rgba(
              255,
              179,
              64,
              0.28
            );

          border-radius:
            999px;

          background:
            rgba(
              255,
              174,
              44,
              0.07
            );

          color:
            #ffc15b;

          font-size:
            10px;

          font-weight:
            800;
        }


        h1,
        h2 {
          margin:
            0;

          text-align:
            center;

          color:
            white;
        }


        h1 {
          font-size:
            25px;
        }


        h2 {
          font-size:
            22px;
        }


        .test-description {
          margin:
            10px auto 22px;

          max-width:
            350px;

          text-align:
            center;

          color:
            #8fa0b7;

          font-size:
            12px;

          line-height:
            1.8;
        }


        .test-label {
          display:
            block;

          margin:
            15px 2px 7px;

          color:
            #aab7c8;

          font-size:
            11px;

          font-weight:
            800;
        }


        .test-input {
          width:
            100%;

          min-height:
            56px;

          padding:
            12px 14px;

          border:
            1px solid
            #2a405d;

          border-radius:
            14px;

          outline:
            none;

          background:
            #04111f;

          color:
            white;

          font-size:
            14px;
        }


        .test-input:focus {
          border-color:
            #ff6b00;

          box-shadow:
            0 0 0 3px
            rgba(
              255,
              107,
              0,
              0.08
            );
        }


        .test-warning {
          margin-top:
            13px;

          padding:
            11px 12px;

          border:
            1px solid
            #29405c;

          border-radius:
            13px;

          background:
            rgba(
              44,
              103,
              168,
              0.07
            );

          color:
            #8499b3;

          font-size:
            10px;

          line-height:
            1.7;
        }


        .test-error {
          margin-top:
            13px;

          padding:
            12px;

          border:
            1px solid
            rgba(
              255,
              84,
              84,
              0.28
            );

          border-radius:
            13px;

          background:
            rgba(
              255,
              72,
              72,
              0.08
            );

          color:
            #ff9d9d;

          font-size:
            11px;

          line-height:
            1.6;
        }


        .test-primary,
        .test-secondary {
          width:
            100%;

          min-height:
            56px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          margin-top:
            16px;

          border-radius:
            14px;

          font-size:
            13px;

          font-weight:
            900;

          text-decoration:
            none;

          cursor:
            pointer;
        }


        .test-primary {
          border:
            1px solid
            #ff6b00;

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff7d22
            );

          color:
            white;

          box-shadow:
            0 15px 35px
            rgba(
              255,
              105,
              0,
              0.13
            );
        }


        .test-secondary {
          border:
            1px solid
            #2b405b;

          background:
            #0c1c30;

          color:
            #dce6f3;
        }


        .test-primary:disabled,
        .test-secondary:disabled {
          opacity:
            0.55;

          cursor:
            not-allowed;
        }


        .test-success-icon {
          width:
            64px;

          height:
            64px;

          display:
            grid;

          place-items:
            center;

          margin:
            0 auto 15px;

          border:
            1px solid
            rgba(
              54,
              218,
              151,
              0.35
            );

          border-radius:
            20px;

          background:
            rgba(
              34,
              197,
              125,
              0.1
            );

          color:
            #6fe4af;

          font-size:
            32px;

          font-weight:
            900;
        }


        .test-success-text {
          margin:
            8px 0 18px;

          text-align:
            center;

          color:
            #8da2b9;

          font-size:
            11px;
        }


        .test-info {
          padding:
            13px;

          border:
            1px solid
            #29415d;

          border-radius:
            14px;

          background:
            #061426;
        }


        .test-info small {
          display:
            block;

          color:
            #7589a2;

          font-size:
            9px;
        }


        .test-info strong {
          display:
            block;

          margin-top:
            5px;

          color:
            white;

          font-size:
            13px;
        }


        .test-code {
          margin-top:
            11px;

          padding:
            15px 10px;

          border:
            1px solid
            #30445d;

          border-radius:
            14px;

          background:
            #020d18;

          color:
            #ffc463;

          direction:
            ltr;

          text-align:
            center;

          overflow-wrap:
            anywhere;

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size:
            12px;

          line-height:
            1.7;

          user-select:
            all;
        }


        .test-note {
          margin-top:
            12px;

          padding:
            11px;

          border:
            1px solid
            rgba(
              65,
              153,
              244,
              0.22
            );

          border-radius:
            13px;

          background:
            rgba(
              52,
              128,
              212,
              0.06
            );

          color:
            #8fb0d3;

          font-size:
            10px;

          line-height:
            1.7;
        }


        .test-link {
          margin-top:
            18px;
        }


        .test-footer {
          margin:
            14px 0 0;

          text-align:
            center;

          color:
            #60728a;

          font-size:
            9px;

          line-height:
            1.6;
        }


        @media (
          max-width:
            420px
        ) {
          .test-page {
            align-items:
              flex-start;

            padding:
              16px 12px;
          }


          .test-card {
            padding:
              21px 16px;

            border-radius:
              23px;
          }


          h1 {
            font-size:
              22px;
          }
        }

      `}</style>

    </main>
  );
}
