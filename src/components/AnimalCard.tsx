// src/components/AnimalCard.tsx - Visual card component for displaying animals

import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Milk, Eye, Calendar, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OptimizedImage } from '@/components/OptimizedImage';
import { AnimalIdBadge } from '@/components/AnimalIdBadge';
import { calculateDaysRemaining } from '@/utils/pregnancyCalculations';

interface PregnancyRecord {
  breeding_date: string;
  expected_delivery: string;
  status: 'pregnant' | 'delivered' | 'terminated';
}

interface AnimalCardProps {
  id: string;
  animal_id?: string; // Professional animal ID
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype?: string;
  photo_url?: string;
  registration_date: string;
  status?: string; // Professional status system
  pregnancy_status?: 'not_pregnant' | 'pregnant' | 'delivered';
  pregnancy_data?: PregnancyRecord[];
}

const ANIMAL_ICONS = {
  cattle: '🐄',
  goat: '🐐',
  sheep: '🐑'
};

const MILK_PRODUCING_SUBTYPES = ['Cow', 'Female Goat', 'Ewe'];

export const AnimalCard = ({
  id,
  animal_id,
  name,
  type,
  subtype,
  photo_url,
  registration_date,
  status = 'active',
  pregnancy_status,
  pregnancy_data
}: AnimalCardProps) => {
  const navigate = useNavigate();
  const canProduceMilk = MILK_PRODUCING_SUBTYPES.includes(subtype);
  const isActive = status === 'active';
  
  // Get current pregnancy info
  const isPregnant = pregnancy_status === 'pregnant';
  const currentPregnancy = isPregnant && pregnancy_data && pregnancy_data.length > 0
    ? pregnancy_data[pregnancy_data.length - 1]
    : null;
  const daysUntilDelivery = currentPregnancy 
    ? calculateDaysRemaining(currentPregnancy.expected_delivery)
    : null;

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
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${isActive ? 'border-green-200' : 'border-gray-300 opacity-60'
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
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive
            ? 'bg-green-500 text-white'
            : 'bg-gray-500 text-white'
            }`}>
            {isActive ? '✓ Active' : status || 'Inactive'}
          </div>
          
          {/* Pregnancy Badge */}
          {isPregnant && daysUntilDelivery !== null && (
            <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              <span>{daysUntilDelivery}d</span>
            </div>
          )}
        </div>

        {/* Animal ID Badge */}
        {animal_id && (
          <div className="absolute bottom-2 left-2">
            <AnimalIdBadge animalId={animal_id} size="sm" showCopyButton={false} />
          </div>
        )}

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
