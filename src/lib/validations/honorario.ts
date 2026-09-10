import { z } from "zod";

export const honorarioSchema = z.object({
  cliente_id: z.string().uuid("Selecione um cliente."),
  processo_id: z.string().uuid().optional().or(z.literal("")),
  descricao: z.string().min(3, "Descreva a cobrança."),
  tipo: z.enum(["fixo", "hora", "exito", "misto"]),
  valor_total: z.coerce.number().positive("Informe um valor válido."),
  numero_parcelas: z.coerce.number().int().min(1).max(360),
  primeiro_vencimento: z.string().min(1, "Informe a data do primeiro vencimento."),
});

export type HonorarioFormValues = z.infer<typeof honorarioSchema>;

export const despesaSchema = z.object({
  categoria: z.enum([
    "aluguel", "salario", "material_escritorio", "impostos", "software_assinaturas",
    "marketing", "contabilidade", "energia_agua_internet", "transporte", "outro",
  ]),
  descricao: z.string().min(3, "Descreva a despesa."),
  fornecedor: z.string().optional().or(z.literal("")),
  valor: z.coerce.number().positive("Informe um valor válido."),
  data_vencimento: z.string().min(1, "Informe a data de vencimento."),
  recorrente: z.coerce.boolean().optional(),
  observacoes: z.string().optional().or(z.literal("")),
});

export type DespesaFormValues = z.infer<typeof despesaSchema>;
