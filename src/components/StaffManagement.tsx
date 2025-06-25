
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users, Mail, Phone, UserPlus } from 'lucide-react';
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
      cancel: 'ሰርዝ'
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
      cancel: 'Cancel'
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
      cancel: 'Dhiisi'
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
      cancel: 'Ghairi'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{t.title}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!showAddForm ? (
            <>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addStaff}
              </Button>

              <div className="space-y-3">
                {staffMembers.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge variant="outline" className="text-green-600">
                        {t.active}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3" />
                        <span>{t.assistant}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <UserPlus className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">{t.addStaff}</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffName">{t.name}</Label>
                <Input
                  id="staffName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffEmail">{t.email}</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t.email}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffPhone">{t.phone}</Label>
                <Input
                  id="staffPhone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t.phone}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffRole">{t.role}</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.role} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">{t.assistant}</SelectItem>
                    <SelectItem value="manager">{t.manager}</SelectItem>
                    <SelectItem value="veterinarian">{t.veterinarian}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)} 
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
