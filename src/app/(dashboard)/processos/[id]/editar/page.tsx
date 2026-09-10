import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ProcessoForm } from "@/components/processos/processo-form";
import { updateProcessoAction } from "@/lib/actions/processos";
import { getAreasDireito } from "@/lib/data/config";

export const metadata = { title: "Editar processo" };

export default async function EditarProcessoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: processo }, { data: clientes }, areas] = await Promise.all([
    supabase.from("processos").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome").is("deleted_at", null).order("nome"),
    getAreasDireito(),
  ]);

  if (!processo) notFound();

  const action = updateProcessoAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Editar processo" description={processo.numero_processo ?? processo.area_direito} />
      <Card>
        <CardHeader>
          <CardTitle>Dados do processo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessoForm
            action={action}
            processo={processo}
            clientes={clientes ?? []}
            areasDireito={areas}
          />
        </CardContent>
      </Card>
    </div>
  );
}
