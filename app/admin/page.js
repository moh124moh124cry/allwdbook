"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getSupabase,
} from "../../lib/supabase";


function formatNumber(value) {
  return Number(value || 0)
    .toLocaleString("en-US");
}


export default function AdminPage() {
  const router =
    useRouter();

  const [
    session,
    setSession,
  ] =
    useState(null);

  const [
    overview,
    setOverview,
  ] =
    useState(null);

  const [
    lifetimeItems,
    setLifetimeItems,
  ] =
    useState([]);

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  /* =======================================================
     API
     ======================================================= */

  const apiRequest =
    useCallback(
      async (
        path,
        options = {},
      ) => {
        if (
          !session
            ?.access_token
        ) {
          throw new Error(
            "NO_SESSION",
          );
        }


        const response =
          await fetch(
            path,
            {
              ...options,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,

                ...(
                  options.headers ||
                  {}
                ),
              },

              cache:
                "no-store",
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
          const requestError =
            new Error(
              data?.error ||
              "REQUEST_FAILED",
            );

          requestError.status =
            response.status;

          throw requestError;
        }


        return data;
      },
      [session],
    );


  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  const loadDashboard =
    useCallback(
      async () => {
        if (
          !session
            ?.access_token
        ) {
          return;
        }


        setLoading(true);
        setError("");


        try {
          const [
            overviewData,
            lifetimeData,
          ] =
            await Promise.all([
              apiRequest(
                "/api/admin/overview",
              ),

              apiRequest(
                "/api/admin/lifetime",
              ),
            ]);


          setOverview(
            overviewData ||
            null,
          );


          setLifetimeItems(
            Array.isArray(
              lifetimeData
                ?.items,
            )
              ? lifetimeData.items
              : [],
          );
        } catch (
          loadError
        ) {
          console.error(
            "Admin dashboard load failed:",
            loadError,
          );


          if (
            loadError
              ?.status ===
              401 ||
            loadError
              ?.status ===
              403
          ) {
            setError(
              "ليس لديك صلاحية الدخول إلى لوحة الإدارة.",
            );
          } else {
            setError(
              "تعذر تحميل بيانات لوحة الإدارة.",
            );
          }
        } finally {
          setLoading(false);
        }
      },
      [
        apiRequest,
        session,
      ],
    );


  /* =======================================================
     INITIAL SESSION
     ======================================================= */

  useEffect(() => {
    let mounted =
      true;


    async function initialize() {
      try {
        const supabase =
          getSupabase();


        const {
          data: {
            session:
              currentSession,
          },
        } =
          await supabase.auth
            .getSession();


        if (!mounted) {
          return;
        }


        /*
         * جلسة Anonymous العادية
         * ليست جلسة Admin.
         */
        if (
          !currentSession ||
          !currentSession
            ?.user
            ?.email
        ) {
          router.replace(
            "/login",
          );

          return;
        }


        setSession(
          currentSession,
        );
      } catch (
        sessionError
      ) {
        console.error(
          "Admin session failed:",
          sessionError,
        );


        if (mounted) {
          setError(
            "تعذر التحقق من جلسة الإدارة.",
          );

          setLoading(
            false,
          );
        }
      }
    }


    initialize();


    return () => {
      mounted =
        false;
    };
  }, [router]);


  useEffect(() => {
    if (
      session
        ?.access_token
    ) {
      loadDashboard();
    }
  }, [
    session,
    loadDashboard,
  ]);


  /* =======================================================
     STATS
     ======================================================= */

  const stats =
    useMemo(
      () => [
        {
          icon: "👥",

          title:
            "زوار اليوم",

          value:
            overview
              ?.analytics
              ?.visitorsToday,
        },

        {
          icon: "🌍",

          title:
            "إجمالي الزوار",

          value:
            overview
              ?.analytics
              ?.visitorsTotal,
        },

        {
          icon: "👁️",

          title:
            "مشاهدات اليوم",

          value:
            overview
              ?.analytics
              ?.pageViewsToday,
        },

        {
          icon: "📈",

          title:
            "إجمالي المشاهدات",

          value:
            overview
              ?.analytics
              ?.pageViewsTotal,
        },

        {
          icon: "🔑",

          title:
            "AWD-KEY",

          value:
            overview
              ?.counts
              ?.accessKeys,
        },

        {
          icon: "✅",

          title:
            "المفاتيح النشطة",

          value:
            overview
              ?.counts
              ?.activeAccessKeys,
        },

        {
          icon: "📱",

          title:
            "الأجهزة النشطة",

          value:
            overview
              ?.counts
              ?.activeDevices,
        },

        {
          icon: "💳",

          title:
            "الاشتراكات",

          value:
            overview
              ?.counts
              ?.subscriptions,
        },

        {
          icon: "👑",

          title:
            "Lifetime",

          value:
            overview
              ?.counts
              ?.lifetime,
        },

        {
          icon: "📦",

          title:
            "الخطط",

          value:
            overview
              ?.counts
              ?.plans,
        },
      ],
      [overview],
    );


  /* =======================================================
     ADD LIFETIME
     ======================================================= */

  async function addLifetime(
    event,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");


    const cleanEmail =
      String(
        email || "",
      )
        .trim()
        .toLowerCase();


    if (!cleanEmail) {
      setError(
        "أدخل البريد الإلكتروني.",
      );

      return;
    }


    setSaving(true);


    try {
      await apiRequest(
        "/api/admin/lifetime",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              email:
                cleanEmail,

              note:
                String(
                  note || "",
                ).trim(),
            }),
        },
      );


      setEmail("");
      setNote("");


      setMessage(
        "✅ تم تفعيل Lifetime Pro بنجاح.",
      );


      await loadDashboard();
    } catch (
      saveError
    ) {
      if (
        saveError
          ?.message ===
        "INVALID_EMAIL"
      ) {
        setError(
          "البريد الإلكتروني غير صحيح.",
        );
      } else {
        setError(
          "تعذر تفعيل Lifetime Pro.",
        );
      }
    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     REMOVE LIFETIME
     ======================================================= */

  async function removeLifetime(
    targetEmail,
  ) {
    const confirmed =
      window.confirm(
        `هل تريد حذف Lifetime من:\n${targetEmail} ؟`,
      );


    if (!confirmed) {
      return;
    }


    setMessage("");
    setError("");
    setSaving(true);


    try {
      await apiRequest(
        "/api/admin/lifetime",
        {
          method:
            "DELETE",

          body:
            JSON.stringify({
              email:
                targetEmail,
            }),
        },
      );


      setMessage(
        "تم حذف Lifetime من الحساب.",
      );


      await loadDashboard();
    } catch {
      setError(
        "تعذر حذف Lifetime.",
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

      await supabase.auth
        .signOut();
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
      className="admin-page"
      dir="rtl"
    >
      <div className="admin-wrap">

        {/* ===============================================
            HEADER
            =============================================== */}

        <header className="admin-header">

          <div className="admin-logo">
            <img
              src="/logov3.png"
              alt="AllWDbook"
            />
          </div>


          <div>

            <div className="admin-badge">
              🛡️ لوحة الإدارة
            </div>

            <h1>
              AllWDbook Admin
            </h1>

            <p>
              إدارة المنصة والوصول
              والإحصاءات
            </p>

          </div>

        </header>


        <div className="admin-actions">

          <button
            type="button"
            onClick={
              loadDashboard
            }
            disabled={
              loading ||
              saving
            }
          >
            🔄 تحديث البيانات
          </button>


          <button
            type="button"
            onClick={
              signOut
            }
            className="danger-light"
          >
            تسجيل الخروج
          </button>

        </div>


        {session
          ?.user
          ?.email && (
          <div className="admin-email">
            {
              session.user
                .email
            }
          </div>
        )}


        {/* ===============================================
            MESSAGES
            =============================================== */}

        {message && (
          <div className="message success">
            {message}
          </div>
        )}


        {error && (
          <div className="message error">
            {error}
          </div>
        )}


        {/* ===============================================
            LOADING
            =============================================== */}

        {loading ? (
          <section className="panel loading-panel">

            <div className="spinner" />

            <strong>
              جارٍ تحميل لوحة الإدارة...
            </strong>

          </section>
        ) : (
          <>

            {/* ===========================================
                OVERVIEW
                =========================================== */}

            <section className="section-block">

              <div className="section-title">

                <div>
                  <h2>
                    📊 نظرة عامة
                  </h2>

                  <p>
                    الإحصاءات الحالية
                    لمنصة AllWDbook
                  </p>
                </div>

                <span className="live-dot">
                  مباشر
                </span>

              </div>


              <div className="stats-grid">

                {stats.map(
                  (
                    item,
                  ) => (
                    <article
                      className="stat-card"
                      key={
                        item.title
                      }
                    >

                      <div className="stat-icon">
                        {
                          item.icon
                        }
                      </div>

                      <div className="stat-title">
                        {
                          item.title
                        }
                      </div>

                      <strong className="stat-value">
                        {
                          formatNumber(
                            item.value,
                          )
                        }
                      </strong>

                    </article>
                  ),
                )}

              </div>

            </section>


            {/* ===========================================
                MANAGEMENT SHORTCUTS
                =========================================== */}

            <section className="section-block">

              <div className="section-title">

                <div>
                  <h2>
                    ⚙️ إدارة المنصة
                  </h2>

                  <p>
                    الوحدات الإدارية
                    التي سنربطها تدريجيًا
                  </p>
                </div>

              </div>


              <div className="management-grid">

                <div className="management-card">

                  <span>
                    🔑
                  </span>

                  <div>
                    <strong>
                      مفاتيح AWD-KEY
                    </strong>

                    <small>
                      البحث، الإلغاء،
                      الخطط والأجهزة
                    </small>
                  </div>

                  <em>
                    قريبًا
                  </em>

                </div>


                <div className="management-card">

                  <span>
                    📱
                  </span>

                  <div>
                    <strong>
                      إدارة الأجهزة
                    </strong>

                    <small>
                      حذف جهاز أو
                      إعادة ضبط الأجهزة
                    </small>
                  </div>

                  <em>
                    قريبًا
                  </em>

                </div>


                <div className="management-card">

                  <span>
                    👤
                  </span>

                  <div>
                    <strong>
                      العملاء
                    </strong>

                    <small>
                      البحث بالبريد
                      والخطط المملوكة
                    </small>
                  </div>

                  <em>
                    قريبًا
                  </em>

                </div>


                <div className="management-card">

                  <span>
                    🛡️
                  </span>

                  <div>
                    <strong>
                      السجل الأمني
                    </strong>

                    <small>
                      التفعيل والاستعادة
                      وتغييرات الوصول
                    </small>
                  </div>

                  <em>
                    قريبًا
                  </em>

                </div>

              </div>

            </section>


            {/* ===========================================
                LIFETIME
                =========================================== */}

            <section className="section-block">

              <div className="section-title">

                <div>
                  <h2>
                    👑 Lifetime Pro
                  </h2>

                  <p>
                    الإدارة اليدوية
                    للحسابات الدائمة
                  </p>
                </div>


                <span className="count-badge">
                  {
                    lifetimeItems.length
                  }
                </span>

              </div>


              <div className="panel">

                <h3>
                  ➕ إضافة Lifetime
                </h3>


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
                    inputMode="email"
                    dir="ltr"
                    placeholder="user@example.com"
                    value={
                      email
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event
                          .target
                          .value,
                      )
                    }
                  />


                  <label>
                    ملاحظة اختيارية
                  </label>

                  <input
                    type="text"
                    maxLength={
                      300
                    }
                    placeholder="Owner / Partner / Gift"
                    value={
                      note
                    }
                    disabled={
                      saving
                    }
                    onChange={(
                      event,
                    ) =>
                      setNote(
                        event
                          .target
                          .value,
                      )
                    }
                  />


                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "جارٍ التنفيذ..."
                      : "👑 تفعيل Lifetime Pro"}
                  </button>

                </form>

              </div>


              <div className="panel lifetime-list">

                <h3>
                  ♾️ الحسابات الحالية
                </h3>


                {lifetimeItems
                  .length ===
                0 ? (
                  <div className="empty">
                    لا توجد حسابات
                    Lifetime حتى الآن.
                  </div>
                ) : (
                  <div className="lifetime-grid">

                    {lifetimeItems.map(
                      (
                        item,
                      ) => (
                        <article
                          className="lifetime-card"
                          key={
                            item.id
                          }
                        >

                          <strong
                            dir="ltr"
                          >
                            {
                              item.email
                            }
                          </strong>


                          {item.note && (
                            <p>
                              {
                                item.note
                              }
                            </p>
                          )}


                          <span>
                            ✅ Lifetime Pro مفعل
                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              removeLifetime(
                                item.email,
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            حذف Lifetime
                          </button>

                        </article>
                      ),
                    )}

                  </div>
                )}

              </div>

            </section>


            {/* ===========================================
                FOOTER
                =========================================== */}

            <footer className="admin-footer">

              <span>
                AllWDbook Admin
              </span>

              <small>
                آخر تحديث:
                {" "}
                {overview
                  ?.generatedAt
                  ? new Date(
                      overview.generatedAt,
                    ).toLocaleString(
                      "ar-DZ",
                    )
                  : "—"}
              </small>

            </footer>

          </>
        )}

      </div>


      <style jsx>{`

        .admin-page,
        .admin-page * {
          box-sizing:
            border-box;
        }


        .admin-page {
          min-height:
            100dvh;

          padding:
            22px 14px 60px;

          background:
            radial-gradient(
              circle at
              50% -10%,
              rgba(
                255,
                111,
                0,
                0.13
              ),
              transparent
              32%
            ),
            #030d19;

          color:
            #ffffff;
        }


        .admin-wrap {
          width:
            min(
              100%,
              850px
            );

          margin:
            0 auto;
        }


        .admin-header {
          display:
            flex;

          align-items:
            center;

          gap:
            15px;

          padding:
            18px;

          border:
            1px solid
            #233b5b;

          border-radius:
            24px;

          background:
            linear-gradient(
              145deg,
              #0f2038,
              #071525
            );

          box-shadow:
            0 24px 60px
            rgba(
              0,
              0,
              0,
              0.28
            );
        }


        .admin-logo {
          width:
            72px;

          height:
            72px;

          flex:
            0 0 auto;

          padding:
            4px;

          border-radius:
            19px;

          background:
            rgba(
              255,
              109,
              0,
              0.1
            );
        }


        .admin-logo img {
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


        .admin-badge {
          width:
            fit-content;

          margin-bottom:
            6px;

          padding:
            5px 9px;

          border:
            1px solid
            rgba(
              255,
              169,
              66,
              0.28
            );

          border-radius:
            999px;

          color:
            #ffc263;

          font-size:
            10px;

          font-weight:
            800;
        }


        h1 {
          margin:
            0;

          font-size:
            27px;
        }


        .admin-header p {
          margin:
            6px 0 0;

          color:
            #8699b2;

          font-size:
            12px;
        }


        .admin-actions {
          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            10px;

          margin-top:
            12px;
        }


        .admin-actions button {
          min-height:
            46px;

          border:
            1px solid
            #29415f;

          border-radius:
            13px;

          background:
            #0d1d31;

          color:
            #dce6f2;

          font-weight:
            800;
        }


        .admin-actions
        .danger-light {
          color:
            #ffadb3;

          border-color:
            #5a3038;

          background:
            #24161b;
        }


        .admin-email {
          margin-top:
            10px;

          padding:
            9px 12px;

          border:
            1px solid
            #213752;

          border-radius:
            12px;

          background:
            #071424;

          color:
            #8295ae;

          direction:
            ltr;

          text-align:
            center;

          overflow-wrap:
            anywhere;

          font-size:
            11px;
        }


        .message {
          margin-top:
            12px;

          padding:
            12px;

          border-radius:
            13px;

          text-align:
            center;

          font-size:
            12px;

          line-height:
            1.7;
        }


        .message.success {
          border:
            1px solid
            #216344;

          background:
            #0d2d20;

          color:
            #7ae4aa;
        }


        .message.error {
          border:
            1px solid
            #74323b;

          background:
            #31171c;

          color:
            #ffadb5;
        }


        .section-block {
          margin-top:
            20px;
        }


        .section-title {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            10px;

          margin-bottom:
            11px;
        }


        .section-title h2 {
          margin:
            0;

          font-size:
            19px;
        }


        .section-title p {
          margin:
            4px 0 0;

          color:
            #71869f;

          font-size:
            10px;
        }


        .live-dot,
        .count-badge {
          padding:
            6px 9px;

          border:
            1px solid
            #236147;

          border-radius:
            999px;

          background:
            #0b2d20;

          color:
            #72dfa9;

          font-size:
            9px;

          font-style:
            normal;

          font-weight:
            900;
        }


        .stats-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            10px;
        }


        .stat-card {
          min-height:
            128px;

          padding:
            14px;

          border:
            1px solid
            #233a58;

          border-radius:
            18px;

          background:
            linear-gradient(
              145deg,
              #0d1d31,
              #071522
            );
        }


        .stat-icon {
          width:
            39px;

          height:
            39px;

          display:
            grid;

          place-items:
            center;

          margin-bottom:
            14px;

          border:
            1px solid
            #294568;

          border-radius:
            12px;

          background:
            #122841;

          font-size:
            18px;
        }


        .stat-title {
          color:
            #8194ac;

          font-size:
            10px;
        }


        .stat-value {
          display:
            block;

          margin-top:
            5px;

          color:
            white;

          font-size:
            25px;

          direction:
            ltr;

          text-align:
            right;
        }


        .management-grid {
          display:
            grid;

          gap:
            9px;
        }


        .management-card {
          display:
            grid;

          grid-template-columns:
            42px 1fr auto;

          align-items:
            center;

          gap:
            11px;

          padding:
            12px;

          border:
            1px solid
            #233a58;

          border-radius:
            16px;

          background:
            #0a192b;
        }


        .management-card
        > span {
          width:
            42px;

          height:
            42px;

          display:
            grid;

          place-items:
            center;

          border:
            1px solid
            #294563;

          border-radius:
            12px;

          background:
            #10253e;

          font-size:
            18px;
        }


        .management-card strong {
          display:
            block;

          font-size:
            12px;
        }


        .management-card small {
          display:
            block;

          margin-top:
            3px;

          color:
            #72869f;

          font-size:
            9px;
        }


        .management-card em {
          padding:
            5px 7px;

          border-radius:
            999px;

          background:
            #17263a;

          color:
            #7e92ab;

          font-size:
            8px;

          font-style:
            normal;
        }


        .panel {
          padding:
            16px;

          border:
            1px solid
            #253c5b;

          border-radius:
            18px;

          background:
            #0c1c30;
        }


        .panel
        + .panel {
          margin-top:
            11px;
        }


        .panel h3 {
          margin:
            0 0 14px;

          font-size:
            15px;
        }


        label {
          display:
            block;

          margin:
            12px 2px 7px;

          color:
            #aab8c9;

          font-size:
            10px;

          font-weight:
            800;
        }


        input {
          width:
            100%;

          min-height:
            52px;

          padding:
            11px 13px;

          border:
            1px solid
            #2a4262;

          border-radius:
            13px;

          outline:
            none;

          background:
            #051320;

          color:
            white;

          font-size:
            14px;
        }


        input:focus {
          border-color:
            #ff6d00;

          box-shadow:
            0 0 0 3px
            rgba(
              255,
              109,
              0,
              0.08
            );
        }


        .primary-button {
          width:
            100%;

          min-height:
            52px;

          margin-top:
            15px;

          border:
            0;

          border-radius:
            13px;

          background:
            linear-gradient(
              135deg,
              #ff6900,
              #ff842d
            );

          color:
            white;

          font-size:
            13px;

          font-weight:
            900;
        }


        button:disabled {
          opacity:
            0.55;
        }


        .lifetime-grid {
          display:
            grid;

          gap:
            9px;
        }


        .lifetime-card {
          padding:
            13px;

          border:
            1px solid
            #263d5c;

          border-radius:
            14px;

          background:
            #061421;
        }


        .lifetime-card strong {
          display:
            block;

          text-align:
            left;

          overflow-wrap:
            anywhere;

          font-size:
            12px;
        }


        .lifetime-card p {
          margin:
            7px 0;

          color:
            #7f91a8;

          font-size:
            10px;
        }


        .lifetime-card span {
          display:
            block;

          margin-top:
            7px;

          color:
            #70dda4;

          font-size:
            10px;
        }


        .lifetime-card button {
          width:
            100%;

          min-height:
            40px;

          margin-top:
            10px;

          border:
            1px solid
            #69313a;

          border-radius:
            11px;

          background:
            #2b161b;

          color:
            #ffabb3;

          font-size:
            10px;

          font-weight:
            800;
        }


        .empty {
          padding:
            25px 10px;

          text-align:
            center;

          color:
            #70839a;

          font-size:
            11px;
        }


        .loading-panel {
          margin-top:
            20px;

          padding:
            42px 15px;

          text-align:
            center;

          color:
            #8c9db2;
        }


        .spinner {
          width:
            32px;

          height:
            32px;

          margin:
            0 auto 15px;

          border:
            3px solid
            #20344f;

          border-top-color:
            #ff6d00;

          border-radius:
            50%;

          animation:
            spin
            0.8s linear
            infinite;
        }


        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }


        .admin-footer {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            10px;

          margin-top:
            20px;

          padding:
            12px 2px;

          color:
            #667a92;

          font-size:
            9px;
        }


        .admin-footer span {
          color:
            #8fa1b7;

          font-weight:
            800;
        }


        @media (
          min-width:
            700px
        ) {

          .stats-grid {
            grid-template-columns:
              repeat(
                5,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .management-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

        }


        @media (
          max-width:
            420px
        ) {

          .admin-page {
            padding:
              14px 11px 50px;
          }


          .admin-header {
            padding:
              15px;

            border-radius:
              21px;
          }


          .admin-logo {
            width:
              61px;

            height:
              61px;
          }


          h1 {
            font-size:
              21px;
          }


          .stat-card {
            min-height:
              118px;
          }


          .stat-value {
            font-size:
              22px;
          }

        }

      `}</style>

    </main>
  );
}
