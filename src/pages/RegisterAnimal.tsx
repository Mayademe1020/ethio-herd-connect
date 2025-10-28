// src/pages/RegisterAnimal.tsx - MVP Animal Registration with 3-step flow

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimalTypeSelector, AnimalType } from '@/components/AnimalTypeSelector';
import { AnimalSubtypeSelector } from '@/components/AnimalSubtypeSelector';
import { useAnimalRegistration } from '@/hooks/useAnimalRegistration';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageCompression';

type Step = 1 | 2 | 3;

const RegisterAnimal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerAnimal, isRegistering } = useAnimalRegistration();
  
  // Form state
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<AnimalType | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [animalName, setAnimalName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle type selection
  const handleTypeSelect = (type: AnimalType) => {
    setSelectedType(type);
    setSelectedSubtype(null); // Reset subtype when type changes
  };

  // Handle subtype selection
  const handleSubtypeSelect = (subtype: string) => {
    setSelectedSubtype(subtype);
  };

  // Auto-advance when type is selected
  useEffect(() => {
    if (step === 1 && selectedType) {
      setTimeout(() => setStep(2), 300); // Small delay for UX
    }
  }, [selectedType, step]);

  // Auto-advance when subtype is selected
  useEffect(() => {
    if (step === 2 && selectedSubtype) {
      setTimeout(() => setStep(3), 300);
    }
  }, [selectedSubtype, step]);

  // Handle photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('❌ ልክ ያልሆነ ፋይል / Invalid file', {
        description: 'Please choose an image file'
      });
      return;
    }

    try {
      // Compress image to <500KB
      toast.info('📸 በማመቻቸት ላይ... / Optimizing photo...');
      const compressedBlob = await compressImage(file, 500);
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      setPhotoFile(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Show success message with size info
      const originalSizeKB = (file.size / 1024).toFixed(0);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);
      toast.success(`✓ ፎቶ ተዘጋጅቷል / Photo ready (${originalSizeKB}KB → ${compressedSizeKB}KB)`);
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('❌ ፎቶ ማመቻቸት አልተሳካም / Photo optimization failed', {
        description: 'Please try another photo'
      });
    }
  };

  // Upload photo to Supabase Storage
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;

    try {
      setIsUploadingPhoto(true);
      
      // Generate unique filename
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('animal-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Photo upload error:', error);
        toast.warning('⚠️ ፎቶ መስቀል አልተሳካም / Photo upload failed', {
          description: 'Animal will be registered without photo'
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedType || !selectedSubtype) {
      toast.error('❌ ስህተት / Error', {
        description: 'Please select animal type and subtype'
      });
      return;
    }

    try {
      // Upload photo if selected
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      // Register animal
      const result = await registerAnimal({
        type: selectedType,
        subtype: selectedSubtype,
        name: animalName.trim() || undefined,
        photo_url: photoUrl || undefined
      });

      if (result.success) {
        // Navigate to animal detail or home
        navigate('/my-animals');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (step === 1 && selectedType) {
      setStep(2);
    } else if (step === 2 && selectedSubtype) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate('/');
    }
  };

  const handleSkipName = () => {
    handleSubmit();
  };

  // Check if can proceed to next step
  const canProceed = () => {
    if (step === 1) return selectedType !== null;
    if (step === 2) return selectedSubtype !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <BackButton label="ተመለስ / Back" />

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            እንስሳ ይመዝግቡ / Register Animal
          </h1>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={step >= 1 ? 'font-bold text-primary' : ''}>
              Step 1
            </span>
            <span>→</span>
            <span className={step >= 2 ? 'font-bold text-primary' : ''}>
              Step 2
            </span>
            <span>→</span>
            <span className={step >= 3 ? 'font-bold text-primary' : ''}>
              Step 3
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                የእንስሳ አይነት ይምረጡ / Select Animal Type
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the type of animal you want to register
              </p>
              
              <AnimalTypeSelector
                selectedType={selectedType}
                onSelectType={handleTypeSelect}
              />
            </div>
          )}

          {/* Step 2: Select Subtype */}
          {step === 2 && selectedType && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                ዝርያ ይምረጡ / Select Subtype
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the specific type
              </p>
              
              <AnimalSubtypeSelector
                animalType={selectedType}
                selectedSubtype={selectedSubtype}
                onSelectSubtype={handleSubtypeSelect}
              />
            </div>
          )}

          {/* Step 3: Name and Photo (Optional) */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                ስም እና ፎቶ / Name & Photo
              </h2>
              <p className="text-gray-600 mb-6">
                Add a name and photo (optional - you can skip)
              </p>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  የእንስሳ ስም / Animal Name (Optional)
                </label>
                <Input
                  type="text"
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                  placeholder="e.g., Chaltu, Beza, Abebe"
                  className="text-lg h-12"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to auto-generate a name
                </p>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ፎቶ / Photo (Optional)
                </label>
                
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="font-medium text-gray-700">
                        ፎቶ ይምረጡ / Choose Photo
                      </p>
                      <p className="text-sm text-gray-500">
                        Tap to select from gallery or camera
                      </p>
                    </div>
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-14 text-lg font-bold"
              size="lg"
            >
              ቀጣይ / Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSkipName}
                disabled={isRegistering || isUploadingPhoto}
                variant="outline"
                className="flex-1 h-14 text-lg font-bold"
                size="lg"
              >
                {isRegistering || isUploadingPhoto ? 'በመስራት ላይ...' : 'ዝለል / Skip'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isRegistering || isUploadingPhoto}
                className="flex-1 h-14 text-lg font-bold"
                size="lg"
              >
                {isRegistering || isUploadingPhoto ? (
                  'በመስራት ላይ...'
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    መዝግብ / Register
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterAnimal;
