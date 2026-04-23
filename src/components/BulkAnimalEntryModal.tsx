// src/components/BulkAnimalEntryModal.tsx - Bulk animal entry for farmers

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';

interface BulkAnimalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AnimalType = 'cattle' | 'goat' | 'sheep';

const ANIMAL_TYPES: { value: AnimalType; label: string; emoji: string }[] = [
  { value: 'cattle', label: 'Cow / ላም', emoji: '🐄' },
  { value: 'goat', label: 'Goat / ፍድም', emoji: '🐐' },
  { value: 'sheep', label: 'Sheep / በጃ', emoji: '🐑' },
];

export function BulkAnimalEntryModal({ isOpen, onClose, onSuccess }: BulkAnimalEntryModalProps) {
  const { user } = useAuth();
  const [animalType, setAnimalType] = useState<AnimalType | null>(null);
  const [quantity, setQuantity] = useState(3);
  const [baseName, setBaseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user || !animalType) return;
    
    setIsLoading(true);
    try {
      const animals = [];
      const animalNames: Record<AnimalType, string> = {
        cattle: baseName || 'Cow',
        goat: baseName || 'Goat',
        sheep: baseName || 'Sheep',
      };

      for (let i = 1; i <= quantity; i++) {
        animals.push({
          owner_id: user.id,
          name: `${animalNames[animalType]} ${i}`,
          type: animalType,
          is_active: true,
          status: 'healthy',
        });
      }

      const { data, error } = await supabase
        .from('animals')
        .insert(animals)
        .select();

      if (error) throw error;

      toast.success(`✓ ${quantity} ${animalType === 'cattle' ? 'cows' : animalType === 'goat' ? 'goats' : 'sheep'} added!`, {
        description: 'ተመዝግበዋል / Registered successfully'
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Bulk registration error:', error);
      toast.error('ስህተት / Error', {
        description: error.message || 'Failed to register animals'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAnimalType(null);
    setQuantity(3);
    setBaseName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            🐄 Add Multiple Animals
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Animal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Type / እንስስ ይምረጡ
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ANIMAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAnimalType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    animalType === type.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl block mb-1">{type.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How many? / ስንት?
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-700 hover:border-emerald-500"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-bold text-gray-900">{quantity}</span>
              </div>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl font-bold text-gray-700 hover:border-emerald-500"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Max 10 at a time (በአንድ ጊዜ ከ10 በታች)
            </p>
          </div>

          {/* Base Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (optional) / ስም (አማራጭ)
            </label>
            <input
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder={animalType ? `${ANIMAL_TYPES.find(t => t.value === animalType)?.label.split(' / ')[0]}` : 'e.g. Farm'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Animals will be named: "{baseName || animalType || 'Animal'} 1", "{baseName || animalType || 'Animal'} 2", etc.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={!animalType || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              animalType && !isLoading
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ minHeight: '56px' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                እየመዘገብን ነው / Registering...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add {quantity} {animalType === 'cattle' ? 'Cows' : animalType === 'goat' ? 'Goats' : 'Sheep'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkAnimalEntryModal;
