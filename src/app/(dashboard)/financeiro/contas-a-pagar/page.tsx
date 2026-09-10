import { Plus, Receipt, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { MarcarPagoDialog } from "@/components/financeiro/marcar-pago-dialog";
import { marcarDespesaPagaAction, excluirDespesaAction } from "@/lib/actions/despesas";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_DESPESA_LABEL, STATUS_DESPESA_TONE, CATEGORIA_DESPESA_LABEL } from "@/lib/status";
import type { StatusDespesa } from "@/types/database.types";

export const metadata = { title: "Contas a pagar" };

export default async function ContasAPagarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("despesas").select("*").order("data_vencimento", { ascending: true });
  if (status) query = query.eq("status", status as StatusDespesa);

  const { data: despesas } = await query;

  return (
    <div>
      <PageHeader
        title="Contas a pagar"
        description="Despesas do escritório categorizadas."
        action={
          <Button href="/financeiro/contas-a-pagar/novo">
            <Plus className="h-4 w-4" /> Nova despesa
          </Button>
        }
      />

      <form className="mb-4 flex gap-3" action="/financeiro/contas-a-pagar">
        <Select name="status" defaultValue={status ?? ""} className="w-auto">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_DESPESA_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      {despesas && despesas.length > 0 ? (
        <Table>
          <Thead>
            <tr>
              <Th>Descrição</Th>
              <Th>Categoria</Th>
              <Th>Valor</Th>
              <Th>Vencimento</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {despesas.map((d) => (
              <Tr key={d.id}>
                <Td>
                  <p className="font-medium text-azul-950">{d.descricao}</p>
                  {d.fornecedor && <p className="text-xs text-preto/50">{d.fornecedor}</p>}
                </Td>
                <Td>{CATEGORIA_DESPESA_LABEL[d.categoria]}</Td>
                <Td className="font-medium">{formatCurrency(d.valor)}</Td>
                <Td>{formatDate(d.data_vencimento)}</Td>
                <Td><Badge tone={STATUS_DESPESA_TONE[d.status]}>{STATUS_DESPESA_LABEL[d.status]}</Badge></Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    {(d.status === "pendente" || d.status === "atrasado") && (
                      <MarcarPagoDialog action={marcarDespesaPagaAction} idFieldName="despesa_id" id={d.id} />
                    )}
                    <form action={excluirDespesaAction.bind(null, d.id)}>
                      <Button type="submit" size="sm" variant="ghost" title="Excluir">
                        <Trash2 className="h-4 w-4 text-red-700" />
                      </Button>
                    </form>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <div className="rounded-xl border border-bege-200 bg-branco">
          <EmptyState icon={Receipt} title="Nenhuma despesa cadastrada" action={<Button href="/financeiro/contas-a-pagar/novo"><Plus className="h-4 w-4" /> Nova despesa</Button>} />
        </div>
      )}
    </div>
  );
}
