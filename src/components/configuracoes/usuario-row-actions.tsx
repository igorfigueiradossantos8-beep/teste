"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { alterarRoleAction, alterarStatusUsuarioAction } from "@/lib/actions/usuarios";
import type { Profile, UserRole } from "@/types/database.types";

export function UsuarioRowActions({ usuario, isSelf }: { usuario: Profile; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        defaultValue={usuario.role}
        disabled={isSelf || isPending}
        onChange={(e) => startTransition(() => alterarRoleAction(usuario.id, e.target.value as UserRole))}
        className="w-auto"
      >
        <option value="equipe">Equipe</option>
        <option value="admin">Administrador</option>
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={isSelf || isPending}
        onClick={() => startTransition(() => alterarStatusUsuarioAction(usuario.id, !usuario.active))}
      >
        {usuario.active ? "Desativar" : "Ativar"}
      </Button>
    </div>
  );
}
