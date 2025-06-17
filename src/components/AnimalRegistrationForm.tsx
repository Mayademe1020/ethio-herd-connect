
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Save, Wifi, WifiOff } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';

interface AnimalRegistrationFormProps {
  language: 'am' | 'en';
  onClose: () => void;
}

export const AnimalRegistrationForm = ({ language, onClose }: AnimalRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cattle',
    breed: '',
    age: '',
    weight: '',
    photo: null as File | null
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { isOnline, addToQueue } = useOfflineSync();

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const animalData = {
      ...formData,
      id: `animal-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      photo: photoPreview // In real app, would upload to storage
    };

    if (isOnline) {
      // Direct sync attempt
      addToQueue('animal', animalData);
      toast.success(
        language === 'am' 
          ? '✅ እንስሳ በተሳካ ሁኔታ ተመዝግቧል!' 
          : '✅ Animal registered successfully!'
      );
    } else {
      // Queue for later sync
      addToQueue('animal', animalData);
      toast.info(
        language === 'am' 
          ? '📱 ኦፍላይን ተቀምጧል - በመስመር ላይ ሲገቡ ይሰምር' 
          : '📱 Saved offline - will sync when online'
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {language === 'am' ? '🐄 አዲስ እንስሳ ምዝገባ' : '🐄 Register New Animal'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-orange-500" />
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Capture */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ፎቶ' : 'Photo'}
              </label>
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Animal" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhotoPreview(null);
                        setFormData({ ...formData, photo: null });
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      {language === 'am' ? 'ፎቶ ያነሱ' : 'Take Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePhotoCapture}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ስም' : 'Name'}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={language === 'am' ? 'ለምሳሌ: ሞላ' : 'e.g: Mola'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'አይነት' : 'Type'}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="cattle">{language === 'am' ? '🐄 ከብት' : '🐄 Cattle'}</option>
                <option value="poultry">{language === 'am' ? '🐔 ዶሮ' : '🐔 Poultry'}</option>
                <option value="goat">{language === 'am' ? '🐐 ፍየል' : '🐐 Goat'}</option>
                <option value="sheep">{language === 'am' ? '🐑 በግ' : '🐑 Sheep'}</option>
              </select>
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ዝርያ' : 'Breed'}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={language === 'am' ? 'ለምሳሌ: ቦራ' : 'e.g: Boran'}
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
            </div>

            {/* Age & Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'am' ? 'እድሜ' : 'Age'}
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="2"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'am' ? 'ክብደት (ኪ.ግ)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="250"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ተመዝግብ' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
