// src/pages/OnboardingPage.tsx - Clean onboarding flow

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ETHIOPIA_CONSTANTS } from '@/constants/ethiopia';
import { Eye, EyeOff, User, Phone, Lock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step-by-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step labels
  const steps = [
    { number: 1, label: 'Name', icon: <User className="w-4 h-4" /> },
    { number: 2, label: 'Phone', icon: <Phone className="w-4 h-4" /> },
    { number: 3, label: 'Password', icon: <Lock className="w-4 h-4" /> },
  ];

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Name validation
        if (!userName.trim()) {
          newErrors.userName = 'Name is required';
        } else if (userName.trim().length < 2) {
          newErrors.userName = 'Name must be at least 2 characters';
        }
        break;
        
      case 2: // Phone validation
        const cleaned = phoneNumber.replace(/\D/g, '');
        const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
        
        if (!phoneNumber) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (withoutLeadingZero.length !== 9) {
          newErrors.phoneNumber = 'Phone must be 9 digits';
        } else if (!withoutLeadingZero.startsWith('9') && !withoutLeadingZero.startsWith('7')) {
          newErrors.phoneNumber = 'Phone must start with 9 or 7';
        }
        break;
        
      case 3: // Password validation
        if (!password) {
          newErrors.password = 'Password is required';
        } else if (password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
        break;
        
      case 4: // Farm name validation (optional but recommended)
        // Farm name is optional
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  // Handle previous step
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final submission
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    
    try {
      const cleaned = phoneNumber.replace(/\D/g, '').startsWith('0') 
        ? phoneNumber.replace(/\D/g, '').slice(1) 
        : phoneNumber.replace(/\D/g, '');
      
      const email = `${cleaned}@ethioherd.app`;
      
      // Create account using phone+password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: undefined,
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // Try to sign in instead
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (!signInError) {
            toast.success('✓ Welcome back!');
            navigate('/', { replace: true });
            return;
          }
        }
        throw signUpError;
      }

      // Create profile with onboarding data
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles' as any)
          .upsert({
            id: signUpData.user.id,
            phone: cleaned,
            farmer_name: userName.trim(),
            farm_name: farmName.trim() || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Auto-create farm for the new user
        try {
          const finalFarmName = farmName.trim() || 'My Farm';
          const { data: newFarm, error: farmError } = await (supabase as any)
            .from('farms')
            .insert({ name: finalFarmName, owner_id: signUpData.user.id })
            .select()
            .single();

          if (!farmError && newFarm) {
            // Add user as farm owner
            await (supabase as any)
              .from('farm_members')
              .insert({
                farm_id: newFarm.id,
                user_id: signUpData.user.id,
                role: 'owner',
                invited_by: signUpData.user.id,
                can_view_financials: true,
              });

            // Check if this phone has a pending invitation to join another farm
            const { data: invitation } = await (supabase as any)
              .from('farm_invitations')
              .select('*')
              .eq('phone', cleaned)
              .is('accepted_at', null)
              .gt('expires_at', new Date().toISOString())
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (invitation) {
              // Join the other farm as a worker
              await (supabase as any)
                .from('farm_members')
                .upsert({
                  farm_id: invitation.farm_id,
                  user_id: signUpData.user.id,
                  role: invitation.role,
                  invited_by: invitation.invited_by,
                  is_active: true,
                }, { onConflict: 'farm_id,user_id' });

              // Mark invitation as accepted
              await (supabase as any)
                .from('farm_invitations')
                .update({ accepted_at: new Date().toISOString() })
                .eq('id', invitation.id);

              toast.success('✓ You have been added to a farm team!');
            }
          }
        } catch (farmErr) {
          console.error('Farm creation error:', farmErr);
          // Don't block onboarding if farm creation fails
        }
      }

      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');
      
      toast.success('✓ Account created successfully!');
      setTimeout(() => navigate('/', { replace: true }), 500);
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error('Registration failed', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">🌾</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                እንኳን ደህና መጡ! / Welcome!
              </h1>
              <p className="text-gray-600">
                Complete your profile to get started
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      currentStep >= step.number
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      currentStep >= step.number ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 w-full h-0.5 mt-2 ${
                        currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  What's your name?
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ስምዎ / Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setErrors({});
                    }}
                    placeholder="ስምዎን ያስገቡ"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg ${
                      errors.userName ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500'
                    }`}
                    autoFocus
                  />
                  {errors.userName && (
                    <p className="text-sm text-red-600 mt-1">{errors.userName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Phone */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  What's your phone number?
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ስልክ ቁጥር / Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 px-3 py-3 border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-700">
                      {ETHIOPIA_CONSTANTS.PHONE_COUNTRY_CODE}
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setPhoneNumber(value);
                        setErrors({});
                      }}
                      placeholder="911234567"
                      maxLength={9}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none text-lg ${
                        errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    9 digits (start with 9 or 7)
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Create a password
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ፓስወርድ / Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({});
                      }}
                      placeholder="••••••"
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none text-lg ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    At least 6 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Farm Name */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  What's your farm name?
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    የእርሻ ስም / Farm Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="ለምሳሌ: የአበበ እርሻ"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ይህ ስም በገበያ ላይ ይታያል / This name will be shown in marketplace
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 py-4"
                >
                  ወደ ኋላ / Back
                </Button>
              )}
              <Button
                type="button"
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                disabled={loading}
                className={`flex-1 py-4 bg-green-600 text-white hover:bg-green-700 ${
                  currentStep === 1 ? 'flex-1' : ''
                }`}
              >
                {loading ? 'እባክዎ ይጠብቁ...' : 
                 currentStep === 4 ? '✓ መዝግብ / Complete' : 
                 'ቀጥል / Next'}
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400">
              <p>Step {currentStep} of {steps.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
