import { CalendarCheck, CalendarPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { desconectarGoogleAction } from "@/lib/actions/agenda";

export function GoogleConnectCard({ connected }: { connected: boolean }) {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bege-100 text-azul-800">
            {connected ? <CalendarCheck className="h-5 w-5" /> : <CalendarPlus className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-medium text-azul-950">Google Calendar</p>
            <p className="text-sm text-preto/60">
              {connected
                ? "Conectado — novos compromissos são sincronizados automaticamente."
                : "Conecte sua conta do Google para sincronizar prazos e audiências."}
            </p>
          </div>
        </div>
        {connected ? (
          <form action={desconectarGoogleAction}>
            <Button type="submit" size="sm" variant="outline">Desconectar</Button>
          </form>
        ) : (
          <Button size="sm" href="/api/google/oauth">Conectar Google Calendar</Button>
        )}
      </CardContent>
    </Card>
  );
}
