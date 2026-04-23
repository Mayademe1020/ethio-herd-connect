import { chromium } from 'playwright';

async function testMuzzleFlow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  
  // Navigate to the app
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Take screenshot of landing page
  await page.screenshot({ path: 'test-results/01-landing-page.png' });
  console.log('Landing page loaded');
  
  // Check if we're logged in or need to login
  const url = page.url();
  console.log('Current URL:', url);
  
  // Check for login page
  const hasLogin = await page.locator('input[type="tel"], input[name="phone"]').count() > 0;
  if (hasLogin) {
    console.log('Login page detected');
    // Enter a test phone number
    await page.locator('input[type="tel"], input[name="phone"]').first().fill('911111111');
    await page.screenshot({ path: 'test-results/02-login-page.png' });
  }
  
  // Check for navigation elements
  const navItems = await page.locator('nav a, [role="tablist"] a, .nav-link').all();
  console.log('Nav items found:', navItems.length);
  
  // Look for key pages
  const links = await page.locator('a').all();
  const linkTexts = await Promise.all(links.map(l => l.textContent()));
  console.log('Links found:', linkTexts.filter(t => t && t.trim()).slice(0, 20));
  
  // Check for muzzle-related elements
  const muzzleElements = await page.locator('text=/muzzle|Muzzle|identify|Identify/i').count();
  console.log('Muzzle-related elements:', muzzleElements);
  
  // Check for register animal button
  const registerBtn = await page.locator('text=/register|add animal/i').count();
  console.log('Register buttons:', registerBtn);
  
  await page.screenshot({ path: 'test-results/03-home-state.png', fullPage: true });
  
  await browser.close();
  console.log('Test complete');
}

testMuzzleFlow().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
