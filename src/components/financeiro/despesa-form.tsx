"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createDespesaAction } from "@/lib/actions/despesas";
import type { ActionState } from "@/lib/actions/clientes";
import { CATEGORIA_DESPESA_LABEL } from "@/lib/status";

export function DespesaForm() {
  const [state, formAction, pending] = useActionState(createDespesaAction, {} as ActionState);
  const errors = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select id="categoria" name="categoria" defaultValue="outro">
            {Object.entries(CATEGORIA_DESPESA_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="fornecedor">Fornecedor / beneficiário</Label>
          <Input id="fornecedor" name="fornecedor" />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input id="descricao" name="descricao" required />
          <FieldError>{errors.descricao}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input id="valor" name="valor" type="number" step="0.01" min="0.01" required />
          <FieldError>{errors.valor}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="data_vencimento">Data de vencimento *</Label>
          <Input id="data_vencimento" name="data_vencimento" type="date" defaultValue={today} required />
          <FieldError>{errors.data_vencimento}</FieldError>
        </FieldGroup>
      </div>

      <label className="mb-4 flex items-center gap-2 text-sm text-preto/70">
        <input type="checkbox" name="recorrente" className="h-4 w-4 rounded border-bege-300" />
        Despesa recorrente (mensal)
      </label>

      <FieldGroup>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" />
      </FieldGroup>

      {state.error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
        <Button type="button" variant="outline" href="/financeiro/contas-a-pagar">Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar despesa
        </Button>
      </div>
    </form>
  );
}
