# Translation Consistency Checker Skill

This skill checks if all text in the app uses the translation system and that translations are consistent across all language files.

## What it checks

1. **Hardcoded strings**: Finds text that's not using the i18n system
2. **Missing translations**: Checks if keys exist in all language files (am, en, or, sw)
3. **Console warnings**: Identifies potential translation issues

## Usage

```bash
npx tsx .agents/skills/translation-check/check.ts
```

## How it works

1. Parses translation JSON files (am.json, en.json, or.json, sw.json)
2. Scans TSX files for hardcoded strings
3. Reports missing translations

## Example Output

```
🔍 Checking translation consistency...

✅ Found translations in 4 languages

Missing translations:
  - settings.title: missing in or.json
  - settings.title: missing in sw.json
  - notifications.label: missing in am.json

Found 3 translation issues
```
