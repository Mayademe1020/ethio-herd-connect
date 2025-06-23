
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Star, Shield, Calendar, Edit } from 'lucide-react';
import { Language } from '@/types';

interface MarketListing {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  description: string;
  photo: string;
  isFeatured: boolean;
  isFavorite: boolean;
  contact_method?: string;
  contact_value?: string;
  is_vet_verified?: boolean;
  photos?: string[];
  created_at?: string;
}

interface MarketListingDetailsProps {
  listing: MarketListing;
  language: Language;
  onClose: () => void;
  onContact: (listing: MarketListing) => void;
  onEdit?: (listing: MarketListing) => void;
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
      contact: 'አገናኝ',
      edit: 'አርትዕ',
      featured: 'የተመረጠ',
      verified: 'የተረጋገጠ',
      description: 'መግለጫ',
      price: 'ዋጋ',
      location: 'አካባቢ',
      contactSeller: 'ሻጩን አገናኝ',
      postedOn: 'የተለጠፈበት ቀን'
    },
    en: {
      contact: 'Contact',
      edit: 'Edit',
      featured: 'Featured',
      verified: 'Verified',
      description: 'Description',
      price: 'Price',
      location: 'Location',
      contactSeller: 'Contact Seller',
      postedOn: 'Posted on'
    },
    or: {
      contact: 'Qunnamuu',
      edit: 'Gulaaluu',
      featured: 'Filatamaa',
      verified: 'Mirkaneeffame',
      description: 'Ibsa',
      price: 'Gatii',
      location: 'Bakka',
      contactSeller: 'Gurgurtaa Qunnamuu',
      postedOn: 'Kaayyeffame'
    },
    sw: {
      contact: 'Wasiliana',
      edit: 'Hariri',
      featured: 'Iliyoangaziwa',
      verified: 'Imethibitishwa',
      description: 'Maelezo',
      price: 'Bei',
      location: 'Mahali',
      contactSeller: 'Wasiliana na Muuzaji',
      postedOn: 'Imechapishwa'
    }
  };

  const t = translations[language];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Image */}
          <div className="relative h-48 sm:h-64 bg-gray-200 rounded-lg overflow-hidden">
            {listing.photo ? (
              <img
                src={listing.photo}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🐄
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 space-y-2">
              {listing.isFeatured && (
                <Badge className="bg-orange-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {t.featured}
                </Badge>
              )}
              {listing.is_vet_verified && (
                <Badge className="bg-green-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  {t.verified}
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {listing.price.toLocaleString()} ETB
            </p>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm sm:text-base">{listing.location}</span>
            </div>

            {/* Posted Date */}
            {listing.created_at && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {t.postedOn} {new Date(listing.created_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">{t.description}</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => onContact(listing)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              {t.contactSeller}
            </Button>
            
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(listing)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
