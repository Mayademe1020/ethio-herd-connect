import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { logger } from '@/utils/logger';
import { logSecurityAudit } from '@/utils/securityUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail } from 'lucide-react';
import { ETHIOPIA, isValidEthiopianPhone, addCountryCode } from '@/constants/ethiopia';

const translations = {
  en: {
    title: 'Login with OTP',
    selectMethod: 'Select method',
    phoneLabel: 'Mobile Number',
    emailLabel: 'Email Address',
    sendCode: 'Send Code',
    sendLink: 'Send Link',
    codeLabel: 'Verification Code',
    verifyContinue: 'Verify & Continue',
    resend: 'Resend',
    cooldownFmt: (n: number) => `Resend in ${n}s`,
    usePassword: 'Use password instead',
  },
  am: {
    title: 'በ OTP ይግቡ',
    selectMethod: 'መንገድ ይምረጡ',
    phoneLabel: 'ስልክ ቁጥር',
    emailLabel: 'ኢሜይል አድራሻ',
    sendCode: 'ኮድ ላክ',
    sendLink: 'ማጂክ ሊንክ ላክ',
    codeLabel: 'የማረጋገጫ ኮድ',
    verifyContinue: 'አረጋግጥ እና ቀጥል',
    resend: 'እንደገና ላክ',
    cooldownFmt: (n: number) => `${n}ሰ እንደገና ላክ`,
    usePassword: 'በይለፍ ቃል ተጠቀም',
  },
  or: {},
  sw: {},
};

export const OtpAuthForm: React.FC<{ showPasswordFallback?: boolean; onTogglePassword?: () => void }> = ({
  showPasswordFallback = true,
  onTogglePassword,
}) => {
  const navigate = useNavigate();
  const { sanitizeText, sanitizeEmail } = useInputSanitization();
  const { sendVerificationCode, verifyCode } = useAuth();

  const [method, setMethod] = useState<'sms' | 'email'>('sms');
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  // Build E.164 phone - Ethiopia only (+251)
  const buildPhoneE164 = (): string => {
    const raw = sanitizeText(phoneLocal || '', { maxLength: 9, allowSpecialChars: false });
    const digits = raw.replace(/\D/g, '');
    // Always use Ethiopia country code
    return addCountryCode(digits);
  };

  useEffect(() => {
    if (step === 2) codeInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const handleSend = async () => {
    setLoading(true);
    try {
      const params =
        method === 'sms'
          ? { method: 'sms' as const, phone: buildPhoneE164() }
          : { method: 'email' as const, email: sanitizeEmail(email) };

      const { error } = await sendVerificationCode(params);
      if (error) {
        logger.error('OTP send failed', error);
      } else {
        logger.info('OTP send success', params);
        logSecurityAudit('OTP_SEND_UI', { ...params, success: true });
        // Email magic link: keep user on step 1 and inform; SMS: go to step 2
        if (method === 'sms') {
          setStep(2);
          setCooldown(30);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const params =
        method === 'sms'
          ? { method: 'sms' as const, phone: buildPhoneE164(), code }
          : { method: 'email' as const, email: sanitizeEmail(email), code };

      const { error } = await verifyCode(params);
      if (error) {
        logger.error('OTP verify failed', error);
      } else {
        logger.info('OTP verify success', params);
        logSecurityAudit('OTP_VERIFY_UI', { ...params, success: true });

        // Always land users on home after successful login
        try { localStorage.removeItem('postLoginAction'); } catch {}
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Basic language selection via browser (fallback to EN)
  const lang = (localStorage.getItem('language') as keyof typeof translations) || 'en';
  const t = translations[lang] || translations.en;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={method === 'sms' ? 'default' : 'outline'} size="sm" onClick={() => setMethod('sms')}>
            <Phone className="w-4 h-4 mr-2" /> SMS
          </Button>
          <Button variant={method === 'email' ? 'default' : 'outline'} size="sm" onClick={() => setMethod('email')}>
            <Mail className="w-4 h-4 mr-2" /> Email
          </Button>
        </div>

        {method === 'sms' && step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phoneLabel}</Label>
              <div className="flex items-center gap-2">
                {/* Ethiopia Phone Prefix - Fixed */}
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50 flex-shrink-0">
                  <span className="text-xl">{ETHIOPIA.flag}</span>
                  <span className="font-medium">{ETHIOPIA.phonePrefix}</span>
                </div>
                
                {/* Phone Number Input - 9 digits */}
                <Input
                  id="phone"
                  type="tel"
                  value={phoneLocal}
                  onChange={(e) => {
                    // Only allow digits, max 9
                    const cleaned = e.target.value.replace(/\D/g, '');
                    if (cleaned.length <= 9) {
                      setPhoneLocal(cleaned);
                    }
                  }}
                  placeholder="912345678"
                  className="flex-1"
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-gray-500">
                {lang === 'am' 
                  ? 'የስልክ ቁጥርዎን ያስገቡ (9 አሃዞች)'
                  : 'Enter your phone number (9 digits)'}
              </p>
            </div>
            <Button className="w-full" disabled={loading || cooldown > 0 || phoneLocal.length !== 9} onClick={handleSend}>
              {cooldown > 0 ? t.cooldownFmt(cooldown) : t.sendCode}
            </Button>
          </>
        )}

        {method === 'email' && (
          <>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailLabel} />
            <Button className="w-full" disabled={loading} onClick={handleSend}>
              {t.sendLink}
            </Button>
          </>
        )}

        {method === 'sms' && step === 2 && (
          <>
            <Input
              ref={codeInputRef}
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t.codeLabel}
            />
            <div className="flex gap-2">
              <Button className="flex-1" disabled={loading || !code} onClick={handleVerify}>
                {t.verifyContinue}
              </Button>
              <Button className="flex-1" variant="outline" disabled={cooldown > 0 || loading} onClick={handleSend}>
                {cooldown > 0 ? t.cooldownFmt(cooldown) : t.resend}
              </Button>
            </div>
          </>
        )}

        {showPasswordFallback && (
          <div className="text-center">
            <button type="button" className="text-green-600 hover:text-green-700 text-sm" onClick={onTogglePassword}>
              {t.usePassword}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};