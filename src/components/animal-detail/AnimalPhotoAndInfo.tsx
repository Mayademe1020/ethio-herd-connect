import { Calendar, Activity, Milk, Edit, ShoppingCart, ShieldCheck, Heart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';

const ANIMAL_ICONS = {
  cattle: '🐄',
  goat: '🐐',
  sheep: '🐑',
};

interface Animal {
  id: string;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype?: string;
  photo_url?: string;
  registration_date?: string;
  created_at: string;
}

interface AnimalPhotoAndInfoProps {
  animal: Animal;
  canProduceMilk: boolean;
  canGetPregnant: boolean;
  onRecordMilk: () => void;
  onRecordPregnancy: () => void;
  onEdit: () => void;
  onListForSale: () => void;
  onTransfer: () => void;
  onDelete: () => void;
}

const calculateAge = (registrationDate: string) => {
  const now = new Date();
  const registered = new Date(registrationDate);
  const diffMs = now.getTime() - registered.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 1) return `${diffDays} days old`;
  if (diffMonths < 12) return `${diffMonths} months old`;
  const years = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''} old`;
};

export const AnimalPhotoAndInfo = ({
  animal,
  canProduceMilk,
  canGetPregnant,
  onRecordMilk,
  onRecordPregnancy,
  onEdit,
  onListForSale,
  onTransfer,
  onDelete,
}: AnimalPhotoAndInfoProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-64 bg-gradient-to-br from-green-50 to-green-100">
        {animal.photo_url ? (
          <img
            src={animal.photo_url}
            alt={animal.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {ANIMAL_ICONS[animal.type]}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="text-gray-600 mt-1">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Registered</p>
              <p className="font-medium text-gray-900">
                {formatDistanceToNow(new Date(animal.registration_date || animal.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-gray-600 mt-1">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Age</p>
              <p className="font-medium text-gray-900">
                {calculateAge(animal.registration_date || animal.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          {canProduceMilk && (
            <EnhancedButton onClick={onRecordMilk} variant="success" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Milk className="w-4 h-4 mr-2" />
              Record Milk
            </EnhancedButton>
          )}
          {canGetPregnant && (
            <EnhancedButton onClick={onRecordPregnancy} variant="secondary" className="bg-pink-500 hover:bg-pink-600 text-white">
              <Heart className="w-4 h-4 mr-2" />
              Record Pregnancy
            </EnhancedButton>
          )}
          <EnhancedButton onClick={onEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </EnhancedButton>
          <EnhancedButton onClick={onListForSale} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <ShoppingCart className="w-4 h-4 mr-2" />
            List for Sale
          </EnhancedButton>
          <EnhancedButton onClick={onTransfer} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Transfer Ownership
          </EnhancedButton>
          <EnhancedButton onClick={onDelete} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 col-span-2">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Animal
          </EnhancedButton>
        </div>
      </div>
    </Card>
  );
};
