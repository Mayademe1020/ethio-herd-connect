import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Phone, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { LoginSchema, MobileLoginSchema, SignUpSchema } from '@/lib/authValidators';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const currentSchema = isLogin
    ? (loginMethod === 'email' ? LoginSchema : MobileLoginSchema)
    : SignUpSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: '',
      password: '',
      mobileNumber: '',
      fullName: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    form.reset();
  }, [isLogin, loginMethod, form]);


  const onSubmit = async (values: z.infer<typeof currentSchema>) => {
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        const { password } = values;
        const emailForLogin = loginMethod === 'mobile'
          ? `${(values as z.infer<typeof MobileLoginSchema>).mobileNumber}@mylivestock.app`
          : (values as z.infer<typeof LoginSchema>).email;
        result = await signIn(emailForLogin, password);
      } else {
        const { email, password, mobileNumber, fullName } = values as z.infer<typeof SignUpSchema>;
        const emailForSignup = email || `${mobileNumber}@mylivestock.app`;
        result = await signUp(emailForSignup, password, mobileNumber, fullName);
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          toast.error('Invalid credentials. Please check your details and try again.');
        } else if (result.error.message.includes('User already registered')) {
          toast.error('User already exists. Please sign in instead.');
          setIsLogin(true);
        } else {
          toast.error(result.error.message);
        }
      } else if (!isLogin) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        setIsLogin(true);
      } else {
        toast.success('Signed in successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🐄</span>
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? 'Welcome Back' : 'Join MyLivestock'}
          </CardTitle>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your livestock account' : 'Start managing your livestock'}
          </p>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isLogin && (
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('mobile')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      loginMethod === 'mobile'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      loginMethod === 'email'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                </div>
              )}

              {(loginMethod === 'mobile' || !isLogin) && (
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Mobile Number *</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter your mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(loginMethod === 'email' || !isLogin) && (
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email {!isLogin ? '(Optional)' : '*'}</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isLogin && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Full Name (Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Password *</span>
                    </FormLabel>
                    <FormControl>
                       <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...field}
                        />
                         <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isLogin && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Confirm Password *</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    form.reset();
                  }}
                  className="text-green-600 hover:text-green-700 text-sm"
                  disabled={loading}
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;