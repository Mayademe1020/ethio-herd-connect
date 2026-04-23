/**
 * Day 7 Coordinator - Exhibition Preparation Pipeline
 * 
 * Coordinates all microservices for Day 7 tasks:
 * - Build service
 * - Deploy service  
 * - QR code service
 * - Demo script service
 * - Smoke test service
 */

import { executeBuild, BuildConfig } from './deployment/buildService';
import { executeDeploy, DeployConfig } from './deployment/deployService';
import { executeQRGeneration } from './exhibition/qrCodeService';
import { executeDemoScriptGeneration } from './exhibition/demoScriptService';
import { executeSmokeTests } from './testing/smokeTestService';

interface Day7Config {
  deployPlatform: 'vercel' | 'netlify';
  skipBuild: boolean;
  skipDeploy: boolean;
  skipExhibitionMaterials: boolean;
  skipTests: boolean;
}

interface Day7Results {
  success: boolean;
  buildSuccess: boolean;
  deployUrl: string;
  qrGenerated: boolean;
  demoMaterialsCreated: boolean;
  smokeTestsPassed: boolean;
  timestamp: string;
}

/**
 * Microservice Action 1: Build
 * Files: vite.config.ts → dist/
 */
async function runBuild(config: Day7Config): Promise<boolean> {
  if (config.skipBuild) {
    console.log('⏭️  Skipping build (use --skip-build=false to enable)\n');
    return true;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MICROSERVICE 1: BUILD SERVICE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const buildConfig: BuildConfig = {
    environment: 'production',
    analyze: false,
    sourceMap: false
  };
  
  const result = await executeBuild(buildConfig);
  return result.success;
}

/**
 * Microservice Action 2: Deploy
 * Files: dist/ → CDN (Vercel/Netlify)
 */
async function runDeploy(config: Day7Config): Promise<{ success: boolean; url: string }> {
  if (config.skipDeploy) {
    console.log('⏭️  Skipping deploy (use --skip-deploy=false to enable)\n');
    return { success: true, url: '' };
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MICROSERVICE 2: DEPLOY SERVICE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const deployConfig: DeployConfig = {
    platform: config.deployPlatform,
    environment: 'production',
    skipBuild: true // Already built
  };
  
  const result = await executeDeploy(deployConfig);
  return {
    success: result.success,
    url: result.url
  };
}

/**
 * Microservice Action 3: Exhibition Materials
 * Files: exhibition/ (QR code, poster, demo script)
 */
async function runExhibitionMaterials(url: string, config: Day7Config): Promise<boolean> {
  if (config.skipExhibitionMaterials) {
    console.log('⏭️  Skipping exhibition materials\n');
    return true;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MICROSERVICE 3: EXHIBITION MATERIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // Generate QR code and poster
    if (url) {
      await executeQRGeneration(url);
    } else {
      console.log('⚠️  No URL provided, skipping QR generation');
    }
    
    // Generate demo script
    executeDemoScriptGeneration();
    
    return true;
  } catch (error) {
    console.error('❌ Exhibition materials failed:', error);
    return false;
  }
}

/**
 * Microservice Action 4: Smoke Tests
 * Files: None (network requests only)
 */
async function runSmokeTests(url: string, config: Day7Config): Promise<boolean> {
  if (config.skipTests || !url) {
    console.log('⏭️  Skipping smoke tests\n');
    return true;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MICROSERVICE 4: SMOKE TEST SERVICE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const results = await executeSmokeTests(url);
  return results.failed === 0;
}

/**
 * Main Coordinator - Execute Day 7 Pipeline
 */
export async function executeDay7Pipeline(config: Day7Config = {
  deployPlatform: 'vercel',
  skipBuild: false,
  skipDeploy: false,
  skipExhibitionMaterials: false,
  skipTests: false
}): Promise<Day7Results> {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     DAY 7: EXHIBITION PREPARATION PIPELINE     ║');
  console.log('║              Microservices Architecture        ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const timestamp = new Date().toISOString();
  
  // Step 1: Build
  const buildSuccess = await runBuild(config);
  if (!buildSuccess && !config.skipBuild) {
    return {
      success: false,
      buildSuccess: false,
      deployUrl: '',
      qrGenerated: false,
      demoMaterialsCreated: false,
      smokeTestsPassed: false,
      timestamp
    };
  }
  
  // Step 2: Deploy
  const { success: deploySuccess, url: deployUrl } = await runDeploy(config);
  
  // Step 3: Exhibition Materials
  const materialsSuccess = await runExhibitionMaterials(deployUrl, config);
  
  // Step 4: Smoke Tests
  const testsSuccess = await runSmokeTests(deployUrl, config);
  
  // Final summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              DAY 7 FINAL SUMMARY               ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const allSuccess = buildSuccess && deploySuccess && materialsSuccess && testsSuccess;
  
  console.log(`✅ Build:        ${buildSuccess ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Deploy:       ${deploySuccess ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Materials:    ${materialsSuccess ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Smoke Tests:  ${testsSuccess ? 'PASS' : 'FAIL'}`);
  console.log(`\n🌐 Deploy URL:   ${deployUrl || 'N/A'}`);
  console.log(`📁 Materials:    exhibition/`);
  console.log(`\n${allSuccess ? '🎉 DAY 7 COMPLETE - READY FOR EXHIBITION!' : '⚠️  Some steps failed - check logs above'}`);
  
  return {
    success: allSuccess,
    buildSuccess,
    deployUrl,
    qrGenerated: materialsSuccess && !!deployUrl,
    demoMaterialsCreated: materialsSuccess,
    smokeTestsPassed: testsSuccess,
    timestamp
  };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: Day7Config = {
    deployPlatform: args.includes('--netlify') ? 'netlify' : 'vercel',
    skipBuild: args.includes('--skip-build'),
    skipDeploy: args.includes('--skip-deploy'),
    skipExhibitionMaterials: args.includes('--skip-materials'),
    skipTests: args.includes('--skip-tests')
  };
  
  executeDay7Pipeline(config).then(results => {
    process.exit(results.success ? 0 : 1);
  });
}
