#!/usr/bin/env python3
"""
YOLOv8 Muzzle Detector Training

Trains a YOLOv8 model to detect muzzle regions in cattle photos.

Usage:
    python scripts/train_detector.py --data ./datasets/processed --epochs 100

Requirements:
    pip install ultralytics
"""

import os
import sys
import argparse
from pathlib import Path
import yaml
from datetime import datetime


def parse_args():
    parser = argparse.ArgumentParser(description='Train YOLOv8 muzzle detector')
    parser.add_argument('--data', '-d', required=True, help='Path to dataset directory')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--model', default='yolov8n.pt', help='Starting model (yolov8n/m/l/x)')
    parser.add_argument('--image-size', type=int, default=640, help='Image size')
    parser.add_argument('--output', '-o', default='./models/detector', help='Output directory')
    parser.add_argument('--config', '-c', default='config.yaml', help='Config file')
    parser.add_argument('--device', default='cuda', help='Device (cuda/cpu)')
    parser.add_argument('--resume', type=str, default=None, help='Resume from checkpoint')
    parser.add_argument('--pretrained', action='store_true', default=True, help='Use pretrained weights')
    return parser.parse_args()


def check_requirements():
    """Check if required packages are installed."""
    try:
        from ultralytics import YOLO
        return True
    except ImportError:
        print("❌ Error: ultralytics not installed")
        print("   Run: pip install ultralytics")
        return False


def create_yolo_dataset_structure(dataset_dir: Path):
    """
    Create YOLO-compatible dataset structure if not exists.
    
    YOLO expects:
        dataset/
            images/
                train/
                val/
            labels/
                train/
                val/
    """
    dataset_dir = Path(dataset_dir)
    
    # Current structure uses ImageFolder format, convert to YOLO
    for split in ['train', 'val', 'test']:
        split_dir = dataset_dir / split
        
        if not split_dir.exists():
            continue
        
        # Create images and labels directories
        images_dir = dataset_dir / 'images' / split
        labels_dir = dataset_dir / 'labels' / split
        
        images_dir.mkdir(parents=True, exist_ok=True)
        labels_dir.mkdir(parents=True, exist_ok=True)
        
        # For each class folder (animal_id), create symlinks/copies
        for class_dir in split_dir.iterdir():
            if not class_dir.is_dir():
                continue
            
            # Copy images
            for img_file in class_dir.glob('*.jpg'):
                dest_img = images_dir / img_file.name
                if not dest_img.exists():
                    # Create empty label file (full image as muzzle for now)
                    # In production, you'd have actual bounding box annotations
                    label_file = labels_dir / f'{img_file.stem}.txt'
                    
                    # Create dummy label (will be replaced with real annotations)
                    # Format: class_id x_center y_center width height (normalized)
                    # For now, assume entire image is the muzzle region
                    with open(label_file, 'w') as f:
                        f.write('0 0.5 0.5 1.0 1.0\n')
                    
                    # Copy image
                    import shutil
                    shutil.copy(img_file, dest_img)
    
    return dataset_dir


def create_dataset_yaml(dataset_dir: Path, num_classes: int):
    """Create dataset.yaml for YOLOv8 training."""
    yaml_content = {
        'path': str(dataset_dir.absolute()),
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'nc': 1,  # Just muzzle detection (binary)
        'names': {0: 'muzzle'}
    }
    
    yaml_path = dataset_dir / 'dataset.yaml'
    with open(yaml_path, 'w') as f:
        yaml.dump(yaml_content, f, default_flow_style=False)
    
    return yaml_path


def main():
    args = parse_args()
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    from ultralytics import YOLO
    
    # Setup paths
    dataset_dir = Path(args.data)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🐄 YOLOv8 Muzzle Detector Training")
    print(f"   Dataset: {dataset_dir}")
    print(f"   Output:   {output_dir}")
    print(f"   Epochs:   {args.epochs}")
    print(f"   Model:    {args.model}")
    print()
    
    # Load config
    config = {}
    if os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = yaml.safe_load(f)
    
    # Prepare dataset (convert to YOLO format)
    print("📦 Preparing dataset structure...")
    # For this example, we assume images are already cropped muzzle images
    # In production, you'd have full images with bounding box annotations
    
    # For detection, we need to create a simple dataset config
    num_classes = sum(1 for _ in (dataset_dir / 'train').iterdir()) if (dataset_dir / 'train').exists() else 1
    
    yaml_path = create_dataset_yaml(dataset_dir, num_classes)
    print(f"   Dataset config: {yaml_path}")
    
    # Initialize model
    print(f"\n🧠 Loading model: {args.model}")
    model = YOLO(args.model)
    
    # Training parameters
    train_params = {
        'data': str(yaml_path),
        'epochs': args.epochs,
        'batch': args.batch,
        'imgsz': args.image_size,
        'project': str(output_dir.parent),
        'name': output_dir.name,
        'exist_ok': True,
        'pretrained': args.pretrained,
        'optimizer': config.get('detector', {}).get('optimizer', 'Adam'),
        'lr0': config.get('detector', {}).get('learning_rate', 0.001),
        'lrf': 0.01,
        'momentum': 0.937,
        'weight_decay': config.get('detector', {}).get('weight_decay', 0.0005),
        'warmup_epochs': 3.0,
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        'box': 7.5,
        'cls': 0.5,
        'dfl': 1.5,
        'hsv_h': 0.015,
        'hsv_s': 0.7,
        'hsv_v': 0.4,
        'degrees': 10.0,
        'translate': 0.1,
        'scale': 0.5,
        'fliplr': 0.5,
        'flipud': 0.0,
        'mosaic': 1.0,
        'mixup': 0.0,
        'device': args.device,
        'verbose': True,
    }
    
    # Resume if specified
    if args.resume:
        train_params['resume'] = args.resume
    
    print(f"\n🚀 Starting training...")
    print(f"   Parameters:")
    for k, v in train_params.items():
        if k not in ['verbose', 'project', 'name', 'exist_ok']:
            print(f"      {k}: {v}")
    print()
    
    try:
        # Train
        results = model.train(**train_params)
        
        # Print results
        print("\n" + "="*50)
        print("📊 TRAINING COMPLETE")
        print("="*50)
        print(f"Model saved to: {output_dir}")
        print(f"Best weights:   {output_dir}/weights/best.pt")
        print(f"Last weights:   {output_dir}/weights/last.pt")
        
        # Export to ONNX
        print("\n📤 Exporting to ONNX...")
        onnx_path = output_dir / 'weights' / 'best.onnx'
        model.export(format='onnx', imgsz=args.image_size)
        
        print(f"   ONNX model: {output_dir}/weights/best.onnx")
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
