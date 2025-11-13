// src/pages/MilkSummary.tsx - In-app milk summary with CSV export
// FIXED: Uses correct table name 'milk_production' and column name 'liters'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Calendar, Droplets } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { milkQueries } from '@/lib/milkQueries';
import { MilkSummaryRecord } from '@/types/milk';
import { toast } from 'sonner';
import { getSuccessMessage } from '@/lib/errorMessages';

const MilkSummary = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const currentMonth = new Date();
  const monthName = format(currentMonth, 'MMMM yyyy');

  // Fetch milk summary for current month - FIXED: using correct table and column names
  const { data: milkRecords = [], isLoading, error } = useQuery({
    queryKey: ['milk-summary', user?.id, currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      if (!user) return [];
      try {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        return await milkQueries.getMonthlySummary(user.id, monthStart, monthEnd);
      } catch (error) {
        console.error('Error fetching milk summary:', error);
        toast.error('የወተት ማጠቃለያ መጫን አልተሳካም / Failed to load milk summary');
        return [];
      }
    },
    enabled: !!user
  });

  // Calculate totals - FIXED: using liters field
  const totalLiters = milkRecords.reduce((sum, record) => sum + record.liters, 0);
  const totalRecords = milkRecords.length;
  const uniqueAnimals = new Set(milkRecords.map(r => r.animal_name)).size;

  // Export to CSV - FIXED: using liters field and added success/error messages
  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Create CSV content
      const headers = ['Date', 'Animal Name', 'Amount (L)', 'Session'];
      const csvContent = [
        headers.join(','),
        ...milkRecords.map(record => [
          record.date,
          `"${record.animal_name}"`,
          record.liters,
          record.session
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `milk-summary-${format(currentMonth, 'yyyy-MM')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      const successMsg = getSuccessMessage('milk_exported', 'amharic');
      toast.success(`${successMsg.icon} ${successMsg.message}`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('ወደ CSV መላክ አልተሳካም / Failed to export to CSV');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading milk summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="mb-2">
            <BackButton to="/" label="ተመለስ / Back" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            የወተት ማጠቃለያ / Milk Summary
          </h1>
          <p className="text-sm text-gray-600">{monthName}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{totalLiters}L</p>
            <p className="text-xs text-gray-600">ጠቅላላ ወተት / Total Milk</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{totalRecords}</p>
            <p className="text-xs text-gray-600">መዝገቦች / Records</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="w-6 h-6 mx-auto mb-2 text-purple-500">🐄</div>
            <p className="text-2xl font-bold text-purple-600">{uniqueAnimals}</p>
            <p className="text-xs text-gray-600">እንስሳት / Animals</p>
          </Card>
        </div>

        {/* Export Button */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">ወደ CSV ላይ ለመላክ / Export to CSV</h3>
              <p className="text-sm text-gray-600">የእርስዎን መዝገቦች ለመያዝ ያስቀምጡ / Save your records for your records</p>
            </div>
            <Button
              onClick={exportToCSV}
              disabled={isExporting || milkRecords.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'በማውረድ ላይ...' : 'ያስቀምጡ / Download'}
            </Button>
          </div>
        </Card>

        {/* Records List */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            የዚህ ወር መዝገቦች / This Month's Records
          </h3>

          {milkRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Droplets className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>እስካሁን የወተት መዝገብ አልተሞላም</p>
              <p className="text-sm">No milk records for this month yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {milkRecords.map((record, index) => (
                <div
                  key={`${record.date}-${record.animal_name}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-900">
                        {record.liters}L
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.animal_name}
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        record.session === 'morning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {record.session}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MilkSummary;