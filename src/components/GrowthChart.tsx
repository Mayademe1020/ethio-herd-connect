
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Language } from '@/types';

interface GrowthChartProps {
  language: Language;
  animalId: string;
  animalName?: string;
}

export const GrowthChart = ({ language, animalId, animalName }: GrowthChartProps) => {
  const translations = {
    am: {
      growthChart: 'የእድገት ቻርት',
      weight: 'ክብደት (ኪግ)',
      date: 'ቀን',
      noData: 'መረጃ የለም'
    },
    en: {
      growthChart: 'Growth Chart',
      weight: 'Weight (kg)',
      date: 'Date',
      noData: 'No Data'
    },
    or: {
      growthChart: 'Chaartii Guddina',
      weight: 'Ulfaatina (kg)',
      date: 'Guyyaa',
      noData: 'Daataan Hin Jiru'
    },
    sw: {
      growthChart: 'Chati ya Ukuaji',
      weight: 'Uzito (kg)',
      date: 'Tarehe',
      noData: 'Hakuna Data'
    }
  };

  const t = translations[language];

  // Mock data for demonstration
  const data = [
    { date: '2024-01-01', weight: 45 },
    { date: '2024-01-15', weight: 47 },
    { date: '2024-02-01', weight: 50 },
    { date: '2024-02-15', weight: 52 },
    { date: '2024-03-01', weight: 55 },
    { date: '2024-03-15', weight: 58 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t.growthChart} {animalName && `- ${animalName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: t.weight, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
