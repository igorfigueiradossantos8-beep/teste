"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/auth/permissions";
import type { ActionState } from "@/lib/actions/clientes";
import type { UserRole } from "@/types/database.types";

export async function convidarUsuarioAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = (formData.get("role") as UserRole) || "equipe";

  if (!email || !fullName) {
    return { error: "Informe nome e e-mail." };
  }

  const admin = createAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
    : undefined;

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo,
  });

  if (error) {
    return { error: `Não foi possível convidar o usuário: ${error.message}` };
  }

  revalidatePath("/configuracoes/usuarios");
  return {};
}

export async function alterarRoleAction(userId: string, role: UserRole) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/configuracoes/usuarios");
}

export async function alterarStatusUsuarioAction(userId: string, active: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("profiles").update({ active }).eq("id", userId);
  revalidatePath("/configuracoes/usuarios");
}

export async function atualizarPerfilAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) return { error: "Informe seu nome." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) return { error: "Não foi possível atualizar o perfil." };

  revalidatePath("/configuracoes");
  return {};
}
