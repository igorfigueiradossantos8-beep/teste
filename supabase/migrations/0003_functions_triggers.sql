-- ============================================================================
-- Advocacia FB — 0003: funções e triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.clientes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.processos
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.honorarios
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.parcelas
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.despesas
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.eventos_agenda
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.google_calendar_tokens
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Criação automática de profile ao registrar usuário no Supabase Auth
-- (o cadastro de novos usuários deve ser feito pelo admin via convite;
--  role default 'equipe', promovido a 'admin' manualmente no banco)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'equipe')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Criptografia de CPF/CNPJ
-- A chave de criptografia vem de uma configuração do banco (Vault/GUC),
-- setada apenas no lado do servidor (nunca versionada). Ver README para
-- instruções de configuração via Supabase Dashboard > Database > Settings.
--   alter database postgres set app.encryption_key = '<chave-forte-aqui>';
-- ----------------------------------------------------------------------------
create or replace function public.encrypt_secret(plain text)
returns bytea
language sql
security definer set search_path = public
as $$
  select case when plain is null or plain = '' then null
    else pgp_sym_encrypt(plain, current_setting('app.encryption_key', true))
  end;
$$;

create or replace function public.decrypt_secret(cipher bytea)
returns text
language sql
security definer set search_path = public
as $$
  select case when cipher is null then null
    else pgp_sym_decrypt(cipher, current_setting('app.encryption_key', true))
  end;
$$;

-- Hash determinístico (sha256) do CPF/CNPJ normalizado, para permitir
-- busca/checagem de duplicidade sem descriptografar.
create or replace function public.hash_document(doc text)
returns text
language sql
immutable
as $$
  select case when doc is null or doc = '' then null
    else encode(digest(regexp_replace(doc, '\D', '', 'g'), 'sha256'), 'hex')
  end;
$$;

-- ----------------------------------------------------------------------------
-- Recalcula parcelas/despesas vencidas como 'atrasado'
-- Deve ser agendada via pg_cron (Supabase) ou chamada por uma rota cron da API.
-- ----------------------------------------------------------------------------
create or replace function public.atualizar_status_inadimplencia()
returns void
language sql
security definer set search_path = public
as $$
  update public.parcelas
    set status = 'atrasado'
    where status = 'pendente' and data_vencimento < current_date;

  update public.despesas
    set status = 'atrasado'
    where status = 'pendente' and data_vencimento < current_date;
$$;

-- ----------------------------------------------------------------------------
-- Geração de número sequencial de recibo por ano (ex: 2026/0001)
-- ----------------------------------------------------------------------------
create or replace function public.gerar_numero_recibo()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  ano_atual int := extract(year from now());
  proximo int;
begin
  insert into public.recibo_sequencia (ano, ultimo_numero)
  values (ano_atual, 1)
  on conflict (ano) do update set ultimo_numero = public.recibo_sequencia.ultimo_numero + 1
  returning ultimo_numero into proximo;

  return ano_atual || '/' || lpad(proximo::text, 4, '0');
end;
$$;

-- ----------------------------------------------------------------------------
-- Auditoria genérica: registra insert/update/delete em tabelas sensíveis
-- ----------------------------------------------------------------------------
create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid;
begin
  v_user := auth.uid();

  if (tg_op = 'INSERT') then
    insert into public.audit_logs (user_id, acao, tabela, registro_id, dados_novos)
    values (v_user, 'insert', tg_table_name, new.id::text, to_jsonb(new));
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_logs (user_id, acao, tabela, registro_id, dados_anteriores, dados_novos)
    values (v_user, 'update', tg_table_name, new.id::text, to_jsonb(old), to_jsonb(new));
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_logs (user_id, acao, tabela, registro_id, dados_anteriores)
    values (v_user, 'delete', tg_table_name, old.id::text, to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$;

create trigger audit_clientes
  after insert or update or delete on public.clientes
  for each row execute function public.audit_trigger_fn();

create trigger audit_processos
  after insert or update or delete on public.processos
  for each row execute function public.audit_trigger_fn();

create trigger audit_honorarios
  after insert or update or delete on public.honorarios
  for each row execute function public.audit_trigger_fn();

create trigger audit_parcelas
  after insert or update or delete on public.parcelas
  for each row execute function public.audit_trigger_fn();

create trigger audit_despesas
  after insert or update or delete on public.despesas
  for each row execute function public.audit_trigger_fn();

create trigger audit_documentos
  after insert or update or delete on public.documentos
  for each row execute function public.audit_trigger_fn();

-- ----------------------------------------------------------------------------
-- Helper: retorna a role do usuário autenticado (usado nas policies de RLS)
-- ----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;
