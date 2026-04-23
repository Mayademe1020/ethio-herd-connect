/**
 * Muzzle Identification Components
 * Export all muzzle-related components for easy importing
 */

export { MuzzleCaptureCamera } from './MuzzleCaptureCamera';
export { 
  MuzzleQualityValidator, 
  validateCaptureQuality,
  MotionDetector,
  detectBlur,
  detectBrightness,
  estimateDistance,
  type QualityAssessment 
} from './MuzzleQualityValidator';
export { MuzzleCapturePreview } from './MuzzleCapturePreview';
export {
  MuzzleCaptureGuide,
  AnimalWelfareTips,
  LightingTips
} from './MuzzleCaptureGuide';
export { MuzzleRegistration } from './MuzzleRegistration';
