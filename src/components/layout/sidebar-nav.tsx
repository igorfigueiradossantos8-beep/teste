"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import type { UserRole } from "@/types/database.types";

export function SidebarNav({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-azul-950 text-bege-100">
      <div className="flex items-center gap-2 border-b border-azul-800 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dourado-500">
          <Scale className="h-4.5 w-4.5 text-azul-950" />
        </div>
        <div>
          <p className="font-serif text-base font-semibold text-branco leading-tight">Advocacia FB</p>
          <p className="text-[11px] text-bege-300/70">Fábio Braga de Amaral</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-dourado-500 text-azul-950"
                  : "text-bege-200 hover:bg-azul-800 hover:text-branco",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-azul-800 px-5 py-4 text-[11px] text-bege-300/60">
        LGPD: acessos e alterações são auditados.
      </div>
    </div>
  );
}
