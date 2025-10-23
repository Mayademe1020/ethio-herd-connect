import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Check } from 'lucide-react';

export const AccountRecovery: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const { t } = useTranslations();

  // Handle sending recovery code
  const handleSendRecoveryCode = async () => {
    setIsLoading(true);
    try {
      if (!phone) {
        showError(
          t('recovery.missingPhone', 'Phone Required'),
          t('recovery.enterPhone', 'Please enter your phone number')
        );
        setIsLoading(false);
        return;
      }
      
      // Simulate SMS code sending (would integrate with actual SMS service)
      setTimeout(() => {
        showSuccess(
          t('recovery.codeSent', 'Recovery Code Sent'),
          t('recovery.checkPhone', 'Check your phone for the recovery code')
        );
        setRecoveryStep(2);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      showError(
        t('recovery.sendFailed', 'Failed to Send Code'),
        t('recovery.tryAgain', 'Please check your information and try again')
      );
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      if (verificationCode.length !== 6) {
        showError(
          t('recovery.invalidCode', 'Invalid Code'),
          t('recovery.enterFullCode', 'Please enter the complete 6-digit code')
        );
        setIsLoading(false);
        return;
      }
      
      // Simulate verification (would integrate with actual verification)
      setTimeout(() => {
        showSuccess(
          t('recovery.verified', 'Verification Successful'),
          t('recovery.accountRecovered', 'Your account has been recovered')
        );
        setRecoveryStep(3);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      showError(
        t('recovery.verificationFailed', 'Verification Failed'),
        t('recovery.incorrectCode', 'The code you entered is incorrect')
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('recovery.title', 'Account Recovery')}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {recoveryStep === 1 && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <ol className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</div>
                  <span>{t('recovery.step1', 'Enter your phone number')}</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</div>
                  <span>{t('recovery.step2', 'Receive a verification code')}</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</div>
                  <span>{t('recovery.step3', 'Enter the code to recover your account')}</span>
                </li>
              </ol>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <Phone className="h-4 w-4 inline mr-2" />
                {t('recovery.phoneNumber', 'Phone Number')}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 234 5678"
                className="text-lg py-6"
              />
            </div>
          </div>
        )}
        
        {recoveryStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-primary/10 inline-flex p-3 rounded-full mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">
                {t('recovery.codeTitle', 'Enter Verification Code')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('recovery.codeSentPhone', 'We sent a 6-digit code to {phone}', { phone })}
              </p>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                {t('recovery.enterCode', 'Enter the code you received')}
              </label>
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <Input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={verificationCode[i] || ''}
                    onChange={(e) => {
                      const newCode = verificationCode.split('');
                      newCode[i] = e.target.value.replace(/[^0-9]/g, '');
                      setVerificationCode(newCode.join(''));
                      
                      // Auto-focus next input
                      if (e.target.value && i < 5) {
                        const nextInput = document.querySelector(`input[name=code-${i + 1}]`);
                        if (nextInput) {
                          (nextInput as HTMLInputElement).focus();
                        }
                      }
                    }}
                    className="w-12 h-12 text-center text-xl"
                    name={`code-${i}`}
                    inputMode="numeric"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {recoveryStep === 3 && (
          <div className="text-center py-6">
            <div className="bg-green-100 inline-flex p-3 rounded-full mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">
              {t('recovery.successTitle', 'Account Recovered')}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              {t('recovery.successMessage', 'Your account has been recovered')}
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              {t('recovery.signIn', 'Sign In')}
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {recoveryStep === 1 && (
          <Button 
            onClick={handleSendRecoveryCode} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('common.sending', 'Sending...') : t('recovery.sendCode', 'Send Recovery Code')}
          </Button>
        )}
        
        {recoveryStep === 2 && (
          <Button 
            onClick={handleVerifyCode} 
            className="w-full"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? t('common.verifying', 'Verifying...') : t('recovery.verifyCode', 'Verify Code')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AccountRecovery;