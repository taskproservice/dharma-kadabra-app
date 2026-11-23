import { redirect } from "next/navigation";
import { StaffLoginForm } from "../../components/staff-login-form";
import { DASHBOARD_HOME_BY_ROLE, getStaffPrincipal, isRouteAllowedForRole } from "../../lib/rbac";

export const dynamic = "force-dynamic";

/**
 * Solo acepta rutas internas para evitar redirecciones abiertas.
 * Devuelve `null` cuando no hay `callbackUrl` explícito: en ese caso el
 * destino se decide por rol tras iniciar sesión (ver `StaffLoginForm`).
 */
function safeCallback(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : null;
}

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);

  // Ya autenticado: va directo a su panel según el rol, salvo que haya
  // pedido una ruta concreta que su rol sí tenga permitida.
  const staff = await getStaffPrincipal();
  if (staff) {
    const target =
      callbackUrl && isRouteAllowedForRole(staff.role, callbackUrl)
        ? callbackUrl
        : DASHBOARD_HOME_BY_ROLE[staff.role];
    redirect(target);
  }

  return <StaffLoginForm callbackUrl={callbackUrl} hasError={Boolean(params.error)} />;
}
