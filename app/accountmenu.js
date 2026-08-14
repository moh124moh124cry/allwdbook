"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";

const PACKAGES = [
  {
    id: "cover",
    name: "مصمم الغلاف",
    price: "$2.49",
    period: "/ شهر",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/a40b815f-2b2c-4086-b8b8-3afcd0bf7a4d",
  },
  {
    id: "micro_niche",
    name: "الميكرو نيتش",
    price: "$2.49",
    period: "/ شهر",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/c205aef7-1c77-4711-9fba-ee2b9a81153b",
  },
  {
    id: "keywords",
    name: "الكلمات المفتاحية",
    price: "$2.49",
    period: "/ شهر",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",
  },
  {
    id: "pro_monthly",
    name: "Pro شهري",
    price: "$5.99",
    period: "/ شهر",
    featured: true,
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/00e64ca6-4e8c-42c2-aa44-e9667d745524",
  },
  {
    id: "pro_yearly",
    name: "Pro سنوي",
    price: "$55",
    period: "/ سنة",
    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/14a4b6b5-553f-4070-bd39-932ba2270aa5",
  },
];

export default function AccountMenu() {
  const router = useRouter();
  const menuRef = useRef(null);

  const [open, setOpen] =
    useState(false);

  const [session, setSession] =
    useState(null);

  const [
    sessionLoaded,
    setSessionLoaded,
  ] = useState(false);

  const [busy, setBusy] =
    useState(false);

  const email =
    session?.user?.email || "";

  const isGuest = !email;

  const isEnglish =
    typeof document !== "undefined" &&
    document.documentElement.dir ===
      "ltr";

  useEffect(() => {
    let active = true;

    const supabase = getSupabase();

    async function loadSession() {
      try {
        const {
          data: {
            session: currentSession,
          },
        } =
          await supabase.auth.getSession();

        if (active) {
          setSession(
            currentSession || null
          );

          setSessionLoaded(true);
        }
      } catch (error) {
        console.error(
          "Session loading error:",
          error
        );

        if (active) {
          setSessionLoaded(true);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (active) {
            setSession(
              nextSession || null
            );

            setSessionLoaded(true);
          }
        }
      );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      !sessionLoaded ||
      !session?.user?.email
    ) {
      return;
    }

    const parameters =
      new URLSearchParams(
        window.location.search
      );

    const selectedPlan =
      parameters.get(
        "selectedPlan"
      );

    if (!selectedPlan) {
      return;
    }

    const plan = PACKAGES.find(
      (item) =>
        item.id === selectedPlan
    );

    parameters.delete(
      "selectedPlan"
    );

    const remainingQuery =
      parameters.toString();

    const cleanAddress =
      window.location.pathname +
      (remainingQuery
        ? `?${remainingQuery}`
        : "") +
      window.location.hash;

    window.history.replaceState(
      {},
      "",
      cleanAddress
    );

    if (plan) {
      openCheckout(
        plan,
        session
      );
    }
  }, [session, sessionLoaded]);

  useEffect(() => {
    function closeOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      closeOutside
    );

    document.addEventListener(
      "keydown",
      closeWithEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside
      );

      document.removeEventListener(
        "keydown",
        closeWithEscape
      );
    };
  }, []);

  function openCheckout(
    plan,
    currentSession = session
  ) {
    const customerEmail =
      currentSession?.user?.email;

    const userId =
      currentSession?.user?.id;

    if (!customerEmail) {
      router.push(
        `/login?plan=${encodeURIComponent(
          plan.id
        )}`
      );

      return;
    }

    const checkout =
      new URL(plan.checkoutUrl);

    checkout.searchParams.set(
      "checkout[email]",
      customerEmail
    );

    if (userId) {
      checkout.searchParams.set(
        "checkout[custom][user_id]",
        userId
      );
    }

    checkout.searchParams.set(
      "checkout[custom][plan_id]",
      plan.id
    );

    window.location.assign(
      checkout.toString()
    );
  }

  function choosePlan(plan) {
    setOpen(false);

    if (!session?.user?.email) {
      router.push(
        `/login?plan=${encodeURIComponent(
          plan.id
        )}`
      );

      return;
    }

    openCheckout(plan);
  }

  async function signOut() {
    if (busy) return;

    setBusy(true);

    try {
      const supabase =
        getSupabase();

      await supabase.auth.signOut();

      await supabase.auth
        .signInAnonymously();

      setOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Sign-out error:",
        error
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "relative",
        flex: "0 0 auto",
        zIndex: 10020,
      }}
    >
      <button
        type="button"
        aria-label="فتح قائمة الحساب والاشتراكات"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        style={{
          width: 50,
          height: 50,
          padding: 2,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          border: open
            ? "2px solid #f59e0b"
            : "2px solid transparent",
          background: "transparent",
          boxShadow: open
            ? "0 0 0 4px rgba(245,158,11,.12)"
            : "none",
        }}
      >
        <img
          src="/logov3.png"
          alt="AllWDbook"
          width="44"
          height="44"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "block",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: 58,

            right: isEnglish
              ? "auto"
              : 0,

            left: isEnglish
              ? 0
              : "auto",

            width:
              "min(340px, calc(100vw - 24px))",

            maxHeight:
              "min(620px, calc(100vh - 92px))",

            overflowY: "auto",
            padding: 12,
            borderRadius: 16,
            border:
              "1px solid #344563",
            background: "#101a2d",
            color: "#e8eefc",
            boxShadow:
              "0 18px 50px rgba(0,0,0,.48)",
            direction: "rtl",
          }}
        >
          <div
            style={{
              padding: "4px 4px 12px",
              borderBottom:
                "1px solid #273650",
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 15,
              }}
            >
              {isGuest
                ? "أنت تستخدم الموقع كزائر"
                : "حسابك"}
            </div>

            <div
              style={{
                marginTop: 4,
                color: "#9fb0ca",
                fontSize: 13,
                direction: email
                  ? "ltr"
                  : "rtl",
                overflowWrap:
                  "anywhere",
              }}
            >
              {email ||
                "لا تحتاج إلى بريد لاستخدام الخطة المجانية"}
            </div>
          </div>

          <div
            style={{
              padding: "12px 4px 6px",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            باقات الاشتراك
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {PACKAGES.map(
              (plan) => (
                <button
                  key={plan.id}
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    choosePlan(plan)
                  }
                  style={{
                    minHeight: 54,
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap: 12,
                    width: "100%",
                    padding:
                      "10px 12px",
                    borderRadius: 11,
                    border:
                      plan.featured
                        ? "1px solid #22c55e"
                        : "1px solid #2c3c59",
                    background:
                      plan.featured
                        ? "rgba(34,197,94,.10)"
                        : "#0b1425",
                    color: "#e8eefc",
                    textAlign: "right",
                  }}
                >
                  <span>
                    <strong
                      style={{
                        display:
                          "block",
                        fontSize: 14,
                      }}
                    >
                      {plan.name}
                    </strong>

                    {plan.featured && (
                      <small
                        style={{
                          display:
                            "block",
                          marginTop: 3,
                          color:
                            "#72e49e",
                          fontSize: 12,
                        }}
                      >
                        الأفضل لجميع
                        الأدوات
                      </small>
                    )}
                  </span>

                  <span
                    style={{
                      flex:
                        "0 0 auto",
                      direction: "ltr",
                      color: "#f7b955",
                    }}
                  >
                    <strong>
                      {plan.price}
                    </strong>

                    <small
                      style={{
                        color:
                          "#9fb0ca",
                        marginLeft: 3,
                      }}
                    >
                      {plan.period}
                    </small>
                  </span>
                </button>
              )
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop:
                "1px solid #273650",
            }}
          >
            {isGuest ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
                style={{
                  width: "100%",
                  minHeight: 46,
                  border:
                    "1px solid #3b82f6",
                  borderRadius: 10,
                  background:
                    "rgba(59,130,246,.10)",
                  color: "#9cc6ff",
                  fontWeight: 800,
                }}
              >
                لدي اشتراك — تسجيل الدخول
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                disabled={busy}
                style={{
                  width: "100%",
                  minHeight: 46,
                  border:
                    "1px solid #7f3030",
                  borderRadius: 10,
                  background:
                    "rgba(229,100,88,.10)",
                  color: "#ffaaa2",
                  fontWeight: 800,
                }}
              >
                {busy
                  ? "جارٍ الخروج..."
                  : "تسجيل الخروج"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
