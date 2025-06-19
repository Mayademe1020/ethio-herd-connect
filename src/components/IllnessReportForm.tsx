
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Camera, X, Upload, User, FileText, Calendar, Pill } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface IllnessReportFormProps {
  language: 'am' | 'en';
  onClose: () => void;
  preSelectedAnimal?: string;
}

interface SavedDrug {
  name: string;
  dosage: string;
  type: 'antibiotic' | 'painkiller' | 'vitamin' | 'dewormer' | 'other';
}

export const IllnessReportForm = ({ language, onClose, preSelectedAnimal }: IllnessReportFormProps) => {
  const [illnessData, setIllnessData] = useState({
    animalId: preSelectedAnimal || '',
    animalName: '',
    symptoms: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    dateObserved: new Date().toISOString().split('T')[0],
    vetName: '',
    vetNotes: '',
    treatmentGiven: '',
    drugName: '',
    drugDosage: '',
    followUpDate: '',
    followUpNotes: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [videosPreviews, setVideosPreviews] = useState<string[]>([]);
  const { addToQueue } = useOfflineSync();
  const { user } = useAuth();

  // Mock animals data
  const animals = [
    { id: '1', name: 'ሞላ', animal_code: 'HAB-COW-001' },
    { id: '2', name: 'አበባ', animal_code: 'HAB-COW-002' },
    { id: '3', name: 'ገብሬ', animal_code: 'HAB-GOT-001' }
  ];

  const savedDrugs: SavedDrug[] = [
    { name: 'Oxytetracycline', dosage: '10mg/kg', type: 'antibiotic' },
    { name: 'Penicillin', dosage: '20,000 IU/kg', type: 'antibiotic' },
    { name: 'Ivermectin', dosage: '0.2mg/kg', type: 'dewormer' },
    { name: 'Vitamin B Complex', dosage: '5ml', type: 'vitamin' }
  ];

  const handleMediaCapture = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'photo') {
          setPhotos(prev => [...prev, file]);
          setPhotosPreviews(prev => [...prev, result]);
        } else {
          setVideos(prev => [...prev, file]);
          setVideosPreviews(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number, type: 'photo' | 'video') => {
    if (type === 'photo') {
      setPhotos(prev => prev.filter((_, i) => i !== index));
      setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideos(prev => prev.filter((_, i) => i !== index));
      setVideosPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(language === 'am' ? 'እባክዎ በመጀመሪያ ይግቡ' : 'Please sign in first');
      return;
    }

    const illnessRecord = {
      id: `illness-${Date.now()}`,
      user_id: user.id,
      animalId: illnessData.animalId,
      animalName: illnessData.animalName,
      symptoms: illnessData.symptoms,
      severity: illnessData.severity,
      dateObserved: illnessData.dateObserved,
      vetName: illnessData.vetName,
      vetNotes: illnessData.vetNotes,
      treatmentGiven: illnessData.treatmentGiven,
      drugName: illnessData.drugName,
      drugDosage: illnessData.drugDosage,
      followUpDate: illnessData.followUpDate,
      followUpNotes: illnessData.followUpNotes,
      photos: photosPreviews, // In real app, would upload to storage
      videos: videosPreviews, // In real app, would upload to storage
      reportedAt: new Date().toISOString()
    };

    addToQueue('health', illnessRecord);

    // Set reminder if follow-up date is provided
    if (illnessData.followUpDate) {
      const reminderData = {
        id: `reminder-${Date.now()}`,
        user_id: user.id,
        animalId: illnessData.animalId,
        animalName: illnessData.animalName,
        type: 'follow_up',
        date: illnessData.followUpDate,
        message: illnessData.followUpNotes || (language === 'am' ? 'ክትትል ይፈልጋል' : 'Follow-up needed'),
        created_at: new Date().toISOString()
      };
      
      // Store reminder locally for now
      const existingReminders = JSON.parse(localStorage.getItem('health-reminders') || '[]');
      existingReminders.push(reminderData);
      localStorage.setItem('health-reminders', JSON.stringify(existingReminders));
    }
    
    toast.success(
      language === 'am' 
        ? '✅ የበሽታ ሪፖርት ተቀምጧል'
        : '✅ Illness report saved successfully'
    );

    onClose();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>🚨 {language === 'am' ? 'የበሽታ ሪፖርት' : 'Illness Report'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo/Video Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center">
                📷 {language === 'am' ? 'ፎቶ እና ቪዲዮ' : 'Photos & Videos'}
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Photo Upload */}
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">
                    {language === 'am' ? 'ፎቶ ያንሱ' : 'Take Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handleMediaCapture(e, 'photo')}
                  />
                </label>

                {/* Video Upload */}
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">
                    {language === 'am' ? 'ቪዲዮ ያንሱ' : 'Record Video'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handleMediaCapture(e, 'video')}
                  />
                </label>
              </div>

              {/* Media Previews */}
              {(photosPreviews.length > 0 || videosPreviews.length > 0) && (
                <div className="grid grid-cols-3 gap-2">
                  {photosPreviews.map((preview, index) => (
                    <div key={`photo-${index}`} className="relative">
                      <img 
                        src={preview} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeMedia(index, 'photo')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {videosPreviews.map((preview, index) => (
                    <div key={`video-${index}`} className="relative">
                      <video 
                        src={preview} 
                        className="w-full h-20 object-cover rounded border"
                        controls={false}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeMedia(index, 'video')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Animal Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                🐄 {language === 'am' ? 'እንስሳ ይምረጡ' : 'Select Animal'}
              </label>
              <Select 
                value={illnessData.animalId} 
                onValueChange={(value) => {
                  const animal = animals.find(a => a.id === value);
                  setIllnessData(prev => ({
                    ...prev,
                    animalId: value,
                    animalName: animal?.name || ''
                  }));
                }}
              >
                <SelectTrigger className="text-base h-12">
                  <SelectValue placeholder={language === 'am' ? 'እንስሳ ይምረጡ...' : 'Choose an animal...'} />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} ({animal.animal_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                🩺 {language === 'am' ? 'ምልክቶች' : 'Symptoms'}
              </label>
              <Textarea
                required
                className="text-base"
                rows={3}
                placeholder={language === 'am' ? 'የተስተዋሉ ምልክቶች ይግለጹ...' : 'Describe observed symptoms...'}
                value={illnessData.symptoms}
                onChange={(e) => setIllnessData({ ...illnessData, symptoms: e.target.value })}
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                ⚠️ {language === 'am' ? 'ደረጃ' : 'Severity'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['mild', 'moderate', 'severe'].map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all touch-manipulation ${
                      illnessData.severity === severity
                        ? getSeverityColor(severity)
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setIllnessData({ ...illnessData, severity: severity as any })}
                  >
                    {language === 'am' 
                      ? (severity === 'mild' ? 'ቀላል' : severity === 'moderate' ? 'መካከለኛ' : 'ከባድ')
                      : severity.charAt(0).toUpperCase() + severity.slice(1)
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Date Observed */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {language === 'am' ? 'የተስተዋለበት ቀን' : 'Date Observed'}
              </label>
              <Input
                type="date"
                required
                className="text-base h-12"
                value={illnessData.dateObserved}
                onChange={(e) => setIllnessData({ ...illnessData, dateObserved: e.target.value })}
              />
            </div>

            {/* Treatment Section */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                💊 {language === 'am' ? 'ህክምና' : 'Treatment'}
              </h4>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  🧑‍⚕️ {language === 'am' ? 'የዶክተር ስም' : 'Vet Name'}
                </label>
                <Input
                  type="text"
                  className="text-base h-12"
                  placeholder={language === 'am' ? 'የዶክተሩ ስም...' : 'Veterinarian name...'}
                  value={illnessData.vetName}
                  onChange={(e) => setIllnessData({ ...illnessData, vetName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {language === 'am' ? 'የዶክተር ማስታወሻ' : 'Vet Notes'}
                </label>
                <Textarea
                  className="text-base"
                  rows={2}
                  placeholder={language === 'am' ? 'የዶክተሩ ማስታወሻ...' : 'Veterinarian notes...'}
                  value={illnessData.vetNotes}
                  onChange={(e) => setIllnessData({ ...illnessData, vetNotes: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Pill className="w-4 h-4 mr-1" />
                    {language === 'am' ? 'መድሃኒት' : 'Drug Name'}
                  </label>
                  <Input
                    type="text"
                    className="text-base h-12"
                    placeholder={language === 'am' ? 'መድሃኒት ስም...' : 'Drug name...'}
                    value={illnessData.drugName}
                    onChange={(e) => setIllnessData({ ...illnessData, drugName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    📏 {language === 'am' ? 'መጠን' : 'Dosage'}
                  </label>
                  <Input
                    type="text"
                    className="text-base h-12"
                    placeholder={language === 'am' ? 'መጠን...' : 'Dosage...'}
                    value={illnessData.drugDosage}
                    onChange={(e) => setIllnessData({ ...illnessData, drugDosage: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Follow-up Section */}
            <div className="bg-orange-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center">
                🔔 {language === 'am' ? 'ክትትል' : 'Follow-up'}
              </h4>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {language === 'am' ? 'የክትትል ቀን' : 'Follow-up Date'}
                </label>
                <Input
                  type="date"
                  className="text-base h-12"
                  value={illnessData.followUpDate}
                  onChange={(e) => setIllnessData({ ...illnessData, followUpDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  📝 {language === 'am' ? 'የክትትል ማስታወሻ' : 'Follow-up Notes'}
                </label>
                <Textarea
                  className="text-base"
                  rows={2}
                  placeholder={language === 'am' ? 'ተጨማሪ ክትትል ማስታወሻ...' : 'Additional follow-up notes...'}
                  value={illnessData.followUpNotes}
                  onChange={(e) => setIllnessData({ ...illnessData, followUpNotes: e.target.value })}
                />
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 h-12 text-base"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              {language === 'am' ? 'ሪፖርት አቅርብ' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
