/**
 * VerifyAnimalForSaleModal
 * Verifies the seller has the animal by scanning muzzle before allowing to mark as sold.
 */

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, ShieldCheck, AlertTriangle, ArrowRight, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { muzzleMLService } from '@/services/muzzleMLService';
import { getAllMuzzleEmbeddings } from '@/utils/muzzleIndexedDB';
import { compressImage } from '@/utils/imageOptimization';

interface VerifyAnimalForSaleModalProps {
  open: boolean;
  onClose: () => void;
  animalId: string;
  animalName?: string;
  onVerifySuccess: () => void;
}

type Step = 'scan_muzzle' | 'success';

export const VerifyAnimalForSaleModal: React.FC<VerifyAnimalForSaleModalProps> = ({
  open,
  onClose,
  animalId,
  animalName,
  onVerifySuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('scan_muzzle');
  const [muzzleFile, setMuzzleFile] = useState<File | null>(null);
  const [muzzlePreview, setMuzzlePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('scan_muzzle');
    setMuzzleFile(null);
    setMuzzlePreview(null);
    setIsProcessing(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleMuzzleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    try {
      const result = await compressImage(file, undefined, undefined, 100);
      const compressedFile = new File([result.blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMuzzlePreview(reader.result as string);
        setMuzzleFile(compressedFile);
        setError(null);
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      setError('Photo optimization failed');
    }
  };

  const handleVerify = async () => {
    if (!muzzleFile || !user) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Extract features from the muzzle scan
      toast.info('🔐 Verifying muzzle...');
      const extractionResult = await muzzleMLService.extractFeatures(muzzleFile);

      // 2. Check the scanned muzzle matches this animal's registered muzzle
      const storedEmbeddings = await getAllMuzzleEmbeddings(user.id);
      const animalEmbedding = storedEmbeddings.find(e => e.animalId === animalId);

      if (!animalEmbedding) {
        setError('No muzzle registered for this animal. Please register a muzzle first from the animal details.');
        setIsProcessing(false);
        return;
      }

      // Cosine similarity check
      const similarity = cosineSimilarity(extractionResult.embedding.vector, animalEmbedding.embedding);
      if (similarity < 0.85) {
        setError(`Muzzle does not match (${(similarity * 100).toFixed(0)}% similarity). Please scan the correct animal.`);
        setIsProcessing(false);
        return;
      }

      // 3. Success
      toast.success('Muzzle verified! You can now mark this animal as sold.');
      setStep('success');
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verify Animal Possession
          </DialogTitle>
          <DialogDescription>
            Scan the animal's muzzle to verify you have it before marking as sold.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Scan muzzle */}
        {step === 'scan_muzzle' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Point the camera at the animal's muzzle to capture a clear image.
            </p>

            {muzzlePreview ? (
              <div className="relative border-2 border-green-500 rounded-lg overflow-hidden">
                <img src={muzzlePreview} alt="Muzzle" className="w-full h-48 object-cover" />
                <button
                  onClick={() => { setMuzzleFile(null); setMuzzlePreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  <X className="h-3 w-3" /> Retake
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary"
              >
                <Camera className="w-10 h-10 text-gray-400" />
                <p className="text-sm font-medium">Tap to scan muzzle</p>
              </button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleMuzzleSelect} className="hidden" />

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button onClick={handleVerify} disabled={!muzzleFile || isProcessing} className="flex-1">
                {isProcessing ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Success */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="font-bold text-lg">Verification Complete</h3>
            <p className="text-sm text-muted-foreground">
              Muzzle verified. You can now safely mark this animal as sold.
            </p>
            <Button onClick={async () => {
              handleClose();
              onVerifySuccess();
            }} className="w-full">
              Mark as Sold
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export default VerifyAnimalForSaleModal;
