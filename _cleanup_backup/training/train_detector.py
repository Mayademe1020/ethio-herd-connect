"""
YOLOv8 Muzzle Detector Training
================================

Trains YOLOv8 to detect muzzle regions in cattle photos.

PREREQUISITES:
--------------
1. Install dependencies:
   pip install ultralytics torch pillow pyyaml

2. Prepare dataset:
   python prepare_dataset.py --input dataset/raw --output dataset/processed

USAGE:
------
    # Train with default config
    python train_detector.py

    # Train with custom settings
    python train_detector.py --epochs 50 --batch 8 --model yolov8s
"""

import os
import sys
import argparse
from pathlib import Path
import yaml
import torch
from ultralytics import YOLO


# Default configuration
DEFAULT_CONFIG = {
    'model_name': 'yolov8n',
    'epochs': 100,
    'batch_size': 16,
    'image_size': 640,
    'patience': 20,
    'lr0': 0.01,
    'lrf': 0.01,
    'hsv_h': 0.015,
    'hsv_s': 0.7,
    'hsv_v': 0.4,
    'degrees': 10,
    'translate': 0.1,
    'scale': 0.5,
    'flipud': 0.0,
    'fliplr': 0.5,
    'mosaic': 0.5,
    'output_path': 'output/detector'
}


def load_config(config_path: str = 'config.yaml') -> dict:
    """Load configuration from YAML file."""
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config.get('detector', DEFAULT_CONFIG)
    except FileNotFoundError:
        print(f"Config file not found: {config_path}")
        print("Using default configuration")
        return DEFAULT_CONFIG


def check_dataset(dataset_path: str) -> bool:
    """Check if dataset exists and is properly formatted."""
    dataset_dir = Path(dataset_path)
    
    required_paths = [
        dataset_dir / 'dataset.yaml',
        dataset_dir / 'images' / 'train',
        dataset_dir / 'images' / 'val',
    ]
    
    for path in required_paths:
        if not path.exists():
            print(f"Error: Required path not found: {path}")
            return False
    
    # Count images
    train_images = list((dataset_dir / 'images' / 'train').glob('*.jpg'))
    val_images = list((dataset_dir / 'images' / 'val').glob('*.jpg'))
    
    if len(train_images) == 0:
        print("Error: No training images found")
        return False
    
    print(f"Dataset check:")
    print(f"  - Training images: {len(train_images)}")
    print(f"  - Validation images: {len(val_images)}")
    
    return True


def train_detector(
    model_name: str = 'yolov8n',
    data_path: str = 'dataset/processed/dataset.yaml',
    epochs: int = 100,
    batch_size: int = 16,
    image_size: int = 640,
    patience: int = 20,
    output_path: str = 'output/detector',
    resume: str = None,
    **kwargs
) -> dict:
    """
    Train YOLOv8 muzzle detector.
    
    Args:
        model_name: YOLOv8 model variant (n, s, m, l, x)
        data_path: Path to dataset.yaml
        epochs: Number of training epochs
        batch_size: Batch size
        image_size: Input image size
        patience: Early stopping patience
        output_path: Output directory for results
        resume: Path to checkpoint to resume from
        **kwargs: Additional training parameters
    
    Returns:
        Training results dictionary
    """
    print("=" * 60)
    print("YOLOv8 Muzzle Detector Training")
    print("=" * 60)
    
    # Check GPU availability
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\nDevice: {device}")
    
    if device == 'cuda':
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"GPU: {gpu_name} ({gpu_memory:.1f} GB)")
    
    # Initialize model
    print(f"\nInitializing {model_name} model...")
    model = YOLO(f'{model_name}.pt')  # Load pretrained model
    
    # Create output directory
    output_dir = Path(output_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Training arguments
    train_args = {
        'data': data_path,
        'epochs': epochs,
        'batch': batch_size,
        'imgsz': image_size,
        'patience': patience,
        'project': str(output_dir),
        'name': 'train',
        'exist_ok': True,
        'device': device,
        'pretrained': True,
        'optimizer': 'SGD',
        'verbose': True,
        'seed': 42,
        'deterministic': True,
    }
    
    # Add augmentation parameters
    augmentation_params = [
        'lr0', 'lrf', 'hsv_h', 'hsv_s', 'hsv_v',
        'degrees', 'translate', 'scale', 'flipud', 'fliplr', 'mosaic'
    ]
    for param in augmentation_params:
        if param in kwargs:
            train_args[param] = kwargs[param]
    
    # Resume from checkpoint if specified
    if resume:
        print(f"\nResuming from checkpoint: {resume}")
        results = model.train(resume=resume, **train_args)
    else:
        print("\nStarting training...")
        print(f"  Epochs: {epochs}")
        print(f"  Batch size: {batch_size}")
        print(f"  Image size: {image_size}")
        print(f"  Output: {output_dir}")
        
        results = model.train(**train_args)
    
    # Print results
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    
    # Save best model path
    best_model = output_dir / 'train' / 'weights' / 'best.pt'
    last_model = output_dir / 'train' / 'weights' / 'last.pt'
    
    if best_model.exists():
        print(f"\nBest model saved to: {best_model}")
    if last_model.exists():
        print(f"Last model saved to: {last_model}")
    
    # Export to ONNX for browser compatibility
    print("\nExporting to ONNX...")
    try:
        onnx_path = output_dir / 'muzzle_detector.onnx'
        model.export(format='onnx', imgsz=image_size, verbose=False)
        print(f"ONNX model saved to: {onnx_path}")
    except Exception as e:
        print(f"ONNX export failed: {e}")
    
    return {
        'success': True,
        'best_model': str(best_model) if best_model.exists() else None,
        'last_model': str(last_model) if last_model.exists() else None,
        'output_path': str(output_dir),
        'results': results
    }


def export_for_browser(model_path: str, output_path: str) -> str:
    """
    Export trained model to TensorFlow.js format for browser deployment.
    """
    print("\nExporting model for browser...")
    
    try:
        from ultralytics import YOLO
        model = YOLO(model_path)
        
        # Export to TFLite (intermediate format)
        tflite_path = model.export(format='tflite', imgsz=320, int8=True)
        print(f"TFLite model: {tflite_path}")
        
        return tflite_path
    except Exception as e:
        print(f"Browser export failed: {e}")
        print("You may need to manually convert using:\n")
        print("  # Option 1: Using ONNX Runtime Web")
        print("  # Option 2: Using TensorFlow.js converter")
        return None


def evaluate_model(model_path: str, data_path: str) -> dict:
    """
    Evaluate trained model on validation set.
    """
    print("\nEvaluating model...")
    
    from ultralytics import YOLO
    model = YOLO(model_path)
    
    metrics = model.val(data=data_path)
    
    print("\nValidation Metrics:")
    print(f"  mAP50: {metrics.box.map50:.4f}")
    print(f"  mAP50-95: {metrics.box.map:.4f}")
    print(f"  Precision: {metrics.box.mp:.4f}")
    print(f"  Recall: {metrics.box.mr:.4f}")
    
    return {
        'map50': float(metrics.box.map50),
        'map': float(metrics.box.map),
        'precision': float(metrics.box.mp),
        'recall': float(metrics.box.mr)
    }


def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 muzzle detector")
    
    # Model settings
    parser.add_argument('--model', '-m', type=str, default='yolov8n',
                        choices=['yolov8n', 'yolov8s', 'yolov8m', 'yolov8l', 'yolov8x'],
                        help='YOLOv8 model variant')
    parser.add_argument('--data', '-d', type=str, 
                        default='dataset/processed/dataset.yaml',
                        help='Path to dataset.yaml')
    
    # Training settings
    parser.add_argument('--epochs', '-e', type=int, default=100,
                        help='Number of training epochs')
    parser.add_argument('--batch', '-b', type=int, default=16,
                        help='Batch size')
    parser.add_argument('--size', '-s', type=int, default=640,
                        help='Image size')
    parser.add_argument('--patience', '-p', type=int, default=20,
                        help='Early stopping patience')
    
    # Output
    parser.add_argument('--output', '-o', type=str, default='output/detector',
                        help='Output directory')
    parser.add_argument('--resume', type=str, default=None,
                        help='Resume from checkpoint')
    
    # Actions
    parser.add_argument('--evaluate', action='store_true',
                        help='Evaluate model after training')
    parser.add_argument('--export', action='store_true',
                        help='Export model for browser')
    
    args = parser.parse_args()
    
    # Load additional config
    config = load_config()
    
    # Merge args with config (args take precedence)
    train_config = {**config, **vars(args)}
    train_config.pop('evaluate')  # Remove non-training args
    train_config.pop('export')
    train_config.pop('resume')  # Handle separately
    
    # Check dataset
    if not check_dataset(str(Path(args.data).parent)):
        print("\nPlease prepare the dataset first:")
        print("  python prepare_dataset.py")
        sys.exit(1)
    
    # Train model
    results = train_detector(resume=args.resume, **train_config)
    
    # Evaluate if requested
    if args.evaluate and results.get('best_model'):
        evaluate_model(results['best_model'], args.data)
    
    # Export if requested
    if args.export and results.get('best_model'):
        export_for_browser(results['best_model'], args.output)


if __name__ == "__main__":
    main()
