import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarRelatorioPdf, type RelatorioColuna } from "@/lib/pdf/relatorio";
import { gerarRelatorioExcel, type RelatorioColunaExcel } from "@/lib/excel/relatorio";
import { getFluxoDeCaixa } from "@/lib/data/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_PARCELA_LABEL, STATUS_DESPESA_LABEL, CATEGORIA_DESPESA_LABEL } from "@/lib/status";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role, active").eq("id", user.id).single();
  if (!profile?.active || profile.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const tipo = request.nextUrl.searchParams.get("tipo") ?? "receber";
  const formato = request.nextUrl.searchParams.get("formato") ?? "pdf";

  let titulo = "";
  let colunasPdf: RelatorioColuna[] = [];
  let colunasExcel: RelatorioColunaExcel[] = [];
  const linhasPdf: string[][] = [];
  const linhasExcel: Record<string, string | number>[] = [];
  let rodape: string | undefined;

  if (tipo === "receber") {
    titulo = "Relatório de Contas a Receber";
    const { data } = await supabase
      .from("parcelas")
      .select("numero_parcela, valor, data_vencimento, data_pagamento, status, honorarios(descricao, clientes(nome))")
      .order("data_vencimento");

    colunasPdf = [
      { header: "Cliente", width: 180 },
      { header: "Descrição", width: 220 },
      { header: "Parcela", width: 60 },
      { header: "Valor", width: 90 },
      { header: "Vencimento", width: 90 },
      { header: "Status", width: 90 },
    ];
    colunasExcel = [
      { header: "Cliente", key: "cliente", width: 28 },
      { header: "Descrição", key: "descricao", width: 32 },
      { header: "Parcela", key: "parcela", width: 10 },
      { header: "Valor", key: "valor", width: 15 },
      { header: "Vencimento", key: "vencimento", width: 14 },
      { header: "Status", key: "status", width: 14 },
    ];

    let total = 0;
    for (const p of data ?? []) {
      const h = p.honorarios as unknown as { descricao: string; clientes: { nome: string } | null };
      total += p.valor;
      linhasPdf.push([
        h.clientes?.nome ?? "—", h.descricao, String(p.numero_parcela),
        formatCurrency(p.valor), formatDate(p.data_vencimento), STATUS_PARCELA_LABEL[p.status],
      ]);
      linhasExcel.push({
        cliente: h.clientes?.nome ?? "—", descricao: h.descricao, parcela: p.numero_parcela,
        valor: p.valor, vencimento: formatDate(p.data_vencimento), status: STATUS_PARCELA_LABEL[p.status],
      });
    }
    rodape = `Total: ${formatCurrency(total)}`;
  } else if (tipo === "pagar") {
    titulo = "Relatório de Contas a Pagar";
    const { data } = await supabase.from("despesas").select("*").order("data_vencimento");

    colunasPdf = [
      { header: "Descrição", width: 220 },
      { header: "Categoria", width: 150 },
      { header: "Fornecedor", width: 150 },
      { header: "Valor", width: 90 },
      { header: "Vencimento", width: 90 },
      { header: "Status", width: 90 },
    ];
    colunasExcel = [
      { header: "Descrição", key: "descricao", width: 32 },
      { header: "Categoria", key: "categoria", width: 22 },
      { header: "Fornecedor", key: "fornecedor", width: 22 },
      { header: "Valor", key: "valor", width: 15 },
      { header: "Vencimento", key: "vencimento", width: 14 },
      { header: "Status", key: "status", width: 14 },
    ];

    let total = 0;
    for (const d of data ?? []) {
      total += d.valor;
      linhasPdf.push([
        d.descricao, CATEGORIA_DESPESA_LABEL[d.categoria], d.fornecedor ?? "—",
        formatCurrency(d.valor), formatDate(d.data_vencimento), STATUS_DESPESA_LABEL[d.status],
      ]);
      linhasExcel.push({
        descricao: d.descricao, categoria: CATEGORIA_DESPESA_LABEL[d.categoria], fornecedor: d.fornecedor ?? "—",
        valor: d.valor, vencimento: formatDate(d.data_vencimento), status: STATUS_DESPESA_LABEL[d.status],
      });
    }
    rodape = `Total: ${formatCurrency(total)}`;
  } else {
    titulo = "Relatório de Fluxo de Caixa";
    const fluxo = await getFluxoDeCaixa(6);

    colunasPdf = [
      { header: "Mês", width: 150 },
      { header: "Entradas", width: 150 },
      { header: "Saídas", width: 150 },
      { header: "Saldo", width: 150 },
    ];
    colunasExcel = [
      { header: "Mês", key: "mes", width: 16 },
      { header: "Entradas", key: "entradas", width: 16 },
      { header: "Saídas", key: "saidas", width: 16 },
      { header: "Saldo", key: "saldo", width: 16 },
    ];

    for (const m of fluxo) {
      linhasPdf.push([m.mes, formatCurrency(m.entradas), formatCurrency(m.saidas), formatCurrency(m.entradas - m.saidas)]);
      linhasExcel.push({ mes: m.mes, entradas: m.entradas, saidas: m.saidas, saldo: m.entradas - m.saidas });
    }
  }

  const nomeArquivo = `relatorio-${tipo}-${new Date().toISOString().slice(0, 10)}`;

  if (formato === "excel") {
    const buffer = await gerarRelatorioExcel(titulo, colunasExcel, linhasExcel);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nomeArquivo}.xlsx"`,
      },
    });
  }

  const pdfBytes = await gerarRelatorioPdf(titulo, colunasPdf, linhasPdf, rodape);
  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}.pdf"`,
    },
  });
}
