-- ============================================================================
-- Advocacia FB — dados iniciais (seed)
-- Execute apenas em ambiente novo, após aplicar as migrations.
-- ============================================================================

insert into public.configuracoes (chave, valor) values
  ('escritorio', jsonb_build_object(
    'nome', 'Advocacia FB',
    'responsavel', 'Fábio Braga de Amaral',
    'oab', '',
    'email', 'contato@advocaciafb.com.br',
    'telefone', '',
    'endereco', ''
  ))
on conflict (chave) do nothing;

insert into public.configuracoes (chave, valor) values
  ('areas_direito', jsonb_build_array(
    'Cível', 'Trabalhista', 'Tributário', 'Penal', 'Família e Sucessões',
    'Empresarial', 'Consumidor', 'Previdenciário', 'Administrativo', 'Imobiliário'
  ))
on conflict (chave) do nothing;

-- IMPORTANTE: após o primeiro usuário se cadastrar via Supabase Auth,
-- promova-o a admin manualmente com:
--
--   update public.profiles set role = 'admin' where email = 'fabiobragadeamaral@gmail.com';
