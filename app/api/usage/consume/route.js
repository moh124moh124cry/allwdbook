import { NextResponse } from "next/server";
import { consumeToolUse } from "../../../../lib/dailyUsage";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_JSON",
        },
        {
          status: 400,
        }
      );
    }

    const toolId = String(
      body?.toolId || ""
    ).trim();

    const result = await consumeToolUse(
      request,
      toolId
    );

    if (result.reason === "LOGIN_REQUIRED") {
      return NextResponse.json(
        {
          ok: false,
          error: "LOGIN_REQUIRED",
        },
        {
          status: 401,
        }
      );
    }

    if (
      result.reason ===
      "DAILY_LIMIT_REACHED"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "DAILY_LIMIT_REACHED",
          used: result.used,
          remaining: 0,
          dailyLimit: result.dailyLimit,
        },
        {
          status: 429,
        }
      );
    }

    if (!result.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            result.reason ||
            "USAGE_CHECK_FAILED",
        },
