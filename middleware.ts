import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "./lib/auth-secret";
import { ROLE_PREVIEW_COOKIE, isRouteAllowedForRole, parseRole, type Role } from "./lib/rbac-config";

/**
 * Protección del dashboard: exige una sesión de NextAuth y aplica los
 * permisos de navegación del rol contenido en el JWT cifrado.
 * Ya no se aceptan roles desde query params, cabeceras ni cookies editables.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({ req: request, secret: getAuthSecret() }).catch(() => null);
  const sessionRole = parseRole(token?.role);

  if (!token || !sessionRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Solo una ADMIN real puede previsualizar la navegación de otro rol (UI únicamente;
  // la API siempre autoriza con el rol verdadero de la sesión).
  const previewRole = sessionRole === "ADMIN" ? parseRole(request.cookies.get(ROLE_PREVIEW_COOKIE)?.value) : null;
  const effectiveRole: Role = previewRole ?? sessionRole;

  if (pathname !== "/dashboard" && !isRouteAllowedForRole(effectiveRole, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
