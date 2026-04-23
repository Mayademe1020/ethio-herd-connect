"""
CNN Feature Extractor Training with ArcFace Loss
================================================

Trains a CNN to extract discriminative features from muzzle images
for identification (who is this cow?).

Uses ArcFace loss which is state-of-the-art for face/muzzle recognition.

PREREQUISITES:
--------------
1. Install dependencies:
   pip install tensorflow torch torchvision pillow pyyaml

2. Prepare dataset:
   python prepare_dataset.py --input dataset/raw --output dataset/processed

USAGE:
------
    python train_extractor.py

    # With custom settings
    python train_extractor.py --backbone mobilenet_v3_small --epochs 50
"""

import os
import sys
import argparse
from pathlib import Path
import yaml
import numpy as np
from typing import Tuple, List, Optional

# Try to import TensorFlow, fall back to PyTorch
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, Model, applications
    USE_TENSORFLOW = True
    print("Using TensorFlow backend")
except ImportError:
    USE_TENSORFLOW = False
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import Dataset, DataLoader
    from torchvision import transforms, models
    from PIL import Image
    print("Using PyTorch backend")


# Default configuration
DEFAULT_CONFIG = {
    'backbone': 'mobilenet_v3_small',
    'embedding_dim': 128,
    'epochs': 50,
    'batch_size': 32,
    'image_size': 224,
    'optimizer': 'adam',
    'learning_rate': 0.001,
    'loss_type': 'arcface',
    'margin': 0.5,
    'scale': 30,
    'output_path': 'output/extractor'
}


def load_config(config_path: str = 'config.yaml') -> dict:
    """Load configuration from YAML file."""
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config.get('feature_extractor', DEFAULT_CONFIG)
    except FileNotFoundError:
        print(f"Config file not found: {config_path}")
        print("Using default configuration")
        return DEFAULT_CONFIG


class MuzzleDataset:
    """Dataset class for muzzle images."""
    
    def __init__(
        self,
        image_dir: str,
        animal_mapping: dict,
        transform=None,
        image_size: int = 224
    ):
        self.image_dir = Path(image_dir)
        self.animal_mapping = animal_mapping
        self.transform = transform
        self.image_size = image_size
        
        # Load all image paths and labels
        self.images = []
        self.labels = []
        
        for animal_id, animal_idx in animal_mapping.items():
            animal_dir = self.image_dir / animal_id
            if animal_dir.exists():
                for img_path in animal_dir.glob('*'):
                    if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                        self.images.append(img_path)
                        self.labels.append(animal_idx)
    
    def __len__(self) -> int:
        return len(self.images)
    
    def __getitem__(self, idx: int) -> Tuple[np.ndarray, int]:
        img_path = self.images[idx]
        label = self.labels[idx]
        
        # Load and preprocess image
        img = Image.open(img_path).convert('RGB')
        img = img.resize((self.image_size, self.image_size), Image.LANCZOS)
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        return img_array, label


class ArcFaceLayer(layers.Layer):
    """ArcFace layer for metric learning."""
    
    def __init__(self, num_classes: int, embedding_dim: int, 
                 margin: float = 0.5, scale: float = 30.0, **kwargs):
        super(ArcFaceLayer, self).__init__(**kwargs)
        self.num_classes = num_classes
        self.embedding_dim = embedding_dim
        self.margin = margin
        self.scale = scale
        
    def build(self, input_shape):
        self.W = self.add_weight(
            name='W',
            shape=(self.embedding_dim, self.num_classes),
            initializer='glorot_uniform',
            trainable=True
        )
        super(ArcFaceLayer, self).build(input_shape)
    
    def call(self, embeddings, labels=None):
        # Normalize embeddings and weights
        embeddings = tf.nn.l2_normalize(embeddings, axis=1)
        W = tf.nn.l2_normalize(self.W, axis=0)
        
        # Calculate cosine similarity
        cos_theta = tf.matmul(embeddings, W)
        cos_theta = tf.clip_by_value(cos_theta, -1, 1)
        
        if labels is not None:
            # Apply ArcFace margin
            theta = tf.acos(cos_theta)
            target_logits = tf.cos(theta + self.margin * labels)
            
            # One-hot encode labels
            one_hot = tf.one_hot(tf.cast(labels, tf.int32), self.num_classes)
            
            # Combine original and margin logits
            logits = cos_theta * (1 - one_hot) + target_logits * one_hot
            logits *= self.scale
            
            return logits
        
        return cos_theta * self.scale
    
    def get_config(self):
        config = super(ArcFaceLayer, self).get_config()
        config.update({
            'num_classes': self.num_classes,
            'embedding_dim': self.embedding_dim,
            'margin': self.margin,
            'scale': self.scale
        })
        return config


def create_feature_extractor(
    backbone_name: str = 'mobilenet_v3_small',
    num_classes: int = 100,
    embedding_dim: int = 128,
    image_size: int = 224,
    margin: float = 0.5,
    scale: float = 30.0,
    trainable_backbone: bool = True
) -> Tuple[Model, Model]:
    """
    Create feature extractor model with ArcFace head.
    
    Returns:
        model: Full model with ArcFace head (for training)
        embedding_model: Model that outputs embeddings only (for inference)
    """
    
    # Create base model
    if 'mobilenet' in backbone_name:
        base_model = applications.MobileNetV3Small(
            input_shape=(image_size, image_size, 3),
            include_top=False,
            weights='imagenet',
            pooling='avg'
        )
    elif 'efficientnet' in backbone_name:
        base_model = applications.EfficientNetB0(
            input_shape=(image_size, image_size, 3),
            include_top=False,
            weights='imagenet',
            pooling='avg'
        )
    else:
        base_model = applications.MobileNetV3Small(
            input_shape=(image_size, image_size, 3),
            include_top=False,
            weights='imagenet',
            pooling='avg'
        )
    
    # Freeze or unfreeze backbone
    base_model.trainable = trainable_backbone
    
    # Input layer
    inputs = keras.Input(shape=(image_size, image_size, 3))
    
    # Get embeddings from backbone
    x = base_model(inputs, training=False)
    
    # Embedding layer (the learned features)
    embeddings = layers.Dense(embedding_dim, name='embedding')(x)
    embeddings = layers.Lambda(lambda x: tf.nn.l2_normalize(x, axis=1))(embeddings)
    
    # ArcFace head
    arcface = ArcFaceLayer(
        num_classes=num_classes,
        embedding_dim=embedding_dim,
        margin=margin,
        scale=scale,
        name='arcface_layer'
    )(embeddings)
    
    # Full model
    model = Model(inputs=inputs, outputs=arcface, name='muzzle_extractor')
    
    # Embedding model (for inference)
    embedding_model = Model(inputs=inputs, outputs=embeddings, name='embeddings')
    
    return model, embedding_model


def train_with_tensorflow(
    train_dir: str,
    val_dir: str,
    num_classes: int,
    config: dict
) -> Tuple[Model, Model]:
    """Train using TensorFlow/Keras."""
    
    # Data augmentation
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1),
    ])
    
    # Create data generators
    train_datagen = keras.preprocessing.image.ImageDataGenerator(
        rescale=1./255,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1,
        validation_split=0.0
    )
    
    val_datagen = keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(config['image_size'], config['image_size']),
        batch_size=config['batch_size'],
        class_mode='sparse',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(config['image_size'], config['image_size']),
        batch_size=config['batch_size'],
        class_mode='sparse',
        shuffle=False
    )
    
    # Update num_classes based on actual data
    num_classes = train_generator.num_classes
    
    print(f"\nTraining with {num_classes} animal classes")
    
    # Create models
    model, embedding_model = create_feature_extractor(
        backbone_name=config['backbone'],
        num_classes=num_classes,
        embedding_dim=config['embedding_dim'],
        image_size=config['image_size'],
        margin=config['margin'],
        scale=config['scale']
    )
    
    # Compile
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=config['learning_rate']),
        loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=['accuracy']
    )
    
    # Callbacks
    output_dir = Path(config['output_path'])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            str(output_dir / 'best_model.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6
        ),
        keras.callbacks.TensorBoard(
            log_dir=str(output_dir / 'logs')
        )
    ]
    
    # Train
    print("\nStarting training...")
    history = model.fit(
        train_generator,
        epochs=config['epochs'],
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    return model, embedding_model


def export_to_tfjs(model: Model, output_path: str) -> str:
    """Export model to TensorFlow.js format for browser."""
    import json
    
    try:
        # Save Keras model
        keras_path = Path(output_path) / 'model.keras'
        model.save(keras_path)
        print(f"Keras model saved to: {keras_path}")
        
        # Create conversion command
        print("\nTo convert to TensorFlow.js, run:")
        print(f"  pip install tensorflowjs")
        print(f"  tensorflowjs_converter \\")
        print(f"    --input_format=keras \\")
        print(f"    {keras_path} \\")
        print(f"    {output_path}/tfjs_model")
        
        return str(keras_path)
    except Exception as e:
        print(f"Export failed: {e}")
        return None


def quantize_model(model_path: str, output_path: str) -> str:
    """
    Quantize model for mobile deployment.
    Reduces model size significantly.
    """
    try:
        import tensorflowjs as tfjs
        
        print("\nQuantizing model for mobile...")
        tfjs.converters.convert_tfkeras_saved_model_to_tfjs_format(
            saved_model_dir=model_path,
            output_node_names=['embeddings'],
            output_format='tfjs_graph_model',
            quantization_dtype='float16'
        )
        
        print(f"Quantized model saved to: {output_path}")
        return output_path
    except ImportError:
        print("tensorflowjs not installed. Run: pip install tensorflowjs")
        return None
    except Exception as e:
        print(f"Quantization failed: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Train muzzle feature extractor")
    
    parser.add_argument('--data', '-d', type=str,
                        default='dataset/processed',
                        help='Dataset directory')
    parser.add_argument('--backbone', '-b', type=str,
                        default='mobilenet_v3_small',
                        help='Backbone architecture')
    parser.add_argument('--epochs', '-e', type=int,
                        default=50,
                        help='Training epochs')
    parser.add_argument('--batch', type=int,
                        default=32,
                        help='Batch size')
    parser.add_argument('--size', type=int,
                        default=224,
                        help='Image size')
    parser.add_argument('--embedding', type=int,
                        default=128,
                        help='Embedding dimension')
    parser.add_argument('--output', '-o', type=str,
                        default='output/extractor',
                        help='Output directory')
    
    args = parser.parse_args()
    
    # Load config
    config = load_config()
    config.update(vars(args))
    
    print("=" * 60)
    print("Muzzle Feature Extractor Training")
    print("=" * 60)
    
    # Check dataset
    data_dir = Path(args.data)
    train_dir = data_dir / 'images' / 'train'
    val_dir = data_dir / 'images' / 'val'
    
    if not train_dir.exists():
        print(f"\nError: Dataset not found at {train_dir}")
        print("Run prepare_dataset.py first")
        sys.exit(1)
    
    # Load animal mapping
    mapping_path = data_dir / 'animal_mapping.yaml'
    if mapping_path.exists():
        with open(mapping_path, 'r') as f:
            animal_mapping = yaml.safe_load(f)
        num_classes = len(animal_mapping)
        print(f"\nFound {num_classes} animal classes")
    else:
        print("Warning: animal_mapping.yaml not found")
        num_classes = 100  # Default
    
    # Train
    if USE_TENSORFLOW:
        model, embedding_model = train_with_tensorflow(
            str(train_dir),
            str(val_dir),
            num_classes,
            config
        )
        
        # Export
        print("\nExporting models...")
        export_to_tfjs(embedding_model, args.output)
    else:
        print("\nError: TensorFlow is required for this script")
        print("Install with: pip install tensorflow")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print(f"\nOutput: {args.output}")
    print("\nNext steps:")
    print("1. Convert model to TF.js format")
    print("2. Place in src/models/ folder")
    print("3. Update muzzleLocalMLService to use new model")


if __name__ == "__main__":
    main()
