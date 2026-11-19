import { redirect } from "next/navigation";
import { StaffLoginForm } from "../../components/staff-login-form";
import { getStaffPrincipal } from "../../lib/rbac";

export const dynamic = "force-dynamic";

/** Solo acepta rutas internas para evitar redirecciones abiertas. */
function safeCallback(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/dashboard";
}

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);
  if (await getStaffPrincipal()) redirect(callbackUrl);
  return <StaffLoginForm callbackUrl={callbackUrl} hasError={Boolean(params.error)} />;
}
