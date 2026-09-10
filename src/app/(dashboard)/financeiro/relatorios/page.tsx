import { FileText, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Relatórios" };

const RELATORIOS = [
  { tipo: "receber", titulo: "Contas a receber", descricao: "Honorários e parcelas, com status de pagamento." },
  { tipo: "pagar", titulo: "Contas a pagar", descricao: "Despesas do escritório por categoria." },
  { tipo: "fluxo", titulo: "Fluxo de caixa", descricao: "Entradas e saídas consolidadas dos últimos 6 meses." },
];

export default function RelatoriosPage() {
  return (
    <div>
      <PageHeader title="Relatórios" description="Exporte relatórios financeiros para uso do contador." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RELATORIOS.map((r) => (
          <Card key={r.tipo}>
            <CardHeader>
              <CardTitle className="text-base">{r.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-preto/60">{r.descricao}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" href={`/api/relatorios?tipo=${r.tipo}&formato=pdf`}>
                  <FileText className="h-4 w-4" /> PDF
                </Button>
                <Button size="sm" variant="outline" href={`/api/relatorios?tipo=${r.tipo}&formato=excel`}>
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
