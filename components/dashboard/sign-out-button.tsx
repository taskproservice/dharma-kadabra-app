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
      className="flex items-center gap-2 rounded-full border border-[#c7a45a]/25 px-3 py-2 text-xs font-medium text-[#e9e2d2]/80 transition hover:border-[#c7a45a]/60 hover:bg-[#c7a45a]/10 hover:text-[#e3c57c] disabled:opacity-60"
    >
      <LogOut size={14} />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}
