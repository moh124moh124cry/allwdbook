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

async function generateAndPublish(language) {
  try {
    const result = await publishArticle({
      language,
      topicId: null,
    });

    return {
      language,
      ...result,
    };
  } catch (error) {
    return {
      language,
      success: false,
      status: "error",
      error: error?.message || "Unknown error.",
    };
  }
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

    // إنشاء مقال إنجليزي ومقال عربي
    const [englishResult, arabicResult] = await Promise.all([
      generateAndPublish("en"),
      generateAndPublish("ar"),
    ]);

    const success =
      englishResult.success || arabicResult.success;

    return NextResponse.json(
      {
        success,
        status: success ? "completed" : "failed",
        results: {
          en: englishResult,
          ar: arabicResult,
        },
      },
      {
        status: success ? 200 : 500,
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
