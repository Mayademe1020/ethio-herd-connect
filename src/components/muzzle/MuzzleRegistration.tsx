/**
 * MuzzleRegistration Component
 * Integrated muzzle registration flow for animal registration
 * Requirements: 3.1, 3.2, 3.3, 7.6
 */

import React, { useState, useCallback } from 'react';
import { useMuzzleRegistration } from '@/hooks/useMuzzleRegistration';
import { MuzzleCaptureCamera } from './MuzzleCaptureCamera';
import { MuzzleCapturePreview } from './MuzzleCapturePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { CapturedImage } from '@/types/muzzle';

interface MuzzleRegistrationProps {
  animalId: string;
  onComplete: (registrationId?: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}

type RegistrationStep = 'consent' | 'capturing' | 'preview' | 'processing' | 'duplicate_found' | 'complete' | 'error';

export const MuzzleRegistration: React.FC<MuzzleRegistrationProps> = ({
  animalId,
  onComplete,
  onSkip,
  onCancel,
}) => {
  const t = useTranslations();
  const [step, setStep] = useState<RegistrationStep>('consent');
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);

  const {
    state: registrationState,
    recordConsent,
    setCapturedImages: setRegistrationImages,
    processImages,
    resolveDuplicate,
    completeRegistration,
    cancelRegistration,
  } = useMuzzleRegistration();

  // Handle consent
  const handleConsent = useCallback(async (consentGiven: boolean) => {
    if (consentGiven) {
      await recordConsent(true);
      setStep('capturing');
    } else {
      onSkip();
    }
  }, [recordConsent, onSkip]);

  // Handle image capture
  const handleImagesCaptured = useCallback((images: CapturedImage[]) => {
    setCapturedImages(images);
    setRegistrationImages(images);
    setStep('preview');
  }, [setRegistrationImages]);

  // Handle image confirmation
  const handleImagesConfirmed = useCallback(async () => {
    setStep('processing');
    try {
      await processImages();
      if (registrationState.step === 'duplicate_found') {
        setStep('duplicate_found');
      } else if (registrationState.step === 'uploading') {
        const result = await completeRegistration();
        if (result.success) {
          setStep('complete');
          onComplete(result.registrationId);
        } else {
          setStep('error');
        }
      }
    } catch (error) {
      setStep('error');
    }
  }, [processImages, registrationState.step, completeRegistration, onComplete]);

  // Handle duplicate resolution
  const handleDuplicateResolution = useCallback(async (resolution: 'continued' | 'transfer_requested' | 'fraud_reported' | 'cancelled') => {
    await resolveDuplicate(resolution as any);
    if (resolution === 'continued') {
      const result = await completeRegistration();
      if (result.success) {
        setStep('complete');
        onComplete(result.registrationId);
      } else {
        setStep('error');
      }
    } else {
      onCancel();
    }
  }, [resolveDuplicate, completeRegistration, onComplete, onCancel]);

  // Handle retake
  const handleRetake = useCallback(() => {
    setStep('capturing');
    setCapturedImages([]);
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelRegistration();
    onCancel();
  }, [cancelRegistration, onCancel]);

  // Render consent step
  if (step === 'consent') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {t('muzzle.consentTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('muzzle.consentDescription')}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => handleConsent(true)}
              className="w-full"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('muzzle.consentAccept')}
            </Button>

            <Button
              onClick={() => handleConsent(false)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {t('muzzle.skip')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render capturing step
  if (step === 'capturing') {
    return (
      <div className="w-full">
        <MuzzleCaptureCamera
          mode="registration"
          onImagesCaptured={handleImagesCaptured}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Render preview step
  if (step === 'preview') {
    return (
      <div className="w-full">
        <MuzzleCapturePreview
          images={capturedImages}
          onConfirm={handleImagesConfirmed}
          onRetake={handleRetake}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Render processing step
  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p>{t('muzzle.processing')}</p>
            <p className="text-sm text-gray-500">
              {registrationState.progress}% {t('muzzle.complete')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render duplicate found step
  if (step === 'duplicate_found' && registrationState.duplicateMatch) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-yellow-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            {t('muzzle.duplicateFound')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {t('muzzle.duplicateDescription', {
                animal: registrationState.duplicateMatch.animalName,
                similarity: Math.round(registrationState.duplicateMatch.similarity * 100)
              })}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={() => handleDuplicateResolution('continued')}
              className="w-full"
              size="lg"
            >
              {t('muzzle.continueAnyway')}
            </Button>

            <Button
              onClick={() => handleDuplicateResolution('transfer_requested')}
              variant="outline"
              className="w-full"
            >
              {t('muzzle.requestTransfer')}
            </Button>

            <Button
              onClick={() => handleDuplicateResolution('cancelled')}
              variant="outline"
              className="w-full"
            >
              {t('muzzle.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render complete step
  if (step === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">{t('muzzle.registrationComplete')}</h3>
            <p className="text-gray-600">{t('muzzle.registrationSuccess')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error step
  if (step === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            <XCircle className="w-6 h-6 mx-auto mb-2" />
            {t('muzzle.registrationFailed')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {registrationState.error || t('muzzle.unknownError')}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={handleRetake}
              className="w-full"
            >
              {t('muzzle.tryAgain')}
            </Button>

            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full"
            >
              {t('muzzle.skip')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default MuzzleRegistration;