import { requireAdmin } from "@/lib/auth/permissions";

export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
