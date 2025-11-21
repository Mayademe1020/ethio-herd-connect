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
  weight?: number;
  age?: string;
  lastActivity?: string;
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
  pregnancy_data,
  weight,
  age,
  lastActivity
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
      className={`
        cursor-pointer card-hover
        ${isActive ? 'border-gray-100' : 'border-gray-300 opacity-60'}
        bg-white rounded-xl p-4 border border-gray-100
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        
        {/* Animal Photo - Rounded, good aspect ratio */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
            {photo_url ? (
              <OptimizedImage
                src={photo_url}
                alt={name}
                className="w-full h-full object-cover"
                fallbackIcon={ANIMAL_ICONS[type]}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {ANIMAL_ICONS[type]}
              </div>
            )}
          </div>
          
          {/* Status badge - Absolute positioned */}
          <div className={`
            absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm
            ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}
          `}>
            {isActive ? 'Active' : status || 'Inactive'}
          </div>

          {/* Pregnancy badge */}
          {isPregnant && daysUntilDelivery !== null && (
            <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              <span>{daysUntilDelivery}d</span>
            </div>
          )}
        </div>
        
        {/* Animal Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Type */}
          <div className="mb-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {name}
            </h3>
            <p className="text-sm text-gray-600">
              {subtype || type} {animal_id && `• ${animal_id}`}
            </p>
          </div>
          
          {/* Quick Stats */}
          {(weight || age || lastActivity) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {weight && (
                <>
                  <span>{weight}kg</span>
                  <span>•</span>
                </>
              )}
              {age && (
                <>
                  <span>{age}</span>
                  <span>•</span>
                </>
              )}
              {lastActivity && <span>{lastActivity}</span>}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {canProduceMilk && (
              <button
                onClick={handleRecordMilk}
                className="flex-1 bg-emerald-500 text-white text-sm font-medium px-3 py-2 rounded-lg
                          hover:bg-emerald-600 btn-press flex items-center justify-center gap-1"
              >
                <Milk className="w-4 h-4" />
                🥛 Record Milk
              </button>
            )}
            <button
              onClick={handleViewDetails}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 btn-press"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
