/**
 * MuzzleQualityValidator Component
 * Real-time quality assessment display for muzzle capture
 * Requirements: 1.4, 1.5, 1.10, 1.11
 */

import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Sun, Focus, Ruler, Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface QualityAssessment {
  brightness: number; // 0-100
  sharpness: number; // 0-100
  distance: 'too_close' | 'optimal' | 'too_far';
  lighting: 'poor' | 'acceptable' | 'good';
  motion: boolean;
  overall: number; // 0-100
}

interface MuzzleQualityValidatorProps {
  quality: QualityAssessment;
  showDetails?: boolean;
}

export const MuzzleQualityValidator: React.FC<MuzzleQualityValidatorProps> = ({
  quality,
  showDetails = false,
}) => {
  const { t } = useTranslations();

  // Get status icon and color based on value
  const getStatusIndicator = (value: number, thresholds: { good: number; acceptable: number }) => {
    if (value >= thresholds.good) {
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500' };
    } else if (value >= thresholds.acceptable) {
      return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500' };
    }
    return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500' };
  };

  // Get distance status
  const getDistanceStatus = () => {
    switch (quality.distance) {
      case 'optimal':
        return { icon: CheckCircle, color: 'text-green-500', label: t('muzzle.distanceOptimal') };
      case 'too_far':
        return { icon: AlertTriangle, color: 'text-yellow-500', label: t('muzzle.distanceTooFar') };
      case 'too_close':
        return { icon: XCircle, color: 'text-red-500', label: t('muzzle.distanceTooClose') };
    }
  };

  // Get lighting status
  const getLightingStatus = () => {
    switch (quality.lighting) {
      case 'good':
        return { icon: CheckCircle, color: 'text-green-500', label: t('muzzle.lightingGood') };
      case 'acceptable':
        return { icon: AlertTriangle, color: 'text-yellow-500', label: t('muzzle.lightingAcceptable') };
      case 'poor':
        return { icon: XCircle, color: 'text-red-500', label: t('muzzle.lightingPoor') };
    }
  };

  const brightnessStatus = getStatusIndicator(quality.brightness, { good: 60, acceptable: 40 });
  const sharpnessStatus = getStatusIndicator(quality.sharpness, { good: 70, acceptable: 50 });
  const distanceStatus = getDistanceStatus();
  const lightingStatus = getLightingStatus();
  const overallStatus = getStatusIndicator(quality.overall, { good: 70, acceptable: 50 });

  // Get overall quality color for the main indicator
  const getOverallColor = () => {
    if (quality.overall >= 70) return 'from-green-500 to-green-600';
    if (quality.overall >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // Get guidance message based on current quality
  const getGuidanceMessage = (): string => {
    if (quality.motion) {
      return t('muzzle.holdSteady');
    }
    if (quality.lighting === 'poor') {
      return t('muzzle.needMoreLight');
    }
    if (quality.distance === 'too_far') {
      return t('muzzle.moveCloser');
    }
    if (quality.distance === 'too_close') {
      return t('muzzle.moveBack');
    }
    if (quality.sharpness < 50) {
      return t('muzzle.holdStill');
    }
    if (quality.overall >= 70) {
      return t('muzzle.readyToCapture');
    }
    return t('muzzle.adjustPosition');
  };

  return (
    <div className="absolute bottom-24 left-4 right-4">
      {/* Main quality bar */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
        {/* Overall quality score */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">
            {t('muzzle.quality')}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${
              quality.overall >= 70 ? 'text-green-400' :
              quality.overall >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {quality.overall}%
            </span>
          </div>
        </div>

        {/* Quality progress bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full bg-gradient-to-r ${getOverallColor()} transition-all duration-300`}
            style={{ width: `${quality.overall}%` }}
          />
        </div>

        {/* Guidance message */}
        <div className={`text-center py-1 px-2 rounded ${
          quality.overall >= 70 ? 'bg-green-500/20' :
          quality.overall >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
        }`}>
          <p className={`text-sm ${
            quality.overall >= 70 ? 'text-green-300' :
            quality.overall >= 50 ? 'text-yellow-300' : 'text-red-300'
          }`}>
            {getGuidanceMessage()}
          </p>
        </div>

        {/* Detailed indicators */}
        {showDetails && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {/* Brightness */}
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Sun className={`w-4 h-4 ${brightnessStatus.color}`} />
              <span>{t('muzzle.brightness')}</span>
              <span className={brightnessStatus.color}>{Math.round(quality.brightness)}%</span>
            </div>

            {/* Sharpness */}
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Focus className={`w-4 h-4 ${sharpnessStatus.color}`} />
              <span>{t('muzzle.sharpness')}</span>
              <span className={sharpnessStatus.color}>{Math.round(quality.sharpness)}%</span>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Ruler className={`w-4 h-4 ${distanceStatus.color}`} />
              <span>{distanceStatus.label}</span>
            </div>

            {/* Motion */}
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Activity className={`w-4 h-4 ${quality.motion ? 'text-red-500' : 'text-green-500'}`} />
              <span>{quality.motion ? t('muzzle.motionDetected') : t('muzzle.stable')}</span>
            </div>
          </div>
        )}

        {/* Quick status indicators */}
        {!showDetails && (
          <div className="mt-2 flex justify-center gap-4">
            <div className="flex items-center gap-1">
              <Sun className={`w-4 h-4 ${brightnessStatus.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <Focus className={`w-4 h-4 ${sharpnessStatus.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <Ruler className={`w-4 h-4 ${distanceStatus.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <Activity className={`w-4 h-4 ${quality.motion ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Utility function to validate image quality for capture
 */
export const validateCaptureQuality = (quality: QualityAssessment): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  if (quality.brightness < 30) {
    issues.push('brightness_too_low');
  }
  if (quality.sharpness < 40) {
    issues.push('image_too_blurry');
  }
  if (quality.distance === 'too_close') {
    issues.push('too_close');
  }
  if (quality.distance === 'too_far') {
    issues.push('too_far');
  }
  if (quality.motion) {
    issues.push('motion_detected');
  }
  if (quality.lighting === 'poor') {
    issues.push('poor_lighting');
  }

  return {
    isValid: quality.overall >= 50 && issues.length === 0,
    issues,
  };
};

/**
 * Motion detection utility
 */
export class MotionDetector {
  private previousFrame: ImageData | null = null;
  private motionThreshold: number;

  constructor(threshold: number = 30) {
    this.motionThreshold = threshold;
  }

  detectMotion(currentFrame: ImageData): boolean {
    if (!this.previousFrame) {
      this.previousFrame = currentFrame;
      return false;
    }

    let diffSum = 0;
    const data1 = this.previousFrame.data;
    const data2 = currentFrame.data;

    // Sample every 10th pixel for performance
    for (let i = 0; i < data1.length; i += 40) {
      const diff = Math.abs(data1[i] - data2[i]);
      diffSum += diff;
    }

    const avgDiff = diffSum / (data1.length / 40);
    this.previousFrame = currentFrame;

    return avgDiff > this.motionThreshold;
  }

  reset(): void {
    this.previousFrame = null;
  }
}

/**
 * Blur detection utility using Laplacian variance
 */
export const detectBlur = (imageData: ImageData): number => {
  const { data, width, height } = imageData;
  let laplacianSum = 0;
  let count = 0;

  // Laplacian kernel: [0, 1, 0], [1, -4, 1], [0, 1, 0]
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const top = ((y - 1) * width + x) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      // Calculate grayscale values
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const topVal = (data[top] + data[top + 1] + data[top + 2]) / 3;
      const bottomVal = (data[bottom] + data[bottom + 1] + data[bottom + 2]) / 3;
      const leftVal = (data[left] + data[left + 1] + data[left + 2]) / 3;
      const rightVal = (data[right] + data[right + 1] + data[right + 2]) / 3;

      // Laplacian
      const laplacian = topVal + bottomVal + leftVal + rightVal - 4 * center;
      laplacianSum += laplacian * laplacian;
      count++;
    }
  }

  // Variance of Laplacian - higher means sharper
  const variance = laplacianSum / count;
  
  // Normalize to 0-100 scale (higher = sharper)
  // Typical variance ranges from 0 to ~5000 for sharp images
  return Math.min(100, (variance / 50));
};

/**
 * Brightness detection utility
 */
export const detectBrightness = (imageData: ImageData): number => {
  const { data } = imageData;
  let totalBrightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    // Use luminance formula
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalBrightness += luminance;
  }

  const avgBrightness = totalBrightness / (data.length / 4);
  return (avgBrightness / 255) * 100;
};

/**
 * Distance estimation based on expected muzzle size
 */
export const estimateDistance = (
  detectedMuzzleWidth: number,
  frameWidth: number
): 'too_close' | 'optimal' | 'too_far' => {
  // Expected muzzle should occupy 40-60% of frame width for optimal capture
  const ratio = detectedMuzzleWidth / frameWidth;

  if (ratio > 0.7) return 'too_close';
  if (ratio < 0.3) return 'too_far';
  return 'optimal';
};

export default MuzzleQualityValidator;
