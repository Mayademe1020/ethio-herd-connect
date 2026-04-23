// src/pages/RegisterPage.tsx - Single page registration: Username → Phone → PIN

import { RegisterForm } from '@/components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-5xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            እንኳን ደህና መጡ!
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to Ethio Herd Connect
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ✓ Works offline &nbsp; ✓ Amharic support &nbsp; ✓ Free to use
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
