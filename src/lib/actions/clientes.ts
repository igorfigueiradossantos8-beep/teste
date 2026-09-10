"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import { clienteSchema } from "@/lib/validations/cliente";

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function parseCliente(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = clienteSchema.safeParse(raw);
  return parsed;
}

export async function createClienteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseCliente(formData);

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const { cpf_cnpj, logradouro, numero, complemento, bairro, cidade, uf, cep, ...rest } =
    parsed.data;

  const supabase = await createClient();
  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert({
      ...rest,
      endereco: { logradouro, numero, complemento, bairro, cidade, uf, cep },
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !cliente) {
    return { error: "Não foi possível salvar o cliente. Tente novamente." };
  }

  if (cpf_cnpj) {
    await supabase.rpc("set_cliente_documento", {
      p_cliente_id: cliente.id,
      p_documento: cpf_cnpj,
    });
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}`);
}

export async function updateClienteAction(
  clienteId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = parseCliente(formData);

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const { cpf_cnpj, logradouro, numero, complemento, bairro, cidade, uf, cep, ...rest } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({
      ...rest,
      endereco: { logradouro, numero, complemento, bairro, cidade, uf, cep },
    })
    .eq("id", clienteId);

  if (error) {
    return { error: "Não foi possível atualizar o cliente." };
  }

  if (cpf_cnpj) {
    await supabase.rpc("set_cliente_documento", { p_cliente_id: clienteId, p_documento: cpf_cnpj });
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
  redirect(`/clientes/${clienteId}`);
}

export async function arquivarClienteAction(clienteId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase
    .from("clientes")
    .update({ ativo: false, deleted_at: new Date().toISOString() })
    .eq("id", clienteId);

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function getClienteDocumento(clienteId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_cliente_documento", {
    p_cliente_id: clienteId,
  });
  if (error) return null;
  return data as string | null;
}

function flattenErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) {
    if (val?.[0]) out[key] = val[0];
  }
  return out;
}
