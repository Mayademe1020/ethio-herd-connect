
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Weight, Syringe, TrendingUp, DollarSign, Edit, Trash2, Camera, Star, Hash } from 'lucide-react';

interface Animal {
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
  animal: Animal;
  language: 'am' | 'en';
  onClose: () => void;
  onEdit: (animal: Animal) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: Animal) => void;
  onTrack: (animal: Animal) => void;
  onSell: (animal: Animal) => void;
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
  const getHealthStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      sick: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      healthy: language === 'am' ? 'ጤናማ' : 'Healthy',
      attention: language === 'am' ? 'ትኩረት' : 'Attention',
      sick: language === 'am' ? 'ታማሚ' : 'Sick'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getVaccineStatus = (lastVaccination?: string, isVerified?: boolean) => {
    if (!lastVaccination) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          {language === 'am' ? 'አልተከተበም' : 'Not Vaccinated'}
        </Badge>
      );
    }
    
    const vaccinationDate = new Date(lastVaccination);
    const daysSince = Math.floor((Date.now() - vaccinationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30) {
      return (
        <Badge className="bg-green-100 text-green-800">
          {language === 'am' ? 'ቅርብ ጊዜ' : 'Recent'}
        </Badge>
      );
    } else if (daysSince < 90) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          {language === 'am' ? 'መካከለኛ' : 'Moderate'}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800">
          {language === 'am' ? 'የተዘለለ' : 'Overdue'}
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center space-x-2">
            <span>{animal.name}</span>
            {animal.is_vet_verified && (
              <Badge className="bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                {language === 'am' ? 'ዶክተር ማረጋገጫ' : 'Vet Verified'}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Photo */}
          <div className="text-center">
            {animal.photo_url ? (
              <img
                src={animal.photo_url}
                alt={animal.name}
                className="w-48 h-48 rounded-xl object-cover mx-auto border-4 border-green-200"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-gray-200 border-4 border-green-200 flex items-center justify-center mx-auto">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-green-800 mb-3">
              {language === 'am' ? 'መሰረታዊ መረጃ' : 'Basic Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'የእንስሳ ኮድ' : 'Animal Code'}
                  </p>
                  <p className="font-medium">{animal.animal_code}</p>
                </div>
              </div>

              {animal.tracker_id && (
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'am' ? 'የመከታተያ ቁጥር' : 'Tracker ID'}
                    </p>
                    <p className="font-medium">{animal.tracker_id}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'አይነት' : 'Type'}
                </p>
                <p className="font-medium capitalize">{animal.type}</p>
              </div>

              {animal.breed && (
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'ዝርያ' : 'Breed'}
                  </p>
                  <p className="font-medium">{animal.breed}</p>
                </div>
              )}

              {animal.age && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'am' ? 'እድሜ' : 'Age'}
                    </p>
                    <p className="font-medium">{animal.age} {language === 'am' ? 'ዓመት' : 'years'}</p>
                  </div>
                </div>
              )}

              {animal.weight && (
                <div className="flex items-center space-x-2">
                  <Weight className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'am' ? 'ክብደት' : 'Weight'}
                    </p>
                    <p className="font-medium">{animal.weight} kg</p>
                  </div>
                </div>
              )}

              {animal.birth_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'am' ? 'የመወለድ ቀን' : 'Birth Date'}
                    </p>
                    <p className="font-medium">{formatDate(animal.birth_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">
              {language === 'am' ? 'የጤና ሁኔታ' : 'Health Status'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'am' ? 'አጠቃላይ ጤንነት' : 'Overall Health'}
                </p>
                {getHealthStatusBadge(animal.health_status)}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'am' ? 'የክትባት ሁኔታ' : 'Vaccination Status'}
                </p>
                {getVaccineStatus(animal.last_vaccination, animal.is_vet_verified)}
              </div>
              
              {animal.last_vaccination && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'የመጨረሻ ክትባት' : 'Last Vaccination'}
                  </p>
                  <p className="font-medium">{formatDate(animal.last_vaccination)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Date */}
          <div className="text-center text-sm text-gray-500">
            {language === 'am' ? 'የተመዘገበበት ቀን' : 'Registered'}: {formatDate(animal.created_at)}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={() => onVaccinate(animal)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Syringe className="w-4 h-4" />
              <span>{language === 'am' ? 'ክትባት' : 'Vaccinate'}</span>
            </Button>
            
            <Button
              onClick={() => onTrack(animal)}
              className="bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'am' ? 'ክትትል' : 'Track'}</span>
            </Button>
            
            <Button
              onClick={() => onSell(animal)}
              className="bg-orange-600 hover:bg-orange-700 flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>{language === 'am' ? 'ሽጥ' : 'Sell'}</span>
            </Button>
            
            <Button
              onClick={() => onEdit(animal)}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>{language === 'am' ? 'አርትዕ' : 'Edit'}</span>
            </Button>
            
            <Button
              onClick={() => onDelete(animal.id)}
              variant="outline"
              className="text-red-600 hover:text-red-800 hover:border-red-300 flex items-center justify-center space-x-2 md:col-span-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'am' ? 'ሰርዝ' : 'Delete'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
