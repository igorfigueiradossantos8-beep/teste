"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays } from "lucide-react";
import { marcarConcluidoAction, deleteEventoAction } from "@/lib/actions/agenda";
import { formatDateTime } from "@/lib/utils";
import { TIPO_EVENTO_LABEL } from "@/lib/status";
import type { EventoAgenda } from "@/types/database.types";

type BadgeTone = "neutral" | "azul" | "dourado" | "verde" | "vermelho" | "amarelo";

const TIPO_TONE: Record<string, BadgeTone> = {
  prazo: "vermelho",
  audiencia: "azul",
  reuniao: "verde",
  diligencia: "dourado",
  outro: "neutral",
};

export function EventoList({
  eventos,
}: {
  eventos: (EventoAgenda & { clientes?: { nome: string } | null; processos?: { numero_processo: string | null } | null })[];
}) {
  const [isPending, startTransition] = useTransition();

  if (eventos.length === 0) {
    return (
      <div className="rounded-xl border border-bege-200 bg-branco">
        <EmptyState icon={CalendarDays} title="Nenhum compromisso agendado" description="Cadastre prazos, audiências e reuniões." />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-bege-100 rounded-xl border border-bege-200 bg-branco">
      {eventos.map((evento) => (
        <li key={evento.id} className={`flex items-start gap-3 px-5 py-4 ${evento.concluido ? "opacity-50" : ""}`}>
          <button
            onClick={() => startTransition(() => marcarConcluidoAction(evento.id, !evento.concluido))}
            disabled={isPending}
            className="mt-0.5 shrink-0 text-azul-800"
            title={evento.concluido ? "Reabrir" : "Marcar como concluído"}
          >
            {evento.concluido ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`font-medium text-azul-950 ${evento.concluido ? "line-through" : ""}`}>{evento.titulo}</p>
              <Badge tone={TIPO_TONE[evento.tipo] ?? "neutral"}>
                {TIPO_EVENTO_LABEL[evento.tipo]}
              </Badge>
              {evento.google_event_id && (
                <span title="Sincronizado com o Google Calendar" className="text-emerald-600">
                  <RefreshCw className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <p className="text-sm text-preto/60">{formatDateTime(evento.data_inicio)}</p>
            {(evento.clientes?.nome || evento.processos?.numero_processo) && (
              <p className="text-xs text-preto/40">
                {evento.clientes?.nome}
                {evento.clientes?.nome && evento.processos?.numero_processo && " · "}
                {evento.processos?.numero_processo}
              </p>
            )}
            {evento.local && <p className="text-xs text-preto/40">📍 {evento.local}</p>}
          </div>

          <button
            onClick={() => {
              if (confirm(`Excluir o compromisso "${evento.titulo}"?`)) {
                startTransition(() => deleteEventoAction(evento.id));
              }
            }}
            disabled={isPending}
            className="rounded-md p-1.5 text-red-700 hover:bg-red-50"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
