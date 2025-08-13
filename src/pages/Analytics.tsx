
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialRecords } from '@/hooks/useFinancialRecords';
import { useMilkProduction } from '@/hooks/useMilkProduction';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Milk, 
  BarChart3, PieChart as PieChartIcon, Calendar,
  Download, Filter
} from 'lucide-react';

const Analytics = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { financialRecords } = useFinancialRecords();
  const { milkRecords } = useMilkProduction();
  
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('financial');

  const translations = {
    am: {
      title: 'ሪፖርቶች እና ትንታኔ',
      subtitle: 'የእርሻዎ አፈጻጸም ይከታተሉ',
      financial: 'የገንዘብ ሪፖርት',
      production: 'የወተት ምርት',
      health: 'የጤና ትንታኔ',
      performance: 'አፈጻጸም ንጽጽር',
      totalIncome: 'ጠቅላላ ገቢ',
      totalExpenses: 'ጠቅላላ ወጪ',
      netProfit: 'ንጹህ ትርፍ',
      milkYield: 'የወተት ምርት',
      last30Days: 'ባለፉት 30 ቀናት',
      thisMonth: 'በዚህ ወር',
      thisYear: 'በዚህ ዓመት',
      exportReport: 'ሪፖርት ላክ',
      filter: 'ማጣሪያ'
    },
    en: {
      title: 'Analytics & Reports',
      subtitle: 'Track your farm performance',
      financial: 'Financial Reports',
      production: 'Milk Production',
      health: 'Health Analytics',
      performance: 'Performance Comparison',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netProfit: 'Net Profit',
      milkYield: 'Milk Yield',
      last30Days: 'Last 30 Days',
      thisMonth: 'This Month',
      thisYear: 'This Year',
      exportReport: 'Export Report',
      filter: 'Filter'
    },
    or: {
      title: 'Xiinxalaa fi Gabaasaa',
      subtitle: 'Raawwii qonnaa keetii hordofi',
      financial: 'Gabaasa Maallaqaa',
      production: 'Oomisha Aannan',
      health: 'Xiinxala Fayyaa',
      performance: 'Wal-madaalii Raawwii',
      totalIncome: 'Galii Waliigalaa',
      totalExpenses: 'Baasii Waliigalaa',
      netProfit: 'Bu\'aa Qulqulluu',
      milkYield: 'Oomisha Aannan',
      last30Days: 'Guyyoota 30 darban',
      thisMonth: 'Ji\'a kana',
      thisYear: 'Waggaa kana',
      exportReport: 'Gabaasa Ergi',
      filter: 'Calaqqisiisi'
    },
    sw: {
      title: 'Uchambuzi na Ripoti',
      subtitle: 'Fuatilia utendaji wa shamba lako',
      financial: 'Ripoti za Kifedha',
      production: 'Uzalishaji wa Maziwa',
      health: 'Uchambuzi wa Afya',
      performance: 'Mlinganisho wa Utendaji',
      totalIncome: 'Mapato Jumla',
      totalExpenses: 'Matumizi Jumla',
      netProfit: 'Faida Halisi',
      milkYield: 'Uzalishaji wa Maziwa',
      last30Days: 'Siku 30 zilizopita',
      thisMonth: 'Mwezi huu',
      thisYear: 'Mwaka huu',
      exportReport: 'Hamisha Ripoti',
      filter: 'Chuja'
    }
  };

  const t = translations[language];

  // Process financial data
  const totalIncome = financialRecords
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalExpenses = financialRecords
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  // Process milk production data
  const totalMilkYield = milkRecords
    .reduce((sum, record) => sum + record.total_yield, 0);

  const averageDailyYield = milkRecords.length > 0 
    ? totalMilkYield / milkRecords.length 
    : 0;

  // Chart data preparation
  const financialChartData = financialRecords
    .slice(-30)
    .map(record => ({
      date: new Date(record.transaction_date).toLocaleDateString(),
      income: record.type === 'income' ? record.amount : 0,
      expense: record.type === 'expense' ? record.amount : 0
    }));

  const milkProductionChartData = milkRecords
    .slice(-30)
    .map(record => ({
      date: new Date(record.production_date).toLocaleDateString(),
      yield: record.total_yield,
      morning: record.morning_yield || 0,
      evening: record.evening_yield || 0
    }));

  const expenseCategoryData = financialRecords
    .filter(record => record.type === 'expense')
    .reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(expenseCategoryData).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view analytics and reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            📊 {t.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">{t.last30Days}</SelectItem>
                <SelectItem value="month">{t.thisMonth}</SelectItem>
                <SelectItem value="year">{t.thisYear}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>{t.exportReport}</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                    {t.totalIncome}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-700">
                    {totalIncome.toLocaleString()} ETB
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-red-600 font-medium">
                    {t.totalExpenses}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-red-700">
                    {totalExpenses.toLocaleString()} ETB
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {t.netProfit}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">
                    {netProfit.toLocaleString()} ETB
                  </p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-600 font-medium">
                    {t.milkYield}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-orange-700">
                    {averageDailyYield.toFixed(1)}L/day
                  </p>
                </div>
                <Milk className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="financial" className="text-xs sm:text-sm">
              {t.financial}
            </TabsTrigger>
            <TabsTrigger value="production" className="text-xs sm:text-sm">
              {t.production}
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs sm:text-sm">
              {t.health}
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              {t.performance}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Income vs Expenses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#10b981" />
                      <Bar dataKey="expense" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5" />
                    <span>Expense Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Milk className="w-5 h-5" />
                  <span>Daily Milk Production</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={milkProductionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="yield" stroke="#f97316" fill="#fed7aa" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Health Analytics</h3>
                <p className="text-gray-600">
                  Health analytics features coming soon. Track vaccination schedules, 
                  illness patterns, and health trends.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Performance Comparison</h3>
                <p className="text-gray-600">
                  Compare your farm's performance against industry benchmarks 
                  and historical data.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Analytics;
