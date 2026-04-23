#!/usr/bin/env python3
"""
Download Open-Source Cattle Muzzle Datasets

Downloads publicly available datasets to bootstrap training.

Usage:
    python scripts/download_datasets.py --output ./datasets/external

Datasets:
1. Zenodo Beef Cattle (268 cattle, 4923 images) - Recommended
2. PMC Cattle Biometrics (8000+ images)
3. Muzzle Cow New Dataset (30 cattle, 210 images)
"""

import os
import sys
import argparse
import zipfile
import tarfile
from pathlib import Path
from typing import Optional
import urllib.request
import urllib.error


def parse_args():
    parser = argparse.ArgumentParser(description='Download open-source cattle muzzle datasets')
    parser.add_argument('--output', '-o', default='./datasets/external', help='Output directory')
    parser.add_argument('--datasets', nargs='+', default=['zenodo', 'all'],
                       choices=['zenodo', 'pmc', 'muzzle30', 'all'],
                       help='Which datasets to download')
    return parser.parse_args()


# Dataset configurations
DATASETS = {
    'zenodo': {
        'name': 'Beef Cattle Muzzle/Noseprint Database',
        'url': 'https://zenodo.org/records/6324361/files/muzzle_database.zip',
        'description': '268 feedyard yearlings, 4923 muzzle images from Midwest US',
        'license': 'CC BY 4.0',
        'size_mb': 850
    },
    'pmc': {
        'name': 'Cows Frontal Face Dataset',
        'url': 'https://zenodo.org/records/3524181/files/Cow_Frontal_Face_Dataset.zip',
        'description': 'Multiple cattle breeds from research study',
        'license': 'CC BY 4.0',
        'size_mb': 1200
    },
    'muzzle30': {
        'name': 'Muzzle Cow New Dataset',
        'url': 'https://zenodo.org/records/7988559/files/muzzlecow_dataset.zip',
        'description': '30 cattle, 210 muzzle images',
        'license': 'CC BY 4.0',
        'size_mb': 45
    }
}


def download_file(url: str, output_path: Path, chunk_size: int = 8192) -> bool:
    """
    Download a file with progress bar.
    """
    try:
        print(f"   URL: {url}")
        print(f"   Output: {output_path}")
        
        # Create request with headers
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (compatible; DatasetDownloader/1.0)'}
        )
        
        with urllib.request.urlopen(req, timeout=300) as response:
            total_size = int(response.headers.get('Content-Length', 0))
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            downloaded = 0
            with open(output_path, 'wb') as f:
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f'\r   Progress: {percent:.1f}% ({downloaded/1024/1024:.1f}/{total_size/1024/1024:.1f} MB)', end='')
            
            print()  # New line after progress
            return True
            
    except urllib.error.HTTPError as e:
        print(f"\n   HTTP Error: {e.code} - {e.reason}")
        return False
    except urllib.error.URLError as e:
        print(f"\n   URL Error: {e.reason}")
        return False
    except Exception as e:
        print(f"\n   Error: {e}")
        return False


def extract_archive(archive_path: Path, output_dir: Path) -> bool:
    """Extract zip/tar archive."""
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        
        if archive_path.suffix == '.zip':
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(output_dir)
        elif archive_path.suffix in ['.tar', '.gz', '.tgz']:
            with tarfile.open(archive_path, 'r:*') as tar_ref:
                tar_ref.extractall(output_dir)
        else:
            print(f"   Unknown archive format: {archive_path.suffix}")
            return False
        
        print(f"   Extracted to: {output_dir}")
        return True
        
    except Exception as e:
        print(f"   Extraction error: {e}")
        return False


def download_dataset(dataset_id: str, output_dir: Path) -> bool:
    """Download and extract a single dataset."""
    if dataset_id not in DATASETS:
        print(f"Unknown dataset: {dataset_id}")
        return False
    
    dataset = DATASETS[dataset_id]
    
    print(f"\n📥 Downloading: {dataset['name']}")
    print(f"   Description: {dataset['description']}")
    print(f"   Size: ~{dataset['size_mb']} MB")
    print(f"   License: {dataset['license']}")
    
    # Check if already downloaded
    dataset_dir = output_dir / dataset_id
    if dataset_dir.exists() and any(dataset_dir.rglob('*.jpg')):
        print(f"   ✅ Already exists: {dataset_dir}")
        return True
    
    # Create temp directory
    temp_dir = output_dir / 'temp'
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Download
    archive_path = temp_dir / f'{dataset_id}.zip'
    
    if not download_file(dataset['url'], archive_path):
        print(f"   ❌ Download failed")
        return False
    
    # Extract
    print("   Extracting...")
    if not extract_archive(archive_path, dataset_dir):
        print(f"   ❌ Extraction failed")
        return False
    
    # Cleanup
    if archive_path.exists():
        archive_path.unlink()
    
    print(f"   ✅ Download complete: {dataset_dir}")
    
    # Count images
    image_count = len(list(dataset_dir.rglob('*.jpg'))) + len(list(dataset_dir.rglob('*.png')))
    print(f"   Images found: {image_count}")
    
    return True


def download_all(output_dir: Path) -> dict:
    """Download all available datasets."""
    results = {}
    
    print("\n" + "="*50)
    print("📦 Available Datasets")
    print("="*50)
    
    for i, (dataset_id, dataset) in enumerate(DATASETS.items(), 1):
        print(f"\n{i}. {dataset['name']}")
        print(f"   {dataset['description']}")
        print(f"   Size: ~{dataset['size_mb']} MB")
    
    print(f"\n{'='*50}")
    print("Starting downloads...")
    print("="*50)
    
    total_size = sum(d['size_mb'] for d in DATASETS.values())
    print(f"Total download size: ~{total_size} MB")
    
    for dataset_id in DATASETS:
        success = download_dataset(dataset_id, output_dir)
        results[dataset_id] = success
    
    return results


def main():
    args = parse_args()
    
    output_dir = Path(args.output)
    
    print(f"\n🐄 Ethio-Herd Dataset Downloader")
    print(f"   Output: {output_dir}")
    print()
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Determine which datasets to download
    if 'all' in args.datasets:
        datasets_to_download = list(DATASETS.keys())
    else:
        datasets_to_download = args.datasets
    
    # Download
    if len(datasets_to_download) == 1:
        success = download_dataset(datasets_to_download[0], output_dir)
    else:
        results = download_all(output_dir)
        
        # Summary
        print("\n" + "="*50)
        print("📋 DOWNLOAD SUMMARY")
        print("="*50)
        
        for dataset_id, success in results.items():
            status = "✅" if success else "❌"
            print(f"{status} {DATASETS[dataset_id]['name']}")
        
        successful = sum(1 for s in results.values() if s)
        print(f"\n{successful}/{len(results)} datasets downloaded")
        
        if successful > 0:
            print("\n📁 Next step: Prepare datasets for training")
            print(f"   python scripts/prepare_dataset.py --input {output_dir} --output ./datasets/processed")


if __name__ == '__main__':
    main()
