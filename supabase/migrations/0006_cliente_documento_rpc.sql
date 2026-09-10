-- ============================================================================
-- Advocacia FB — 0006: RPCs para leitura/escrita do CPF/CNPJ criptografado
--
-- O client (browser/server actions) nunca criptografa/descriptografa direto;
-- usa estas funções, que rodam com a chave de criptografia guardada apenas
-- no servidor Postgres (current_setting('app.encryption_key')).
-- ============================================================================

create or replace function public.set_cliente_documento(p_cliente_id uuid, p_documento text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and active
  ) then
    raise exception 'não autorizado';
  end if;

  update public.clientes
    set cpf_cnpj_enc = public.encrypt_secret(p_documento),
        cpf_cnpj_hash = public.hash_document(p_documento)
    where id = p_cliente_id;
end;
$$;

create or replace function public.get_cliente_documento(p_cliente_id uuid)
returns text
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_result text;
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and active
  ) then
    raise exception 'não autorizado';
  end if;

  select public.decrypt_secret(cpf_cnpj_enc) into v_result
    from public.clientes where id = p_cliente_id;

  return v_result;
end;
$$;

grant execute on function public.set_cliente_documento(uuid, text) to authenticated;
grant execute on function public.get_cliente_documento(uuid) to authenticated;
