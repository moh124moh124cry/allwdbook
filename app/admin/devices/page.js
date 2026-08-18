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


function shortUserId(value) {
  const text =
    String(value || "");

  if (!text) {
    return "—";
  }

  if (text.length <= 18) {
    return text;
  }

  return (
    text.slice(0, 8) +
    "…" +
    text.slice(-6)
  );
}


function platformText(info) {
  if (!info) {
    return "غير معروف";
  }

  return (
    info.platform ||
    info.os ||
    info.browser ||
    "غير معروف"
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function AdminDevicesPage() {
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
    search,
    setSearch,
  ] =
    useState("");

  const [
    showAll,
    setShowAll,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    busyId,
    setBusyId,
  ] =
    useState("");

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
          !session?.access_token
        ) {
          throw new Error(
            "NO_SESSION"
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

                ...(options.headers ||
                  {}),
              },

              cache:
                "no-store",
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

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
            "/login"
          );

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

          setLoading(
            false
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
     LOAD DEVICES
     ======================================================= */

  const loadDevices =
    useCallback(
      async (
        query = "",
        includeAll = false
      ) => {
        if (
          !session?.access_token
        ) {
          return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "limit",
            "200"
          );

          if (includeAll) {
            params.set(
              "all",
              "1"
            );
          }

          const clean =
            String(
              query || ""
            ).trim();

          if (clean) {
            params.set(
              "q",
              clean
            );
          }

          const data =
            await apiRequest(
              `/api/admin/devices?${params.toString()}`
            );

          setItems(
            Array.isArray(
              data?.items
            )
              ? data.items
              : []
          );
        } catch (
          loadError
        ) {
          console.error(
            "Devices load failed:",
            loadError
          );

          if (
            loadError?.status ===
              401 ||
            loadError?.status ===
              403
          ) {
            setError(
              "ليس لديك صلاحية إدارة الأجهزة."
            );
          } else {
            setError(
              "تعذر تحميل الأجهزة."
            );
          }
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        apiRequest,
        session,
      ]
    );


  useEffect(() => {
    if (
      session?.access_token
    ) {
      loadDevices(
        "",
        false
      );
    }
  }, [
    session,
    loadDevices,
  ]);


  /* =======================================================
     SEARCH
     ======================================================= */

  async function submitSearch(
    event
  ) {
    event.preventDefault();

    await loadDevices(
      search,
      showAll
    );
  }


  async function clearSearch() {
    setSearch("");

    await loadDevices(
      "",
      showAll
    );
  }


  async function toggleAll() {
    const next =
      !showAll;

    setShowAll(next);

    await loadDevices(
      search,
      next
    );
  }


  /* =======================================================
     REMOVE DEVICE
     ======================================================= */

  async function removeDevice(
    device
  ) {
    if (
      !device?.id ||
      !device.active
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `هل تريد إزالة هذا الجهاز؟\n\n${device.deviceName || "جهاز"}`
      );

    if (!confirmed) {
      return;
    }

    setBusyId(
      device.id
    );

    setError("");
    setMessage("");

    try {
      await apiRequest(
        "/api/admin/devices",
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
        }
      );

      setMessage(
        "✅ تم إزالة الجهاز بنجاح."
      );

      await loadDevices(
        search,
        showAll
      );
    } catch {
      setError(
        "تعذر إزالة الجهاز."
      );
    } finally {
      setBusyId("");
    }
  }


  /* =======================================================
     RESET KEY DEVICES
     ======================================================= */

  async function resetKeyDevices(
    device
  ) {
    const keyId =
      device?.key?.id ||
      device?.accessKeyId;

    if (!keyId) {
      return;
    }

    const confirmed =
      window.confirm(
        "سيتم إزالة جميع الأجهزة المرتبطة بهذا AWD-KEY، لكن المفتاح نفسه سيبقى صالحًا ويمكن تفعيله من جديد.\n\nهل تريد المتابعة؟"
      );

    if (!confirmed) {
      return;
    }

    const second =
      window.confirm(
        "تأكيد أخير: إعادة ضبط جميع أجهزة هذا المفتاح؟"
      );

    if (!second) {
      return;
    }

    setBusyId(
      `reset-${keyId}`
    );

    setError("");
    setMessage("");

    try {
      await apiRequest(
        "/api/admin/devices",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              action:
                "reset_key_devices",

              accessKeyId:
                keyId,
            }),
        }
      );

      setMessage(
        "♻️ تم إعادة ضبط جميع أجهزة المفتاح."
      );

      await loadDevices(
        search,
        showAll
      );
    } catch {
      setError(
        "تعذر إعادة ضبط الأجهزة."
      );
    } finally {
      setBusyId("");
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
            📱
          </div>

          <div>
            <span className="badge">
              AllWDbook Admin
            </span>

            <h1>
              إدارة الأجهزة
            </h1>

            <p>
              الأجهزة المرتبطة
              بمفاتيح AWD-KEY
            </p>
          </div>

        </header>


        {/* SEARCH */}

        <section className="panel">

          <h2>
            🔎 البحث عن جهاز
          </h2>

          <p className="hint">
            ابحث بالبريد، اسم الجهاز،
            الخطة، Code Hint أو User ID.
          </p>


          <form
            onSubmit={
              submitSearch
            }
          >

            <input
              type="text"
              dir="ltr"
              placeholder="email / device / AWD-KEY hint"
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
                onClick={
                  clearSearch
                }
                disabled={loading}
              >
                الكل
              </button>

            </div>

          </form>


          <button
            type="button"
            className={
              showAll
                ? "history activeToggle"
                : "history"
            }
            onClick={
              toggleAll
            }
            disabled={loading}
          >
            {showAll
              ? "✅ عرض النشطة والمحذوفة"
              : "🕘 عرض سجل الأجهزة المحذوفة أيضًا"}
          </button>

        </section>


        {/* MESSAGES */}

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


        {/* DEVICES */}

        <section>

          <div className="titleRow">

            <div>
              <h2>
                📱 الأجهزة
              </h2>

              <p>
                {showAll
                  ? "النشطة والمحذوفة"
                  : "الأجهزة النشطة حاليًا"}
              </p>
            </div>

            <span className="count">
              {items.length}
            </span>

          </div>


          {loading ? (
            <div className="panel empty">
              جارٍ تحميل الأجهزة...
            </div>
          ) : items.length ===
            0 ? (
            <div className="panel empty">
              لا توجد أجهزة مطابقة.
            </div>
          ) : (
            <div className="devices">

              {items.map(
                (device) => (
                  <article
                    className={
                      device.active
                        ? "deviceCard"
                        : "deviceCard revoked"
                    }
                    key={
                      device.id
                    }
                  >

                    {/* DEVICE HEADER */}

                    <div className="deviceHead">

                      <div className="deviceIcon">
                        📱
                      </div>

                      <div className="deviceTitle">

                        <strong>
                          {device.deviceName ||
                            "جهاز"}
                        </strong>

                        <small>
                          {device.active
                            ? "✅ جهاز نشط"
                            : "⛔ تمت إزالته"}
                        </small>

                      </div>

                      <span
                        className={
                          device.active
                            ? "status active"
                            : "status stopped"
                        }
                      >
                        {device.active
                          ? "نشط"
                          : "محذوف"}
                      </span>

                    </div>


                    {/* PLAN */}

                    {device.key && (
                      <div className="keyBox">

                        <div>
                          <small>
                            الخطة
                          </small>

                          <strong>
                            {device.key
                              .planName ||
                              device.key
                                .planId ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <small>
                            AWD-KEY
                          </small>

                          <strong
                            dir="ltr"
                          >
                            {device.key
                              .codeHint ||
                              "—"}
                          </strong>
                        </div>

                      </div>
                    )}


                    {/* EMAIL */}

                    {device.key
                      ?.purchaserEmail && (
                      <div className="infoRow">

                        <span>
                          📧 بريد العميل
                        </span>

                        <strong
                          dir="ltr"
                        >
                          {
                            device.key
                              .purchaserEmail
                          }
                        </strong>

                      </div>
                    )}


                    {device.key
                      ?.recoveryEmail && (
                      <div className="infoRow">

                        <span>
                          🛡️ بريد الحماية
                        </span>

                        <strong
                          dir="ltr"
                        >
                          {
                            device.key
                              .recoveryEmail
                          }
                        </strong>

                      </div>
                    )}


                    {/* DEVICE INFO */}

                    <div className="infoGrid">

                      <div>
                        <small>
                          النظام
                        </small>

                        <strong>
                          {platformText(
                            device.deviceInfo
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          أول تفعيل
                        </small>

                        <strong>
                          {dateText(
                            device.activatedAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          آخر ظهور
                        </small>

                        <strong>
                          {dateText(
                            device.lastSeenAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          User ID
                        </small>

                        <strong
                          dir="ltr"
                        >
                          {shortUserId(
                            device.userId
                          )}
                        </strong>
                      </div>

                    </div>


                    {/* USER AGENT */}

                    {device.deviceInfo
                      ?.userAgent && (
                      <details className="technical">

                        <summary>
                          🧾 معلومات الجهاز
                        </summary>

                        <div
                          dir="ltr"
                        >
                          {
                            device.deviceInfo
                              .userAgent
                          }
                        </div>

                      </details>
                    )}


                    {/* ACTIONS */}

                    {device.active && (
                      <div className="actions">

                        <button
                          type="button"
                          className="remove"
                          disabled={
                            Boolean(
                              busyId
                            )
                          }
                          onClick={() =>
                            removeDevice(
                              device
                            )
                          }
                        >
                          {busyId ===
                          device.id
                            ? "جارٍ الحذف..."
                            : "❌ إزالة هذا الجهاز"}
                        </button>


                        <button
                          type="button"
                          className="reset"
                          disabled={
                            Boolean(
                              busyId
                            ) ||
                            !device.key
                              ?.id
                          }
                          onClick={() =>
                            resetKeyDevices(
                              device
                            )
                          }
                        >
                          {busyId ===
                          `reset-${device.key?.id}`
                            ? "جارٍ إعادة الضبط..."
                            : "♻️ إعادة ضبط جميع أجهزة المفتاح"}
                        </button>

                      </div>
                    )}


                    {/* OPEN AWD KEY */}

                    {device.key && (
                      <button
                        type="button"
                        className="manageKey"
                        onClick={() =>
                          router.push(
                            "/admin/access-keys"
                          )
                        }
                      >
                        🔑 فتح إدارة AWD-KEY
                      </button>
                    )}

                  </article>
                )
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

          color: white;

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

        input {
          width: 100%;

          min-height: 52px;

          margin-top: 12px;

          padding: 10px 12px;

          border:
            1px solid #304b68;

          border-radius: 13px;

          outline: none;

          background: #061522;

          color: #fff;

          font-size: 13px;
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
          cursor: wait;
        }

        .searchButtons {
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

        .history {
          width: 100%;

          min-height: 43px;

          margin-top: 10px;

          border:
            1px solid #304a67;

          border-radius: 11px;

          background: #0a1a2a;

          color: #91a5ba;

          font-size: 10px;

          font-weight: 800;
        }

        .activeToggle {
          border-color: #497058;

          background: #0b2a20;

          color: #8ae2b2;
        }

        .notice {
          margin-top: 12px;

          padding: 11px;

          border-radius: 12px;

          text-align: center;

          font-size: 11px;
        }

        .good {
          border:
            1px solid #28704f;

          background: #0c3022;

          color: #8ce7b6;
        }

        .bad {
          border:
            1px solid #75363e;

          background: #32181d;

          color: #ffadb5;
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

        .devices {
          display: grid;
          gap: 10px;
        }

        .deviceCard {
          padding: 14px;

          border:
            1px solid #29425f;

          border-radius: 18px;

          background: #0b1d31;
        }

        .deviceCard.revoked {
          opacity: .7;
        }

        .deviceHead {
          display: grid;

          grid-template-columns:
            45px 1fr auto;

          align-items: center;

          gap: 9px;
        }

        .deviceIcon {
          width: 44px;
          height: 44px;

          display: grid;
          place-items: center;

          border:
            1px solid #31506e;

          border-radius: 12px;

          background: #102942;

          font-size: 20px;
        }

        .deviceTitle {
          min-width: 0;
        }

        .deviceTitle strong {
          display: block;

          font-size: 12px;

          overflow-wrap: anywhere;
        }

        .deviceTitle small {
          display: block;

          margin-top: 3px;

          color: #7b90a6;

          font-size: 8px;
        }

        .status {
          padding: 5px 8px;

          border-radius: 999px;

          font-size: 8px;

          font-weight: 900;
        }

        .status.active {
          border:
            1px solid #26714f;

          background: #0b3625;

          color: #79e5ad;
        }

        .status.stopped {
          border:
            1px solid #69363d;

          background: #30181d;

          color: #ffadb5;
        }

        .keyBox {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 8px;

          margin-top: 12px;
        }

        .keyBox > div {
          padding: 10px;

          border-radius: 11px;

          background:
            rgba(
              255,
              255,
              255,
              .04
            );
        }

        .keyBox small,
        .infoGrid small {
          display: block;

          color: #71869d;

          font-size: 8px;
        }

        .keyBox strong,
        .infoGrid strong {
          display: block;

          margin-top: 4px;

          font-size: 10px;

          overflow-wrap: anywhere;
        }

        .infoRow {
          display: flex;

          justify-content:
            space-between;

          gap: 9px;

          margin-top: 8px;

          padding: 9px;

          border-radius: 10px;

          background: #071724;

          font-size: 9px;
        }

        .infoRow span {
          color: #788ca2;
        }

        .infoRow strong {
          max-width: 65%;

          text-align: left;

          overflow-wrap: anywhere;
        }

        .infoGrid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 7px;

          margin-top: 9px;
        }

        .infoGrid > div {
          min-width: 0;

          padding: 9px;

          border-radius: 10px;

          background:
            rgba(
              255,
              255,
              255,
              .035
            );
        }

        .technical {
          margin-top: 9px;

          border:
            1px solid #29445f;

          border-radius: 10px;

          background: #061522;

          overflow: hidden;
        }

        .technical summary {
          padding: 9px;

          color: #a3b6c9;

          cursor: pointer;

          font-size: 9px;
        }

        .technical div {
          padding: 9px;

          border-top:
            1px solid #1a3045;

          color: #8197ac;

          font-size: 8px;

          overflow-wrap: anywhere;
        }

        .actions {
          display: grid;

          gap: 7px;

          margin-top: 11px;
        }

        .actions button {
          min-height: 43px;

          border-radius: 10px;

          font-weight: 900;

          font-size: 10px;
        }

        .remove {
          border:
            1px solid #743941;

          background: #32181d;

          color: #ffadb5;
        }

        .reset {
          border:
            1px solid #7a5828;

          background: #342611;

          color: #ffd18a;
        }

        .manageKey {
          width: 100%;

          min-height: 43px;

          margin-top: 8px;

          border:
            1px solid #315474;

          border-radius: 10px;

          background: #102b47;

          color: #dce9f5;

          font-size: 10px;

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

          .devices {
            grid-template-columns:
              1fr 1fr;
          }

        }

      `}</style>

    </main>
  );
}
