import ExcelJS from "exceljs";

export interface RelatorioColunaExcel {
  header: string;
  key: string;
  width?: number;
}

export async function gerarRelatorioExcel(
  titulo: string,
  colunas: RelatorioColunaExcel[],
  linhas: Record<string, string | number>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Advocacia FB";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(titulo.slice(0, 31));
  sheet.columns = colunas.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 20 }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10203A" } };
  headerRow.alignment = { vertical: "middle" };

  for (const linha of linhas) {
    sheet.addRow(linha);
  }

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (rowNumber % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFBF3E3" } };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
