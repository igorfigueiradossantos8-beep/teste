"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { despesaSchema } from "@/lib/validations/honorario";
import type { ActionState } from "@/lib/actions/clientes";

function flattenErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) {
    if (val?.[0]) out[key] = val[0];
  }
  return out;
}

export async function createDespesaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = despesaSchema.safeParse({ ...raw, recorrente: formData.get("recorrente") === "on" });

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("despesas").insert({
    ...parsed.data,
    created_by: admin.id,
  });

  if (error) {
    return { error: "Não foi possível salvar a despesa." };
  }

  revalidatePath("/financeiro/contas-a-pagar");
  revalidatePath("/dashboard");
  redirect("/financeiro/contas-a-pagar");
}

export async function marcarDespesaPagaAction(formData: FormData) {
  await requireAdmin();
  const despesaId = formData.get("despesa_id") as string;
  const formaPagamento = (formData.get("forma_pagamento") as string) || null;
  const dataPagamento = (formData.get("data_pagamento") as string) || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  await supabase
    .from("despesas")
    .update({ status: "pago", data_pagamento: dataPagamento, forma_pagamento: formaPagamento })
    .eq("id", despesaId);

  revalidatePath("/financeiro/contas-a-pagar");
  revalidatePath("/dashboard");
}

export async function excluirDespesaAction(despesaId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("despesas").delete().eq("id", despesaId);
  revalidatePath("/financeiro/contas-a-pagar");
}
