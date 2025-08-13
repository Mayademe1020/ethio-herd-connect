
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Eye, TrendingUp } from 'lucide-react';
import { Language } from '@/types';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  viewCount: number;
  language: Language;
}

export const AuthGateModal = ({
  isOpen,
  onClose,
  onLogin,
  viewCount,
  language
}: AuthGateModalProps) => {
  const translations = {
    am: {
      title: 'የተሻሉ ወሳጅ ስላልተሰየሙ',
      description: 'ዋጋዎችን፣ የመግባቢያ መረጃዎችን ለማየት እና ፍላጎት ለመግለጽ ይግቡ።',
      viewedListings: 'እስካሁን ያዩት ዝርዝሮች',
      benefits: [
        'ዋጋዎችን እና የመግባቢያ መረጃዎችን ይመልከቱ',
        'ለሸጣዮች ፍላጎት ያሳዩ',
        'ተወዳጅ ዝርዝሮችን ያስቀምጡ',
        'የእርስዎን የእንስሳት ገበያ ይፍጠሩ'
      ],
      loginButton: 'ይግቡ',
      continueButton: 'መቀጠል',
      freeToUse: 'ነጻ ለመጠቀም!'
    },
    en: {
      title: 'Unlock Full Marketplace Access',
      description: 'Log in to see prices, contact information, and express interest in listings.',
      viewedListings: 'Listings viewed so far',
      benefits: [
        'View prices and contact information',
        'Express interest to sellers',
        'Save favorite listings',
        'Create your own animal listings'
      ],
      loginButton: 'Log In',
      continueButton: 'Continue',
      freeToUse: 'Free to use!'
    },
    or: {
      title: 'Gabaa Guutuu Argachuu',
      description: 'Gatii, odeeffannoo quunnamtii arguu fi fedhii ibsuuf seeni.',
      viewedListings: 'Tarreewwan hanga ammaatti ilaalaman',
      benefits: [
        'Gatii fi odeeffannoo quunnamtii ilaali',
        'Gurgurtootaaf fedhii ibsi',
        'Tarreewwan jaallattan olkaa\'i',
        'Tarreewwan horii keessan uumi'
      ],
      loginButton: 'Seeni',
      continueButton: 'Itti Fufi',
      freeToUse: 'Bilisaan fayyadamaa!'
    },
    sw: {
      title: 'Fungua Ufikiaji Kamili wa Soko',
      description: 'Ingia kuona bei, maelezo ya mawasiliano, na kuonyesha hamu kwenye orodha.',
      viewedListings: 'Orodha zilizoonwa hadi sasa',
      benefits: [
        'Ona bei na maelezo ya mawasiliano',
        'Onyesha hamu kwa wauzaji',
        'Hifadhi orodha unazozipenda',
        'Unda orodha zako za wanyama'
      ],
      loginButton: 'Ingia',
      continueButton: 'Endelea',
      freeToUse: 'Bure kutumia!'
    }
  };

  const t = translations[language];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Lock className="w-6 h-6 text-orange-600" />
            <span>{t.title}</span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center space-x-3 p-4 bg-orange-50 rounded-lg">
            <Eye className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">
              {t.viewedListings}: <span className="text-orange-600 font-bold">{viewCount}</span>
            </span>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">
              {t.freeToUse}
            </h4>
            <ul className="space-y-2">
              {t.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t.continueButton}
          </Button>
          <Button 
            onClick={onLogin} 
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {t.loginButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
