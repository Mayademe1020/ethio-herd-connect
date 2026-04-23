"""
Dataset Preparation Script for Ethio Herd Connect Muzzle Identification
=======================================================================

This script organizes raw muzzle photos into a format suitable for training.

EXPECTED INPUT FORMAT:
--------------------
dataset/raw/
├── cow_001/
│   ├── cow_001_01.jpg
│   ├── cow_001_02.jpg
│   └── cow_001_03.jpg
├── cow_002/
│   ├── cow_002_01.jpg
│   └── cow_002_02.jpg
└── ...

EXPECTED OUTPUT FORMAT:
-----------------------
dataset/
├── images/
│   ├── train/
│   │   ├── cow_001_01.jpg
│   │   ├── cow_001_02.jpg
│   │   └── cow_002_01.jpg
│   └── val/
│       ├── cow_001_03.jpg
│       └── cow_002_02.jpg
└── labels/  (for YOLOv8)
    ├── train/
    └── val/

USAGE:
------
    python prepare_dataset.py --input dataset/raw --output dataset/processed --split 0.8
"""

import os
import shutil
import argparse
import random
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict
import yaml

# Image extensions to process
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}


def get_image_files(directory: str) -> List[Path]:
    """Get all image files from a directory."""
    images = []
    for ext in IMAGE_EXTENSIONS:
        images.extend(Path(directory).glob(f'*{ext}'))
        images.extend(Path(directory).glob(f'*{ext.upper()}'))
    return sorted(images)


def group_images_by_animal(image_paths: List[Path]) -> Dict[str, List[Path]]:
    """Group images by animal ID (folder name)."""
    groups = defaultdict(list)
    
    for img_path in image_paths:
        # Get parent folder name as animal ID
        animal_id = img_path.parent.name
        groups[animal_id].append(img_path)
    
    return dict(groups)


def validate_dataset_structure(raw_path: str) -> Tuple[bool, str]:
    """Validate that the dataset has the expected structure."""
    raw_dir = Path(raw_path)
    
    if not raw_dir.exists():
        return False, f"Raw dataset directory not found: {raw_path}"
    
    # Check that we have animal folders
    animal_folders = [d for d in raw_dir.iterdir() if d.is_dir()]
    
    if len(animal_folders) == 0:
        return False, "No animal folders found in raw dataset"
    
    # Check each animal folder has images
    for folder in animal_folders:
        images = get_image_files(str(folder))
        if len(images) == 0:
            return False, f"No images found in {folder.name}"
    
    return True, "Dataset structure valid"


def split_dataset(
    animal_groups: Dict[str, List[Path]], 
    train_split: float = 0.8,
    min_images: int = 3
) -> Tuple[List[Path], List[Path]]:
    """
    Split dataset into train and validation sets.
    Ensures each animal has at least 1 image in validation.
    """
    train_images = []
    val_images = []
    
    for animal_id, images in animal_groups.items():
        if len(images) < min_images:
            print(f"Warning: {animal_id} has only {len(images)} images (min: {min_images})")
            # Put all in train if too few images
            train_images.extend(images)
            continue
        
        # Shuffle images for this animal
        random.shuffle(images)
        
        # Calculate split point
        n_train = max(1, int(len(images) * train_split))
        
        # Ensure at least 1 image in validation
        if len(images) - n_train < 1:
            n_train = len(images) - 1
        
        train_images.extend(images[:n_train])
        val_images.extend(images[n_train:])
    
    return train_images, val_images


def resize_and_copy_images(
    images: List[Path],
    output_dir: Path,
    target_size: Tuple[int, int] = (640, 640)
) -> List[Path]:
    """
    Copy and resize images to output directory.
    Returns list of output paths.
    """
    from PIL import Image
    
    output_dir.mkdir(parents=True, exist_ok=True)
    output_paths = []
    
    for img_path in images:
        try:
            with Image.open(img_path) as img:
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize maintaining aspect ratio
                img.thumbnail(target_size, Image.Resampling.LANCZOS)
                
                # Create white background for non-square images
                new_img = Image.new('RGB', target_size, (255, 255, 255))
                
                # Paste resized image in center
                paste_x = (target_size[0] - img.width) // 2
                paste_y = (target_size[1] - img.height) // 2
                new_img.paste(img, (paste_x, paste_y))
                
                # Save with same filename
                output_path = output_dir / img_path.name
                new_img.save(output_path, 'JPEG', quality=95)
                output_paths.append(output_path)
                
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
    
    return output_paths


def create_yolo_labels(
    images: List[Path],
    output_dir: Path,
    class_id: int = 0  # Single class: muzzle
) -> None:
    """
    Create YOLO format label files.
    
    YOLO format: <class_id> <x_center> <y_center> <width> <height>
    All values normalized to [0, 1]
    """
    from PIL import Image
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for img_path in images:
        try:
            with Image.open(img_path) as img:
                width, height = img.size
            
            # For muzzle detection, we assume the muzzle is the main subject
            # In production, you would manually annotate bounding boxes
            # For now, we use a default box (60% of image, centered)
            label_path = output_dir / f"{img_path.stem}.txt"
            
            with open(label_path, 'w') as f:
                # Class ID, center_x, center_y, width, height
                # Using 60% of image as muzzle region
                f.write(f"{class_id} 0.5 0.5 0.6 0.6\n")
            
        except Exception as e:
            print(f"Error creating label for {img_path}: {e}")


def create_dataset_yaml(
    output_path: str,
    train_images: str,
    val_images: str,
    num_classes: int,
    class_names: List[str] = None
) -> None:
    """Create YOLO dataset.yaml configuration file."""
    
    if class_names is None:
        class_names = ['muzzle']
    
    config = {
        'path': output_path,
        'train': train_images,
        'val': val_images,
        'nc': num_classes,
        'names': {i: name for i, name in enumerate(class_names)}
    }
    
    yaml_path = Path(output_path) / 'dataset.yaml'
    with open(yaml_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    print(f"Created dataset.yaml at {yaml_path}")


def generate_animal_mapping(animal_groups: Dict[str, List[Path]]) -> Dict[str, int]:
    """Generate numeric mapping for animal IDs."""
    return {animal_id: idx for idx, animal_id in enumerate(sorted(animal_groups.keys()))}


def prepare_dataset(
    raw_path: str,
    output_path: str,
    train_split: float = 0.8,
    min_images: int = 3,
    target_size: Tuple[int, int] = (640, 640),
    create_labels: bool = True
) -> Dict:
    """
    Main function to prepare dataset for training.
    """
    print("=" * 60)
    print("Ethio Herd Connect - Dataset Preparation")
    print("=" * 60)
    
    # Validate input
    valid, msg = validate_dataset_structure(raw_path)
    if not valid:
        print(f"Error: {msg}")
        return {"success": False, "error": msg}
    
    print(f"\n✓ Dataset validated: {raw_path}")
    
    # Get all images grouped by animal
    raw_dir = Path(raw_path)
    all_images = get_image_files(str(raw_dir))
    animal_groups = group_images_by_animal(all_images)
    
    print(f"\nFound {len(animal_groups)} animals with {len(all_images)} total images")
    
    # Print statistics
    for animal_id, images in sorted(animal_groups.items()):
        print(f"  - {animal_id}: {len(images)} images")
    
    # Split into train/val
    train_images, val_images = split_dataset(animal_groups, train_split, min_images)
    
    print(f"\nDataset split:")
    print(f"  - Training: {len(train_images)} images")
    print(f"  - Validation: {len(val_images)} images")
    
    # Create output directories
    output_dir = Path(output_path)
    train_img_dir = output_dir / 'images' / 'train'
    val_img_dir = output_dir / 'images' / 'val'
    
    print(f"\nCopying and resizing images to {output_path}...")
    
    # Process images
    train_output = resize_and_copy_images(train_images, train_img_dir, target_size)
    val_output = resize_and_copy_images(val_images, val_img_dir, target_size)
    
    print(f"✓ Copied {len(train_output)} training images")
    print(f"✓ Copied {len(val_output)} validation images")
    
    # Create YOLO labels if requested
    if create_labels:
        print("\nCreating YOLO labels...")
        create_yolo_labels(train_output, output_dir / 'labels' / 'train')
        create_yolo_labels(val_output, output_dir / 'labels' / 'val')
        print("✓ YOLO labels created")
    
    # Create dataset.yaml
    print("\nCreating dataset.yaml...")
    create_dataset_yaml(
        str(output_dir),
'images/train',
        'images/val',
        num_classes=1,  # Single class: muzzle
        class_names=['muzzle']
    )
    
    # Generate animal ID mapping (for feature extractor training)
    animal_mapping = generate_animal_mapping(animal_groups)
    mapping_path = output_dir / 'animal_mapping.yaml'
    with open(mapping_path, 'w') as f:
        yaml.dump(animal_mapping, f)
    print(f"✓ Animal mapping saved to {mapping_path}")
    
    print("\n" + "=" * 60)
    print("Dataset preparation complete!")
    print("=" * 60)
    
    return {
        "success": True,
        "num_animals": len(animal_groups),
        "num_train": len(train_output),
        "num_val": len(val_output),
        "output_path": str(output_dir),
        "animal_mapping": animal_mapping
    }


def main():
    parser = argparse.ArgumentParser(
        description="Prepare muzzle dataset for training"
    )
    parser.add_argument(
        '--input', '-i',
        type=str,
        default='dataset/raw',
        help='Path to raw dataset'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='dataset/processed',
        help='Path for processed dataset'
    )
    parser.add_argument(
        '--split', '-s',
        type=float,
        default=0.8,
        help='Train/val split ratio (default: 0.8)'
    )
    parser.add_argument(
        '--min-images',
        type=int,
        default=3,
        help='Minimum images per animal (default: 3)'
    )
    parser.add_argument(
        '--size',
        type=int,
        default=640,
        help='Target image size (default: 640)'
    )
    
    args = parser.parse_args()
    
    result = prepare_dataset(
        raw_path=args.input,
        output_path=args.output,
        train_split=args.split,
        min_images=args.min_images,
        target_size=(args.size, args.size)
    )
    
    if result["success"]:
        print("\nNext steps:")
        print("1. Review the processed dataset")
        print("2. Optionally refine YOLO bounding box annotations")
        print("3. Run train_detector.py to train muzzle detector")
        print("4. Run train_extractor.py to train feature extractor")


if __name__ == "__main__":
    main()
