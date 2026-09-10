-- ============================================================================
-- Advocacia FB — 0005: Storage buckets e políticas
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos', 'documentos', false, 26214400,
  array['application/pdf','image/png','image/jpeg','image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recibos', 'recibos', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- documentos: equipe + admin podem ler/escrever (bucket privado, acesso via signed URL)
create policy "documentos_bucket_staff_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos' and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.active
  ));

create policy "documentos_bucket_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos' and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.active
  ));

create policy "documentos_bucket_staff_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documentos' and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.active
  ));

-- recibos: somente admin (módulo financeiro)
create policy "recibos_bucket_admin_all"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'recibos' and public.is_admin())
  with check (bucket_id = 'recibos' and public.is_admin());

-- avatars: público para leitura, escrita apenas do próprio dono (pasta = user id)
create policy "avatars_public_select"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
