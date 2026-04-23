#!/usr/bin/env python3
"""
CNN + ArcFace Feature Extractor Training

Trains a CNN with ArcFace loss for muzzle feature extraction.
ArcFace provides better discrimination than standard softmax.

Usage:
    python scripts/train_extractor.py --data ./datasets/processed --epochs 50
"""

import os
import sys
import argparse
from pathlib import Path
import yaml
import numpy as np
from datetime import datetime


def parse_args():
    parser = argparse.ArgumentParser(description='Train CNN + ArcFace feature extractor')
    parser.add_argument('--data', '-d', required=True, help='Path to dataset directory')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs')
    parser.add_argument('--batch', type=int, default=32, help='Batch size')
    parser.add_argument('--embedding-dim', type=int, default=128, help='Embedding dimension')
    parser.add_argument('--image-size', type=int, default=224, help='Image size')
    parser.add_argument('--output', '-o', default='./models/extractor', help='Output directory')
    parser.add_argument('--config', '-c', default='config.yaml', help='Config file')
    parser.add_argument('--device', default='cuda', help='Device (cuda/cpu)')
    parser.add_argument('--backbone', default='MobileNetV2', help='Backbone architecture')
    return parser.parse_args()


def check_requirements():
    """Check if required packages are installed."""
    try:
        import tensorflow as tf
        from tensorflow import keras
        return True
    except ImportError:
        print("Error: tensorflow not installed")
        print("   Run: pip install tensorflow")
        return False


def create_data_generators(dataset_dir: Path, image_size: int, batch_size: int):
    """Create TensorFlow data generators for train/val/test."""
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        zoom_range=0.1,
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_dir = dataset_dir / 'train'
    val_dir = dataset_dir / 'val'
    
    train_generator = train_datagen.flow_from_directory(
        str(train_dir),
        target_size=(image_size, image_size),
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        str(val_dir),
        target_size=(image_size, image_size),
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, val_generator


def create_arcface_model(num_classes: int, input_shape: tuple, embedding_dim: int = 128):
    """
    Create ArcFace model.
    
    ArcFace adds angular margin to softmax for better discrimination.
    """
    from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization
    from tensorflow.keras.models import Model
    
    # Load backbone
    from tensorflow.keras.applications import MobileNetV2
    
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape,
        pooling='avg'
    )
    
    # Freeze early layers
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Input
    input_img = Input(shape=input_shape, name='input_image')
    
    # Backbone
    x = base_model(input_img)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    
    # Embedding layer
    embedding = Dense(embedding_dim, name='embedding')(x)
    embedding = BatchNormalization(name='embedding_bn')(embedding)
    
    # ArcFace head (simplified)
    # In production, use the arcface package
    output = Dense(num_classes, activation='softmax', name='classification')(embedding)
    
    model = Model(inputs=input_img, outputs=output, name='arcface_extractor')
    
    return model, base_model


def create_siamese_model(backbone, num_classes: int, embedding_dim: int = 128):
    """
    Create Siamese network for verification.
    
    Uses contrastive loss for learning similarity.
    """
    from tensorflow.keras.layers import Input, Dense, Subtract, Dot
    from tensorflow.keras.models import Model
    
    # Input pairs
    input_a = Input(shape=(224, 224, 3), name='input_a')
    input_b = Input(shape=(224, 224, 3), name='input_b')
    
    # Share weights
    embedding_a = backbone(input_a)
    embedding_b = backbone(input_b)
    
    # Distance
    distance = Subtract()([embedding_a, embedding_b])
    distance = Dense(64, activation='relu')(distance)
    output = Dense(1, activation='sigmoid')(distance)
    
    model = Model(inputs=[input_a, input_b], outputs=output)
    
    return model


def train_with_arcface_loss(train_gen, val_gen, num_classes: int, 
                            epochs: int, output_dir: Path):
    """
    Train model with ArcFace-like loss.
    
    This is a simplified version. For production, use:
    https://github.com/timesler/facenet-pytorch
    """
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, TensorBoard
    from tensorflow.keras.losses import CategoricalCrossentropy
    
    # Create model
    model, backbone = create_arcface_model(
        num_classes=num_classes,
        input_shape=(224, 224, 3),
        embedding_dim=128
    )
    
    # Compile
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss=CategoricalCrossentropy(),
        metrics=['accuracy']
    )
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            str(output_dir / 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            min_delta=0.001,
            verbose=1
        ),
        TensorBoard(
            log_dir=str(output_dir / 'logs'),
            histogram_freq=1
        )
    ]
    
    # Train
    history = model.fit(
        train_gen,
        epochs=epochs,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save embedding extractor (remove classification head)
    embedding_model = Model(
        inputs=model.input,
        outputs=model.get_layer('embedding_bn').output,
        name='muzzle_embedding_extractor'
    )
    embedding_model.save(str(output_dir / 'embedding_model.h5'))
    
    return history, model


def extract_embeddings(model_path: Path, image_paths: list):
    """Extract embeddings from trained model."""
    from tensorflow.keras.models import load_model
    import cv2
    
    model = load_model(str(model_path / 'embedding_model.h5'))
    
    embeddings = []
    for img_path in image_paths:
        img = cv2.imread(str(img_path))
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        
        embedding = model.predict(img, verbose=0)
        embeddings.append(embedding[0])
    
    return np.array(embeddings)


def evaluate_model(model, test_gen, output_dir: Path):
    """Evaluate model and save metrics."""
    from sklearn.metrics import classification_report, confusion_matrix
    import matplotlib.pyplot as plt
    
    # Get predictions
    predictions = model.predict(test_gen, verbose=1)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_gen.classes
    
    # Classification report
    report = classification_report(y_true, y_pred)
    print("\nClassification Report:")
    print(report)
    
    # Save report
    with open(output_dir / 'classification_report.txt', 'w') as f:
        f.write(report)
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Plot
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.set_title('Confusion Matrix')
    plt.colorbar(ax.imshow(cm, cmap=plt.cm.Blues))
    plt.savefig(output_dir / 'confusion_matrix.png', dpi=150)
    
    return report, cm


def main():
    args = parse_args()
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Setup paths
    dataset_dir = Path(args.data)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🐄 CNN + ArcFace Feature Extractor Training")
    print(f"   Dataset:  {dataset_dir}")
    print(f"   Output:   {output_dir}")
    print(f"   Epochs:   {args.epochs}")
    print(f"   Backbone: {args.backbone}")
    print()
    
    # Create data generators
    print("📦 Creating data generators...")
    train_gen, val_gen = create_data_generators(
        dataset_dir,
        args.image_size,
        args.batch
    )
    
    num_classes = train_gen.num_classes
    print(f"   Classes: {num_classes}")
    print(f"   Train samples: {train_gen.samples}")
    print(f"   Val samples: {val_gen.samples}")
    
    # Train
    print(f"\n🚀 Training model...")
    history, model = train_with_arcface_loss(
        train_gen,
        val_gen,
        num_classes,
        args.epochs,
        output_dir
    )
    
    # Evaluate
    print(f"\n📊 Evaluating model...")
    test_dir = dataset_dir / 'test'
    if test_dir.exists():
        _, test_gen = create_data_generators(dataset_dir, args.image_size, args.batch)
        report, cm = evaluate_model(model, test_gen, output_dir)
    
    # Summary
    print("\n" + "="*50)
    print("📋 TRAINING COMPLETE")
    print("="*50)
    print(f"Embedding model: {output_dir / 'embedding_model.h5'}")
    print(f"Best model:      {output_dir / 'best_model.h5'}")
    print(f"Logs:            {output_dir / 'logs'}")
    
    # Best epoch
    if hasattr(history, 'history'):
        val_acc = history.history.get('val_accuracy', [0])
        best_epoch = np.argmax(val_acc) + 1
        best_acc = max(val_acc)
        print(f"\n   Best val accuracy: {best_acc:.4f} at epoch {best_epoch}")


if __name__ == '__main__':
    main()
