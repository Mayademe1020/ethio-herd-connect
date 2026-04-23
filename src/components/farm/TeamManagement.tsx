import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFarm } from '@/hooks/useFarm';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Trash2,
  Shield,
  ShieldCheck,
  Clock,
  Loader2,
  UserPlus,
  Phone,
} from 'lucide-react';
import type { FarmMember, FarmInvitation } from '@/types/farm';

export const TeamManagement: React.FC = () => {
  const { language } = useLanguage();
  const {
    farm,
    members,
    invitations,
    isOwner,
    isLoading,
    addMember,
    isAddingMember,
    toggleFinancialAccess,
    removeMember,
    isRemovingMember,
    deleteInvitation,
    createFarm,
    isCreating,
  } = useFarm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const t = (en: string, am: string) => (language === 'am' ? am : en);

  // No farm yet - show create farm prompt
  if (!isLoading && !farm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">
            {t('Farm Team', 'የእርሻ ቡድን')}
          </h3>
        </div>

        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            {t(
              'Create a farm to invite workers and share access.',
              'ሰራተኞችን ለመጋበዝ እርሻ ይፍጠሩ።'
            )}
          </p>
          <Button onClick={() => setShowCreateFarm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('Create Farm', 'እርሻ ይፍጠሩ')}
          </Button>
        </div>

        {/* Create Farm Dialog */}
        <Dialog open={showCreateFarm} onOpenChange={setShowCreateFarm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('Create Your Farm', 'እርሻዎን ይፍጠሩ')}</DialogTitle>
              <DialogDescription>
                {t(
                  'This lets you invite workers to help manage your animals.',
                  'ይህ ሰራተኞችን እንስቶችዎን እንዲያስተናግዱ ያስችላል።'
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('Farm Name', 'የእርሻ ስም')} *</Label>
                <Input
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder={t('e.g. Abebe Dairy Farm', 'ለም. አበበ ወተት እርሻ')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateFarm(false)}>
                {t('Cancel', 'ሰርዝ')}
              </Button>
              <Button
                onClick={async () => {
                  if (!farmName.trim()) {
                    toast.error(t('Please enter a farm name', 'እባክዎ የእርሻ ስም ያስገቡ'));
                    return;
                  }
                  try {
                    await createFarm(farmName.trim());
                    toast.success(t('Farm created!', 'እርሻ ተፈጥሯል!'));
                    setShowCreateFarm(false);
                    setFarmName('');
                  } catch (err) {
                    toast.error(t('Failed to create farm', 'እርሻ ማፍጠር አልተቻለም'));
                  }
                }}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {t('Create', 'ፍጠር')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const handleAddMember = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^9\d{8}$/.test(cleanPhone)) {
      setPhoneError(t('Enter Ethiopian phone: 9XXXXXXXX', 'የኢትዮጵያ ስም ያስገቡ: 9XXXXXXXX'));
      return;
    }

    try {
      const result = await addMember({ phone: cleanPhone, role: 'worker' });
      if (result.type === 'added') {
        toast.success(t('Worker added to farm!', 'ሰራተኛ ወደ እርሻ ተጨምሯል!'));
      } else {
        toast.success(
          t('Invitation sent. They will join when they sign up.', 'ግብዣ ተልኳል። ሲመዘገቡ ይቀላቀላሉ።')
        );
      }
      setShowAddModal(false);
      setPhone('');
      setPhoneError('');
    } catch (err: any) {
      toast.error(err.message || t('Failed to add member', 'አባል ማከል አልተቻለም'));
    }
  };

  const handleToggleFinancial = (memberId: string, currentValue: boolean) => {
    toggleFinancialAccess({ memberId, canView: !currentValue });
  };

  const handleRemoveMember = async (member: FarmMember) => {
    const name = member.profile?.farmer_name || 'this member';
    if (!confirm(t(`Remove ${name} from the farm?`, `${name}ን ከእርሻ ያስወግዱ?`))) return;

    try {
      await removeMember(member.id);
      toast.success(t('Member removed', 'አባል ተወግዷል'));
    } catch (err) {
      toast.error(t('Failed to remove member', 'አባል ማስወገድ አልተቻለም'));
    }
  };

  const handleDeleteInvitation = async (invitation: FarmInvitation) => {
    try {
      await deleteInvitation(invitation.id);
      toast.success(t('Invitation cancelled', 'ግብዣ ተሰርዟል'));
    } catch (err) {
      toast.error(t('Failed to cancel invitation', 'ግብዣ ማሰረዝ አልተቻለም'));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'am' ? 'am-ET' : 'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">
            {t('Farm Team', 'የእርሻ ቡድን')}
          </h3>
          <span className="text-sm text-gray-500">
            ({members.length} {members.length === 1 ? t('member', 'አባል') : t('members', 'አባሎች')})
          </span>
        </div>

        {isOwner && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            {t('Add Worker', 'ሰራተኛ ጨምር')}
          </Button>
        )}
      </div>

      {/* Farm name */}
      {farm && (
        <p className="text-sm text-gray-500">
          {farm.name}
          {farm.location ? ` · ${farm.location}` : ''}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Members list */}
      {!isLoading && members.length > 0 && (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    member.role === 'owner' ? 'bg-green-600' : 'bg-blue-500'
                  }`}
                >
                  {(member.profile?.farmer_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {member.profile?.farmer_name || t('Unknown', 'ያልታወቀ')}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {member.role === 'owner' ? (
                      <span className="flex items-center gap-1 text-green-700">
                        <ShieldCheck className="w-3 h-3" />
                        {t('Owner', 'ባለቤት')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Shield className="w-3 h-3" />
                        {t('Worker', 'ሰራተኛ')}
                      </span>
                    )}
                    {member.profile?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {member.profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions (owner only, not for self) */}
              {isOwner && member.role !== 'owner' && (
                <div className="flex items-center gap-3">
                  {/* Financial toggle */}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`financial-${member.id}`}
                      className="text-xs text-gray-500 cursor-pointer whitespace-nowrap"
                    >
                      {t('Finances', 'ገንዘብ')}
                    </Label>
                    <Switch
                      id={`financial-${member.id}`}
                      checked={member.can_view_financials}
                      onCheckedChange={() =>
                        handleToggleFinancial(member.id, member.can_view_financials)
                      }
                    />
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member)}
                    disabled={isRemovingMember}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {t('Pending Invitations', 'በመጠባበቅ ላይ ያሉ ግብዣዎች')}
          </h4>
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">+251 {inv.phone}</p>
                  <p className="text-xs text-amber-700">
                    {t('Waiting to sign up', 'ይመዝገባሉ በመጠባበቅ ላይ')}
                    {' · '}
                    {t('Expires', 'ያበቃል')} {formatDate(inv.expires_at)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteInvitation(inv)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && members.length <= 1 && invitations.length === 0 && isOwner && (
        <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
          <UserPlus className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-3">
            {t(
              'Add workers by phone number. They will see your animals and can record milk, health, and growth data.',
              'ሰራተኞችን በስልክ ቁጥር ያክሉ። እንስቶችዎን ያያሉ እና ወተት፣ ጤና እና እድገት መረጃ ማቅረብ ይችላሉ።'
            )}
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            {t('Add Worker', 'ሰራተኛ ጨምር')}
          </Button>
        </div>
      )}

      {/* Add Worker Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Add Worker', 'ሰራተኛ ጨምር')}</DialogTitle>
            <DialogDescription>
              {t(
                'Enter the worker\'s phone number. They will be able to view animals and record data.',
                'የሰራተኛውን ስልክ ቁጥር ያስገቡ። እንስቶችን ማየት እና መረጃ ማቅረብ ይችላሉ።'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="worker-phone">
                {t('Phone Number', 'ስልክ ቁጥር')} *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  +251
                </span>
                <Input
                  id="worker-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setPhone(val);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="9XXXXXXXX"
                  className={phoneError ? 'border-red-500' : ''}
                  maxLength={9}
                />
              </div>
              {phoneError && (
                <p className="text-sm text-red-600">{phoneError}</p>
              )}
              <p className="text-xs text-gray-500">
                {t(
                  'If they already have the app, they will be added immediately. Otherwise, they will join when they sign up.',
                  'መተግበሪያው ካላቸው ቶሎ ይጨመራሉ። ያለዚያ ሲመዘገቡ ይቀላቀላሉ።'
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setPhone('');
                setPhoneError('');
              }}
            >
              {t('Cancel', 'ሰርዝ')}
            </Button>
            <Button onClick={handleAddMember} disabled={isAddingMember || !phone}>
              {isAddingMember ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              {t('Add', 'ጨምር')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
