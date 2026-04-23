# 📸 Dataset Collection Guide for Ethiopian Farmers

## Why Ethiopian Data Matters

Ethiopian cattle have **unique muzzle patterns** compared to:
- US/European cattle (different breeds)
- Indian cattle (Zebu vs Sanga)
- African cattle (crossbreeds)

**Your model MUST include Ethiopian cattle to achieve high accuracy.**

---

## Photo Collection Requirements

### Equipment
| Item | Specification | Cost Estimate |
|------|--------------|----------------|
| Smartphone | Any with 12MP+ camera | Farmer's phone |
| Lighting | Natural daylight (best) or flashlight | Free |
| Helper | One person to hold/treat animal | Free |

### Environment
- **Best**: Bright daylight, outdoors, animal tied in shade
- **Acceptable**: Indoor with good lighting
- **Avoid**: Direct sunlight (creates shadows), darkness

---

## Step-by-Step Photo Guide

### For Each Animal, Capture 3-5 Photos:

#### Photo 1: Front View (Primary)
```
    ┌─────────────────────────┐
    │                         │
    │      ┌─────────┐         │
    │      │ MUZZLE  │         │  ← Center the nose/muzzle
    │      │ AREA    │         │
    │      └─────────┘         │
    │                         │
    └─────────────────────────┘
    Distance: 30-50cm
```

#### Photo 2: Slight Angle (Left)
```
    ┌─────────────────────────┐
    │              ┌─────┐    │
    │              │MUZZL│    │  ← 15-30 degrees from side
    │              └─────┘    │
    │                         │
    └─────────────────────────┘
```

#### Photo 3: Slight Angle (Right)
```
    ┌─────────────────────────┐
    │    ┌─────┐              │
    │    │MUZZL│              │  ← Opposite side
    │    └─────┘              │
    │                         │
    └─────────────────────────┘
```

#### Photo 4: Close-up Detail (Optional)
```
    ┌─────────────────────────┐
    │   ╔═══════════════╗    │
    │   ║   RIDGES &    ║    │  ← Extreme close-up of
    │   ║   PATTERNS    ║    │    muzzle texture
    │   ╚═══════════════╝    │
    └─────────────────────────┘
    Distance: 10-20cm
```

---

## Quality Checklist ✅

### Good Photo:
- [ ] Muzzle (nose area) is clearly visible
- [ ] Good lighting (no harsh shadows)
- [ ] In focus (not blurry)
- [ ] Fills 40-80% of frame
- [ ] Animal is calm, not moving

### Bad Photo (Discard):
- [ ] Muzzle partially hidden
- [ ] Too dark or washed out
- [ ] Motion blur
- [ ] Only shows body/head, not muzzle
- [ ] Glare/reflection obscuring details

---

## Organization for Collection

### Folder Structure:
```
farmer_name/
├── farm_id_001/
│   ├── animal_id_A1/
│   │   ├── photo_001.jpg
│   │   ├── photo_002.jpg
│   │   ├── photo_003.jpg
│   │   └── metadata.txt      # (optional: weight, age, breed)
│   ├── animal_id_A2/
│   │   └── ...
│   └── animal_id_A3/
│       └── ...
├── farm_id_002/
│   └── ...
```

### Metadata to Record (in metadata.txt):
```
animal_id: A1
breed: Arsi
age_years: 4
gender: female
weight_kg: 280
photo_date: 2024-01-15
notes: Pregnant, calm temperament
```

---

## Collection Workflow for Field Workers

### 1. Setup
- [ ] Bring charged phone/tablet
- [ ] Create folder with farm name
- [ ] Have metadata form ready

### 2. Per Animal
1. **Restrain animal** gently (don't stress)
2. **Clean muzzle** if muddy (wipe with cloth)
3. **Position** animal in good light
4. **Capture 3-5 photos** following guide above
5. **Record metadata** on form
6. **Check photos** - delete bad ones, retake if needed

### 3. Daily Upload
- [ ] Backup photos to laptop/cloud
- [ ] Organize into proper folder structure
- [ ] Upload to designated storage

---

## Minimum Dataset Target

| Stage | Animals | Photos| Purpose |
|-------|---------|--------|---------|
| Initial Test | 50 | 200 | Verify pipeline |
| MVP Training | 200 | 800 | Basic accuracy |
| Production | 500+ | 2000+ | High accuracy |
| Scale | 1000+ | 4000+ | Production-ready |

---

## Tips for Better Data

### Lighting Tips:
```
GOOD:     BAD:
┌─────┐   ┌─────┐
│ ░░░ │   │▓▓▓▓ │   ← Avoid: dark or
│ ░ ░ │   │▓ ▓▓ │   ← washed out
│ ░░░ │   │▓▓▓▓ │
└─────┘   └─────┘
```

### Distance Tips:
```
TOO CLOSE:    PERFECT:      TOO FAR:
┌─────┐      ┌─────┐      ┌─────┐
│▓▓▓▓▓▓│      │░░░░░│      │ .  │
│▓▓▓▓▓▓│      │░░░░░│      │  . │
│▓▓▓▓▓▓│      │░░░░░│      │ .  │
└─────┘      └─────┘      └─────┘
10-20cm      30-50cm      1m+
(cropped)    (good)       (too small)
```

---

## Incentivizing Farmers

### Make It Worth Their While:
1. **Free health check** for their animals
2. **Priority registration** in the app
3. **Theft protection certificate** for participating animals
4. **Community recognition** (village leader acknowledgment)

### Sample Script for Farmers:
```
"እንስሳዎትን ለመጠበቅ እና ለማንሰራፍ እድል ነው።

ለእያንዳንዱ እንስሳ 3-5 ፎቶ ማንሳት እንፈልጋለን።

ይህ ፎቶዎች የሚረብሹ ሰዎችን ለመለየት እና እንስሳዎትን ለመጠበቅ ይረዳል።

የእኛ ባለሙያ ይሄዱበታል ፎቶ ማንሰራፍ ለእሱ ነፃ ነው።"
```

---

## Data Privacy Notice

**Farmer Consent Form (Required):**

```
I give permission for photos of my cattle to be used for
the Ethio-Herd livestock identification system.

- Photos will be stored securely with encryption
- Will only be used for animal identification
- My personal information will not be shared
- I can request deletion at any time

Farmer Name: _______________
Date: _______________
Signature: _______________
```

---

## Storage & Upload

### Recommended Storage:
- Google Drive (free tier: 15GB)
- Dropbox
- Supabase Storage (your existing setup)

### Upload Checklist:
- [ ] Photos named correctly: `{farm_id}/{animal_id}/{photo_001}.jpg`
- [ ] Metadata file per animal
- [ ] Consent forms collected
- [ ] Quality review completed

---

## Next: Run Training

Once you have **200+ animals**, run:

```bash
python scripts/prepare_dataset.py --input ./datasets/raw --output ./datasets/processed
python scripts/train_detector.py --data ./datasets/processed --epochs 50
```

---

## Questions?

Contact: [Your contact info]
Documentation: [Link to docs]
