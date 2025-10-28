// src/components/AnimalCard.tsx - Visual card component for displaying animals

import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Milk, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OptimizedImage } from '@/components/OptimizedImage';

interface AnimalCardProps {
  id: string;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype: string;
  photo_url?: string;
  registration_date: string;
  is_active: boolean;
}

const ANIMAL_ICONS = {
  cattle: '🐄',
  goat: '🐐',
  sheep: '🐑'
};

const MILK_PRODUCING_SUBTYPES = ['Cow', 'Female Goat', 'Ewe'];

export const AnimalCard = ({
  id,
  name,
  type,
  subtype,
  photo_url,
  registration_date,
  is_active
}: AnimalCardProps) => {
  const navigate = useNavigate();
  const canProduceMilk = MILK_PRODUCING_SUBTYPES.includes(subtype);

  const handleRecordMilk = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/record-milk', { state: { animalId: id, animalName: name } });
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/animals/${id}`);
  };

  const handleCardClick = () => {
    navigate(`/animals/${id}`);
  };

  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        is_active ? 'border-green-200' : 'border-gray-300 opacity-60'
      }`}
      onClick={handleCardClick}
    >
      {/* Photo Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100">
        {photo_url ? (
          <OptimizedImage
            src={photo_url}
            alt={name}
            className="w-full h-full"
            fallbackIcon={ANIMAL_ICONS[type]}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {ANIMAL_ICONS[type]}
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
          is_active 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-500 text-white'
        }`}>
          {is_active ? '✓ Healthy' : 'Inactive'}
        </div>

        {/* Type Icon Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-2xl">
          {ANIMAL_ICONS[type]}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-3">
        {/* Name and Subtype */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {name}
          </h3>
          <p className="text-sm text-gray-600">
            {subtype}
          </p>
        </div>

        {/* Registration Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            Registered {formatDistanceToNow(new Date(registration_date), { addSuffix: true })}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {canProduceMilk && (
            <Button
              onClick={handleRecordMilk}
              size="sm"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Milk className="w-4 h-4 mr-1" />
              Record Milk
            </Button>
          )}
          <Button
            onClick={handleViewDetails}
            size="sm"
            variant="outline"
            className={canProduceMilk ? 'flex-1' : 'w-full'}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
