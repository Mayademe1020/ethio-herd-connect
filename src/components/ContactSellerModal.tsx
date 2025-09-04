import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MessageCircle, Send, User, Shield } from 'lucide-react';
import { Language } from '@/types';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    contact_method: string | null;
    contact_value: string | null;
    is_vet_verified: boolean | null;
    price: number | null;
  };
  language: Language;
  isAuthenticated: boolean;
}

export const ContactSellerModal = ({
  isOpen,
  onClose,
  listing,
  language,
  isAuthenticated
}: ContactSellerModalProps) => {
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const translations = {
    am: {
      contactSeller: 'ሻጭን ያግኙ',
      sendMessage: 'መልዕክት ላክ',
      yourName: 'ስምዎ',
      yourEmail: 'ኢሜይል አድራሻዎ',
      message: 'መልዕክት',
      messagePlaceholder: 'ለዚህ እንስሳ ስለ ፍላጎትዎ ወይም ማንኛውም ጥያቄ ሊኖርዎት ይችላል...',
      send: 'ላክ',
      cancel: 'ሰርዝ',
      loginRequired: 'ሻጭን ለማግኘት እባክዎ ይግቡ',
      login: 'ግባ',
      contactInfo: 'የመገናኛ መረጃ',
      verified: 'የተረጋገጠ',
      messageSent: 'መልዕክትዎ ተልኳል!',
      errorSending: 'መልዕክት መላክ ላይ ስህተት ተከስቷል',
      directContact: 'በቀጥታ ያግኙ',
      callNow: 'አሁኑኑ ይደውሉ',
      sendEmail: 'ኢሜይል ላክ'
    },
    en: {
      contactSeller: 'Contact Seller',
      sendMessage: 'Send Message',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      message: 'Message',
      messagePlaceholder: 'Hi! I\'m interested in your animal listing. Could you provide more details about...',
      send: 'Send',
      cancel: 'Cancel',
      loginRequired: 'Please login to contact the seller',
      login: 'Login',
      contactInfo: 'Contact Information',
      verified: 'Verified',
      messageSent: 'Your message has been sent!',
      errorSending: 'Error sending message',
      directContact: 'Direct Contact',
      callNow: 'Call Now',
      sendEmail: 'Send Email'
    },
    or: {
      contactSeller: 'Gurgurtaa Qunnamuu',
      sendMessage: 'Ergaa Erguu',
      yourName: 'Maqaa Keessan',
      yourEmail: 'Imeelii Keessan',
      message: 'Ergaa',
      messagePlaceholder: 'Akkam! Tarree bineensota keessanii irratti fedhii qaba. Bal\'ina dabalataa kennuu dandeessu...',
      send: 'Ergi',
      cancel: 'Dhiisi',
      loginRequired: 'Gurgurtaa qunnamuuf seenuu qabdu',
      login: 'Seeni',
      contactInfo: 'Odeeffannoo Qunnamtii',
      verified: 'Mirkaneeffame',
      messageSent: 'Ergaan keessan ergameera!',
      errorSending: 'Ergaa erguu irratti dogoggora',
      directContact: 'Kallattiin Qunnamuu',
      callNow: 'Amma Bilbilaa',
      sendEmail: 'Imeelii Ergaa'
    },
    sw: {
      contactSeller: 'Wasiliana na Muuzaji',
      sendMessage: 'Tuma Ujumbe',
      yourName: 'Jina Lako',
      yourEmail: 'Barua Pepe Yako',
      message: 'Ujumbe',
      messagePlaceholder: 'Hujambo! Nina nia ya kununua mnyama wako. Je, unaweza kutoa maelezo zaidi kuhusu...',
      send: 'Tuma',
      cancel: 'Ghairi',
      loginRequired: 'Tafadhali ingia ili kuwasiliana na muuzaji',
      login: 'Ingia',
      contactInfo: 'Maelezo ya Mawasiliano',
      verified: 'Imethibitishwa',
      messageSent: 'Ujumbe wako umetumwa!',
      errorSending: 'Hitilafu ya kutuma ujumbe',
      directContact: 'Wasiliana Moja kwa Moja',
      callNow: 'Piga Simu Sasa',
      sendEmail: 'Tuma Barua Pepe'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated && (!senderName || !senderEmail)) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual message sending to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: t.messageSent,
        description: "The seller will receive your message shortly.",
      });
      
      onClose();
      setMessage('');
      setSenderEmail('');
      setSenderName('');
    } catch (error) {
      toast({
        title: t.errorSending,
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectContact = (method: string, value: string) => {
    if (method === 'phone') {
      window.open(`tel:${value}`, '_self');
    } else if (method === 'email') {
      window.open(`mailto:${value}?subject=Interest in ${listing.title}`, '_self');
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.contactSeller}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">{t.loginRequired}</p>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              {t.login}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {t.contactSeller}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{listing.title}</h3>
                {listing.price && (
                  <p className="text-lg font-bold text-emerald-600">
                    {listing.price.toLocaleString()} ETB
                  </p>
                )}
              </div>
              {listing.is_vet_verified && (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <Shield className="w-3 h-3 mr-1" />
                  {t.verified}
                </Badge>
              )}
            </div>
          </div>

          {/* Direct Contact Options */}
          {listing.contact_method && listing.contact_value && (
            <div className="space-y-3">
              <h4 className="font-medium">{t.directContact}</h4>
              <div className="flex gap-2">
                {listing.contact_method === 'phone' && (
                  <Button
                    variant="outline"
                    onClick={() => handleDirectContact('phone', listing.contact_value!)}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {t.callNow}
                  </Button>
                )}
                {listing.contact_method === 'email' && (
                  <Button
                    variant="outline"
                    onClick={() => handleDirectContact('email', listing.contact_value!)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t.sendEmail}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Message Form */}
          <div className="space-y-4">
            <h4 className="font-medium">{t.sendMessage}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAuthenticated && (
                <>
                  <Input
                    placeholder={t.yourName}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t.yourEmail}
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </>
              )}
              
              <Textarea
                placeholder={t.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : t.send}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};