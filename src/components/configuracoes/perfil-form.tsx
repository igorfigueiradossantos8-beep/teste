"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input, Label, FieldGroup } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { atualizarPerfilAction } from "@/lib/actions/usuarios";
import type { ActionState } from "@/lib/actions/clientes";
import type { Profile } from "@/types/database.types";

export function PerfilForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(atualizarPerfilAction, {} as ActionState);

  return (
    <form action={formAction} className="max-w-md space-y-1">
      <FieldGroup>
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
      </FieldGroup>
      <FieldGroup>
        <Label>E-mail</Label>
        <Input value={profile.email} disabled />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </FieldGroup>

      {state.error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Salvar alterações
      </Button>
    </form>
  );
}
