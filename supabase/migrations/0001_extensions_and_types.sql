-- ============================================================================
-- Advocacia FB — 0001: extensões e tipos enumerados
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Perfis de acesso
do $$ begin
  create type public.user_role as enum ('admin', 'equipe');
exception when duplicate_object then null; end $$;

-- Pessoa física ou jurídica
do $$ begin
  create type public.tipo_pessoa as enum ('fisica', 'juridica');
exception when duplicate_object then null; end $$;

-- Status de um processo jurídico
do $$ begin
  create type public.status_processo as enum (
    'ativo', 'suspenso', 'aguardando', 'recurso', 'arquivado', 'encerrado_ganho', 'encerrado_perdido', 'encerrado_acordo'
  );
exception when duplicate_object then null; end $$;

-- Modelo de cobrança de honorários
do $$ begin
  create type public.modelo_cobranca as enum ('fixo', 'hora', 'exito', 'misto');
exception when duplicate_object then null; end $$;

-- Tipo de documento anexado
do $$ begin
  create type public.tipo_documento as enum ('contrato', 'procuracao', 'peticao', 'comprovante', 'identificacao', 'outro');
exception when duplicate_object then null; end $$;

-- Tipo de registro no histórico do cliente/processo
do $$ begin
  create type public.tipo_registro_historico as enum ('andamento', 'atendimento', 'anotacao', 'contato');
exception when duplicate_object then null; end $$;

-- Status de parcela / cobrança
do $$ begin
  create type public.status_parcela as enum ('pendente', 'pago', 'atrasado', 'cancelado');
exception when duplicate_object then null; end $$;

-- Categoria de despesa (contas a pagar)
do $$ begin
  create type public.categoria_despesa as enum (
    'aluguel', 'salario', 'material_escritorio', 'impostos', 'software_assinaturas',
    'marketing', 'contabilidade', 'energia_agua_internet', 'transporte', 'outro'
  );
exception when duplicate_object then null; end $$;

-- Status de despesa
do $$ begin
  create type public.status_despesa as enum ('pendente', 'pago', 'atrasado', 'cancelado');
exception when duplicate_object then null; end $$;

-- Tipo de evento de agenda
do $$ begin
  create type public.tipo_evento as enum ('prazo', 'audiencia', 'reuniao', 'diligencia', 'outro');
exception when duplicate_object then null; end $$;

-- Ação de auditoria
do $$ begin
  create type public.acao_auditoria as enum ('insert', 'update', 'delete', 'select_sensivel', 'login', 'logout');
exception when duplicate_object then null; end $$;
