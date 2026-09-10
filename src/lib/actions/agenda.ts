"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import { eventoSchema } from "@/lib/validations/evento";
import { syncEventoToGoogle, deleteEventoFromGoogle, disconnectGoogleCalendar, isGoogleCalendarConnected } from "@/lib/google/calendar";
import type { ActionState } from "@/lib/actions/clientes";

function flattenErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(flat.fieldErrors)) {
    if (val?.[0]) out[key] = val[0];
  }
  return out;
}

export async function createEventoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventoSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const { data_fim, cliente_id, processo_id, ...rest } = parsed.data;
  const supabase = await createClient();
  const { data: evento, error } = await supabase
    .from("eventos_agenda")
    .insert({
      ...rest,
      data_fim: data_fim || null,
      cliente_id: cliente_id || null,
      processo_id: processo_id || null,
      responsavel_id: user.id,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error || !evento) {
    return { error: "Não foi possível criar o compromisso." };
  }

  if (await isGoogleCalendarConnected(user.id)) {
    const googleId = await syncEventoToGoogle(user.id, evento);
    if (googleId) {
      await supabase
        .from("eventos_agenda")
        .update({ google_event_id: googleId, sincronizado_em: new Date().toISOString() })
        .eq("id", evento.id);
    }
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  return {};
}

export async function marcarConcluidoAction(eventoId: string, concluido: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("eventos_agenda").update({ concluido }).eq("id", eventoId);
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function deleteEventoAction(eventoId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: evento } = await supabase
    .from("eventos_agenda")
    .select("google_event_id")
    .eq("id", eventoId)
    .single();

  if (evento?.google_event_id) {
    await deleteEventoFromGoogle(user.id, evento.google_event_id);
  }

  await supabase.from("eventos_agenda").delete().eq("id", eventoId);
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function desconectarGoogleAction() {
  const user = await requireUser();
  await disconnectGoogleCalendar(user.id);
  revalidatePath("/agenda");
}
