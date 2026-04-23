// src/pages/RegisterAnimal.tsx - Simple 3-click animal registration

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimalTypeSelector, AnimalType } from '@/components/AnimalTypeSelector';
import { AnimalSubtypeSelector } from '@/components/AnimalSubtypeSelector';
import { useAnimalRegistration } from '@/hooks/useAnimalRegistration';
import { BackButton } from '@/components/BackButton';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageOptimization';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAnimalFormDefaults } from '@/hooks/useAnimalFormDefaults';
import { VoiceInputButton } from '@/components/VoiceInputButton';
import { muzzleMLService } from '@/services/muzzleMLService';
import { muzzleLocalMLService } from '@/services/muzzleLocalMLService';
import { storeMuzzleEmbedding } from '@/utils/muzzleIndexedDB';

type Step = 1 | 2 | 3 | 4;

const RegisterAnimal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerAnimal, isRegistering } = useAnimalRegistration();
  const { trackFormSubmit, trackButtonClick } = useAnalytics();
  const { defaults, saveDefaults, getSuggestedName } = useAnimalFormDefaults();

  // Simple 3-step form state
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<AnimalType | null>(defaults.lastAnimalType as AnimalType || null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(defaults.lastSubtype);
  const [animalName, setAnimalName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Muzzle state
  const [muzzleFile, setMuzzleFile] = useState<File | null>(null);
  const [muzzlePreview, setMuzzlePreview] = useState<string | null>(null);
  const [isRegisteringMuzzle, setIsRegisteringMuzzle] = useState(false);
  const [registeredAnimalId, setRegisteredAnimalId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const muzzleFileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill name when type changes
  useEffect(() => {
    if (selectedType && !animalName) {
      const suggested = getSuggestedName(selectedType);
      if (suggested) {
        setAnimalName(suggested);
      }
    }
  }, [selectedType]);

  // Handle type selection - auto-advance to step 2
  const handleTypeSelect = (type: AnimalType) => {
    setSelectedType(type);
    setSelectedSubtype(null); // Reset subtype when type changes
    trackButtonClick(`animal_type_${type}`, 'registration');
    setTimeout(() => setStep(2), 300); // Auto-advance
  };

  // Handle subtype selection - auto-advance to step 3
  const handleSubtypeSelect = (subtype: string) => {
    setSelectedSubtype(subtype);
    setTimeout(() => setStep(3), 300); // Auto-advance
  };

  // Handle photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file - please choose an image');
      return;
    }

    try {
      // Compress image to target 100KB
      toast.info('Optimizing photo...');
      const result = await compressImage(file, undefined, undefined, 100);
      const compressedFile = new File([result.blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setPhotoPreview(previewUrl);
        setPhotoFile(compressedFile);

        const originalSizeKB = (file.size / 1024).toFixed(0);
        const compressedSizeKB = (result.compressedSize / 1024).toFixed(0);
        toast.success(`Photo ready (${originalSizeKB}KB -> ${compressedSizeKB}KB)`);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('Photo optimization failed');
    }
  };

  // Upload photo to Supabase Storage
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;

    try {
      setIsUploadingPhoto(true);
      toast.info('Uploading photo...');

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
        toast.warning('Photo upload failed - animal will be registered without photo');
        return null;
      }

      trackButtonClick('photo_upload', 'registration');
      toast.success('Photo uploaded successfully');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Photo upload failed');
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedType || !selectedSubtype) {
      toast.error('Please select animal type and subtype');
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
        trackFormSubmit('animal_registration');
        
        // Save defaults for next time
        saveDefaults({
          lastAnimalType: selectedType,
          lastSubtype: selectedSubtype,
          lastNamePrefix: animalName.trim() || selectedType || '',
        });
        
        toast.success('Animal registered successfully');

        // Store animal ID for muzzle registration, move to step 4
        if (result.id) {
          setRegisteredAnimalId(result.id);
          setStep(4);
        } else {
          navigate('/my-animals');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Handle muzzle photo selection
  const handleMuzzleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file - please choose an image');
      return;
    }
    try {
      const result = await compressImage(file, undefined, undefined, 100);
      const compressedFile = new File([result.blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMuzzlePreview(reader.result as string);
        setMuzzleFile(compressedFile);
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      toast.error('Photo optimization failed');
    }
  };

  // Register muzzle biometric for the animal - offline-first approach
  const handleRegisterMuzzle = async () => {
    if (!muzzleFile || !registeredAnimalId || !user) return;
    setIsRegisteringMuzzle(true);
    
    try {
      toast.info('Extracting muzzle biometric...');
      let embedding = null;
      let isLocal = false;

      // Try local ML first (works offline on 2GB RAM phones)
      if (muzzleLocalMLService.isAvailable()) {
        try {
          // Convert File to ImageBitmap for local ML
          const img = await createImageBitmap(muzzleFile);
          const localResult = await muzzleLocalMLService.extractFeatures(img);
          embedding = localResult.embedding;
          isLocal = true;
          toast.success('Local ML: Muzzle captured offline');
        } catch (localError) {
          console.warn('Local ML failed, trying cloud:', localError);
        }
      }

      // Fallback to cloud if local not available or failed
      if (!embedding) {
        try {
          const cloudResult = await muzzleMLService.extractFeatures(muzzleFile);
          embedding = cloudResult.embedding;
          isLocal = false;
          toast.success('Cloud ML: Muzzle captured');
        } catch (cloudError) {
          console.error('Cloud ML also failed:', cloudError);
          throw new Error('Both local and cloud ML failed');
        }
      }

      if (!embedding) {
        throw new Error('Could not extract embedding from any source');
      }

      // Store embedding in IndexedDB
      await storeMuzzleEmbedding(
        registeredAnimalId,
        embedding.vector || embedding,
        0.7, // Default quality score
        user.id,
        isLocal
      );

      // Update animal muzzle status in DB
      await supabase.from('animals').update({ muzzle_status: 'registered' } as any).eq('id', registeredAnimalId);
      toast.success(`Muzzle registered ${isLocal ? '(offline)' : '(cloud)'}`);
      navigate('/my-animals');
    } catch (error) {
      console.error('Muzzle registration failed:', error);
      toast.error('Muzzle registration failed - you can register later from animal details');
      navigate('/my-animals');
    } finally {
      setIsRegisteringMuzzle(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === 4) {
      // From muzzle step, go to animals list (animal already registered)
      navigate('/my-animals');
    } else if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate('/');
    }
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
          <div
            className="inline-flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all rounded-lg border"
            onClick={handleBack}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-700">Back</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Register Animal
          </h1>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className={step >= 1 ? 'font-bold text-primary' : ''}>
              Step 1: Type
            </span>
            <span>-&gt;</span>
            <span className={step >= 2 ? 'font-bold text-primary' : ''}>
              Step 2: Subtype
            </span>
            <span>-&gt;</span>
            <span className={step >= 3 ? 'font-bold text-primary' : ''}>
              Step 3: Name & Photo
            </span>
            <span>-&gt;</span>
            <span className={step >= 4 ? 'font-bold text-primary' : ''}>
              Step 4: Muzzle ID
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                Select Animal Type
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
                Select Subtype
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

          {/* Step 3: Name and Photo */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                Name & Photo
              </h2>
              <p className="text-gray-600 mb-6">
                Add a name and photo (optional - you can skip)
              </p>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Name (Optional)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={animalName}
                    onChange={(e) => setAnimalName(e.target.value)}
                    placeholder="e.g., Chaltu, Beza, Abebe"
                    className="text-lg h-12 flex-1"
                    maxLength={50}
                  />
                  <VoiceInputButton
                    onResult={(text) => setAnimalName(text)}
                    language="am"
                    size="lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to auto-generate a name, or tap mic to use voice
                </p>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (Optional)
                </label>

                {photoPreview ? (
                  <div className="relative border-2 border-green-500 rounded-lg overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Animal Preview"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Photo Ready
                    </div>
                    <button
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                        toast.info('Photo removed');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 font-bold shadow-lg"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="font-medium text-gray-700">
                        Choose Photo
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
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {photoPreview && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Photo selected and ready
                  </p>
                )}
</div>
            </div>
          )}
        </div>

        {/* Step 4: Muzzle Registration - REQUIRED */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Theft Protection - REQUIRED
              </h2>
            </div>
            <p className="text-gray-600 mb-2">
              Your animal's muzzle is like a fingerprint - unique and permanent. 
              <strong> This protects your animal if it is ever lost or stolen.</strong>
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600 mb-6">
              <ShieldCheck className="h-4 w-4" />
              <span>Offline-capable - works even without internet</span>
            </div>

            {/* Warning if no muzzle captured */}
            {!muzzlePreview && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-medium">
                  Muzzle capture is required to protect your animal from theft.
                </p>
              </div>
            )}

            {muzzlePreview ? (
              <div className="relative border-2 border-green-500 rounded-lg overflow-hidden mb-4">
                <img src={muzzlePreview} alt="Muzzle Preview" className="w-full h-64 object-cover" />
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  Muzzle Captured
                </div>
                <button
                  onClick={() => { setMuzzleFile(null); setMuzzlePreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 font-bold shadow-lg"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => muzzleFileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-gray-50 transition-colors mb-4"
              >
                <Camera className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="font-medium text-gray-700">Capture Muzzle Close-up</p>
                  <p className="text-sm text-gray-500">Position camera 30-50cm from the nose</p>
                </div>
              </button>
            )}

            <input
              ref={muzzleFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleMuzzleSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {step < 3 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
              className="flex-1 h-14 text-lg font-bold"
            >
              Next
            </Button>
          ) : step === 3 ? (
            <Button
              onClick={handleSubmit}
              disabled={isRegistering || isUploadingPhoto}
              className="flex-1 h-14 text-lg font-bold"
            >
              {isRegistering || isUploadingPhoto ? (
                'Registering...'
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Register
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate('/my-animals')}
                disabled={!muzzlePreview}
                className="flex-1 h-14 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {muzzlePreview ? 'Skip for Now' : '⚠️ Muzzle Required'}
              </Button>
              <Button
                onClick={handleRegisterMuzzle}
                disabled={!muzzleFile || isRegisteringMuzzle}
                className="flex-1 h-14 text-lg font-bold"
              >
                {isRegisteringMuzzle ? (
                  'Processing...'
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Register Muzzle
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