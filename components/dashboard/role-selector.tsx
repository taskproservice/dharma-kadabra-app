"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Shield, Sparkles } from "lucide-react";
import { ROLE_PREVIEW_COOKIE, type Role } from "../../lib/rbac-config";

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  { role: "ADMIN", label: "Administradora (Admin)", description: "Ve todo el sistema" },
  { role: "ENGINEER", label: "Ingeniero (Soporte)", description: "Todo excepto Finanzas y Pasarela" },
  { role: "MARKETING", label: "Marketing (CM)", description: "Inventario, visibilidad y métricas" },
  { role: "COLLABORATOR", label: "Colaboradora", description: "Perfil, Agenda, Audios" },
  { role: "CLIENT", label: "Cliente", description: "Perfil personal" },
];

/**
 * Vista previa por rol para administradoras. Solo se renderiza cuando la sesión
 * es ADMIN (lo decide el layout en el servidor) y únicamente cambia la
 * navegación visible: la API siempre autoriza con el rol real de la sesión.
 */
export function RoleSelector({ currentRole }: { currentRole: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (newRole: Role) => {
    document.cookie = newRole === "ADMIN"
      ? `${ROLE_PREVIEW_COOKIE}=; path=/; max-age=0; SameSite=Lax`
      : `${ROLE_PREVIEW_COOKIE}=${newRole}; path=/; max-age=28800; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#c7a45a]/25 bg-white/[0.04] px-2.5 py-1 text-xs backdrop-blur-md">
      <span className="hidden items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.18em] text-[#e9e2d2]/45 sm:flex">
        <Eye size={11} className="text-[#c7a45a]/80" />
        Ver como
      </span>
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        disabled={isPending}
        aria-label="Previsualizar el dashboard como otro rol"
        className="cursor-pointer appearance-none bg-transparent py-1 text-[11px] font-semibold text-[#d8bc7f] outline-none focus:ring-0"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.role} value={opt.role} className="bg-[#11182b] text-[#e9e2d2]">
            {opt.label}
          </option>
        ))}
      </select>
      {isPending ? (
        <Sparkles size={12} className="animate-spin text-[#c7a45a]" />
      ) : (
        <Shield size={12} className="text-[#c7a45a]/70" />
      )}
    </div>
  );
}
