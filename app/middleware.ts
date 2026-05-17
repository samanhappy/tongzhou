import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = new Set(["/login", "/register"]);

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(url);
}

async function hasSession(
  request: NextRequest,
  { includeTenantFallback }: { includeTenantFallback: boolean },
): Promise<boolean> {
  const base = process.env.API_BASE;
  if (!base) return true;

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  if (includeTenantFallback) {
    const tenantSlug = process.env.TENANT_SLUG;
    if (tenantSlug) headers.set("x-tenant-slug", tenantSlug);
  }

  try {
    const res = await fetch(`${base}/api/auth/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresAuth = pathname.startsWith("/app/");
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (!requiresAuth && !isAuthPage) return NextResponse.next();

  const ok = await hasSession(request, {
    includeTenantFallback: requiresAuth,
  });

  if (requiresAuth) {
    return ok ? NextResponse.next() : redirectToLogin(request);
  }

  if (isAuthPage && ok) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
