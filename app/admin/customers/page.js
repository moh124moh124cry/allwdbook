"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";


function dateText(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString(
      "ar-DZ"
    );
  } catch {
    return "—";
  }
}


function planText(planId) {
  const names = {
    cover: "مصمم الأغلفة",
    micro_niche: "Micro-Niche",
    keywords: "الكلمات المفتاحية",
    pro_monthly: "AllWDbook Pro شهري",
    pro_yearly: "AllWDbook Pro سنوي",
    lifetime: "Lifetime",
    lifetime_pro: "Lifetime",
  };

  return names[planId] || planId || "—";
}


export default function CustomersPage() {
  const router = useRouter();

  const [session, setSession] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     API
     ======================================================= */

  const apiRequest = useCallback(
    async (path) => {
      if (!session?.access_token) {
        throw new Error("NO_SESSION");
      }

      const response = await fetch(path, {
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },

        cache: "no-store",
      });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        const requestError =
          new Error(
            data?.error ||
            "REQUEST_FAILED"
          );

        requestError.status =
          response.status;

        throw requestError;
      }

      return data;
    },
    [session]
  );


  /* =======================================================
     SESSION
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function start() {
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

        if (
          !currentSession ||
          !currentSession
            ?.user
            ?.email
        ) {
          router.replace("/login");
          return;
        }

        setSession(
          currentSession
        );
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


  /* =======================================================
     LOAD CUSTOMERS
     ======================================================= */

  const loadCustomers =
    useCallback(
      async (query = "") => {
        if (
          !session
            ?.access_token
        ) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const clean =
            String(query || "")
              .trim()
              .toLowerCase();

          const url =
            clean
              ? `/api/admin/customers?q=${encodeURIComponent(
                  clean
                )}`
              : "/api/admin/customers";

          const data =
            await apiRequest(url);

          setItems(
            Array.isArray(
              data?.items
            )
              ? data.items
              : []
          );
        } catch (loadError) {
          console.error(
            "Customers load failed:",
            loadError
          );

          if (
            loadError?.status ===
              401 ||
            loadError?.status ===
              403
          ) {
            setError(
              "ليس لديك صلاحية عرض العملاء."
            );
          } else {
            setError(
              "تعذر تحميل بيانات العملاء."
            );
          }
        } finally {
          setLoading(false);
        }
      },
      [
        apiRequest,
        session,
      ]
    );


  useEffect(() => {
    if (
      session
        ?.access_token
    ) {
      loadCustomers("");
    }
  }, [
    session,
    loadCustomers,
  ]);


  /* =======================================================
     SEARCH
     ======================================================= */

  async function submitSearch(
    event
  ) {
    event.preventDefault();

    await loadCustomers(
      search
    );
  }


  function clearSearch() {
    setSearch("");
    loadCustomers("");
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

        {/* HEADER */}

        <header className="hero">

          <button
            type="button"
            className="back"
            onClick={() =>
              router.push("/admin")
            }
          >
            ←
          </button>

          <div className="heroIcon">
            👤
          </div>

          <div>
            <span className="badge">
              AllWDbook Admin
            </span>

            <h1>
              إدارة العملاء
            </h1>

            <p>
              الخطط، المفاتيح،
              الأجهزة والاشتراكات
            </p>
          </div>

        </header>


        {/* SEARCH */}

        <section className="panel searchPanel">

          <h2>
            🔎 البحث عن عميل
          </h2>

          <p>
            ابحث باستخدام البريد
            الإلكتروني.
          </p>

          <form
            onSubmit={
              submitSearch
            }
          >
            <input
              type="email"
              inputMode="email"
              dir="ltr"
              placeholder="user@example.com"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            <div className="searchButtons">

              <button
                type="submit"
                className="primary"
                disabled={loading}
              >
                🔎 بحث
              </button>

              <button
                type="button"
                className="secondary"
                disabled={loading}
                onClick={
                  clearSearch
                }
              >
                الكل
              </button>

            </div>
          </form>

        </section>


        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* TITLE */}

        <section>

          <div className="titleRow">

            <div>
              <h2>
                👥 العملاء
              </h2>

              <p>
                الحسابات الموجودة
                في أنظمة الوصول
              </p>
            </div>

            <span className="count">
              {items.length}
            </span>

          </div>


          {loading ? (
            <div className="panel empty">
              جارٍ تحميل العملاء...
            </div>
          ) : items.length === 0 ? (
            <div className="panel empty">
              لا توجد نتائج.
            </div>
          ) : (
            <div className="customers">

              {items.map(
                (customer) => (
                  <article
                    className="customer"
                    key={
                      customer.email
                    }
                  >

                    {/* CUSTOMER HEADER */}

                    <div className="customerHead">

                      <div className="avatar">
                        👤
                      </div>

                      <div className="customerEmail">

                        <strong
                          dir="ltr"
                        >
                          {
                            customer.email
                          }
                        </strong>

                        <small>
                          {customer.lifetime
                            ? "👑 Lifetime"
                            : customer.plans
                                ?.length
                            ? "✅ عميل مدفوع"
                            : "عميل"}
                        </small>

                      </div>

                    </div>


                    {/* SUMMARY */}

                    <div className="summary">

                      <div>
                        <small>
                          الخطط
                        </small>

                        <strong>
                          {
                            customer.plans
                              ?.length || 0
                          }
                        </strong>
                      </div>

                      <div>
                        <small>
                          AWD-KEY
                        </small>

                        <strong>
                          {
                            customer
                              .accessKeyCount ||
                            0
                          }
                        </strong>
                      </div>

                      <div>
                        <small>
                          الأجهزة
                        </small>

                        <strong>
                          {
                            customer
                              .activeDevices ||
                            0
                          }
                        </strong>
                      </div>

                      <div>
                        <small>
                          الاشتراكات
                        </small>

                        <strong>
                          {
                            customer
                              .subscriptionCount ||
                            0
                          }
                        </strong>
                      </div>

                    </div>


                    {/* PLANS */}

                    {customer.plans
                      ?.length > 0 && (
                      <div className="block">

                        <h3>
                          📦 الخطط
                        </h3>

                        <div className="chips">

                          {customer.plans.map(
                            (
                              planId
                            ) => (
                              <span
                                key={
                                  planId
                                }
                              >
                                {
                                  planText(
                                    planId
                                  )
                                }
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}


                    {/* RECOVERY EMAIL */}

                    <div className="block">

                      <h3>
                        🛡️ بريد الحماية
                      </h3>

                      {customer
                        .recoveryEmails
                        ?.length ? (
                        customer
                          .recoveryEmails
                          .map(
                            (
                              recoveryEmail
                            ) => (
                              <div
                                className="infoLine"
                                key={
                                  recoveryEmail
                                }
                              >
                                <span>
                                  ✅ موثق
                                </span>

                                <strong
                                  dir="ltr"
                                >
                                  {
                                    recoveryEmail
                                  }
                                </strong>
                              </div>
                            )
                          )
                      ) : (
                        <div className="muted">
                          غير مضاف
                        </div>
                      )}

                    </div>


                    {/* ACCESS KEYS */}

                    {customer
                      .accessKeys
                      ?.length > 0 && (
                      <div className="block">

                        <h3>
                          🔑 مفاتيح AWD-KEY
                        </h3>

                        <div className="keyList">

                          {customer.accessKeys.map(
                            (key) => (
                              <div
                                className="keyItem"
                                key={
                                  key.id
                                }
                              >

                                <div>

                                  <strong>
                                    {
                                      key.planName ||
                                      planText(
                                        key.planId
                                      )
                                    }
                                  </strong>

                                  <small
                                    dir="ltr"
                                  >
                                    {
                                      key.codeHint ||
                                      "AWD-KEY"
                                    }
                                  </small>

                                </div>

                                <div className="keyRight">

                                  <span
                                    className={
                                      key.usable
                                        ? "active"
                                        : "stopped"
                                    }
                                  >
                                    {key.usable
                                      ? "نشط"
                                      : "متوقف"}
                                  </span>

                                  <small>
                                    📱
                                    {" "}
                                    {
                                      key.activeDevices
                                    }
                                    /
                                    {
                                      key.maxActivations
                                    }
                                  </small>

                                </div>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}


                    {/* SUBSCRIPTIONS */}

                    {customer
                      .subscriptions
                      ?.length > 0 && (
                      <div className="block">

                        <h3>
                          💳 الاشتراكات
                        </h3>

                        {customer
                          .subscriptions
                          .map(
                            (
                              subscription,
                              index
                            ) => (
                              <div
                                className="subscription"
                                key={`${subscription.planId}-${index}`}
                              >

                                <div>

                                  <strong>
                                    {
                                      subscription.planName ||
                                      planText(
                                        subscription.planId
                                      )
                                    }
                                  </strong>

                                  <small>
                                    الحالة:
                                    {" "}
                                    {
                                      subscription.status
                                    }
                                  </small>

                                </div>

                                <div>
                                  <span
                                    className={
                                      subscription.active
                                        ? "active"
                                        : "stopped"
                                    }
                                  >
                                    {subscription.active
                                      ? "نشط"
                                      : "غير نشط"}
                                  </span>

                                  {subscription.endsAt && (
                                    <small>
                                      حتى
                                      {" "}
                                      {dateText(
                                        subscription.endsAt
                                      )}
                                    </small>
                                  )}
                                </div>

                              </div>
                            )
                          )}

                      </div>
                    )}


                    {/* ACTION */}

                    <button
                      type="button"
                      className="manageKeys"
                      onClick={() =>
                        router.push(
                          "/admin/access-keys"
                        )
                      }
                    >
                      🔑 فتح إدارة المفاتيح
                    </button>

                  </article>
                )
              )}

            </div>
          )}

        </section>


        <footer>
          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
          >
            ← العودة إلى لوحة الإدارة
          </button>
        </footer>

      </div>


      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          padding: 14px 12px 70px;
          background:
            radial-gradient(
              circle at 50% -5%,
              rgba(255, 106, 0, .1),
              transparent 25%
            ),
            #03101d;
          color: #fff;
        }

        .wrap {
          width: min(100%, 850px);
          margin: auto;
        }

        .hero {
          display: grid;
          grid-template-columns:
            46px 58px 1fr;
          gap: 11px;
          align-items: center;
          padding: 16px;
          border: 1px solid #29435f;
          border-radius: 22px;
          background: #0c2035;
        }

        .back {
          width: 44px;
          height: 44px;
          border: 1px solid #31506e;
          border-radius: 12px;
          background: #102942;
          color: white;
          font-size: 20px;
        }

        .heroIcon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border: 1px solid #31506e;
          border-radius: 16px;
          background: #102942;
          font-size: 25px;
        }

        .badge {
          display: inline-block;
          padding: 4px 9px;
          border: 1px solid #6d512b;
          border-radius: 999px;
          color: #ffc36b;
          font-size: 9px;
        }

        h1 {
          margin: 6px 0 2px;
          font-size: 22px;
        }

        .hero p,
        .searchPanel p,
        .titleRow p {
          margin: 0;
          color: #8194aa;
          font-size: 10px;
        }

        section {
          margin-top: 20px;
        }

        .panel {
          padding: 15px;
          border: 1px solid #29425f;
          border-radius: 19px;
          background: #0c1f34;
        }

        .searchPanel h2 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        input {
          width: 100%;
          min-height: 53px;
          margin-top: 13px;
          padding: 11px 13px;
          border: 1px solid #304b68;
          border-radius: 13px;
          outline: none;
          background: #061522;
          color: #fff;
          font-size: 14px;
        }

        input:focus {
          border-color: #ff700c;
        }

        button {
          font-family: inherit;
          cursor: pointer;
        }

        button:disabled {
          opacity: .5;
        }

        .searchButtons {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }

        .primary,
        .secondary {
          min-height: 47px;
          border-radius: 12px;
          font-weight: 900;
        }

        .primary {
          border: 0;
          background:
            linear-gradient(
              135deg,
              #ff6800,
              #ff862e
            );
          color: #fff;
        }

        .secondary {
          border: 1px solid #304b68;
          background: #10243a;
          color: #c7d4e1;
        }

        .error {
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #75363e;
          border-radius: 12px;
          background: #32181d;
          color: #ffadb5;
          text-align: center;
          font-size: 11px;
        }

        .titleRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .titleRow h2 {
          margin: 0 0 3px;
          font-size: 20px;
        }

        .count {
          min-width: 34px;
          padding: 6px 10px;
          border: 1px solid #28674a;
          border-radius: 999px;
          background: #0d3324;
          color: #7ce4ae;
          text-align: center;
          font-size: 10px;
        }

        .customers {
          display: grid;
          gap: 11px;
        }

        .customer {
          padding: 15px;
          border: 1px solid #29425f;
          border-radius: 19px;
          background: #0b1d31;
        }

        .customerHead {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border: 1px solid #31506e;
          border-radius: 13px;
          background: #102942;
          font-size: 21px;
        }

        .customerEmail {
          min-width: 0;
          flex: 1;
        }

        .customerEmail strong {
          display: block;
          overflow-wrap: anywhere;
          text-align: left;
          font-size: 12px;
        }

        .customerEmail small {
          display: block;
          margin-top: 4px;
          color: #78dfa8;
          font-size: 9px;
        }

        .summary {
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr 1fr;
          gap: 6px;
          margin-top: 13px;
        }

        .summary div {
          padding: 9px 4px;
          border-radius: 10px;
          background: rgba(
            255,
            255,
            255,
            .035
          );
          text-align: center;
        }

        .summary small {
          display: block;
          color: #72879e;
          font-size: 8px;
        }

        .summary strong {
          display: block;
          margin-top: 4px;
          font-size: 15px;
        }

        .block {
          margin-top: 13px;
          padding-top: 12px;
          border-top: 1px solid #1d344b;
        }

        .block h3 {
          margin: 0 0 9px;
          font-size: 13px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .chips span {
          padding: 6px 9px;
          border: 1px solid #34546d;
          border-radius: 999px;
          background: #102941;
          color: #b9cade;
          font-size: 9px;
        }

        .infoLine {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding: 9px;
          border-radius: 10px;
          background: #071724;
          font-size: 9px;
        }

        .infoLine strong {
          overflow-wrap: anywhere;
        }

        .muted {
          padding: 9px;
          border-radius: 10px;
          background: #071724;
          color: #758a9f;
          font-size: 9px;
        }

        .keyList {
          display: grid;
          gap: 7px;
        }

        .keyItem,
        .subscription {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 10px;
          border-radius: 11px;
          background: #071724;
        }

        .keyItem strong,
        .subscription strong {
          display: block;
          font-size: 10px;
        }

        .keyItem small,
        .subscription small {
          display: block;
          margin-top: 3px;
          color: #7890a6;
          font-size: 8px;
        }

        .keyRight,
        .subscription > div:last-child {
          text-align: left;
        }

        .active,
        .stopped {
          display: inline-block;
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
        }

        .active {
          background: #0d3827;
          color: #79e4ad;
        }

        .stopped {
          background: #35191e;
          color: #ffadb5;
        }

        .manageKeys {
          width: 100%;
          min-height: 45px;
          margin-top: 13px;
          border: 1px solid #315474;
          border-radius: 11px;
          background: #102b47;
          color: #dce9f5;
          font-weight: 900;
        }

        .empty {
          padding: 35px 12px;
          text-align: center;
          color: #8296ac;
        }

        footer {
          margin-top: 24px;
        }

        footer button {
          width: 100%;
          min-height: 48px;
          border: 1px solid #2e4864;
          border-radius: 12px;
          background: #0d2035;
          color: #cbd8e5;
          font-weight: 800;
        }

        @media (min-width: 700px) {
          .customers {
            grid-template-columns:
              1fr 1fr;
          }
        }

      `}</style>

    </main>
  );
}
