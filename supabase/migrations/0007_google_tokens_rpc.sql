-- ============================================================================
-- Advocacia FB — 0007: RPCs para tokens do Google Calendar (criptografados)
-- ============================================================================

create or replace function public.set_google_tokens(
  p_access_token text,
  p_refresh_token text,
  p_scope text,
  p_token_type text,
  p_expiry_date timestamptz,
  p_calendar_id text default 'primary'
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.google_calendar_tokens (
    user_id, access_token_enc, refresh_token_enc, scope, token_type, expiry_date, google_calendar_id
  ) values (
    auth.uid(), public.encrypt_secret(p_access_token), public.encrypt_secret(p_refresh_token),
    p_scope, p_token_type, p_expiry_date, coalesce(p_calendar_id, 'primary')
  )
  on conflict (user_id) do update set
    access_token_enc = public.encrypt_secret(p_access_token),
    refresh_token_enc = coalesce(public.encrypt_secret(p_refresh_token), google_calendar_tokens.refresh_token_enc),
    scope = p_scope,
    token_type = p_token_type,
    expiry_date = p_expiry_date,
    google_calendar_id = coalesce(p_calendar_id, google_calendar_tokens.google_calendar_id);
end;
$$;

create or replace function public.get_google_tokens(p_user_id uuid)
returns table (access_token text, refresh_token text, expiry_date timestamptz, google_calendar_id text)
language plpgsql
stable
security definer set search_path = public
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'não autorizado';
  end if;

  return query
    select public.decrypt_secret(t.access_token_enc), public.decrypt_secret(t.refresh_token_enc),
           t.expiry_date, t.google_calendar_id
    from public.google_calendar_tokens t
    where t.user_id = p_user_id;
end;
$$;

grant execute on function public.set_google_tokens(text, text, text, text, timestamptz, text) to authenticated;
grant execute on function public.get_google_tokens(uuid) to authenticated;
