import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente com service_role — ignora RLS. Uso restrito a:
 *  - Route Handlers/Server Actions que precisam de operação administrativa
 *    (ex: descriptografar CPF/CNPJ para gerar um PDF, criar usuário via Admin API).
 * NUNCA importar em código que roda no browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
