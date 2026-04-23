import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description?: string;
}

interface VisualStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const VisualStepper: React.FC<VisualStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative mb-6">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-300"
          style={{ 
            width: `${((currentStep) / (steps.length - 1)) * 100}%` 
          }}
        />
        
        {/* Step indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                    isCompleted && 'bg-primary text-white',
                    isCurrent && 'bg-primary text-white ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px] truncate',
                    isCurrent ? 'text-primary' : 'text-gray-500'
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisualStepper;