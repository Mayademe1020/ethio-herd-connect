
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Edit3, Save, X, History, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnimalIdEditHistory {
  id: string;
  oldId: string;
  newId: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

interface EditableAnimalIdProps {
  animalId: string;
  computerId: string; // This is the immutable tracking ID
  onIdChange: (newId: string, reason: string) => void;
  editHistory: AnimalIdEditHistory[];
  language: 'am' | 'en' | 'or' | 'sw';
  canEdit?: boolean;
}

const translations = {
  am: {
    editId: 'መለያ ይቀይሩ',
    save: 'አስቀምጥ',
    cancel: 'ሰርዝ',
    history: 'ታሪክ',
    computerId: 'የኮምፒውተር መለያ',
    userEditableId: 'የተጠቃሚ መለያ',
    reason: 'ምክንያት',
    enterReason: 'የለውጥ ምክንያት ያስገቡ',
    duplicate: 'ይህ መለያ አለ',
    invalid: 'ተቀባይነት የሌለው መለያ',
    editHistory: 'የለውጥ ታሪክ',
    noHistory: 'ምንም ለውጥ ታሪክ የለም'
  },
  en: {
    editId: 'Edit ID',
    save: 'Save',
    cancel: 'Cancel',
    history: 'History',
    computerId: 'Computer ID',
    userEditableId: 'User Editable ID',
    reason: 'Reason',
    enterReason: 'Enter reason for change',
    duplicate: 'This ID already exists',
    invalid: 'Invalid ID format',
    editHistory: 'Edit History',
    noHistory: 'No edit history'
  },
  or: {
    editId: 'Eenyummaa Jijjiiri',
    save: 'Olkaa\'i',
    cancel: 'Dhiisi',
    history: 'Seenaa',
    computerId: 'Eenyummaa Kompiitaraa',
    userEditableId: 'Eenyummaa Fayyadamaa',
    reason: 'Sababa',
    enterReason: 'Sababa jijjiirraa galchi',
    duplicate: 'Eenyummaan kun jira',
    invalid: 'Eenyummaan sirrii miti',
    editHistory: 'Seenaa Jijjiirraa',
    noHistory: 'Seenaan jijjiirraa hin jiru'
  },
  sw: {
    editId: 'Hariri Kitambulisho',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    history: 'Historia',
    computerId: 'Kitambulisho cha Kompyuta',
    userEditableId: 'Kitambulisho cha Mtumiaji',
    reason: 'Sababu',
    enterReason: 'Ingiza sababu ya mabadiliko',
    duplicate: 'Kitambulisho hiki tayari kipo',
    invalid: 'Muundo wa kitambulisho sio sahihi',
    editHistory: 'Historia ya Mabadiliko',
    noHistory: 'Hakuna historia ya mabadiliko'
  }
};

export const EditableAnimalId: React.FC<EditableAnimalIdProps> = ({
  animalId,
  computerId,
  onIdChange,
  editHistory,
  language,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(animalId);
  const [reason, setReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const handleSave = () => {
    if (!editValue.trim()) {
      setError(t.invalid);
      return;
    }
    if (!reason.trim()) {
      setError(t.enterReason);
      return;
    }
    
    onIdChange(editValue, reason);
    setIsEditing(false);
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setEditValue(animalId);
    setReason('');
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Computer ID - Immutable */}
      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t.computerId}:</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {computerId}
          </Badge>
        </div>
      </div>

      {/* User Editable ID */}
      <Card className="border border-green-200">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t.userEditableId}:</span>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {editHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                >
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
              {canEdit && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2 sm:space-y-3">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-7 sm:h-8 text-xs sm:text-sm font-mono"
                placeholder="FARM-COW-001-241222"
              />
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t.enterReason}
                className="h-7 sm:h-8 text-xs sm:text-sm"
              />
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="flex-1 h-7 sm:h-8 text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {t.save}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Badge variant="outline" className="font-mono text-xs sm:text-sm">
              {animalId}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Edit History */}
      {showHistory && (
        <Card className="border border-blue-200">
          <CardContent className="p-2 sm:p-3">
            <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">{t.editHistory}</h4>
            {editHistory.length === 0 ? (
              <p className="text-xs text-gray-500">{t.noHistory}</p>
            ) : (
              <div className="space-y-2">
                {editHistory.map((entry) => (
                  <div key={entry.id} className="border border-gray-100 rounded p-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono">
                          <span className="text-red-600">{entry.oldId}</span>
                          <span className="mx-1">→</span>
                          <span className="text-green-600">{entry.newId}</span>
                        </p>
                        {entry.reason && (
                          <p className="text-gray-600 mt-1">{entry.reason}</p>
                        )}
                      </div>
                      <div className="text-gray-500 text-right">
                        <p>{entry.changedBy}</p>
                        <p>{new Date(entry.changedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
