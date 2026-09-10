/**
 * Tipos gerados manualmente a partir do schema em supabase/migrations.
 * Ao evoluir o schema, regenerar preferencialmente com:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 */

export type UserRole = "admin" | "equipe";
export type TipoPessoa = "fisica" | "juridica";
export type StatusProcesso =
  | "ativo"
  | "suspenso"
  | "aguardando"
  | "recurso"
  | "arquivado"
  | "encerrado_ganho"
  | "encerrado_perdido"
  | "encerrado_acordo";
export type ModeloCobranca = "fixo" | "hora" | "exito" | "misto";
export type TipoDocumento =
  | "contrato"
  | "procuracao"
  | "peticao"
  | "comprovante"
  | "identificacao"
  | "outro";
export type TipoRegistroHistorico = "andamento" | "atendimento" | "anotacao" | "contato";
export type StatusParcela = "pendente" | "pago" | "atrasado" | "cancelado";
export type CategoriaDespesa =
  | "aluguel"
  | "salario"
  | "material_escritorio"
  | "impostos"
  | "software_assinaturas"
  | "marketing"
  | "contabilidade"
  | "energia_agua_internet"
  | "transporte"
  | "outro";
export type StatusDespesa = "pendente" | "pago" | "atrasado" | "cancelado";
export type TipoEvento = "prazo" | "audiencia" | "reuniao" | "diligencia" | "outro";
export type AcaoAuditoria =
  | "insert"
  | "update"
  | "delete"
  | "select_sensivel"
  | "login"
  | "logout";

export type Endereco = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type Cliente = {
  id: string;
  nome: string;
  tipo_pessoa: TipoPessoa;
  cpf_cnpj_enc: string | null;
  cpf_cnpj_hash: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco: Endereco | null;
  profissao_ou_ramo: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type Processo = {
  id: string;
  cliente_id: string;
  numero_processo: string | null;
  area_direito: string;
  status: StatusProcesso;
  instancia: string | null;
  vara_tribunal: string | null;
  comarca_uf: string | null;
  data_distribuicao: string | null;
  parte_contraria: string | null;
  descricao: string | null;
  modelo_cobranca: ModeloCobranca;
  valor_fixo: number | null;
  valor_hora: number | null;
  percentual_exito: number | null;
  valor_causa: number | null;
  responsavel_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type Documento = {
  id: string;
  cliente_id: string | null;
  processo_id: string | null;
  nome: string;
  tipo: TipoDocumento;
  storage_path: string;
  tamanho_bytes: number | null;
  mime_type: string | null;
  descricao: string | null;
  uploaded_by: string | null;
  created_at: string;
  deleted_at: string | null;
}

export type Historico = {
  id: string;
  cliente_id: string | null;
  processo_id: string | null;
  tipo: TipoRegistroHistorico;
  titulo: string | null;
  descricao: string;
  data_evento: string;
  autor_id: string | null;
  created_at: string;
}

export type Honorario = {
  id: string;
  cliente_id: string;
  processo_id: string | null;
  descricao: string;
  tipo: ModeloCobranca;
  valor_total: number;
  numero_parcelas: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type Parcela = {
  id: string;
  honorario_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusParcela;
  forma_pagamento: string | null;
  comprovante_path: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type Despesa = {
  id: string;
  categoria: CategoriaDespesa;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusDespesa;
  forma_pagamento: string | null;
  comprovante_path: string | null;
  recorrente: boolean;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type Recibo = {
  id: string;
  numero_recibo: string;
  parcela_id: string | null;
  cliente_id: string;
  valor: number;
  descricao: string | null;
  data_emissao: string;
  pdf_storage_path: string | null;
  emitido_por: string | null;
  created_at: string;
}

export type EventoAgenda = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoEvento;
  data_inicio: string;
  data_fim: string | null;
  dia_inteiro: boolean;
  local: string | null;
  processo_id: string | null;
  cliente_id: string | null;
  responsavel_id: string | null;
  google_event_id: string | null;
  google_calendar_id: string | null;
  sincronizado_em: string | null;
  concluido: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type AuditLog = {
  id: number;
  user_id: string | null;
  acao: AcaoAuditoria;
  tabela: string;
  registro_id: string | null;
  dados_anteriores: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Configuracao = {
  chave: string;
  valor: unknown;
  updated_at: string;
}

export type GoogleCalendarToken = {
  user_id: string;
  access_token_enc: string;
  refresh_token_enc: string;
  scope: string | null;
  token_type: string | null;
  expiry_date: string | null;
  google_calendar_id: string | null;
  created_at: string;
  updated_at: string;
}

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type TableDef<Row, Insert, Update = Partial<Insert>, Rel extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rel;
};

// Estrutura compatível com o client genérico do supabase-js/ssr (GenericSchema).
// Ao evoluir o schema, regenerar preferencialmente com o CLI do Supabase.
export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, Partial<Profile> & { id: string; full_name: string; email: string }>;
      clientes: TableDef<Cliente, Partial<Cliente> & { nome: string }>;
      processos: TableDef<
        Processo,
        Partial<Processo> & { cliente_id: string; area_direito: string },
        Partial<Processo>,
        [{ foreignKeyName: "processos_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] }]
      >;
      documentos: TableDef<
        Documento,
        Partial<Documento> & { nome: string; storage_path: string },
        Partial<Documento>,
        [
          { foreignKeyName: "documentos_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] },
          { foreignKeyName: "documentos_processo_id_fkey"; columns: ["processo_id"]; isOneToOne: false; referencedRelation: "processos"; referencedColumns: ["id"] },
        ]
      >;
      historico: TableDef<
        Historico,
        Partial<Historico> & { descricao: string },
        Partial<Historico>,
        [
          { foreignKeyName: "historico_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] },
          { foreignKeyName: "historico_processo_id_fkey"; columns: ["processo_id"]; isOneToOne: false; referencedRelation: "processos"; referencedColumns: ["id"] },
          { foreignKeyName: "historico_autor_id_fkey"; columns: ["autor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      >;
      honorarios: TableDef<
        Honorario,
        Partial<Honorario> & { cliente_id: string; descricao: string; valor_total: number },
        Partial<Honorario>,
        [
          { foreignKeyName: "honorarios_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] },
          { foreignKeyName: "honorarios_processo_id_fkey"; columns: ["processo_id"]; isOneToOne: false; referencedRelation: "processos"; referencedColumns: ["id"] },
        ]
      >;
      parcelas: TableDef<
        Parcela,
        Partial<Parcela> & { honorario_id: string; valor: number; data_vencimento: string },
        Partial<Parcela>,
        [{ foreignKeyName: "parcelas_honorario_id_fkey"; columns: ["honorario_id"]; isOneToOne: false; referencedRelation: "honorarios"; referencedColumns: ["id"] }]
      >;
      despesas: TableDef<Despesa, Partial<Despesa> & { descricao: string; valor: number; data_vencimento: string }>;
      recibos: TableDef<
        Recibo,
        Partial<Recibo> & { numero_recibo: string; cliente_id: string; valor: number },
        Partial<Recibo>,
        [
          { foreignKeyName: "recibos_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] },
          { foreignKeyName: "recibos_parcela_id_fkey"; columns: ["parcela_id"]; isOneToOne: false; referencedRelation: "parcelas"; referencedColumns: ["id"] },
        ]
      >;
      eventos_agenda: TableDef<
        EventoAgenda,
        Partial<EventoAgenda> & { titulo: string; data_inicio: string },
        Partial<EventoAgenda>,
        [
          { foreignKeyName: "eventos_agenda_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] },
          { foreignKeyName: "eventos_agenda_processo_id_fkey"; columns: ["processo_id"]; isOneToOne: false; referencedRelation: "processos"; referencedColumns: ["id"] },
          { foreignKeyName: "eventos_agenda_responsavel_id_fkey"; columns: ["responsavel_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      >;
      audit_logs: TableDef<AuditLog, Partial<AuditLog>>;
      configuracoes: TableDef<Configuracao, Configuracao>;
      google_calendar_tokens: TableDef<GoogleCalendarToken, Partial<GoogleCalendarToken> & { user_id: string; access_token_enc: string; refresh_token_enc: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      set_cliente_documento: { Args: { p_cliente_id: string; p_documento: string }; Returns: void };
      get_cliente_documento: { Args: { p_cliente_id: string }; Returns: string | null };
      gerar_numero_recibo: { Args: Record<PropertyKey, never>; Returns: string };
      atualizar_status_inadimplencia: { Args: Record<PropertyKey, never>; Returns: void };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      set_google_tokens: {
        Args: {
          p_access_token: string;
          p_refresh_token: string;
          p_scope: string;
          p_token_type: string;
          p_expiry_date: string;
          p_calendar_id?: string;
        };
        Returns: void;
      };
      get_google_tokens: {
        Args: { p_user_id: string };
        Returns: { access_token: string | null; refresh_token: string | null; expiry_date: string | null; google_calendar_id: string | null }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
