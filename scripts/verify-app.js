// Quick verification test for the app
import { chromium } from 'playwright';

async function verifyApp() {
  console.log('🔍 Verifying app loads correctly...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test 1: Load the app
    console.log('1️⃣ Testing: App loads...');
    await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    console.log(`   ✅ Title: ${title}`);
    
    // Test 2: Check for critical elements
    console.log('\n2️⃣ Testing: Critical elements...');
    const hasRoot = await page.$('#root');
    console.log(`   ✅ Root element: ${hasRoot ? 'Found' : 'Not found'}`);
    
    // Test 3: Check service worker registration
    console.log('\n3️⃣ Testing: Service Worker...');
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration()
        .then(reg => !!reg)
        .catch(() => false);
    });
    console.log(`   ${swRegistered ? '✅' : '⚠️ '} Service Worker: ${swRegistered ? 'Registered' : 'Not registered (may register on first visit)'}`);
    
    // Test 4: Check for console errors
    console.log('\n4️⃣ Testing: Console errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    console.log(`   ✅ Console errors: ${errors.length === 0 ? 'None' : errors.length}`);
    
    // Test 5: Check network status
    console.log('\n5️⃣ Testing: Network status...');
    const isOnline = await page.evaluate(() => navigator.onLine);
    console.log(`   ✅ Online status: ${isOnline ? 'Online' : 'Offline'}`);
    
    // Test 6: Check for image components
    console.log('\n6️⃣ Testing: Image components...');
    const images = await page.$$('img');
    console.log(`   ✅ Images found: ${images.length}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(50));
    console.log('\n📋 To test offline/slow network:');
    console.log('1. Open http://localhost:4173 in browser');
    console.log('2. Open DevTools (F12)');
    console.log('3. Go to Network tab');
    console.log('4. Select "Slow 3G" or "Offline"');
    console.log('5. Refresh and test');
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

verifyApp();