#!/usr/bin/env python3
"""
Dataset Preparation Script for Ethio-Herd Muzzle Identification

This script:
1. Organizes raw photos into proper folder structure
2. Validates image quality
3. Resizes images to standard size
4. Creates YOLO-format annotations (optional)
5. Splits into train/val/test sets

Usage:
    python scripts/prepare_dataset.py --input ./datasets/raw --output ./datasets/processed
"""

import os
import sys
import argparse
import shutil
from pathlib import Path
from typing import List, Dict, Tuple
import json
import yaml
import numpy as np
from PIL import Image
from tqdm import tqdm


def parse_args():
    parser = argparse.ArgumentParser(description='Prepare muzzle dataset for training')
    parser.add_argument('--input', '-i', required=True, help='Input directory with raw photos')
    parser.add_argument('--output', '-o', required=True, help='Output directory for processed data')
    parser.add_argument('--config', '-c', default='config.yaml', help='Config file path')
    parser.add_argument('--min-photos', type=int, default=3, help='Minimum photos per animal')
    parser.add_argument('--max-photos', type=int, default=10, help='Maximum photos per animal')
    parser.add_argument('--image-size', type=int, default=224, help='Target image size')
    parser.add_argument('--validate-quality', action='store_true', help='Validate image quality')
    parser.add_argument('--dry-run', action='store_true', help='Preview without copying')
    return parser.parse_args()


def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


def scan_input_directory(input_dir: Path) -> Dict[str, List[Path]]:
    """
    Scan input directory and organize photos by animal ID.
    
    Expected structure:
    input_dir/
        farm_001/
            animal_A1/
                photo_001.jpg
                photo_002.jpg
            animal_A2/
                ...
    """
    animals = {}
    
    for farm_dir in input_dir.iterdir():
        if not farm_dir.is_dir():
            continue
            
        for animal_dir in farm_dir.iterdir():
            if not animal_dir.is_dir():
                continue
                
            animal_id = animal_dir.name
            
            # Find all images
            images = []
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
                images.extend(animal_dir.glob(ext))
            
            if images:
                animals[animal_id] = {
                    'images': sorted(images),
                    'farm': farm_dir.name,
                    'animal_id': animal_id
                }
    
    return animals


def validate_image(image_path: Path, min_size: int = 100) -> Tuple[bool, str]:
    """
    Validate that image is usable.
    
    Returns: (is_valid, error_message)
    """
    try:
        img = Image.open(image_path)
        
        # Check format
        if img.format not in ['JPEG', 'PNG', 'JPG']:
            return False, f"Unsupported format: {img.format}"
        
        # Check size
        width, height = img.size
        if width < min_size or height < min_size:
            return False, f"Image too small: {width}x{height}"
        
        # Check it's not corrupted
        img.verify()
        
        return True, "OK"
        
    except Exception as e:
        return False, str(e)


def calculate_image_quality(image_path: Path) -> dict:
    """
    Calculate basic image quality metrics.
    
    Returns quality scores (0-100).
    """
    try:
        img = Image.open(image_path).convert('RGB')
        img_arr = np.array(img)
        
        # Brightness (0-100)
        brightness = np.mean(img_arr)
        brightness_score = min(100, brightness * 100 / 128)
        
        # Contrast (0-100)
        contrast = np.std(img_arr)
        contrast_score = min(100, contrast * 2)
        
        # Sharpness estimate using Laplacian variance
        gray = np.mean(img_arr, axis=2).astype(np.uint8)
        laplacian_var = np.var(gray)  # Simplified
        sharpness_score = min(100, laplacian_var / 100)
        
        # Overall score (weighted)
        overall = brightness_score * 0.3 + contrast_score * 0.3 + sharpness_score * 0.4
        
        return {
            'overall': round(overall, 1),
            'brightness': round(brightness_score, 1),
            'contrast': round(contrast_score, 1),
            'sharpness': round(sharpness_score, 1),
            'width': img_arr.shape[1],
            'height': img_arr.shape[0]
        }
        
    except Exception as e:
        return {'error': str(e)}


def resize_image(image_path: Path, output_path: Path, target_size: int = 224):
    """Resize image maintaining aspect ratio, pad if needed."""
    img = Image.open(image_path).convert('RGB')
    
    # Calculate new size maintaining aspect ratio
    width, height = img.size
    scale = min(target_size / width, target_size / height)
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    # Resize
    img_resized = img.resize((new_width, new_height), Image.LANCZOS)
    
    # Create new image with padding
    new_img = Image.new('RGB', (target_size, target_size), (128, 128, 128))
    
    # Paste resized image in center
    paste_x = (target_size - new_width) // 2
    paste_y = (target_size - new_height) // 2
    new_img.paste(img_resized, (paste_x, paste_y))
    
    # Save
    new_img.save(output_path, 'JPEG', quality=95)


def create_train_val_split(animals: Dict, train_ratio: float = 0.8) -> Tuple[List, List, List]:
    """
    Split animals into train/val/test sets.
    
    Returns: (train_animals, val_animals, test_animals)
    """
    animal_ids = list(animals.keys())
    np.random.seed(42)  # Reproducibility
    np.random.shuffle(animal_ids)
    
    n_total = len(animal_ids)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * (1 - train_ratio) / 2)
    
    train_ids = animal_ids[:n_train]
    val_ids = animal_ids[n_train:n_train + n_val]
    test_ids = animal_ids[n_train + n_val:]
    
    train_animals = [animals[aid] for aid in train_ids]
    val_animals = [animals[aid] for aid in val_ids]
    test_animals = [animals[aid] for aid in test_ids]
    
    return train_animals, val_animals, test_animals


def copy_and_process_images(
    animals: List[Dict],
    output_dir: Path,
    image_size: int,
    subset: str,
    dry_run: bool = False
) -> Dict:
    """
    Copy and process images for a subset (train/val/test).
    
    Creates folder structure compatible with torchvision ImageFolder.
    """
    stats = {
        'total_animals': len(animals),
        'total_images': 0,
        'skipped': 0,
        'errors': 0
    }
    
    subset_dir = output_dir / subset
    
    for animal in tqdm(animals, desc=f'Processing {subset}'):
        animal_id = animal['animal_id']
        images = animal['images']
        
        # Create class directory
        class_dir = subset_dir / animal_id
        if not dry_run:
            class_dir.mkdir(parents=True, exist_ok=True)
        
        # Process each image
        for i, img_path in enumerate(images):
            output_name = f'{animal_id}_{i:03d}.jpg'
            output_path = class_dir / output_name
            
            if dry_run:
                # Just validate
                valid, error = validate_image(img_path)
                if not valid:
                    stats['skipped'] += 1
                    print(f'  SKIP {img_path.name}: {error}')
            else:
                try:
                    valid, error = validate_image(img_path)
                    if not valid:
                        stats['skipped'] += 1
                        continue
                    
                    resize_image(img_path, output_path, image_size)
                    stats['total_images'] += 1
                    
                except Exception as e:
                    stats['errors'] += 1
                    print(f'  ERROR {img_path.name}: {e}')
    
    return stats


def create_metadata(animals: List[Dict], output_path: Path):
    """Create metadata CSV file."""
    import csv
    
    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['animal_id', 'farm_id', 'num_images', 'image_names'])
        
        for animal in animals:
            images = animal['images']
            writer.writerow([
                animal['animal_id'],
                animal['farm'],
                len(images),
                ','.join([img.name for img in images])
            ])


def create_dataset_yaml(output_dir: Path, num_classes: int):
    """Create dataset.yaml for YOLOv8 training."""
    yaml_content = {
        'path': str(output_dir.absolute()),
        'train': 'train',
        'val': 'val',
        'test': 'test',
        'nc': num_classes,
        'names': {i: f'animal_{i}' for i in range(num_classes)}
    }
    
    with open(output_dir / 'dataset.yaml', 'w') as f:
        yaml.dump(yaml_content, f, default_flow_style=False)


def main():
    args = parse_args()
    
    # Load config
    config = load_config(args.config)
    
    input_dir = Path(args.input)
    output_dir = Path(args.output)
    
    print(f"\n📁 Ethio-Herd Dataset Preparation")
    print(f"   Input:  {input_dir}")
    print(f"   Output: {output_dir}")
    print()
    
    # Scan input directory
    print("🔍 Scanning input directory...")
    animals = scan_input_directory(input_dir)
    print(f"   Found {len(animals)} animals")
    
    if len(animals) == 0:
        print("❌ No animals found. Check your folder structure.")
        print("   Expected: farm_name/animal_id/photo.jpg")
        sys.exit(1)
    
    # Filter by minimum photos
    filtered_animals = {
        aid: animal for aid, animal in animals.items()
        if len(animal['images']) >= args.min_photos
    }
    
    print(f"   {len(filtered_animals)} animals with >= {args.min_photos} photos")
    
    # Split into train/val/test
    train_animals, val_animals, test_animals = create_train_val_split(
        filtered_animals,
        train_ratio=config.get('dataset', {}).get('train_split', 0.8)
    )
    
    print(f"\n📊 Dataset Split:")
    print(f"   Train: {len(train_animals)} animals")
    print(f"   Val:   {len(val_animals)} animals")
    print(f"   Test:  {len(test_animals)} animals")
    
    if args.dry_run:
        print("\n⚠️  DRY RUN - No files will be copied")
    
    # Process each subset
    if not args.dry_run:
        output_dir.mkdir(parents=True, exist_ok=True)
    
    image_size = args.image_size or config.get('dataset', {}).get('image_size', 224)
    
    train_stats = copy_and_process_images(
        train_animals, output_dir, image_size, 'train', args.dry_run
    )
    val_stats = copy_and_process_images(
        val_animals, output_dir, image_size, 'val', args.dry_run
    )
    test_stats = copy_and_process_images(
        test_animals, output_dir, image_size, 'test', args.dry_run
    )
    
    # Create metadata
    if not args.dry_run:
        create_metadata(train_animals, output_dir / 'train_metadata.csv')
        create_metadata(val_animals, output_dir / 'val_metadata.csv')
        create_metadata(test_animals, output_dir / 'test_metadata.csv')
        
        # Create dataset.yaml for YOLOv8
        create_dataset_yaml(output_dir, len(filtered_animals))
    
    # Summary
    print("\n" + "="*50)
    print("📋 SUMMARY")
    print("="*50)
    print(f"Total animals: {len(filtered_animals)}")
    print(f"Total images (processed): {train_stats['total_images'] + val_stats['total_images'] + test_stats['total_images']}")
    print(f"Skipped: {train_stats['skipped'] + val_stats['skipped'] + test_stats['skipped']}")
    print(f"Errors: {train_stats['errors'] + val_stats['errors'] + test_stats['errors']}")
    
    if not args.dry_run:
        print(f"\n✅ Dataset prepared at: {output_dir}")
        print(f"\n📁 Structure:")
        print(f"   {output_dir}/train/...")
        print(f"   {output_dir}/val/...")
        print(f"   {output_dir}/test/...")
        print(f"   {output_dir}/dataset.yaml")
        print(f"   {output_dir}/*_metadata.csv")


if __name__ == '__main__':
    main()
