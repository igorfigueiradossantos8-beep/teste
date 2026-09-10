import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database.types";

/**
 * Busca o usuário autenticado + profile. Redireciona para /login se não houver sessão.
 * Use em Server Components/layouts que precisam do usuário atual.
 */
export async function requireUser(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active) redirect("/login");

  return profile;
}

/** Igual a requireUser, mas redireciona para /dashboard se o usuário não for admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
