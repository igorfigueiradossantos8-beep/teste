"use client";

import { useActionState } from "react";
import { Loader2, MessageSquarePlus, History } from "lucide-react";
import { Select, Textarea, Input, Label, FieldGroup } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { addHistoricoAction } from "@/lib/actions/historico";
import { formatDateTime } from "@/lib/utils";
import type { Historico, TipoRegistroHistorico } from "@/types/database.types";

const TIPO_LABEL: Record<TipoRegistroHistorico, string> = {
  andamento: "Andamento processual",
  atendimento: "Atendimento",
  anotacao: "Anotação interna",
  contato: "Contato",
};

const TIPO_TONE: Record<TipoRegistroHistorico, "azul" | "dourado" | "verde" | "neutral"> = {
  andamento: "azul",
  atendimento: "verde",
  anotacao: "neutral",
  contato: "dourado",
};

async function submit(_prev: void, formData: FormData) {
  await addHistoricoAction(formData);
}

export function HistoricoPanel({
  historico,
  clienteId,
  processoId,
}: {
  historico: (Historico & { autor?: { full_name: string } | null })[];
  clienteId?: string;
  processoId?: string;
}) {
  const [, formAction, pending] = useActionState(submit, undefined);

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-lg border border-bege-200 bg-bege-50/50 p-4">
        {clienteId && <input type="hidden" name="cliente_id" value={clienteId} />}
        {processoId && <input type="hidden" name="processo_id" value={processoId} />}

        <div className="grid gap-3 sm:grid-cols-3">
          <FieldGroup className="sm:col-span-1">
            <Label htmlFor="tipo">Tipo</Label>
            <Select id="tipo" name="tipo" defaultValue="anotacao">
              {Object.entries(TIPO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="titulo">Título (opcional)</Label>
            <Input id="titulo" name="titulo" />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label htmlFor="descricao">Descrição *</Label>
          <Textarea id="descricao" name="descricao" required placeholder="Descreva o andamento, atendimento ou anotação..." />
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
            Registrar
          </Button>
        </div>
      </form>

      {historico.length === 0 ? (
        <EmptyState icon={History} title="Sem registros ainda" description="O histórico de atendimentos e andamentos aparecerá aqui." />
      ) : (
        <ul className="space-y-4">
          {historico.map((item) => (
            <li key={item.id} className="relative border-l-2 border-bege-200 pl-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone={TIPO_TONE[item.tipo]}>{TIPO_LABEL[item.tipo]}</Badge>
                <span className="text-xs text-preto/50">{formatDateTime(item.data_evento)}</span>
                {item.autor?.full_name && (
                  <span className="text-xs text-preto/40">· {item.autor.full_name}</span>
                )}
              </div>
              {item.titulo && <p className="font-medium text-azul-950">{item.titulo}</p>}
              <p className="text-sm whitespace-pre-wrap text-preto/80">{item.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
