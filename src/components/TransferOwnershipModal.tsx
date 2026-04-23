/**
 * TransferOwnershipModal
 * 2-step ownership transfer flow:
 *   1. Enter buyer's phone number
 *   2. Scan muzzle to verify physical possession
 * On successful verification, ownership transfers to the buyer.
 */

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, ShieldCheck, AlertTriangle, ArrowRight, Phone, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { muzzleMLService } from '@/services/muzzleMLService';
import { getAllMuzzleEmbeddings } from '@/utils/muzzleIndexedDB';
import { compressImage } from '@/utils/imageOptimization';

interface TransferOwnershipModalProps {
  open: boolean;
  onClose: () => void;
  animalId: string;
  animalName?: string;
  onTransferComplete: () => void;
}

type Step = 'enter_phone' | 'scan_muzzle' | 'success';

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  open,
  onClose,
  animalId,
  animalName,
  onTransferComplete,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('enter_phone');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [muzzleFile, setMuzzleFile] = useState<File | null>(null);
  const [muzzlePreview, setMuzzlePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('enter_phone');
    setBuyerPhone('');
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

  const handleVerifyAndTransfer = async () => {
    if (!muzzleFile || !user || !buyerPhone.trim()) return;
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
        setError('No muzzle registered for this animal. Register a muzzle first before transferring.');
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

      // 3. Look up buyer by phone
      const normalizedPhone = buyerPhone.replace(/\D/g, '');
      const { data: buyerProfile, error: buyerError } = await supabase
        .from('farm_profiles')
        .select('user_id, farm_name')
        .or(`phone.eq.${normalizedPhone},phone.eq.+251${normalizedPhone.slice(-9)}`)
        .maybeSingle();

      if (buyerError || !buyerProfile) {
        setError('Buyer not found. They must be a registered user.');
        setIsProcessing(false);
        return;
      }

      if (buyerProfile.user_id === user.id) {
        setError('Cannot transfer to yourself.');
        setIsProcessing(false);
        return;
      }

      // 4. Create ownership transfer record
      const { error: transferError } = await supabase
        .from('ownership_transfers')
        .insert({
          animal_id: animalId,
          from_user_id: user.id,
          to_user_id: buyerProfile.user_id,
          status: 'completed',
          muzzle_verified: true,
          verification_confidence: similarity,
          confirmed_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

      if (transferError) {
        setError(`Transfer failed: ${transferError.message}`);
        setIsProcessing(false);
        return;
      }

      // 5. Update animal owner
      await supabase
        .from('animals')
        .update({ user_id: buyerProfile.user_id } as any)
        .eq('id', animalId);

      // 6. Notify buyer
      await supabase.from('notifications').insert({
        user_id: buyerProfile.user_id,
        type: 'ownership_transfer',
        title: 'Animal Ownership Transferred',
        message: `${user.email || 'A farmer'} has transferred ${animalName || 'an animal'} to you. Muzzle verified.`,
        data: { animal_id: animalId, from_user_id: user.id },
      } as any);

      toast.success('Ownership transferred successfully!');
      setStep('success');
    } catch (err) {
      console.error('Transfer failed:', err);
      setError('Transfer failed. Please try again.');
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
            Transfer Ownership
          </DialogTitle>
          <DialogDescription>
            {animalName ? `Transfer "${animalName}"` : 'Transfer this animal'} to another farmer
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Enter buyer phone */}
        {step === 'enter_phone' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buyer's Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="e.g., 0911234567"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The buyer must be a registered user
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() => setStep('scan_muzzle')}
                disabled={!buyerPhone.trim()}
                className="flex-1"
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Scan muzzle */}
        {step === 'scan_muzzle' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan the animal's muzzle to verify you physically have it. This protects both parties.
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
              <Button variant="outline" onClick={() => setStep('enter_phone')} className="flex-1">Back</Button>
              <Button onClick={handleVerifyAndTransfer} disabled={!muzzleFile || isProcessing} className="flex-1">
                {isProcessing ? 'Verifying...' : 'Verify & Transfer'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="font-bold text-lg">Transfer Complete</h3>
            <p className="text-sm text-muted-foreground">
              {animalName || 'The animal'} has been transferred to the buyer.
              They have been notified.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Muzzle verified — encrypted record stored
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
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

export default TransferOwnershipModal;
