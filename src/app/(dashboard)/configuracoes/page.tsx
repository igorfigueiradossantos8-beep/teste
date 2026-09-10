import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerfilForm } from "@/components/configuracoes/perfil-form";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const profile = await requireUser();

  return (
    <div>
      <PageHeader title="Configurações" description="Gerencie seu perfil e preferências." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Meu perfil</CardTitle></CardHeader>
          <CardContent>
            <PerfilForm profile={profile} />
          </CardContent>
        </Card>

        {profile.role === "admin" && (
          <Link href="/configuracoes/usuarios">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bege-100 text-azul-800">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-azul-950">Usuários</p>
                  <p className="text-sm text-preto/60">Convidar e gerenciar a equipe</p>
                </div>
                <ArrowRight className="h-4 w-4 text-dourado-500" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
