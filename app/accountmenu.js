"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getSupabase,
} from "../lib/supabase";

import {
  useAccess,
} from "../lib/access";

const VALID_PLANS = new Set([
  "cover",
  "micro_niche",
  "keywords",
  "pro_monthly",
  "pro_yearly",
]);

const PACKAGES = [
  {
    id: "cover",
    ar: "مصمم الغلاف",
    en: "Cover Designer",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/a40b815f-2b2c-4086-b8b8-3afcd0bf7a4d",
  },

  {
    id: "micro_niche",
    ar: "الميكرو نيتش",
    en: "Micro-Niche",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/c205aef7-1c77-4711-9fba-ee2b9a81153b",
  },

  {
    id: "keywords",
    ar: "الكلمات المفتاحية",
    en: "Keywords",
    price: "$2.49",
    periodAr: "/ شهر",
    periodEn: "/ month",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/9a058282-b97a-4f49-bd27-c31aefab98d9",
  },

  {
    id: "pro_monthly",
    ar: "Pro شهري",
    en: "Pro Monthly",
    price: "$5.99",
    periodAr: "/ شهر",
    periodEn: "/ month",
    featured: true,

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/00e64ca6-4e8c-42c2-aa44-e9667d745524",
  },

  {
    id: "pro_yearly",
    ar: "Pro سنوي",
    en: "Pro Yearly",
    price: "$55",
    periodAr: "/ سنة",
    periodEn: "/ year",

    checkoutUrl:
      "https://allworldfactures.lemonsqueezy.com/checkout/buy/14a4b6b5-553f-4070-bd39-932ba2270aa5",
  },
];

const TEXT = {
  ar: {
    menuLabel:
      "فتح قائمة الحساب والاشتراكات",

    guest:
      "أنت تستخدم الموقع كزائر",

    account:
      "حسابك",

    freeNote:
      "لا تحتاج إلى بريد لاستخدام الخطة المجانية",

    currentPlan:
      "خطتك الحالية",

    freePlan:
      "الخطة المجانية",

    lifetime:
      "Lifetime Pro",

    plans:
      "باقات الاشتراك",

    featured:
      "الأفضل لجميع الأدوات",

    current:
      "مفعّلة",

    included:
      "مشمولة",

    manage:
      "إدارة الاشتراك والفواتير",

    existing:
      "لدي اشتراك — تسجيل الدخول",

    signingOut:
      "جارٍ الخروج...",

    signOut:
      "تسجيل الخروج",
  },

  en: {
    menuLabel:
      "Open account and subscription menu",

    guest:
      "You are using the site as a guest",

    account:
      "Your account",

    freeNote:
      "No email is required for the free plan",

    currentPlan:
      "Current plan",

    freePlan:
      "Free plan",

    lifetime:
      "Lifetime Pro",

    plans:
      "Subscription plans",

    featured:
      "Best value for all tools",

    current:
      "Active",

    included:
      "Included",

    manage:
      "Manage subscription and billing",

    existing:
      "I have a subscription — Sign in",

    signingOut:
      "Signing out...",

    signOut:
      "Sign out",
  },
};

export default function AccountMenu() {
  const router = useRouter();
  const menuRef = useRef(null);
  const access = useAccess();

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

  const [
    language,
    setLanguage,
  ] = useState("ar");

  const isEnglish =
    language === "en";

  const text =
    isEnglish
      ? TEXT.en
      : TEXT.ar;

  const email =
    session?.user?.email || "";

  const isGuest = !email;

  const activePlans =
    Array.isArray(
      access.plans
    )
      ? access.plans
      : [];

  useEffect(() => {
    function detectLanguage() {
      const html =
        document.documentElement;

      setLanguage(
        html.dir === "ltr" ||
          html.lang === "en"
          ? "en"
          : "ar"
      );
    }

    detectLanguage();

    const observer =
      new MutationObserver(
        detectLanguage
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,

        attributeFilter: [
          "dir",
          "lang",
        ],
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const supabase =
      getSupabase();

    async function loadSession() {
      try {
        const {
          data: {
            session:
              currentSession,
          },
        } =
          await supabase.auth
            .getSession();

        if (active) {
          setSession(
            currentSession ||
              null
          );

          setSessionLoaded(
            true
          );
        }
      } catch (error) {
        console.error(
          "Session loading error:",
          error
        );

        if (active) {
          setSessionLoaded(
            true
          );
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            nextSession
          ) => {
            if (active) {
              setSession(
                nextSession ||
                  null
              );

              setSessionLoaded(
                true
              );
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

    const addressPlan =
      parameters.get(
        "selectedPlan"
      ) || "";

    let rememberedPlan = "";

    try {
      rememberedPlan =
        localStorage.getItem(
          "awd_pending_plan"
        ) || "";
    } catch {}

    const selectedPlan =
      VALID_PLANS.has(
        addressPlan
      )
        ? addressPlan
        : VALID_PLANS.has(
              rememberedPlan
            )
          ? rememberedPlan
          : "";

    if (!selectedPlan) {
      return;
    }

    const plan =
      PACKAGES.find(
        (item) =>
          item.id ===
          selectedPlan
      );

    parameters.delete(
      "selectedPlan"
    );

    try {
      localStorage.removeItem(
        "awd_pending_plan"
      );
    } catch {}

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
    function closeOutside(
      event
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    function closeWithEscape(
      event
    ) {
      if (
        event.key === "Escape"
      ) {
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
      currentSession?.user
        ?.email;

    const userId =
      currentSession?.user?.id;

    if (!customerEmail) {
      try {
        localStorage.setItem(
          "awd_pending_plan",
          plan.id
        );
      } catch {}

      router.push(
        `/login?plan=${encodeURIComponent(
          plan.id
        )}`
      );

      return;
    }

    const checkout =
      new URL(
        plan.checkoutUrl
      );

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

    try {
      localStorage.removeItem(
        "awd_pending_plan"
      );
    } catch {}

    window.location.assign(
      checkout.toString()
    );
  }

  function choosePlan(plan) {
    setOpen(false);

    try {
      localStorage.setItem(
        "awd_pending_plan",
        plan.id
      );
    } catch {}

    if (
      !session?.user?.email
    ) {
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
    if (busy) {
      return;
    }

    setBusy(true);

    try {
      const supabase =
        getSupabase();

      await supabase.auth
        .signOut();

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

  function planName(planId) {
    const plan =
      PACKAGES.find(
        (item) =>
          item.id === planId
      );

    return plan
      ? isEnglish
        ? plan.en
        : plan.ar
      : planId;
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
        aria-label={
          text.menuLabel
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current
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

          background:
            "transparent",

          boxShadow: open
            ? "0 0 0 4px rgba(245,158,11,.18)"
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

            borderRadius:
              "50%",

            display: "block",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position:
              "absolute",

            top: 58,

            right: isEnglish
              ? "auto"
              : 0,

            left: isEnglish
              ? 0
              : "auto",

            width:
              "min(350px, calc(100vw - 24px))",

            maxHeight:
              "min(650px, calc(100vh - 92px))",

            overflowY: "auto",
            padding: 14,
            borderRadius: 16,

            background:
              "#ffffff",

            color:
              "#172033",

            border:
              "2px solid #d9e2ef",

            boxShadow:
              "0 22px 60px rgba(0,0,0,.42)",

            direction: isEnglish
              ? "ltr"
              : "rtl",

            textAlign: isEnglish
              ? "left"
              : "right",
          }}
        >
          <div
            style={{
              padding:
                "4px 4px 12px",

              borderBottom:
                "1px solid #d9e2ef",
            }}
          >
            <div
              style={{
                color:
                  "#172033",

                fontWeight: 900,
                fontSize: 15,
              }}
            >
              {isGuest
                ? text.guest
                : text.account}
            </div>

            <div
              style={{
                marginTop: 5,
                color:
                  "#65738a",

                fontSize: 13,

                direction: email
                  ? "ltr"
                  : isEnglish
                    ? "ltr"
                    : "rtl",

                overflowWrap:
                  "anywhere",
              }}
            >
              {email ||
                text.freeNote}
            </div>

            {!isGuest &&
              !access.loading && (
                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      color:
                        "#65738a",

                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {
                      text.currentPlan
                    }
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 7,
                    }}
                  >
                    {access.lifetime ? (
                      <span
                        style={{
                          padding:
                            "6px 9px",

                          borderRadius:
                            999,

                          background:
                            "#eafaf1",

                          border:
                            "1px solid #54bd7a",

                          color:
                            "#15733d",

                          fontSize: 12,
                          fontWeight:
                            900,
                        }}
                      >
                        ♾️{" "}
                        {
                          text.lifetime
                        }
                      </span>
                    ) : activePlans.length >
                      0 ? (
                      activePlans.map(
                        (
                          planId
                        ) => (
                          <span
                            key={
                              planId
                            }
                            style={{
                              padding:
                                "6px 9px",

                              borderRadius:
                                999,

                              background:
                                "#eaf3ff",

                              border:
                                "1px solid #6ca8eb",

                              color:
                                "#1459a6",

                              fontSize:
                                12,

                              fontWeight:
                                900,
                            }}
                          >
                            ✓{" "}
                            {planName(
                              planId
                            )}
                          </span>
                        )
                      )
                    ) : (
                      <span
                        style={{
                          padding:
                            "6px 9px",

                          borderRadius:
                            999,

                          background:
                            "#f2f4f7",

                          border:
                            "1px solid #ccd4df",

                          color:
                            "#4e5c70",

                          fontSize: 12,
                          fontWeight:
                            800,
                        }}
                      >
                        {
                          text.freePlan
                        }
                      </span>
                    )}
                  </div>

                  {access.billingUrl && (
                    <a
                      href={
                        access.billingUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display:
                          "block",

                        marginTop: 10,

                        padding:
                          "9px 10px",

                        borderRadius:
                          9,

                        background:
                          "#fff8e8",

                        border:
                          "1px solid #e4b34f",

                        color:
                          "#8a5700",

                        textAlign:
                          "center",

                        textDecoration:
                          "none",

                        fontSize: 13,

                        fontWeight:
                          900,
                      }}
                    >
                      ⚙️{" "}
                      {text.manage}
                    </a>
                  )}
                </div>
              )}
          </div>

          <div
            style={{
              padding:
                "14px 4px 8px",

              color:
                "#172033",

              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {text.plans}
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {PACKAGES.map(
              (plan) => {
                const current =
                  access.lifetime ||
                  activePlans.includes(
                    plan.id
                  );

                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      choosePlan(
                        plan
                      )
                    }
                    disabled={
                      current
                    }
                    style={{
                      minHeight: 56,

                      display: "flex",
                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap: 12,
                      width: "100%",

                      padding:
                        "10px 12px",

                      borderRadius:
                        11,

                      border: current
                        ? "2px solid #3ea968"
                        : plan.featured
                          ? "2px solid #22a95f"
                          : "1px solid #d9e2ef",

                      background:
                        current
                          ? "#eafaf1"
                          : plan.featured
                            ? "#effbf3"
                            : "#f7f9fc",

                      color:
                        "#172033",

                      direction:
                        isEnglish
                          ? "ltr"
                          : "rtl",

                      textAlign:
                        isEnglish
                          ? "left"
                          : "right",

                      cursor: current
                        ? "default"
                        : "pointer",

                      opacity: current
                        ? 0.88
                        : 1,
                    }}
                  >
                    <span>
                      <strong
                        style={{
                          display:
                            "block",

                          color:
                            "#172033",

                          fontSize:
                            14,
                        }}
                      >
                        {isEnglish
                          ? plan.en
                          : plan.ar}
                      </strong>

                      {current ? (
                        <small
                          style={{
                            display:
                              "block",

                            marginTop:
                              3,

                            color:
                              "#16864a",

                            fontSize:
                              12,

                            fontWeight:
                              800,
                          }}
                        >
                          ✓{" "}
                          {access.lifetime
                            ? text.included
                            : text.current}
                        </small>
                      ) : plan.featured ? (
                        <small
                          style={{
                            display:
                              "block",

                            marginTop:
                              3,

                            color:
                              "#16864a",

                            fontSize:
                              12,

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            text.featured
                          }
                        </small>
                      ) : null}
                    </span>

                    <span
                      style={{
                        flex:
                          "0 0 auto",

                        direction:
                          "ltr",

                        color:
                          "#c96b08",
                      }}
                    >
                      <strong>
                        {plan.price}
                      </strong>

                      <small
                        style={{
                          color:
                            "#65738a",

                          marginLeft:
                            3,
                        }}
                      >
                        {isEnglish
                          ? plan.periodEn
                          : plan.periodAr}
                      </small>
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,

              borderTop:
                "1px solid #d9e2ef",
            }}
          >
            {isGuest ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);

                  router.push(
                    "/login"
                  );
                }}
                style={{
                  width: "100%",
                  minHeight: 48,

                  border:
                    "1px solid #2776d2",

                  borderRadius: 10,

                  background:
                    "#eaf3ff",

                  color:
                    "#1459a6",

                  fontWeight: 900,
                }}
              >
                {text.existing}
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                disabled={busy}
                style={{
                  width: "100%",
                  minHeight: 48,

                  border:
                    "1px solid #d9574f",

                  borderRadius: 10,

                  background:
                    "#fff0ef",

                  color:
                    "#b6322c",

                  fontWeight: 900,
                }}
              >
                {busy
                  ? text.signingOut
                  : text.signOut}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
