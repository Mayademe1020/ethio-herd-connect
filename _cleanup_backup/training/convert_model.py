"""
Model Conversion Script
=======================

Converts trained models to TensorFlow.js format for browser deployment.
Optimizes models for 2GB RAM phones.

USAGE:
------
    python convert_model.py --model output/extractor/model.keras --output ../src/models
"""

import os
import sys
import argparse
from pathlib import Path
import json


def convert_to_tfjs(
    model_path: str,
    output_path: str,
    quantization: str = 'float16',
    optimize: bool = True
) -> bool:
    """
    Convert Keras/TensorFlow model to TensorFlow.js format.
    
    Args:
        model_path: Path to input model (.keras, .h5, .pb)
        output_path: Output directory for TF.js model
        quantization: Quantization type ('float16', 'uint8', or None)
        optimize: Whether to apply optimizations
    
    Returns:
        True if successful
    """
    try:
        import tensorflowjs as tfjs
        from tensorflowjs.converters import convert_tfkeras_saved_model_to_tfjs_format
    except ImportError:
        print("Installing tensorflowjs...")
        os.system("pip install tensorflowjs")
        import tensorflowjs as tfjs
    
    input_path = Path(model_path)
    output_dir = Path(output_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("Model Conversion - TensorFlow.js")
    print("=" * 60)
    print(f"\nInput: {model_path}")
    print(f"Output: {output_path}")
    print(f"Quantization: {quantization}")
    
    # Conversion options
    if quantization == 'float16':
        quantize_option = 'float16'
    elif quantization == 'uint8':
        quantize_option = 'uint8'
    else:
        quantize_option = None
    
    try:
        print("\nConverting...")
        
        # Convert using CLI
        cmd = [
            'tensorflowjs_converter',
            '--input_format', 'keras',
            '--output_format', 'tfjs_graph_model',
            '--quantize_dtype', quantize_option if quantize_option else 'float16',
            str(input_path),
            str(output_dir)
        ]
        
        # Filter out None values
        cmd = [c for c in cmd if c != 'None']
        
        print(f"Running: {' '.join(cmd)}")
        os.system(' '.join(cmd))
        
        # Check output
        output_files = list(output_dir.glob('*.json'))
        if output_files:
            # Calculate model size
            total_size = sum(f.stat().st_size for f in output_dir.rglob('*') if f.is_file())
            size_mb = total_size / (1024 * 1024)
            
            print(f"\n✓ Conversion successful!")
            print(f"  Output files: {len(output_files)}")
            print(f"  Total size: {size_mb:.2f} MB")
            
            # Create model.json with metadata
            model_json = {
                'modelType': 'muzzleFeatureExtractor',
                'format': 'tfjs_graph_model',
                'quantization': quantization,
                'sizeMB': round(size_mb, 2),
                'inputShape': [224, 224, 3],
                'embeddingDim': 128,
                'version': '1.0.0'
            }
            
            with open(output_dir / 'model_metadata.json', 'w') as f:
                json.dump(model_json, f, indent=2)
            
            print(f"  Metadata saved")
            
            return True
        else:
            print("\n✗ Conversion failed - no output files")
            return False
            
    except Exception as e:
        print(f"\n✗ Conversion error: {e}")
        return False


def create_model_manifest(
    models_dir: str,
    output_path: str = None
) -> dict:
    """
    Create a manifest file listing all available models.
    """
    models_path = Path(models_dir)
    
    manifest = {
        'version': '1.0.0',
        'updated': '2024-01-01',
        'models': []
    }
    
    for model_dir in models_path.iterdir():
        if model_dir.is_dir():
            model_files = list(model_dir.glob('*.json'))
            if any('model' in f.name for f in model_files):
                metadata_file = model_dir / 'model_metadata.json'
                
                model_info = {
                    'id': model_dir.name,
                    'path': str(model_dir.relative_to(models_path)),
                    'status': 'available'
                }
                
                if metadata_file.exists():
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                        model_info.update(metadata)
                
                manifest['models'].append(model_info)
    
    manifest_path = Path(output_path) if output_path else models_path / 'manifest.json'
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\nManifest created: {manifest_path}")
    return manifest


def check_model_compatibility(model_path: str) -> dict:
    """
    Check if model is compatible with browser deployment.
    """
    model_dir = Path(model_path)
    
    issues = []
    warnings = []
    
    # Check required files
    if not model_dir.exists():
        issues.append(f"Model directory not found: {model_path}")
        return {'valid': False, 'issues': issues, 'warnings': warnings}
    
    # Check for model.json
    model_json = model_dir / 'model.json'
    if not model_json.exists():
        issues.append("model.json not found")
    else:
        with open(model_json, 'r') as f:
            data = json.load(f)
            
            # Check weight file size
            weight_files = [f for f in model_dir.glob('*.bin')]
            if weight_files:
                total_size = sum(f.stat().st_size for f in weight_files)
                size_mb = total_size / (1024 * 1024)
                
                if size_mb > 10:
                    warnings.append(f"Model size ({size_mb:.1f} MB) may be too large for 2GB phones")
                
                if size_mb > 20:
                    issues.append(f"Model size ({size_mb:.1f} MB) exceeds recommended 10MB limit")
    
    # Check metadata
    metadata = model_dir / 'model_metadata.json'
    if metadata.exists():
        with open(metadata, 'r') as f:
            meta = json.load(f)
            
            if meta.get('sizeMB', 0) > 10:
                warnings.append(f"Consider quantizing model further")
    
    return {
        'valid': len(issues) == 0,
        'issues': issues,
        'warnings': warnings
    }


def main():
    parser = argparse.ArgumentParser(description="Convert models for browser")
    
    parser.add_argument('--model', '-m', type=str, required=True,
                        help='Path to model file')
    parser.add_argument('--output', '-o', type=str,
                        default='../src/models',
                        help='Output directory')
    parser.add_argument('--quantize', '-q', type=str,
                        default='float16',
                        choices=['float16', 'uint8', 'none'],
                        help='Quantization type')
    parser.add_argument('--check', action='store_true',
                        help='Check model compatibility only')
    parser.add_argument('--manifest', action='store_true',
                        help='Create model manifest')
    
    args = parser.parse_args()
    
    if args.check:
        result = check_model_compatibility(args.model)
        print("\nModel Compatibility Check")
        print("=" * 40)
        
        if result['valid']:
            print("\n✓ Model is valid for browser deployment")
        else:
            print("\n✗ Model has issues:")
            for issue in result['issues']:
                print(f"  - {issue}")
        
        if result['warnings']:
            print("\nWarnings:")
            for warning in result['warnings']:
                print(f"  - {warning}")
        
        return
    
    if args.manifest:
        manifest = create_model_manifest(args.model, args.output)
        print(f"\nFound {len(manifest['models'])} models")
        return
    
    # Convert model
    quant = None if args.quantize == 'none' else args.quantize
    success = convert_to_tfjs(args.model, args.output, quant)
    
    if success:
        print("\n✓ Model ready for browser deployment!")
        print(f"\nNext steps:")
        print(f"1. Copy files from {args.output} to src/models/")
        print(f"2. Update muzzleLocalMLService to load the model")
    else:
        print("\n✗ Conversion failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
