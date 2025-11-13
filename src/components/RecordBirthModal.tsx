import React, { useState } from 'react';
import { X, Baby, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

interface RecordBirthModalProps {
  isOpen: boolean;
  onClose: () => void;
  animalId: string;
  animalName: string;
  expectedDelivery: string;
  onRecordBirth: (actualDelivery: string, notes?: string) => Promise<void>;
}

export const RecordBirthModal: React.FC<RecordBirthModalProps> = ({
  isOpen,
  onClose,
  animalId,
  animalName,
  expectedDelivery,
  onRecordBirth,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [actualDelivery, setActualDelivery] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onRecordBirth(actualDelivery, notes);
      onClose();
    } catch (err) {
      setError(t('pregnancy.birthRecordError'));
      console.error('Error recording birth:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterOffspring = () => {
    onClose();
    navigate('/register-animal', {
      state: {
        parentId: animalId,
        birthDate: actualDelivery,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('pregnancy.recordBirth')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Animal Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{t('common.animal')}:</span> {animalName}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">{t('pregnancy.expectedDelivery')}:</span>{' '}
              {format(new Date(expectedDelivery), 'MMM dd, yyyy')}
            </p>
          </div>

          {/* Actual Delivery Date */}
          <div>
            <label htmlFor="actualDelivery" className="block text-sm font-medium text-gray-700 mb-1">
              {t('pregnancy.actualDelivery')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="actualDelivery"
                value={actualDelivery}
                onChange={(e) => setActualDelivery(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('pregnancy.actualDeliveryHelp')}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              {t('pregnancy.birthNotes')} ({t('common.optional')})
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={t('pregnancy.birthNotesPlaceholder')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('common.saving') : t('pregnancy.completeBirth')}
            </button>

            <button
              type="button"
              onClick={handleRegisterOffspring}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t('pregnancy.registerOffspring')}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
