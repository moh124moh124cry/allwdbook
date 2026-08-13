import { NextResponse } from "next/server";

export function middleware(request) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";

  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === "www.allwdbook.com") {
    const url = request.nextUrl.clone();

    url.protocol = "https:";
    url.hostname = "allwdbook.com";
    url.port = "";

    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
