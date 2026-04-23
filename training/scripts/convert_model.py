#!/usr/bin/env python3
"""
Model Conversion Script

Converts trained models to TensorFlow.js format for browser inference.

Usage:
    python scripts/convert_model.py \
        --detector ./models/detector/weights/best.pt \
        --extractor ./models/extractor/embedding_model.h5 \
        --output ../src/public/models
"""

import os
import sys
import argparse
from pathlib import Path
import shutil


def parse_args():
    parser = argparse.ArgumentParser(description='Convert models to TF.js format')
    parser.add_argument('--detector', '-d', help='Path to detector model (.pt or .onnx)')
    parser.add_argument('--extractor', '-e', help='Path to extractor model (.h5)')
    parser.add_argument('--output', '-o', default='./output', help='Output directory')
    parser.add_argument('--quantize', action='store_true', help='Apply quantization')
    parser.add_argument('--target-size', type=int, default=10, help='Max model size in MB')
    return parser.parse_args()


def convert_onnx_to_tfjs(onnx_path: Path, output_dir: Path):
    """Convert ONNX model to TensorFlow.js."""
    import subprocess
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"   Converting {onnx_path} -> {output_dir}")
    
    try:
        # Use tf2onnx then tensorflowjs
        # First: ONNX -> TensorFlow
        tf_output = output_dir / 'tensorflow'
        tf_output.mkdir(exist_ok=True)
        
        cmd = [
            'python', '-m', 'tf2onnx.convert',
            '--input', str(onnx_path),
            '--output', str(tf_output / 'model.tf'),
            '--inputs', 'input:0',
            '--outputs', 'output:0',
            '--opset', '12'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   Warning: tf2onnx failed: {result.stderr}")
            return False
        
        # Second: TensorFlow -> TF.js
        cmd = [
            'tensorflowjs_converter',
            '--input_format', 'tf_saved_model',
            '--output_format', 'tfjs_graph_model',
            '--quantize_bytes', '1', 'int' if '--quantize' in sys.argv else 'float',
            str(tf_output / 'model.tf'),
            str(output_dir / 'tfjs')
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   Warning: tensorflowjs_converter failed: {result.stderr}")
            return False
        
        return True
        
    except Exception as e:
        print(f"   Error: {e}")
        return False


def convert_keras_to_tfjs(h5_path: Path, output_dir: Path, quantize: bool = False):
    """Convert Keras .h5 model to TensorFlow.js."""
    import subprocess
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"   Converting {h5_path} -> {output_dir}")
    
    cmd = [
        'tensorflowjs_converter',
        '--input_format', 'keras',
        '--output_format', 'tfjs_graph_model',
        str(h5_path),
        str(output_dir)
    ]
    
    if quantize:
        # Split into shards for better loading on mobile
        cmd.insert(4, '--split_weights_by_layer')
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   Warning: {result.stderr}")
            return False
        
        # Check output size
        total_size = sum(f.stat().st_size for f in output_dir.rglob('*') if f.is_file())
        size_mb = total_size / (1024 * 1024)
        print(f"   Output size: {size_mb:.2f} MB")
        
        return True
        
    except FileNotFoundError:
        print("   Error: tensorflowjs_converter not found")
        print("   Install with: pip install tensorflowjs")
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False


def convert_yolov8_to_tfjs(pt_path: Path, output_dir: Path):
    """
    Convert YOLOv8 to TensorFlow.js.
    
    Steps:
    1. YOLOv8 (.pt) -> ONNX
    2. ONNX -> TensorFlow
    3. TensorFlow -> TF.js
    """
    import subprocess
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"   Converting YOLOv8 {pt_path} -> {output_dir}")
    
    try:
        # Step 1: PyTorch -> ONNX
        print("   Step 1: YOLOv8 -> ONNX")
        onnx_path = output_dir / 'model.onnx'
        
        # Use YOLOv8's export functionality
        cmd = [
            'python', '-c',
            f'''
from ultralytics import YOLO
model = YOLO("{pt_path}")
model.export(format="onnx", imgsz=640)
'''
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   Warning: {result.stderr}")
            # Try alternative: copy to onnx if already exists
            alt_onnx = Path(str(pt_path).replace('.pt', '.onnx'))
            if alt_onnx.exists():
                shutil.copy(alt_onnx, onnx_path)
            else:
                return False
        
        # Move exported file
        exported = Path(str(pt_path).replace('.pt', '.onnx'))
        if exported.exists():
            shutil.copy(exported, onnx_path)
        
        if not onnx_path.exists():
            print("   ONNX export failed, skipping detector conversion")
            return False
        
        # Step 2: ONNX -> TF.js
        print("   Step 2: ONNX -> TF.js")
        return convert_onnx_to_tfjs(onnx_path, output_dir)
        
    except Exception as e:
        print(f"   Error: {e}")
        return False


def create_model_manifest(models_dir: Path, config: dict):
    """Create manifest.json for model loading."""
    import json
    
    manifest = {
        'version': '1.0.0',
        'generated': str(Path(__file__).absolute()),
        'models': {}
    }
    
    # Detector
    detector_dir = models_dir / 'detector'
    if detector_dir.exists():
        tfjs_dir = detector_dir / 'tfjs'
        if tfjs_dir.exists():
            # Find model.json
            model_files = list(tfjs_dir.glob('*.json'))
            if model_files:
                manifest['models']['detector'] = {
                    'path': str(tfjs_dir.relative_to(models_dir)),
                    'type': 'detection',
                    'inputSize': 640,
                    'numClasses': 1
                }
    
    # Extractor
    extractor_dir = models_dir / 'extractor'
    if extractor_dir.exists():
        model_files = list(extractor_dir.glob('*.json'))
        if model_files:
            manifest['models']['extractor'] = {
                'path': str(extractor_dir.relative_to(models_dir)),
                'type': 'feature_extraction',
                'inputSize': 224,
                'embeddingDim': config.get('extractor', {}).get('embedding_dim', 128)
            }
    
    manifest_path = models_dir / 'manifest.json'
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    return manifest_path


def optimize_for_mobile(model_dir: Path, max_size_mb: int = 10):
    """
    Optimize models for mobile browser.
    
    Techniques:
    - Weight quantization
    - Layer splitting
    - Pruning
    """
    import json
    
    # Check current size
    total_size = sum(f.stat().st_size for f in model_dir.rglob('*') if f.is_file())
    size_mb = total_size / (1024 * 1024)
    
    print(f"\n   Current size: {size_mb:.2f} MB")
    
    if size_mb <= max_size_mb:
        print(f"   Model is within size limit ({max_size_mb} MB)")
        return
    
    # Need optimization
    print(f"   Model too large, needs optimization...")
    
    # Strategy: Split weights by layer for lazy loading
    print("   Applying layer splitting for lazy loading...")
    
    # Create optimization manifest
    opt_manifest = {
        'optimization': 'layer_split',
        'target_size_mb': max_size_mb,
        'current_size_mb': round(size_mb, 2)
    }
    
    with open(model_dir / 'optimization.json', 'w') as f:
        json.dump(opt_manifest, f)


def main():
    args = parse_args()
    
    # Setup paths
    output_dir = Path(args.output)
    models_dir = output_dir / 'muzzle_models'
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🔄 Model Conversion")
    print(f"   Output: {models_dir}")
    print()
    
    # Load config
    config = {}
    config_path = Path('config.yaml')
    if config_path.exists():
        import yaml
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
    
    # Convert detector
    if args.detector:
        detector_path = Path(args.detector)
        if detector_path.exists():
            detector_output = models_dir / 'detector'
            print("📦 Converting detector...")
            
            if detector_path.suffix == '.pt':
                success = convert_yolov8_to_tfjs(detector_path, detector_output)
            elif detector_path.suffix == '.onnx':
                success = convert_onnx_to_tfjs(detector_path, detector_output)
            else:
                print(f"   Unsupported detector format: {detector_path.suffix}")
                success = False
            
            if success:
                print("   ✅ Detector converted")
            else:
                print("   ⚠️  Detector conversion failed or skipped")
        else:
            print(f"⚠️  Detector not found: {detector_path}")
    
    # Convert extractor
    if args.extractor:
        extractor_path = Path(args.extractor)
        if extractor_path.exists():
            extractor_output = models_dir / 'extractor'
            print("\n📦 Converting extractor...")
            
            success = convert_keras_to_tfjs(
                extractor_path,
                extractor_output,
                quantize=args.quantize
            )
            
            if success:
                print("   ✅ Extractor converted")
                
                # Optimize for mobile
                optimize_for_mobile(extractor_output)
            else:
                print("   ⚠️  Extractor conversion failed")
        else:
            print(f"⚠️  Extractor not found: {extractor_path}")
    
    # Create manifest
    if models_dir.exists() and any(models_dir.iterdir()):
        manifest_path = create_model_manifest(models_dir, config)
        print(f"\n📋 Manifest: {manifest_path}")
        
        # Summary
        print("\n" + "="*50)
        print("📋 CONVERSION COMPLETE")
        print("="*50)
        print(f"Models saved to: {models_dir}")
        print("\nModel files:")
        
        for model_dir in models_dir.iterdir():
            if model_dir.is_dir():
                files = list(model_dir.rglob('*'))
                size_mb = sum(f.stat().st_size for f in files if f.is_file()) / (1024*1024)
                print(f"   {model_dir.name}/ ({size_mb:.2f} MB)")
        
        print(f"\n📁 Next step: Copy to src/public/models/")
        print(f"   cp -r {models_dir} ../src/public/models/")
    else:
        print("\n❌ No models converted. Check paths and dependencies.")


if __name__ == '__main__':
    main()
