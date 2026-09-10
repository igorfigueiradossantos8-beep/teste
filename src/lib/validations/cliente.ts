import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo ou razão social."),
  tipo_pessoa: z.enum(["fisica", "juridica"]),
  cpf_cnpj: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  profissao_ou_ramo: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  logradouro: z.string().optional().or(z.literal("")),
  numero: z.string().optional().or(z.literal("")),
  complemento: z.string().optional().or(z.literal("")),
  bairro: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  uf: z.string().max(2).optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
