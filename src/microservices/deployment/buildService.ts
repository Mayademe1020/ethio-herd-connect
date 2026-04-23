/**
 * Microservice: Build Service
 * Responsibility: Handle production build with optimizations
 * Single File: No dependencies on other microservices
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BuildConfig {
  environment: 'production' | 'staging';
  analyze: boolean;
  sourceMap: boolean;
}

interface BuildResult {
  success: boolean;
  duration: number;
  bundleSize: number;
  outputPath: string;
  errors: string[];
}

/**
 * Task 1: Validate environment variables
 * Files affected: .env.production
 * Action: Check required variables exist
 */
export function validateEnvironment(): boolean {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing env variables:', missing);
    return false;
  }
  
  console.log('✅ Environment variables valid');
  return true;
}

/**
 * Task 2: Clean previous build
 * Files affected: dist/
 * Action: Remove old build artifacts
 */
export function cleanBuild(): boolean {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true });
    }
    console.log('✅ Cleaned previous build');
    return true;
  } catch (error) {
    console.error('❌ Failed to clean build:', error);
    return false;
  }
}

/**
 * Task 3: Run production build
 * Files affected: dist/ (output)
 * Action: Execute vite build
 */
export async function runBuild(config: BuildConfig): Promise<BuildResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  try {
    // Set production environment
    process.env.NODE_ENV = config.environment;
    
    // Run build
    const command = config.analyze 
      ? 'npm run build:analyze'
      : 'npm run build';
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Calculate bundle size
    const distPath = path.join(process.cwd(), 'dist');
    const bundleSize = calculateDirectorySize(distPath);
    
    console.log('✅ Build completed successfully');
    
    return {
      success: true,
      duration: Date.now() - startTime,
      bundleSize,
      outputPath: distPath,
      errors: []
    };
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    console.error('❌ Build failed:', error);
    
    return {
      success: false,
      duration: Date.now() - startTime,
      bundleSize: 0,
      outputPath: '',
      errors
    };
  }
}

/**
 * Task 4: Verify build output
 * Files affected: dist/index.html, dist/assets/
 * Action: Check critical files exist
 */
export function verifyBuild(): boolean {
  const requiredFiles = [
    'dist/index.html',
    'dist/assets/js',
    'dist/assets/css'
  ];
  
  const missing = requiredFiles.filter(file => 
    !fs.existsSync(path.join(process.cwd(), file))
  );
  
  if (missing.length > 0) {
    console.error('❌ Missing build files:', missing);
    return false;
  }
  
  console.log('✅ Build output verified');
  return true;
}

function calculateDirectorySize(dirPath: string): number {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += calculateDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

// Single action export for CLI usage
export async function executeBuild(config: BuildConfig = {
  environment: 'production',
  analyze: false,
  sourceMap: false
}): Promise<BuildResult> {
  console.log('🚀 Starting build process...\n');
  
  if (!validateEnvironment()) {
    return {
      success: false,
      duration: 0,
      bundleSize: 0,
      outputPath: '',
      errors: ['Environment validation failed']
    };
  }
  
  cleanBuild();
  
  const result = await runBuild(config);
  
  if (result.success) {
    verifyBuild();
  }
  
  return result;
}
