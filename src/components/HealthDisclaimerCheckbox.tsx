import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HealthDisclaimerCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
}

export const HealthDisclaimerCheckbox: React.FC<HealthDisclaimerCheckboxProps> = ({
  checked,
  onChange,
  error
}) => {
  const { t } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className={`space-y-3 p-4 rounded-lg border-2 ${
      error ? 'border-red-500 bg-red-50' : 'border-orange-200 bg-orange-50'
    }`}>
      {/* Required indicator */}
      <div className="flex items-center space-x-2">
        <AlertCircle className={`w-5 h-5 ${error ? 'text-red-600' : 'text-orange-600'}`} />
        <span className="text-sm font-semibold text-gray-900">
          {t('common.required')}
        </span>
      </div>

      {/* Checkbox with label */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="health-disclaimer"
          checked={checked}
          onCheckedChange={onChange}
          className={`mt-1 ${error ? 'border-red-500' : ''}`}
          aria-invalid={error}
          aria-describedby={error ? 'disclaimer-error' : undefined}
        />
        <div className="flex-1">
          <Label
            htmlFor="health-disclaimer"
            className="text-base font-medium cursor-pointer leading-relaxed"
          >
            {t('marketplace.healthDisclaimer')}
          </Label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p id="disclaimer-error" className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{t('marketplace.disclaimerRequired')}</span>
        </p>
      )}

      {/* Info dialog trigger */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center space-x-2 text-sm text-orange-700 hover:text-orange-800 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="underline">{t('marketplace.readFullDisclaimer')}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {t('marketplace.healthDisclaimerTitle')}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed space-y-3 pt-4">
              <p>{t('marketplace.healthDisclaimerFull')}</p>
              
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {t('marketplace.disclaimerIncludes')}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t('marketplace.disclaimerPoint1')}</li>
                  <li>{t('marketplace.disclaimerPoint2')}</li>
                  <li>{t('marketplace.disclaimerPoint3')}</li>
                  <li>{t('marketplace.disclaimerPoint4')}</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 italic">
                {t('marketplace.disclaimerNote')}
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
