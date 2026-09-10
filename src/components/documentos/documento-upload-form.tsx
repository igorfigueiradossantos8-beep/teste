"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select, Textarea, Label, FieldGroup } from "@/components/ui/input";
import { uploadDocumentoAction, type UploadState } from "@/lib/actions/documentos";
import { TIPO_DOCUMENTO_LABEL } from "@/lib/status";

export function DocumentoUploadForm({
  clienteId,
  processoId,
}: {
  clienteId?: string;
  processoId?: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    async (prev, formData) => {
      const result = await uploadDocumentoAction(prev, formData);
      if (!result.error) {
        setOpen(false);
        formRef.current?.reset();
      }
      return result;
    },
    {},
  );

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Enviar documento
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Enviar documento">
        <form ref={formRef} action={formAction} className="space-y-1">
          {clienteId && <input type="hidden" name="cliente_id" value={clienteId} />}
          {processoId && <input type="hidden" name="processo_id" value={processoId} />}

          <FieldGroup>
            <Label htmlFor="tipo">Tipo de documento</Label>
            <Select id="tipo" name="tipo" defaultValue="outro">
              {Object.entries(TIPO_DOCUMENTO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="file">Arquivo (PDF, Word ou imagem — até 25MB)</Label>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="block w-full text-sm text-preto/70 file:mr-3 file:rounded-md file:border-0 file:bg-azul-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-branco"
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea id="descricao" name="descricao" />
          </FieldGroup>

          {state.error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
