"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { honorarioSchema } from "@/lib/validations/honorario";
import { gerarReciboPdf } from "@/lib/pdf/recibo";
import { getEscritorioInfo } from "@/lib/data/config";
import type { ActionState } from "@/lib/actions/clientes";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function flattenErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) {
    if (val?.[0]) out[key] = val[0];
  }
  return out;
}

export async function createHonorarioAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = honorarioSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const { cliente_id, processo_id, descricao, tipo, valor_total, numero_parcelas, primeiro_vencimento } =
    parsed.data;

  const supabase = await createClient();
  const { data: honorario, error } = await supabase
    .from("honorarios")
    .insert({
      cliente_id,
      processo_id: processo_id || null,
      descricao,
      tipo,
      valor_total,
      numero_parcelas,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !honorario) {
    return { error: "Não foi possível criar a cobrança." };
  }

  const valorParcela = Math.round((valor_total / numero_parcelas) * 100) / 100;
  const diferenca = Math.round((valor_total - valorParcela * numero_parcelas) * 100) / 100;
  const baseDate = new Date(`${primeiro_vencimento}T12:00:00`);

  const parcelas = Array.from({ length: numero_parcelas }, (_, i) => ({
    honorario_id: honorario.id,
    numero_parcela: i + 1,
    valor: i === numero_parcelas - 1 ? valorParcela + diferenca : valorParcela,
    data_vencimento: addMonths(baseDate, i).toISOString().slice(0, 10),
  }));

  const { error: parcelasError } = await supabase.from("parcelas").insert(parcelas);
  if (parcelasError) {
    await supabase.from("honorarios").delete().eq("id", honorario.id);
    return { error: "Não foi possível gerar as parcelas." };
  }

  revalidatePath("/financeiro/contas-a-receber");
  revalidatePath("/dashboard");
  redirect(`/financeiro/contas-a-receber/${honorario.id}`);
}

export async function marcarParcelaPagaAction(formData: FormData) {
  await requireAdmin();
  const parcelaId = formData.get("parcela_id") as string;
  const formaPagamento = (formData.get("forma_pagamento") as string) || null;
  const dataPagamento = (formData.get("data_pagamento") as string) || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  await supabase
    .from("parcelas")
    .update({ status: "pago", data_pagamento: dataPagamento, forma_pagamento: formaPagamento })
    .eq("id", parcelaId);

  revalidatePath("/financeiro/contas-a-receber");
  revalidatePath("/dashboard");
}

export async function cancelarParcelaAction(parcelaId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("parcelas").update({ status: "cancelado" }).eq("id", parcelaId);
  revalidatePath("/financeiro/contas-a-receber");
}

export async function emitirReciboAction(parcelaId: string): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: parcela } = await supabase
    .from("parcelas")
    .select("*, honorarios(descricao, cliente_id, clientes(nome, cpf_cnpj_enc))")
    .eq("id", parcelaId)
    .single();

  if (!parcela || parcela.status !== "pago") {
    return { error: "Parcela não encontrada ou ainda não paga." };
  }

  const honorario = parcela.honorarios as unknown as {
    descricao: string;
    cliente_id: string;
    clientes: { nome: string } | null;
  };
  const clienteNome = honorario.clientes?.nome ?? "Cliente";

  const { data: cpfCnpj } = await supabase.rpc("get_cliente_documento", {
    p_cliente_id: honorario.cliente_id,
  });

  const { data: numeroRecibo } = await supabase.rpc("gerar_numero_recibo");
  if (!numeroRecibo) return { error: "Não foi possível gerar o número do recibo." };

  const escritorio = await getEscritorioInfo();

  const pdfBytes = await gerarReciboPdf({
    numeroRecibo,
    dataEmissao: new Date(),
    clienteNome,
    clienteCpfCnpj: cpfCnpj,
    valor: parcela.valor,
    descricao: honorario.descricao,
    formaPagamento: parcela.forma_pagamento,
    dataPagamento: parcela.data_pagamento,
    escritorio,
  });

  const path = `${honorario.cliente_id}/${numeroRecibo.replace("/", "-")}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("recibos")
    .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) return { error: "Falha ao gerar o PDF do recibo." };

  await supabase.from("recibos").insert({
    numero_recibo: numeroRecibo,
    parcela_id: parcelaId,
    cliente_id: honorario.cliente_id,
    valor: parcela.valor,
    descricao: honorario.descricao,
    pdf_storage_path: path,
  });

  const { data: signed } = await supabase.storage.from("recibos").createSignedUrl(path, 60 * 5);

  revalidatePath("/financeiro/contas-a-receber");
  return { url: signed?.signedUrl };
}
