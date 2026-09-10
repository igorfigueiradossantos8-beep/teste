import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { updateClienteAction, getClienteDocumento } from "@/lib/actions/clientes";

export const metadata = { title: "Editar cliente" };

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cliente }, cpfCnpj] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", id).single(),
    getClienteDocumento(id),
  ]);

  if (!cliente) notFound();

  const action = updateClienteAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Editar cliente" description={cliente.nome} />
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm action={action} cliente={cliente} cpfCnpjAtual={cpfCnpj} />
        </CardContent>
      </Card>
    </div>
  );
}
