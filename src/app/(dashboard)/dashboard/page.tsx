import Link from "next/link";
import { Wallet, TrendingUp, AlertTriangle, Gavel, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProcessosStatusChart } from "@/components/dashboard/processos-status-chart";
import { getResumoFinanceiro, getProcessosPorStatus, getProximosCompromissos } from "@/lib/data/financeiro";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { TIPO_EVENTO_LABEL } from "@/lib/status";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireUser();
  const isAdmin = profile.role === "admin";

  const [resumo, processosPorStatus, proximos] = await Promise.all([
    isAdmin ? getResumoFinanceiro() : null,
    getProcessosPorStatus(),
    getProximosCompromissos(6),
  ]);

  const totalProcessosAtivos = processosPorStatus
    .filter((p) => p.status === "ativo")
    .reduce((s, p) => s + p.quantidade, 0);

  return (
    <div>
      <PageHeader title={`Bem-vindo(a), ${profile.full_name.split(" ")[0]}`} description="Visão geral do escritório Advocacia FB." />

      {isAdmin && resumo && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total a receber" value={formatCurrency(resumo.totalAReceber)} icon={Wallet} tone="azul" />
          <StatCard label="Total recebido" value={formatCurrency(resumo.totalRecebido)} icon={TrendingUp} tone="verde" />
          <StatCard
            label="Inadimplência"
            value={formatCurrency(resumo.totalInadimplente)}
            hint={`${resumo.qtdInadimplente} parcela(s) em atraso`}
            icon={AlertTriangle}
            tone="vermelho"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Processos por status</CardTitle>
            <Badge tone="azul">{totalProcessosAtivos} ativos</Badge>
          </CardHeader>
          <CardContent>
            <ProcessosStatusChart data={processosPorStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos compromissos</CardTitle>
            <Link href="/agenda" className="text-xs text-azul-800 hover:underline">Ver agenda</Link>
          </CardHeader>
          <CardContent>
            {proximos.length === 0 ? (
              <EmptyState icon={CalendarClock} title="Nenhum compromisso agendado" />
            ) : (
              <ul className="space-y-3">
                {proximos.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 border-b border-bege-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bege-100 text-azul-800">
                      <Gavel className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-azul-950">{c.titulo}</p>
                      <p className="text-xs text-preto/50">
                        {TIPO_EVENTO_LABEL[c.tipo]} · {formatDateTime(c.data_inicio)}
                      </p>
                      {c.cliente_nome && <p className="text-xs text-preto/40">{c.cliente_nome}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
