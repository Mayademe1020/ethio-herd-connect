# Accessibility Quick Audit Skill

This skill performs basic accessibility checks on the codebase.

## What it checks

1. **Images**: All `<img>` have `alt` attribute
2. **Aria labels**: Interactive elements have accessible names
3. **Headings**: Proper heading hierarchy (h1 → h2 → h3)
4. **Buttons**: All buttons have accessible names

## Usage

```bash
npx tsx .agents/skills/a11y-audit/check.ts
```

## Example Output

```
🔍 Checking accessibility...

✅ Scanned 50 files

⚠️  Images without alt text:
   - src/components/PhotoUpload.tsx:45
   - src/pages/Marketplace.tsx:120

⚠️  Missing aria-labels:
   - src/components/Button.tsx:30

Found 5 accessibility issues
```
