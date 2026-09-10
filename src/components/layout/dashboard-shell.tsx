"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/lib/auth/actions";
import type { Profile } from "@/types/database.types";

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bege-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <SidebarNav role={profile.role} />
        </div>
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-azul-950/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="relative h-full w-72 max-w-[80vw]">
            <button
              className="absolute top-4 right-3 z-10 rounded-full bg-azul-900 p-1.5 text-bege-100"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarNav role={profile.role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-bege-200 bg-branco/95 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-md p-2 text-azul-900 hover:bg-bege-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-azul-950">{profile.full_name}</p>
              <p className="text-xs text-preto/50">
                {profile.role === "admin" ? "Administrador" : "Equipe"}
              </p>
            </div>
            <Avatar name={profile.full_name} src={profile.avatar_url} />
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md p-2 text-azul-900 hover:bg-bege-100"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
