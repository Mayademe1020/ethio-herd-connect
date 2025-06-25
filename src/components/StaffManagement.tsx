
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Mail, Phone } from 'lucide-react';
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
      assistant: 'ረዳት'
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
      assistant: 'Assistant'
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
      assistant: 'Gargaaraa'
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
      assistant: 'Msaidizi'
    }
  };

  const t = translations[language];

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
          <Button className="w-full bg-green-600 hover:bg-green-700">
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
        </CardContent>
      </Card>
    </div>
  );
};
