
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { EthiopianDatePicker } from '@/components/EthiopianDatePicker';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMilkProduction } from '@/hooks/useMilkProduction';
import { 
  Milk, Plus, Calendar, TrendingUp, Droplets,
  Star, Clock, Scale
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MilkProduction = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { milkRecords, isLoadingRecords, recordMilkProduction, isRecording } = useMilkProduction();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    production_date: new Date(),
    morning_yield: '',
    evening_yield: '',
    quality_grade: 'A' as 'A' | 'B' | 'C',
    fat_content: '',
    notes: ''
  });

  const translations = {
    am: {
      title: 'የወተት ምርት ምዝገባ',
      subtitle: 'ዕለታዊ የወተት ምርት ይመዝግቡ',
      addRecord: 'ምዝገባ ይጨምሩ',
      animalId: 'የእንስሳ መለያ',
      productionDate: 'የምርት ቀን',
      morningYield: 'የጠዋት ምርት (ሊትር)',
      eveningYield: 'የማታ ምርት (ሊትር)',
      totalYield: 'ጠቅላላ ምርት',
      qualityGrade: 'የጥራት ደረጃ',
      fatContent: 'የስብ መጠን (%)',
      notes: 'ማስታወሻዎች',
      save: 'አስቀምጥ',
      cancel: 'ይሰርዙ',
      todayProduction: 'የዛሬ ምርት',
      weeklyAverage: 'የሳምንት አማካይ',
      monthlyTotal: 'የወር ጠቅላላ',
      topProducers: 'ቁንጫ አምራቾች',
      recentRecords: 'የቅርብ ጊዜ ምዝገባዎች',
      qualityA: 'A - እጅግ ጥሩ',
      qualityB: 'B - ጥሩ',
      qualityC: 'C - መካከለኛ',
      liters: 'ሊትር'
    },
    en: {
      title: 'Milk Production Management',
      subtitle: 'Record and track daily milk production',
      addRecord: 'Add Record',
      animalId: 'Animal ID',
      productionDate: 'Production Date',
      morningYield: 'Morning Yield (Liters)',
      eveningYield: 'Evening Yield (Liters)',
      totalYield: 'Total Yield',
      qualityGrade: 'Quality Grade',
      fatContent: 'Fat Content (%)',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      todayProduction: 'Today\'s Production',
      weeklyAverage: 'Weekly Average',
      monthlyTotal: 'Monthly Total',
      topProducers: 'Top Producers',
      recentRecords: 'Recent Records',
      qualityA: 'A - Excellent',
      qualityB: 'B - Good',
      qualityC: 'C - Average',
      liters: 'Liters'
    },
    or: {
      title: 'Bulchiinsa Oomisha Aannan',
      subtitle: 'Oomisha aannan guyyaa galmeessi fi hordofi',
      addRecord: 'Galmee Dabaluu',
      animalId: 'Eenyummaa Beeitii',
      productionDate: 'Guyyaa Oomishaa',
      morningYield: 'Oomisha Ganama (Liitara)',
      eveningYield: 'Oomisha Galgalaa (Liitara)',
      totalYield: 'Oomisha Waliigalaa',
      qualityGrade: 'Sadarkaa Qulqullina',
      fatContent: 'Qabiyyee Cooma (%)',
      notes: 'Yaadachiisa',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      todayProduction: 'Oomisha Har\'aa',
      weeklyAverage: 'Giddugaleessa Torbanii',
      monthlyTotal: 'Waliigala Ji\'aa',
      topProducers: 'Oomishtota Ol\'aanoo',
      recentRecords: 'Galmeewwan Dhiyoo',
      qualityA: 'A - Gaarii Dha',
      qualityB: 'B - Gaarii',
      qualityC: 'C - Giddugaleessa',
      liters: 'Liitara'
    },
    sw: {
      title: 'Usimamizi wa Uzalishaji wa Maziwa',
      subtitle: 'Rekodi na ufuatilie uzalishaji wa maziwa wa kila siku',
      addRecord: 'Ongeza Rekodi',
      animalId: 'Kitambulisho cha Mnyama',
      productionDate: 'Tarehe ya Uzalishaji',
      morningYield: 'Mazao ya Asubuhi (Lita)',
      eveningYield: 'Mazao ya Jioni (Lita)',
      totalYield: 'Jumla ya Mazao',
      qualityGrade: 'Kiwango cha Ubora',
      fatContent: 'Maudhui ya Mafuta (%)',
      notes: 'Maelezo',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      todayProduction: 'Uzalishaji wa Leo',
      weeklyAverage: 'Wastani wa Wiki',
      monthlyTotal: 'Jumla ya Mwezi',
      topProducers: 'Wazalishaji Wakuu',
      recentRecords: 'Rekodi za Hivi Karibuni',
      qualityA: 'A - Bora Sana',
      qualityB: 'B - Nzuri',
      qualityC: 'C - Wastani',
      liters: 'Lita'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalYield = (parseFloat(formData.morning_yield) || 0) + 
                      (parseFloat(formData.evening_yield) || 0);
    
    recordMilkProduction({
      animal_id: formData.animal_id,
      production_date: formData.production_date.toISOString().split('T')[0],
      morning_yield: parseFloat(formData.morning_yield) || undefined,
      evening_yield: parseFloat(formData.evening_yield) || undefined,
      quality_grade: formData.quality_grade,
      fat_content: parseFloat(formData.fat_content) || undefined,
      notes: formData.notes || undefined
    });
    
    setShowForm(false);
    setFormData({
      animal_id: '',
      production_date: new Date(),
      morning_yield: '',
      evening_yield: '',
      quality_grade: 'A',
      fat_content: '',
      notes: ''
    });
  };

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = milkRecords.filter(record => 
    record.production_date === today
  );
  const todayTotal = todayRecords.reduce((sum, record) => sum + record.total_yield, 0);

  const last7Days = milkRecords.filter(record => {
    const recordDate = new Date(record.production_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  });
  const weeklyAverage = last7Days.length > 0 
    ? last7Days.reduce((sum, record) => sum + record.total_yield, 0) / 7 
    : 0;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyRecords = milkRecords.filter(record => {
    const recordDate = new Date(record.production_date);
    return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
  });
  const monthlyTotal = monthlyRecords.reduce((sum, record) => sum + record.total_yield, 0);

  // Chart data
  const chartData = milkRecords
    .slice(-30)
    .map(record => ({
      date: new Date(record.production_date).toLocaleDateString(),
      yield: record.total_yield
    }));

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access milk production management.</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
              🥛 {t.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {t.subtitle}
            </p>
          </div>
          
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRecord}</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {t.todayProduction}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">
                    {todayTotal.toFixed(1)} {t.liters}
                  </p>
                </div>
                <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                    {t.weeklyAverage}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-700">
                    {weeklyAverage.toFixed(1)} {t.liters}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">
                    {t.monthlyTotal}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-purple-700">
                    {monthlyTotal.toFixed(1)} {t.liters}
                  </p>
                </div>
                <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-600 font-medium">
                    {t.topProducers}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-orange-700">
                    {milkRecords.length}
                  </p>
                </div>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Milk className="w-5 h-5" />
              <span>Daily Production Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{t.recentRecords}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRecords ? (
              <LoadingSpinner />
            ) : milkRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No milk production records found. Start recording today!
              </p>
            ) : (
              <div className="space-y-3">
                {milkRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Milk className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium">
                          {new Date(record.production_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Animal: {record.animal_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        {record.total_yield} {t.liters}
                      </p>
                      {record.quality_grade && (
                        <p className="text-xs text-gray-500">
                          Grade {record.quality_grade}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />

      {/* Add Record Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>{t.addRecord}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="animal_id">{t.animalId}</Label>
                  <Input
                    id="animal_id"
                    value={formData.animal_id}
                    onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
                    placeholder="Enter animal ID"
                    required
                  />
                </div>

                <div>
                  <Label>{t.productionDate}</Label>
                  <EthiopianDatePicker
                    date={formData.production_date}
                    onDateChange={(date) => setFormData({ ...formData, production_date: date || new Date() })}
                  />
                </div>

                <div>
                  <Label htmlFor="morning_yield">{t.morningYield}</Label>
                  <Input
                    id="morning_yield"
                    type="number"
                    step="0.1"
                    value={formData.morning_yield}
                    onChange={(e) => setFormData({ ...formData, morning_yield: e.target.value })}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="evening_yield">{t.eveningYield}</Label>
                  <Input
                    id="evening_yield"
                    type="number"
                    step="0.1"
                    value={formData.evening_yield}
                    onChange={(e) => setFormData({ ...formData, evening_yield: e.target.value })}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label>{t.qualityGrade}</Label>
                  <Select 
                    value={formData.quality_grade} 
                    onValueChange={(value) => setFormData({ ...formData, quality_grade: value as 'A' | 'B' | 'C' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">{t.qualityA}</SelectItem>
                      <SelectItem value="B">{t.qualityB}</SelectItem>
                      <SelectItem value="C">{t.qualityC}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fat_content">{t.fatContent}</Label>
                  <Input
                    id="fat_content"
                    type="number"
                    step="0.1"
                    value={formData.fat_content}
                    onChange={(e) => setFormData({ ...formData, fat_content: e.target.value })}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">{t.notes}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isRecording}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isRecording ? <LoadingSpinner /> : t.save}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MilkProduction;
