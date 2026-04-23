# Route Integrity Checker Skill

This skill verifies that all navigation links in the application point to valid routes.

## What it checks

1. **Route Definitions**: All `<Route path="...">` in App*.tsx files have valid paths
2. **Navigate Calls**: All `navigate("...")` calls in components have matching routes
3. **Link Components**: All `<Link href="...">` point to valid destinations
4. **Navigation Components**: BottomNavigation and menu items have valid routes

## Usage

```bash
npx tsx .agents/skills/route-integrity/check.ts
```

## How it works

1. Parses all `App*.tsx` files to extract route definitions
2. Scans all `.tsx` files for `navigate()` and `Link` components
3. Validates that every navigation target has a matching route
4. Reports any broken or missing routes

## Exit Codes

- `0`: All routes are valid
- `1`: Broken routes found (check output for details)

## Example Output

```
🔍 Checking route integrity...

✅ Found 25 routes in App*.tsx files

Routes found:
  /profile
  /profile/settings
  /animals
  ...

Checking navigate() calls...
⚠️  /settings/security - Route not found
⚠️  /settings/help - Route not found
⚠️  /settings/language - Route not found

Found 3 broken navigate() calls
```
