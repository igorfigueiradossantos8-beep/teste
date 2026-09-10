-- ============================================================================
-- Advocacia FB — 0004: Row Level Security
--
-- Regra geral:
--   - admin: acesso total a tudo, incluindo financeiro.
--   - equipe: acesso a clientes, processos, documentos, histórico e agenda.
--             SEM NENHUM acesso a honorarios/parcelas/despesas/recibos
--             (módulo financeiro) nem a audit_logs.
--   - Usuário precisa estar autenticado e ter profile 'active = true'.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.processos enable row level security;
alter table public.documentos enable row level security;
alter table public.historico enable row level security;
alter table public.honorarios enable row level security;
alter table public.parcelas enable row level security;
alter table public.despesas enable row level security;
alter table public.recibos enable row level security;
alter table public.recibo_sequencia enable row level security;
alter table public.eventos_agenda enable row level security;
alter table public.google_calendar_tokens enable row level security;
alter table public.audit_logs enable row level security;
alter table public.configuracoes enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin_only"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- clientes / processos / documentos / historico
-- equipe + admin podem ler e escrever (uso operacional diário)
-- ----------------------------------------------------------------------------
create policy "clientes_all_staff"
  on public.clientes for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

create policy "processos_all_staff"
  on public.processos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

create policy "documentos_all_staff"
  on public.documentos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

create policy "historico_all_staff"
  on public.historico for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

-- ----------------------------------------------------------------------------
-- eventos_agenda: equipe + admin (agenda é compartilhada)
-- ----------------------------------------------------------------------------
create policy "eventos_agenda_all_staff"
  on public.eventos_agenda for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

-- ----------------------------------------------------------------------------
-- google_calendar_tokens: cada usuário só acessa o próprio token
-- ----------------------------------------------------------------------------
create policy "google_tokens_owner_only"
  on public.google_calendar_tokens for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- MÓDULO FINANCEIRO — somente admin
-- ----------------------------------------------------------------------------
create policy "honorarios_admin_only"
  on public.honorarios for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "parcelas_admin_only"
  on public.parcelas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "despesas_admin_only"
  on public.despesas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "recibos_admin_only"
  on public.recibos for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "recibo_sequencia_admin_only"
  on public.recibo_sequencia for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- audit_logs: somente admin lê; inserts feitos via trigger (security definer)
-- ----------------------------------------------------------------------------
create policy "audit_logs_select_admin_only"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- configuracoes: leitura para equipe/admin, escrita só admin
-- ----------------------------------------------------------------------------
create policy "configuracoes_select_staff"
  on public.configuracoes for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.active));

create policy "configuracoes_write_admin_only"
  on public.configuracoes for insert
  to authenticated
  with check (public.is_admin());

create policy "configuracoes_update_admin_only"
  on public.configuracoes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
