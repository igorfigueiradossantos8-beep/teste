# Advocacia FB — Plataforma de Gestão

Plataforma de gestão para o escritório **Advocacia FB**, de Fábio Braga de Amaral: clientes, processos, financeiro (contas a receber/pagar, fluxo de caixa, recibos), agenda com sincronização ao Google Calendar, auditoria e controle de acesso por perfil.

## Stack

- **Frontend:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4)
- **Backend/Banco:** Supabase (Postgres, Auth, Storage, RLS)
- **Deploy:** Vercel (app) + Supabase (banco), plano gratuito para começar
- **Integrações:** Google Calendar API (OAuth 2.0)
- **PDF/Excel:** `pdf-lib` (recibos e relatórios em PDF) e `exceljs` (relatórios em Excel)

## Estrutura de pastas

```
src/
  app/
    login/                       tela de login
    (dashboard)/                 rotas autenticadas (sidebar + topbar)
      dashboard/                 indicadores gerais
      clientes/                  CRUD de clientes + detalhe (processos, docs, histórico, financeiro)
      processos/                 CRUD de processos + detalhe
      financeiro/                admin-only: contas a receber/pagar, fluxo de caixa, relatórios
      agenda/                    compromissos + integração Google Calendar
      configuracoes/             perfil do usuário + gestão de usuários (admin-only)
    api/
      google/oauth, google/callback   fluxo OAuth do Google Calendar
      relatorios/                     exportação de relatórios em PDF/Excel
  components/
    ui/                          design system (Button, Input, Card, Table, Dialog, Tabs...)
    layout/                      sidebar, topbar, page header
    clientes/ processos/ financeiro/ agenda/ documentos/ historico/ configuracoes/ dashboard/
  lib/
    supabase/                    clients (browser, server, admin) + proxy (auth guard)
    actions/                     Server Actions (mutações)
    data/                        queries agregadas (dashboard, financeiro)
    validations/                 schemas Zod
    google/                      integração Google Calendar
    pdf/ excel/                  geração de recibos e relatórios
    auth/                        permissões (requireUser/requireAdmin)
  types/database.types.ts        tipos do banco (compatíveis com supabase-js)
  proxy.ts                       Proxy do Next.js (guarda de rotas por sessão/role)
supabase/
  migrations/                    schema completo, RLS, triggers, storage (SQL, em ordem)
  seed.sql                       dados iniciais (config do escritório, áreas do direito)
```

## Modelo de dados (resumo)

| Tabela | Descrição |
|---|---|
| `profiles` | Usuários internos (`admin` ou `equipe`), estende `auth.users` |
| `clientes` | Dados de contato; CPF/CNPJ **criptografado** (`pgcrypto`) |
| `processos` | Vinculados a um cliente; área do direito, status, modelo de cobrança (fixo/hora/êxito/misto) |
| `documentos` | Metadados de arquivos (contratos, procurações, petições) — binário no Storage |
| `historico` | Atendimentos, andamentos e anotações por cliente/processo |
| `honorarios` + `parcelas` | Contas a receber, com parcelamento e status (pendente/pago/atrasado) |
| `despesas` | Contas a pagar, categorizadas |
| `recibos` | Recibos de pagamento emitidos (PDF armazenado no Storage) |
| `eventos_agenda` | Prazos, audiências e reuniões, sincronizáveis com o Google Calendar |
| `google_calendar_tokens` | Tokens OAuth por usuário, criptografados |
| `audit_logs` | Trilha de auditoria (quem alterou o quê e quando) |
| `configuracoes` | Parâmetros gerais (dados do escritório, áreas do direito) |

**Controle de acesso (RLS):** `equipe` tem acesso total a clientes/processos/documentos/histórico/agenda; **todo o módulo financeiro** (`honorarios`, `parcelas`, `despesas`, `recibos`, `audit_logs`) é restrito a `admin` — tanto no banco (RLS) quanto na aplicação (proxy + `requireAdmin()`).

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (plano Free).
2. No **SQL Editor**, execute os arquivos de `supabase/migrations/` **em ordem numérica** (0001 → 0007). Alternativamente, use a CLI:
   ```bash
   npx supabase link --project-ref SEU_PROJECT_REF
   npx supabase db push
   ```
3. **Defina a chave de criptografia** usada para CPF/CNPJ e tokens do Google, guardada no Supabase Vault (uma única vez, no SQL Editor — nunca versione essa chave):
   ```sql
   select vault.create_secret(
     'uma-chave-longa-e-aleatoria-só-sua',
     'app_encryption_key',
     'Chave de criptografia CPF/CNPJ e tokens Google - Advocacia FB'
   );
   ```
4. Execute `supabase/seed.sql` para carregar as configurações iniciais (dados do escritório, áreas do direito).
5. Crie o primeiro usuário: cadastre-se pela tela de login (ou convide pelo Dashboard do Supabase em Authentication → Users → Invite), depois promova-o a admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'fabiobragadeamaral@gmail.com';
   ```
6. Copie as chaves em **Project Settings → API** para o `.env.local` (veja `.env.example`).

Os buckets de Storage (`documentos`, `recibos`, `avatars`) e suas políticas já são criados pela migration `0005_storage.sql`.

## Configuração do Google Calendar (OAuth)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a **Google Calendar API**.
2. Configure a tela de consentimento OAuth (modo "Externo" ou "Interno", conforme sua conta).
3. Crie uma credencial **OAuth Client ID** do tipo "Web application" com:
   - URI de redirecionamento autorizado: `https://SEU-DOMINIO/api/google/callback` (e `http://localhost:3000/api/google/callback` para desenvolvimento).
4. Copie o `Client ID` e `Client Secret` para `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. Cada usuário conecta sua própria conta do Google na tela **Agenda** ("Conectar Google Calendar"); os tokens ficam armazenados criptografados por usuário.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com suas chaves
npm run dev
```

Acesse `http://localhost:3000`.

## Deploy (Vercel)

1. Importe o repositório na [Vercel](https://vercel.com/new).
2. Configure as variáveis de ambiente do `.env.example` no projeto da Vercel (Production e Preview).
3. Atualize `GOOGLE_REDIRECT_URI` e `NEXT_PUBLIC_APP_URL` para o domínio de produção, e adicione o novo URI de redirecionamento no Google Cloud Console.
4. Deploy — a Vercel detecta o Next.js automaticamente.

## Segurança e LGPD

- **Criptografia:** CPF/CNPJ dos clientes e tokens do Google Calendar são criptografados em repouso (`pgcrypto`, chave mantida apenas no Postgres).
- **Auditoria:** todas as alterações em clientes, processos, honorários, parcelas, despesas e documentos são registradas em `audit_logs` (quem, quando, valores antes/depois).
- **Controle de acesso:** aplicado em três camadas — RLS no Postgres, Proxy do Next.js (bloqueio de rotas `/financeiro` e `/configuracoes/usuarios` para não-admins) e checagem explícita (`requireAdmin`) em cada Server Action sensível.
- **Retenção/exclusão:** clientes e processos usam exclusão lógica (`deleted_at`); para expurgo definitivo de dados a pedido do titular, exclua o registro e seus documentos no Storage diretamente no Supabase.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servir build de produção
npm run lint     # ESLint
```
