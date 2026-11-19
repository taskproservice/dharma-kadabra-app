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
      className="flex items-center gap-2 rounded-xl border border-[#3E2723]/15 px-3.5 py-2 text-sm font-medium transition hover:bg-white/70 disabled:opacity-60"
    >
      <LogOut size={16} />
      Cerrar Sesión
    </button>
  );
}
