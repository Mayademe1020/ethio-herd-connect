import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users, Mail, Phone, UserPlus, ArrowLeft } from 'lucide-react';
import { Language } from '@/types';

interface StaffManagementProps {
  language: Language;
  onClose: () => void;
}

export const StaffManagement = ({ language, onClose }: StaffManagementProps) => {
  const [staffMembers] = useState([
    {
      id: '1',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      phone: '+251911234567',
      role: 'Assistant',
      status: 'active'
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const translations = {
    am: {
      title: 'የሰራተኞች አስተዳደር',
      addStaff: 'ሰራተኛ ጨምር',
      name: 'ስም',
      email: 'ኢሜይል',
      phone: 'ስልክ',
      role: 'ሚና',
      status: 'ሁኔታ',
      active: 'ንቁ',
      assistant: 'ረዳት',
      manager: 'አስተዳዳሪ',
      veterinarian: 'የእንስሳት ሐኪም',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      back: 'ተመለስ'
    },
    en: {
      title: 'Staff Management',
      addStaff: 'Add Staff',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      status: 'Status',
      active: 'Active',
      assistant: 'Assistant',
      manager: 'Manager',
      veterinarian: 'Veterinarian',
      save: 'Save',
      cancel: 'Cancel',
      back: 'Back'
    },
    or: {
      title: 'Bulchiinsa Hojjettootaa',
      addStaff: 'Hojjettoo Dabaluu',
      name: 'Maqaa',
      email: 'Imeelii',
      phone: 'Bilbila',
      role: 'Gahee',
      status: 'Haala',
      active: 'Ka\'aa',
      assistant: 'Gargaaraa',
      manager: 'Bulchaa',
      veterinarian: 'Ogeessa Fayyaa Horii',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      back: 'Deebi\'i'
    },
    sw: {
      title: 'Usimamizi wa Wafanyakazi',
      addStaff: 'Ongeza Mfanyakazi',
      name: 'Jina',
      email: 'Barua pepe',
      phone: 'Simu',
      role: 'Jukumu',
      status: 'Hali',
      active: 'Hai',
      assistant: 'Msaidizi',
      manager: 'Meneja',
      veterinarian: 'Daktari wa Mifugo',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      back: 'Rudi'
    }
  };

  const t = translations[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new staff member:', formData);
    // Here you would typically save to your database
    setShowAddForm(false);
    setFormData({ name: '', email: '', phone: '', role: '' });
  };

  const handleShowAddForm = () => {
    console.log('Opening Add Staff form');
    setShowAddForm(true);
  };

  const handleBackToList = () => {
    setShowAddForm(false);
    setFormData({ name: '', email: '', phone: '', role: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <span>{t.title}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 px-4 sm:px-6">
          {!showAddForm ? (
            <div className="space-y-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95 h-12 touch-manipulation"
                onClick={handleShowAddForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addStaff}
              </Button>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Current Staff</h3>
                {staffMembers.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {t.active}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span>{t.assistant}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToList}
                  className="hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t.addStaff}</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName" className="text-sm font-medium">{t.name}</Label>
                  <Input
                    id="staffName"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t.name}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffEmail" className="text-sm font-medium">{t.email}</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t.email}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffPhone" className="text-sm font-medium">{t.phone}</Label>
                  <Input
                    id="staffPhone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t.phone}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffRole" className="text-sm font-medium">{t.role}</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistant">{t.assistant}</SelectItem>
                      <SelectItem value="manager">{t.manager}</SelectItem>
                      <SelectItem value="veterinarian">{t.veterinarian}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700 h-12 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.save}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBackToList} 
                    className="flex-1 h-12 hover:bg-gray-50"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
