import type { StatusDespesa, StatusParcela, StatusProcesso } from "@/types/database.types";

export const STATUS_PROCESSO_LABEL: Record<StatusProcesso, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  aguardando: "Aguardando",
  recurso: "Em recurso",
  arquivado: "Arquivado",
  encerrado_ganho: "Encerrado (êxito)",
  encerrado_perdido: "Encerrado (improcedente)",
  encerrado_acordo: "Encerrado (acordo)",
};

export const STATUS_PROCESSO_TONE: Record<StatusProcesso, "azul" | "dourado" | "verde" | "vermelho" | "neutral" | "amarelo"> = {
  ativo: "azul",
  suspenso: "amarelo",
  aguardando: "amarelo",
  recurso: "dourado",
  arquivado: "neutral",
  encerrado_ganho: "verde",
  encerrado_perdido: "vermelho",
  encerrado_acordo: "verde",
};

export const STATUS_PARCELA_LABEL: Record<StatusParcela, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const STATUS_PARCELA_TONE: Record<StatusParcela, "azul" | "verde" | "vermelho" | "neutral"> = {
  pendente: "azul",
  pago: "verde",
  atrasado: "vermelho",
  cancelado: "neutral",
};

export const STATUS_DESPESA_LABEL: Record<StatusDespesa, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const STATUS_DESPESA_TONE = STATUS_PARCELA_TONE as Record<StatusDespesa, "azul" | "verde" | "vermelho" | "neutral">;

export const CATEGORIA_DESPESA_LABEL: Record<string, string> = {
  aluguel: "Aluguel",
  salario: "Salários",
  material_escritorio: "Material de escritório",
  impostos: "Impostos",
  software_assinaturas: "Softwares/assinaturas",
  marketing: "Marketing",
  contabilidade: "Contabilidade",
  energia_agua_internet: "Energia/água/internet",
  transporte: "Transporte",
  outro: "Outro",
};

export const MODELO_COBRANCA_LABEL: Record<string, string> = {
  fixo: "Valor fixo",
  hora: "Por hora",
  exito: "% de êxito",
  misto: "Combinado",
};

export const TIPO_EVENTO_LABEL: Record<string, string> = {
  prazo: "Prazo",
  audiencia: "Audiência",
  reuniao: "Reunião",
  diligencia: "Diligência",
  outro: "Outro",
};

export const TIPO_DOCUMENTO_LABEL: Record<string, string> = {
  contrato: "Contrato",
  procuracao: "Procuração",
  peticao: "Petição",
  comprovante: "Comprovante",
  identificacao: "Identificação",
  outro: "Outro",
};
