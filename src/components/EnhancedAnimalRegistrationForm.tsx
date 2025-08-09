
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Camera, Check, AlertCircle, Cow, MapPin } from 'lucide-react';
import { Language } from '@/types';
import { useToastNotifications } from '@/hooks/useToastNotifications';

interface EnhancedAnimalRegistrationFormProps {
  language: Language;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

interface FormData {
  // Step 1: Basic Info
  name: string;
  type: string;
  breed: string;
  
  // Step 2: Physical Details
  age: string;
  weight: string;
  color: string;
  markings: string;
  
  // Step 3: Health & Origin
  healthStatus: string;
  vaccinationStatus: string;
  origin: string;
  purchasePrice: string;
  
  // Step 4: Documentation
  photo: File | null;
  certificates: string[];
}

const STEPS = 4;

export const EnhancedAnimalRegistrationForm = ({ 
  language, 
  onClose, 
  onSubmit 
}: EnhancedAnimalRegistrationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    breed: '',
    age: '',
    weight: '',
    color: '',
    markings: '',
    healthStatus: 'healthy',
    vaccinationStatus: 'up_to_date',
    origin: '',
    purchasePrice: '',
    photo: null,
    certificates: []
  });
  const { showSuccess, showError } = useToastNotifications();

  const translations = {
    am: {
      title: 'አዲስ እንስሳ ምዝገባ',
      step1: 'መሰረታዊ መረጃ',
      step2: 'አካላዊ ዝርዝር',
      step3: 'ጤንነት እና መነሻ',
      step4: 'ሰነዶች',
      name: 'ስም',
      type: 'አይነት',
      breed: 'ዝርያ',
      age: 'እድሜ',
      weight: 'ክብደት',
      color: 'ቀለም',
      markings: 'ምልክቶች',
      healthStatus: 'የጤንነት ሁኔታ',
      vaccinationStatus: 'የክትባት ሁኔታ',
      origin: 'መነሻ',
      purchasePrice: 'የግዢ ዋጋ',
      photo: 'ፎቶ',
      next: 'ቀጣይ',
      previous: 'ቀዳሚ',
      finish: 'ፈጽም',
      cancel: 'ሰርዝ',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      healthy: 'ጤናማ',
      sick: 'ታምሞ',
      upToDate: 'ወቅታዊ',
      overdue: 'ዘግይቶ',
      red: 'ቀይ',
      brown: 'ቡናማ',
      black: 'ጥቁር',
      white: 'ነጭ',
      mixed: 'ድብልቅ'
    },
    en: {
      title: 'New Animal Registration',
      step1: 'Basic Information',
      step2: 'Physical Details',
      step3: 'Health & Origin',
      step4: 'Documentation',
      name: 'Name',
      type: 'Type',
      breed: 'Breed',
      age: 'Age',
      weight: 'Weight',
      color: 'Color',
      markings: 'Markings',
      healthStatus: 'Health Status',
      vaccinationStatus: 'Vaccination Status',
      origin: 'Origin',
      purchasePrice: 'Purchase Price',
      photo: 'Photo',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      cancel: 'Cancel',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      healthy: 'Healthy',
      sick: 'Sick',
      upToDate: 'Up to Date',
      overdue: 'Overdue',
      red: 'Red',
      brown: 'Brown',
      black: 'Black',
      white: 'White',
      mixed: 'Mixed'
    },
    or: {
      title: 'Galmeessa Horii Haaraa',
      step1: 'Odeeffannoo Bu\'uuraa',
      step2: 'Ibsa Qaamaa',
      step3: 'Fayyaa fi Ka\'umsa',
      step4: 'Ragaalee',
      name: 'Maqaa',
      type: 'Gosa',
      breed: 'Sanyii',
      age: 'Umurii',
      weight: 'Ulfaatina',
      color: 'Halluu',
      markings: 'Mallattoolee',
      healthStatus: 'Haala Fayyaa',
      vaccinationStatus: 'Haala Walaloo',
      origin: 'Ka\'umsa',
      purchasePrice: 'Gatii Bitaa',
      photo: 'Suuraa',
      next: 'Itti Aanu',
      previous: 'Dura',
      finish: 'Xumuri',
      cancel: 'Dhiisi',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      healthy: 'Fayya',
      sick: 'Dhukkuba',
      upToDate: 'Haaromfame',
      overdue: 'Turee',
      red: 'Diimaa',
      brown: 'Magariisa',
      black: 'Gurraacha',
      white: 'Adii',
      mixed: 'Makame'
    },
    sw: {
      title: 'Usajili wa Mnyama Mpya',
      step1: 'Maelezo ya Kimsingi',
      step2: 'Maelezo ya Kimwili',
      step3: 'Afya na Asili',
      step4: 'Hati',
      name: 'Jina',
      type: 'Aina',
      breed: 'Kizazi',
      age: 'Umri',
      weight: 'Uzito',
      color: 'Rangi',
      markings: 'Alama',
      healthStatus: 'Hali ya Afya',
      vaccinationStatus: 'Hali ya Chanjo',
      origin: 'Asili',
      purchasePrice: 'Bei ya Ununuzi',
      photo: 'Picha',
      next: 'Ifuatayo',
      previous: 'Iliyotangulia',
      finish: 'Maliza',
      cancel: 'Ghairi',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      healthy: 'Mzuri',
      sick: 'Mgonjwa',
      upToDate: 'Sasa Hivi',
      overdue: 'Umechelewa',
      red: 'Nyekundu',
      brown: 'Kahawia',
      black: 'Nyeusi',
      white: 'Nyeupe',
      mixed: 'Mchanganyiko'
    }
  };

  const t = translations[language];

  const ethiopianBreeds = {
    cattle: ['ቦራ (Bora)', 'ሆላንድ-ፍሪሲያን (Holstein-Friesian)', 'ኮንቺኒ (Kenchini)', 'ፎግራ (Fogera)', 'አርሲ (Arsi)', 'ደናቃ (Danakil)'],
    goat: ['አርሲ-ባሌ (Arsi-Bale)', 'አፋር (Afar)', 'ቦር (Boer)', 'ሽሮ (Shiro)', 'ወላይታ (Wolaita)', 'አዲሎ (Adilo)'],
    sheep: ['መንዝ (Menz)', 'ሃሪ (Horro)', 'አፋር (Afar)', 'ባርጋ (Barga)', 'አርሲ-ባሌ (Arsi-Bale)', 'ቦራ (Bora)']
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.type !== '' && formData.breed !== '';
      case 2:
        return formData.age !== '' && formData.weight !== '';
      case 3:
        return formData.healthStatus !== '' && formData.vaccinationStatus !== '';
      case 4:
        return true; // Optional step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS));
    } else {
      showError(
        language === 'am' ? 'እባክዎ የግዴታ መስኮች ይሙሉ' :
        language === 'or' ? 'Maaloo dirqalee guuti' :
        language === 'sw' ? 'Tafadhali jaza sehemu zinazohitajika' :
        'Please fill in required fields'
      );
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      if (onSubmit) {
        onSubmit(formData);
      }
      showSuccess(
        language === 'am' ? 'እንስሳ በተሳካ ሁኔታ ተመዝግቧል!' :
        language === 'or' ? 'Horii milkaa\'inaan galmeeffame!' :
        language === 'sw' ? 'Mnyama amejisajili kwa ufanisi!' :
        'Animal registered successfully!'
      );
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-ethiopia-green-800 flex items-center">
                  <Cow className="w-4 h-4 mr-2" />
                  {t.name} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder={language === 'am' ? 'ለምሳሌ: ማርታ' : 'e.g: Marta'}
                  className="border-ethiopia-gold-200 focus:border-ethiopia-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-ethiopia-green-800">{t.type} *</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                  <SelectTrigger className="border-ethiopia-gold-200 focus:border-ethiopia-green-500">
                    <SelectValue placeholder={t.type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">🐄 {t.cattle}</SelectItem>
                    <SelectItem value="goat">🐐 {t.goat}</SelectItem>
                    <SelectItem value="sheep">🐑 {t.sheep}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-ethiopia-green-800">{t.breed} *</Label>
                <Select 
                  value={formData.breed} 
                  onValueChange={(value) => updateFormData('breed', value)}
                  disabled={!formData.type}
                >
                  <SelectTrigger className="border-ethiopia-gold-200 focus:border-ethiopia-green-500">
                    <SelectValue placeholder={t.breed} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type && ethiopianBreeds[formData.type as keyof typeof ethiopianBreeds]?.map((breed) => (
                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-ethiopia-green-800">{t.age} * ({language === 'am' ? 'በወር' : 'months'})</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  placeholder="12"
                  className="border-ethiopia-gold-200 focus:border-ethiopia-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-ethiopia-green-800">{t.weight} * (kg)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  placeholder="250"
                  className="border-ethiopia-gold-200 focus:border-ethiopia-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-ethiopia-green-800">{t.color}</Label>
              <Select value={formData.color} onValueChange={(value) => updateFormData('color', value)}>
                <SelectTrigger className="border-ethiopia-gold-200 focus:border-ethiopia-green-500">
                  <SelectValue placeholder={t.color} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">{t.red}</SelectItem>
                  <SelectItem value="brown">{t.brown}</SelectItem>
                  <SelectItem value="black">{t.black}</SelectItem>
                  <SelectItem value="white">{t.white}</SelectItem>
                  <SelectItem value="mixed">{t.mixed}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-ethiopia-green-800">{t.markings}</Label>
              <Input
                value={formData.markings}
                onChange={(e) => updateFormData('markings', e.target.value)}
                placeholder={language === 'am' ? 'ልዩ ምልክቶች...' : 'Special markings...'}
                className="border-ethiopia-gold-200 focus:border-ethiopia-green-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-ethiopia-green-800">{t.healthStatus} *</Label>
                <Select value={formData.healthStatus} onValueChange={(value) => updateFormData('healthStatus', value)}>
                  <SelectTrigger className="border-ethiopia-gold-200 focus:border-ethiopia-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">✅ {t.healthy}</SelectItem>
                    <SelectItem value="sick">⚠️ {t.sick}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-ethiopia-green-800">{t.vaccinationStatus} *</Label>
                <Select value={formData.vaccinationStatus} onValueChange={(value) => updateFormData('vaccinationStatus', value)}>
                  <SelectTrigger className="border-ethiopia-gold-200 focus:border-ethiopia-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up_to_date">✅ {t.upToDate}</SelectItem>
                    <SelectItem value="overdue">⚠️ {t.overdue}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-ethiopia-green-800 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {t.origin}
              </Label>
              <Input
                value={formData.origin}
                onChange={(e) => updateFormData('origin', e.target.value)}
                placeholder={language === 'am' ? 'ከየት ተገዝቷል?' : 'Where was it purchased?'}
                className="border-ethiopia-gold-200 focus:border-ethiopia-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-ethiopia-green-800">{t.purchasePrice} (ETB)</Label>
              <Input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => updateFormData('purchasePrice', e.target.value)}
                placeholder="15000"
                className="border-ethiopia-gold-200 focus:border-ethiopia-green-500"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-ethiopia-green-800 flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                {t.photo}
              </Label>
              <div className="border-2 border-dashed border-ethiopia-gold-300 rounded-lg p-6 text-center hover:border-ethiopia-green-400 transition-colors">
                <Camera className="w-12 h-12 mx-auto mb-4 text-ethiopia-gold-600" />
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ፎቶ ለመጨመር እዚህ ይንኩ' : 'Click here to add photo'}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => updateFormData('photo', e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="bg-ethiopia-gold-50 border border-ethiopia-gold-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-ethiopia-gold-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-ethiopia-gold-800 mb-1">
                    {language === 'am' ? 'ጠቃሚ ምክር' : 
                     language === 'or' ? 'Yaada Barbaachisaa' :
                     language === 'sw' ? 'Kidokezo Muhimu' : 'Important Tip'}
                  </p>
                  <p className="text-ethiopia-gold-700">
                    {language === 'am' 
                      ? 'ግልጽ እና ጥራት ያለው ፎቶ ለወደፊት መታወቂያ እና የሕክምና ክትትል ያግዛል።'
                      : language === 'or'
                      ? 'Suuraan ifa fi qulqulluu ta\'e gargaarsa eenyummaa fi hordoffii yaalaa dhufuuf.'
                      : language === 'sw'
                      ? 'Picha wazi na ya ubora itasaidia katika utambulisho na ufuatiliaji wa matibabu.'
                      : 'A clear, quality photo helps with future identification and medical tracking.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return t.step1;
      case 2: return t.step2;
      case 3: return t.step3;
      case 4: return t.step4;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="bg-gradient-to-r from-ethiopia-green-600 to-ethiopia-green-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Cow className="w-5 h-5" />
              <span>{t.title}</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {currentStep}/{STEPS}
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{getStepTitle(currentStep)}</span>
              <span className="text-sm">{Math.round((currentStep / STEPS) * 100)}%</span>
            </div>
            <Progress 
              value={(currentStep / STEPS) * 100} 
              className="h-2 bg-white/20"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="border-ethiopia-green-200 text-ethiopia-green-700 hover:bg-ethiopia-green-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.previous}
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </Button>

              {currentStep < STEPS ? (
                <Button
                  onClick={nextStep}
                  className="bg-ethiopia-green-600 hover:bg-ethiopia-green-700 text-white"
                  disabled={!validateStep(currentStep)}
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-ethiopia-green-600 hover:bg-ethiopia-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {t.finish}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
