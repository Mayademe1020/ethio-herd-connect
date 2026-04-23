import * as fs from 'fs';
import * as path from 'path';

const I18N_DIR = path.join(process.cwd(), 'src/i18n');
const LANGUAGES = ['am', 'en', 'or', 'sw'];

interface TranslationKey {
  key: string;
  missingIn: string[];
}

function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function main() {
  console.log('🔍 Checking translation consistency...\n');
  
  const translations: Record<string, Record<string, any>> = {};
  
  for (const lang of LANGUAGES) {
    const filePath = path.join(I18N_DIR, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`✅ Found ${lang}.json`);
    } else {
      console.log(`⚠️  Missing ${lang}.json`);
    }
  }
  
  const allKeys = new Map<string, Set<string>>();
  
  for (const lang of LANGUAGES) {
    if (translations[lang]) {
      const keys = getAllKeys(translations[lang]);
      for (const key of keys) {
        if (!allKeys.has(key)) {
          allKeys.set(key, new Set());
        }
        allKeys.get(key)!.add(lang);
      }
    }
  }
  
  const missing: TranslationKey[] = [];
  
  for (const [key, langs] of allKeys) {
    if (langs.size < LANGUAGES.length) {
      const missingIn = LANGUAGES.filter(l => !langs.has(l));
      missing.push({ key, missingIn });
    }
  }
  
  console.log('\n--- Results ---\n');
  
  if (missing.length === 0) {
    console.log('✅ All translations are complete!');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${missing.length} translation issues:\n`);
    for (const m of missing.slice(0, 10)) {
      console.log(`  ❌ ${m.key}`);
      console.log(`     Missing in: ${m.missingIn.join(', ')}`);
    }
    if (missing.length > 10) {
      console.log(`  ... and ${missing.length - 10} more`);
    }
    process.exit(1);
  }
}

main();
