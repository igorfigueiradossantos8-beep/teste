import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const AZUL = rgb(0.043, 0.086, 0.149);
const DOURADO = rgb(0.757, 0.627, 0.294);
const CINZA = rgb(0.35, 0.35, 0.35);

export interface RelatorioColuna {
  header: string;
  width: number;
  align?: "left" | "right";
}

export async function gerarRelatorioPdf(
  titulo: string,
  colunas: RelatorioColuna[],
  linhas: string[][],
  rodape?: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  const pageWidth = 841.89; // A4 landscape
  const pageHeight = 595.28;
  const rowHeight = 20;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 50;

  function drawHeader() {
    page.drawRectangle({ x: 0, y: pageHeight - 6, width: pageWidth, height: 6, color: DOURADO });
    page.drawText("ADVOCACIA FB", { x: margin, y: pageHeight - 30, size: 12, font: fontBold, color: AZUL });
    page.drawText(titulo, { x: margin, y: pageHeight - 48, size: 16, font: fontBold, color: AZUL });
    page.drawText(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, {
      x: pageWidth - margin - 140, y: pageHeight - 30, size: 9, font: fontRegular, color: CINZA,
    });
  }

  function drawTableHeader(yPos: number) {
    let x = margin;
    for (const col of colunas) {
      page.drawText(col.header, { x, y: yPos, size: 9, font: fontBold, color: rgb(1, 1, 1) });
      x += col.width;
    }
  }

  drawHeader();
  y -= 30;
  page.drawRectangle({ x: margin, y: y - 4, width: pageWidth - margin * 2, height: rowHeight, color: AZUL });
  drawTableHeader(y);
  y -= rowHeight;

  for (const [i, linha] of linhas.entries()) {
    if (y < 60) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;
      drawHeader();
      y -= 30;
      page.drawRectangle({ x: margin, y: y - 4, width: pageWidth - margin * 2, height: rowHeight, color: AZUL });
      drawTableHeader(y);
      y -= rowHeight;
    }

    if (i % 2 === 0) {
      page.drawRectangle({ x: margin, y: y - 4, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.98, 0.96, 0.91) });
    }

    let x = margin;
    for (const [colIdx, col] of colunas.entries()) {
      const texto = linha[colIdx] ?? "";
      page.drawText(texto, { x, y, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      x += col.width;
    }
    y -= rowHeight;
  }

  if (rodape) {
    page.drawText(rodape, { x: margin, y: 30, size: 10, font: fontBold, color: AZUL });
  }

  return doc.save();
}
