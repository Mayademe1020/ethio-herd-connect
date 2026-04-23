/**
 * MuzzleCaptureGuide Component
 * Provides positioning instructions, lighting tips, and animal welfare guidance
 * Requirements: 1.10, 1.11, 12.1, 14.1
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  X, 
  Sun, 
  Move, 
  Heart, 
  Camera, 
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Hand,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { QualityAssessment } from './MuzzleQualityValidator';

interface MuzzleCaptureGuideProps {
  onDismiss: () => void;
  quality?: QualityAssessment | null;
  showFullGuide?: boolean;
}

interface GuideTip {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  category: 'positioning' | 'lighting' | 'welfare' | 'technique';
}

const GUIDE_TIPS: GuideTip[] = [
  {
    id: 'position-center',
    icon: <Camera className="w-6 h-6" />,
    titleKey: 'muzzle.guide.positionCenter',
    descriptionKey: 'muzzle.guide.positionCenterDesc',
    category: 'positioning',
  },
  {
    id: 'distance-optimal',
    icon: <Move className="w-6 h-6" />,
    titleKey: 'muzzle.guide.optimalDistance',
    descriptionKey: 'muzzle.guide.optimalDistanceDesc',
    category: 'positioning',
  },
  {
    id: 'lighting-natural',
    icon: <Sun className="w-6 h-6" />,
    titleKey: 'muzzle.guide.naturalLight',
    descriptionKey: 'muzzle.guide.naturalLightDesc',
    category: 'lighting',
  },
  {
    id: 'avoid-shadows',
    icon: <Lightbulb className="w-6 h-6" />,
    titleKey: 'muzzle.guide.avoidShadows',
    descriptionKey: 'muzzle.guide.avoidShadowsDesc',
    category: 'lighting',
  },
  {
    id: 'approach-calm',
    icon: <Hand className="w-6 h-6" />,
    titleKey: 'muzzle.guide.approachCalm',
    descriptionKey: 'muzzle.guide.approachCalmDesc',
    category: 'welfare',
  },
  {
    id: 'no-flash',
    icon: <Eye className="w-6 h-6" />,
    titleKey: 'muzzle.guide.noFlash',
    descriptionKey: 'muzzle.guide.noFlashDesc',
    category: 'welfare',
  },
  {
    id: 'animal-comfort',
    icon: <Heart className="w-6 h-6" />,
    titleKey: 'muzzle.guide.animalComfort',
    descriptionKey: 'muzzle.guide.animalComfortDesc',
    category: 'welfare',
  },
];

export const MuzzleCaptureGuide: React.FC<MuzzleCaptureGuideProps> = ({
  onDismiss,
  quality,
  showFullGuide = false,
}) => {
  const { t } = useTranslations();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showAllTips, setShowAllTips] = useState(showFullGuide);

  // Get contextual tip based on current quality
  const getContextualTip = (): GuideTip | null => {
    if (!quality) return null;

    if (quality.lighting === 'poor') {
      return GUIDE_TIPS.find(tip => tip.id === 'lighting-natural') || null;
    }
    if (quality.distance === 'too_far') {
      return GUIDE_TIPS.find(tip => tip.id === 'distance-optimal') || null;
    }
    if (quality.distance === 'too_close') {
      return GUIDE_TIPS.find(tip => tip.id === 'distance-optimal') || null;
    }
    if (quality.motion) {
      return GUIDE_TIPS.find(tip => tip.id === 'approach-calm') || null;
    }

    return null;
  };

  const contextualTip = getContextualTip();

  // Navigate tips
  const nextTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % GUIDE_TIPS.length);
  };

  const prevTip = () => {
    setCurrentTipIndex(prev => (prev - 1 + GUIDE_TIPS.length) % GUIDE_TIPS.length);
  };

  // Render compact contextual guide
  if (!showAllTips && contextualTip) {
    return (
      <div className="absolute top-16 left-4 right-4">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 flex items-start gap-3">
          <div className="text-yellow-400 flex-shrink-0">
            {contextualTip.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">
              {t(contextualTip.titleKey)}
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              {t(contextualTip.descriptionKey)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-white/60 hover:text-white hover:bg-white/10 -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Render full guide overlay
  if (showAllTips) {
    const currentTip = GUIDE_TIPS[currentTipIndex];
    
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-sm bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">
              {t('muzzle.guide.title')}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tip content */}
          <div className="p-6 text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              currentTip.category === 'welfare' ? 'bg-pink-100 text-pink-600' :
              currentTip.category === 'lighting' ? 'bg-yellow-100 text-yellow-600' :
              currentTip.category === 'positioning' ? 'bg-blue-100 text-blue-600' :
              'bg-green-100 text-green-600'
            }`}>
              {currentTip.icon}
            </div>
            
            <h4 className="font-semibold text-lg mb-2">
              {t(currentTip.titleKey)}
            </h4>
            <p className="text-gray-600">
              {t(currentTip.descriptionKey)}
            </p>

            {/* Category badge */}
            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                currentTip.category === 'welfare' ? 'bg-pink-100 text-pink-700' :
                currentTip.category === 'lighting' ? 'bg-yellow-100 text-yellow-700' :
                currentTip.category === 'positioning' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {t(`muzzle.guide.category.${currentTip.category}`)}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTip}
              disabled={currentTipIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('common.previous')}
            </Button>

            {/* Progress dots */}
            <div className="flex gap-1">
              {GUIDE_TIPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTipIndex ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentTipIndex < GUIDE_TIPS.length - 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={nextTip}
              >
                {t('common.next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onDismiss}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('muzzle.guide.startCapture')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Render minimal floating tip
  return (
    <div className="absolute top-16 left-4 right-4">
      <button
        onClick={() => setShowAllTips(true)}
        className="w-full bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-white/80 hover:bg-black/70 transition-colors"
      >
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-sm">{t('muzzle.guide.tapForTips')}</span>
        <ChevronRight className="w-4 h-4 ml-auto" />
      </button>
    </div>
  );
};

/**
 * Animal Welfare Tips Component
 * Standalone component for displaying welfare guidance
 */
export const AnimalWelfareTips: React.FC<{ language: 'en' | 'am' }> = ({ language }) => {
  const { t } = useTranslations();

  const welfareTips = [
    {
      icon: <Hand className="w-5 h-5" />,
      text: language === 'am' 
        ? 'እንስሳውን በእርጋታ ከጎን ይቅረቡ'
        : 'Approach the animal calmly from the side',
    },
    {
      icon: <Eye className="w-5 h-5" />,
      text: language === 'am'
        ? 'ድንገተኛ እንቅስቃሴዎችን ያስወግዱ'
        : 'Avoid sudden movements',
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: language === 'am'
        ? 'እንስሳው መጀመሪያ እጅዎን እንዲሸት ይፍቀዱ'
        : 'Let the animal sniff your hand first',
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      text: language === 'am'
        ? 'እንስሳው የተጨነቀ ከመሰለ እረፍት ይውሰዱ'
        : 'Take a break if the animal seems stressed',
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-pink-500" />
        <h4 className="font-medium">
          {language === 'am' ? 'የእንስሳ ደህንነት ምክሮች' : 'Animal Welfare Tips'}
        </h4>
      </div>
      <ul className="space-y-2">
        {welfareTips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-pink-500 flex-shrink-0 mt-0.5">{tip.icon}</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

/**
 * Lighting Tips Component
 * Standalone component for displaying lighting guidance
 */
export const LightingTips: React.FC<{ language: 'en' | 'am' }> = ({ language }) => {
  const tips = [
    {
      good: language === 'am' ? 'ተፈጥሯዊ ብርሃን ይጠቀሙ' : 'Use natural daylight',
      bad: language === 'am' ? 'ቀጥተኛ የፀሐይ ብርሃን ያስወግዱ' : 'Avoid direct sunlight',
    },
    {
      good: language === 'am' ? 'ጥላ ውስጥ ያንሱ' : 'Capture in shade',
      bad: language === 'am' ? 'ፍላሽ አይጠቀሙ' : 'Never use flash',
    },
    {
      good: language === 'am' ? 'ብርሃኑ ወጥ መሆን አለበት' : 'Even lighting is best',
      bad: language === 'am' ? 'ጥላዎችን ያስወግዱ' : 'Avoid harsh shadows',
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-5 h-5 text-yellow-500" />
        <h4 className="font-medium">
          {language === 'am' ? 'የብርሃን ምክሮች' : 'Lighting Tips'}
        </h4>
      </div>
      <div className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <span>✓</span>
              <span>{tip.good}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <span>✗</span>
              <span>{tip.bad}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MuzzleCaptureGuide;
