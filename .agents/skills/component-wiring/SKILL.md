# Component Wiring Inspector Skill

This skill checks if UI components are properly wired to functionality.

## What it checks

1. **Empty onClick handlers**: Buttons/elements with `onClick={() => {}}` or `onClick={() => {}}`
2. **Toast "Coming soon"**: Buttons that only show a toast message without actual functionality
3. **Toggle switches**: Switch components that don't persist state
4. **Forms**: Forms without proper onSubmit handlers
5. **State management**: Components that set state but never use it

## Usage

```bash
npx tsx .agents/skills/component-wiring/check.ts
```

## How it works

1. Scans all `.tsx` files for common component patterns
2. Identifies potentially non-functional handlers
3. Reports findings with file locations

## Example Output

```
🔍 Checking component wiring...

✅ Scanned 50 files

⚠️  Empty onClick handlers found:
   - src/pages/Profile.tsx:252 - Download data button
   - src/pages/Profile.tsx:323 - Privacy policy link

⚠️  "Coming soon" handlers found:
   - src/pages/Profile.tsx:252 - Download data
   - src/pages/Settings.tsx:XXX - Some feature

Found 4 potential wiring issues
```
