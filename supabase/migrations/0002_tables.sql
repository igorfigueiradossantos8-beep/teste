-- ============================================================================
-- Advocacia FB — 0002: tabelas principais
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: estende auth.users com dados de perfil e role
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role public.user_role not null default 'equipe',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfis de usuários internos do escritório (advogado admin e equipe/secretária).';

-- ----------------------------------------------------------------------------
-- clientes
-- ----------------------------------------------------------------------------
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo_pessoa public.tipo_pessoa not null default 'fisica',
  cpf_cnpj_enc bytea,                 -- CPF/CNPJ criptografado (pgcrypto)
  cpf_cnpj_hash text,                 -- hash determinístico p/ busca/duplicidade
  email text,
  telefone text,
  whatsapp text,
  endereco jsonb,                     -- {logradouro, numero, complemento, bairro, cidade, uf, cep}
  profissao_ou_ramo text,
  observacoes text,
  ativo boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                -- soft delete (retenção/LGPD)
);

create index clientes_nome_idx on public.clientes using gin (to_tsvector('portuguese', nome));
create index clientes_cpf_cnpj_hash_idx on public.clientes (cpf_cnpj_hash);
create index clientes_deleted_at_idx on public.clientes (deleted_at);

comment on table public.clientes is 'Clientes do escritório. CPF/CNPJ armazenado criptografado (cpf_cnpj_enc).';

-- ----------------------------------------------------------------------------
-- processos
-- ----------------------------------------------------------------------------
create table public.processos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  numero_processo text,                 -- CNJ ou identificador interno, pode ser nulo (ex: consultoria)
  area_direito text not null,           -- Civil, Trabalhista, Tributário, Penal, Família, Empresarial, etc.
  status public.status_processo not null default 'ativo',
  instancia text,                       -- 1ª instância, 2ª instância, STJ, STF...
  vara_tribunal text,
  comarca_uf text,
  data_distribuicao date,
  parte_contraria text,
  descricao text,
  -- modelo de cobrança configurável (pode combinar fixo + hora + êxito quando 'misto')
  modelo_cobranca public.modelo_cobranca not null default 'fixo',
  valor_fixo numeric(14,2),
  valor_hora numeric(14,2),
  percentual_exito numeric(5,2),        -- ex: 20.00 = 20%
  valor_causa numeric(14,2),
  responsavel_id uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index processos_cliente_id_idx on public.processos (cliente_id);
create index processos_status_idx on public.processos (status);
create index processos_numero_idx on public.processos (numero_processo);
create index processos_deleted_at_idx on public.processos (deleted_at);

comment on table public.processos is 'Processos/casos jurídicos vinculados a um cliente, com modelo de cobrança configurável.';

-- ----------------------------------------------------------------------------
-- documentos (metadados; arquivo físico fica no Supabase Storage)
-- ----------------------------------------------------------------------------
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete cascade,
  processo_id uuid references public.processos(id) on delete cascade,
  nome text not null,
  tipo public.tipo_documento not null default 'outro',
  storage_path text not null,           -- caminho no bucket 'documentos'
  tamanho_bytes bigint,
  mime_type text,
  descricao text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint documentos_vinculo_check check (cliente_id is not null or processo_id is not null)
);

create index documentos_cliente_id_idx on public.documentos (cliente_id);
create index documentos_processo_id_idx on public.documentos (processo_id);

comment on table public.documentos is 'Metadados de documentos anexados (contratos, procurações, petições); binário no Storage.';

-- ----------------------------------------------------------------------------
-- historico: atendimentos, andamentos e anotações por cliente/processo
-- ----------------------------------------------------------------------------
create table public.historico (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete cascade,
  processo_id uuid references public.processos(id) on delete cascade,
  tipo public.tipo_registro_historico not null default 'anotacao',
  titulo text,
  descricao text not null,
  data_evento timestamptz not null default now(),
  autor_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint historico_vinculo_check check (cliente_id is not null or processo_id is not null)
);

create index historico_cliente_id_idx on public.historico (cliente_id);
create index historico_processo_id_idx on public.historico (processo_id);
create index historico_data_evento_idx on public.historico (data_evento desc);

comment on table public.historico is 'Linha do tempo de atendimentos, andamentos processuais e anotações internas.';

-- ----------------------------------------------------------------------------
-- honorarios (contas a receber - cabeçalho da cobrança)
-- ----------------------------------------------------------------------------
create table public.honorarios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  processo_id uuid references public.processos(id) on delete set null,
  descricao text not null,
  tipo public.modelo_cobranca not null default 'fixo',
  valor_total numeric(14,2) not null,
  numero_parcelas int not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index honorarios_cliente_id_idx on public.honorarios (cliente_id);
create index honorarios_processo_id_idx on public.honorarios (processo_id);

comment on table public.honorarios is 'Cobrança de honorários (contas a receber), pode ser parcelada.';

-- ----------------------------------------------------------------------------
-- parcelas (cada parcela de um honorário)
-- ----------------------------------------------------------------------------
create table public.parcelas (
  id uuid primary key default gen_random_uuid(),
  honorario_id uuid not null references public.honorarios(id) on delete cascade,
  numero_parcela int not null default 1,
  valor numeric(14,2) not null,
  data_vencimento date not null,
  data_pagamento date,
  status public.status_parcela not null default 'pendente',
  forma_pagamento text,                 -- pix, boleto, transferencia, cartao, dinheiro
  comprovante_path text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parcelas_honorario_id_idx on public.parcelas (honorario_id);
create index parcelas_status_idx on public.parcelas (status);
create index parcelas_vencimento_idx on public.parcelas (data_vencimento);

comment on table public.parcelas is 'Parcelas de honorários; status atrasado é recalculado por trigger/job diário.';

-- ----------------------------------------------------------------------------
-- despesas (contas a pagar)
-- ----------------------------------------------------------------------------
create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  categoria public.categoria_despesa not null default 'outro',
  descricao text not null,
  fornecedor text,
  valor numeric(14,2) not null,
  data_vencimento date not null,
  data_pagamento date,
  status public.status_despesa not null default 'pendente',
  forma_pagamento text,
  comprovante_path text,
  recorrente boolean not null default false,
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index despesas_status_idx on public.despesas (status);
create index despesas_categoria_idx on public.despesas (categoria);
create index despesas_vencimento_idx on public.despesas (data_vencimento);

comment on table public.despesas is 'Despesas do escritório (contas a pagar), categorizadas.';

-- ----------------------------------------------------------------------------
-- recibos (comprovantes de pagamento emitidos em PDF)
-- ----------------------------------------------------------------------------
create table public.recibos (
  id uuid primary key default gen_random_uuid(),
  numero_recibo text not null unique,
  parcela_id uuid references public.parcelas(id) on delete set null,
  cliente_id uuid not null references public.clientes(id),
  valor numeric(14,2) not null,
  descricao text,
  data_emissao timestamptz not null default now(),
  pdf_storage_path text,
  emitido_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index recibos_cliente_id_idx on public.recibos (cliente_id);

comment on table public.recibos is 'Recibos/comprovantes de pagamento emitidos em PDF para clientes.';

-- sequência para numeração de recibos (ex: 2026/0001)
create table public.recibo_sequencia (
  ano int primary key,
  ultimo_numero int not null default 0
);

-- ----------------------------------------------------------------------------
-- eventos_agenda (prazos, audiências, reuniões — sincronizáveis com Google)
-- ----------------------------------------------------------------------------
create table public.eventos_agenda (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  tipo public.tipo_evento not null default 'outro',
  data_inicio timestamptz not null,
  data_fim timestamptz,
  dia_inteiro boolean not null default false,
  local text,
  processo_id uuid references public.processos(id) on delete set null,
  cliente_id uuid references public.clientes(id) on delete set null,
  responsavel_id uuid references public.profiles(id),
  google_event_id text,
  google_calendar_id text,
  sincronizado_em timestamptz,
  concluido boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index eventos_agenda_data_inicio_idx on public.eventos_agenda (data_inicio);
create index eventos_agenda_processo_id_idx on public.eventos_agenda (processo_id);
create index eventos_agenda_google_event_id_idx on public.eventos_agenda (google_event_id);

comment on table public.eventos_agenda is 'Prazos, audiências e compromissos, sincronizáveis com Google Calendar.';

-- ----------------------------------------------------------------------------
-- google_calendar_tokens (tokens OAuth por usuário — armazenados criptografados)
-- ----------------------------------------------------------------------------
create table public.google_calendar_tokens (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  access_token_enc bytea not null,
  refresh_token_enc bytea not null,
  scope text,
  token_type text,
  expiry_date timestamptz,
  google_calendar_id text default 'primary',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.google_calendar_tokens is 'Tokens OAuth do Google Calendar por usuário, criptografados; nunca expostos ao client.';

-- ----------------------------------------------------------------------------
-- audit_logs (trilha de auditoria — LGPD)
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id),
  acao public.acao_auditoria not null,
  tabela text not null,
  registro_id text,
  dados_anteriores jsonb,
  dados_novos jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_tabela_registro_idx on public.audit_logs (tabela, registro_id);
create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

comment on table public.audit_logs is 'Trilha de auditoria: quem acessou/alterou cada informação sensível.';

-- ----------------------------------------------------------------------------
-- configuracoes (chave/valor para parâmetros do sistema)
-- ----------------------------------------------------------------------------
create table public.configuracoes (
  chave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.configuracoes is 'Parâmetros gerais do sistema (ex: dados do escritório para recibos/relatórios).';
