#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * Analyzes the production build and provides insights on:
 * - Bundle sizes
 * - Chunk distribution
 * - Performance recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const TARGET_SIZES = {
  initialBundle: 200 * 1024, // 200KB
  totalBundle: 500 * 1024,   // 500KB
  perChunk: 100 * 1024,      // 100KB
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function analyzeBundle() {
  console.log(`${COLORS.cyan}╔════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║   Bundle Analysis for Ethio Herd Connect  ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════════╝${COLORS.reset}\n`);

  const distPath = path.join(path.dirname(__dirname), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log(`${COLORS.red}❌ Build not found. Run 'npm run build' first.${COLORS.reset}`);
    process.exit(1);
  }

  // Get all files
  const allFiles = getAllFiles(distPath);
  
  // Categorize files
  const jsFiles = allFiles.filter(f => f.endsWith('.js'));
  const cssFiles = allFiles.filter(f => f.endsWith('.css'));
  const assetFiles = allFiles.filter(f => !f.endsWith('.js') && !f.endsWith('.css') && !f.endsWith('.html'));
  
  // Calculate sizes
  let totalJsSize = 0;
  let totalCssSize = 0;
  let totalAssetSize = 0;
  
  const jsFileSizes = jsFiles.map(file => {
    const size = getFileSize(file);
    totalJsSize += size;
    return {
      name: path.basename(file),
      size,
      path: file.replace(distPath, '')
    };
  }).sort((a, b) => b.size - a.size);
  
  cssFiles.forEach(file => {
    totalCssSize += getFileSize(file);
  });
  
  assetFiles.forEach(file => {
    totalAssetSize += getFileSize(file);
  });
  
  const totalSize = totalJsSize + totalCssSize + totalAssetSize;
  
  // Display results
  console.log(`${COLORS.blue}📊 Bundle Size Summary${COLORS.reset}`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`Total Size:      ${formatBytes(totalSize)}`);
  console.log(`JavaScript:      ${formatBytes(totalJsSize)} (${Math.round(totalJsSize / totalSize * 100)}%)`);
  console.log(`CSS:             ${formatBytes(totalCssSize)} (${Math.round(totalCssSize / totalSize * 100)}%)`);
  console.log(`Assets:          ${formatBytes(totalAssetSize)} (${Math.round(totalAssetSize / totalSize * 100)}%)`);
  console.log();
  
  // JavaScript chunks
  console.log(`${COLORS.blue}📦 JavaScript Chunks (Top 10)${COLORS.reset}`);
  console.log(`${'─'.repeat(50)}`);
  jsFileSizes.slice(0, 10).forEach((file, index) => {
    const status = file.size > TARGET_SIZES.perChunk 
      ? `${COLORS.red}⚠️  ${COLORS.reset}` 
      : `${COLORS.green}✓${COLORS.reset}`;
    console.log(`${status} ${index + 1}. ${file.name}`);
    console.log(`   Size: ${formatBytes(file.size)}`);
  });
  console.log();
  
  // Performance assessment
  console.log(`${COLORS.blue}🎯 Performance Assessment${COLORS.reset}`);
  console.log(`${'─'.repeat(50)}`);
  
  const assessments = [
    {
      name: 'Initial Bundle Size',
      actual: totalJsSize,
      target: TARGET_SIZES.initialBundle,
      metric: 'JavaScript'
    },
    {
      name: 'Total Bundle Size',
      actual: totalSize,
      target: TARGET_SIZES.totalBundle,
      metric: 'All files'
    },
    {
      name: 'Largest Chunk',
      actual: jsFileSizes[0]?.size || 0,
      target: TARGET_SIZES.perChunk,
      metric: jsFileSizes[0]?.name || 'N/A'
    }
  ];
  
  let allPassed = true;
  
  assessments.forEach(assessment => {
    const passed = assessment.actual <= assessment.target;
    const status = passed 
      ? `${COLORS.green}✓ PASS${COLORS.reset}` 
      : `${COLORS.red}✗ FAIL${COLORS.reset}`;
    
    if (!passed) allPassed = false;
    
    console.log(`${status} ${assessment.name}`);
    console.log(`   Target: ${formatBytes(assessment.target)}`);
    console.log(`   Actual: ${formatBytes(assessment.actual)}`);
    console.log(`   ${assessment.metric}`);
    console.log();
  });
  
  // Recommendations
  if (!allPassed) {
    console.log(`${COLORS.yellow}💡 Recommendations${COLORS.reset}`);
    console.log(`${'─'.repeat(50)}`);
    
    if (totalJsSize > TARGET_SIZES.initialBundle) {
      console.log(`• Consider lazy loading more routes`);
      console.log(`• Check for duplicate dependencies`);
      console.log(`• Use dynamic imports for heavy components`);
    }
    
    if (jsFileSizes[0]?.size > TARGET_SIZES.perChunk) {
      console.log(`• Split large chunks further`);
      console.log(`• Review manual chunk configuration`);
      console.log(`• Consider code splitting for ${jsFileSizes[0].name}`);
    }
    
    console.log();
  }
  
  // Final verdict
  console.log(`${'═'.repeat(50)}`);
  if (allPassed) {
    console.log(`${COLORS.green}✓ All performance targets met!${COLORS.reset}`);
    console.log(`${COLORS.green}  Ready for deployment to Ethiopian farmers.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.yellow}⚠️  Some performance targets not met.${COLORS.reset}`);
    console.log(`${COLORS.yellow}  Review recommendations above.${COLORS.reset}`);
  }
  console.log(`${'═'.repeat(50)}\n`);
  
  // Check if stats.html exists
  const statsPath = path.join(distPath, 'stats.html');
  if (fs.existsSync(statsPath)) {
    console.log(`${COLORS.cyan}📈 Detailed visualization available at: dist/stats.html${COLORS.reset}\n`);
  }
}

// Run analysis
try {
  analyzeBundle();
} catch (error) {
  console.error(`${COLORS.red}Error analyzing bundle:${COLORS.reset}`, error.message);
  process.exit(1);
}
