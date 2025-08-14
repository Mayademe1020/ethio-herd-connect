
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MessageSquare, Mail, MapPin, Shield, Edit } from 'lucide-react';
import { Language } from '@/types';

interface MarketListingDetailsProps {
  listing: {
    id: string;
    title: string;
    category: string;
    price: number | null;
    location: string;
    description: string;
    photo: string;
    is_vet_verified?: boolean;
    contact_method?: string;
    contact_value?: string;
  };
  language: Language;
  onClose: () => void;
  onContact: (listing: any) => void;
  onEdit: (listing: any) => void;
}

export const MarketListingDetails = ({ 
  listing, 
  language, 
  onClose, 
  onContact, 
  onEdit 
}: MarketListingDetailsProps) => {
  const translations = {
    am: {
      contact: 'ፍላጎት ያሳዩ',
      edit: 'ይቀይሩ',
      verified: 'የተረጋገጠ',
      price: 'ዋጋ',
      location: 'አካባቢ',
      description: 'መግለጫ',
      priceHidden: 'ዋጋ ተደብቋል'
    },
    en: {
      contact: 'Express Interest',
      edit: 'Edit Listing',
      verified: 'Vet Verified',
      price: 'Price',
      location: 'Location',
      description: 'Description',
      priceHidden: 'Price hidden'
    },
    or: {
      contact: 'Fedhii Ibsi',
      edit: 'Tarree Jijjiiruu',
      verified: 'Doktoora Beeitii Mirkaneeffame',
      price: 'Gatii',
      location: 'Bakka',
      description: 'Ibsa',
      priceHidden: 'Gatiin dhokfame'
    },
    sw: {
      contact: 'Onyesha Hamu',
      edit: 'Hariri Orodha',
      verified: 'Imethibitishwa na Daktari',
      price: 'Bei',
      location: 'Mahali',
      description: 'Maelezo',
      priceHidden: 'Bei imefichwa'
    }
  };

  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">{listing.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-gray-200 rounded-lg relative">
            {listing.is_vet_verified && (
              <Badge className="absolute top-2 right-2 bg-green-500">
                <Shield className="w-3 h-3 mr-1" />
                {t.verified}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{t.price}</h3>
              {listing.price !== null && listing.price !== undefined ? (
                <p className="text-2xl font-bold text-green-600">
                  {listing.price.toLocaleString()} ETB
                </p>
              ) : (
                <p className="text-lg text-gray-500">{t.priceHidden}</p>
              )}
            </div>
            
            {listing.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{listing.location}</span>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">{t.description}</h3>
              <p className="text-gray-600">{listing.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              className="flex-1 bg-orange-600 hover:bg-orange-700 transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => onContact(listing)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t.contact}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => onEdit(listing)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t.edit}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
