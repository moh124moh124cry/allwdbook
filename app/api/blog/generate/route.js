import { NextResponse } from "next/server";

import {
  publishArticle,
} from "@/lib/blog/automation/publish.js";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/**
 * API لتوليد ونشر مقال في المدونة.
 *
 * هذه المرحلة مخصصة للاختبار.
 *
 * يمكن لاحقًا استدعاء نفس العملية
 * بواسطة Vercel Cron.
 */

function isAuthorized(request) {
  const cronSecret =
    process.env.CRON_SECRET;

  /**
   * إذا لم يتم إعداد السر،
   * نمنع الوصول بدل فتح endpoint.
   */
  if (!cronSecret) {
    return false;
  }

  const authorization =
    request.headers.get(
      "authorization"
    );

  return (
    authorization ===
    `Bearer ${cronSecret}`
  );
}

export async function POST(request) {
  try {
    /**
     * حماية endpoint.
     */
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    /**
     * اللغة الافتراضية English.
     */
    const language =
      body?.language === "ar"
        ? "ar"
        : "en";

    /**
     * يمكن تحديد موضوع معين،
     * أو ترك النظام يختار موضوعًا تلقائيًا.
     */
    const topicId =
      typeof body?.topicId === "string" &&
      body.topicId.trim()
        ? body.topicId.trim()
        : null;

    /**
     * تشغيل النظام الكامل.
     */
    const result =
      await publishArticle({
        language,
        topicId,
      });

    /**
     * تحديد HTTP status مناسب.
     */
    if (result.success) {
      return NextResponse.json(
        result,
        {
          status: 200,
        }
      );
    }

    if (
      result.status ===
      "duplicate"
    ) {
      return NextResponse.json(
        result,
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      result,
      {
        status: 500,
      }
    );
  } catch (error) {
    console.error(
      "Blog generation API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        status: "error",
        error:
          error?.message ||
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * منع GET لأن endpoint مخصص
 * للتشغيل المحمي عبر POST.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Use POST with the required authorization.",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}
