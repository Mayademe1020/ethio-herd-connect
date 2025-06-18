
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Camera, X, Upload } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';

interface IllnessReportFormProps {
  language: 'am' | 'en';
  onClose: () => void;
}

export const IllnessReportForm = ({ language, onClose }: IllnessReportFormProps) => {
  const [illnessData, setIllnessData] = useState({
    animalName: '',
    symptoms: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    dateObserved: new Date().toISOString().split('T')[0],
    photo: null as File | null
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { addToQueue } = useOfflineSync();

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIllnessData({ ...illnessData, photo: file });
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const illnessRecord = {
      id: `illness-${Date.now()}`,
      animalName: illnessData.animalName,
      symptoms: illnessData.symptoms,
      severity: illnessData.severity,
      dateObserved: illnessData.dateObserved,
      photo: photoPreview, // In real app, would upload to storage
      reportedAt: new Date().toISOString()
    };

    addToQueue('health', illnessRecord);
    
    toast.success(
      language === 'am' 
        ? '✅ የበሽታ ሪፖርት ተቀምጧል'
        : '✅ Illness report saved successfully'
    );

    onClose();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>{language === 'am' ? '🚨 የበሽታ ሪፖርት' : '🚨 Report Illness'}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Capture */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ፎቶ (አማራጭ)' : 'Photo (Optional)'}
              </label>
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Illness" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhotoPreview(null);
                        setIllnessData({ ...illnessData, photo: null });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      {language === 'am' ? 'ፎቶ ያንሱ' : 'Take Photo'}
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

            {/* Animal Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'የእንስሳው ስም' : 'Animal Name'}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder={language === 'am' ? 'ለምሳሌ: ሞላ' : 'e.g: Mola'}
                value={illnessData.animalName}
                onChange={(e) => setIllnessData({ ...illnessData, animalName: e.target.value })}
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ምልክቶች' : 'Symptoms'}
              </label>
              <textarea
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder={language === 'am' ? 'የተስተዋሉ ምልክቶች ይግለጹ...' : 'Describe observed symptoms...'}
                value={illnessData.symptoms}
                onChange={(e) => setIllnessData({ ...illnessData, symptoms: e.target.value })}
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'am' ? 'ደረጃ' : 'Severity'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['mild', 'moderate', 'severe'].map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    className={`p-2 rounded-lg border text-sm font-medium transition-all ${
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
              <label className="text-sm font-medium">
                {language === 'am' ? 'የተስተዋለበት ቀን' : 'Date Observed'}
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                value={illnessData.dateObserved}
                onChange={(e) => setIllnessData({ ...illnessData, dateObserved: e.target.value })}
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ሪፖርት አቅርብ' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
