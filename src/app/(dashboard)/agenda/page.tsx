import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/permissions";
import { isGoogleCalendarConnected } from "@/lib/google/calendar";
import { PageHeader } from "@/components/layout/page-header";
import { EventoForm } from "@/components/agenda/evento-form";
import { EventoList } from "@/components/agenda/evento-list";
import { GoogleConnectCard } from "@/components/agenda/google-connect-card";

export const metadata = { title: "Agenda" };

const GOOGLE_MENSAGENS: Record<string, string> = {
  conectado: "Google Calendar conectado com sucesso.",
  erro: "Não foi possível conectar ao Google Calendar. Tente novamente.",
  cancelado: "Conexão com o Google Calendar cancelada.",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const profile = await requireUser();
  const supabase = await createClient();

  const [{ data: eventos }, { data: clientes }, { data: processos }, connected] = await Promise.all([
    supabase
      .from("eventos_agenda")
      .select("*, clientes(nome), processos(numero_processo)")
      .order("data_inicio", { ascending: true }),
    supabase.from("clientes").select("id, nome").is("deleted_at", null).order("nome"),
    supabase.from("processos").select("id, numero_processo, area_direito").is("deleted_at", null),
    isGoogleCalendarConnected(profile.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Prazos, audiências e compromissos do escritório."
        action={<EventoForm clientes={clientes ?? []} processos={processos ?? []} />}
      />

      {google && GOOGLE_MENSAGENS[google] && (
        <div className="mb-4 rounded-md bg-dourado-300/20 px-4 py-3 text-sm text-azul-950">
          {GOOGLE_MENSAGENS[google]}
        </div>
      )}

      <GoogleConnectCard connected={connected} />

      <EventoList eventos={eventos ?? []} />
    </div>
  );
}
