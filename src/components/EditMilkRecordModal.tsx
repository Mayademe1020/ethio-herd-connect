// Edit Milk Record Modal Component
// Allows editing of existing milk production records with validation

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';
import { AlertTriangle, Save, X } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface EditMilkRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  currentAmount: number;
  currentSession: 'morning' | 'afternoon';
  recordedAt: string;
  animalName?: string;
  onSave: (recordId: string, amount: number, session: 'morning' | 'afternoon') => Promise<void>;
}

export function EditMilkRecordModal({
  isOpen,
  onClose,
  recordId,
  currentAmount,
  currentSession,
  recordedAt,
  animalName,
  onSave
}: EditMilkRecordModalProps) {
  const { t } = useTranslations();
  const [amount, setAmount] = useState(currentAmount.toString());
  const [session, setSession] = useState<'morning' | 'afternoon'>(currentSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOldRecordWarning, setShowOldRecordWarning] = useState(false);
  const [confirmOldEdit, setConfirmOldEdit] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount.toString());
      setSession(currentSession);
      setError(null);
      setConfirmOldEdit(false);
      
      // Check if record is more than 7 days old
      const recordDate = new Date(recordedAt);
      const daysDifference = differenceInDays(new Date(), recordDate);
      setShowOldRecordWarning(daysDifference > 7);
    }
  }, [isOpen, currentAmount, currentSession, recordedAt]);

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError(t('Please enter a valid number') + ' / እባክዎ ትክክለኛ ቁጥር ያስገቡ');
      return false;
    }
    if (numValue < 0) {
      setError(t('Amount cannot be negative') + ' / መጠን አሉታዊ መሆን አይችልም');
      return false;
    }
    if (numValue > 100) {
      setError(t('Amount cannot exceed 100 liters') + ' / መጠን ከ100 ሊትር መብለጥ አይችልም');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value) {
      validateAmount(value);
    } else {
      setError(null);
    }
  };

  const handleSave = async () => {
    // Validate amount
    if (!validateAmount(amount)) {
      return;
    }

    // Check if editing old record and not confirmed
    if (showOldRecordWarning && !confirmOldEdit) {
      setConfirmOldEdit(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(recordId, parseFloat(amount), session);
      onClose();
    } catch (err) {
      console.error('Error saving milk record:', err);
      setError(t('Failed to save changes') + ' / ለውጦችን ማስቀመጥ አልተሳካም');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setConfirmOldEdit(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t('Edit Milk Record')} / የወተት መዝገብ አስተካክል
          </DialogTitle>
          {animalName && (
            <p className="text-sm text-gray-600 mt-1">
              {t('Animal')}: {animalName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Old Record Warning */}
          {showOldRecordWarning && !confirmOldEdit && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                {t('This record is more than 7 days old. Are you sure you want to edit it?')}
                <br />
                ይህ መዝገብ ከ7 ቀናት በላይ ነው። እርግጠኛ ነዎት ማስተካከል ይፈልጋሉ?
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation for old record */}
          {confirmOldEdit && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm text-orange-800 font-medium">
                {t('Click Save again to confirm editing this old record.')}
                <br />
                ይህን አሮጌ መዝገብ ለማስተካከል እንደገና አስቀምጥ የሚለውን ጠቅ ያድርጉ።
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              {t('Amount (Liters)')} / መጠን (ሊትር)
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.0"
              className="text-lg"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              {t('Enter amount between 0 and 100 liters')} / ከ0 እስከ 100 ሊትር መጠን ያስገቡ
            </p>
          </div>

          {/* Session Selector */}
          <div className="space-y-2">
            <Label htmlFor="session" className="text-sm font-medium">
              {t('Session')} / ክፍለ ጊዜ
            </Label>
            <Select
              value={session}
              onValueChange={(value: 'morning' | 'afternoon') => setSession(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="session">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">
                  {t('Morning')} / ጠዋት
                </SelectItem>
                <SelectItem value="afternoon">
                  {t('Afternoon')} / ከሰዓት
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            {t('Cancel')} / ሰርዝ
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !!error}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? (t('Saving...') + ' / በማስቀመጥ ላይ...') : (t('Save') + ' / አስቀምጥ')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
