/**
 * BreedingRecordsPage - Complete Breeding Management for Ethiopian Farmers
 * Features: Heat cycle tracking, mating records, breeding history, export, notifications
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Calendar, 
  Baby, 
  Clock, 
  TrendingUp, 
  Download, 
  Share2,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';
import {
  getAllBreedingRecords,
  getBreedingStats,
  getHeatCycleInfo,
  createBreedingRecord,
  deleteBreedingRecord,
  exportBreedingRecordsToCSV,
  calculateDueDate,
  getRecommendedMatingWindow,
} from '@/services/breedingService';
import { supabase } from '@/integrations/supabase/client';
import { BreedingRecord, BreedingStats, HeatCycleInfo, AnimalType } from '@/types/breeding';

type RecordType = 'heat' | 'mating' | 'pregnancy_confirmed' | 'birth' | 'failed_mating';

interface Animal {
  id: string;
  name: string;
  type: AnimalType;
  gender: string;
  animal_id?: string;
}

const BreedingRecordsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    record_type: 'heat' as RecordType,
    event_date: new Date().toISOString().split('T')[0],
    heat_cycle_day: 0,
    mating_type: 'natural' as 'natural' | 'artificial',
    stud_name: '',
    expected_due_date: '',
    offspring_count: 1,
    notes: '',
    reminder_enabled: true,
  });

  // Translations
  const t = {
    en: {
      title: 'Breeding Management',
      subtitle: 'Track heat cycles, mating, and births',
      selectAnimal: 'Select Animal',
      noAnimals: 'No female animals available',
      heatCycle: 'Heat Cycle',
      mating: 'Mating',
      pregnancy: 'Pregnancy',
      birth: 'Birth',
      addRecord: 'Add Record',
      eventDate: 'Event Date',
      recordType: 'Record Type',
      heatCycleDay: 'Heat Cycle Day',
      matingType: 'Mating Type',
      natural: 'Natural',
      artificial: 'Artificial (AI)',
      studName: 'Stud Animal Name',
      expectedDue: 'Expected Due Date',
      offspringCount: 'Number of Offspring',
      notes: 'Notes',
      save: 'Save Record',
      cancel: 'Cancel',
      history: 'History',
      stats: 'Statistics',
      export: 'Export CSV',
      share: 'Share',
      noRecords: 'No breeding records yet',
      lastHeat: 'Last Heat',
      nextHeat: 'Next Heat',
      daysUntilHeat: 'Days Until Heat',
      inHeat: 'In Heat',
      daysSinceHeat: 'Days Since Heat',
      successRate: 'Success Rate',
      totalAttempts: 'Total Attempts',
      totalOffspring: 'Total Offspring',
      avgCycle: 'Avg Cycle Days',
      dueDate: 'Due Date',
      overdue: 'Overdue',
      daysPregnant: 'Days Pregnant',
      recommendedWindow: 'Recommended Mating Window',
      optimal: 'Optimal Time',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this record?',
    },
    am: {
      title: 'እርባታ አስተዳደር',
      subtitle: 'ሁስት ዙርያ ፣ እርባታ እና ልጃት መከተል',
      selectAnimal: 'እንስሳ ይምረጡ',
      noAnimals: 'ሴት እንስሳት የሉም',
      heatCycle: 'ሁስት ዙርያ',
      mating: 'እርባታ',
      pregnancy: 'ጉደት',
      birth: 'ልጃት',
      addRecord: 'ምዝገባ ጨምር',
      eventDate: 'ቀን',
      recordType: 'የምዝገባ አይነት',
      heatCycleDay: 'የሁስት ቀን',
      matingType: 'የእርባታ አይነት',
      natural: 'ተፈጥሮ',
      artificial: 'ሰው ሰራ',
      studName: 'የእንስሳው ስም',
      expectedDue: 'ተጠባቂ ቀን',
      offspringCount: 'የልጆች ቁጥር',
      notes: 'ማስታወሻ',
      save: 'መዝግብ',
      cancel: 'ይቁም',
      history: 'ታሪክ',
      stats: 'ስታቲስቲክስ',
      export: 'ኤክስፖርት',
      share: 'አጋራ',
      noRecords: 'እርባታ ምዝገባ የለም',
      lastHeat: 'መጨረሻ ሁስት',
      nextHeat: 'ቀጣይ ሁስት',
      daysUntilHeat: 'የሚቀረው ቀን',
      inHeat: 'በሁስት ላይ',
      daysSinceHeat: 'ከሁስት ያለፈው ቀን',
      successRate: 'የተሳካ ነጥብ',
      totalAttempts: 'ጠቅላላ ሙከራ',
      totalOffspring: 'ጠቅላላ ልጆች',
      avgCycle: 'አማካይ ዙርያ',
      dueDate: 'ተጠባቂ ቀን',
      overdue: 'ተርፏል',
      daysPregnant: 'የጉደት ቀን',
      recommendedWindow: 'የተመረቀ ጊዜ',
      optimal: 'ጥሩ ጊዜ',
      delete: 'አጥፋ',
      confirmDelete: 'ይህን ምዝገባ መሰረዝ ይፈልጋሉ?',
    },
  };

  const tt = language === 'am' ? t.am : t.en;

  // Fetch female animals
  const { data: animals = [], isLoading: animalsLoading } = useQuery<Animal[]>({
    queryKey: ['female-animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('animals')
        .select('id, name, type, gender, animal_id')
        .eq('user_id', user.id)
        .eq('gender', 'female')
        .eq('status', 'active')
        .order('name');
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch breeding records
  const { data: breedingRecords = [], isLoading: recordsLoading } = useQuery<BreedingRecord[]>({
    queryKey: ['breeding-records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return getAllBreedingRecords(user.id);
    },
    enabled: !!user,
  });

  // Get heat cycle info
  const { data: heatCycleInfo } = useQuery<HeatCycleInfo | null>({
    queryKey: ['heat-cycle', selectedAnimalId],
    queryFn: async () => {
      if (!selectedAnimalId) return null;
      return getHeatCycleInfo(selectedAnimalId);
    },
    enabled: !!selectedAnimalId,
  });

  // Get breeding stats
  const { data: breedingStats } = useQuery<BreedingStats>({
    queryKey: ['breeding-stats', selectedAnimalId],
    queryFn: async () => {
      if (!selectedAnimalId) {
        return {
          totalBreedingAttempts: 0,
          successfulPregnancies: 0,
          failedAttempts: 0,
          successRate: 0,
          averageDaysBetweenHeat: 0,
          totalOffspring: 0,
        };
      }
      return getBreedingStats(selectedAnimalId);
    },
    enabled: !!selectedAnimalId,
  });

  // Filter records by selected animal
  const filteredRecords = useMemo(() => {
    if (!selectedAnimalId) return breedingRecords;
    return breedingRecords.filter((r) => r.animal_id === selectedAnimalId);
  }, [breedingRecords, selectedAnimalId]);

  // Select first animal by default
  useEffect(() => {
    if (animals.length > 0 && !selectedAnimalId) {
      setSelectedAnimalId(animals[0].id);
    }
  }, [animals, selectedAnimalId]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedAnimalId) return;
      
      const data: any = {
        animal_id: selectedAnimalId,
        record_type: formData.record_type,
        event_date: formData.event_date,
        notes: formData.notes || null,
        reminder_enabled: formData.reminder_enabled,
      };

      // Add type-specific data
      if (formData.record_type === 'heat') {
        data.heat_cycle_day = formData.heat_cycle_day;
      } else if (formData.record_type === 'mating') {
        data.mating_type = formData.mating_type;
        data.stud_name = formData.stud_name || null;
        // Calculate due date
        const animal = animals.find((a) => a.id === selectedAnimalId);
        if (animal) {
          data.expected_due_date = calculateDueDate(formData.event_date, animal.type);
        }
      } else if (formData.record_type === 'birth') {
        data.actual_birth_date = formData.event_date;
        data.offspring_count = formData.offspring_count;
        data.outcome = 'successful';
      }

      await createBreedingRecord(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
      queryClient.invalidateQueries({ queryKey: ['heat-cycle', selectedAnimalId] });
      queryClient.invalidateQueries({ queryKey: ['breeding-stats', selectedAnimalId] });
      setShowAddForm(false);
      setFormData({
        record_type: 'heat',
        event_date: new Date().toISOString().split('T')[0],
        heat_cycle_day: 0,
        mating_type: 'natural',
        stud_name: '',
        expected_due_date: '',
        offspring_count: 1,
        notes: '',
        reminder_enabled: true,
      });
      toast.success(tt.addRecord + ' ✓');
    },
    onError: () => {
      toast.error('Error saving record');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => {
      if (!user) return;
      await deleteBreedingRecord(user.id, recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
      queryClient.invalidateQueries({ queryKey: ['breeding-stats', selectedAnimalId] });
      toast.success(tt.delete + ' ✓');
    },
  });

  // Export handler
  const handleExport = () => {
    const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);
    if (!selectedAnimal) return;

    const csv = exportBreedingRecordsToCSV(
      filteredRecords,
      selectedAnimal.name,
      selectedAnimal.animal_id || selectedAnimal.id
    );

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breeding_${selectedAnimal.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(tt.export + ' ✓');
  };

  // Share handler
  const handleShare = async () => {
    const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);
    if (!selectedAnimal) return;

    const text = `Breeding History - ${selectedAnimal.name}\n` +
      filteredRecords.map((r) => 
        `${r.event_date}: ${r.record_type} - ${r.outcome || 'N/A'}`
      ).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Breeding - ${selectedAnimal.name}`,
          text,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  // Get record type badge color
  const getRecordBadge = (type: RecordType) => {
    switch (type) {
      case 'heat':
        return <Badge className="bg-pink-100 text-pink-800">🩷 {tt.heatCycle}</Badge>;
      case 'mating':
        return <Badge className="bg-purple-100 text-purple-800">💜 {tt.mating}</Badge>;
      case 'pregnancy_confirmed':
        return <Badge className="bg-green-100 text-green-800">✅ {tt.pregnancy}</Badge>;
      case 'birth':
        return <Badge className="bg-blue-100 text-blue-800">👶 {tt.birth}</Badge>;
      case 'failed_mating':
        return <Badge className="bg-red-100 text-red-800">❌ Failed</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Get outcome icon
  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case 'successful':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  // Calculate days until due
  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = differenceInDays(parseISO(dueDate), new Date());
    return days;
  };

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);
  const recommendedWindow = heatCycleInfo ? getRecommendedMatingWindow(heatCycleInfo) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">{tt.title}</h1>
          <p className="text-sm text-gray-600">{tt.subtitle}</p>
        </header>

        {/* Animal Selector */}
        <div className="px-4 py-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tt.selectAnimal}
          </label>
          <select
            value={selectedAnimalId || ''}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {animalsLoading ? (
              <option>Loading...</option>
            ) : animals.length === 0 ? (
              <option>{tt.noAnimals}</option>
            ) : (
              animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} ({animal.type})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Heat Cycle Info Card */}
        {heatCycleInfo && selectedAnimal && (
          <div className="px-4 py-2">
            <Card className={heatCycleInfo.isInHeat ? 'border-pink-500 border-2' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className={`w-5 h-5 ${heatCycleInfo.isInHeat ? 'text-pink-500 animate-pulse' : 'text-gray-400'}`} />
                    <span className="font-medium">
                      {heatCycleInfo.isInHeat ? tt.inHeat : tt.heatCycle}
                    </span>
                  </div>
                  {heatCycleInfo.isInHeat && (
                    <Badge className="bg-pink-500 text-white">🩷 {tt.inHeat}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">{tt.lastHeat}</p>
                    <p className="font-medium">
                      {heatCycleInfo.lastHeatDate
                        ? format(parseISO(heatCycleInfo.lastHeatDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {heatCycleInfo.daysSinceHeat} {tt.daysSinceHeat}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{tt.nextHeat}</p>
                    <p className="font-medium">
                      {heatCycleInfo.nextHeatDate
                        ? format(parseISO(heatCycleInfo.nextHeatDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {heatCycleInfo.daysUntilHeat} {tt.daysUntilHeat}
                    </p>
                  </div>
                </div>

                {/* Recommended Mating Window */}
                {recommendedWindow && (
                  <div className={`mt-3 p-2 rounded-lg ${recommendedWindow.optimal ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{tt.recommendedWindow}</span>
                      {recommendedWindow.optimal && (
                        <Badge className="bg-green-500 text-white">⭐ {tt.optimal}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {recommendedWindow.startDate} - {recommendedWindow.endDate}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-3 flex gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {tt.addRecord}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {tt.export}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-4 py-3">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">{tt.addRecord}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tt.recordType}
                  </label>
                  <select
                    value={formData.record_type}
                    onChange={(e) => setFormData({ ...formData, record_type: e.target.value as RecordType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="heat">{tt.heatCycle}</option>
                    <option value="mating">{tt.mating}</option>
                    <option value="birth">{tt.birth}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tt.eventDate}
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {formData.record_type === 'heat' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tt.heatCycleDay}
                    </label>
                    <input
                      type="number"
                      value={formData.heat_cycle_day}
                      onChange={(e) => setFormData({ ...formData, heat_cycle_day: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {formData.record_type === 'mating' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {tt.matingType}
                      </label>
                      <select
                        value={formData.mating_type}
                        onChange={(e) => setFormData({ ...formData, mating_type: e.target.value as 'natural' | 'artificial' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="natural">{tt.natural}</option>
                        <option value="artificial">{tt.artificial}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {tt.studName}
                      </label>
                      <input
                        type="text"
                        value={formData.stud_name}
                        onChange={(e) => setFormData({ ...formData, stud_name: e.target.value })}
                        placeholder="Bull/Stud name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </>
                )}

                {formData.record_type === 'birth' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tt.offspringCount}
                    </label>
                    <input
                      type="number"
                      value={formData.offspring_count}
                      onChange={(e) => setFormData({ ...formData, offspring_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tt.notes}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="flex-1 bg-emerald-500"
                  >
                    {createMutation.isPending ? '...' : tt.save}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    {tt.cancel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Summary */}
        {breedingStats && selectedAnimal && (
          <div className="px-4 py-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">{tt.stats}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{breedingStats.successRate}%</p>
                    <p className="text-xs text-gray-500">{tt.successRate}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{breedingStats.totalBreedingAttempts}</p>
                    <p className="text-xs text-gray-500">{tt.totalAttempts}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{breedingStats.totalOffspring}</p>
                    <p className="text-xs text-gray-500">{tt.totalOffspring}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Breeding History */}
        <div className="px-4 py-3">
          <h3 className="font-medium mb-3">{tt.history}</h3>
          
          {recordsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">{tt.noRecords}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        {getOutcomeIcon(record.outcome)}
                        <div>
                          <div className="flex items-center gap-2">
                            {getRecordBadge(record.record_type)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(record.event_date), 'MMM dd, yyyy')}
                          </p>
                          {record.record_type === 'mating' && record.expected_due_date && (
                            <p className="text-xs text-gray-500">
                              {tt.dueDate}: {record.expected_due_date}
                              {getDaysUntilDue(record.expected_due_date) !== null && (
                                <span className={getDaysUntilDue(record.expected_due_date)! < 0 ? 'text-red-500 ml-1' : 'ml-1'}>
                                  ({getDaysUntilDue(record.expected_due_date)! < 0 
                                    ? `${Math.abs(getDaysUntilDue(record.expected_due_date)!)} ${tt.overdue}`
                                    : `${getDaysUntilDue(record.expected_due_date)} days`})
                                </span>
                              )}
                            </p>
                          )}
                          {record.stud_name && (
                            <p className="text-xs text-gray-500">
                              Stud: {record.stud_name}
                            </p>
                          )}
                          {record.offspring_count && (
                            <p className="text-xs text-gray-500">
                              {record.offspring_count} offspring
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(tt.confirmDelete)) {
                            deleteMutation.mutate(record.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BreedingRecordsPage;
