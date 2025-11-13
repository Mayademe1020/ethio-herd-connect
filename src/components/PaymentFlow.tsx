/**
 * Payment Flow Component for Ethio Herd Connect
 * Handles posting fees and payment processing for marketplace
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useTranslations } from '@/hooks/useTranslations';
import { monetizationService, PostingFee } from '@/services/monetizationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Smartphone, Building } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface PaymentFlowProps {
  animalType: string;
  onPaymentComplete: (fee: PostingFee) => void;
  onCancel: () => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  animalType,
  onPaymentComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslations();
  const { showToast } = useToast();

  const [selectedFee, setSelectedFee] = useState<PostingFee | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const postingFees = monetizationService.getPostingFees(animalType);
  const paymentMethods = monetizationService.getPaymentMethods();

  const handlePayment = async () => {
    if (!selectedFee || !selectedPaymentMethod || !user) {
      showToast('እባክዎ ሁሉንም መረጃ ይምረጡ / Please select all required information', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment transaction
      const transaction = await monetizationService.createPostingFeePayment(
        user.id,
        selectedFee.id,
        selectedPaymentMethod as keyof typeof paymentMethods
      );

      // Process payment (simulated)
      const completedTransaction = await monetizationService.processPayment(
        transaction.id,
        { paymentMethod: selectedPaymentMethod }
      );

      showToast(
        `✅ ክፍያ ተሳክቷል! / Payment successful! Listing will be active for ${selectedFee.duration_days} days.`,
        'success'
      );

      onPaymentComplete(selectedFee);
    } catch (error) {
      console.error('Payment error:', error);
      showToast('ክፍያ አልተሳካም። እንደገና ይሞክሩ / Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'telebirr':
        return <Smartphone className="w-5 h-5" />;
      case 'cbe_bank':
      case 'dashen_bank':
      case 'awash_international':
        return <Building className="w-5 h-5" />;
      case 'mpesa':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ክፍያ ያድርጉ / Make Payment
          </h1>
          <p className="text-gray-600 mt-1">
            የገበያ ማስተያየትዎን ለማሳየት ክፍያ ያድርጉ / Pay to publish your listing
          </p>
        </div>

        {/* Step 1: Select Plan */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              የክፍያ አማራጭ ይምረጡ / Select Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedFee?.id || ''}
              onValueChange={(value) => {
                const fee = postingFees.find(f => f.id === value);
                setSelectedFee(fee || null);
              }}
              className="space-y-3"
            >
              {postingFees.map((fee) => (
                <div key={fee.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={fee.id} id={fee.id} />
                  <Label htmlFor={fee.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {fee.description}
                          {fee.is_premium && (
                            <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                              እኩል አይነት / Premium
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {fee.features.join(' • ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {fee.amount} ብር
                        </div>
                        <div className="text-sm text-gray-500">
                          {fee.duration_days} ቀናት / days
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 2: Select Payment Method */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              የክፍያ መንገድ ይምረጡ / Select Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="space-y-3"
            >
              {Object.entries(paymentMethods).map(([key, method]) => (
                <div key={key} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="flex-1 cursor-pointer flex items-center gap-3">
                    {getPaymentMethodIcon(key)}
                    <div>
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-600">
                        {key === 'telebirr' && 'ለሞባይል ገንዘብ ማስተላለፍ / Mobile money transfer'}
                        {key === 'cbe_bank' && 'የኢትዮጵያ ንግድ ባንክ / Commercial Bank of Ethiopia'}
                        {key === 'dashen_bank' && 'ዳሸን ባንክ / Dashen Bank'}
                        {key === 'awash_international' && 'አዋሽ ኢንተርናሽናል / Awash International Bank'}
                        {key === 'mpesa' && 'ኤም-ፔሳ / M-Pesa (Kenya)'}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 3: Payment Summary */}
        {selectedFee && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                የክፍያ ማጠቃለያ / Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">አገልግሎት / Service:</span>
                  <span className="font-medium">{selectedFee.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">የክፍያ መንገድ / Payment Method:</span>
                  <span className="font-medium">
                    {selectedPaymentMethod && paymentMethods[selectedPaymentMethod as keyof typeof paymentMethods]?.name}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>ጠቅላላ / Total:</span>
                    <span className="text-green-600">{selectedFee.amount} ብር</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            ይቅር / Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!selectedFee || !selectedPaymentMethod || isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                በማስተካከል ላይ... / Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ክፍያ ያድርጉ / Pay Now
              </>
            )}
          </Button>
        </div>

        {/* Ethiopian Market Context */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            💡 ስለ ኢትዮጵያ ገበያ / About Ethiopian Market
          </h4>
          <p className="text-sm text-blue-800">
            እነዚህ ክፍያዎች ከልምዱ አከባበር ክፍያዎች ያነሰ ናቸው። በተለመደው ገበያ ላይ እንስሳ ለመሸጥ አከባበሮች ከ5-10% ክፍያ ያስቀማሉ።
            <br /><br />
            These fees are much lower than traditional broker fees. In regular markets, brokers charge 5-10% commission to sell animals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;