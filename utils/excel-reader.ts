import * as XLSX from 'xlsx';
import * as path from 'path';

export type ExcelRow = Record<string, string>;

export function readExcelSheet(filePath: string, sheetName?: string): ExcelRow[] {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const workbook = XLSX.readFile(absolute);
  const targetSheet = sheetName ?? workbook.SheetNames[0];
  const worksheet = workbook.Sheets[targetSheet];

  if (!worksheet) {
    throw new Error(
      `Sheet "${targetSheet}" not found in ${filePath}. Available: ${workbook.SheetNames.join(', ')}`
    );
  }

  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (rawRows.length === 0) return [];

  const headers: string[] = rawRows[0].map((h: any) => String(h).trim());

  return rawRows
    .slice(1)
    .filter(row => row.some((cell: any) => cell !== '' && cell !== undefined && cell !== null))
    .map(row => {
      const record: ExcelRow = {};
      headers.forEach((h, i) => {
        record[h] = row[i] !== undefined ? String(row[i]).trim() : '';
      });
      return record;
    });
}

export function getExcelSheetNames(filePath: string): string[] {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  return XLSX.readFile(absolute).SheetNames;
}
