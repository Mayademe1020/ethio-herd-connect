import { Page } from '@playwright/test';

/**
 * Ethiopian phone number generator for testing
 */
export function generateEthiopianPhone(): string {
  const prefixes = ['911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `+251${prefix}${number}`;
}

/**
 * Generate random Ethiopian names for testing
 */
export function generateEthiopianName(): string {
  const firstNames = ['Abebe', 'Kebede', 'Tigist', 'Meseret', 'Dawit', 'Hana', 'Yohannes', 'Mulu', 'Solomon', 'Aster'];
  const lastNames = ['Bekele', 'Tesfaye', 'Mengistu', 'Haile', 'Gebremariam', 'Asfaw', 'Tadesse', 'Worku', 'Demissie', 'Alemu'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

/**
 * Generate random farm names
 */
export function generateFarmName(): string {
  const adjectives = ['Green', 'Golden', 'Peaceful', 'Fertile', 'Happy', 'Sunny', 'Rich', 'Blessed', 'Prosperous', 'Abundant'];
  const nouns = ['Farm', 'Ranch', 'Pasture', 'Herd', 'Valley', 'Hill', 'Meadow', 'Field', 'Garden', 'Estate'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

/**
 * Authentication helper functions
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async login(phoneNumber: string = generateEthiopianPhone()): Promise<void> {
    // Navigate to login page
    await this.page.goto('/');

    // Click login button
    await this.page.getByRole('button', { name: /login|register/i }).click();

    // Enter phone number
    await this.page.getByLabel(/phone|mobile/i).fill(phoneNumber);

    // Click continue
    await this.page.getByRole('button', { name: /continue|send otp/i }).click();

    // Wait for OTP screen
    await this.page.waitForURL(/.*otp|verification.*/);

    // Enter OTP (in real scenario, this would be mocked or retrieved)
    await this.page.getByLabel(/otp|code/i).fill('123456');

    // Click verify
    await this.page.getByRole('button', { name: /verify|confirm/i }).click();

    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  async completeOnboarding(farmName: string = generateFarmName()): Promise<void> {
    // Fill farm name
    await this.page.getByLabel(/farm.*name/i).fill(farmName);

    // Complete onboarding
    await this.page.getByRole('button', { name: /complete|finish|get started/i }).click();

    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
  }

  async logout(): Promise<void> {
    // Navigate to profile/settings
    await this.page.getByRole('button', { name: /profile|settings/i }).click();

    // Click logout
    await this.page.getByRole('button', { name: /logout|sign out/i }).click();

    // Confirm logout if needed
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }
}

/**
 * Screenshot helper for debugging
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png`, fullPage: true });
}

/**
 * Wait for loading states to complete
 */
export async function waitForLoading(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  // Wait for any loading spinners to disappear
  await page.locator('[data-testid="loading"], .loading, .spinner').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // Ignore if no loading elements found
  });
}

/**
 * Generate test animal data
 */
export function generateAnimalData(type: 'cattle' | 'goat' | 'sheep' | 'poultry' = 'cattle') {
  const names = {
    cattle: ['Bella', 'Max', 'Luna', 'Charlie', 'Daisy'],
    goat: ['Billy', 'Nanny', 'Kid', 'Boer', 'Alpine'],
    sheep: ['Wooly', 'Lamb', 'Ewe', 'Ram', 'Merino'],
    poultry: ['Hen', 'Rooster', 'Chick', 'Layer', 'Broiler']
  };

  const breeds = {
    cattle: ['Holstein', 'Jersey', 'Boran', 'Local', 'Crossbreed'],
    goat: ['Boer', 'Alpine', 'Nubian', 'Local', 'Crossbreed'],
    sheep: ['Merino', 'Dorper', 'Local', 'Crossbreed', 'Awassi'],
    poultry: ['Layer', 'Broiler', 'Local', 'Crossbreed', 'Dual-purpose']
  };

  return {
    name: names[type][Math.floor(Math.random() * names[type].length)],
    breed: breeds[type][Math.floor(Math.random() * breeds[type].length)],
    age: Math.floor(Math.random() * 5) + 1, // 1-5 years
    weight: type === 'poultry' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 500) + 100, // kg or kg
    gender: Math.random() > 0.5 ? 'male' : 'female',
    type
  };
}