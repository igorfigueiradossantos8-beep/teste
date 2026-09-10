import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Scale } from "lucide-react";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-azul-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dourado-500">
            <Scale className="h-7 w-7 text-azul-950" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-branco">Advocacia FB</h1>
          <p className="mt-1 text-sm text-bege-200">Fábio Braga de Amaral</p>
        </div>

        <div className="rounded-xl border border-azul-800 bg-branco p-6 shadow-2xl sm:p-8">
          <h2 className="mb-1 font-serif text-lg font-semibold text-azul-950">
            Acesse sua conta
          </h2>
          <p className="mb-6 text-sm text-preto/60">
            Plataforma interna de gestão do escritório.
          </p>
          <LoginForm redirectTo={redirect} />
        </div>

        <p className="mt-6 text-center text-xs text-bege-300/70">
          Acesso restrito a usuários autorizados. Todas as ações são registradas.
        </p>
      </div>
    </div>
  );
}
