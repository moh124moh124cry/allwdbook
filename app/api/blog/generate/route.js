import { NextResponse } from "next/server";

import { publishArticle } from "../../../../lib/blog/automation/publish.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${cronSecret}`;
}

export async function POST(request) {
  try {
    // حماية الـ API
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

    // قراءة البيانات المرسلة
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // اللغة: ar أو en
    const language = body?.language === "ar" ? "ar" : "en";

    // الموضوع اختياري
    const topicId =
      typeof body?.topicId === "string" &&
      body.topicId.trim()
        ? body.topicId.trim()
        : null;

    // تشغيل نظام إنشاء ونشر المقال
    const result = await publishArticle({
      language,
      topicId,
    });

    // مقال تم نشره بنجاح
    if (result.success) {
      return NextResponse.json(result, {
        status: 200,
      });
    }

    // المقال موجود مسبقًا
    if (result.status === "duplicate") {
      return NextResponse.json(result, {
        status: 409,
      });
    }

    // خطأ أثناء التوليد أو النشر
    return NextResponse.json(result, {
      status: 500,
    });
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

// GET غير مسموح به
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
