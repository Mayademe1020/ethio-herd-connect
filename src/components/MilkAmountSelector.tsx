// src/components/MilkAmountSelector.tsx
// Component for entering milk amount with manual input as primary method

import { useState } from 'react';

interface MilkAmountSelectorProps {
  onAmountSelected: (amount: number) => void;
  selectedAmount?: number;
}

const QUICK_AMOUNTS = [2, 3, 5, 7, 10]; // liters - optional quick selections

export const MilkAmountSelector = ({ onAmountSelected, selectedAmount }: MilkAmountSelectorProps) => {
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleQuickAmountClick = (amount: number) => {
    setCustomAmount(amount.toString());
    onAmountSelected(amount);
  };

  const handleCustomInputChange = (value: string) => {
    // Allow only positive numbers and decimal point (no negative sign)
    // This regex ensures no negative numbers can be entered
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      
      // Auto-submit when valid amount is entered
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0 && amount <= 100) {
        onAmountSelected(amount);
      }
    }
  };

  const handleInputBlur = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0 && amount <= 100) {
      onAmountSelected(amount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800">
          ምን ያህል ወተት? / How much milk?
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          በሊትር / In liters
        </p>
      </div>

      {/* PRIMARY: Manual Input Field - ALWAYS VISIBLE */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
        <label className="block">
          <span className="text-base font-semibold text-gray-800 mb-3 block text-center">
            መጠን ያስገቡ / Enter Amount
          </span>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              onBlur={handleInputBlur}
              placeholder="0.0"
              className="flex-1 px-6 py-4 text-3xl font-bold text-center border-3 border-blue-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-inner"
              autoFocus
            />
            <div className="flex items-center justify-center px-4 py-4 bg-blue-500 text-white rounded-xl shadow-md min-w-[60px]">
              <span className="text-2xl font-bold">L</span>
            </div>
          </div>
        </label>

        {/* Validation Messages */}
        <div className="mt-3 text-center">
          {customAmount && parseFloat(customAmount) > 100 && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Maximum: 100 liters
            </p>
          )}
          {customAmount && parseFloat(customAmount) <= 0 && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Amount must be greater than 0
            </p>
          )}
          {customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) <= 100 && (
            <p className="text-sm text-green-600 font-medium">
              ✓ Valid amount
            </p>
          )}
          {!customAmount && (
            <p className="text-xs text-gray-500">
              Enter any amount between 0.1 and 100 liters
            </p>
          )}
        </div>
      </div>

      {/* SECONDARY: Quick Selection Buttons - Optional */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 text-center font-medium">
          ወይም ፈጣን ምርጫ / Or Quick Select
        </p>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAmountClick(amount)}
              className={`
                p-3 rounded-lg border-2 transition-all active:scale-95
                ${customAmount === amount.toString()
                  ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                }
              `}
            >
              <div className="text-2xl font-bold">{amount}</div>
              <div className="text-xs opacity-75">L</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Amount Confirmation */}
      {selectedAmount && selectedAmount > 0 && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 text-center shadow-md">
          <div className="text-sm text-green-700 font-medium mb-1">
            ✓ የተመረጠው መጠን / Selected Amount
          </div>
          <div className="text-4xl font-bold text-green-600">
            {selectedAmount} L
          </div>
        </div>
      )}
    </div>
  );
};

export default MilkAmountSelector;
