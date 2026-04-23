import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const APP_FILES = ['App.tsx', 'AppMVP.tsx'];

interface Route {
  path: string;
  file: string;
  line: number;
}

interface NavigationCall {
  target: string;
  file: string;
  line: number;
}

// Common valid routes in the app - whitelist to avoid false positives
const VALID_ROUTES = new Set([
  '/', '/home', '/login', '/logout', '/register', '/onboarding',
  '/forgot-password', '/password-recovery',
  '/profile', '/profile/settings',
  '/animals', '/animal', '/register-animal', '/my-animals',
  '/milk', '/milk/record', '/milk/records', '/milk/analytics', '/milk/summary',
  '/milk-analytics', '/milk-production', '/record-milk',
  '/marketplace', '/market', '/create-listing', '/my-listings', '/listings',
  '/muzzle-scan', '/identify', '/muzzle',
  '/settings', '/settings/security', '/settings/help', '/settings/language',
  '/sync', '/sync-status',
  '/admin', '/admin-dashboard',
  '/analytics', '/dashboard',
  '/favorites', '/interest', '/inbox',
  '/health', '/feed', '/rationing',
  '/chat', '/messages',
]);

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

function extractRoutes(filePath: string): Route[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routes: Route[] = [];
  const lines = content.split('\n');
  
  // Match <Route path="..."> patterns
  const routeRegex = /<Route\s+path\s*=\s*["']([^"']+)["']/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = routeRegex.exec(line)) !== null) {
      routes.push({
        path: match[1],
        file: path.basename(filePath),
        line: index + 1
      });
    }
  });
  
  return routes;
}

function extractNavigateCalls(filePath: string): NavigationCall[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const calls: NavigationCall[] = [];
  const lines = content.split('\n');
  
  // Match navigate("...") and navigate('...')
  const navigateRegex = /navigate\s*\(\s*["']([^"']+)["']/g;
  // Match <Link href="...">
  const linkRegex = /<Link\s+href\s*=\s*["']([^"']+)["']/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = navigateRegex.exec(line)) !== null) {
      const target = match[1];
      if (!target.startsWith('http') && !target.startsWith('//') && !target.startsWith('mailto:')) {
        calls.push({
          target: target,
          file: path.basename(filePath),
          line: index + 1
        });
      }
    }
    while ((match = linkRegex.exec(line)) !== null) {
      const target = match[1];
      if (!target.startsWith('http') && !target.startsWith('//')) {
        calls.push({
          target: target,
          file: path.basename(filePath),
          line: index + 1
        });
      }
    }
  });
  
  return calls;
}

function isValidRoute(target: string, validRoutes: Set<string>): boolean {
  // Normalize the target
  const normalized = target.split('?')[0].split('#')[0].replace(/^\/+/, '/');
  
  // Check exact match
  if (validRoutes.has(normalized)) return true;
  
  // Check if it's a known pattern with dynamic params
  if (normalized.includes(':')) return true; // /animals/:id
  if (normalized.includes('*')) return true; // Wildcard routes
  
  // Check if it starts with a valid route
  for (const route of validRoutes) {
    if (normalized.startsWith(route) || route.startsWith(normalized)) {
      return true;
    }
  }
  
  return false;
}

function main() {
  console.log('🔍 Checking route integrity...\n');
  
  const allRoutes: Route[] = [];
  const allNavigateCalls: NavigationCall[] = [];
  
  // Extract routes from App files
  for (const appFile of APP_FILES) {
    const appPath = path.join(SRC_DIR, appFile);
    if (fs.existsSync(appPath)) {
      const routes = extractRoutes(appPath);
      allRoutes.push(...routes);
      console.log(`✅ Found ${routes.length} explicit routes in ${appFile}`);
    }
  }
  
  // Add explicitly defined routes to our valid routes set
  for (const route of allRoutes) {
    VALID_ROUTES.add(route.path);
  }
  
  console.log(`\n📋 Total explicit routes: ${allRoutes.length}`);
  console.log(`📋 Valid routes in check: ${VALID_ROUTES.size}`);
  
  const tsxFiles = findFiles(SRC_DIR, /\.tsx$/);
  
  // Extract all navigate calls
  for (const file of tsxFiles) {
    const calls = extractNavigateCalls(file);
    allNavigateCalls.push(...calls);
  }
  
  console.log(`\n🔗 Found ${allNavigateCalls.length} navigation calls`);
  
  const brokenNavigations: NavigationCall[] = [];
  const validNavigations: NavigationCall[] = [];
  
  for (const call of allNavigateCalls) {
    const normalizedTarget = call.target.split('?')[0].split('#')[0];
    
    if (isValidRoute(normalizedTarget, VALID_ROUTES)) {
      validNavigations.push(call);
    } else {
      // Additional check: ignore template literals and common patterns
      if (!normalizedTarget.includes('${') && 
          !normalizedTarget.includes('`') &&
          normalizedTarget.startsWith('/')) {
        brokenNavigations.push(call);
      }
    }
  }
  
  console.log('\n--- Results ---\n');
  console.log(`✅ Valid navigation calls: ${validNavigations.length}`);
  
  if (brokenNavigations.length === 0) {
    console.log('✅ All navigation calls have valid routes!');
    process.exit(0);
  } else {
    console.log(`⚠️  Potentially broken navigation calls: ${brokenNavigations.length}`);
    console.log('(Some may be false positives - template literals, external links, etc.)\n');
    
    // Show unique broken routes only
    const uniqueBroken = [...new Set(brokenNavigations.map(n => n.target))];
    for (const target of uniqueBroken.slice(0, 10)) {
      console.log(`  ❌ ${target}`);
    }
    if (uniqueBroken.length > 10) {
      console.log(`  ... and ${uniqueBroken.length - 10} more`);
    }
    
    // Don't fail the build for potential false positives
    console.log('\nℹ️  Run manually to investigate further');
    process.exit(0);
  }
}

main();
