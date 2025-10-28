// src/components/BackButton.tsx - Reusable back button component

import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string; // Optional custom navigation path
  label?: string; // Optional custom label
}

export const BackButton = ({ to, label }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Card 
      className="inline-flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
      onClick={handleBack}
      style={{ minHeight: '44px', minWidth: '44px' }} // Tappable size
    >
      <ArrowLeft className="w-5 h-5 text-gray-700" />
      {label && <span className="font-medium text-gray-700">{label}</span>}
    </Card>
  );
};
