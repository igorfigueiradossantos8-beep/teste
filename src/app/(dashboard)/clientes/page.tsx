import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("id, nome, tipo_pessoa, email, telefone, ativo, created_at")
    .is("deleted_at", null)
    .order("nome");

  if (q) {
    query = query.ilike("nome", `%${q}%`);
  }

  const { data: clientes } = await query;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes do escritório."
        action={
          <Button href="/clientes/novo">
            <Plus className="h-4 w-4" /> Novo cliente
          </Button>
        }
      />

      <form className="mb-4 max-w-sm" action="/clientes">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-preto/40" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nome..." className="pl-9" />
        </div>
      </form>

      {clientes && clientes.length > 0 ? (
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Tipo</Th>
              <Th>Contato</Th>
              <Th>Status</Th>
              <Th>Cadastrado em</Th>
            </tr>
          </Thead>
          <Tbody>
            {clientes.map((cliente) => (
              <Tr key={cliente.id}>
                <Td>
                  <Link href={`/clientes/${cliente.id}`} className="font-medium text-azul-900 hover:underline">
                    {cliente.nome}
                  </Link>
                </Td>
                <Td>{cliente.tipo_pessoa === "fisica" ? "Física" : "Jurídica"}</Td>
                <Td>
                  <div className="text-sm">{cliente.email || "—"}</div>
                  <div className="text-xs text-preto/50">{cliente.telefone || ""}</div>
                </Td>
                <Td>
                  <Badge tone={cliente.ativo ? "verde" : "neutral"}>
                    {cliente.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </Td>
                <Td className="text-preto/60">{formatDate(cliente.created_at)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <div className="rounded-xl border border-bege-200 bg-branco">
          <EmptyState
            icon={Users}
            title={q ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            description={q ? "Tente outro termo de busca." : "Comece cadastrando o primeiro cliente do escritório."}
            action={!q && <Button href="/clientes/novo"><Plus className="h-4 w-4" /> Novo cliente</Button>}
          />
        </div>
      )}
    </div>
  );
}
