"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/clientes";
import type { Processo } from "@/types/database.types";
import { STATUS_PROCESSO_LABEL, MODELO_COBRANCA_LABEL } from "@/lib/status";

export function ProcessoForm({
  action,
  processo,
  clientes,
  areasDireito,
  clienteIdFixo,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  processo?: Processo;
  clientes: { id: string; nome: string }[];
  areasDireito: string[];
  clienteIdFixo?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const errors = state.fieldErrors ?? {};
  const [modelo, setModelo] = useState(processo?.modelo_cobranca ?? "fixo");

  return (
    <form action={formAction} className="space-y-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="cliente_id">Cliente *</Label>
          {clienteIdFixo ? (
            <input type="hidden" name="cliente_id" value={clienteIdFixo} />
          ) : (
            <Select id="cliente_id" name="cliente_id" required defaultValue={processo?.cliente_id ?? ""}>
              <option value="" disabled>Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </Select>
          )}
          <FieldError>{errors.cliente_id}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="area_direito">Área do direito *</Label>
          <Input id="area_direito" name="area_direito" list="areas-direito" required
            defaultValue={processo?.area_direito ?? ""} />
          <datalist id="areas-direito">
            {areasDireito.map((a) => <option key={a} value={a} />)}
          </datalist>
          <FieldError>{errors.area_direito}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="status">Status *</Label>
          <Select id="status" name="status" defaultValue={processo?.status ?? "ativo"}>
            {Object.entries(STATUS_PROCESSO_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="numero_processo">Número do processo</Label>
          <Input id="numero_processo" name="numero_processo" placeholder="0000000-00.0000.0.00.0000"
            defaultValue={processo?.numero_processo ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="data_distribuicao">Data de distribuição</Label>
          <Input id="data_distribuicao" name="data_distribuicao" type="date"
            defaultValue={processo?.data_distribuicao ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="instancia">Instância</Label>
          <Input id="instancia" name="instancia" defaultValue={processo?.instancia ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="vara_tribunal">Vara / Tribunal</Label>
          <Input id="vara_tribunal" name="vara_tribunal" defaultValue={processo?.vara_tribunal ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="comarca_uf">Comarca / UF</Label>
          <Input id="comarca_uf" name="comarca_uf" defaultValue={processo?.comarca_uf ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="parte_contraria">Parte contrária</Label>
          <Input id="parte_contraria" name="parte_contraria" defaultValue={processo?.parte_contraria ?? ""} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="descricao">Descrição / objeto</Label>
        <Textarea id="descricao" name="descricao" defaultValue={processo?.descricao ?? ""} />
      </FieldGroup>

      <div className="mt-2 mb-4 rounded-lg border border-dourado-300/60 bg-dourado-300/10 p-4">
        <p className="mb-3 text-sm font-medium text-azul-900">Modelo de cobrança</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="modelo_cobranca">Modelo *</Label>
            <Select
              id="modelo_cobranca"
              name="modelo_cobranca"
              defaultValue={modelo}
              onChange={(e) => setModelo(e.target.value as typeof modelo)}
            >
              {Object.entries(MODELO_COBRANCA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="valor_causa">Valor da causa</Label>
            <Input id="valor_causa" name="valor_causa" type="number" step="0.01" min="0"
              defaultValue={processo?.valor_causa ?? ""} />
          </FieldGroup>

          {(modelo === "fixo" || modelo === "misto") && (
            <FieldGroup>
              <Label htmlFor="valor_fixo">Valor fixo (R$)</Label>
              <Input id="valor_fixo" name="valor_fixo" type="number" step="0.01" min="0"
                defaultValue={processo?.valor_fixo ?? ""} />
            </FieldGroup>
          )}

          {(modelo === "hora" || modelo === "misto") && (
            <FieldGroup>
              <Label htmlFor="valor_hora">Valor por hora (R$)</Label>
              <Input id="valor_hora" name="valor_hora" type="number" step="0.01" min="0"
                defaultValue={processo?.valor_hora ?? ""} />
            </FieldGroup>
          )}

          {(modelo === "exito" || modelo === "misto") && (
            <FieldGroup>
              <Label htmlFor="percentual_exito">% de êxito</Label>
              <Input id="percentual_exito" name="percentual_exito" type="number" step="0.01" min="0" max="100"
                defaultValue={processo?.percentual_exito ?? ""} />
            </FieldGroup>
          )}
        </div>
      </div>

      {state.error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
        <Button type="button" variant="outline" href="/processos">Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar processo
        </Button>
      </div>
    </form>
  );
}
