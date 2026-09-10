import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { DespesaForm } from "@/components/financeiro/despesa-form";

export const metadata = { title: "Nova despesa" };

export default function NovaDespesaPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nova despesa" description="Registre uma conta a pagar do escritório." />
      <Card>
        <CardHeader>
          <CardTitle>Dados da despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <DespesaForm />
        </CardContent>
      </Card>
    </div>
  );
}
