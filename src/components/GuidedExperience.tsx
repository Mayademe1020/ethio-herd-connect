// src/components/GuidedExperience.tsx
// Main component that renders either Tour OR Wizard based on state
// Single integration point - just add to AppLayout!

import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { tourSteps, wizardSteps, animalTypes } from '@/config/onboarding.config';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Guided Tour Component
const GuidedTour: React.FC = () => {
  const { 
    isTourActive, 
    currentTourStep, 
    nextTourStep, 
    prevTourStep, 
    skipTour,
    completeTour
  } = useOnboarding();
  
  const { language } = useLanguage();
  
  if (!isTourActive) return null;
  
  const currentStep = tourSteps[currentTourStep];
  const isLastStep = currentTourStep === tourSteps.length - 1;
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with spotlight */}
      <div className="absolute inset-0 bg-black/60" onClick={skipTour}>
        <div 
          className="absolute bg-transparent rounded-lg"
          style={{
            // Spotlight effect - we can enhance this later
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
          }}
        />
      </div>
      
      {/* Tour Tooltip */}
      <div 
        className={cn(
          'absolute bg-white rounded-xl shadow-2xl p-6 max-w-sm',
          'animate-in fade-in zoom-in duration-300'
        )}
        style={{
          // Position based on step - default to center for now
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Close button */}
        <button 
          onClick={skipTour}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        
        {/* Step counter */}
        <div className="text-sm text-gray-500 mb-2">
          Step {currentTourStep + 1} of {tourSteps.length}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {currentStep.title[language]}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">
          {currentStep.description[language]}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {tourSteps.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                idx === currentTourStep ? 'bg-emerald-500' : 'bg-gray-300'
              )}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={prevTourStep}
            disabled={currentTourStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <Button
            onClick={isLastStep ? completeTour : nextTourStep}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLastStep ? (
              <>
                Finish
                <Check className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// First Animal Wizard Component
const FirstAnimalWizard: React.FC = () => {
  const {
    isWizardActive,
    currentWizardStep,
    wizardData,
    nextWizardStep,
    prevWizardStep,
    updateWizardData,
    completeWizard
  } = useOnboarding();
  
  const { language } = useLanguage();
  
  if (!isWizardActive) return null;
  
  const currentStep = wizardSteps[currentWizardStep];
  const isFirstStep = currentWizardStep === 0;
  const isLastStep = currentWizardStep === wizardSteps.length - 1;
  
  const renderStepContent = () => {
    switch (currentStep.component) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep.title[language]}
            </h2>
            <p className="text-gray-600">
              {currentStep.description[language]}
            </p>
            <Button 
              onClick={nextWizardStep}
              className="bg-emerald-600 hover:bg-emerald-700 w-full"
              size="lg"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );
        
      case 'type-selection':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              {currentStep.title[language]}
            </h2>
            <p className="text-gray-600 text-center">
              {currentStep.description[language]}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {animalTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    updateWizardData({ type: type.type });
                    nextWizardStep();
                  }}
                  className={cn(
                    'p-6 rounded-xl border-2 transition-all text-center',
                    wizardData.type === type.type
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  )}
                >
                  <div className="text-4xl mb-2">{type.emoji}</div>
                  <div className="font-medium text-sm">
                    {type.label[language]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'basic-info':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              {currentStep.title[language]}
            </h2>
            <p className="text-gray-600 text-center">
              {currentStep.description[language]}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Biftu"
                  value={wizardData.name || ''}
                  onChange={(e) => updateWizardData({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <select
                  value={wizardData.breed || ''}
                  onChange={(e) => updateWizardData({ breed: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select breed...</option>
                  <option value="local">Local</option>
                  <option value="cross">Cross</option>
                  <option value="exotic">Exotic</option>
                </select>
              </div>
            </div>
            
            <Button 
              onClick={nextWizardStep}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );
        
      case 'photo-upload':
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {currentStep.title[language]}
            </h2>
            <p className="text-gray-600">
              {currentStep.description[language]}
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-emerald-400 transition-colors cursor-pointer">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-500">Tap to upload photo</p>
              <p className="text-xs text-gray-400 mt-1">or skip for now</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={nextWizardStep}
                className="flex-1"
              >
                Skip
              </Button>
              <Button 
                onClick={nextWizardStep}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              {currentStep.title[language]}
            </h2>
            <p className="text-gray-600 text-center">
              {currentStep.description[language]}
            </p>
            
            {/* Summary card */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {animalTypes.find(t => t.type === wizardData.type)?.emoji}
                </span>
                <div>
                  <p className="font-semibold">{wizardData.name || 'No name'}</p>
                  <p className="text-sm text-gray-500">
                    {animalTypes.find(t => t.type === wizardData.type)?.label[language]}
                    {wizardData.breed && ` • ${wizardData.breed}`}
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={nextWizardStep}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              Save Animal
              <Check className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="text-6xl">🎊</div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep.title[language]}
            </h2>
            <p className="text-gray-600">
              {currentStep.description[language]}
            </p>
            
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Animal ID</p>
              <p className="text-2xl font-mono font-bold text-emerald-700">
                ET-{Math.random().toString(36).substr(2, 6).toUpperCase()}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={completeWizard}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                Record First Milk
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="ghost"
                onClick={completeWizard}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header with progress */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {currentWizardStep} of {wizardSteps.length - 1}
            </span>
            <button 
              onClick={completeWizard}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentWizardStep / (wizardSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>
        
        {/* Navigation for non-intro steps */}
        {!isFirstStep && currentStep.component !== 'success' && (
          <div className="p-4 border-t border-gray-100 flex justify-between">
            <Button
              variant="ghost"
              onClick={prevWizardStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main GuidedExperience Component
export const GuidedExperience: React.FC = () => {
  const { isLoading } = useOnboarding();
  
  if (isLoading) return null;
  
  return (
    <>
      <GuidedTour />
      <FirstAnimalWizard />
    </>
  );
};
