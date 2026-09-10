import { requireUser } from "@/lib/auth/permissions";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
