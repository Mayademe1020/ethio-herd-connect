# 🐄 Ethio-Herd Muzzle ML Training

## Overview

This directory contains the ML training pipeline for muzzle identification.

## Training Pipeline

```
training/
├── README.md                    # This file
├── DATASET_COLLECTION.md        # Guide for collecting photos from farmers
├── datasets/
│   ├── raw/                     # Raw photos from farmers
│   ├── processed/               # Preprocessed & labeled
│   └── external/                # Open-source datasets (download separately)
├── models/
│   ├── detector/                # YOLOv8 muzzle detector
│   └── extractor/               # CNN feature extractor
├── notebooks/
│   ├── 01_prepare_dataset.ipynb  # Dataset preparation
│   ├── 02_train_detector.ipynb   # Train YOLOv8
│   └── 03_train_extractor.ipynb  # Train CNN + ArcFace
├── scripts/
│   ├── prepare_dataset.py        # Dataset preparation script
│   ├── train_detector.py         # YOLOv8 training
│   ├── train_extractor.py        # CNN training
│   └── convert_model.py          # TF.js conversion
└── config.yaml                   # Training configuration
```

## Quick Start

### 1. Install Dependencies

```bash
# Create Python environment
python -m venv muzzle_env
source muzzle_env/bin/activate  # Linux/Mac
# OR
.\muzzle_env\Scripts\Activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Download Open-Source Datasets (Optional but Recommended)

You can bootstrap with existing datasets:

**Option A: Zenodo Beef Cattle Dataset (268 cattle, 4923 images)**
- Link: https://zenodo.org/records/6324361
- Download, extract to `datasets/external/zenodo_cattle/`

**Option B: PMC Cattle Biometrics (8000+ images)**
- Link: https://pmc.ncbi.nlm.nih.gov/articles/PMC10869238/
- Search for "Cows Frontal Face Dataset" on Zenodo

### 3. Collect Your Own Data

See `DATASET_COLLECTION.md` for detailed instructions.

Minimum requirements:
- **500+ unique animals** (more = better accuracy)
- **3-5 photos per animal** (different angles/lighting)
- **Ethiopian cattle breeds** (critical for your use case)

### 4. Prepare Dataset

```bash
python scripts/prepare_dataset.py \
    --input datasets/raw \
    --output datasets/processed \
    --format yolo
```

### 5. Train Detector (YOLOv8)

```bash
python scripts/train_detector.py \
    --data datasets/processed \
    --epochs 100 \
    --model yolov8n.pt \
    --output models/detector
```

### 6. Train Feature Extractor (CNN + ArcFace)

```bash
python scripts/train_extractor.py \
    --data datasets/processed \
    --epochs 50 \
    --output models/extractor
```

### 7. Convert to Browser Format

```bash
python scripts/convert_model.py \
    --detector models/detector/best.pt \
    --extractor models/extractor/best.h5 \
    --output ../src/public/models/
```

## Expected Accuracy

| Dataset Size | Expected Accuracy |
|--------------|-------------------|
| 100 animals  | 70-80%            |
| 500 animals  | 85-92%            |
| 1000+ animals| 92-97%            |

## Training Time Estimates (RTX 3080 or similar)

- Detector (YOLOv8): 2-4 hours
- Extractor (CNN): 4-8 hours
- Total: 6-12 hours

## Next Steps

1. Start collecting photos from Ethiopian farmers
2. Download Zenodo dataset to bootstrap
3. Run initial training with combined data
4. Test accuracy on real Ethiopian cattle
5. Iterate with more local data
