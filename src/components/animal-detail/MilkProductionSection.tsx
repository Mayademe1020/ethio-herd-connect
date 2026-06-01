import { Milk } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MilkRecord {
  id: string;
  liters: number;
  session: string;
  recorded_at: string;
}

interface MilkProductionSectionProps {
  milkRecords: MilkRecord[];
  weeklyTotal: number;
  dailyAverage: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  onRecordMilk: () => void;
}

const trendConfig = {
  increasing: { icon: '↑', color: 'text-green-600', label: 'Increasing' },
  decreasing: { icon: '↓', color: 'text-red-600', label: 'Decreasing' },
  stable: { icon: '→', color: 'text-blue-600', label: 'Stable' },
};

export const MilkProductionSection = ({
  milkRecords,
  weeklyTotal,
  dailyAverage,
  trend,
  onRecordMilk,
}: MilkProductionSectionProps) => {
  const trendInfo = trendConfig[trend];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Milk className="w-6 h-6 text-blue-500" />
          Milk Production
        </h2>
        {milkRecords.length >= 4 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendInfo.color}`}>
            <span className="text-2xl">{trendInfo.icon}</span>
            <span>{trendInfo.label}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Weekly Total</p>
          <p className="text-sm text-gray-500">የሳምንት ድምር</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{weeklyTotal.toFixed(1)}L</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Daily Average</p>
          <p className="text-sm text-gray-500">የቀን አማካይ</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{dailyAverage}L</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Last 7 Days • ባለፉት 7 ቀናት</h3>
        {milkRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Milk className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No milk records yet</p>
            <p className="text-sm">ምንም የወተት መዝገብ የለም</p>
            <Button onClick={onRecordMilk} className="mt-4 bg-blue-500 hover:bg-blue-600">
              Record First Milk
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {milkRecords.map((record, index) => {
              const recordDate = new Date(record.recorded_at).toLocaleDateString();
              const sameDay = milkRecords.filter(
                (r) => new Date(r.recorded_at).toLocaleDateString() === recordDate
              );
              const dailyTotal = sameDay.reduce((sum, r) => sum + Number(r.liters), 0);
              const isFirstOfSameDay =
                index ===
                milkRecords.findIndex(
                  (r) => new Date(r.recorded_at).toLocaleDateString() === recordDate
                );

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-lg">{record.liters}L</p>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {record.session}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(record.recorded_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' • '}
                      {new Date(record.recorded_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    {sameDay.length > 1 && isFirstOfSameDay && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Daily total: {dailyTotal.toFixed(1)}L
                      </p>
                    )}
                  </div>
                  <Milk className="w-5 h-5 text-blue-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
