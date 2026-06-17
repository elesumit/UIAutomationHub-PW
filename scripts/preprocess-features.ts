import * as path from 'path';
import * as fs from 'fs';
import { preprocessAllFeatures } from '../utils/feature-preprocessor';

const sourceDir = path.join(process.cwd(), 'features');
const outputDir = path.join(process.cwd(), '.features-generated');

// Clean previous output
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

console.log('🔄 Preprocessing feature files (expanding excel: Examples)...');
const files = preprocessAllFeatures(sourceDir, outputDir);
console.log(`\n✅ Done — ${files.length} feature file(s) written to .features-generated/`);
