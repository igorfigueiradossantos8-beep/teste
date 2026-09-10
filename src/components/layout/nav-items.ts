import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Gavel,
  Wallet,
  CalendarDays,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Processos", href: "/processos", icon: Gavel },
  { label: "Financeiro", href: "/financeiro", icon: Wallet, adminOnly: true },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];
