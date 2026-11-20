import Image from "next/image";
import { Bell } from "lucide-react";
import type { Role } from "../../lib/rbac-config";
import { RoleSelector } from "./role-selector";
import { SignOutButton } from "./sign-out-button";

export function DashboardHeader({
  name,
  roleTitle,
  currentRole,
  isRealAdmin,
}: {
  name: string;
  roleTitle: string;
  currentRole: Role;
  isRealAdmin: boolean;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "Paola";

  return (
    <header className="sticky top-0 z-20 flex min-h-[76px] flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-[#D4AF37]/25 bg-[#F4ECD8]/95 px-5 py-3 shadow-[0_4px_20px_rgba(62,39,35,0.04)] backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <Image
          src="/images/logo.png"
          alt="Dharma Kadabra"
          width={44}
          height={44}
          priority
          className="shrink-0 border-0 bg-transparent object-contain drop-shadow-[0_0_8px_rgba(169,132,25,0.25)]"
        />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-[#2A1B17]">Hola, {firstName}</p>
          <p className="mt-0.5 truncate text-xs text-[#3E2723]/55">{roleTitle}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-full p-2.5 text-[#3E2723] transition hover:bg-white/70"
        >
          <Bell size={19} strokeWidth={1.8} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#D4AF37] ring-2 ring-[#F4ECD8]" />
        </button>
        {isRealAdmin && <RoleSelector currentRole={currentRole} />}
        <SignOutButton />
      </div>
    </header>
  );
}
