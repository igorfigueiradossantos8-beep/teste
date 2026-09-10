import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Archive, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentosList } from "@/components/documentos/documentos-list";
import { DocumentoUploadForm } from "@/components/documentos/documento-upload-form";
import { HistoricoPanel } from "@/components/historico/historico-panel";
import { arquivarProcessoAction } from "@/lib/actions/processos";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  STATUS_PROCESSO_LABEL,
  STATUS_PROCESSO_TONE,
  MODELO_COBRANCA_LABEL,
  STATUS_PARCELA_LABEL,
  STATUS_PARCELA_TONE,
} from "@/lib/status";

export const metadata = { title: "Detalhes do processo" };

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  const [{ data: processo }, { data: documentos }, { data: historico }] = await Promise.all([
    supabase.from("processos").select("*, clientes(id, nome)").eq("id", id).single(),
    supabase.from("documentos").select("*").eq("processo_id", id).is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("historico").select("*, autor:profiles(full_name)").eq("processo_id", id).order("data_evento", { ascending: false }),
  ]);

  if (!processo) notFound();

  const cliente = processo.clientes as unknown as { id: string; nome: string } | null;

  let honorarios: { id: string; descricao: string; valor_total: number; parcelas: { id: string; valor: number; status: string; data_vencimento: string }[] }[] = [];
  if (profile.role === "admin") {
    const { data } = await supabase
      .from("honorarios")
      .select("id, descricao, valor_total, parcelas(id, valor, status, data_vencimento)")
      .eq("processo_id", id)
      .order("created_at", { ascending: false });
    honorarios = data ?? [];
  }

  return (
    <div>
      <PageHeader
        title={processo.numero_processo || "Processo sem número"}
        description={
          <>
            <Link href={`/clientes/${cliente?.id}`} className="text-azul-800 hover:underline">
              {cliente?.nome}
            </Link>
            {" · "}{processo.area_direito}
          </>
        }
        action={
          <>
            <Button variant="outline" href={`/processos/${id}/editar`}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <form action={arquivarProcessoAction.bind(null, id)}>
              <Button type="submit" variant="ghost">
                <Archive className="h-4 w-4" /> Arquivar
              </Button>
            </form>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs text-preto/50">Status</p>
            <Badge tone={STATUS_PROCESSO_TONE[processo.status]} className="mt-1">
              {STATUS_PROCESSO_LABEL[processo.status]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-preto/50">Vara / Tribunal</p>
            <p className="text-sm font-medium">{processo.vara_tribunal || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-preto/50">Distribuição</p>
            <p className="text-sm font-medium">{formatDate(processo.data_distribuicao)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-preto/50">Cobrança</p>
            <p className="text-sm font-medium">{MODELO_COBRANCA_LABEL[processo.modelo_cobranca]}</p>
          </CardContent>
        </Card>
      </div>

      {processo.descricao && (
        <Card className="mb-6">
          <CardContent>
            <p className="mb-1 text-xs font-medium text-preto/50">Descrição</p>
            <p className="text-sm whitespace-pre-wrap text-preto/80">{processo.descricao}</p>
          </CardContent>
        </Card>
      )}

      <Tabs
        tabs={[
          {
            key: "documentos",
            label: "Documentos",
            count: documentos?.length ?? 0,
            content: (
              <Card>
                <div className="flex items-center justify-between border-b border-bege-100 px-5 py-4">
                  <p className="font-serif text-lg font-semibold text-azul-950">Documentos</p>
                  <DocumentoUploadForm processoId={id} />
                </div>
                <CardContent>
                  <DocumentosList documentos={documentos ?? []} />
                </CardContent>
              </Card>
            ),
          },
          {
            key: "historico",
            label: "Andamentos e histórico",
            content: (
              <Card>
                <CardContent>
                  <HistoricoPanel historico={historico ?? []} processoId={id} />
                </CardContent>
              </Card>
            ),
          },
          ...(profile.role === "admin"
            ? [
                {
                  key: "financeiro",
                  label: "Financeiro",
                  content: (
                    <Card>
                      <div className="flex items-center justify-between border-b border-bege-100 px-5 py-4">
                        <p className="font-serif text-lg font-semibold text-azul-950">Honorários deste processo</p>
                        <Button size="sm" href={`/financeiro/contas-a-receber/novo?processo_id=${id}&cliente_id=${cliente?.id}`}>
                          <Plus className="h-4 w-4" /> Novo honorário
                        </Button>
                      </div>
                      {honorarios.length > 0 ? (
                        <div className="divide-y divide-bege-100">
                          {honorarios.map((h) => (
                            <div key={h.id} className="px-5 py-4">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium text-azul-950">{h.descricao}</p>
                                <p className="font-serif font-semibold text-azul-950">{formatCurrency(h.valor_total)}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {h.parcelas.map((parc) => (
                                  <Badge key={parc.id} tone={STATUS_PARCELA_TONE[parc.status as keyof typeof STATUS_PARCELA_TONE]}>
                                    {formatCurrency(parc.valor)} · {formatDate(parc.data_vencimento)} · {STATUS_PARCELA_LABEL[parc.status as keyof typeof STATUS_PARCELA_LABEL]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState title="Nenhum honorário lançado para este processo" />
                      )}
                    </Card>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
