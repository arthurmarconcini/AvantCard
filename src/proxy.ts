import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = AUTH_PAGES.some((route) => pathname.startsWith(route));

  // Autenticado tentando acessar página de auth → redirecionar para dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Não autenticado tentando acessar rota protegida → redirecionar para login
  if (!token && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - /api/auth/* (endpoints do NextAuth + forgot/reset/register)
     * - /_next/* (assets do Next.js)
     * - /favicon.ico, /sitemap.xml, /robots.txt (assets estáticos)
     */
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
