import * as fs from 'fs';
import * as path from 'path';
import { readExcelSheet, ExcelRow } from './excel-reader';

// Matches:  Examples: excel:testdata/file.xlsx
//      or:  Examples: excel:testdata/file.xlsx!SheetName
const EXCEL_PATTERN = /^(\s*)Examples:\s+excel:([^\s!]+)(?:!(\S+))?\s*$/;

function buildExamplesTable(indent: string, rows: ExcelRow[]): string[] {
  const headers = Object.keys(rows[0]);

  // Column widths: max of header length and any cell length
  const widths = headers.map(h =>
    Math.max(h.length, ...rows.map(r => (r[h] ?? '').length))
  );

  const formatRow = (cells: string[]) =>
    `${indent}  | ${cells.map((c, i) => c.padEnd(widths[i])).join(' | ')} |`;

  return [
    `${indent}Examples:`,
    formatRow(headers),
    ...rows.map(row => formatRow(headers.map(h => row[h] ?? '')))
  ];
}

export function preprocessFeatureContent(content: string): string {
  const lines = content.split('\n');
  const output: string[] = [];

  for (const line of lines) {
    const match = EXCEL_PATTERN.exec(line);
    if (!match) {
      output.push(line);
      continue;
    }

    const indent = match[1];
    const excelPath = match[2];
    const sheetName = match[3];

    // Resolve relative to project root (process.cwd()), not the feature file dir
    const rows = readExcelSheet(excelPath, sheetName);

    if (rows.length === 0) {
      output.push(`${indent}Examples:`);
      output.push(`${indent}  # No data rows found in ${excelPath}`);
      continue;
    }

    output.push(...buildExamplesTable(indent, rows));
  }

  return output.join('\n');
}

export function preprocessFeatureFile(featurePath: string, outputPath: string): void {
  const content = fs.readFileSync(featurePath, 'utf-8');
  const processed = preprocessFeatureContent(content);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, processed, 'utf-8');
}

export function preprocessAllFeatures(sourceDir: string, outputDir: string): string[] {
  const processed: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.feature')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Only process and output files that actually use Excel Examples
        if (!content.includes('Examples: excel:')) {
          console.log(`  ⏭  skipped (no excel: Examples): ${path.relative(sourceDir, fullPath)}`);
          continue;
        }
        const relative = path.relative(sourceDir, fullPath);
        const outPath = path.join(outputDir, relative);
        const processed_content = preprocessFeatureContent(content);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, processed_content, 'utf-8');
        processed.push(outPath);
        console.log(`  ✅ ${relative}`);
      }
    }
  }

  walk(sourceDir);
  return processed;
}
