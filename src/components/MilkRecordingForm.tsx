
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, Milk } from 'lucide-react';
import { AnimalData, Language } from '@/types';

interface MilkRecord {
  cowId: string;
  quantity: string;
  time: string;
}

interface MilkRecordingFormProps {
  selectedCows: AnimalData[];
  language: Language;
  onSave: (records: MilkRecord[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const MilkRecordingForm = ({ 
  selectedCows, 
  language, 
  onSave, 
  onCancel, 
  isLoading 
}: MilkRecordingFormProps) => {
  const [records, setRecords] = useState<MilkRecord[]>(
    selectedCows.map(cow => ({
      cowId: cow.id,
      quantity: '',
      time: new Date().toLocaleTimeString('en-GB', { hour12: false })
    }))
  );

  const translations = {
    am: {
      title: 'የወተት ምርት መመዝገብ',
      quantity: 'የወተት መጠን (ሊትር)',
      time: 'የምርት ጊዜ',
      save: 'ማስቀመጥ',
      cancel: 'ሰርዝ',
      enterQuantity: 'የወተት መጠን ያስገቡ'
    },
    en: {
      title: 'Record Milk Production',
      quantity: 'Milk Quantity (Liters)',
      time: 'Production Time',
      save: 'Save',
      cancel: 'Cancel',
      enterQuantity: 'Enter milk quantity'
    },
    or: {
      title: 'Oomisha Aannan Galmeessuu',
      quantity: 'Hamma Aannan (Liitira)',
      time: 'Yeroo Oomishaa',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      enterQuantity: 'Hamma aannan galchi'
    },
    sw: {
      title: 'Rekodi Uzalishaji wa Maziwa',
      quantity: 'Kiasi cha Maziwa (Lita)',
      time: 'Muda wa Uzalishaji',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      enterQuantity: 'Ingiza kiasi cha maziwa'
    }
  };

  const t = translations[language];

  const updateRecord = (cowId: string, field: 'quantity' | 'time', value: string) => {
    setRecords(prev => prev.map(record => 
      record.cowId === cowId ? { ...record, [field]: value } : record
    ));
  };

  const handleSave = () => {
    const validRecords = records.filter(record => record.quantity.trim() !== '');
    if (validRecords.length > 0) {
      onSave(validRecords);
    }
  };

  const formatTimeForLanguage = (time: string) => {
    if (language === 'am') {
      // Convert to Ethiopian time format
      const [hours, minutes] = time.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'ከምሽት' : 'ከጠዋት';
      return `${hour12}:${minutes} ${ampm}`;
    }
    return time;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milk className="w-5 h-5 text-blue-600" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCows.map((cow, index) => (
            <Card key={cow.id} className="p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="font-medium text-sm">
                  {cow.name} (Tag: {cow.animal_code})
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Milk className="w-3 h-3" />
                      {t.quantity}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder={t.enterQuantity}
                      value={records[index]?.quantity || ''}
                      onChange={(e) => updateRecord(cow.id, 'quantity', e.target.value)}
                      className="text-base" // Larger text for mobile
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t.time}
                    </Label>
                    <Input
                      type="time"
                      value={records[index]?.time || ''}
                      onChange={(e) => updateRecord(cow.id, 'time', e.target.value)}
                      className="text-base" // Larger text for mobile
                    />
                    {language === 'am' && (
                      <div className="text-xs text-gray-500">
                        {formatTimeForLanguage(records[index]?.time || '')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={isLoading || records.every(r => !r.quantity.trim())}
          className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            t.save
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 h-12 text-base"
        >
          {t.cancel}
        </Button>
      </div>
    </div>
  );
};
