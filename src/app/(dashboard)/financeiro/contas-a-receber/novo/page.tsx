import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { HonorarioForm } from "@/components/financeiro/honorario-form";

export const metadata = { title: "Nova cobrança" };

export default async function NovaCobrancaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string; processo_id?: string }>;
}) {
  const { cliente_id, processo_id } = await searchParams;
  const supabase = await createClient();

  const [{ data: clientes }, { data: processos }] = await Promise.all([
    supabase.from("clientes").select("id, nome").is("deleted_at", null).order("nome"),
    supabase.from("processos").select("id, numero_processo, cliente_id, area_direito").is("deleted_at", null),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nova cobrança" description="Gere honorários com parcelamento automático." />
      <Card>
        <CardHeader>
          <CardTitle>Dados da cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <HonorarioForm
            clientes={clientes ?? []}
            processos={processos ?? []}
            clienteIdFixo={cliente_id}
            processoIdFixo={processo_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
