import Link from "next/link";
import { Plus, Gavel, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { STATUS_PROCESSO_LABEL, STATUS_PROCESSO_TONE } from "@/lib/status";
import { getAreasDireito } from "@/lib/data/config";
import type { StatusProcesso } from "@/types/database.types";

export const metadata = { title: "Processos" };

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; area?: string }>;
}) {
  const { q, status, area } = await searchParams;
  const supabase = await createClient();
  const areas = await getAreasDireito();

  let query = supabase
    .from("processos")
    .select("id, numero_processo, area_direito, status, cliente_id, clientes(nome)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("numero_processo", `%${q}%`);
  if (status) query = query.eq("status", status as StatusProcesso);
  if (area) query = query.eq("area_direito", area);

  const { data: processos } = await query;

  return (
    <div>
      <PageHeader
        title="Processos"
        description="Todos os processos e casos jurídicos do escritório."
        action={
          <Button href="/processos/novo">
            <Plus className="h-4 w-4" /> Novo processo
          </Button>
        }
      />

      <form className="mb-4 flex flex-wrap gap-3" action="/processos">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-preto/40" />
          <Input name="q" defaultValue={q} placeholder="Buscar por número..." className="pl-9" />
        </div>
        <Select name="status" defaultValue={status ?? ""} className="w-auto">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_PROCESSO_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select name="area" defaultValue={area ?? ""} className="w-auto">
          <option value="">Todas as áreas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>

      {processos && processos.length > 0 ? (
        <Table>
          <Thead>
            <tr>
              <Th>Cliente</Th>
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
                    {(p.clientes as unknown as { nome: string } | null)?.nome ?? "—"}
                  </Link>
                </Td>
                <Td className="text-preto/70">{p.numero_processo || "—"}</Td>
                <Td>{p.area_direito}</Td>
                <Td>
                  <Badge tone={STATUS_PROCESSO_TONE[p.status]}>{STATUS_PROCESSO_LABEL[p.status]}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <div className="rounded-xl border border-bege-200 bg-branco">
          <EmptyState
            icon={Gavel}
            title="Nenhum processo encontrado"
            description="Cadastre processos vinculados aos clientes do escritório."
            action={<Button href="/processos/novo"><Plus className="h-4 w-4" /> Novo processo</Button>}
          />
        </div>
      )}
    </div>
  );
}
