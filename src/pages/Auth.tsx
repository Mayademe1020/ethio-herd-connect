import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContextMVP';
import { User } from 'lucide-react';

const Auth = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🐄</span>
          </div>
          <CardTitle className="text-2xl">EthioHerd Connect</CardTitle>
          <p className="text-gray-600">
            Your livestock management platform
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-mono text-xs text-gray-500">{user.id}</span>
          </div>

          <p className="text-center text-sm text-gray-700">
            You are signed in with local-first authentication. Your data stays on your device.
          </p>

          <p className="text-center text-xs text-gray-500">
            Phone OTP registration for cross-device sync will be available in a future update.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:text-red-700"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;