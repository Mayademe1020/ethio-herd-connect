import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useTranslations } from '@/hooks/useTranslations';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListing';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { Button } from '@/components/ui/button';
import { AnimalSelectorForListing } from '@/components/AnimalSelectorForListing';
import { PriceInput } from '@/components/PriceInput';
import { PhotoUploadField } from '@/components/PhotoUploadField';
import { VideoUploadField } from '@/components/VideoUploadField';
import { FemaleAnimalFields, FemaleAnimalData } from '@/components/FemaleAnimalFields';
import { HealthDisclaimerCheckbox } from '@/components/HealthDisclaimerCheckbox';
import { BackButtonConfirmation } from '@/components/BackButtonConfirmation';
import { BackButton } from '@/components/BackButton';
import { ArrowRight, ArrowLeft, Check, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { getMuzzleEmbedding } from '@/utils/muzzleIndexedDB';

interface Animal {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  photo_url?: string;
}

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslations();
  const { showToast } = useToast();
  const { createListing, isCreating } = useMarketplaceListing();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [price, setPrice] = useState(0);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);
  const [femaleAnimalData, setFemaleAnimalData] = useState<FemaleAnimalData>({
    pregnancyStatus: '',
    lactationStatus: '',
    milkProductionPerDay: undefined,
    expectedDeliveryDate: undefined
  });
  const [healthDisclaimerChecked, setHealthDisclaimerChecked] = useState(false);

  // Back button confirmation state
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  // Validation errors
  const [priceError, setPriceError] = useState<string | undefined>();
  const [disclaimerError, setDisclaimerError] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Muzzle verification state
  const [hasMuzzleRegistered, setHasMuzzleRegistered] = useState(false);
  const [isCheckingMuzzle, setIsCheckingMuzzle] = useState(false);

  const totalSteps = 4;

  // Check if selected animal has muzzle registered
  const checkMuzzleRegistration = async (animal: Animal) => {
    if (!user || !animal.id) return;

    setIsCheckingMuzzle(true);
    try {
      const embedding = await getMuzzleEmbedding(animal.id, user.id);
      setHasMuzzleRegistered(!!embedding);
    } catch (error) {
      console.error('Error checking muzzle:', error);
      setHasMuzzleRegistered(false);
    } finally {
      setIsCheckingMuzzle(false);
    }
  };

  // Check if current step is valid (without side effects)
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedAnimal !== null && hasMuzzleRegistered;
      case 2:
        return price >= 100 && price <= 1000000;
      case 3:
        // Media is optional, always valid
        return true;
      case 4:
        return healthDisclaimerChecked;
      default:
        return true;
    }
  };

  // Validate current step (with side effects for error messages)
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedAnimal !== null;
      case 2:
        if (price < 100) {
          setPriceError(t('marketplace.priceMinError'));
          return false;
        }
        if (price > 1000000) {
          setPriceError(t('marketplace.priceMaxError'));
          return false;
        }
        setPriceError(undefined);
        return true;
      case 3:
        // Media is optional, always valid
        return true;
      case 4:
        if (!healthDisclaimerChecked) {
          setDisclaimerError(true);
          return false;
        }
        setDisclaimerError(false);
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // Unsaved changes detection
  const hasUnsavedChanges = selectedAnimal !== null || price > 0 || photoUrl !== null ||
    videoUrl !== null || healthDisclaimerChecked;

  const { confirmLeave } = useUnsavedChanges({
    hasChanges: hasUnsavedChanges,
    message: 'የገበያ ማስተያየት በማጠናቀቅ ላይ ነበር። እርግጠኛ ነዎት መሄድ ይፈልጋሉ?'
  });

  const handleBack = async () => {
    if (currentStep > 1) {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    } else {
      // Check for unsaved changes before navigating away
      const shouldLeave = await confirmLeave();
      if (shouldLeave) {
        navigate('/marketplace');
      }
    }
  };

  const handleBackConfirmation = async () => {
    setShowBackConfirmation(false);
    navigate('/marketplace');
  };

  const handleSkip = () => {
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !selectedAnimal) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createListing({
        animal_id: selectedAnimal.id,
        price,
        is_negotiable: isNegotiable,
        location: undefined, // Can be added later if needed
        contact_phone: user?.phone || undefined,
        photo_url: photoUrl || undefined,
        video_url: videoUrl || undefined,
        video_thumbnail: videoThumbnailUrl || undefined,
        femaleAnimalData: {
          pregnancyStatus: femaleAnimalData.pregnancyStatus || undefined,
          lactationStatus: femaleAnimalData.lactationStatus || undefined,
          milkProductionPerDay: femaleAnimalData.milkProductionPerDay,
          expectedDeliveryDate: femaleAnimalData.expectedDeliveryDate
        },
        healthDisclaimerChecked
      });

      navigate('/marketplace');
    } catch (error) {
      console.error('Error creating listing:', error);
      showToast(t('errors.unknownError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {t('common.step')} {currentStep} {t('common.of')} {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t('marketplace.selectAnimal')}</h2>
            <AnimalSelectorForListing
              selectedAnimalId={selectedAnimal?.id}
              onSelect={(animal) => {
                setSelectedAnimal(animal);
                checkMuzzleRegistration(animal);
              }}
            />

            {selectedAnimal && isCheckingMuzzle && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-gray-600">Checking muzzle registration...</span>
              </div>
            )}

            {selectedAnimal && !isCheckingMuzzle && !hasMuzzleRegistered && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">Muzzle verification required</p>
                    <p className="text-sm text-orange-700 mt-1">
                      This animal needs muzzle verification before it can be listed.
                      Please register the muzzle first in the animal profile.
                    </p>
                    <Button
                      onClick={() => navigate(`/register-animal?edit=${selectedAnimal.id}`)}
                      className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Register Muzzle
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedAnimal && hasMuzzleRegistered && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Muzzle verified - ready to list</span>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t('marketplace.setPrice')}</h2>
            <PriceInput
              value={price}
              isNegotiable={isNegotiable}
              onPriceChange={setPrice}
              onNegotiableChange={setIsNegotiable}
              error={priceError}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t('marketplace.addMedia')}</h2>
            <PhotoUploadField
              value={photoUrl || undefined}
              onChange={setPhotoUrl}
              onError={(error) => showToast(error, 'error')}
            />
            <VideoUploadField
              value={videoUrl || undefined}
              thumbnailUrl={videoThumbnailUrl || undefined}
              onChange={(video, thumbnail) => {
                setVideoUrl(video);
                setVideoThumbnailUrl(thumbnail || null);
              }}
              onError={(error) => showToast(error, 'error')}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t('marketplace.additionalDetails')}</h2>

            {selectedAnimal && (
              <FemaleAnimalFields
                animalSubtype={selectedAnimal.subtype || ''}
                data={femaleAnimalData}
                onChange={setFemaleAnimalData}
              />
            )}

            <HealthDisclaimerCheckbox
              checked={healthDisclaimerChecked}
              onChange={setHealthDisclaimerChecked}
              error={disclaimerError}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Back Button Confirmation Dialog */}
        <BackButtonConfirmation
          isOpen={showBackConfirmation}
          onConfirm={handleBackConfirmation}
          onCancel={() => setShowBackConfirmation(false)}
          title="የገበያ ማስተያየት በማጠናቀቅ ላይ ነበር"
          description="የገበያ ማስተያየት በማጠናቀቅ ላይ ነበር። እርግጠኛ ነዎት መሄድ ይፈልጋሉ? ለያዘው ለያዘ የለም።"
        />

        {/* Header */}
        <div className="mb-6">
          <BackButton />
          <h1 className="text-2xl font-bold mt-4">{t('marketplace.createListing')}</h1>
        </div>

        {/* Progress Indicator */}
        {renderProgressIndicator()}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between space-x-4">
          {/* Back Button */}
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          )}

          {/* Skip Button (only on step 3) */}
          {currentStep === 3 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t('common.skip')}
            </Button>
          )}

          {/* Next/Submit Button */}
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {t('common.next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isCreating}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {(isSubmitting || isCreating) ? (
                <>
                  <span className="animate-spin mr-2">&#8987;</span>
                  {t('common.submitting')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('marketplace.createListing')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListing;