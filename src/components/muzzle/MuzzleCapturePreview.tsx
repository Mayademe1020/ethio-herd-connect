/**
 * MuzzleCapturePreview Component
 * Preview captured muzzle images with quality assessment and selection
 * Requirements: 1.7, 1.8, 1.9
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  RotateCcw, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Focus,
  Ruler,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { CapturedImage, QualityScore } from '@/types/muzzle';

interface MuzzleCapturePreviewProps {
  images: CapturedImage[];
  onConfirm: (selectedImage: CapturedImage) => void;
  onRetake: () => void;
  onCancel: () => void;
  autoSelectBest?: boolean;
}

export const MuzzleCapturePreview: React.FC<MuzzleCapturePreviewProps> = ({
  images,
  onConfirm,
  onRetake,
  onCancel,
  autoSelectBest = true,
}) => {
  const { t } = useTranslations();

  // Calculate quality score for each image
  const imagesWithScores = useMemo(() => {
    return images.map(image => ({
      ...image,
      qualityScore: calculateQualityScore(image),
    }));
  }, [images]);

  // Find best image
  const bestImageIndex = useMemo(() => {
    if (imagesWithScores.length === 0) return 0;
    
    let bestIndex = 0;
    let bestScore = 0;

    imagesWithScores.forEach((img, index) => {
      if (img.qualityScore.overall > bestScore) {
        bestScore = img.qualityScore.overall;
        bestIndex = index;
      }
    });

    return bestIndex;
  }, [imagesWithScores]);

  // Selected image state
  const [selectedIndex, setSelectedIndex] = useState(
    autoSelectBest ? bestImageIndex : 0
  );

  const selectedImage = imagesWithScores[selectedIndex];

  // Navigate between images
  const goToPrevious = () => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : imagesWithScores.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex(prev => (prev < imagesWithScores.length - 1 ? prev + 1 : 0));
  };

  // Handle confirm
  const handleConfirm = () => {
    if (selectedImage) {
      onConfirm(images[selectedIndex]);
    }
  };

  // Get quality indicator color
  const getQualityColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (images.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">{t('muzzle.noImagesCapture')}</p>
        <Button onClick={onRetake} className="mt-4">
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('muzzle.captureAgain')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main preview */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Image */}
          <img
            src={selectedImage.dataUrl}
            alt={t('muzzle.capturedImage')}
            className="w-full h-64 object-cover"
          />

          {/* Best image badge */}
          {selectedIndex === bestImageIndex && imagesWithScores.length > 1 && (
            <Badge className="absolute top-2 left-2 bg-green-500">
              <Star className="w-3 h-3 mr-1" />
              {t('muzzle.bestQuality')}
            </Badge>
          )}

          {/* Quality score badge */}
          <Badge 
            className={`absolute top-2 right-2 ${getQualityBgColor(selectedImage.qualityScore.overall)}`}
          >
            {selectedImage.qualityScore.overall}%
          </Badge>

          {/* Navigation arrows for multiple images */}
          {imagesWithScores.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Image counter */}
          {imagesWithScores.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {imagesWithScores.length}
            </div>
          )}
        </div>

        {/* Quality details */}
        <div className="p-4 space-y-3">
          {/* Overall quality bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{t('muzzle.overallQuality')}</span>
              <span className={getQualityColor(selectedImage.qualityScore.overall)}>
                {selectedImage.qualityScore.overall}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getQualityBgColor(selectedImage.qualityScore.overall)} transition-all`}
                style={{ width: `${selectedImage.qualityScore.overall}%` }}
              />
            </div>
          </div>

          {/* Quality metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Brightness */}
            <div className="flex items-center gap-2 text-sm">
              <Sun className={`w-4 h-4 ${getQualityColor(selectedImage.qualityScore.brightness)}`} />
              <span className="text-gray-600">{t('muzzle.brightness')}</span>
              <span className={`ml-auto font-medium ${getQualityColor(selectedImage.qualityScore.brightness)}`}>
                {selectedImage.qualityScore.brightness}%
              </span>
            </div>

            {/* Sharpness */}
            <div className="flex items-center gap-2 text-sm">
              <Focus className={`w-4 h-4 ${getQualityColor(selectedImage.qualityScore.sharpness)}`} />
              <span className="text-gray-600">{t('muzzle.sharpness')}</span>
              <span className={`ml-auto font-medium ${getQualityColor(selectedImage.qualityScore.sharpness)}`}>
                {selectedImage.qualityScore.sharpness}%
              </span>
            </div>

            {/* Coverage */}
            <div className="flex items-center gap-2 text-sm">
              <Ruler className={`w-4 h-4 ${getQualityColor(selectedImage.qualityScore.coverage)}`} />
              <span className="text-gray-600">{t('muzzle.coverage')}</span>
              <span className={`ml-auto font-medium ${getQualityColor(selectedImage.qualityScore.coverage)}`}>
                {selectedImage.qualityScore.coverage}%
              </span>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-2 text-sm">
              {selectedImage.metadata.distance === 'optimal' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-gray-600">{t('muzzle.distance')}</span>
              <span className={`ml-auto font-medium ${
                selectedImage.metadata.distance === 'optimal' ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {t(`muzzle.distance${capitalize(selectedImage.metadata.distance)}`)}
              </span>
            </div>
          </div>

          {/* Quality recommendation */}
          {selectedImage.qualityScore.overall < 70 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {t('muzzle.qualityWarning')}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {getQualityRecommendation(selectedImage)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail strip for multiple images */}
      {imagesWithScores.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imagesWithScores.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex 
                  ? 'border-green-500 ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={img.dataUrl}
                alt={`${t('muzzle.capture')} ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Best indicator */}
              {index === bestImageIndex && (
                <div className="absolute top-0 right-0 bg-green-500 p-0.5 rounded-bl">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
              {/* Quality indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${getQualityBgColor(img.qualityScore.overall)}`} />
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          {t('common.cancel')}
        </Button>
        <Button
          variant="outline"
          onClick={onRetake}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('muzzle.retake')}
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={selectedImage.qualityScore.overall < 30}
        >
          <Check className="w-4 h-4 mr-2" />
          {t('muzzle.confirm')}
        </Button>
      </div>
    </div>
  );
};

// Helper function to calculate quality score
function calculateQualityScore(image: CapturedImage): QualityScore {
  const { metadata } = image;
  
  // Brightness score (ideal: 50-80)
  const brightness = Math.round(metadata.brightness);
  
  // Sharpness score (inverse of blur)
  const sharpness = Math.round(100 - metadata.blur);
  
  // Coverage score based on distance
  let coverage = 70;
  if (metadata.distance === 'optimal') coverage = 90;
  else if (metadata.distance === 'too_far') coverage = 50;
  else if (metadata.distance === 'too_close') coverage = 40;
  
  // Calculate overall score
  const overall = Math.round(
    (brightness * 0.25) +
    (sharpness * 0.35) +
    (coverage * 0.25) +
    (metadata.lighting === 'good' ? 15 : metadata.lighting === 'acceptable' ? 10 : 5)
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    brightness: Math.min(100, Math.max(0, brightness)),
    sharpness: Math.min(100, Math.max(0, sharpness)),
    coverage: Math.min(100, Math.max(0, coverage)),
  };
}

// Helper function to get quality recommendation
function getQualityRecommendation(image: CapturedImage & { qualityScore: QualityScore }): string {
  const issues: string[] = [];
  
  if (image.qualityScore.brightness < 50) {
    issues.push('improve lighting');
  }
  if (image.qualityScore.sharpness < 60) {
    issues.push('hold camera steady');
  }
  if (image.metadata.distance !== 'optimal') {
    issues.push(image.metadata.distance === 'too_far' ? 'move closer' : 'move back');
  }
  
  if (issues.length === 0) {
    return 'Image quality is acceptable but could be improved.';
  }
  
  return `Try to ${issues.join(', ')} for better results.`;
}

// Helper function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
}

export default MuzzleCapturePreview;
