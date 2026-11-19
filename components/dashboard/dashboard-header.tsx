"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";

export function DashboardHeader({
  userName = "Paola Hernández",
  userRole = "ADMIN",
}: {
  userName?: string;
  userRole?: string;
}) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-end gap-5 border-b border-[#3E2723]/10 bg-[#F4ECD8]/90 px-8 backdrop-blur-md">
      <button
        type="button"
        aria-label="Notificaciones"
        className="relative rounded-full p-2.5 transition hover:bg-white/70"
      >
        <Bell size={20} />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-[#D4AF37]" />
      </button>
      <div className="h-8 w-px bg-[#3E2723]/15" />
      <div className="text-right">
        <p className="text-sm font-semibold">{userName}</p>
        <p className="text-xs text-[#3E2723]/55">
          {userRole === "ADMIN" ? "Administradora" : "Colaboradora"}
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl border border-[#3E2723]/15 px-3.5 py-2 text-sm font-medium transition hover:bg-white/70"
      >
        <LogOut size={16} /> Cerrar Sesión
      </button>
    </header>
  );
}
