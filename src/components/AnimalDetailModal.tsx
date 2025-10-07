
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Syringe, AlertTriangle, Calendar, Weight } from 'lucide-react';
import { Language, AnimalData } from '@/types';

interface AnimalDetailModalProps {
  animal: AnimalData;
  language: Language;
  onClose: () => void;
  onEdit: (animal: AnimalData) => void;
  onVaccinate: (animal: AnimalData) => void;
  onReportIllness: (animal: AnimalData) => void;
}

export const AnimalDetailModal = ({
  animal,
  language,
  onClose,
  onEdit,
  onVaccinate,
  onReportIllness
}: AnimalDetailModalProps) => {
  const translations = {
    am: {
      animalDetails: 'የእንስሳ ዝርዝር',
      basicInfo: 'መሰረታዊ መረጃ',
      name: 'ስም',
      code: 'ኮድ',
      type: 'ዓይነት',
      breed: 'ዝርያ',
      birthDate: 'የተወለደ ቀን',
      weight: 'ክብደት',
      healthStatus: 'የጤንነት ሁኔታ',
      lastVaccination: 'የመጨረሻ ክትባት',
      edit: 'ኤዲት',
      vaccinate: 'ክትባት',
      reportIllness: 'ህመም ሪፖርት',
      close: 'ዝጋ'
    },
    en: {
      animalDetails: 'Animal Details',
      basicInfo: 'Basic Information',
      name: 'Name',
      code: 'Code',
      type: 'Type',
      breed: 'Breed',
      birthDate: 'Birth Date',
      weight: 'Weight',
      healthStatus: 'Health Status',
      lastVaccination: 'Last Vaccination',
      edit: 'Edit',
      vaccinate: 'Vaccinate',
      reportIllness: 'Report Illness',
      close: 'Close'
    },
    or: {
      animalDetails: 'Ibsa Horii',
      basicInfo: 'Odeeffannoo Bu\'uuraa',
      name: 'Maqaa',
      code: 'Koodii',
      type: 'Gosa',
      breed: 'Sanyii',
      birthDate: 'Guyyaa Dhalootaa',
      weight: 'Ulfaatina',
      healthStatus: 'Haalata Fayyaa',
      lastVaccination: 'Tallaa Dhumaa',
      edit: 'Gulaaluu',
      vaccinate: 'Tallaa Gochuu',
      reportIllness: 'Dhukkuba Gabaasuu',
      close: 'Cufuu'
    },
    sw: {
      animalDetails: 'Maelezo ya Mnyama',
      basicInfo: 'Habari za Msingi',
      name: 'Jina',
      code: 'Nambari',
      type: 'Aina',
      breed: 'Aina',
      birthDate: 'Tarehe ya Kuzaliwa',
      weight: 'Uzito',
      healthStatus: 'Hali ya Afya',
      lastVaccination: 'Chanjo ya Mwisho',
      edit: 'Hariri',
      vaccinate: 'Chanjo',
      reportIllness: 'Ripoti Ugonjwa',
      close: 'Funga'
    }
  };

  const t = translations[language];

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'attention': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t.animalDetails}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">{t.basicInfo}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t.name}:</span>
                <p className="font-medium">{animal.name}</p>
              </div>
              <div>
                <span className="text-gray-600">{t.code}:</span>
                <p className="font-medium">{animal.animal_code}</p>
              </div>
              <div>
                <span className="text-gray-600">{t.type}:</span>
                <p className="font-medium capitalize">{animal.type}</p>
              </div>
              <div>
                <span className="text-gray-600">{t.breed}:</span>
                <p className="font-medium">{animal.breed}</p>
              </div>
              <div>
                <span className="text-gray-600">{t.birthDate}:</span>
                <p className="font-medium">{animal.birth_date}</p>
              </div>
              <div>
                <span className="text-gray-600">{t.weight}:</span>
                <p className="font-medium">{animal.weight}kg</p>
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div>
            <span className="text-gray-600 text-sm">{t.healthStatus}:</span>
            <Badge className={`ml-2 ${getHealthStatusColor(animal.health_status)}`}>
              {animal.health_status}
            </Badge>
          </div>

          {/* Last Vaccination */}
          {animal.last_vaccination && (
            <div>
              <span className="text-gray-600 text-sm">{t.lastVaccination}:</span>
              <p className="font-medium">{animal.last_vaccination}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 pt-4">
            <Button
              onClick={() => onEdit(animal)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t.edit}
            </Button>
            
            <Button
              onClick={() => onVaccinate(animal)}
              variant="outline"
              className="w-full border-green-200 hover:bg-green-50"
            >
              <Syringe className="w-4 h-4 mr-2" />
              {t.vaccinate}
            </Button>
            
            <Button
              onClick={() => onReportIllness(animal)}
              variant="outline"
              className="w-full border-red-200 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t.reportIllness}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
