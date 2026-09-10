"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/clientes";
import type { Cliente } from "@/types/database.types";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function ClienteForm({
  action,
  cliente,
  cpfCnpjAtual,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  cliente?: Cliente;
  cpfCnpjAtual?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="nome">Nome completo / Razão social *</Label>
          <Input id="nome" name="nome" required defaultValue={cliente?.nome} />
          <FieldError>{errors.nome}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="tipo_pessoa">Tipo de pessoa *</Label>
          <Select id="tipo_pessoa" name="tipo_pessoa" defaultValue={cliente?.tipo_pessoa ?? "fisica"}>
            <option value="fisica">Pessoa física</option>
            <option value="juridica">Pessoa jurídica</option>
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
          <Input id="cpf_cnpj" name="cpf_cnpj" defaultValue={cpfCnpjAtual ?? ""} placeholder="Somente números" />
          <p className="mt-1 text-xs text-preto/50">Armazenado criptografado no banco.</p>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={cliente?.email ?? ""} />
          <FieldError>{errors.email}</FieldError>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" defaultValue={cliente?.telefone ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={cliente?.whatsapp ?? ""} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="profissao_ou_ramo">Profissão / Ramo de atividade</Label>
          <Input id="profissao_ou_ramo" name="profissao_ou_ramo" defaultValue={cliente?.profissao_ou_ramo ?? ""} />
        </FieldGroup>
      </div>

      <div className="mt-2 mb-4 border-t border-bege-100 pt-4">
        <p className="mb-3 text-sm font-medium text-azul-900">Endereço</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" name="logradouro" defaultValue={cliente?.endereco?.logradouro ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" defaultValue={cliente?.endereco?.numero ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" defaultValue={cliente?.endereco?.complemento ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" defaultValue={cliente?.endereco?.bairro ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" defaultValue={cliente?.endereco?.cidade ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="uf">UF</Label>
            <Select id="uf" name="uf" defaultValue={cliente?.endereco?.uf ?? ""}>
              <option value="">—</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" defaultValue={cliente?.endereco?.cep ?? ""} />
          </FieldGroup>
        </div>
      </div>

      <FieldGroup>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" defaultValue={cliente?.observacoes ?? ""} />
      </FieldGroup>

      {state.error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
        <Button type="button" variant="outline" href="/clientes">Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar cliente
        </Button>
      </div>
    </form>
  );
}
