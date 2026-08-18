"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";


function number(value) {
  return Number(value || 0).toLocaleString("en-US");
}


function planTitle(plan) {
  return (
    plan?.nameAr ||
    plan?.nameEn ||
    plan?.id ||
    "خطة"
  );
}


export default function AdminPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);

  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [lifetimeItems, setLifetimeItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* manual grant */

  const [grantPlanId, setGrantPlanId] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantNote, setGrantNote] = useState("");
  const [grantResult, setGrantResult] = useState(null);

  /* legacy lifetime */

  const [lifeEmail, setLifeEmail] = useState("");
  const [lifeNote, setLifeNote] = useState("");


  /* =======================================================
     API
     ======================================================= */

  const apiRequest = useCallback(
    async (path, options = {}) => {
      if (!session?.access_token) {
        throw new Error("NO_SESSION");
      }

      const response = await fetch(path, {
        ...options,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          ...(options.headers || {}),
        },

        cache: "no-store",
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const err = new Error(
          data?.error || "REQUEST_FAILED"
        );

        err.status = response.status;

        throw err;
      }

      return data;
    },
    [session]
  );


  /* =======================================================
     LOAD
     ======================================================= */

  const loadDashboard = useCallback(async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError("");

    try {
      const [
        overviewData,
        lifetimeData,
        grantData,
      ] = await Promise.all([
        apiRequest("/api/admin/overview"),
        apiRequest("/api/admin/lifetime"),
        apiRequest("/api/admin/grant"),
      ]);

      setOverview(overviewData || null);

      setLifetimeItems(
        Array.isArray(lifetimeData?.items)
          ? lifetimeData.items
          : []
      );

      /*
       * لا نظهر free.
       * ونخفي Founders Trial من المنح اليدوي
       * لأنه نظام تجربة مستقل.
       */
      const loadedPlans = Array.isArray(grantData?.plans)
        ? grantData.plans.filter(
            (plan) =>
              plan?.id !== "free" &&
              plan?.id !== "founders_trial"
          )
        : [];

      setPlans(loadedPlans);

      if (
        !grantPlanId &&
        loadedPlans.length
      ) {
        setGrantPlanId(
          loadedPlans[0].id
        );
      }
    } catch (err) {
      console.error(
        "Admin load failed:",
        err
      );

      if (
        err?.status === 401 ||
        err?.status === 403
      ) {
        setError(
          "ليس لديك صلاحية الدخول إلى لوحة الإدارة."
        );
      } else {
        setError(
          "تعذر تحميل بيانات لوحة الإدارة."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    apiRequest,
    session,
    grantPlanId,
  ]);


  /* =======================================================
     SESSION
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const supabase = getSupabase();

        const {
          data: {
            session: currentSession,
          },
        } =
          await supabase.auth.getSession();

        if (!mounted) return;

        if (
          !currentSession ||
          !currentSession?.user?.email
        ) {
          router.replace("/login");
          return;
        }

        setSession(currentSession);
      } catch {
        if (mounted) {
          setError(
            "تعذر التحقق من جلسة الإدارة."
          );

          setLoading(false);
        }
      }
    }

    start();

    return () => {
      mounted = false;
    };
  }, [router]);


  useEffect(() => {
    if (session?.access_token) {
      loadDashboard();
    }
  }, [
    session,
    loadDashboard,
  ]);


  /* =======================================================
     STATS
     ======================================================= */

  const stats = useMemo(
    () => [
      {
        icon: "👥",
        label: "زوار اليوم",
        value:
          overview?.analytics?.visitorsToday,
      },

      {
        icon: "🌍",
        label: "إجمالي الزوار",
        value:
          overview?.analytics?.visitorsTotal,
      },

      {
        icon: "👁️",
        label: "مشاهدات اليوم",
        value:
          overview?.analytics?.pageViewsToday,
      },

      {
        icon: "📈",
        label: "إجمالي المشاهدات",
        value:
          overview?.analytics?.pageViewsTotal,
      },

      {
        icon: "🔑",
        label: "AWD-KEY",
        value:
          overview?.counts?.accessKeys,
      },

      {
        icon: "✅",
        label: "المفاتيح النشطة",
        value:
          overview?.counts?.activeAccessKeys,
      },

      {
        icon: "📱",
        label: "الأجهزة النشطة",
        value:
          overview?.counts?.activeDevices,
      },

      {
        icon: "💳",
        label: "الاشتراكات",
        value:
          overview?.counts?.subscriptions,
      },

      {
        icon: "👑",
        label: "Lifetime",
        value:
          overview?.counts?.lifetime,
      },

      {
        icon: "📦",
        label: "الخطط",
        value:
          overview?.counts?.plans,
      },
    ],
    [overview]
  );


  /* =======================================================
     GRANT PLAN
     ======================================================= */

  async function grantPlan(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setGrantResult(null);

    if (!grantPlanId) {
      setError("اختر الخطة أولًا.");
      return;
    }

    setSaving(true);

    try {
      const data =
        await apiRequest(
          "/api/admin/grant",
          {
            method: "POST",

            body: JSON.stringify({
              planId: grantPlanId,

              email:
                String(
                  grantEmail || ""
                )
                  .trim()
                  .toLowerCase(),

              note:
                String(
                  grantNote || ""
                ).trim(),
            }),
          }
        );

      setGrantResult(data);

      setMessage(
        `✅ تم منح ${planTitle(
          data?.plan
        )} بنجاح.`
      );

      setGrantEmail("");
      setGrantNote("");

      await loadDashboard();
    } catch (err) {
      console.error(
        "Grant plan failed:",
        err
      );

      if (
        err?.message ===
        "INVALID_EMAIL"
      ) {
        setError(
          "البريد الإلكتروني غير صحيح."
        );
      } else if (
        err?.message ===
        "PLAN_NOT_FOUND"
      ) {
        setError(
          "الخطة غير موجودة أو غير مفعلة."
        );
      } else {
        setError(
          "تعذر منح الخطة."
        );
      }
    } finally {
      setSaving(false);
    }
  }


  async function copyGrantCode() {
    const code =
      grantResult?.code || "";

    if (!code) return;

    try {
      await navigator.clipboard.writeText(
        code
      );

      setMessage(
        "📋 تم نسخ AWD-KEY."
      );
    } catch {
      setError(
        "تعذر النسخ تلقائيًا. اضغط مطولًا على الرمز لنسخه."
      );
    }
  }


  /* =======================================================
     LEGACY LIFETIME
     ======================================================= */

  async function addLifetime(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const email =
      String(lifeEmail || "")
        .trim()
        .toLowerCase();

    if (!email) {
      setError(
        "أدخل البريد الإلكتروني."
      );

      return;
    }

    setSaving(true);

    try {
      await apiRequest(
        "/api/admin/lifetime",
        {
          method: "POST",

          body: JSON.stringify({
            email,

            note:
              String(
                lifeNote || ""
              ).trim(),
          }),
        }
      );

      setLifeEmail("");
      setLifeNote("");

      setMessage(
        "✅ تم تفعيل Lifetime القديم بنجاح."
      );

      await loadDashboard();
    } catch {
      setError(
        "تعذر تفعيل Lifetime."
      );
    } finally {
      setSaving(false);
    }
  }


  async function removeLifetime(email) {
    const confirmed =
      window.confirm(
        `هل تريد حذف Lifetime من:\n${email} ؟`
      );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        "/api/admin/lifetime",
        {
          method: "DELETE",

          body:
            JSON.stringify({
              email,
            }),
        }
      );

      setMessage(
        "تم حذف Lifetime."
      );

      await loadDashboard();
    } catch {
      setError(
        "تعذر حذف Lifetime."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     SIGN OUT
     ======================================================= */

  async function signOut() {
    try {
      const supabase =
        getSupabase();

      await supabase.auth.signOut();
    } finally {
      router.replace("/");
      router.refresh();
    }
  }


  /* =======================================================
     UI
     ======================================================= */

  return (
    <main
      className="page"
      dir="rtl"
    >
      <div className="wrap">

        <header className="hero">

          <img
            src="/logov3.png"
            alt="AllWDbook"
          />

          <div>
            <span className="badge">
              🛡️ لوحة الإدارة
            </span>

            <h1>
              AllWDbook Admin
            </h1>

            <p>
              إدارة المنصة والوصول
              والإحصاءات
            </p>
          </div>

        </header>


        <div className="topActions">

          <button
            onClick={loadDashboard}
            disabled={
              loading ||
              saving
            }
          >
            🔄 تحديث البيانات
          </button>

          <button
            className="logout"
            onClick={signOut}
          >
            تسجيل الخروج
          </button>

        </div>


        {session?.user?.email && (
          <div className="adminEmail">
            {session.user.email}
          </div>
        )}


        {message && (
          <div className="notice good">
            {message}
          </div>
        )}


        {error && (
          <div className="notice bad">
            {error}
          </div>
        )}


        {loading ? (
          <div className="panel loading">
            جارٍ تحميل لوحة الإدارة...
          </div>
        ) : (
          <>

            {/* =========================
                OVERVIEW
                ========================= */}

            <section>

              <div className="titleRow">
                <div>
                  <h2>
                    📊 نظرة عامة
                  </h2>

                  <p>
                    الإحصاءات الحالية
                  </p>
                </div>

                <span className="live">
                  مباشر
                </span>
              </div>


              <div className="stats">

                {stats.map((item) => (
                  <article
                    key={item.label}
                    className="stat"
                  >
                    <div className="icon">
                      {item.icon}
                    </div>

                    <small>
                      {item.label}
                    </small>

                    <strong>
                      {number(
                        item.value
                      )}
                    </strong>
                  </article>
                ))}

              </div>

            </section>


            {/* =========================
                GRANT PLAN
                ========================= */}

            <section>

              <div className="titleRow">
                <div>
                  <h2>
                    🎁 منح خطة يدويًا
                  </h2>

                  <p>
                    إنشاء AWD-KEY حقيقي
                    لأي خطة مدفوعة
                  </p>
                </div>
              </div>


              <div className="panel">

                <form
                  onSubmit={grantPlan}
                >

                  <label>
                    الخطة
                  </label>

                  <select
                    value={
                      grantPlanId
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setGrantPlanId(
                        e.target.value
                      )
                    }
                  >

                    {plans.map(
                      (plan) => (
                        <option
                          key={plan.id}
                          value={plan.id}
                        >
                          {planTitle(
                            plan
                          )}
                          {plan.price != null
                            ? ` — $${plan.price}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>


                  <label>
                    بريد العميل — اختياري
                  </label>

                  <input
                    type="email"
                    dir="ltr"
                    inputMode="email"
                    placeholder="user@example.com"
                    value={
                      grantEmail
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setGrantEmail(
                        e.target.value
                      )
                    }
                  />


                  <label>
                    ملاحظة — اختيارية
                  </label>

                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Gift / Partner / Support..."
                    value={
                      grantNote
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setGrantNote(
                        e.target.value
                      )
                    }
                  />


                  <button
                    className="primary"
                    type="submit"
                    disabled={
                      saving ||
                      !grantPlanId
                    }
                  >
                    {saving
                      ? "جارٍ إنشاء المفتاح..."
                      : "🔑 إنشاء ومنح الخطة"}
                  </button>

                </form>


                {grantResult?.code && (
                  <div className="grantResult">

                    <div className="check">
                      ✅
                    </div>

                    <h3>
                      تم منح الخطة
                    </h3>

                    <p>
                      {planTitle(
                        grantResult.plan
                      )}
                    </p>


                    <div
                      className="code"
                      dir="ltr"
                    >
                      {
                        grantResult.code
                      }
                    </div>


                    <div className="resultInfo">

                      <span>
                        📱 الأجهزة:
                        {" "}
                        {
                          grantResult.maxActivations
                        }
                      </span>

                      <span>
                        ⏳ الانتهاء:
                        {" "}
                        {grantResult.lifetime
                          ? "دائم"
                          : grantResult.expiresAt
                          ? new Date(
                              grantResult.expiresAt
                            ).toLocaleDateString(
                              "ar-DZ"
                            )
                          : "—"}
                      </span>

                    </div>


                    <button
                      type="button"
                      className="copy"
                      onClick={
                        copyGrantCode
                      }
                    >
                      📋 نسخ AWD-KEY
                    </button>

                  </div>
                )}

              </div>

            </section>


            {/* =========================
                MANAGEMENT
                ========================= */}

            <section>

              <div className="titleRow">
                <div>
                  <h2>
                    ⚙️ إدارة المنصة
                  </h2>

                  <p>
                    الأقسام الإدارية
                    التالية
                  </p>
                </div>
              </div>


              <div className="management">

                <div
  role="button"
  tabIndex={0}
  onClick={() =>
    router.push(
      "/admin/access-keys"
    )
  }
  onKeyDown={(event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      router.push(
        "/admin/access-keys"
      );
    }
  }}
  style={{
    cursor: "pointer",
  }}
>
  <b>🔑 مفاتيح AWD-KEY</b>

  <small>
    البحث والإلغاء والخطط والأجهزة
  </small>

  <em>فتح ←</em>
</div>

                <div>
                  <b>📱 إدارة الأجهزة</b>
                  <small>
                    حذف وإعادة ضبط الأجهزة
                  </small>
                  <em>قريبًا</em>
                </div>

                <div
  role="button"
  tabIndex={0}
  onClick={() =>
    router.push(
      "/admin/customers"
    )
  }
  onKeyDown={(event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      router.push(
        "/admin/customers"
      );
    }
  }}
  style={{
    cursor: "pointer",
  }}
>
  <b>👤 العملاء</b>

  <small>
    البحث بالبريد والخطط والمفاتيح
  </small>

  <em>فتح ←</em>
</div>

                <div>
                  <b>🛡️ السجل الأمني</b>
                  <small>
                    التفعيل والاستعادة
                  </small>
                  <em>قريبًا</em>
                </div>

              </div>

            </section>


            {/* =========================
                LEGACY LIFETIME
                ========================= */}

            <section>

              <div className="titleRow">
                <div>
                  <h2>
                    👑 Lifetime القديم
                  </h2>

                  <p>
                    للتوافق مع الحسابات
                    القديمة فقط
                  </p>
                </div>

                <span className="count">
                  {
                    lifetimeItems.length
                  }
                </span>
              </div>


              <div className="panel">

                <form
                  onSubmit={
                    addLifetime
                  }
                >

                  <label>
                    البريد الإلكتروني
                  </label>

                  <input
                    type="email"
                    dir="ltr"
                    placeholder="user@example.com"
                    value={
                      lifeEmail
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setLifeEmail(
                        e.target.value
                      )
                    }
                  />


                  <label>
                    ملاحظة اختيارية
                  </label>

                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Owner / Partner / Gift"
                    value={
                      lifeNote
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setLifeNote(
                        e.target.value
                      )
                    }
                  />


                  <button
                    type="submit"
                    className="primary"
                    disabled={saving}
                  >
                    👑 تفعيل Lifetime القديم
                  </button>

                </form>

              </div>


              <div className="panel list">

                <h3>
                  ♾️ الحسابات الحالية
                </h3>


                {lifetimeItems.length === 0 ? (
                  <div className="empty">
                    لا توجد حسابات Lifetime.
                  </div>
                ) : (
                  lifetimeItems.map(
                    (item) => (
                      <article
                        className="life"
                        key={item.id}
                      >
                        <strong
                          dir="ltr"
                        >
                          {item.email}
                        </strong>

                        {item.note && (
                          <p>
                            {item.note}
                          </p>
                        )}

                        <span>
                          ✅ Lifetime Pro مفعل
                        </span>

                        <button
                          onClick={() =>
                            removeLifetime(
                              item.email
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          حذف Lifetime
                        </button>
                      </article>
                    )
                  )
                )}

              </div>

            </section>


            <footer>
              <b>
                AllWDbook Admin
              </b>

              <span>
                آخر تحديث:
                {" "}
                {overview?.generatedAt
                  ? new Date(
                      overview.generatedAt
                    ).toLocaleString(
                      "ar-DZ"
                    )
                  : "—"}
              </span>
            </footer>

          </>
        )}

      </div>


      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          padding: 14px 12px 60px;
          background:
            radial-gradient(
              circle at 50% -5%,
              rgba(255, 106, 0, .12),
              transparent 28%
            ),
            #03101d;
          color: #fff;
        }

        .wrap {
          width: min(100%, 850px);
          margin: auto;
        }

        .hero {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 18px;
          border: 1px solid #29425f;
          border-radius: 24px;
          background: #0d2036;
        }

        .hero img {
          width: 74px;
          height: 74px;
          object-fit: cover;
          border-radius: 19px;
        }

        .badge {
          display: inline-block;
          padding: 5px 10px;
          border: 1px solid #6d512b;
          border-radius: 999px;
          color: #ffc369;
          font-size: 10px;
        }

        h1 {
          margin: 7px 0 3px;
          font-size: 25px;
        }

        .hero p,
        .titleRow p {
          margin: 0;
          color: #8092a8;
          font-size: 11px;
        }

        .topActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        button {
          cursor: pointer;
        }

        .topActions button {
          min-height: 48px;
          border: 1px solid #29425f;
          border-radius: 14px;
          background: #10243b;
          color: #fff;
          font-weight: 800;
        }

        .topActions .logout {
          border-color: #68363d;
          background: #2a181d;
          color: #ffb1b7;
        }

        .adminEmail {
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #29405d;
          border-radius: 12px;
          text-align: center;
          direction: ltr;
          color: #8da0b7;
          background: #071726;
          font-size: 11px;
        }

        section {
          margin-top: 23px;
        }

        .titleRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 11px;
        }

        .titleRow h2 {
          margin: 0 0 4px;
          font-size: 20px;
        }

        .live,
        .count {
          padding: 6px 10px;
          border: 1px solid #25684a;
          border-radius: 999px;
          background: #0d3324;
          color: #79e4ac;
          font-size: 10px;
        }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .stat {
          min-height: 124px;
          padding: 14px;
          border: 1px solid #29415f;
          border-radius: 18px;
          background: #0b1d31;
        }

        .icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid #315172;
          border-radius: 13px;
          background: #122a44;
          font-size: 19px;
          margin-bottom: 14px;
        }

        .stat small {
          display: block;
          color: #7f91a8;
          font-size: 10px;
        }

        .stat strong {
          display: block;
          margin-top: 5px;
          font-size: 24px;
          direction: ltr;
          text-align: right;
        }

        .panel {
          padding: 16px;
          border: 1px solid #29425f;
          border-radius: 20px;
          background: #0c1f34;
        }

        label {
          display: block;
          margin: 13px 2px 7px;
          color: #aebdce;
          font-size: 11px;
          font-weight: 800;
        }

        input,
        select {
          width: 100%;
          min-height: 52px;
          padding: 11px 13px;
          border: 1px solid #304a68;
          border-radius: 13px;
          background: #061522;
          color: #fff;
          outline: none;
          font-size: 14px;
        }

        select {
          direction: rtl;
        }

        .primary {
          width: 100%;
          min-height: 53px;
          margin-top: 16px;
          border: 0;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #ff6800,
              #ff862f
            );
          color: #fff;
          font-weight: 900;
          font-size: 14px;
        }

        button:disabled {
          opacity: .55;
          cursor: wait;
        }

        .grantResult {
          margin-top: 18px;
          padding: 17px;
          border: 1px solid #267755;
          border-radius: 18px;
          background: #08291f;
          text-align: center;
        }

        .check {
          font-size: 34px;
        }

        .grantResult h3 {
          margin: 9px 0 4px;
        }

        .grantResult p {
          margin: 0;
          color: #8eddb6;
        }

        .code {
          margin-top: 14px;
          padding: 14px 9px;
          border: 1px solid #34556b;
          border-radius: 13px;
          background: #06131c;
          color: #ffc66d;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .resultInfo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .resultInfo span {
          padding: 8px;
          border-radius: 10px;
          background: rgba(255,255,255,.04);
          color: #a8bac9;
          font-size: 10px;
        }

        .copy {
          width: 100%;
          min-height: 46px;
          margin-top: 11px;
          border: 1px solid #2f7259;
          border-radius: 12px;
          background: #0c432f;
          color: #a5f1cb;
          font-weight: 900;
        }

        .management {
          display: grid;
          gap: 9px;
        }

        .management > div {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4px 10px;
          padding: 15px;
          border: 1px solid #29425f;
          border-radius: 16px;
          background: #0b1d31;
        }

        .management b {
          font-size: 13px;
        }

        .management small {
          grid-column: 1;
          color: #75879d;
          font-size: 9px;
        }

        .management em {
          grid-column: 2;
          grid-row: 1 / 3;
          align-self: center;
          padding: 6px 9px;
          border-radius: 999px;
          background: #172b43;
          color: #92a5bb;
          font-size: 9px;
          font-style: normal;
        }

        .list {
          margin-top: 11px;
        }

        .list h3 {
          margin: 0 0 12px;
        }

        .life {
          padding: 13px;
          margin-top: 9px;
          border: 1px solid #29425f;
          border-radius: 14px;
          background: #061522;
        }

        .life strong {
          display: block;
          direction: ltr;
          text-align: left;
          overflow-wrap: anywhere;
          font-size: 12px;
        }

        .life p {
          color: #7d90a6;
          font-size: 10px;
        }

        .life span {
          display: block;
          margin-top: 7px;
          color: #78e0a7;
          font-size: 10px;
        }

        .life button {
          width: 100%;
          min-height: 42px;
          margin-top: 10px;
          border: 1px solid #743841;
          border-radius: 11px;
          background: #32181d;
          color: #ffadb5;
          font-weight: 800;
        }

        .notice {
          margin-top: 12px;
          padding: 12px;
          border-radius: 13px;
          text-align: center;
          font-size: 11px;
        }

        .good {
          border: 1px solid #277252;
          background: #0c3123;
          color: #8de8b8;
        }

        .bad {
          border: 1px solid #74343d;
          background: #32171c;
          color: #ffabb4;
        }

        .loading,
        .empty {
          padding: 35px 12px;
          text-align: center;
          color: #8396ac;
        }

        footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 24px;
          padding: 12px 2px;
          color: #71849b;
          font-size: 9px;
        }

        @media (min-width: 700px) {
          .stats {
            grid-template-columns:
              repeat(5, 1fr);
          }

          .management {
            grid-template-columns:
              1fr 1fr;
          }
        }

      `}</style>

    </main>
  );
}
