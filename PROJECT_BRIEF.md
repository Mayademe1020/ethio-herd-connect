# PROJECT BRIEF

**Last Updated:** 2026-06-01
**Current Phase:** Pre-launch — getting 3 farmers to test

---

## What We're Building

A livestock management app that prevents theft through muzzle biometric identification, built for Ethiopian farmers with basic smartphones and limited connectivity.

## Who It's For

**Primary user:** Ethiopian livestock farmer with a 2GB Android phone, limited English, living in an area with spotty internet. Has 5-20 cattle or goats. Has lost animals to theft or knows someone who has.

**Secondary user:** Livestock buyer who wants to verify an animal's identity before purchase.

## The Problem We Solve

Every year, thousands of Ethiopian farmers lose animals to theft. There's no way to prove ownership or identify a stolen animal. Existing solutions require expensive hardware or constant internet. EthioHerd Connect uses the animal's muzzle (unique like a fingerprint) to create a verifiable identity — running entirely in the browser on any smartphone.

---

## What's Working

- Complete app with 360+ TypeScript files
- Offline-first PWA that works without internet
- 4 languages (Amharic, English, Oromo, Swahili)
- Marketplace with pricing in Ethiopian Birr (ETB)
- ML training pipeline ready (YOLOv8 + MobileNetV2)
- TensorFlow.js browser-based inference
- Live deployment on Lovable
- 80+ database migrations on Supabase
- Monetization service defined (50-150 ETB listings, 200 ETB verification, 2% transfer fee)
- Theft prevention education in onboarding
- Muzzle registration marked as REQUIRED
- Marketplace verification enforced before listing

## What's Not Working

- Zero real users (no farmer has tested it)
- ML model not trained (pipeline exists, no data)
- Payment is simulated (no TeleBirr/CBE integration)
- Transfer UI pages not connected to service layer
- Old Android browser compatibility untested
- No business plan or go-to-market strategy
- Onboarding may be confusing for low-literacy users
- No way to measure if farmers actually complete registration

## Key Decisions Made

| Date | Decision | Why | Outcome |
|------|----------|-----|---------|
| 2026-06-01 | Use Lovable.dev for building | Non-coder, need fast iteration | App is built and deployed |
| 2026-06-01 | Offline-first architecture | Rural Ethiopia has spotty connectivity | Works without internet |
| 2026-06-01 | Muzzle biometric as core feature | Unique differentiator, theft prevention | Pipeline ready, needs data |
| 2026-06-01 | 4 languages from day one | Ethiopia is multilingual | Amharic, English, Oromo, Swahili |
| 2026-06-01 | Ethiopian Birr pricing | Local currency needed | 50-150 ETB listings, 200 ETB verification |

---

## Revenue Model

| Stream | Price (ETB) | Status | Monthly Target |
|--------|-------------|--------|----------------|
| Listing fees (Basic) | 50 | Simulated | 2,000 (40 listings) |
| Listing fees (Premium) | 150 | Simulated | 3,000 (20 listings) |
| Muzzle verification | 200 | Simulated | 4,000 (20 scans) |
| Ownership transfer fee | 2% (min 50) | Simulated | 5,000 (10 transfers) |
| Advertising (CPC) | 2/click | Not started | 1,000 (500 clicks) |
| NGO sponsorship | 5,000/month | Not started | 5,000 (1 sponsor) |
| **TOTAL** | | | **20,000 ETB/month** |

**Minimum breakdown income target:** 5,000 ETB/month

---

## Next 7 Days

1. Find 3 farmers with smartphones to test the app
2. Send them the link: https://fsgiz597dhrj.space.minimax.io
3. Watch them use it (screen record if possible)
4. Document what they struggle with
5. Fix the top 3 issues they report

---

## What We Learned Last Session

**Session 2 (2026-06-01):** Research prompt revealed hard truths:
- Zero users is the #1 blocker. Everything else is downstream.
- No trust path — farmers won't install from strangers. Need a cooperative chairman or development agent (ልማት ሰራተኛ) to introduce the app.
- Telebirr is Phase 0, not Phase 2. Simulated payments = unvalidated business model.
- 40% of farmers have feature phones, not smartphones. PWA excludes them.
- ML training needs 500+ labeled photos — but only AFTER users exist.
- Onboarding must align with market days (Monday Bishoftu, Thursday Hosaena).
- The 3-Skill Protocol itself is procrastination if not used on real tasks.

**ACTION NEEDED:** Send app link to 10 people via WhatsApp/Telegram today.

---

## The Josh Shpigford Principle

> "The idea of spending months working on something before you put it out for other people to use, I think that's a real bad idea."

**Our translation:** Stop building. Start testing. Get 3 farmers this week.
