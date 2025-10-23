import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';
import { Language } from '@/types';
import { useBuyerInterest } from '@/hooks/useBuyerInterest';
import { sanitizeInput } from '@/utils/securityUtils';

interface InterestExpressionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price: number;
    user_id: string;
  };
  language: Language;
}

export const InterestExpressionDialog = ({
  isOpen,
  onClose,
  listing,
  language
}: InterestExpressionDialogProps) => {
  const [message, setMessage] = useState('');
  const { expressInterest, loading } = useBuyerInterest();

  const translations = {
    am: {
      title: 'ፍላጎት ያሳዩ',
      description: 'ለመሸጡ ተጠቃሚ መልእክት ይላኩ',
      messagePlaceholder: 'ለመሸጡ ተጠቃሚ ስለ ፍላጎትዎ ይጻፉ...',
      messageLabel: 'መልእክት',
      sendInterest: 'ፍላጎት ይላኩ',
      cancel: 'ይሰርዙ'
    },
    en: {
      title: 'Express Interest',
      description: 'Send a message to the seller about your interest',
      messagePlaceholder: 'Write to the seller about your interest...',
      messageLabel: 'Message',
      sendInterest: 'Send Interest',
      cancel: 'Cancel'
    },
    or: {
      title: 'Fedhii Ibsi',
      description: 'Gurgurtaaf waa\'ee fedhii keetii ergaa ergi',
      messagePlaceholder: 'Gurgurtaaf waa\'ee fedhii keetii barreessi...',
      messageLabel: 'Ergaa',
      sendInterest: 'Fedhii Ergi',
      cancel: 'Dhiisi'
    },
    sw: {
      title: 'Onyesha Hamu',
      description: 'Tumia ujumbe kwa muuzaji kuhusu hamu yako',
      messagePlaceholder: 'Andika kwa muuzaji kuhusu hamu yako...',
      messageLabel: 'Ujumbe',
      sendInterest: 'Tumia Hamu',
      cancel: 'Ghairi'
    }
  };

  const t = translations[language];

  const handleSubmit = async () => {
    // Sanitize message before submission
    const sanitizedMessage = sanitizeInput(message);
    const result = await expressInterest(listing.id, listing.user_id, sanitizedMessage);
    if (!result.error) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>{t.title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Listing: {listing.title}
            </div>
            <div className="text-lg font-bold text-green-600">
              {listing.price.toLocaleString()} ETB
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interest-message">{t.messageLabel}</Label>
            <Textarea
              id="interest-message"
              placeholder={t.messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t.sendInterest}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};