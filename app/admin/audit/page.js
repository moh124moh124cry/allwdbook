"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";


/* =========================================================
   HELPERS
   ========================================================= */

function dateText(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value)
      .toLocaleString("ar-DZ");
  } catch {
    return "—";
  }
}


function eventInfo(type) {
  const events = {
    admin_created: {
      icon: "🎁",
      label: "إنشاء مفتاح بواسطة الأدمن",
    },

    admin_key_revealed: {
      icon: "👁️",
      label: "كشف AWD-KEY",
    },

    admin_key_revoked: {
      icon: "⛔",
      label: "إلغاء المفتاح",
    },

    device_activated: {
      icon: "📱",
      label: "تفعيل جهاز جديد",
    },

    device_reactivated: {
      icon: "🔄",
      label: "إعادة تفعيل جهاز",
    },

    device_revoked: {
      icon: "❌",
      label: "إزالة جهاز",
    },

    devices_reset: {
      icon: "♻️",
      label: "إعادة ضبط الأجهزة",
    },

    activation_limit_reached: {
      icon: "⚠️",
      label: "بلوغ حد الأجهزة",
    },

    recovery_challenge_created: {
      icon: "📧",
      label: "إرسال رمز استعادة",
    },

    recovery_challenge_verified: {
      icon: "✅",
      label: "نجاح التحقق بالبريد",
    },

    recovery_challenge_failed: {
      icon: "🚫",
      label: "فشل التحقق بالبريد",
    },

    recovery_completed: {
      icon: "🔐",
      label: "استعادة الوصول",
    },

    email_verified: {
      icon: "✉️",
      label: "توثيق بريد الحماية",
    },

    access_key_activated: {
      icon: "🔑",
      label: "تفعيل AWD-KEY",
    },
  };

  return (
    events[type] || {
      icon: "🛡️",
      label:
        String(type || "حدث أمني")
          .replaceAll("_", " "),
    }
  );
}


function hasMetadata(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function AdminAuditPage() {
  const router = useRouter();

  const [session, setSession] =
    useState(null);

  const [items, setItems] =
    useState([]);

  const [eventTypes, setEventTypes] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedEvent, setSelectedEvent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     API
     ======================================================= */

  const apiRequest =
    useCallback(
      async (path) => {
        if (!session?.access_token) {
          throw new Error("NO_SESSION");
        }

        const response =
          await fetch(path, {
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

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);


  /* =======================================================
     LOAD AUDIT
     ======================================================= */

  const loadAudit =
    useCallback(
      async (
        query = "",
        eventType = ""
      ) => {
        if (
          !session
            ?.access_token
        ) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "limit",
            "150"
          );

          const cleanQuery =
            String(query || "")
              .trim();

          const cleanEvent =
            String(
              eventType || ""
            ).trim();

          if (cleanQuery) {
            params.set(
              "q",
              cleanQuery
            );
          }

          if (cleanEvent) {
            params.set(
              "event",
              cleanEvent
            );
          }

          const data =
            await apiRequest(
              `/api/admin/audit?${params.toString()}`
            );

          setItems(
            Array.isArray(
              data?.items
            )
              ? data.items
              : []
          );

          /*
           * نحفظ قائمة أنواع الأحداث
           * من التحميل العام حتى لا تختفي
           * الخيارات بعد اختيار فلتر.
           */
          if (
            !cleanEvent &&
            Array.isArray(
              data?.eventTypes
            )
          ) {
            setEventTypes(
              data.eventTypes
            );
          }
        } catch (loadError) {
          console.error(
            "Audit load failed:",
            loadError
          );

          if (
            loadError?.status === 401 ||
            loadError?.status === 403
          ) {
            setError(
              "ليس لديك صلاحية عرض السجل الأمني."
            );
          } else {
            setError(
              "تعذر تحميل السجل الأمني."
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
      loadAudit("", "");
    }
  }, [
    session,
    loadAudit,
  ]);


  /* =======================================================
     SEARCH
     ======================================================= */

  async function submitSearch(
    event
  ) {
    event.preventDefault();

    await loadAudit(
      search,
      selectedEvent
    );
  }


  async function resetFilters() {
    setSearch("");
    setSelectedEvent("");

    await loadAudit(
      "",
      ""
    );
  }


  async function changeEvent(
    event
  ) {
    const value =
      event.target.value;

    setSelectedEvent(
      value
    );

    await loadAudit(
      search,
      value
    );
  }


  /* =======================================================
     OPEN KEY
     ======================================================= */

  function openKey(item) {
    const hint =
      item?.key?.codeHint;

    if (!hint) {
      router.push(
        "/admin/access-keys"
      );

      return;
    }

    router.push(
      `/admin/access-keys?q=${encodeURIComponent(
        hint
      )}`
    );
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
              router.push(
                "/admin"
              )
            }
          >
            ←
          </button>

          <div className="heroIcon">
            🛡️
          </div>

          <div>
            <span className="badge">
              AllWDbook Admin
            </span>

            <h1>
              السجل الأمني
            </h1>

            <p>
              سجل التفعيل والاستعادة
              والأجهزة وإجراءات الإدارة
            </p>
          </div>

        </header>


        {/* FILTERS */}

        <section className="panel">

          <h2>
            🔎 البحث والتصفية
          </h2>

          <p className="hint">
            ابحث بالبريد، الخطة،
            Code Hint أو نوع الحدث.
          </p>


          <form
            onSubmit={
              submitSearch
            }
          >

            <input
              type="text"
              dir="ltr"
              placeholder="email / AWD-KEY hint / event"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            <select
              value={
                selectedEvent
              }
              onChange={
                changeEvent
              }
              disabled={loading}
            >
              <option value="">
                جميع الأحداث
              </option>

              {eventTypes.map(
                (type) => {
                  const info =
                    eventInfo(type);

                  return (
                    <option
                      value={type}
                      key={type}
                    >
                      {info.icon}
                      {" "}
                      {info.label}
                    </option>
                  );
                }
              )}

            </select>


            <div className="filterButtons">

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
                onClick={
                  resetFilters
                }
                disabled={loading}
              >
                إعادة ضبط
              </button>

            </div>

          </form>

        </section>


        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* LIST */}

        <section>

          <div className="titleRow">

            <div>
              <h2>
                🛡️ الأحداث الأمنية
              </h2>

              <p>
                الأحدث أولًا
              </p>
            </div>

            <span className="count">
              {items.length}
            </span>

          </div>


          {loading ? (
            <div className="panel empty">
              جارٍ تحميل السجل الأمني...
            </div>
          ) : items.length === 0 ? (
            <div className="panel empty">
              لا توجد أحداث مطابقة.
            </div>
          ) : (
            <div className="events">

              {items.map(
                (item) => {
                  const info =
                    eventInfo(
                      item.eventType
                    );

                  return (
                    <article
                      className="eventCard"
                      key={item.id}
                    >

                      {/* EVENT HEADER */}

                      <div className="eventHead">

                        <div className="eventIcon">
                          {info.icon}
                        </div>

                        <div className="eventTitle">

                          <strong>
                            {info.label}
                          </strong>

                          <small
                            dir="ltr"
                          >
                            {
                              item.eventType
                            }
                          </small>

                        </div>

                      </div>


                      {/* DATE */}

                      <div className="date">
                        🕒
                        {" "}
                        {dateText(
                          item.createdAt
                        )}
                      </div>


                      {/* KEY */}

                      {item.key && (
                        <div className="block">

                          <div className="blockTitle">
                            🔑 المفتاح
                          </div>

                          <div className="infoRow">
                            <span>
                              الخطة
                            </span>

                            <strong>
                              {item.key.planName ||
                                item.key.planId}
                            </strong>
                          </div>

                          <div className="infoRow">
                            <span>
                              Code Hint
                            </span>

                            <strong
                              dir="ltr"
                            >
                              {item.key.codeHint ||
                                "—"}
                            </strong>
                          </div>


                          {item.key
                            .purchaserEmail && (
                            <div className="infoRow">

                              <span>
                                بريد العميل
                              </span>

                              <strong
                                dir="ltr"
                              >
                                {
                                  item.key
                                    .purchaserEmail
                                }
                              </strong>

                            </div>
                          )}


                          {item.key
                            .recoveryEmail && (
                            <div className="infoRow">

                              <span>
                                بريد الحماية
                              </span>

                              <strong
                                dir="ltr"
                              >
                                {
                                  item.key
                                    .recoveryEmail
                                }
                              </strong>

                            </div>
                          )}

                        </div>
                      )}


                      {/* ACTOR */}

                      <div className="block">

                        <div className="blockTitle">
                          👤 منفذ العملية
                        </div>

                        <div className="infoRow">

                          <span>
                            البريد
                          </span>

                          <strong
                            dir="ltr"
                          >
                            {item.actorEmail ||
                              "النظام / المستخدم"}
                          </strong>

                        </div>


                        {item.actorUserId && (
                          <div className="infoRow">

                            <span>
                              User ID
                            </span>

                            <strong
                              dir="ltr"
                              className="break"
                            >
                              {
                                item.actorUserId
                              }
                            </strong>

                          </div>
                        )}

                      </div>


                      {/* METADATA */}

                      {hasMetadata(
                        item.metadata
                      ) && (
                        <details className="metadata">

                          <summary>
                            🧾 تفاصيل تقنية
                          </summary>

                          <pre dir="ltr">
                            {JSON.stringify(
                              item.metadata,
                              null,
                              2
                            )}
                          </pre>

                        </details>
                      )}


                      {/* MANAGE KEY */}

                      {item.key && (
                        <button
                          type="button"
                          className="manage"
                          onClick={() =>
                            openKey(item)
                          }
                        >
                          🔑 فتح إدارة المفتاح
                        </button>
                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* FOOTER */}

        <footer>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin"
              )
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

          border:
            1px solid #29435f;

          border-radius: 22px;

          background: #0c2035;
        }

        .back {
          width: 44px;
          height: 44px;

          border:
            1px solid #31506e;

          border-radius: 12px;

          background: #102942;
          color: #fff;

          font-size: 20px;
        }

        .heroIcon {
          width: 56px;
          height: 56px;

          display: grid;
          place-items: center;

          border:
            1px solid #31506e;

          border-radius: 16px;

          background: #102942;

          font-size: 25px;
        }

        .badge {
          display: inline-block;

          padding: 4px 9px;

          border:
            1px solid #6d512b;

          border-radius: 999px;

          color: #ffc36b;

          font-size: 9px;
        }

        h1 {
          margin: 6px 0 2px;

          font-size: 22px;
        }

        .hero p,
        .hint,
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

          border:
            1px solid #29425f;

          border-radius: 19px;

          background: #0c1f34;
        }

        .panel h2 {
          margin: 0 0 6px;

          font-size: 18px;
        }

        input,
        select {
          width: 100%;

          min-height: 52px;

          margin-top: 11px;

          padding: 10px 12px;

          border:
            1px solid #304b68;

          border-radius: 13px;

          outline: none;

          background: #061522;

          color: #fff;

          font-size: 13px;
        }

        select {
          direction: rtl;
        }

        input:focus,
        select:focus {
          border-color: #ff700c;
        }

        button {
          font-family: inherit;
          cursor: pointer;
        }

        button:disabled {
          opacity: .5;
        }

        .filterButtons {
          display: grid;

          grid-template-columns:
            2fr 1fr;

          gap: 8px;

          margin-top: 10px;
        }

        .primary,
        .secondary {
          min-height: 46px;

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
          border:
            1px solid #304b68;

          background: #10243a;

          color: #c7d4e1;
        }

        .error {
          margin-top: 12px;

          padding: 12px;

          border:
            1px solid #75363e;

          border-radius: 12px;

          background: #32181d;

          color: #ffadb5;

          text-align: center;

          font-size: 11px;
        }

        .titleRow {
          display: flex;

          justify-content:
            space-between;

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

          border:
            1px solid #28674a;

          border-radius: 999px;

          background: #0d3324;

          color: #7ce4ae;

          text-align: center;

          font-size: 10px;
        }

        .events {
          display: grid;
          gap: 10px;
        }

        .eventCard {
          padding: 14px;

          border:
            1px solid #29425f;

          border-radius: 18px;

          background: #0b1d31;
        }

        .eventHead {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .eventIcon {
          width: 46px;
          height: 46px;

          flex: 0 0 auto;

          display: grid;
          place-items: center;

          border:
            1px solid #31506e;

          border-radius: 13px;

          background: #102942;

          font-size: 20px;
        }

        .eventTitle {
          min-width: 0;
        }

        .eventTitle strong {
          display: block;

          font-size: 13px;
        }

        .eventTitle small {
          display: block;

          margin-top: 3px;

          color: #73889f;

          font-size: 8px;

          overflow-wrap: anywhere;
        }

        .date {
          margin-top: 11px;

          padding: 9px;

          border-radius: 10px;

          background: #071724;

          color: #90a4b9;

          font-size: 9px;
        }

        .block {
          margin-top: 10px;

          padding: 11px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              .035
            );
        }

        .blockTitle {
          margin-bottom: 8px;

          color: #d9e5ef;

          font-size: 10px;

          font-weight: 900;
        }

        .infoRow {
          display: flex;

          justify-content:
            space-between;

          gap: 10px;

          padding: 7px 0;

          border-bottom:
            1px solid #1c3248;

          font-size: 9px;
        }

        .infoRow:last-child {
          border-bottom: 0;
        }

        .infoRow span {
          color: #74899f;
        }

        .infoRow strong {
          max-width: 65%;

          text-align: left;

          overflow-wrap: anywhere;
        }

        .break {
          word-break: break-all;
        }

        .metadata {
          margin-top: 10px;

          border:
            1px solid #29445f;

          border-radius: 11px;

          background: #061522;

          overflow: hidden;
        }

        .metadata summary {
          padding: 10px;

          color: #a9bbcd;

          font-size: 9px;

          cursor: pointer;
        }

        .metadata pre {
          max-height: 260px;

          margin: 0;

          padding: 10px;

          overflow: auto;

          border-top:
            1px solid #1c3248;

          color: #8fd0aa;

          font-size: 8px;

          white-space: pre-wrap;

          word-break: break-all;
        }

        .manage {
          width: 100%;

          min-height: 43px;

          margin-top: 11px;

          border:
            1px solid #315474;

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

          border:
            1px solid #2e4864;

          border-radius: 12px;

          background: #0d2035;

          color: #cbd8e5;

          font-weight: 800;
        }

        @media (min-width: 700px) {
          .events {
            grid-template-columns:
              1fr 1fr;
          }
        }

      `}</style>

    </main>
  );
}
