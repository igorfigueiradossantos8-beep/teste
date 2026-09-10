"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import { processoSchema } from "@/lib/validations/processo";
import type { ActionState } from "@/lib/actions/clientes";

function parseProcesso(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return processoSchema.safeParse(raw);
}

function flattenErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) {
    if (val?.[0]) out[key] = val[0];
  }
  return out;
}

export async function createProcessoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseProcesso(formData);

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const { data_distribuicao, ...rest } = parsed.data;
  const supabase = await createClient();
  const { data: processo, error } = await supabase
    .from("processos")
    .insert({
      ...rest,
      data_distribuicao: data_distribuicao || null,
      created_by: user.id,
      responsavel_id: user.id,
    })
    .select("id")
    .single();

  if (error || !processo) {
    return { error: "Não foi possível salvar o processo. Tente novamente." };
  }

  revalidatePath("/processos");
  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  redirect(`/processos/${processo.id}`);
}

export async function updateProcessoAction(
  processoId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = parseProcesso(formData);

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const { data_distribuicao, ...rest } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("processos")
    .update({ ...rest, data_distribuicao: data_distribuicao || null })
    .eq("id", processoId);

  if (error) {
    return { error: "Não foi possível atualizar o processo." };
  }

  revalidatePath("/processos");
  revalidatePath(`/processos/${processoId}`);
  redirect(`/processos/${processoId}`);
}

export async function arquivarProcessoAction(processoId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase
    .from("processos")
    .update({ status: "arquivado" })
    .eq("id", processoId);

  revalidatePath("/processos");
  revalidatePath(`/processos/${processoId}`);
}
