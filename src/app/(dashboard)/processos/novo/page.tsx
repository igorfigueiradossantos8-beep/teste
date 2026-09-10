import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ProcessoForm } from "@/components/processos/processo-form";
import { createProcessoAction } from "@/lib/actions/processos";
import { getAreasDireito } from "@/lib/data/config";

export const metadata = { title: "Novo processo" };

export default async function NovoProcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string }>;
}) {
  const { cliente_id } = await searchParams;
  const supabase = await createClient();
  const [{ data: clientes }, areas] = await Promise.all([
    supabase.from("clientes").select("id, nome").is("deleted_at", null).order("nome"),
    getAreasDireito(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Novo processo" description="Vincule o processo a um cliente e defina o modelo de cobrança." />
      <Card>
        <CardHeader>
          <CardTitle>Dados do processo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessoForm
            action={createProcessoAction}
            clientes={clientes ?? []}
            areasDireito={areas}
            clienteIdFixo={cliente_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
