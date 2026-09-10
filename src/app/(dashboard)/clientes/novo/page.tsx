import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { createClienteAction } from "@/lib/actions/clientes";

export const metadata = { title: "Novo cliente" };

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Novo cliente" description="Preencha os dados para cadastrar um novo cliente." />
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm action={createClienteAction} />
        </CardContent>
      </Card>
    </div>
  );
}
