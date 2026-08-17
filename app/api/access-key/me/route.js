import {
  NextResponse,
} from "next/server";

import {
  getSupabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
  accessKeyAllowsAccess,
  revealAccessKeyCode,
} from "../../../../lib/accessKey";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


/* =========================================================
   BEARER TOKEN
   ========================================================= */

function getBearerToken(
  request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    ) || "";

  if (
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    return "";
  }

  return authorization
    .slice(7)
    .trim();
}


/* =========================================================
   UNIQUE
   ========================================================= */

function uniqueById(
  items,
) {
  const map =
    new Map();

  for (
    const item of items ||
    []
  ) {
    if (
      item?.id
    ) {
      map.set(
        item.id,
        item,
      );
    }
  }

  return [
    ...map.values(),
  ];
}


/* =========================================================
   GET
   ========================================================= */

export async function GET(
  request,
) {
  try {
    /* =====================================================
       1. TOKEN
       ===================================================== */

    const token =
      getBearerToken(
        request,
      );

    if (!token) {
      return NextResponse.json(
        {
          ok: false,

          authenticated:
            false,

          keys: [],

          error:
            "AUTH_REQUIRED",
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }


    /* =====================================================
       2. USER
       ===================================================== */

    const supabase =
      getSupabaseAdmin();

    const {
      data: {
        user,
      },

      error:
        userError,
    } =
      await supabase.auth.getUser(
        token,
      );


    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          ok: false,

          authenticated:
            false,

          keys: [],

          error:
            "INVALID_SESSION",
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }


    /* =====================================================
       3. KEYS PURCHASED ON THIS USER ID
       ===================================================== */

    const {
      data:
        ownedKeys,

      error:
        ownedError,
    } =
      await supabase
        .from(
          "allwdbook_access_keys",
        )
        .select("*")
        .eq(
          "purchased_by_user_id",
          user.id,
        );


    if (
      ownedError
    ) {
      throw new Error(
        "OWNED_ACCESS_KEYS_LOOKUP_FAILED:" +
          ownedError.message,
      );
    }


    /* =====================================================
       4. KEYS ACTIVATED ON THIS DEVICE
       ===================================================== */

    const {
      data:
        activations,

      error:
        activationError,
    } =
      await supabase
        .from(
          "allwdbook_access_key_activations",
        )
        .select(
          "id, access_key_id, activated_at, last_seen_at",
        )
        .eq(
          "user_id",
          user.id,
        )
        .is(
          "revoked_at",
          null,
        );


    if (
      activationError
    ) {
      throw new Error(
        "ACCESS_ACTIVATIONS_LOOKUP_FAILED:" +
          activationError.message,
      );
    }


    const activatedKeyIds =
      [
        ...new Set(
          (
            activations ||
            []
          )
            .map(
              (
                item,
              ) =>
                item
                  .access_key_id,
            )
            .filter(
              Boolean,
            ),
        ),
      ];


    let activatedKeys =
      [];


    if (
      activatedKeyIds.length >
      0
    ) {
      const {
        data,

        error,
      } =
        await supabase
          .from(
            "allwdbook_access_keys",
          )
          .select("*")
          .in(
            "id",
            activatedKeyIds,
          );


      if (error) {
        throw new Error(
          "ACTIVATED_ACCESS_KEYS_LOOKUP_FAILED:" +
            error.message,
        );
      }


      activatedKeys =
        data || [];
    }


    /* =====================================================
       5. MERGE
       ===================================================== */

    const allKeys =
      uniqueById([
        ...(
          ownedKeys ||
          []
        ),

        ...activatedKeys,
      ]);


    if (
      allKeys.length ===
      0
    ) {
      return NextResponse.json(
        {
          ok: true,

          authenticated:
            true,

          userId:
            user.id,

          paid:
            false,

          keys: [],
        },
        {
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }


    /* =====================================================
       6. PLANS
       ===================================================== */

    const planIds =
      [
        ...new Set(
          allKeys
            .map(
              (
                item,
              ) =>
                item
                  .plan_id,
            )
            .filter(
              Boolean,
            ),
        ),
      ];


    let plans =
      [];


    if (
      planIds.length >
      0
    ) {
      const {
        data,

        error,
      } =
        await supabase
          .from(
            "allwdbook_plans",
          )
          .select(
            "id, name_ar, name_en, billing_type, billing_interval, price, currency",
          )
          .in(
            "id",
            planIds,
          );


      if (error) {
        throw new Error(
          "ACCESS_PLANS_LOOKUP_FAILED:" +
            error.message,
        );
      }


      plans =
        data || [];
    }


    const planMap =
      new Map(
        plans.map(
          (
            plan,
          ) => [
            plan.id,
            plan,
          ],
        ),
      );


    /* =====================================================
       7. ACTIVE DEVICE COUNTS
       ===================================================== */

    const keyIds =
      allKeys.map(
        (
          item,
        ) =>
          item.id,
      );


    const {
      data:
        allActiveDevices,

      error:
        deviceError,
    } =
      await supabase
        .from(
          "allwdbook_access_key_activations",
        )
        .select(
          "access_key_id",
        )
        .in(
          "access_key_id",
          keyIds,
        )
        .is(
          "revoked_at",
          null,
        );


    if (
      deviceError
    ) {
      throw new Error(
        "ACCESS_DEVICE_COUNT_FAILED:" +
          deviceError.message,
      );
    }


    const deviceCountMap =
      new Map();


    for (
      const item of
        allActiveDevices ||
        []
    ) {
      const keyId =
        item.access_key_id;

      deviceCountMap.set(
        keyId,
        (
          deviceCountMap.get(
            keyId,
          ) || 0
        ) + 1,
      );
    }


    /* =====================================================
       8. RESPONSE
       =====================================================
       قاعدة الأمان المهمة:

       الكود الكامل يظهر فقط على الجهاز
       الذي قام بالشراء أصلاً.

       الجهاز الذي استعاد الخطة بواسطة الكود:
       - يرى الخطة
       - يرى Code Hint
       - لا نكشف له الرمز الكامل من قاعدة البيانات

       هذا يقلل خطر سرقة الرمز من جهاز ثانوي.
       ===================================================== */

    const responseKeys =
      allKeys
        .map(
          (
            accessKey,
          ) => {
            const plan =
              planMap.get(
                accessKey
                  .plan_id,
              ) ||
              null;


            const isOwner =
              String(
                accessKey
                  .purchased_by_user_id ||
                  "",
              ) ===
              String(
                user.id,
              );


            let code =
              null;


            if (
              isOwner &&
              accessKey
                .code_ciphertext
            ) {
              try {
                code =
                  revealAccessKeyCode(
                    accessKey,
                  );
              } catch (
                error
              ) {
                console.error(
                  "Access key reveal failed:",
                  error,
                );
              }
            }


            const activation =
              (
                activations ||
                []
              ).find(
                (
                  item,
                ) =>
                  item
                    .access_key_id ===
                  accessKey.id,
              ) ||
              null;


            return {
              id:
                accessKey.id,

              planId:
                accessKey
                  .plan_id,

              plan: plan
                ? {
                    id:
                      plan.id,

                    nameAr:
                      plan.name_ar,

                    nameEn:
                      plan.name_en,

                    billingType:
                      plan.billing_type,

                    billingInterval:
                      plan.billing_interval,

                    price:
                      Number(
                        plan.price ||
                          0,
                      ),

                    currency:
                      plan.currency ||
                      "USD",
                  }
                : null,

              status:
                accessKey
                  .status,

              usable:
                accessKeyAllowsAccess(
                  accessKey,
                ),

              source:
                accessKey
                  .source,

              /*
               * يظهر فقط لصاحب الشراء الأصلي.
               */

              code,

              codeHint:
                accessKey
                  .code_hint,

              canRevealCode:
                Boolean(
                  isOwner &&
                    code,
                ),

              ownerDevice:
                isOwner,

              maxActivations:
                Number(
                  accessKey
                    .max_activations ||
                    3,
                ),

              activeDevices:
                Number(
                  deviceCountMap.get(
                    accessKey.id,
                  ) || 0,
                ),

              activatedOnThisDevice:
                Boolean(
                  activation,
                ),

              activatedAt:
                activation
                  ?.activated_at ||
                null,

              lastSeenAt:
                activation
                  ?.last_seen_at ||
                null,

              recoveryEmail:
                accessKey
                  .recovery_email_verified_at
                  ? accessKey
                      .recovery_email
                  : null,

              recoveryEmailVerified:
                Boolean(
                  accessKey
                    .recovery_email_verified_at,
                ),

              startsAt:
                accessKey
                  .starts_at,

              expiresAt:
                accessKey
                  .expires_at,

              createdAt:
                accessKey
                  .created_at,
            };
          },
        )
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.createdAt ||
                0,
            ).getTime() -
            new Date(
              first.createdAt ||
                0,
            ).getTime(),
        );


    const paid =
      responseKeys.some(
        (
          item,
        ) =>
          item.usable,
      );


    return NextResponse.json(
      {
        ok: true,

        authenticated:
          true,

        userId:
          user.id,

        paid,

        keys:
          responseKeys,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",
        },
      },
    );
  } catch (error) {
    console.error(
      "Access key me API failed:",
      error,
    );


    return NextResponse.json(
      {
        ok: false,

        authenticated:
          false,

        paid:
          false,

        keys: [],

        error:
          "ACCESS_KEY_LOOKUP_FAILED",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
