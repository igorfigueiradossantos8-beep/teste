import "server-only";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function getGoogleAuthUrl(state: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function handleGoogleCallback(code: string, userId: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);

  const supabase = await createClient();
  await supabase.rpc("set_google_tokens", {
    p_access_token: tokens.access_token ?? "",
    p_refresh_token: tokens.refresh_token ?? "",
    p_scope: tokens.scope ?? SCOPES.join(" "),
    p_token_type: tokens.token_type ?? "Bearer",
    p_expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : new Date(Date.now() + 3600_000).toISOString(),
    p_calendar_id: "primary",
  });

  void userId;
}

async function getAuthorizedClientForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_google_tokens", { p_user_id: userId });
  const tokenRow = data?.[0];

  if (error || !tokenRow?.refresh_token) {
    return null;
  }

  const client = getOAuth2Client();
  client.setCredentials({
    access_token: tokenRow.access_token ?? undefined,
    refresh_token: tokenRow.refresh_token,
    expiry_date: tokenRow.expiry_date ? new Date(tokenRow.expiry_date).getTime() : undefined,
  });

  client.on("tokens", async (newTokens) => {
    if (!newTokens.access_token) return;
    await supabase.rpc("set_google_tokens", {
      p_access_token: newTokens.access_token,
      p_refresh_token: newTokens.refresh_token ?? tokenRow.refresh_token!,
      p_scope: newTokens.scope ?? SCOPES.join(" "),
      p_token_type: newTokens.token_type ?? "Bearer",
      p_expiry_date: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : new Date(Date.now() + 3600_000).toISOString(),
      p_calendar_id: tokenRow.google_calendar_id ?? "primary",
    });
  });

  return { client, calendarId: tokenRow.google_calendar_id ?? "primary" };
}

export async function isGoogleCalendarConnected(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_google_tokens", { p_user_id: userId });
  return Boolean(data?.[0]?.refresh_token);
}

export interface EventoParaSincronizar {
  id: string;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  google_event_id: string | null;
}

/** Cria ou atualiza o evento no Google Calendar do usuário. Retorna o google_event_id. */
export async function syncEventoToGoogle(userId: string, evento: EventoParaSincronizar): Promise<string | null> {
  const authorized = await getAuthorizedClientForUser(userId);
  if (!authorized) return null;

  const calendar = google.calendar({ version: "v3", auth: authorized.client });
  const dataFim = evento.data_fim ?? new Date(new Date(evento.data_inicio).getTime() + 60 * 60 * 1000).toISOString();

  const requestBody = {
    summary: evento.titulo,
    description: evento.descricao ?? undefined,
    location: evento.local ?? undefined,
    start: { dateTime: evento.data_inicio },
    end: { dateTime: dataFim },
  };

  if (evento.google_event_id) {
    const { data } = await calendar.events.update({
      calendarId: authorized.calendarId,
      eventId: evento.google_event_id,
      requestBody,
    });
    return data.id ?? evento.google_event_id;
  }

  const { data } = await calendar.events.insert({
    calendarId: authorized.calendarId,
    requestBody,
  });
  return data.id ?? null;
}

export async function deleteEventoFromGoogle(userId: string, googleEventId: string): Promise<void> {
  const authorized = await getAuthorizedClientForUser(userId);
  if (!authorized) return;

  const calendar = google.calendar({ version: "v3", auth: authorized.client });
  try {
    await calendar.events.delete({ calendarId: authorized.calendarId, eventId: googleEventId });
  } catch {
    // evento pode já ter sido removido diretamente no Google Calendar
  }
}

export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("google_calendar_tokens").delete().eq("user_id", userId);
}
