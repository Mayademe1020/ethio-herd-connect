import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, AlertCircle, CheckCircle, Loader2, Stethoscope } from 'lucide-react';
import { diagnoseDisease, DiagnosisResult } from '@/services/aiDiagnosisService';
import { cn } from '@/lib/utils';

interface AiDiagnosisDialogProps {
  animalId: string;
  animalName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveToRecords?: (diagnosis: DiagnosisResult, imageFile: File) => void;
}

export function AiDiagnosisDialog({
  animalId,
  animalName,
  open,
  onOpenChange,
  onSaveToRecords
}: AiDiagnosisDialogProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large. Maximum size is 5MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await diagnoseDisease(selectedImage);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToRecords = () => {
    if (diagnosis && selectedImage && onSaveToRecords) {
      onSaveToRecords(diagnosis, selectedImage);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setDiagnosis(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            AI Disease Diagnosis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Animal Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Animal:</span> {animalName} ({animalId})
            </p>
          </div>

          {/* Image Upload */}
          {!selectedImage && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">Click to upload or take photo</p>
                <p className="text-sm text-gray-400 mt-1">Supports: JPG, PNG, WebP (max 5MB)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <strong>Tips for best results:</strong>
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-5 list-disc">
                  <li>Take photo in good lighting</li>
                  <li>Focus on affected area or lesions</li>
                  <li>Include full body view if possible</li>
                  <li>Ensure image is clear and not blurry</li>
                </ul>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && !diagnosis && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Selected"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ×
                </button>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Analyze Image
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Diagnosis Results */}
          {diagnosis && (
            <div className="space-y-4">
              {/* Main Result */}
              <Card className={cn(
                "p-4",
                diagnosis.severity === 'high' ? "bg-red-50 border-red-200" :
                diagnosis.severity === 'medium' ? "bg-yellow-50 border-yellow-200" :
                "bg-green-50 border-green-200"
              )}>
                <div className="flex items-start gap-3">
                  {diagnosis.disease === 'Healthy' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {diagnosis.disease}
                    </h3>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Confidence:</span>
                        <span className="font-semibold">{diagnosis.confidence.toFixed(1)}%</span>
                      </div>
                      <Progress value={diagnosis.confidence} className="h-2" />
                    </div>
                    
                    {diagnosis.shouldSeeVet && (
                      <div className="mt-3 p-2 bg-red-100 rounded text-red-800 text-sm font-medium">
                        ⚠️ Recommendation: Consult a veterinarian
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* All Predictions */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Other Possibilities:</h4>
                <div className="space-y-2">
                   {diagnosis.allPredictions.slice(1, 4).map((pred, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-24 font-medium">{pred.disease}</div>
                      <Progress value={pred.confidence} className="flex-1 h-1.5" />
                      <div className="w-12 text-right text-gray-500">
                        {pred.confidence.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {diagnosis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveToRecords}
                  variant="default"
                  className="flex-1"
                >
                  Save to Health Records
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                >
                  Analyze Another
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center">
                ⚠️ This is an AI-assisted diagnosis. Always consult a veterinarian for accurate diagnosis and treatment.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
