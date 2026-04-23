import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

interface Issue {
  type: string;
  file: string;
  line: number;
  context: string;
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
  
  // Check full content for img tags and their alt attributes
  // Extract each img element with its attributes
  const imgRegex = /<img([^>]*)>/g;
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    const imgTag = match[0];
    const lineNum = content.substring(0, match.index).split('\n').length;
    
    // Check if alt attribute exists in the img tag
    const hasAlt = /\balt\s*[=:]?\s*["'{]/.test(imgTag);
    const hasAriaLabel = /\baria-label\s*[=:]?\s*["'{]/.test(imgTag);
    const isDecorative = /\balt\s*[=:]?\s*["']{2}['"]/.test(imgTag); // alt=""
    
    if (!hasAlt && !hasAriaLabel && !isDecorative) {
      issues.push({
        type: 'img-no-alt',
        file: path.basename(filePath),
        line: lineNum,
        context: imgTag.trim().substring(0, 60)
      });
    }
  }
  
  // Check for icon-only buttons with SVG
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    const isIconButton = (
      (line.includes('<button') || (line.includes('onClick') && line.includes('<svg'))) &&
      !line.includes('aria-label') &&
      !line.includes('aria-labelledby') &&
      !line.includes('title=') &&
      !line.includes('children') &&
      !line.includes('>')
    );
    
    if (isIconButton) {
      issues.push({
        type: 'button-no-aria',
        file: path.basename(filePath),
        line: lineNum,
        context: line.trim().substring(0, 60)
      });
    }
  });
  
  return issues;
}

function main() {
  console.log('🔍 Checking accessibility...\n');
  
  const tsxFiles = findFiles(SRC_DIR, /\.tsx$/);
  console.log(`✅ Scanned ${tsxFiles.length} files\n`);
  
  const allIssues: Issue[] = [];
  
  for (const file of tsxFiles) {
    const issues = checkFile(file);
    allIssues.push(...issues);
  }
  
  const imgIssues = allIssues.filter(i => i.type === 'img-no-alt');
  const buttonIssues = allIssues.filter(i => i.type === 'button-no-aria');
  
  console.log('--- Results ---\n');
  
  if (allIssues.length === 0) {
    console.log('✅ No accessibility issues found!');
    process.exit(0);
  } else {
    if (imgIssues.length > 0) {
      console.log(`⚠️  Images without alt text (${imgIssues.length}):`);
      for (const issue of imgIssues.slice(0, 10)) {
        console.log(`   - ${issue.file}:${issue.line}`);
      }
      if (imgIssues.length > 10) console.log(`   ... and ${imgIssues.length - 10} more`);
      console.log('');
    }
    
    if (buttonIssues.length > 0) {
      console.log(`⚠️  Icon buttons missing aria-label (${buttonIssues.length}):`);
      for (const issue of buttonIssues.slice(0, 10)) {
        console.log(`   - ${issue.file}:${issue.line}`);
      }
      if (buttonIssues.length > 10) console.log(`   ... and ${buttonIssues.length - 10} more`);
      console.log('');
    }
    
    console.log(`Found ${allIssues.length} accessibility issues`);
    process.exit(0);
  }
}

main();
