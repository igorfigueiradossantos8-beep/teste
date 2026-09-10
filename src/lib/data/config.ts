import { createClient } from "@/lib/supabase/server";

export async function getAreasDireito(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "areas_direito")
    .single();

  return (data?.valor as string[] | undefined) ?? [
    "Cível", "Trabalhista", "Tributário", "Penal", "Família e Sucessões", "Empresarial",
  ];
}

export async function getEscritorioInfo() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "escritorio")
    .single();

  return (
    (data?.valor as {
      nome: string;
      responsavel: string;
      oab?: string;
      email?: string;
      telefone?: string;
      endereco?: string;
    } | undefined) ?? {
      nome: "Advocacia FB",
      responsavel: "Fábio Braga de Amaral",
    }
  );
}
