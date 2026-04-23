import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

interface Issue {
  type: string;
  description: string;
  file: string;
  line: number;
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return results;
}

function checkFile(filePath: string): Issue[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: Issue[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    if (line.includes('onClick={() =>') || line.includes('onClick={ () =>')) {
      if (line.includes('onClick={() => }') || 
          line.includes('onClick={() =>{}}') ||
          line.includes('onClick={() => {}}') ||
          line.includes('onClick={() => { }}')) {
        issues.push({
          type: 'empty-handler',
          description: 'Empty onClick handler',
          file: path.basename(filePath),
          line: lineNum
        });
      }
      
      if (line.includes('toast') && (line.includes('Coming soon') || line.includes('coming soon'))) {
        issues.push({
          type: 'coming-soon',
          description: 'Toast "Coming soon" handler - not implemented',
          file: path.basename(filePath),
          line: lineNum
        });
      }
    }
    
    if (line.includes('onClick={() => navigate') && line.includes("'/'")) {
      const pathMatch = line.match(/navigate\(['"`]([^'"`]+)['"`]/);
      if (pathMatch && pathMatch[1] === '/') {
        issues.push({
          type: 'navigate-root',
          description: 'Navigates to root without action',
          file: path.basename(filePath),
          line: lineNum
        });
      }
    }
  });
  
  return issues;
}

function main() {
  console.log('🔍 Checking component wiring...\n');
  
  const tsxFiles = findFiles(SRC_DIR, /\.tsx$/);
  console.log(`✅ Scanned ${tsxFiles.length} files\n`);
  
  const allIssues: Issue[] = [];
  
  for (const file of tsxFiles) {
    const issues = checkFile(file);
    allIssues.push(...issues);
  }
  
  const emptyHandlers = allIssues.filter(i => i.type === 'empty-handler');
  const comingSoon = allIssues.filter(i => i.type === 'coming-soon');
  
  console.log('--- Results ---\n');
  
  if (allIssues.length === 0) {
    console.log('✅ All components appear to be properly wired!');
    process.exit(0);
  } else {
    if (emptyHandlers.length > 0) {
      console.log(`⚠️  Empty onClick handlers (${emptyHandlers.length}):`);
      for (const issue of emptyHandlers) {
        console.log(`   - ${issue.file}:${issue.line}`);
      }
      console.log('');
    }
    
    if (comingSoon.length > 0) {
      console.log(`⚠️  "Coming soon" handlers (${comingSoon.length}):`);
      for (const issue of comingSoon) {
        console.log(`   - ${issue.file}:${issue.line}`);
      }
      console.log('');
    }
    
    console.log(`Found ${allIssues.length} potential wiring issues`);
    process.exit(1);
  }
}

main();
