import { z } from "zod";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().optional(),
);

export const processoSchema = z.object({
  cliente_id: z.string().uuid("Selecione um cliente."),
  numero_processo: z.string().optional().or(z.literal("")),
  area_direito: z.string().min(2, "Informe a área do direito."),
  status: z.enum([
    "ativo", "suspenso", "aguardando", "recurso", "arquivado",
    "encerrado_ganho", "encerrado_perdido", "encerrado_acordo",
  ]),
  instancia: z.string().optional().or(z.literal("")),
  vara_tribunal: z.string().optional().or(z.literal("")),
  comarca_uf: z.string().optional().or(z.literal("")),
  data_distribuicao: z.string().optional().or(z.literal("")),
  parte_contraria: z.string().optional().or(z.literal("")),
  descricao: z.string().optional().or(z.literal("")),
  modelo_cobranca: z.enum(["fixo", "hora", "exito", "misto"]),
  valor_fixo: optionalNumber,
  valor_hora: optionalNumber,
  percentual_exito: optionalNumber,
  valor_causa: optionalNumber,
});

export type ProcessoFormValues = z.infer<typeof processoSchema>;
