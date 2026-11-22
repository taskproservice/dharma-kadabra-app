"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ROLE_PREVIEW_COOKIE } from "../../lib/rbac-config";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    document.cookie = `${ROLE_PREVIEW_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      aria-label="Cerrar sesión"
      className="flex items-center gap-2 rounded-full border border-[#2C2C2C]/25 bg-[#FCFAF5] px-3 py-2 text-xs font-medium text-[#1A1A1A] transition hover:border-[#C5A059] hover:bg-[#C5A059]/15 disabled:opacity-60"
    >
      <LogOut size={14} />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}
