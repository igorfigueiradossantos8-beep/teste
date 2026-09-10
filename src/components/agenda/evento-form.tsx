"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { createEventoAction } from "@/lib/actions/agenda";
import type { ActionState } from "@/lib/actions/clientes";
import { TIPO_EVENTO_LABEL } from "@/lib/status";

export function EventoForm({
  clientes,
  processos,
}: {
  clientes: { id: string; nome: string }[];
  processos: { id: string; numero_processo: string | null; area_direito: string }[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createEventoAction(prev, formData);
      if (!result.error) {
        setOpen(false);
        formRef.current?.reset();
      }
      return result;
    },
    {},
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Novo compromisso
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo compromisso">
        <form ref={formRef} action={formAction} className="space-y-1">
          <FieldGroup>
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" name="titulo" required />
            <FieldError>{state.fieldErrors?.titulo}</FieldError>
          </FieldGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select id="tipo" name="tipo" defaultValue="prazo">
                {Object.entries(TIPO_EVENTO_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="local">Local</Label>
              <Input id="local" name="local" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="data_inicio">Início *</Label>
              <Input id="data_inicio" name="data_inicio" type="datetime-local" required />
              <FieldError>{state.fieldErrors?.data_inicio}</FieldError>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="data_fim">Fim</Label>
              <Input id="data_fim" name="data_fim" type="datetime-local" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select id="cliente_id" name="cliente_id" defaultValue="">
                <option value="">—</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="processo_id">Processo</Label>
              <Select id="processo_id" name="processo_id" defaultValue="">
                <option value="">—</option>
                {processos.map((p) => <option key={p.id} value={p.id}>{p.numero_processo || p.area_direito}</option>)}
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" />
          </FieldGroup>

          {state.error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
