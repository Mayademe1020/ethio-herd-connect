# 📸 Muzzle Photo Collection Guide

## How to Collect Photos for Training

This guide explains how farmers can help collect muzzle photos to train the identification system.

---

## Why We Need Photos

```
┌─────────────────────────────────────────────────────────┐
│                    HOW IT WORKS                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Photo of Cow A ──────► ML Model ──────► Feature Vector  │
│  (unique pattern)                (128 numbers)           │
│                                                          │
│  Same cow later ──────► ML Model ──────► Similar Vector  │
│                                                          │
│  Different cow ──────► ML Model ──────► Different Vector│
│                                                          │
│  System compares vectors to find matches!                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**More photos = Better accuracy**

---

## Photo Requirements

### ✅ Good Photos Include:

| Requirement | Why | Example |
|-------------|-----|---------|
| Clear muzzle visible | System needs to see patterns | 👃 Front-facing nose |
| Good lighting | Better pattern visibility | ☀️ Natural daylight |
| Multiple angles | Different views capture more | 📷 3-5 angles |
| Sharp focus | Blurry = bad data | ❌ Not blurry |

### ❌ Bad Photos:

| Problem | Example |
|---------|---------|
| Too dark | Night photo, shadows |
| Too bright | Sun glare, overexposed |
| Blurry | Moving animal, shaky camera |
| Partial view | Only half the nose |
| Other body parts | Face, ear, body (not muzzle) |

---

## Step-by-Step Collection Guide

### For Each Animal, Take 3-5 Photos:

```
┌──────────────────────────────────────────────────────────────┐
│  ANIMAL #1: "Bale"                                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Photo 1: FRONT VIEW (straight on)                          │
│  ┌─────────────────────────────────┐                        │
│  │                                 │                        │
│  │      ╭─────────────────╮        │                        │
│  │      │    NOSE        │        │                        │
│  │      │   (centered)   │        │                        │
│  │      ╰─────────────────╯        │                        │
│  │                                 │                        │
│  └─────────────────────────────────┘                        │
│                                                              │
│  Photo 2: SIDE ANGLE (45 degrees)                           │
│  ┌─────────────────────────────────┐                        │
│  │                                 │                        │
│  │      ╭─────────────────╮        │                        │
│  │     ╱                   ╲       │                        │
│  │    ╱      MUZZLE         ╲     │                        │
│  │    ╲        VIEW          ╱     │                        │
│  │     ╲                   ╱       │                        │
│  │      ╰─────────────────╯        │                        │
│  │                                 │                        │
│  └─────────────────────────────────┘                        │
│                                                              │
│  Photo 3: CLOSE UP (muzzle fills frame)                     │
│  ┌─────────────────────────────────┐│
│  │  ╭─────────────────────────╮   │                        │
│  │  │                         │   │                        │
│  │  │    CLOSE MUZZLE VIEW    │   │                        │
│  │  │                         │   │                        │
│  │  ╰─────────────────────────╯   │                        │
│  └─────────────────────────────────┘                        │
│                                                              │
│  Photo 4: DIFFERENT LIGHTING                                 │
│  (if possible - shade vs sunlight)                          │
│                                                              │
│  Photo 5: SLIGHTLY FARTHER                                  │
│  (full head visible)                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Organization (Folder Structure)

Create folders for each animal:

```
dataset/raw/
│
├── cow_001/          ← One folder per animal
│   ├── cow_001_01.jpg
│   ├── cow_001_02.jpg
│   ├── cow_001_03.jpg
│   └── cow_001_04.jpg
│
├── cow_002/
│   ├── cow_002_01.jpg
│   ├── cow_002_02.jpg
│   └── cow_002_03.jpg
│
└── cow_003/
    ├── cow_003_01.jpg
    └── cow_003_02.jpg
```

### Naming Convention:
- `cow_XXX_YY.jpg`
  - `XXX` = Animal number (001, 002, 003...)
  - `YY` = Photo number (01, 02, 03...)

---

## Tips for Better Photos

### 1. Lighting
```
GOOD:                    BAD:
┌─────────────┐          ┌─────────────┐
│             │          │             │
│  ☀️ Natural  │          │  🌙 Too    │
│  daylight   │          │  dark      │
│  outdoors   │          │             │
│             │          │  ❌ Not    │
│  ✅ Best:   │          │  visible   │
│  10am-3pm   │          │             │
└─────────────┘          └─────────────┘

┌─────────────┐          ┌─────────────┐
│             │          │             │
│  ☁️ Cloudy   │          │  💡 Direct  │
│  (soft)     │          │  sunlight   │
│             │          │             │
│  ✅ Good:   │          │  ❌ Too     │
│  even       │          │  bright     │
│  lighting   │          │             │
└─────────────┘          └─────────────┘
```

### 2. Positioning
```
GOOD:                    BAD:
┌─────────────┐          ┌─────────────┐
│             │          │             │
│  👃 Front   │          │  👂 Side    │
│  view       │          │  view       │
│  centered   │          │  ❌ Not     │
│             │          │  muzzle     │
│  ✅ Nose    │          │             │
│  visible    │          │             │
└─────────────┘          └─────────────┘

┌─────────────┐          ┌─────────────┐
│             │          │             │
│  📏 Good    │          │  📏 Too    │
│  distance   │          │  close      │
│  (shows     │          │  ❌ Too    │
│  full nose) │          │  close     │
│             │          │             │
└─────────────┘          └─────────────┘
```

### 3. Animal Cooperation
- If possible, have someone hold/tie the animal
- Offer food to keep them still
- Work with calm animals first
- Take multiple photos quickly (animal may move)

---

## Minimum Requirements

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Animals | 10 | 50 |
| Photos per animal | 3 | 5-10 |
| Total photos | 30 | 250-500 |
| Image quality | 640x640 px | 1920x1080 px |
| File format | JPG | JPG |

---

## Photo Checklist

Before saving each photo, check:

```
□ Muzzle (nose) is visible and clear
□ Good lighting (not too dark or bright)
□ Nose is centered in frame
□ Photo is not blurry
□ Shows distinctive muzzle pattern
□ At least 50% of frame is muzzle
□ No other animals in frame
□ Nose print/pattern clearly visible
```

---

## What Happens to Photos?

```
Photos Collected
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│                    TRAINING                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Photos are processed (resized, labeled)             │
│                                                          │
│  2. ML model learns to recognize muzzle patterns         │
│     ├── Photo → Feature Vector                          │
│     ├── "This is Bale's pattern"                        │
│     └── "This is different from Alem's pattern"         │
│                                                          │
│  3. Model tested for accuracy                           │
│     ├── 90% of the time correct? ✓                      │
│     └── Needs more data? 🔄                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Your photos help farmers protect their livestock from theft!**

---

## How to Submit Photos

1. **Create folders** for each animal
2. **Name files** using the convention
3. **Compress** into ZIP file
4. **Share** via:
   - Email: [your-email@example.com]
   - Cloud: Google Drive, Dropbox
   - USB: Bring to office

---

## FAQ

**Q: Do photos need to be perfect?**
A: No! We can use many imperfect photos. Just ensure muzzle is visible.

**Q: Can I use phone camera?**
A: Yes! Most phone cameras work great. Use highest resolution setting.

**Q: What if the animal won't stay still?**
A: Take multiple photos quickly. Even blurry ones help.

**Q: Do I need consent from other farmers?**
A: Only if photos show their animals. Get verbal permission first.

**Q: How long does collection take?**
A: About 2 minutes per animal (3-5 photos).

---

## Summary

```
📸 FOR EACH ANIMAL:
   ├── 3-5 photos from different angles
   ├── Good lighting (natural daylight)
   ├── Clear view of muzzle/nose
   └── Name folder with animal ID

🎯 MINIMUM:
   ├── 10 animals
   ├── 30 total photos
   └── Variety in angles

✅ SHARING:
   ├── ZIP file
   └── Send via email/cloud
```

---

**Questions?** Contact us for help!

This data helps build a system that protects Ethiopian farmers from livestock theft. 🐄
