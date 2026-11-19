"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sparkles } from "lucide-react";
import type { Role } from "../../lib/rbac";

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  { role: "ADMIN", label: "Administradora (Admin)", description: "Ve todo el sistema" },
  { role: "ENGINEER", label: "Ingeniero (Soporte)", description: "Sin Pasarela ni Runas" },
  { role: "SOCIAL_MEDIA", label: "Social Media", description: "Resumen, Audio, Video, Redes" },
  { role: "COLLABORATOR", label: "Colaboradora", description: "Perfil, Agenda, Audio" },
  { role: "CLIENT", label: "Cliente", description: "Perfil personal" },
];

export function RoleSelector({ currentRole }: { currentRole: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (newRole: Role) => {
    document.cookie = `role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-white/70 px-2.5 py-1 text-xs shadow-sm backdrop-blur-md">
        <Shield size={14} className="text-[#9A7B28]" />
        <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-[#3E2723]/60 sm:inline">
          Rol activo:
        </span>
        <select
          value={currentRole}
          onChange={(e) => handleRoleChange(e.target.value as Role)}
          disabled={isPending}
          aria-label="Seleccionar rol para simulación y pruebas RBAC"
          className="cursor-pointer bg-transparent text-xs font-semibold text-[#8B6D16] outline-none hover:text-[#5c4608] focus:ring-0"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.role} value={opt.role} className="bg-[#F4ECD8] text-[#3E2723]">
              {opt.label}
            </option>
          ))}
        </select>
        {isPending && <Sparkles size={12} className="animate-spin text-[#9A7B28]" />}
      </div>
    </div>
  );
}
