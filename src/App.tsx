import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

import Home from '@/pages/Home';
import Animals from '@/pages/Animals';
import Market from '@/pages/Market';
import Auth from '@/pages/Auth';
import Analytics from "@/pages/Analytics";
import MilkProduction from "@/pages/MilkProduction";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Toaster />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/animals" element={<Animals />} />
                <Route path="/market" element={<Market />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/milk-production" element={<MilkProduction />} />
              </Routes>
            </div>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
