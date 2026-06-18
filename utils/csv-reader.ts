import * as fs from 'fs';
import * as path from 'path';

export type CsvRow = Record<string, string>;

/**
 * Parse a CSV file into an array of rows keyed by header name.
 * Supports double-quoted fields with embedded commas and escaped quotes ("").
 */
export function readCsvFile(filePath: string): CsvRow[] {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolute)) {
    throw new Error(`CSV file not found: ${absolute}`);
  }

  const raw = fs.readFileSync(absolute, 'utf-8').replace(/^\uFEFF/, '');
  const lines = parseCsv(raw);
  if (lines.length === 0) return [];

  const headers = lines[0].map(h => h.trim());
  return lines.slice(1)
    .filter(cols => cols.length > 0 && cols.some(c => c !== ''))
    .map(cols => {
      const row: CsvRow = {};
      headers.forEach((h, i) => {
        row[h] = (cols[i] ?? '').trim();
      });
      return row;
    });
}

/**
 * RFC-4180 style CSV tokenizer. Returns rows of string columns.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(cell); cell = ''; continue; }
    if (ch === '\r') { continue; }
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/**
 * Look up a row in `rows` by either a column named `row_id` matching `id`,
 * or by 1-based index if `id` is purely numeric.
 */
export function findCsvRow(rows: CsvRow[], id: string): CsvRow | undefined {
  const trimmed = String(id).trim();
  const byKey = rows.find(r => r['row_id'] === trimmed || r['id'] === trimmed);
  if (byKey) return byKey;

  if (/^\d+$/.test(trimmed)) {
    const idx = parseInt(trimmed, 10) - 1;
    if (idx >= 0 && idx < rows.length) return rows[idx];
  }
  return undefined;
}

/**
 * Replace `${field}` placeholders in `value` with values from `row`.
 * Returns the original string if there are no placeholders or no row.
 * Missing fields are left as the literal placeholder so failures are obvious.
 */
export function resolveCsvPlaceholders(value: string | undefined, row: CsvRow | undefined): string {
  if (value == null) return '';
  if (!row || value.indexOf('${') === -1) return value;

  return value.replace(/\$\{([\w.-]+)\}/g, (match, key) => {
    if (key in row) return row[key];
    return match;
  });
}
