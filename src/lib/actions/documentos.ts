"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import type { TipoDocumento } from "@/types/database.types";

export interface UploadState {
  error?: string;
}

export async function uploadDocumentoAction(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const user = await requireUser();
  const file = formData.get("file") as File | null;
  const cliente_id = (formData.get("cliente_id") as string) || null;
  const processo_id = (formData.get("processo_id") as string) || null;
  const tipo = (formData.get("tipo") as TipoDocumento) || "outro";
  const descricao = (formData.get("descricao") as string) || null;

  if (!file || file.size === 0) {
    return { error: "Selecione um arquivo." };
  }
  if (!cliente_id && !processo_id) {
    return { error: "Documento precisa estar vinculado a um cliente ou processo." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${cliente_id ?? "sem-cliente"}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Falha ao enviar o arquivo. Tente novamente." };
  }

  const { error: dbError } = await supabase.from("documentos").insert({
    cliente_id,
    processo_id,
    nome: file.name,
    tipo,
    storage_path: path,
    tamanho_bytes: file.size,
    mime_type: file.type,
    descricao,
    uploaded_by: user.id,
  });

  if (dbError) {
    await supabase.storage.from("documentos").remove([path]);
    return { error: "Falha ao registrar o documento." };
  }

  if (cliente_id) revalidatePath(`/clientes/${cliente_id}`);
  if (processo_id) revalidatePath(`/processos/${processo_id}`);

  return {};
}

export async function getDocumentoUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("documentos")
    .createSignedUrl(storagePath, 60 * 5);
  return data?.signedUrl ?? null;
}

export async function deleteDocumentoAction(
  documentoId: string,
  storagePath: string,
  vinculo: { cliente_id: string | null; processo_id: string | null },
) {
  await requireUser();
  const supabase = await createClient();
  await supabase.storage.from("documentos").remove([storagePath]);
  await supabase.from("documentos").delete().eq("id", documentoId);

  if (vinculo.cliente_id) revalidatePath(`/clientes/${vinculo.cliente_id}`);
  if (vinculo.processo_id) revalidatePath(`/processos/${vinculo.processo_id}`);
}
