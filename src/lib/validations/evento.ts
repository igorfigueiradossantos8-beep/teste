import { z } from "zod";

export const eventoSchema = z.object({
  titulo: z.string().min(2, "Informe um título."),
  tipo: z.enum(["prazo", "audiencia", "reuniao", "diligencia", "outro"]),
  data_inicio: z.string().min(1, "Informe a data/hora de início."),
  data_fim: z.string().optional().or(z.literal("")),
  local: z.string().optional().or(z.literal("")),
  descricao: z.string().optional().or(z.literal("")),
  cliente_id: z.string().uuid().optional().or(z.literal("")),
  processo_id: z.string().uuid().optional().or(z.literal("")),
});

export type EventoFormValues = z.infer<typeof eventoSchema>;
