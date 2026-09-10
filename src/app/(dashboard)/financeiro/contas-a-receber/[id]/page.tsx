import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { MarcarPagoDialog } from "@/components/financeiro/marcar-pago-dialog";
import { EmitirReciboButton } from "@/components/financeiro/emitir-recibo-button";
import { marcarParcelaPagaAction } from "@/lib/actions/honorarios";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_PARCELA_LABEL, STATUS_PARCELA_TONE, MODELO_COBRANCA_LABEL } from "@/lib/status";

export const metadata = { title: "Detalhes da cobrança" };

export default async function HonorarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: honorario } = await supabase
    .from("honorarios")
    .select("*, clientes(id, nome), processos(id, numero_processo), parcelas(*)")
    .eq("id", id)
    .single();

  if (!honorario) notFound();

  const cliente = honorario.clientes as unknown as { id: string; nome: string } | null;
  const processo = honorario.processos as unknown as { id: string; numero_processo: string | null } | null;
  const parcelas = (honorario.parcelas as unknown as {
    id: string; numero_parcela: number; valor: number; data_vencimento: string; data_pagamento: string | null; status: string;
  }[]).sort((a, b) => a.numero_parcela - b.numero_parcela);

  const totalPago = parcelas.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0);

  return (
    <div>
      <PageHeader
        title={honorario.descricao}
        description={
          <>
            <Link href={`/clientes/${cliente?.id}`} className="text-azul-800 hover:underline">{cliente?.nome}</Link>
            {processo && (
              <>
                {" · "}
                <Link href={`/processos/${processo.id}`} className="text-azul-800 hover:underline">{processo.numero_processo}</Link>
              </>
            )}
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent><p className="text-xs text-preto/50">Valor total</p><p className="font-serif text-xl font-semibold text-azul-950">{formatCurrency(honorario.valor_total)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-preto/50">Já recebido</p><p className="font-serif text-xl font-semibold text-emerald-700">{formatCurrency(totalPago)}</p></CardContent></Card>
        <Card><CardContent><p className="text-xs text-preto/50">Modelo</p><p className="text-sm font-medium">{MODELO_COBRANCA_LABEL[honorario.tipo]}</p></CardContent></Card>
      </div>

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Parcela</Th>
              <Th>Valor</Th>
              <Th>Vencimento</Th>
              <Th>Pagamento</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {parcelas.map((p) => (
              <Tr key={p.id}>
                <Td>{p.numero_parcela}/{parcelas.length}</Td>
                <Td className="font-medium">{formatCurrency(p.valor)}</Td>
                <Td>{formatDate(p.data_vencimento)}</Td>
                <Td>{formatDate(p.data_pagamento)}</Td>
                <Td><Badge tone={STATUS_PARCELA_TONE[p.status as keyof typeof STATUS_PARCELA_TONE]}>{STATUS_PARCELA_LABEL[p.status as keyof typeof STATUS_PARCELA_LABEL]}</Badge></Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    {(p.status === "pendente" || p.status === "atrasado") && (
                      <MarcarPagoDialog action={marcarParcelaPagaAction} idFieldName="parcela_id" id={p.id} />
                    )}
                    {p.status === "pago" && <EmitirReciboButton parcelaId={p.id} />}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}
