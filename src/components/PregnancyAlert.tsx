import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateDaysRemaining } from '@/utils/pregnancyCalculations';

interface PregnancyAlertProps {
  expectedDelivery: string;
  animalName: string;
  onRecordBirth: () => void;
}

export const PregnancyAlert: React.FC<PregnancyAlertProps> = ({
  expectedDelivery,
  animalName,
  onRecordBirth,
}) => {
  const { t } = useTranslation();
  const daysRemaining = calculateDaysRemaining(expectedDelivery);

  // Only show alert if delivery is within 7 days
  if (daysRemaining < 0 || daysRemaining > 7) {
    return null;
  }

  const isOverdue = daysRemaining < 0;
  const isDueToday = daysRemaining === 0;

  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        
        <div className="flex-1 space-y-2">
          {/* Alert Title */}
          <h3 className="font-semibold text-amber-900">
            {isDueToday 
              ? t('pregnancy.dueToday')
              : isOverdue
              ? t('pregnancy.overdue')
              : t('pregnancy.deliverySoon')}
          </h3>

          {/* Animal Name */}
          <p className="text-sm text-amber-800">
            <span className="font-medium">{animalName}</span>
          </p>

          {/* Days Remaining */}
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Calendar className="w-4 h-4" />
            <span>
              {isDueToday ? (
                t('pregnancy.expectedToday')
              ) : isOverdue ? (
                t('pregnancy.overdueBy', { days: Math.abs(daysRemaining) })
              ) : (
                t('pregnancy.daysUntilDelivery', { days: daysRemaining })
              )}
            </span>
          </div>

          {/* Expected Delivery Date */}
          <p className="text-xs text-amber-600">
            {t('pregnancy.expectedDelivery')}: {format(new Date(expectedDelivery), 'MMM dd, yyyy')}
          </p>

          {/* Action Button */}
          <button
            onClick={onRecordBirth}
            className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('pregnancy.recordBirth')}
          </button>
        </div>
      </div>
    </div>
  );
};
