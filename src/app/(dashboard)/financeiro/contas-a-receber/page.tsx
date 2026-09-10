import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { MarcarPagoDialog } from "@/components/financeiro/marcar-pago-dialog";
import { EmitirReciboButton } from "@/components/financeiro/emitir-recibo-button";
import { marcarParcelaPagaAction } from "@/lib/actions/honorarios";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_PARCELA_LABEL, STATUS_PARCELA_TONE } from "@/lib/status";
import type { StatusParcela } from "@/types/database.types";

export const metadata = { title: "Contas a receber" };

export default async function ContasAReceberPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("parcelas")
    .select("id, numero_parcela, valor, data_vencimento, data_pagamento, status, honorarios(id, descricao, clientes(nome))")
    .order("data_vencimento", { ascending: true });

  if (status) query = query.eq("status", status as StatusParcela);

  const { data: parcelas } = await query;

  return (
    <div>
      <PageHeader
        title="Contas a receber"
        description="Honorários, parcelas e controle de inadimplência."
        action={
          <Button href="/financeiro/contas-a-receber/novo">
            <Plus className="h-4 w-4" /> Nova cobrança
          </Button>
        }
      />

      <form className="mb-4 flex gap-3" action="/financeiro/contas-a-receber">
        <Select name="status" defaultValue={status ?? ""} className="w-auto">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_PARCELA_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      {parcelas && parcelas.length > 0 ? (
        <Table>
          <Thead>
            <tr>
              <Th>Cliente</Th>
              <Th>Descrição</Th>
              <Th>Parcela</Th>
              <Th>Valor</Th>
              <Th>Vencimento</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {parcelas.map((p) => {
              const honorario = p.honorarios as unknown as { id: string; descricao: string; clientes: { nome: string } | null };
              return (
                <Tr key={p.id}>
                  <Td>{honorario.clientes?.nome ?? "—"}</Td>
                  <Td>
                    <Link href={`/financeiro/contas-a-receber/${honorario.id}`} className="text-azul-900 hover:underline">
                      {honorario.descricao}
                    </Link>
                  </Td>
                  <Td>{p.numero_parcela}</Td>
                  <Td className="font-medium">{formatCurrency(p.valor)}</Td>
                  <Td>{formatDate(p.data_vencimento)}</Td>
                  <Td><Badge tone={STATUS_PARCELA_TONE[p.status]}>{STATUS_PARCELA_LABEL[p.status]}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      {(p.status === "pendente" || p.status === "atrasado") && (
                        <MarcarPagoDialog action={marcarParcelaPagaAction} idFieldName="parcela_id" id={p.id} />
                      )}
                      {p.status === "pago" && <EmitirReciboButton parcelaId={p.id} />}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <div className="rounded-xl border border-bege-200 bg-branco">
          <EmptyState icon={Wallet} title="Nenhuma cobrança lançada" action={<Button href="/financeiro/contas-a-receber/novo"><Plus className="h-4 w-4" /> Nova cobrança</Button>} />
        </div>
      )}
    </div>
  );
}
