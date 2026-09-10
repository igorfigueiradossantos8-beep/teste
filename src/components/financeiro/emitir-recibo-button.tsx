"use client";

import { useTransition } from "react";
import { Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emitirReciboAction } from "@/lib/actions/honorarios";

export function EmitirReciboButton({ parcelaId }: { parcelaId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await emitirReciboAction(parcelaId);
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else if (result.error) {
        alert(result.error);
      }
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
      Emitir recibo
    </Button>
  );
}
