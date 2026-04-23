#!/usr/bin/env node
/**
 * Script to replace console statements with logger
 * Usage: node scripts/replace-console.js [file-pattern]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to match console statements
const consolePatterns = [
  { pattern: /console\.log\((.*?)\);?/g, replacement: "logger.debug($1);" },
  { pattern: /console\.info\((.*?)\);?/g, replacement: "logger.info($1);" },
  { pattern: /console\.warn\((.*?)\);?/g, replacement: "logger.warn($1);" },
  { pattern: /console\.error\((.*?)\);?/g, replacement: "logger.error($1);" },
  { pattern: /console\.debug\((.*?)\);?/g, replacement: "logger.debug($1);" }
];

// Files to exclude
const excludePatterns = [
  'node_modules/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  'src/utils/logger.ts'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  // Check if file already imports logger
  const hasLoggerImport = content.includes('from \'@/utils/logger\'') || 
                          content.includes('from "@/utils/logger"');

  // Replace console statements
  consolePatterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      modified = true;
      changes.push(...matches);
    }
  });

  // Add logger import if needed
  if (modified && !hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^(import .* from .*;?)$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const loggerImport = "import { logger } from '@/utils/logger';";
      content = content.replace(lastImport, lastImport + '\n' + loggerImport);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath} (${changes.length} replacements)`);
    return changes.length;
  }

  return 0;
}

function main() {
  const pattern = process.argv[2] || 'src/**/*.{ts,tsx}';
  
  console.log(`Processing files matching: ${pattern}`);
  console.log('Excluding:', excludePatterns.join(', '));
  console.log('');

  const files = glob.sync(pattern, {
    ignore: excludePatterns,
    absolute: true
  });

  let totalReplacements = 0;
  let filesModified = 0;

  files.forEach(file => {
    try {
      const count = processFile(file);
      if (count > 0) {
        totalReplacements += count;
        filesModified++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  });

  console.log('');
  console.log('========================================');
  console.log(`Files modified: ${filesModified}`);
  console.log(`Total replacements: ${totalReplacements}`);
  console.log('========================================');
}

main();
