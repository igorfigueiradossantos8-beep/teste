import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FluxoChart } from "@/components/financeiro/fluxo-chart";
import { getFluxoDeCaixa } from "@/lib/data/financeiro";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Fluxo de caixa" };

export default async function FluxoDeCaixaPage() {
  const fluxo = await getFluxoDeCaixa(6);
  const totalEntradas = fluxo.reduce((s, m) => s + m.entradas, 0);
  const totalSaidas = fluxo.reduce((s, m) => s + m.saidas, 0);

  return (
    <div>
      <PageHeader title="Fluxo de caixa" description="Entradas e saídas consolidadas dos últimos 6 meses." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent><p className="text-xs text-preto/50">Total de entradas</p><p className="font-serif text-xl font-semibold text-emerald-700">{formatCurrency(totalEntradas)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-preto/50">Total de saídas</p><p className="font-serif text-xl font-semibold text-dourado-600">{formatCurrency(totalSaidas)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-preto/50">Saldo do período</p><p className="font-serif text-xl font-semibold text-azul-950">{formatCurrency(totalEntradas - totalSaidas)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Entradas x Saídas por mês</CardTitle></CardHeader>
        <CardContent>
          <FluxoChart data={fluxo} />
        </CardContent>
      </Card>
    </div>
  );
}
