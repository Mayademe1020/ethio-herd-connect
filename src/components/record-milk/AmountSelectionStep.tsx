import { Loader2 } from 'lucide-react';

interface Animal {
  id: string;
  animal_id?: string;
  name: string;
  type: string;
  subtype: string;
  photo_url?: string;
}

interface AmountSelectionStepProps {
  selectedCow: Animal;
  selectedAmount: number | undefined;
  isRecording: boolean;
  onAmountChange: (amount: number) => void;
  onSubmit: () => void;
}

export const AmountSelectionStep = ({
  selectedCow,
  selectedAmount,
  isRecording,
  onAmountChange,
  onSubmit,
}: AmountSelectionStepProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {selectedCow.photo_url ? (
              <img
                src={selectedCow.photo_url}
                alt={selectedCow.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="text-4xl">🐄</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{selectedCow.name}</h3>
            <p className="text-sm text-gray-600">{selectedCow.subtype || 'Cow'}</p>
            {selectedCow.animal_id && (
              <p className="text-xs text-gray-500 font-mono">ID: {selectedCow.animal_id}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">How much milk?</h2>
          <p className="text-sm text-gray-600">Enter amount in liters</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <input
            type="text"
            inputMode="decimal"
            value={selectedAmount || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                const amount = parseFloat(value);
                if (!isNaN(amount) && amount > 0 && amount <= 100) {
                  onAmountChange(amount);
                } else if (value === '') {
                  onAmountChange(undefined as any);
                }
              }
            }}
            placeholder="0.0"
            className="input-large-number w-full text-center"
            autoFocus
          />
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">L</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">Quick Select</p>
          <div className="flex justify-center gap-2">
            {[2, 5, 10, 15, 20].map((amount) => (
              <button
                key={amount}
                onClick={() => onAmountChange(amount)}
                className={`px-4 py-2 rounded-lg border-2 transition-all active:scale-95 text-sm font-medium ${
                  selectedAmount === amount
                    ? 'bg-emerald-500 border-emerald-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400'
                }`}
              >
                {amount}L
              </button>
            ))}
          </div>
        </div>

        {selectedAmount && (
          <button
            onClick={onSubmit}
            disabled={isRecording}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isRecording ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Save Record</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
