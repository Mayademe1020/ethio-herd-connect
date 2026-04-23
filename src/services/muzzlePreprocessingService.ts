/**
 * Muzzle Image Preprocessing Service
 * Prepares captured muzzle images for ML model inference
 * Requirements: 1.6, 2.1
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for image preprocessing
 */
export interface PreprocessingConfig {
  /** Target width for model input (default: 224 for MobileNet) */
  targetWidth: number;
  /** Target height for model input (default: 224 for MobileNet) */
  targetHeight: number;
  /** Whether to normalize pixel values to [0, 1] or [-1, 1] */
  normalizationMode: 'zero_one' | 'minus_one_one';
  /** Whether to apply quality enhancement */
  applyEnhancement: boolean;
  /** Whether to auto-correct orientation from EXIF */
  autoOrient: boolean;
}

/**
 * Result of preprocessing operation
 */
export interface PreprocessedImage {
  /** Preprocessed image data as Float32Array for model input */
  tensor: Float32Array;
  /** Original image dimensions */
  originalWidth: number;
  originalHeight: number;
  /** Final dimensions after preprocessing */
  finalWidth: number;
  finalHeight: number;
  /** Whether orientation was corrected */
  orientationCorrected: boolean;
  /** Whether enhancement was applied */
  enhanced: boolean;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * EXIF orientation values
 */
type ExifOrientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_PREPROCESSING_CONFIG: PreprocessingConfig = {
  targetWidth: 224,
  targetHeight: 224,
  normalizationMode: 'zero_one',
  applyEnhancement: true,
  autoOrient: true,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load an image from various sources into an HTMLImageElement
 */
async function loadImage(imageSource: Blob | File | HTMLImageElement | string): Promise<HTMLImageElement> {
  if (imageSource instanceof HTMLImageElement) {
    return imageSource;
  }

  const image = new Image();
  image.crossOrigin = 'anonymous'; // Handle CORS

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));

    if (typeof imageSource === 'string') {
      image.src = imageSource;
    } else {
      const url = URL.createObjectURL(imageSource);
      image.src = url;
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
    }
  });
}

/**
 * Extract EXIF orientation from image file
 */
async function getExifOrientation(file: Blob | File): Promise<ExifOrientation> {
  try {
    // Use a simple EXIF reader or fallback to 1
    // For now, return 1 as default (no rotation)
    // TODO: Implement proper EXIF parsing
    return 1;
  } catch {
    return 1;
  }
}

/**
 * Apply orientation transformation to canvas context
 */
function applyOrientationTransform(
  ctx: CanvasRenderingContext2D,
  orientation: ExifOrientation,
  width: number,
  height: number
): void {
  ctx.save();

  switch (orientation) {
    case 2:
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      break;
    case 3:
      ctx.rotate(Math.PI);
      ctx.translate(-width, -height);
      break;
    case 4:
      ctx.scale(1, -1);
      ctx.translate(0, -height);
      break;
    case 5:
      ctx.rotate(Math.PI / 2);
      ctx.scale(1, -1);
      ctx.translate(0, -width);
      break;
    case 6:
      ctx.rotate(Math.PI / 2);
      ctx.translate(height, 0);
      break;
    case 7:
      ctx.rotate(Math.PI / 2);
      ctx.scale(-1, 1);
      ctx.translate(-height, -width);
      break;
    case 8:
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-height, 0);
      break;
    default:
      // No transformation needed
      break;
  }
}

/**
 * Apply basic quality enhancement to image data
 */
function applyQualityEnhancement(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Simple contrast and brightness enhancement
  // This is a basic implementation - could be improved with more sophisticated algorithms

  for (let i = 0; i < data.length; i += 4) {
    // Get RGB values
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Increase contrast slightly
    const contrast = 1.1;
    const brightness = 5;

    r = (r - 128) * contrast + 128 + brightness;
    g = (g - 128) * contrast + 128 + brightness;
    b = (b - 128) * contrast + 128 + brightness;

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  return imageData;
}

/**
 * Convert ImageData to normalized Float32Array tensor
 */
function imageDataToTensor(imageData: ImageData, normalizationMode: 'zero_one' | 'minus_one_one'): Float32Array {
  const { data, width, height } = imageData;
  const tensor = new Float32Array(width * height * 3);

  let index = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    if (normalizationMode === 'zero_one') {
      tensor[index++] = r;
      tensor[index++] = g;
      tensor[index++] = b;
    } else {
      // minus_one_one: scale to [-1, 1]
      tensor[index++] = r * 2 - 1;
      tensor[index++] = g * 2 - 1;
      tensor[index++] = b * 2 - 1;
    }
  }

  return tensor;
}

// ============================================================================
// Main Preprocessing Functions
// ============================================================================

/**
 * Preprocess an image for ML model inference
 * @param imageSource - Image source (Blob, File, HTMLImageElement, or data URL)
 * @param config - Preprocessing configuration
 * @returns Preprocessed image ready for model input
 */
export async function preprocessImage(
  imageSource: Blob | File | HTMLImageElement | string,
  config: Partial<PreprocessingConfig> = {}
): Promise<PreprocessedImage> {
  const startTime = performance.now();
  const fullConfig = { ...DEFAULT_PREPROCESSING_CONFIG, ...config };

  // Load image into HTMLImageElement
  const image = await loadImage(imageSource);
  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;

  // Detect and handle orientation
  let orientationCorrected = false;
  let orientation: ExifOrientation = 1;
  
  if (fullConfig.autoOrient && (imageSource instanceof Blob || imageSource instanceof File)) {
    orientation = await getExifOrientation(imageSource);
    orientationCorrected = orientation !== 1;
  }

  // Create canvas for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Set canvas size to target dimensions
  canvas.width = fullConfig.targetWidth;
  canvas.height = fullConfig.targetHeight;

  // Apply orientation transform and draw image
  applyOrientationTransform(ctx, orientation, fullConfig.targetWidth, fullConfig.targetHeight);
  
  // Calculate scaling to fit image in target dimensions while maintaining aspect ratio
  const scale = Math.min(
    fullConfig.targetWidth / originalWidth,
    fullConfig.targetHeight / originalHeight
  );
  
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;
  const offsetX = (fullConfig.targetWidth - scaledWidth) / 2;
  const offsetY = (fullConfig.targetHeight - scaledHeight) / 2;

  // Fill background with neutral gray (helps with edge artifacts)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, fullConfig.targetWidth, fullConfig.targetHeight);

  // Draw scaled image centered
  ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

  // Get image data for processing
  let imageData = ctx.getImageData(0, 0, fullConfig.targetWidth, fullConfig.targetHeight);

  // Apply quality enhancement if enabled
  let enhanced = false;
  if (fullConfig.applyEnhancement) {
    imageData = applyQualityEnhancement(imageData);
    enhanced = true;
  }

  // Convert to normalized tensor
  const tensor = imageDataToTensor(imageData, fullConfig.normalizationMode);

  const processingTimeMs = performance.now() - startTime;

  return {
    tensor,
    originalWidth,
    originalHeight,
    finalWidth: fullConfig.targetWidth,
    finalHeight: fullConfig.targetHeight,
    orientationCorrected,
    enhanced,
    processingTimeMs,
  };
}
