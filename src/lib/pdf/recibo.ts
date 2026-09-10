import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ReciboPdfInput {
  numeroRecibo: string;
  dataEmissao: Date;
  clienteNome: string;
  clienteCpfCnpj?: string | null;
  valor: number;
  descricao: string;
  formaPagamento?: string | null;
  dataPagamento?: string | null;
  escritorio: {
    nome: string;
    responsavel: string;
    oab?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
  };
}

const AZUL = rgb(0.043, 0.086, 0.149); // #0b1626
const DOURADO = rgb(0.757, 0.627, 0.294); // #c19a4b
const CINZA = rgb(0.35, 0.35, 0.35);

export async function gerarReciboPdf(input: ReciboPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  // Cabeçalho
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: DOURADO });

  page.drawText(input.escritorio.nome.toUpperCase(), {
    x: 50, y, size: 20, font: fontBold, color: AZUL,
  });
  y -= 18;
  page.drawText(input.escritorio.responsavel, { x: 50, y, size: 10, font: fontRegular, color: CINZA });
  if (input.escritorio.oab) {
    y -= 13;
    page.drawText(`OAB ${input.escritorio.oab}`, { x: 50, y, size: 10, font: fontRegular, color: CINZA });
  }

  y -= 40;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: DOURADO });

  y -= 40;
  page.drawText("RECIBO DE PAGAMENTO", { x: 50, y, size: 16, font: fontBold, color: AZUL });
  page.drawText(`Nº ${input.numeroRecibo}`, { x: width - 180, y, size: 14, font: fontBold, color: DOURADO });

  y -= 45;
  const valorTexto = formatCurrency(input.valor);
  page.drawText(`Recebi de ${input.clienteNome}`, { x: 50, y, size: 12, font: fontRegular, color: rgb(0, 0, 0) });
  if (input.clienteCpfCnpj) {
    y -= 18;
    page.drawText(`CPF/CNPJ: ${input.clienteCpfCnpj}`, { x: 50, y, size: 10, font: fontRegular, color: CINZA });
  }

  y -= 30;
  page.drawText(`a importância de ${valorTexto}`, { x: 50, y, size: 14, font: fontBold, color: AZUL });

  y -= 30;
  page.drawText("Referente a:", { x: 50, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
  y -= 16;
  page.drawText(input.descricao, { x: 50, y, size: 11, font: fontRegular, color: rgb(0, 0, 0), maxWidth: width - 100 });

  y -= 40;
  page.drawText(`Data de pagamento: ${formatDate(input.dataPagamento)}`, { x: 50, y, size: 10, font: fontRegular, color: CINZA });
  if (input.formaPagamento) {
    y -= 16;
    page.drawText(`Forma de pagamento: ${input.formaPagamento}`, { x: 50, y, size: 10, font: fontRegular, color: CINZA });
  }

  y -= 90;
  page.drawLine({ start: { x: 50, y }, end: { x: 280, y }, thickness: 0.5, color: CINZA });
  y -= 14;
  page.drawText(input.escritorio.responsavel, { x: 50, y, size: 10, font: fontRegular, color: rgb(0, 0, 0) });
  y -= 14;
  page.drawText(input.escritorio.nome, { x: 50, y, size: 9, font: fontRegular, color: CINZA });

  page.drawText(
    `Emitido em ${formatDate(input.dataEmissao)} · ${input.escritorio.email ?? ""} ${input.escritorio.telefone ?? ""}`,
    { x: 50, y: 40, size: 8, font: fontRegular, color: CINZA },
  );

  return doc.save();
}
