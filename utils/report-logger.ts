import { HealingResult } from './self-healing';

export interface Annotation {
  type: string;
  description: string;
}

export class ReportLogger {
  private static annotations: Annotation[] = [];

  static logHealedLocator(healingResult: HealingResult): void {
    const annotation: Annotation = {
      type: 'healed-locator',
      description: `${healingResult.elementName} healed from "${healingResult.originalLocator}" to "${healingResult.healedLocator}"`,
    };
    
    this.annotations.push(annotation);
    console.log(`[HEALED] ${annotation.description}`);
  }

  static logInfo(message: string): void {
    const annotation: Annotation = {
      type: 'info',
      description: message,
    };
    
    this.annotations.push(annotation);
    console.log(`[INFO] ${message}`);
  }

  static logWarning(message: string): void {
    const annotation: Annotation = {
      type: 'warning',
      description: message,
    };
    
    this.annotations.push(annotation);
    console.warn(`[WARNING] ${message}`);
  }

  static logError(message: string): void {
    const annotation: Annotation = {
      type: 'error',
      description: message,
    };
    
    this.annotations.push(annotation);
    console.error(`[ERROR] ${message}`);
  }

  static getAnnotations(): Annotation[] {
    return [...this.annotations];
  }

  static clearAnnotations(): void {
    this.annotations = [];
  }

  static attachToPlaywrightTest(testInfo: any): void {
    this.annotations.forEach(annotation => {
      testInfo.annotations.push(annotation);
    });
  }
}
