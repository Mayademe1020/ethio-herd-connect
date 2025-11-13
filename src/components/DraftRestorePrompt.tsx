import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, X, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface DraftRestorePromptProps {
  draftData: any;
  onRestore: () => void;
  onDiscard: () => void;
  formName: string;
}

export const DraftRestorePrompt: React.FC<DraftRestorePromptProps> = ({
  draftData,
  onRestore,
  onDiscard,
  formName
}) => {
  const { t } = useTranslation();

  // Get a preview of what's in the draft
  const getDraftPreview = () => {
    if (!draftData) return '';

    const keys = Object.keys(draftData).filter(key => !key.startsWith('_'));
    if (keys.length === 0) return '';

    // Show first 2-3 meaningful fields
    const previewFields = keys.slice(0, 3);
    return previewFields.join(', ');
  };

  const preview = getDraftPreview();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            {t('forms.draftFound') || 'Draft Found'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              {t('forms.draftFoundDesc') || `We found unsaved data for ${formName}.`}
            </p>
            {preview && (
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>{t('forms.draftPreview') || 'Contains:'}</strong> {preview}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onDiscard}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              {t('forms.discardDraft') || 'Discard'}
            </Button>

            <Button
              onClick={onRestore}
              className="flex-1"
              size="sm"
            >
              <Check className="w-4 h-4 mr-2" />
              {t('forms.restoreDraft') || 'Restore'}
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            {t('forms.draftNote') || 'Drafts are saved automatically every 30 seconds'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftRestorePrompt;