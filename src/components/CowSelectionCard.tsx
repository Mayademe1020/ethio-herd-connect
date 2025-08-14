
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Milk, Tag } from 'lucide-react';
import { AnimalData } from '@/types';

interface CowSelectionCardProps {
  cow: AnimalData;
  isSelected: boolean;
  onSelectionChange: (cowId: string, selected: boolean) => void;
}

export const CowSelectionCard = ({ cow, isSelected, onSelectionChange }: CowSelectionCardProps) => {
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(cow.id, checked as boolean)}
            className="w-5 h-5"
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{cow.name}</h3>
              <Badge variant="outline" className="ml-2">
                <Milk className="w-3 h-3 mr-1" />
                {cow.type}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                <span>Tag: {cow.animal_code}</span>
              </div>
              <div>
                <span>ID: {cow.id.slice(0, 8)}...</span>
              </div>
              <div>
                <span>Breed: {cow.breed || 'Not specified'}</span>
              </div>
              <div>
                <span>Age: {cow.age || 'Unknown'} months</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
