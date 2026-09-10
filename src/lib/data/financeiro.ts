import { createClient } from "@/lib/supabase/server";

export interface ResumoFinanceiro {
  totalAReceber: number;
  totalRecebido: number;
  totalInadimplente: number;
  qtdInadimplente: number;
  totalAPagar: number;
  totalPago: number;
}

export async function getResumoFinanceiro(): Promise<ResumoFinanceiro> {
  const supabase = await createClient();

  const [{ data: parcelas }, { data: despesas }] = await Promise.all([
    supabase.from("parcelas").select("valor, status"),
    supabase.from("despesas").select("valor, status"),
  ]);

  const resumo: ResumoFinanceiro = {
    totalAReceber: 0,
    totalRecebido: 0,
    totalInadimplente: 0,
    qtdInadimplente: 0,
    totalAPagar: 0,
    totalPago: 0,
  };

  for (const p of parcelas ?? []) {
    if (p.status === "pendente") resumo.totalAReceber += p.valor;
    if (p.status === "pago") resumo.totalRecebido += p.valor;
    if (p.status === "atrasado") {
      resumo.totalInadimplente += p.valor;
      resumo.qtdInadimplente += 1;
    }
  }

  for (const d of despesas ?? []) {
    if (d.status === "pendente" || d.status === "atrasado") resumo.totalAPagar += d.valor;
    if (d.status === "pago") resumo.totalPago += d.valor;
  }

  return resumo;
}

export interface FluxoMensal {
  mes: string;
  entradas: number;
  saidas: number;
}

export async function getFluxoDeCaixa(mesesAtras = 6): Promise<FluxoMensal[]> {
  const supabase = await createClient();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - (mesesAtras - 1));
  inicio.setDate(1);
  const inicioStr = inicio.toISOString().slice(0, 10);

  const [{ data: parcelas }, { data: despesas }] = await Promise.all([
    supabase.from("parcelas").select("valor, data_pagamento").eq("status", "pago").gte("data_pagamento", inicioStr),
    supabase.from("despesas").select("valor, data_pagamento").eq("status", "pago").gte("data_pagamento", inicioStr),
  ]);

  const meses: FluxoMensal[] = [];
  for (let i = mesesAtras - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    meses.push({
      mes: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      entradas: 0,
      saidas: 0,
    });
    (meses[meses.length - 1] as FluxoMensal & { _chave: string })._chave = chave;
  }

  const findMes = (dataStr: string | null) => {
    if (!dataStr) return undefined;
    const chave = dataStr.slice(0, 7);
    return meses.find((m) => (m as FluxoMensal & { _chave: string })._chave === chave);
  };

  for (const p of parcelas ?? []) {
    const mes = findMes(p.data_pagamento);
    if (mes) mes.entradas += p.valor;
  }
  for (const d of despesas ?? []) {
    const mes = findMes(d.data_pagamento);
    if (mes) mes.saidas += d.valor;
  }

  return meses.map(({ mes, entradas, saidas }) => ({ mes, entradas, saidas }));
}

export interface ProcessosPorStatus {
  status: string;
  quantidade: number;
}

export async function getProcessosPorStatus(): Promise<ProcessosPorStatus[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("processos").select("status").is("deleted_at", null);

  const contagem = new Map<string, number>();
  for (const p of data ?? []) {
    contagem.set(p.status, (contagem.get(p.status) ?? 0) + 1);
  }

  return Array.from(contagem.entries()).map(([status, quantidade]) => ({ status, quantidade }));
}

export interface ProximoCompromisso {
  id: string;
  titulo: string;
  tipo: string;
  data_inicio: string;
  cliente_nome: string | null;
}

export async function getProximosCompromissos(limite = 5): Promise<ProximoCompromisso[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("eventos_agenda")
    .select("id, titulo, tipo, data_inicio, clientes(nome)")
    .eq("concluido", false)
    .gte("data_inicio", new Date().toISOString())
    .order("data_inicio", { ascending: true })
    .limit(limite);

  return (data ?? []).map((e) => ({
    id: e.id,
    titulo: e.titulo,
    tipo: e.tipo,
    data_inicio: e.data_inicio,
    cliente_nome: (e.clientes as unknown as { nome: string } | null)?.nome ?? null,
  }));
}
