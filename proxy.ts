import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/giris") return NextResponse.next();
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Host-admin_session"
      : "admin_session";
  if (request.cookies.has(cookieName)) return NextResponse.next();

  const loginUrl = new URL("/admin/giris", request.url);
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", requestedPath);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*"] };
