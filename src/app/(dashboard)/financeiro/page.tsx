import Link from "next/link";
import { Wallet, TrendingUp, AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumoFinanceiro } from "@/lib/data/financeiro";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Financeiro" };

export default async function FinanceiroPage() {
  const resumo = await getResumoFinanceiro();
  const saldo = resumo.totalRecebido - resumo.totalPago;

  return (
    <div>
      <PageHeader title="Financeiro" description="Visão geral do financeiro do escritório." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="A receber (pendente)" value={formatCurrency(resumo.totalAReceber)} icon={Wallet} tone="azul" />
        <StatCard label="Recebido" value={formatCurrency(resumo.totalRecebido)} icon={TrendingUp} tone="verde" />
        <StatCard
          label="Inadimplência"
          value={formatCurrency(resumo.totalInadimplente)}
          hint={`${resumo.qtdInadimplente} parcela(s) em atraso`}
          icon={AlertTriangle}
          tone="vermelho"
        />
        <StatCard label="Saldo (recebido - pago)" value={formatCurrency(saldo)} icon={TrendingDown} tone="dourado" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/financeiro/contas-a-receber", label: "Contas a receber", desc: "Honorários, parcelas e inadimplência" },
          { href: "/financeiro/contas-a-pagar", label: "Contas a pagar", desc: "Despesas do escritório" },
          { href: "/financeiro/fluxo-de-caixa", label: "Fluxo de caixa", desc: "Entradas x saídas" },
          { href: "/financeiro/relatorios", label: "Relatórios", desc: "Exportar PDF e Excel" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <ArrowRight className="h-4 w-4 text-dourado-500" />
              </CardHeader>
              <CardContent className="pt-0 text-sm text-preto/60">{item.desc}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
