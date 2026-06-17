import { Given } from '@cucumber/cucumber';
import { readCsvFile, findCsvRow, CsvRow } from '../utils/csv-reader';
import { ReportLogger } from '../utils/report-logger';

declare module '@cucumber/cucumber' {
  // augment world for type-aware access
  interface World {
    testDataRow?: CsvRow;
    testDataRows?: CsvRow[];
  }
}

/**
 * Load a single row from a CSV file into the scenario's world state.
 * The row can be selected by `row_id`/`id` column value, or by 1-based index.
 *
 * Example:
 *   Given I load test data from CSV file "testdata/leads.csv" row "1"
 *
 * After this step, any value containing ${field_name} in supported steps
 * (I enter, I select, I click on, I see ... as ...) is resolved from the row.
 */
Given('I load test data from CSV file {string} row {string}', async function (filePath: string, rowId: string) {
  const rows = readCsvFile(filePath);
  const row = findCsvRow(rows, rowId);
  if (!row) {
    throw new Error(`CSV row "${rowId}" not found in ${filePath}. Available row_ids: ${rows.map(r => r['row_id'] ?? r['id'] ?? '?').join(', ')}`);
  }
  this.testDataRows = rows;
  this.testDataRow = row;
  ReportLogger.logInfo(`📄 Loaded test data row "${rowId}" from ${filePath} (${Object.keys(row).length} fields)`);
});

/**
 * Load all rows from a CSV file (useful for steps that iterate internally).
 */
Given('I load test data from CSV file {string}', async function (filePath: string) {
  const rows = readCsvFile(filePath);
  this.testDataRows = rows;
  this.testDataRow = rows[0];
  ReportLogger.logInfo(`📄 Loaded ${rows.length} test data rows from ${filePath}`);
});

/**
 * Switch which loaded row is the active row for ${field} resolution.
 */
Given('I use test data row {string}', async function (rowId: string) {
  if (!this.testDataRows) {
    throw new Error('No CSV data loaded. Call "I load test data from CSV file ..." first.');
  }
  const row = findCsvRow(this.testDataRows, rowId);
  if (!row) {
    throw new Error(`CSV row "${rowId}" not found in loaded data.`);
  }
  this.testDataRow = row;
  ReportLogger.logInfo(`📄 Switched active test data row to "${rowId}"`);
});
