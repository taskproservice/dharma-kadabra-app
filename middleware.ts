import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRouteAllowedForRole, normalizeRole, type Role } from "./lib/rbac";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Solo intervenimos en rutas del dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Si ya estamos en /dashboard exactamente, permitimos el acceso
  if (pathname === "/dashboard") {
    // Si viene un parámetro role en la URL, aseguramos guardarlo en cookies para la sesión
    const paramRole = searchParams.get("role");
    if (paramRole) {
      const normalized = normalizeRole(paramRole);
      const response = NextResponse.next();
      response.cookies.set("role", normalized, { path: "/", sameSite: "lax" });
      return response;
    }
    return NextResponse.next();
  }

  // Determinamos el rol actual del usuario desde parámetros, headers o cookies
  const roleParam = searchParams.get("role");
  const roleHeader =
    request.headers.get("x-user-role") ||
    request.headers.get("role") ||
    request.headers.get("x-role");
  const roleCookie =
    request.cookies.get("role")?.value ||
    request.cookies.get("user_role")?.value ||
    request.cookies.get("x-user-role")?.value ||
    request.cookies.get("auth_role")?.value;

  const currentRole: Role = normalizeRole(roleParam || roleHeader || roleCookie || "ADMIN");

  // Validamos si el rol tiene permiso para la ruta solicitada
  const allowed = isRouteAllowedForRole(currentRole, pathname);

  if (!allowed) {
    // Si un SOCIAL_MEDIA (o cualquier rol sin permiso) intenta entrar a una ruta no autorizada
    // como /dashboard/pos, el middleware debe rebotarlo y mandarlo a /dashboard
    const redirectUrl = new URL("/dashboard", request.url);
    if (roleParam) {
      redirectUrl.searchParams.set("role", currentRole);
    }
    const response = NextResponse.redirect(redirectUrl);
    if (roleParam || (roleCookie && roleCookie !== currentRole)) {
      response.cookies.set("role", currentRole, { path: "/", sameSite: "lax" });
    }
    return response;
  }

  const response = NextResponse.next();
  if (roleParam) {
    response.cookies.set("role", currentRole, { path: "/", sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
