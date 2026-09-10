"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FieldGroup } from "@/components/ui/input";
import { convidarUsuarioAction } from "@/lib/actions/usuarios";
import type { ActionState } from "@/lib/actions/clientes";

export function ConviteForm() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await convidarUsuarioAction(prev, formData);
      if (!result.error) {
        setSuccess(true);
        formRef.current?.reset();
      }
      return result;
    },
    {},
  );

  return (
    <>
      <Button onClick={() => { setOpen(true); setSuccess(false); }}>
        <UserPlus className="h-4 w-4" /> Convidar usuário
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Convidar novo usuário">
        {success ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-preto/70">Convite enviado por e-mail com sucesso.</p>
            <Button onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        ) : (
          <form ref={formRef} action={formAction}>
            <FieldGroup>
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input id="full_name" name="full_name" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" name="email" type="email" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="role">Perfil de acesso *</Label>
              <Select id="role" name="role" defaultValue="equipe">
                <option value="equipe">Equipe (sem acesso ao financeiro)</option>
                <option value="admin">Administrador (acesso total)</option>
              </Select>
            </FieldGroup>

            {state.error && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            )}

            <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar convite
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
