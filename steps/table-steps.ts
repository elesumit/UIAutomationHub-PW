import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';
import { ReportLogger } from '../utils/report-logger';

// ==================== TABLE/GRID STEPS ====================

When('I click on row {int} in the table', async function (rowIndex: number) {
  const row = this.page.locator('table tbody tr').nth(rowIndex - 1);
  const enhancedRow = await LocatorProWrapper.autoEnhance(this.page, row);
  await enhancedRow.click();
  ReportLogger.logInfo(`Clicked on row ${rowIndex}`);
});

When('I click on row {int} column {int} in the table', async function (rowIndex: number, colIndex: number) {
  const cell = this.page.locator('table tbody tr').nth(rowIndex - 1).locator('td').nth(colIndex - 1);
  const enhancedCell = await LocatorProWrapper.autoEnhance(this.page, cell);
  await enhancedCell.click();
  ReportLogger.logInfo(`Clicked on row ${rowIndex}, column ${colIndex}`);
});

When('I click on the cell in row {int} column {string}', async function (rowIndex: number, columnName: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const cell = this.page.locator('table tbody tr').nth(rowIndex - 1).locator('td').nth(colIndex);
  const enhancedCell = await LocatorProWrapper.autoEnhance(this.page, cell);
  await enhancedCell.click();
  ReportLogger.logInfo(`Clicked on row ${rowIndex}, column "${columnName}"`);
});

When('I click on {string} in the table row containing {string}', async function (columnName: string, searchText: string) {
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  
  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).textContent();
    if (rowText?.includes(searchText)) {
      const headers = await this.page.locator('table thead th').allTextContents();
      const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
      
      if (colIndex === -1) {
        throw new Error(`Column "${columnName}" not found in table headers`);
      }
      
      const cell = rows.nth(i).locator('td').nth(colIndex);
      const enhancedCell = await LocatorProWrapper.autoEnhance(this.page, cell);
      await enhancedCell.click();
      ReportLogger.logInfo(`Clicked on "${columnName}" in row containing "${searchText}"`);
      return;
    }
  }
  
  throw new Error(`Row containing "${searchText}" not found in table`);
});

When('I click on {string} in the row where {string} is {string}', async function (actionColumn: string, searchColumn: string, searchValue: string) {
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  const headers = await this.page.locator('table thead th').allTextContents();
  
  const searchColIndex = headers.findIndex((h: string) => h.trim() === searchColumn);
  const actionColIndex = headers.findIndex((h: string) => h.trim() === actionColumn);
  
  if (searchColIndex === -1) {
    throw new Error(`Column "${searchColumn}" not found in table headers`);
  }
  if (actionColIndex === -1) {
    throw new Error(`Column "${actionColumn}" not found in table headers`);
  }
  
  for (let i = 0; i < rowCount; i++) {
    const searchCell = rows.nth(i).locator('td').nth(searchColIndex);
    const cellText = await searchCell.textContent();
    
    if (cellText?.trim() === searchValue) {
      const actionCell = rows.nth(i).locator('td').nth(actionColIndex);
      const enhancedCell = await LocatorProWrapper.autoEnhance(this.page, actionCell);
      await enhancedCell.click();
      ReportLogger.logInfo(`Clicked on "${actionColumn}" in row where "${searchColumn}" is "${searchValue}"`);
      return;
    }
  }
  
  throw new Error(`Row where "${searchColumn}" is "${searchValue}" not found`);
});

When('I click on {string} in the row where {string} is {string} and {string} is {string}', async function (
  actionColumn: string,
  searchColumn1: string,
  searchValue1: string,
  searchColumn2: string,
  searchValue2: string
) {
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  const headers = await this.page.locator('table thead th').allTextContents();
  
  const searchCol1Index = headers.findIndex((h: string) => h.trim() === searchColumn1);
  const searchCol2Index = headers.findIndex((h: string) => h.trim() === searchColumn2);
  const actionColIndex = headers.findIndex((h: string) => h.trim() === actionColumn);
  
  if (searchCol1Index === -1) throw new Error(`Column "${searchColumn1}" not found`);
  if (searchCol2Index === -1) throw new Error(`Column "${searchColumn2}" not found`);
  if (actionColIndex === -1) throw new Error(`Column "${actionColumn}" not found`);
  
  for (let i = 0; i < rowCount; i++) {
    const cell1Text = await rows.nth(i).locator('td').nth(searchCol1Index).textContent();
    const cell2Text = await rows.nth(i).locator('td').nth(searchCol2Index).textContent();
    
    if (cell1Text?.trim() === searchValue1 && cell2Text?.trim() === searchValue2) {
      const actionCell = rows.nth(i).locator('td').nth(actionColIndex);
      const enhancedCell = await LocatorProWrapper.autoEnhance(this.page, actionCell);
      await enhancedCell.click();
      ReportLogger.logInfo(`Clicked on "${actionColumn}" in row where "${searchColumn1}" is "${searchValue1}" and "${searchColumn2}" is "${searchValue2}"`);
      return;
    }
  }
  
  throw new Error(`Row with specified criteria not found`);
});

When('I enter {string} in row {int} column {string}', async function (value: string, rowIndex: number, columnName: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const cell = this.page.locator('table tbody tr').nth(rowIndex - 1).locator('td').nth(colIndex);
  const input = cell.locator('input, textarea');
  const enhancedInput = await LocatorProWrapper.autoEnhance(this.page, input);
  await enhancedInput.fill(value);
  ReportLogger.logInfo(`Entered "${value}" in row ${rowIndex}, column "${columnName}"`);
});

When('I select {string} in row {int} column {string}', async function (value: string, rowIndex: number, columnName: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const cell = this.page.locator('table tbody tr').nth(rowIndex - 1).locator('td').nth(colIndex);
  const select = cell.locator('select');
  const enhancedSelect = await LocatorProWrapper.autoEnhance(this.page, select);
  await enhancedSelect.selectOption(value);
  ReportLogger.logInfo(`Selected "${value}" in row ${rowIndex}, column "${columnName}"`);
});

When('I sort the table by column {string}', async function (columnName: string) {
  const headers = this.page.locator('table thead th');
  const headerCount = await headers.count();
  
  for (let i = 0; i < headerCount; i++) {
    const headerText = await headers.nth(i).textContent();
    if (headerText?.trim() === columnName) {
      const enhancedHeader = await LocatorProWrapper.autoEnhance(this.page, headers.nth(i));
      await enhancedHeader.click();
      ReportLogger.logInfo(`Sorted table by column "${columnName}"`);
      return;
    }
  }
  
  throw new Error(`Column "${columnName}" not found in table headers`);
});

When('I click on page {int} in the table pagination', async function (pageNumber: number) {
  const strategies = [
    `a:has-text("${pageNumber}")`,
    `button:has-text("${pageNumber}")`,
    `[aria-label="Page ${pageNumber}"]`,
    `.pagination a:has-text("${pageNumber}")`,
    `.page-item a:has-text("${pageNumber}")`,
  ];
  
  let clicked = false;
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.click();
        ReportLogger.logInfo(`Clicked on page ${pageNumber} in pagination`);
        clicked = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!clicked) {
    throw new Error(`Page ${pageNumber} not found in pagination`);
  }
});

When('I click on {string} in the table pagination', async function (buttonText: string) {
  const strategies = [
    `button:has-text("${buttonText}")`,
    `a:has-text("${buttonText}")`,
    `.pagination button:has-text("${buttonText}")`,
    `.pagination a:has-text("${buttonText}")`,
    `[aria-label="${buttonText}"]`,
  ];
  
  let clicked = false;
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.click();
        ReportLogger.logInfo(`Clicked on "${buttonText}" in pagination`);
        clicked = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!clicked) {
    throw new Error(`Pagination button "${buttonText}" not found`);
  }
});

Then('the table should have {int} rows', async function (expectedRows: number) {
  const rows = this.page.locator('table tbody tr');
  const actualRows = await rows.count();
  expect(actualRows).toBe(expectedRows);
  ReportLogger.logInfo(`Verified table has ${expectedRows} rows`);
});

Then('the table row {int} column {int} should contain {string}', async function (rowIndex: number, colIndex: number, expectedText: string) {
  const cell = this.page.locator('table tbody tr').nth(rowIndex - 1).locator('td').nth(colIndex - 1);
  const cellText = await cell.textContent();
  expect(cellText?.trim()).toContain(expectedText);
  ReportLogger.logInfo(`Verified row ${rowIndex}, column ${colIndex} contains "${expectedText}"`);
});

Then('the table row {int} column {string} should contain {string}', async function (rowIndex: number, columnName: string, expectedText: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const cell = this.page.locator('table tbody tr').nth(rowIndex - 1).locator('td').nth(colIndex);
  const cellText = await cell.textContent();
  expect(cellText?.trim()).toContain(expectedText);
  ReportLogger.logInfo(`Verified row ${rowIndex}, column "${columnName}" contains "${expectedText}"`);
});

Then('the table should contain {string}', async function (searchText: string) {
  const table = this.page.locator('table');
  const tableText = await table.textContent();
  expect(tableText).toContain(searchText);
  ReportLogger.logInfo(`Verified table contains "${searchText}"`);
});

Then('the table row containing {string} should have {string} in column {string}', async function (searchText: string, expectedText: string, columnName: string) {
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  
  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).textContent();
    if (rowText?.includes(searchText)) {
      const headers = await this.page.locator('table thead th').allTextContents();
      const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
      
      if (colIndex === -1) {
        throw new Error(`Column "${columnName}" not found in table headers`);
      }
      
      const cell = rows.nth(i).locator('td').nth(colIndex);
      const cellText = await cell.textContent();
      expect(cellText?.trim()).toContain(expectedText);
      ReportLogger.logInfo(`Verified row containing "${searchText}" has "${expectedText}" in column "${columnName}"`);
      return;
    }
  }
  
  throw new Error(`Row containing "${searchText}" not found in table`);
});

Then('all rows in column {string} should contain {string}', async function (columnName: string, expectedText: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  
  for (let i = 0; i < rowCount; i++) {
    const cell = rows.nth(i).locator('td').nth(colIndex);
    const cellText = await cell.textContent();
    expect(cellText?.trim()).toContain(expectedText);
  }
  
  ReportLogger.logInfo(`Verified all ${rowCount} rows in column "${columnName}" contain "${expectedText}"`);
});

Then('the table column {string} should contain unique values', async function (columnName: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  const values = new Set<string>();
  
  for (let i = 0; i < rowCount; i++) {
    const cell = rows.nth(i).locator('td').nth(colIndex);
    const cellText = await cell.textContent();
    const trimmedText = cellText?.trim() || '';
    
    if (values.has(trimmedText)) {
      throw new Error(`Duplicate value "${trimmedText}" found in column "${columnName}"`);
    }
    values.add(trimmedText);
  }
  
  ReportLogger.logInfo(`Verified column "${columnName}" has ${values.size} unique values`);
});

Then('all rows in column {string} should match the pattern {string}', async function (columnName: string, pattern: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  const regex = new RegExp(pattern);
  
  for (let i = 0; i < rowCount; i++) {
    const cell = rows.nth(i).locator('td').nth(colIndex);
    const cellText = await cell.textContent();
    const trimmedText = cellText?.trim() || '';
    
    if (!regex.test(trimmedText)) {
      throw new Error(`Value "${trimmedText}" in row ${i + 1} does not match pattern "${pattern}"`);
    }
  }
  
  ReportLogger.logInfo(`Verified all ${rowCount} rows in column "${columnName}" match pattern "${pattern}"`);
});

Then('the table column {string} should be sorted in {string} order', async function (columnName: string, order: string) {
  const headers = await this.page.locator('table thead th').allTextContents();
  const colIndex = headers.findIndex((h: string) => h.trim() === columnName);
  
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found in table headers`);
  }
  
  const rows = this.page.locator('table tbody tr');
  const rowCount = await rows.count();
  const values: string[] = [];
  
  for (let i = 0; i < rowCount; i++) {
    const cell = rows.nth(i).locator('td').nth(colIndex);
    const cellText = await cell.textContent();
    values.push(cellText?.trim() || '');
  }
  
  const sortedValues = [...values].sort();
  if (order.toLowerCase() === 'descending') {
    sortedValues.reverse();
  }
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] !== sortedValues[i]) {
      throw new Error(`Column "${columnName}" is not sorted in ${order} order. Expected "${sortedValues[i]}" at position ${i + 1}, but found "${values[i]}"`);
    }
  }
  
  ReportLogger.logInfo(`Verified column "${columnName}" is sorted in ${order} order`);
});

When('I wait for the table to have {int} rows', async function (expectedRows: number) {
  const rows = this.page.locator('table tbody tr');
  await rows.nth(expectedRows - 1).waitFor({ state: 'attached', timeout: 10000 });
  const actualCount = await rows.count();
  expect(actualCount).toBe(expectedRows);
  ReportLogger.logInfo(`Table now has ${expectedRows} rows`);
});

When('I wait for the table to contain {string}', async function (searchText: string) {
  const table = this.page.locator('table');
  await expect(table).toContainText(searchText, { timeout: 10000 });
  ReportLogger.logInfo(`Table now contains "${searchText}"`);
});
