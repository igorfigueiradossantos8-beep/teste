"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FieldGroup } from "@/components/ui/input";

export function MarcarPagoDialog({
  action,
  idFieldName,
  id,
  label = "Marcar como pago",
}: {
  action: (formData: FormData) => Promise<void>;
  idFieldName: string;
  id: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Button size="sm" variant="gold" onClick={() => setOpen(true)}>
        <CheckCircle2 className="h-4 w-4" /> {label}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Confirmar pagamento">
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
        >
          <input type="hidden" name={idFieldName} value={id} />
          <FieldGroup>
            <Label htmlFor="data_pagamento">Data do pagamento</Label>
            <Input id="data_pagamento" name="data_pagamento" type="date" defaultValue={today} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
            <Select id="forma_pagamento" name="forma_pagamento" defaultValue="pix">
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
              <option value="cartao">Cartão</option>
              <option value="dinheiro">Dinheiro</option>
            </Select>
          </FieldGroup>
          <div className="flex justify-end gap-3 border-t border-bege-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
