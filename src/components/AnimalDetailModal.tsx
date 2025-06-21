
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Edit, Trash2, Syringe, MapPin, DollarSign, Calendar, Weight, Heart, Activity, Phone, Camera } from 'lucide-react';

interface AnimalData {
  id: string;
  name: string;
  animal_code: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_status: 'healthy' | 'attention' | 'sick';
  last_vaccination?: string;
  is_vet_verified: boolean;
  created_at: string;
  tracker_id?: string;
  birth_date?: string;
}

interface AnimalDetailModalProps {
  animal: AnimalData;
  language: 'am' | 'en';
  onClose: () => void;
  onEdit: (animal: AnimalData) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: AnimalData) => void;
  onTrack: (animal: AnimalData) => void;
  onSell: (animal: AnimalData) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  language,
  onClose,
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell
}) => {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return language === 'am' ? 'ጤናማ' : 'Healthy';
      case 'attention': return language === 'am' ? 'ትኩረት ያስፈልጋል' : 'Needs Attention';
      case 'sick': return language === 'am' ? 'ታመመ' : 'Sick';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <span className="truncate">{animal.name}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Animal Photo and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photo Section */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {animal.photo_url ? (
                  <img
                    src={animal.photo_url}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        {language === 'am' ? 'ምስል የለም' : 'No Photo'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'am' ? 'የእንስሳ ኮድ' : 'Animal Code'}
                  </p>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {animal.animal_code}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'am' ? 'ዓይነት' : 'Type'}
                  </p>
                  <p className="capitalize font-medium">{animal.type}</p>
                </div>

                {animal.breed && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      {language === 'am' ? 'ዝርያ' : 'Breed'}
                    </p>
                    <p className="font-medium">{animal.breed}</p>
                  </div>
                )}

                {animal.age && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      {language === 'am' ? 'እድሜ' : 'Age'}
                    </p>
                    <p className="font-medium">{animal.age} {language === 'am' ? 'ዓመት' : 'years'}</p>
                  </div>
                )}

                {animal.weight && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      {language === 'am' ? 'ክብደት' : 'Weight'}
                    </p>
                    <p className="font-medium flex items-center">
                      <Weight className="w-4 h-4 mr-1" />
                      {animal.weight} kg
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'am' ? 'የጤንነት ሁኔታ' : 'Health Status'}
                  </p>
                  <Badge className={getHealthStatusColor(animal.health_status)}>
                    <Activity className="w-3 h-3 mr-1" />
                    {getHealthStatusText(animal.health_status)}
                  </Badge>
                </div>
              </div>

              {/* Verification Status */}
              {animal.is_vet_verified && (
                <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {language === 'am' ? 'በዓይነ ሐኪም የተረጋገጠ' : 'Veterinarian Verified'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Health Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              {language === 'am' ? 'የጤንነት መረጃ' : 'Health Information'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {animal.last_vaccination && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'am' ? 'የመጨረሻ ክትባት' : 'Last Vaccination'}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-green-500" />
                    {new Date(animal.last_vaccination).toLocaleDateString()}
                  </p>
                </div>
              )}

              {animal.birth_date && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'am' ? 'የትውልድ ቀን' : 'Birth Date'}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                    {new Date(animal.birth_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {animal.tracker_id && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'am' ? 'ተከታታይ መለያ' : 'Tracker ID'}
                  </p>
                  <p className="font-mono text-sm bg-green-100 px-2 py-1 rounded inline-block">
                    {animal.tracker_id}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {language === 'am' ? 'የመዝገብ ቀን' : 'Registration Date'}
                </p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                  {new Date(animal.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === 'am' ? 'እርምጃዎች' : 'Actions'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                onClick={() => onEdit(animal)}
                variant="outline"
                className="w-full hover:bg-blue-50 border-blue-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                {language === 'am' ? 'አርም' : 'Edit'}
              </Button>

              <Button
                onClick={() => onVaccinate(animal)}
                variant="outline"
                className="w-full hover:bg-green-50 border-green-200"
              >
                <Syringe className="w-4 h-4 mr-2" />
                {language === 'am' ? 'አክትብ' : 'Vaccinate'}
              </Button>

              <Button
                onClick={() => onTrack(animal)}
                variant="outline"
                className="w-full hover:bg-purple-50 border-purple-200"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {language === 'am' ? 'ተከታተል' : 'Track'}
              </Button>

              <Button
                onClick={() => onSell(animal)}
                variant="outline"
                className="w-full hover:bg-orange-50 border-orange-200"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {language === 'am' ? 'ሸጥ' : 'Sell'}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => onDelete(animal.id)}
                variant="outline"
                className="w-full sm:w-auto text-red-600 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {language === 'am' ? 'ሰርዝ' : 'Delete'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
