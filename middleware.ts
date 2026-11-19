import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para proteger todas las rutas que comiencen con /dashboard.
 * Si el usuario no tiene una sesión activa (cookie de sesión de NextAuth/Auth.js),
 * se le redirige automáticamente a la página de login (/login) preservando callbackUrl.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
