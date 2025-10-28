// src/components/MilkAmountSelector.tsx
// Component for selecting milk amount with quick buttons and custom input

import { useState } from 'react';

interface MilkAmountSelectorProps {
  onAmountSelected: (amount: number) => void;
  selectedAmount?: number;
}

const QUICK_AMOUNTS = [2, 3, 5, 7, 10]; // liters

export const MilkAmountSelector = ({ onAmountSelected, selectedAmount }: MilkAmountSelectorProps) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleQuickAmountClick = (amount: number) => {
    setShowCustomInput(false);
    setCustomAmount('');
    onAmountSelected(amount);
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0 && amount <= 100) {
      onAmountSelected(amount);
      setShowCustomInput(false);
    }
  };

  const handleCustomInputChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800">
          ምን ያህል ወተት? / How much milk?
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          በሊትር / In liters
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickAmountClick(amount)}
            className={`
              p-6 rounded-lg border-2 transition-all active:scale-95
              ${selectedAmount === amount
                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <div className="text-4xl font-bold mb-1">{amount}</div>
            <div className="text-sm opacity-90">Liters</div>
          </button>
        ))}

        {/* Custom Amount Button */}
        <button
          onClick={() => setShowCustomInput(true)}
          className={`
            p-6 rounded-lg border-2 transition-all active:scale-95
            ${showCustomInput
              ? 'bg-purple-500 border-purple-600 text-white shadow-lg scale-105'
              : 'bg-white border-gray-300 text-gray-800 hover:border-purple-400 hover:bg-purple-50'
            }
          `}
        >
          <div className="text-3xl font-bold mb-1">✏️</div>
          <div className="text-sm opacity-90">Custom</div>
          <div className="text-xs opacity-75 mt-1">ሌላ</div>
        </button>
      </div>

      {/* Custom Amount Input */}
      {showCustomInput && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              ብጁ መጠን ያስገቡ / Enter custom amount
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={customAmount}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-4 py-3 text-2xl font-bold text-center border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <div className="flex items-center px-3 bg-white border-2 border-purple-300 rounded-lg">
                <span className="text-lg font-medium text-gray-700">L</span>
              </div>
            </div>
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomAmount('');
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              ሰርዝ / Cancel
            </button>
            <button
              onClick={handleCustomAmountSubmit}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              አረጋግጥ / Confirm
            </button>
          </div>

          <p className="text-xs text-gray-600 text-center">
            Maximum: 100 liters
          </p>
        </div>
      )}

      {/* Selected Amount Display */}
      {selectedAmount && !showCustomInput && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">
            የተመረጠው መጠን / Selected amount
          </div>
          <div className="text-3xl font-bold text-green-600">
            {selectedAmount} L
          </div>
        </div>
      )}
    </div>
  );
};

export default MilkAmountSelector;
