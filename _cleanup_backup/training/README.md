# Ethio Herd Connect - Muzzle Identification Training Pipeline

This directory contains the ML training pipeline for muzzle-based livestock identification.

## Quick Start

### Step 1: Install Dependencies

```bash
cd training
pip install ultralytics tensorflow tensorflowjs pillow pyyaml torch torchvision
```

### Step 2: Collect Data

Follow the guide in `DATASET_GUIDE.md` to collect muzzle photos.

Organize photos like this:
```
dataset/raw/
├── cow_001/
│   ├── cow_001_01.jpg
│   ├── cow_001_02.jpg
│   └── cow_001_03.jpg
├── cow_002/
│   ├── cow_002_01.jpg
│   └── cow_002_02.jpg
└── ...
```

### Step 3: Prepare Dataset

```bash
python prepare_dataset.py --input dataset/raw --output dataset/processed
```

### Step 4: Train Models

```bash
# Train YOLOv8 detector (finds muzzle region)
python train_detector.py --epochs 50

# Train CNN feature extractor (identifies the cow)
python train_extractor.py --epochs 50
```

### Step 5: Convert for Browser

```bash
python convert_model.py --model output/extractor/model.keras --output ../src/models
```

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING PIPELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DATA COLLECTION                                              │
│     ┌─────────┐     ┌─────────────┐                             │
│     │ Photos  │────►│ prepare_    │                             │
│     │ (raw)   │     │ dataset.py  │                             │
│     └─────────┘     └─────────────┘                             │
│                           │                                     │
│                           ▼                                     │
│                     ┌───────────┐                               │
│                     │ Dataset   │                               │
│                     │ (train/   │                               │
│                     │  val)     │                               │
│                     └───────────┘                               │
│                           │                                     │
│           ┌───────────────┴───────────────┐                     │
│           ▼                               ▼                     │
│  2. TRAIN DETECTOR                  3. TRAIN EXTRACTOR          │
│  ┌─────────────────┐               ┌─────────────────┐          │
│  │ train_detector  │               │ train_extractor │          │
│  │ .py             │               │ .py             │          │
│  │                 │               │                 │          │
│  │ YOLOv8 to find  │               │ CNN to extract  │          │
│  │ muzzle region   │               │ features        │          │
│  └─────────────────┘               └─────────────────┘          │
│           │                               │                     │
│           ▼                               ▼                     │
│  ┌─────────────────┐               ┌─────────────────┐          │
│  │ detector.pt     │               │ extractor.h5    │          │
│  │ (ONNX)          │               │ (Keras)         │          │
│  └─────────────────┘               └─────────────────┘          │
│           │                               │                     │
│           └───────────────┬───────────────┘                     │
│                           ▼                                     │
│  4. CONVERT FOR BROWSER                                          │
│  ┌─────────────────────────────────────┐                        │
│  │ convert_model.py                    │                        │
│  │                                     │                        │
│  │ Converts to TensorFlow.js format    │                        │
│  │ Optimizes for 2GB phones            │                        │
│  └─────────────────────────────────────┘                        │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────┐                        │
│  │ src/models/                         │                        │
│  │ ├── group1-shard1of1.bin           │                        │
│  │ ├── group1-shard2of1.bin           │                        │
│  │ └── model.json                      │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Scripts

| Script | Purpose |
|--------|---------|
| `prepare_dataset.py` | Organizes raw photos into train/val sets |
| `train_detector.py` | Trains YOLOv8 to detect muzzle regions |
| `train_extractor.py` | Trains CNN with ArcFace for identification |
| `convert_model.py` | Converts models to TensorFlow.js format |
| `config.yaml` | Training configuration |

## Model Specifications

### Detector (YOLOv8)
- **Purpose**: Find muzzle region in image
- **Output**: Bounding box coordinates
- **Size**: ~6MB (nano model)
- **Speed**: ~10ms per image

### Extractor (CNN + ArcFace)
- **Purpose**: Extract unique features for identification
- **Output**: 128-dimensional feature vector
- **Size**: ~4MB (quantized)
- **Speed**: ~5ms per image

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8GB | 16GB |
| GPU | None (CPU training works) | NVIDIA GPU with 4GB VRAM |
| Storage | 10GB | 50GB |

## Training Times (estimated)

| Model | CPU | GPU |
|-------|-----|-----|
| YOLOv8 (50 epochs) | 4-6 hours | 30 min |
| CNN Extractor (50 epochs) | 2-3 hours | 15 min |

## Troubleshooting

### Out of Memory
Reduce batch size in `config.yaml`:
```yaml
batch_size: 8  # instead of 16
```

### Model too large for phones
Increase quantization in `convert_model.py`:
```bash
python convert_model.py --quantize uint8
```

### Poor accuracy
- Collect more photos per animal (5-10 recommended)
- Ensure good lighting in photos
- Vary angles and distances
