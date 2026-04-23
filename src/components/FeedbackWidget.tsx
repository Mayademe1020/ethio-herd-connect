import React, { useState } from 'react';
import { MessageSquare, X, Camera, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFeedback } from '@/hooks/useFeedback';
import { useLanguage } from '@/contexts/LanguageContext';
import { FeedbackType, getFeedbackTypeLabel } from '@/services/feedbackService';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/lib/utils';

const feedbackTypes: FeedbackType[] = ['praise', 'feature', 'general', 'bug'];

export const FeedbackWidget: React.FC = () => {
  const { language } = useLanguage();
  const { isOpen, openFeedback, closeFeedback, submit, isSubmitting } = useFeedback();
  const [selectedType, setSelectedType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    try {
      await submit({
        type: selectedType,
        rating: rating || undefined,
        message: message.trim(),
        screenshot: screenshot || undefined
      });
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedType('general');
        setRating(0);
        setMessage('');
        setScreenshot(null);
        setShowSuccess(false);
        closeFeedback();
      }, 2000);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleScreenshotCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setScreenshot(file);
    };
    input.click();
  };

  const removeScreenshot = () => {
    setScreenshot(null);
  };

  const getTypeEmoji = (type: FeedbackType) => {
    const emojis: Record<FeedbackType, string> = {
      praise: '🌟',
      feature: '💡',
      general: '💬',
      bug: '🐛'
    };
    return emojis[type];
  };

  const getTypeColor = (type: FeedbackType) => {
    const colors: Record<FeedbackType, string> = {
      praise: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      feature: 'bg-blue-100 text-blue-800 border-blue-300',
      general: 'bg-gray-100 text-gray-800 border-gray-300',
      bug: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[type];
  };

  const translations = {
    am: {
      title: 'ግብረ መልስ ይላኩ',
      placeholder: 'አስተያየትዎን እዚህ ይጻፉ...',
      submit: 'ላክ',
      submitting: 'በመላክ ላይ...',
      rating: 'እኛን ይዝናኑ',
      optional: 'አማራጭ',
      screenshot: 'ስክሪንሾት ጨምር',
      screenshotAdded: 'ስክሪንሾት ተጨምሯል',
      remove: 'አስወግድ',
      thanks: 'አመሰግናለሁ! ግብረ መልስዎ ተልኳል።',
      close: 'ዝጋ'
    },
    en: {
      title: 'Send Feedback',
      placeholder: 'Write your feedback here...',
      submit: 'Send',
      submitting: 'Sending...',
      rating: 'Rate your experience',
      optional: 'Optional',
      screenshot: 'Add Screenshot',
      screenshotAdded: 'Screenshot added',
      remove: 'Remove',
      thanks: 'Thank you! Feedback sent.',
      close: 'Close'
    },
    or: {
      title: 'Yaada Ergi',
      placeholder: 'Yaada kee asitti barreessi...',
      submit: 'Ergi',
      submitting: 'Ergamaa jira...',
      rating: 'Muuxannoo kee siif basi',
      optional: 'Filannoo',
      screenshot: 'Suuraa Dabali',
      screenshotAdded: 'Suuraa darbee jira',
      remove: 'Balleessi',
      thanks: 'Galatoomi! Yaada erguun milkaa\'eera.',
      close: 'Cufi'
    },
    sw: {
      title: 'Tuma Maoni',
      placeholder: 'Andika maoni yako hapa...',
      submit: 'Tuma',
      submitting: 'Inatuma...',
      rating: 'Kadiria uzoefu wako',
      optional: 'Hiari',
      screenshot: 'Ongeza Picha ya Skrini',
      screenshotAdded: 'Picha ya skrini imeongezwa',
      remove: 'Ondoa',
      thanks: 'Asante! Maoni yamewasilishwa.',
      close: 'Funga'
    }
  };

  const t = translations[language] || translations.en;

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {isExpanded && (
          <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-2">
            {feedbackTypes.map((type) => (
              <Button
                key={type}
                size="sm"
                onClick={() => {
                  setSelectedType(type);
                  openFeedback();
                  setIsExpanded(false);
                }}
                className={cn('shadow-lg border-2', getTypeColor(type))}
              >
                <span className="mr-2">{getTypeEmoji(type)}</span>
                <span className="text-xs">{getFeedbackTypeLabel(type, language)}</span>
              </Button>
            ))}
          </div>
        )}
        <Button
          size="lg"
          className="rounded-full shadow-xl w-14 h-14 bg-emerald-600 hover:bg-emerald-700 border-2 border-white"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeFeedback}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>{getTypeEmoji(selectedType)}</span>
              {t.title}
            </h2>
            <button 
              onClick={closeFeedback} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-center text-gray-900">{t.thanks}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200',
                      selectedType === type
                        ? getTypeColor(type)
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <span className="block text-lg mb-1">{getTypeEmoji(type)}</span>
                    <span className="text-xs">{getFeedbackTypeLabel(type, language)}</span>
                  </button>
                ))}
              </div>

              <StarRating
                value={rating}
                onChange={setRating}
                disabled={isSubmitting}
                label={`${t.rating} (${t.optional})`}
              />

              <div className="space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.placeholder}
                  disabled={isSubmitting}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                {!screenshot ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleScreenshotCapture}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 w-full justify-center"
                  >
                    <Camera className="w-4 h-4" />
                    {t.screenshot}
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-800">{t.screenshotAdded}</span>
                    </div>
                    <button
                      onClick={removeScreenshot}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      {t.remove}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeFeedback}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {t.close}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !message.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? t.submitting : t.submit}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
