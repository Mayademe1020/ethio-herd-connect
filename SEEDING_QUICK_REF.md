# Seeding Quick Reference

## Commands

```bash
# Seed (idempotent - safe to run multiple times)
npm run seed:demo

# Force reseed (delete + recreate)
npm run seed:demo:force

# Reset (delete all demo data)
npm run reset:demo

# Verify (detailed report)
npm run verify:demo
```

## When to Use What

| Scenario | Command |
|----------|---------|
| First time setup | `npm run seed:demo` |
| Data already exists | `npm run seed:demo` (skips existing) |
| Want fresh data | `npm run seed:demo:force` |
| Between demos | `npm run seed:demo:force` |
| After schema changes | `npm run seed:demo:force` |
| Check data status | `npm run verify:demo` |
| Clean up | `npm run reset:demo` |

## What Gets Created

- **3 accounts** - Ethiopian farmers
- **20 animals** - Cattle, goats, sheep
- **84 milk records** - 7 days × 2 sessions
- **10 listings** - Active marketplace listings

## Key Features

✅ **Idempotent** - Run multiple times safely  
✅ **Smart** - Skips existing data  
✅ **Force mode** - Clean slate option  
✅ **Detailed reports** - Know exactly what you have  
✅ **Schema aware** - Validates before inserting  

## Troubleshooting

**"No SERVICE_ROLE_KEY"**  
→ Add to `.env` or create accounts manually

**"Schema validation failed"**  
→ Apply missing migration

**"Already exists, skipping"**  
→ Normal! Use `--force` if you want fresh data

## Full Guide

Read: `ENHANCED_SEEDING_GUIDE.md`

