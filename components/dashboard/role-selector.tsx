"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Shield, Sparkles } from "lucide-react";
import { ROLE_PREVIEW_COOKIE, type Role } from "../../lib/rbac-config";

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  { role: "ADMIN", label: "Administradora (Admin)", description: "Ve todo el sistema" },
  { role: "ENGINEER", label: "Ingeniero (Soporte)", description: "Todo excepto Finanzas y Pasarela" },
  { role: "SOCIAL_MEDIA", label: "Social Media", description: "Redes y Contenido" },
  { role: "COLLABORATOR", label: "Colaboradora", description: "Perfil, Agenda, Audios" },
  { role: "CLIENT", label: "Cliente", description: "Perfil personal" },
];

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
    <div className="flex items-center gap-1.5 rounded-full border border-[#C5A059]/45 bg-[#FCFAF5] px-2.5 py-1 text-xs">
      <span className="hidden items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.18em] text-[#2C2C2C]/65 sm:flex">
        <Eye size={11} className="text-[#8B6914]" />
        Ver como
      </span>
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        disabled={isPending}
        aria-label="Previsualizar el dashboard como otro rol"
        className="cursor-pointer appearance-none bg-transparent py-1 text-[11px] font-semibold text-[#6B4E24] outline-none focus:ring-0"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.role} value={opt.role} className="bg-[#FCFAF5] text-[#1A1A1A]">
            {opt.label}
          </option>
        ))}
      </select>
      {isPending ? (
        <Sparkles size={12} className="animate-spin text-[#9E7B2F]" />
      ) : (
        <Shield size={12} className="text-[#9E7B2F]" />
      )}
    </div>
  );
}
