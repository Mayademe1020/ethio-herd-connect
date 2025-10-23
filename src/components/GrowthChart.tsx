
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Language } from '@/types';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { useGrowthRecords } from '@/hooks/useGrowthRecords';

interface GrowthChartProps {
  language: Language;
  animalId: string;
  animalName?: string;
}

export const GrowthChart = ({ language, animalId, animalName }: GrowthChartProps) => {
  const translations = {
    am: { growthChart: 'የእድገት ቻርት', weight: 'ክብደት (ኪግ)', date: 'ቀን', noData: 'መረጃ የለም' },
    en: { growthChart: 'Growth Chart', weight: 'Weight (kg)', date: 'Date', noData: 'No Data' },
    or: { growthChart: 'Chaartii Guddina', weight: 'Ulfaatina (kg)', date: 'Guyyaa', noData: 'Daataan Hin Jiru' },
    sw: { growthChart: 'Chati ya Ukuaji', weight: 'Uzito (kg)', date: 'Tarehe', noData: 'Hakuna Data' }
  };
  const t = translations[language];
  const { formatDateShort } = useDateDisplay();

  // Fetch growth records for either the specific animal or all animals for group view
  const { growthRecords } = useGrowthRecords(animalId === 'group' ? undefined : animalId);

  // Build chart data
  const data =
    animalId === 'group'
      ? (() => {
          const byDate: Record<string, { total: number; count: number }> = {};
          growthRecords.forEach((r) => {
            const key = r.recorded_date;
            if (!byDate[key]) byDate[key] = { total: 0, count: 0 };
            byDate[key].total += Number(r.weight);
            byDate[key].count += 1;
          });
          return Object.entries(byDate)
            .map(([rawDate, agg]) => ({
              dateRaw: rawDate,
              date: formatDateShort(rawDate),
              weight: Number((agg.total / agg.count).toFixed(2)),
            }))
            .sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime())
            .map(({ date, weight }) => ({ date, weight }));
        })()
      : growthRecords
          .filter((r) => r.animal_id === animalId)
          .map((r) => ({
            dateRaw: r.recorded_date,
            date: formatDateShort(r.recorded_date),
            weight: Number(r.weight),
          }))
          .sort((a, b) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime())
          .map(({ date, weight }) => ({ date, weight }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t.growthChart} {animalName && `- ${animalName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">{t.noData}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: t.weight, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
