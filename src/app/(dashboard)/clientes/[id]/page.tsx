import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Archive, Mail, Phone, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentosList } from "@/components/documentos/documentos-list";
import { DocumentoUploadForm } from "@/components/documentos/documento-upload-form";
import { HistoricoPanel } from "@/components/historico/historico-panel";
import { getClienteDocumento, arquivarClienteAction } from "@/lib/actions/clientes";
import { formatCpfCnpj, formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_PROCESSO_LABEL, STATUS_PROCESSO_TONE, STATUS_PARCELA_LABEL, STATUS_PARCELA_TONE } from "@/lib/status";
import { Gavel } from "lucide-react";

export const metadata = { title: "Detalhes do cliente" };

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireUser();
  const supabase = await createClient();

  const [{ data: cliente }, { data: processos }, { data: documentos }, { data: historico }, cpfCnpj] =
    await Promise.all([
      supabase.from("clientes").select("*").eq("id", id).single(),
      supabase.from("processos").select("*").eq("cliente_id", id).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("documentos").select("*").eq("cliente_id", id).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("historico").select("*, autor:profiles(full_name)").eq("cliente_id", id).order("data_evento", { ascending: false }),
      getClienteDocumento(id),
    ]);

  if (!cliente) notFound();

  let honorarios: { id: string; descricao: string; valor_total: number; parcelas: { id: string; valor: number; status: string; data_vencimento: string }[] }[] = [];
  if (profile.role === "admin") {
    const { data } = await supabase
      .from("honorarios")
      .select("id, descricao, valor_total, parcelas(id, valor, status, data_vencimento)")
      .eq("cliente_id", id)
      .order("created_at", { ascending: false });
    honorarios = data ?? [];
  }

  const endereco = cliente.endereco;
  const enderecoTexto = endereco
    ? [endereco.logradouro, endereco.numero, endereco.bairro, endereco.cidade, endereco.uf].filter(Boolean).join(", ")
    : null;

  return (
    <div>
      <PageHeader
        title={cliente.nome}
        description={cliente.tipo_pessoa === "fisica" ? "Pessoa física" : "Pessoa jurídica"}
        action={
          <>
            <Button variant="outline" href={`/clientes/${id}/editar`}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <form action={arquivarClienteAction.bind(null, id)}>
              <Button type="submit" variant="ghost">
                <Archive className="h-4 w-4" /> Arquivar
              </Button>
            </form>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-azul-800" />
            <div className="min-w-0">
              <p className="text-xs text-preto/50">E-mail</p>
              <p className="truncate text-sm font-medium">{cliente.email || "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-azul-800" />
            <div>
              <p className="text-xs text-preto/50">Telefone</p>
              <p className="text-sm font-medium">{cliente.telefone || "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-preto/50">CPF / CNPJ</p>
            <p className="text-sm font-medium">{cpfCnpj ? formatCpfCnpj(cpfCnpj) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-azul-800" />
            <div className="min-w-0">
              <p className="text-xs text-preto/50">Endereço</p>
              <p className="truncate text-sm font-medium">{enderecoTexto || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        tabs={[
          {
            key: "processos",
            label: "Processos",
            count: processos?.length ?? 0,
            content: (
              <Card>
                <div className="flex items-center justify-between border-b border-bege-100 px-5 py-4">
                  <p className="font-serif text-lg font-semibold text-azul-950">Processos vinculados</p>
                  <Button size="sm" href={`/processos/novo?cliente_id=${id}`}>
                    <Plus className="h-4 w-4" /> Novo processo
                  </Button>
                </div>
                {processos && processos.length > 0 ? (
                  <Table>
                    <Thead>
                      <tr>
                        <Th>Número</Th>
                        <Th>Área</Th>
                        <Th>Status</Th>
                      </tr>
                    </Thead>
                    <Tbody>
                      {processos.map((p) => (
                        <Tr key={p.id}>
                          <Td>
                            <Link href={`/processos/${p.id}`} className="font-medium text-azul-900 hover:underline">
                              {p.numero_processo || "Sem número"}
                            </Link>
                          </Td>
                          <Td>{p.area_direito}</Td>
                          <Td><Badge tone={STATUS_PROCESSO_TONE[p.status]}>{STATUS_PROCESSO_LABEL[p.status]}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <EmptyState icon={Gavel} title="Nenhum processo cadastrado" />
                )}
              </Card>
            ),
          },
          {
            key: "documentos",
            label: "Documentos",
            count: documentos?.length ?? 0,
            content: (
              <Card>
                <div className="flex items-center justify-between border-b border-bege-100 px-5 py-4">
                  <p className="font-serif text-lg font-semibold text-azul-950">Documentos</p>
                  <DocumentoUploadForm clienteId={id} />
                </div>
                <CardContent>
                  <DocumentosList documentos={documentos ?? []} />
                </CardContent>
              </Card>
            ),
          },
          {
            key: "historico",
            label: "Histórico",
            content: (
              <Card>
                <CardContent>
                  <HistoricoPanel historico={historico ?? []} clienteId={id} />
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
                        <p className="font-serif text-lg font-semibold text-azul-950">Honorários</p>
                        <Button size="sm" href={`/financeiro/contas-a-receber/novo?cliente_id=${id}`}>
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
                        <EmptyState title="Nenhum honorário lançado" />
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
