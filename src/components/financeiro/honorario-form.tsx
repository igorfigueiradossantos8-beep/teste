"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Select, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createHonorarioAction } from "@/lib/actions/honorarios";
import type { ActionState } from "@/lib/actions/clientes";
import { MODELO_COBRANCA_LABEL } from "@/lib/status";

export function HonorarioForm({
  clientes,
  processos,
  clienteIdFixo,
  processoIdFixo,
}: {
  clientes: { id: string; nome: string }[];
  processos: { id: string; numero_processo: string | null; cliente_id: string; area_direito: string }[];
  clienteIdFixo?: string;
  processoIdFixo?: string;
}) {
  const [state, formAction, pending] = useActionState(createHonorarioAction, {} as ActionState);
  const errors = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="cliente_id">Cliente *</Label>
          {clienteIdFixo ? (
            <input type="hidden" name="cliente_id" value={clienteIdFixo} />
          ) : (
            <Select id="cliente_id" name="cliente_id" required defaultValue="">
              <option value="" disabled>Selecione um cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          )}
          <FieldError>{errors.cliente_id}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="processo_id">Processo (opcional)</Label>
          {processoIdFixo ? (
            <input type="hidden" name="processo_id" value={processoIdFixo} />
          ) : (
            <Select id="processo_id" name="processo_id" defaultValue="">
              <option value="">Nenhum (honorário avulso)</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>{p.numero_processo || p.area_direito}</option>
              ))}
            </Select>
          )}
        </FieldGroup>

        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input id="descricao" name="descricao" required placeholder="Ex: Honorários contratuais - Ação trabalhista" />
          <FieldError>{errors.descricao}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="tipo">Modelo de cobrança *</Label>
          <Select id="tipo" name="tipo" defaultValue="fixo">
            {Object.entries(MODELO_COBRANCA_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="valor_total">Valor total (R$) *</Label>
          <Input id="valor_total" name="valor_total" type="number" step="0.01" min="0.01" required />
          <FieldError>{errors.valor_total}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="numero_parcelas">Número de parcelas *</Label>
          <Input id="numero_parcelas" name="numero_parcelas" type="number" min="1" max="360" defaultValue={1} required />
          <FieldError>{errors.numero_parcelas}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="primeiro_vencimento">Primeiro vencimento *</Label>
          <Input id="primeiro_vencimento" name="primeiro_vencimento" type="date" defaultValue={today} required />
          <FieldError>{errors.primeiro_vencimento}</FieldError>
        </FieldGroup>
      </div>

      {state.error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
        <Button type="button" variant="outline" href="/financeiro/contas-a-receber">Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Gerar cobrança
        </Button>
      </div>
    </form>
  );
}
