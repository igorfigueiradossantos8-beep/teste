"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";

export async function addHistoricoAction(formData: FormData) {
  const user = await requireUser();
  const cliente_id = (formData.get("cliente_id") as string) || null;
  const processo_id = (formData.get("processo_id") as string) || null;
  const tipo = formData.get("tipo") as string;
  const titulo = (formData.get("titulo") as string) || null;
  const descricao = formData.get("descricao") as string;

  if (!descricao?.trim()) return;

  const supabase = await createClient();
  await supabase.from("historico").insert({
    cliente_id,
    processo_id,
    tipo: tipo as "andamento" | "atendimento" | "anotacao" | "contato",
    titulo,
    descricao,
    autor_id: user.id,
  });

  if (cliente_id) revalidatePath(`/clientes/${cliente_id}`);
  if (processo_id) revalidatePath(`/processos/${processo_id}`);
}
