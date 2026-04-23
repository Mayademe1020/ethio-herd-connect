/**
 * Microservice: Deploy Service
 * Responsibility: Handle deployment to hosting platforms
 * Single File: No dependencies on other microservices
 */

import { execSync } from 'child_process';

interface DeployConfig {
  platform: 'vercel' | 'netlify' | 'manual';
  environment: 'production' | 'staging';
  skipBuild: boolean;
}

interface DeployResult {
  success: boolean;
  url: string;
  platform: string;
  timestamp: string;
  errors: string[];
}

/**
 * Task 1: Check platform CLI availability
 * Files affected: None
 * Action: Verify Vercel/Netlify CLI installed
 */
export function checkPlatformCLI(platform: string): boolean {
  try {
    const command = platform === 'vercel' ? 'vercel --version' : 'netlify --version';
    execSync(command, { stdio: 'ignore' });
    console.log(`✅ ${platform} CLI available`);
    return true;
  } catch {
    console.error(`❌ ${platform} CLI not found. Install with:`);
    console.error(`   npm i -g ${platform}`);
    return false;
  }
}

/**
 * Task 2: Deploy to Vercel
 * Files affected: dist/ → Vercel CDN
 * Action: Execute vercel --prod
 */
export async function deployToVercel(environment: string): Promise<DeployResult> {
  const errors: string[] = [];
  
  try {
    console.log('🚀 Deploying to Vercel...');
    
    const flag = environment === 'production' ? '--prod' : '';
    const output = execSync(`vercel ${flag} --yes`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    // Extract URL from output
    const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
    const url = urlMatch ? urlMatch[0] : '';
    
    console.log('✅ Deployed to Vercel:', url);
    
    return {
      success: true,
      url,
      platform: 'vercel',
      timestamp: new Date().toISOString(),
      errors: []
    };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    console.error('❌ Vercel deployment failed:', message);
    
    return {
      success: false,
      url: '',
      platform: 'vercel',
      timestamp: new Date().toISOString(),
      errors
    };
  }
}

/**
 * Task 3: Deploy to Netlify
 * Files affected: dist/ → Netlify CDN
 * Action: Execute netlify deploy --prod
 */
export async function deployToNetlify(environment: string): Promise<DeployResult> {
  const errors: string[] = [];
  
  try {
    console.log('🚀 Deploying to Netlify...');
    
    const flag = environment === 'production' ? '--prod' : '';
    const output = execSync(`netlify deploy ${flag} --dir=dist`, {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    
    // Extract URL from output
    const urlMatch = output.match(/https:\/\/[^\s]+\.netlify\.app/);
    const url = urlMatch ? urlMatch[0] : '';
    
    console.log('✅ Deployed to Netlify:', url);
    
    return {
      success: true,
      url,
      platform: 'netlify',
      timestamp: new Date().toISOString(),
      errors: []
    };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    console.error('❌ Netlify deployment failed:', message);
    
    return {
      success: false,
      url: '',
      platform: 'netlify',
      timestamp: new Date().toISOString(),
      errors
    };
  }
}

/**
 * Task 4: Verify deployment
 * Files affected: None (network request)
 * Action: HTTP GET to deployed URL
 */
export async function verifyDeployment(url: string): Promise<boolean> {
  try {
    console.log('🔍 Verifying deployment...');
    
    const response = await fetch(url, { method: 'HEAD' });
    
    if (response.status === 200) {
      console.log('✅ Deployment verified and accessible');
      return true;
    } else {
      console.error(`❌ Deployment returned status ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to verify deployment:', error);
    return false;
  }
}

// Single action export
export async function executeDeploy(config: DeployConfig): Promise<DeployResult> {
  console.log(`🚀 Starting deployment to ${config.platform}...\n`);
  
  if (!checkPlatformCLI(config.platform)) {
    return {
      success: false,
      url: '',
      platform: config.platform,
      timestamp: new Date().toISOString(),
      errors: ['CLI not available']
    };
  }
  
  let result: DeployResult;
  
  if (config.platform === 'vercel') {
    result = await deployToVercel(config.environment);
  } else if (config.platform === 'netlify') {
    result = await deployToNetlify(config.environment);
  } else {
    result = {
      success: false,
      url: '',
      platform: config.platform,
      timestamp: new Date().toISOString(),
      errors: ['Unknown platform']
    };
  }
  
  if (result.success) {
    await verifyDeployment(result.url);
  }
  
  return result;
}
