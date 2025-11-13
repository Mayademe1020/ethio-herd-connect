// src/components/ListingCard.tsx - Marketplace Listing Card Component
// PRIVACY: Animal IDs are intentionally NOT displayed to buyers for privacy

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';

interface Animal {
  id: string;
  name: string;
  type: string;
  subtype: string;
  photo_url?: string;
}

interface MarketListing {
  id: string;
  user_id: string;
  animal_id: string;
  price: number;
  is_negotiable: boolean;
  location?: string;
  contact_phone?: string;
  status: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  animal?: Animal;
}

interface ListingCardProps {
  listing: MarketListing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const navigate = useNavigate();

  // Get animal type icon
  const getAnimalIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cattle':
        return '🐄';
      case 'goat':
        return '🐐';
      case 'sheep':
        return '🐑';
      default:
        return '🐄';
    }
  };

  // Check if listing is new (< 48 hours old)
  const isNew = () => {
    const createdAt = new Date(listing.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 48;
  };

  // Format price with Ethiopian Birr
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleClick = () => {
    navigate(`/marketplace/${listing.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Photo */}
      <div className="relative h-48 bg-gray-200">
        {listing.animal?.photo_url ? (
          <OptimizedImage
            src={listing.animal.photo_url}
            alt={listing.animal.name}
            className="w-full h-full"
            fallbackIcon={getAnimalIcon(listing.animal?.type || '')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getAnimalIcon(listing.animal?.type || '')}
          </div>
        )}
        
        {/* NEW Badge */}
        {isNew() && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            NEW
          </div>
        )}
        
        {/* Negotiable Badge */}
        {listing.is_negotiable && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Negotiable
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Animal Name and Type */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>{getAnimalIcon(listing.animal?.type || '')}</span>
            <span>{listing.animal?.name || 'Unnamed'}</span>
          </h3>
        </div>

        {/* Subtype */}
        <p className="text-sm text-gray-600 mb-2">
          {listing.animal?.subtype || listing.animal?.type}
        </p>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(listing.price)}
          </p>
        </div>

        {/* Location and Views */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{listing.location || 'Location not specified'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👁️</span>
            <span>{listing.views_count || 0} views</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
