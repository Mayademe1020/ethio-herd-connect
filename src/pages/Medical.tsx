
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Stethoscope, 
  Plus, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Activity,
  Shield,
  Thermometer
} from 'lucide-react';
import { Language } from '@/types';

const Medical = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    animalId: '',
    symptoms: '',
    severity: 'medium',
    temperature: '',
    notes: ''
  });

  const translations = {
    am: {
      title: 'የህክምና መሳሪያ',
      subtitle: 'የእንስሳት ጤንነት መከታተያ እና ትንተና',
      newReport: 'አዲስ የጤንነት ሪፖርት',
      animalId: 'የእንስሳ መለያ',
      symptoms: 'ምልክቶች',
      severity: 'ክብደት',
      temperature: 'ሙቀት (°C)',
      notes: 'ማስታወሻ',
      save: 'ማስቀመጥ',
      cancel: 'ሰርዝ',
      low: 'ዝቅተኛ',
      medium: 'መካከለኛ',
      high: 'ከፍተኛ',
      critical: 'አደገኛ',
      healthReports: 'የጤንነት ሪፖርቶች',
      vaccinations: 'ክትባቶች',
      treatments: 'ህክምናዎች',
      checkups: 'ምርመራዎች',
      noReports: 'ምንም የጤንነት ሪፖርት የለም',
      enterSymptoms: 'ምልክቶችን ይግለጹ',
      enterNotes: 'ተጨማሪ ማስታወሻ'
    },
    en: {
      title: 'Medical Tool',
      subtitle: 'Animal health tracking and analysis',
      newReport: 'New Health Report',
      animalId: 'Animal ID',
      symptoms: 'Symptoms',
      severity: 'Severity',
      temperature: 'Temperature (°C)',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      healthReports: 'Health Reports',
      vaccinations: 'Vaccinations',
      treatments: 'Treatments',
      checkups: 'Checkups',
      noReports: 'No health reports yet',
      enterSymptoms: 'Describe symptoms',
      enterNotes: 'Additional notes'
    },
    or: {
      title: 'Meeshaalee Yaalaa',
      subtitle: 'Fayyaa horii hordofuu fi xiinxaluu',
      newReport: 'Gabaasa Fayyaa Haaraa',
      animalId: 'Eenyummaa Horii',
      symptoms: 'Mallattoolee',
      severity: 'Cimina',
      temperature: 'Ho\'a (°C)',
      notes: 'Yaadannoo',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      low: 'Gadaanaa',
      medium: 'Giddugaleessa',
      high: 'Olaanaa',
      critical: 'Balaa',
      healthReports: 'Gabaasota Fayyaa',
      vaccinations: 'Talaallii',
      treatments: 'Yaalaa',
      checkups: 'Qorannoo',
      noReports: 'Gabaasni fayyaa hin jiru',
      enterSymptoms: 'Mallattoolee ibsi',
      enterNotes: 'Yaadannoo dabalataa'
    },
    sw: {
      title: 'Kifaa cha Matibabu',
      subtitle: 'Ufuatiliaji na uchambuzi wa afya ya wanyamapori',
      newReport: 'Ripoti Mpya ya Afya',
      animalId: 'Kitambulisho cha Mnyama',
      symptoms: 'Dalili',
      severity: 'Ukali',
      temperature: 'Joto (°C)',
      notes: 'Maelezo',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      low: 'Chini',
      medium: 'Wastani',
      high: 'Juu',
      critical: 'Hatari',
      healthReports: 'Ripoti za Afya',
      vaccinations: 'Chanjo',
      treatments: 'Matibabu',
      checkups: 'Uchunguzi',
      noReports: 'Hakuna ripoti za afya bado',
      enterSymptoms: 'Eleza dalili',
      enterNotes: 'Maelezo ya ziada'
    }
  };

  const t = translations[language];

  const mockStats = {
    healthReports: 12,
    vaccinations: 8,
    treatments: 3,
    checkups: 15
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalId || !formData.symptoms) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowForm(false);
      setFormData({
        animalId: '',
        symptoms: '',
        severity: 'medium',
        temperature: '',
        notes: ''
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />

      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="w-6 h-6 text-green-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {t.title}
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 h-12 px-6 text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.newReport}
          </Button>
        </div>

        {/* Health Report Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                {t.newReport}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.animalId}</label>
                  <Input
                    placeholder="COW001, GOAT002, etc."
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.symptoms}</label>
                  <Textarea
                    placeholder={t.enterSymptoms}
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    required
                    rows={3}
                    className="text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.severity}</label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t.low}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="high">{t.high}</SelectItem>
                        <SelectItem value="critical">{t.critical}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.temperature}</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="38.5"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.notes}</label>
                  <Textarea
                    placeholder={t.enterNotes}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="text-base"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner /> : t.save}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-12 text-base"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-600" />
                {t.healthReports}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockStats.healthReports}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                {t.vaccinations}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockStats.vaccinations}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-green-600" />
                {t.treatments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStats.treatments}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Thermometer className="w-4 h-4 mr-2 text-purple-600" />
                {t.checkups}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockStats.checkups}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent {t.healthReports}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Stethoscope className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">{t.noReports}</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Medical;
