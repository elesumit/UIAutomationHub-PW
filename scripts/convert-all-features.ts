import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function getAllFeatureFiles(dir: string): string[] {
  const files: string[] = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFeatureFiles(fullPath));
    } else if (item.endsWith('.feature')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function main() {
  const featuresDir = 'features';
  const outputDir = 'tests';
  
  if (!fs.existsSync(featuresDir)) {
    console.error(`Error: Features directory not found: ${featuresDir}`);
    process.exit(1);
  }
  
  const featureFiles = getAllFeatureFiles(featuresDir);
  
  if (featureFiles.length === 0) {
    console.log('No feature files found.');
    process.exit(0);
  }
  
  console.log(`Found ${featureFiles.length} feature file(s):\n`);
  
  for (const featureFile of featureFiles) {
    console.log(`Converting: ${featureFile}`);
    try {
      execSync(`npx ts-node scripts/feature-to-test.ts ${featureFile} ${outputDir}`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error(`Failed to convert: ${featureFile}`);
    }
  }
  
  console.log('\n✓ All features converted to Playwright tests!');
}

main();
