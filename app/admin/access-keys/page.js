"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getSupabase,
} from "../../../lib/supabase";


function planName(item) {
  return (
    item?.plan?.nameAr ||
    item?.plan?.nameEn ||
    item?.planId ||
    "خطة"
  );
}


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


function statusText(item) {
  if (item?.revokedAt) {
    return "ملغى";
  }

  if (item?.usable) {
    return "نشط";
  }

  return (
    item?.status ||
    "غير نشط"
  );
}


export default function AdminAccessKeysPage() {
  const router =
    useRouter();

  const [
    session,
    setSession,
  ] =
    useState(null);

  const [
    items,
    setItems,
  ] =
    useState([]);

  const [
    selected,
    setSelected,
  ] =
    useState(null);

  const [
    revealedCode,
    setRevealedCode,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    busy,
    setBusy,
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

        if (!response.ok) {
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
     SESSION
     ======================================================= */

  useEffect(() => {
    let mounted =
      true;

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
          router.replace(
            "/login",
          );

          return;
        }

        setSession(
          currentSession,
        );
      } catch {
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

    start();

    return () => {
      mounted =
        false;
    };
  }, [router]);


  /* =======================================================
     LOAD LIST
     ======================================================= */

  const loadKeys =
    useCallback(
      async (
        query = "",
      ) => {
        if (
          !session
            ?.access_token
        ) {
          return;
        }

        setLoading(true);
        setError("");
        setMessage("");
        setSelected(null);
        setRevealedCode("");

        try {
          const clean =
            String(
              query || "",
            ).trim();

          const url =
            clean
              ? `/api/admin/access-keys?q=${encodeURIComponent(clean)}`
              : "/api/admin/access-keys";

          const data =
            await apiRequest(
              url,
            );

          setItems(
            Array.isArray(
              data?.items,
            )
              ? data.items
              : [],
          );
        } catch (loadError) {
          console.error(
            "Keys load failed:",
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
              "ليس لديك صلاحية إدارة المفاتيح.",
            );
          } else {
            setError(
              "تعذر تحميل مفاتيح AWD-KEY.",
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


  useEffect(() => {
    if (
      session
        ?.access_token
    ) {
      loadKeys("");
    }
  }, [
    session,
    loadKeys,
  ]);


  /* =======================================================
     DETAILS
     ======================================================= */

  async function openKey(
    item,
  ) {
    if (!item?.id) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    setRevealedCode("");

    try {
      const data =
        await apiRequest(
          `/api/admin/access-keys?id=${encodeURIComponent(item.id)}`,
        );

      setSelected(
        data?.item ||
        null,
      );

      window.setTimeout(
        () => {
          document
            .getElementById(
              "key-details",
            )
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start",
            });
        },
        100,
      );
    } catch {
      setError(
        "تعذر تحميل تفاصيل المفتاح.",
      );
    } finally {
      setBusy(false);
    }
  }


  async function refreshSelected() {
    if (!selected?.id) {
      return;
    }

    try {
      const data =
        await apiRequest(
          `/api/admin/access-keys?id=${encodeURIComponent(selected.id)}`,
        );

      setSelected(
        data?.item ||
        null,
      );
    } catch {
      // لا نعطل الصفحة
    }
  }


  /* =======================================================
     SEARCH
     ======================================================= */

  async function submitSearch(
    event,
  ) {
    event.preventDefault();

    await loadKeys(
      search,
    );
  }


  function clearSearch() {
    setSearch("");
    loadKeys("");
  }


  /* =======================================================
     REVEAL KEY
     ======================================================= */

  async function revealKey() {
    if (!selected?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        "سيتم كشف AWD-KEY الكامل على الشاشة. هل تريد المتابعة؟",
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const data =
        await apiRequest(
          "/api/admin/access-keys",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                action:
                  "reveal",

                accessKeyId:
                  selected.id,
              }),
          },
        );

      setRevealedCode(
        data?.code ||
        "",
      );

      setMessage(
        "🔑 تم كشف المفتاح للأدمن.",
      );
    } catch {
      setError(
        "تعذر كشف المفتاح.",
      );
    } finally {
      setBusy(false);
    }
  }


  async function copyCode() {
    if (!revealedCode) {
      return;
    }

    try {
      await navigator
        .clipboard
        .writeText(
          revealedCode,
        );

      setMessage(
        "📋 تم نسخ AWD-KEY.",
      );
    } catch {
      setError(
        "تعذر النسخ تلقائيًا.",
      );
    }
  }


  /* =======================================================
     REMOVE ONE DEVICE
     ======================================================= */

  async function removeDevice(
    device,
  ) {
    if (!device?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `هل تريد إزالة هذا الجهاز؟\n${device.deviceName || "جهاز"}`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        "/api/admin/access-keys",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              action:
                "revoke_device",

              activationId:
                device.id,
            }),
        },
      );

      setMessage(
        "✅ تم حذف الجهاز من المفتاح.",
      );

      await refreshSelected();
      await loadKeys(
        search,
      );
    } catch {
      setError(
        "تعذر حذف الجهاز.",
      );
    } finally {
      setBusy(false);
    }
  }


  /* =======================================================
     RESET DEVICES
     ======================================================= */

  async function resetDevices() {
    if (!selected?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        "سيتم إزالة جميع الأجهزة المرتبطة بهذا المفتاح. سيبقى AWD-KEY صالحًا ويمكن استخدامه من جديد. هل تريد المتابعة؟",
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        "/api/admin/access-keys",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              action:
                "reset_devices",

              accessKeyId:
                selected.id,
            }),
        },
      );

      setMessage(
        "♻️ تم إعادة ضبط جميع الأجهزة.",
      );

      await refreshSelected();
      await loadKeys(
        search,
      );
    } catch {
      setError(
        "تعذر إعادة ضبط الأجهزة.",
      );
    } finally {
      setBusy(false);
    }
  }


  /* =======================================================
     REVOKE KEY
     ======================================================= */

  async function revokeKey() {
    if (!selected?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        "تحذير: سيتم إلغاء AWD-KEY وإيقاف جميع الأجهزة المرتبطة به. هل تريد المتابعة؟",
      );

    if (!confirmed) {
      return;
    }

    const secondConfirm =
      window.confirm(
        "تأكيد أخير: هل تريد إلغاء المفتاح نهائيًا؟",
      );

    if (!secondConfirm) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        "/api/admin/access-keys",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              action:
                "revoke_key",

              accessKeyId:
                selected.id,

              reason:
                "Manual Admin Revoke",
            }),
        },
      );

      setMessage(
        "⛔ تم إلغاء المفتاح وإيقاف أجهزته.",
      );

      setRevealedCode("");

      await refreshSelected();
      await loadKeys(
        search,
      );
    } catch {
      setError(
        "تعذر إلغاء المفتاح.",
      );
    } finally {
      setBusy(false);
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

        {/* HEADER */}

        <header className="hero">

          <button
            className="back"
            type="button"
            onClick={() =>
              router.push(
                "/admin",
              )
            }
          >
            ←
          </button>

          <div className="logo">
            🔑
          </div>

          <div>
            <span className="badge">
              AllWDbook Admin
            </span>

            <h1>
              إدارة AWD-KEY
            </h1>

            <p>
              البحث، الأجهزة،
              الكشف والإلغاء
            </p>
          </div>

        </header>


        {/* SEARCH */}

        <section className="panel">

          <h2>
            🔎 البحث عن مفتاح
          </h2>

          <p className="hint">
            يمكنك البحث بالبريد،
            AWD-KEY الكامل أو Code Hint.
          </p>

          <form
            onSubmit={
              submitSearch
            }
          >

            <input
              type="text"
              dir="ltr"
              placeholder="email / AWD-KEY / hint"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />

            <div className="searchActions">

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
                  clearSearch
                }
                disabled={loading}
              >
                الكل
              </button>

            </div>

          </form>

        </section>


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


        {/* LIST */}

        <section>

          <div className="titleRow">

            <div>
              <h2>
                🔑 المفاتيح
              </h2>

              <p>
                آخر النتائج
              </p>
            </div>

            <span className="count">
              {items.length}
            </span>

          </div>


          {loading ? (
            <div className="panel loading">
              جارٍ تحميل المفاتيح...
            </div>
          ) : items.length === 0 ? (
            <div className="panel empty">
              لا توجد نتائج.
            </div>
          ) : (
            <div className="keys">

              {items.map(
                (item) => (
                  <article
                    className="keyCard"
                    key={item.id}
                  >

                    <div className="keyTop">

                      <div>
                        <strong>
                          {planName(
                            item,
                          )}
                        </strong>

                        <small
                          dir="ltr"
                        >
                          {item.codeHint ||
                            "AWD-KEY"}
                        </small>
                      </div>

                      <span
                        className={
                          item.usable
                            ? "status active"
                            : "status stopped"
                        }
                      >
                        {statusText(
                          item,
                        )}
                      </span>

                    </div>


                    <div className="miniGrid">

                      <div>
                        <small>
                          الأجهزة
                        </small>

                        <b>
                          {item.activeDevices}
                          /
                          {item.maxActivations}
                        </b>
                      </div>

                      <div>
                        <small>
                          المصدر
                        </small>

                        <b>
                          {item.source ||
                            "—"}
                        </b>
                      </div>

                    </div>


                    {item.purchaserEmail && (
                      <div
                        className="email"
                        dir="ltr"
                      >
                        📧 {item.purchaserEmail}
                      </div>
                    )}


                    <button
                      type="button"
                      className="detailsButton"
                      onClick={() =>
                        openKey(
                          item,
                        )
                      }
                      disabled={busy}
                    >
                      إدارة المفتاح
                      ←
                    </button>

                  </article>
                ),
              )}

            </div>
          )}

        </section>


        {/* DETAILS */}

        {selected && (
          <section
            id="key-details"
          >

            <div className="titleRow">

              <div>
                <h2>
                  🛠️ تفاصيل المفتاح
                </h2>

                <p>
                  إدارة كاملة وآمنة
                </p>
              </div>

            </div>


            <div className="panel detailPanel">

              <div className="detailHead">

                <div>
                  <strong>
                    {planName(
                      selected,
                    )}
                  </strong>

                  <small
                    dir="ltr"
                  >
                    {selected.codeHint}
                  </small>
                </div>

                <span
                  className={
                    selected.usable
                      ? "status active"
                      : "status stopped"
                  }
                >
                  {statusText(
                    selected,
                  )}
                </span>

              </div>


              <div className="infoGrid">

                <div>
                  <small>
                    الخطة
                  </small>

                  <strong>
                    {selected.planId}
                  </strong>
                </div>

                <div>
                  <small>
                    الأجهزة
                  </small>

                  <strong>
                    {selected.activeDevices}
                    /
                    {selected.maxActivations}
                  </strong>
                </div>

                <div>
                  <small>
                    الإنشاء
                  </small>

                  <strong>
                    {dateText(
                      selected.createdAt,
                    )}
                  </strong>
                </div>

                <div>
                  <small>
                    الانتهاء
                  </small>

                  <strong>
                    {selected.expiresAt
                      ? dateText(
                          selected.expiresAt,
                        )
                      : "دائم"}
                  </strong>
                </div>

              </div>


              {selected.purchaserEmail && (
                <div className="dataRow">
                  <span>
                    بريد العميل
                  </span>

                  <strong
                    dir="ltr"
                  >
                    {
                      selected.purchaserEmail
                    }
                  </strong>
                </div>
              )}


              <div className="dataRow">

                <span>
                  بريد الحماية
                </span>

                <strong
                  dir="ltr"
                >
                  {selected
                    .recoveryEmail
                    ? selected.recoveryEmail
                    : "غير مضاف"}
                </strong>

              </div>


              <div className="dataRow">

                <span>
                  التحقق
                </span>

                <strong>
                  {selected
                    .recoveryEmailVerified
                    ? "✅ موثق"
                    : "—"}
                </strong>

              </div>


              {selected.note && (
                <div className="note">
                  📝 {selected.note}
                </div>
              )}


              {/* REVEALED CODE */}

              {revealedCode && (
                <div className="revealed">

                  <small>
                    AWD-KEY الكامل
                  </small>

                  <div
                    dir="ltr"
                    className="fullCode"
                  >
                    {revealedCode}
                  </div>

                  <button
                    type="button"
                    onClick={
                      copyCode
                    }
                  >
                    📋 نسخ المفتاح
                  </button>

                </div>
              )}


              {/* ACTIONS */}

              <div className="actionsGrid">

                <button
                  type="button"
                  className="blue"
                  onClick={
                    revealKey
                  }
                  disabled={busy}
                >
                  👁️ كشف AWD-KEY
                </button>

                <button
                  type="button"
                  className="orange"
                  onClick={
                    resetDevices
                  }
                  disabled={
                    busy ||
                    selected.activeDevices === 0
                  }
                >
                  ♻️ إعادة ضبط الأجهزة
                </button>

                <button
                  type="button"
                  className="red"
                  onClick={
                    revokeKey
                  }
                  disabled={
                    busy ||
                    !selected.usable
                  }
                >
                  ⛔ إلغاء المفتاح
                </button>

              </div>

            </div>


            {/* DEVICES */}

            <div className="panel devicesPanel">

              <div className="devicesTitle">

                <h3>
                  📱 الأجهزة المرتبطة
                </h3>

                <span>
                  {
                    selected.devices
                      ?.filter(
                        (device) =>
                          device.active,
                      )
                      .length || 0
                  }
                </span>

              </div>


              {!selected.devices ||
              selected.devices.length ===
                0 ? (
                <div className="empty">
                  لا توجد أجهزة مرتبطة.
                </div>
              ) : (
                <div className="devices">

                  {selected.devices.map(
                    (device) => (
                      <article
                        className={
                          device.active
                            ? "device"
                            : "device revoked"
                        }
                        key={device.id}
                      >

                        <div className="deviceHead">

                          <div className="deviceIcon">
                            📱
                          </div>

                          <div>
                            <strong>
                              {
                                device.deviceName
                              }
                            </strong>

                            <small>
                              {device.active
                                ? "✅ نشط"
                                : "⛔ تمت إزالته"}
                            </small>
                          </div>

                        </div>


                        <div className="deviceInfo">

                          <span>
                            أول تفعيل
                          </span>

                          <b>
                            {dateText(
                              device.activatedAt,
                            )}
                          </b>

                        </div>


                        <div className="deviceInfo">

                          <span>
                            آخر ظهور
                          </span>

                          <b>
                            {dateText(
                              device.lastSeenAt,
                            )}
                          </b>

                        </div>


                        {device
                          ?.deviceInfo
                          ?.platform && (
                          <div className="deviceInfo">

                            <span>
                              النظام
                            </span>

                            <b>
                              {
                                device
                                  .deviceInfo
                                  .platform
                              }
                            </b>

                          </div>
                        )}


                        {device.active && (
                          <button
                            type="button"
                            className="removeDevice"
                            onClick={() =>
                              removeDevice(
                                device,
                              )
                            }
                            disabled={busy}
                          >
                            ❌ إزالة هذا الجهاز
                          </button>
                        )}

                      </article>
                    ),
                  )}

                </div>
              )}

            </div>

          </section>
        )}


        <footer>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin",
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
          color: white;
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

        .logo {
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
          padding: 4px 8px;
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
        .titleRow p,
        .hint {
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

        .panel h2 {
          margin: 0 0 6px;
          font-size: 17px;
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
          color: white;
          font-size: 13px;
        }

        input:focus {
          border-color: #ff700c;
        }

        button {
          cursor: pointer;
          font-family: inherit;
        }

        button:disabled {
          opacity: .5;
          cursor: wait;
        }

        .searchActions {
          display: grid;
          grid-template-columns:
            2fr 1fr;
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
          background: linear-gradient(
            135deg,
            #ff6800,
            #ff862e
          );
          color: white;
        }

        .secondary {
          border: 1px solid #304b68;
          background: #10243a;
          color: #c7d4e1;
        }

        .notice {
          margin-top: 12px;
          padding: 11px;
          border-radius: 12px;
          text-align: center;
          font-size: 11px;
        }

        .good {
          border: 1px solid #28704f;
          background: #0c3022;
          color: #8ce7b6;
        }

        .bad {
          border: 1px solid #75363e;
          background: #32181d;
          color: #ffadb5;
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
          font-size: 19px;
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

        .keys {
          display: grid;
          gap: 10px;
        }

        .keyCard {
          padding: 14px;
          border: 1px solid #29425f;
          border-radius: 17px;
          background: #0b1d31;
        }

        .keyTop,
        .detailHead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .keyTop strong,
        .detailHead strong {
          display: block;
          font-size: 15px;
        }

        .keyTop small,
        .detailHead small {
          display: block;
          margin-top: 4px;
          color: #8396ac;
          font-size: 10px;
        }

        .status {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
        }

        .status.active {
          border: 1px solid #26714f;
          background: #0b3625;
          color: #79e5ad;
        }

        .status.stopped {
          border: 1px solid #69363d;
          background: #30181d;
          color: #ffadb5;
        }

        .miniGrid,
        .infoGrid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .miniGrid div,
        .infoGrid div {
          padding: 10px;
          border-radius: 11px;
          background: rgba(
            255,
            255,
            255,
            .035
          );
        }

        .miniGrid small,
        .infoGrid small {
          display: block;
          color: #74889f;
          font-size: 9px;
        }

        .miniGrid b,
        .infoGrid strong {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .email {
          margin-top: 10px;
          padding: 9px;
          border-radius: 10px;
          background: #061522;
          color: #93a8be;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .detailsButton {
          width: 100%;
          min-height: 43px;
          margin-top: 11px;
          border: 1px solid #315271;
          border-radius: 11px;
          background: #102a45;
          color: #dbe7f3;
          font-weight: 900;
        }

        .detailPanel {
          scroll-margin-top: 15px;
        }

        .dataRow {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 9px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(
            255,
            255,
            255,
            .035
          );
          font-size: 10px;
        }

        .dataRow span {
          color: #7e91a8;
        }

        .dataRow strong {
          text-align: left;
          overflow-wrap: anywhere;
        }

        .note {
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #334861;
          border-radius: 11px;
          background: #071724;
          color: #a1b0c1;
          font-size: 10px;
        }

        .revealed {
          margin-top: 13px;
          padding: 13px;
          border: 1px solid #327457;
          border-radius: 14px;
          background: #0a2d21;
          text-align: center;
        }

        .revealed small {
          color: #83cba7;
        }

        .fullCode {
          margin-top: 8px;
          padding: 11px 7px;
          border-radius: 10px;
          background: #04141c;
          color: #ffc56b;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .revealed button {
          width: 100%;
          min-height: 42px;
          margin-top: 9px;
          border: 1px solid #337357;
          border-radius: 10px;
          background: #105137;
          color: #b7f3d3;
          font-weight: 900;
        }

        .actionsGrid {
          display: grid;
          gap: 8px;
          margin-top: 13px;
        }

        .actionsGrid button {
          min-height: 47px;
          border-radius: 11px;
          font-weight: 900;
        }

        .blue {
          border: 1px solid #315e8c;
          background: #102f50;
          color: #b9ddff;
        }

        .orange {
          border: 1px solid #805b24;
          background: #352611;
          color: #ffd28d;
        }

        .red {
          border: 1px solid #833d46;
          background: #38191f;
          color: #ffb1b9;
        }

        .devicesPanel {
          margin-top: 10px;
        }

        .devicesTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .devicesTitle h3 {
          margin: 0;
          font-size: 15px;
        }

        .devicesTitle span {
          padding: 5px 9px;
          border-radius: 999px;
          background: #102940;
          color: #9cb5cc;
          font-size: 9px;
        }

        .devices {
          display: grid;
          gap: 9px;
          margin-top: 12px;
        }

        .device {
          padding: 12px;
          border: 1px solid #29425f;
          border-radius: 13px;
          background: #061522;
        }

        .device.revoked {
          opacity: .55;
        }

        .deviceHead {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .deviceIcon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #102a43;
        }

        .deviceHead strong {
          display: block;
          font-size: 11px;
        }

        .deviceHead small {
          display: block;
          margin-top: 2px;
          color: #7990a7;
          font-size: 9px;
        }

        .deviceInfo {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #172b3f;
          font-size: 9px;
        }

        .deviceInfo span {
          color: #74889f;
        }

        .deviceInfo b {
          text-align: left;
          overflow-wrap: anywhere;
        }

        .removeDevice {
          width: 100%;
          min-height: 40px;
          margin-top: 10px;
          border: 1px solid #733940;
          border-radius: 10px;
          background: #30181d;
          color: #ffadb5;
          font-weight: 800;
        }

        .loading,
        .empty {
          padding: 30px 12px;
          text-align: center;
          color: #8498ae;
        }

        footer {
          margin-top: 25px;
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

        @media (
          min-width: 700px
        ) {
          .keys {
            grid-template-columns:
              1fr 1fr;
          }

          .actionsGrid {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }

          .devices {
            grid-template-columns:
              1fr 1fr;
          }
        }

      `}</style>

    </main>
  );
}
