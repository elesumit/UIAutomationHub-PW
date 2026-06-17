import * as fs from 'fs';
import * as path from 'path';

/**
 * Shared data store for persisting data across scenarios
 * Uses a JSON file to store key-value pairs
 */
export class SharedDataStore {
  private static dataFile = path.join(process.cwd(), 'test-results', 'shared-data.json');

  /**
   * Store a value that persists across scenarios
   */
  static set(key: string, value: string): void {
    const data = this.loadData();
    data[key] = value;
    this.saveData(data);
  }

  /**
   * Retrieve a stored value
   */
  static get(key: string): string | undefined {
    const data = this.loadData();
    return data[key];
  }

  /**
   * Check if a key exists
   */
  static has(key: string): boolean {
    const data = this.loadData();
    return key in data;
  }

  /**
   * Delete a specific key
   */
  static delete(key: string): void {
    const data = this.loadData();
    delete data[key];
    this.saveData(data);
  }

  /**
   * Clear all stored data
   */
  static clear(): void {
    this.saveData({});
  }

  /**
   * Load data from file
   */
  private static loadData(): Record<string, string> {
    try {
      if (fs.existsSync(this.dataFile)) {
        const content = fs.readFileSync(this.dataFile, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      // If file doesn't exist or is invalid, return empty object
    }
    return {};
  }

  /**
   * Save data to file
   */
  private static saveData(data: Record<string, string>): void {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save shared data:', error);
    }
  }
}
