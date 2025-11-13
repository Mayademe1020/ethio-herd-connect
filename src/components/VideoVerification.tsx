/**
 * Video Verification Component for Ethio Herd Connect
 * Handles expert verification calls for marketplace listings
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { monetizationService, VerificationRequest } from '@/services/monetizationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Video, Phone, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface VideoVerificationProps {
  listingId: string;
  onVerificationComplete?: (approved: boolean, notes: string) => void;
  mode?: 'seller' | 'expert' | 'admin';
}

export const VideoVerification: React.FC<VideoVerificationProps> = ({
  listingId,
  onVerificationComplete,
  mode = 'seller'
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [verification, setVerification] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expertNotes, setExpertNotes] = useState('');
  const [approved, setApproved] = useState<boolean | null>(null);

  useEffect(() => {
    loadVerificationStatus();
  }, [listingId]);

  const loadVerificationStatus = async () => {
    try {
      // For now, we'll check localStorage for verification requests
      // In production, this would query the database
      const verifications = monetizationService.getVerificationsLocally();
      const listingVerification = verifications.find(v => v.listing_id === listingId);

      if (listingVerification) {
        setVerification(listingVerification);
        setExpertNotes(listingVerification.verification_notes || '');
      }
    } catch (error) {
      console.error('Error loading verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      const newVerification = await monetizationService.requestVerification(
        listingId,
        'expert_123', // In production, this would be assigned to available experts
        200 // 200 ETB fee
      );

      setVerification(newVerification);
      showToast('የማረጋገጫ ጥያቄ ተልኳል። በቅርቡ እንሐዛለን። / Verification request sent. We will contact you soon.', 'success');
    } catch (error) {
      console.error('Error requesting verification:', error);
      showToast('ጥያቄ መላክ አልተሳካም። እንደገና ይሞክሩ። / Failed to send request. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const scheduleCall = async () => {
    if (!verification) return;

    setActionLoading(true);
    try {
      const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      await monetizationService.scheduleVerificationCall(verification.id, scheduledTime);

      setVerification(prev => prev ? {
        ...prev,
        status: 'in_progress',
        video_call_scheduled: scheduledTime
      } : null);

      showToast('የቪዲዮ ጥሪ ተያዘ። ከተጠቃሚ ጋር እንገናኛለን። / Video call scheduled. We will connect with the seller.', 'success');
    } catch (error) {
      console.error('Error scheduling call:', error);
      showToast('መርሐግብር መያዝ አልተሳካም። / Failed to schedule call.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const completeVerification = async () => {
    if (!verification || approved === null) return;

    setActionLoading(true);
    try {
      await monetizationService.completeVerification(
        verification.id,
        expertNotes,
        approved
      );

      setVerification(prev => prev ? {
        ...prev,
        status: approved ? 'completed' : 'rejected',
        verification_notes: expertNotes,
        verified_at: new Date().toISOString()
      } : null);

      onVerificationComplete?.(approved, expertNotes);

      showToast(
        approved
          ? 'ማረጋገጫ ተሳክቷል። ዝርዝር አሁን የተረጋገጠ ነው። / Verification completed. Listing is now verified.'
          : 'ማረጋገጫ ተሰረዘ። ለተጠቃሚ መልእክት ተልኳል። / Verification rejected. User has been notified.',
        approved ? 'success' : 'warning'
      );
    } catch (error) {
      console.error('Error completing verification:', error);
      showToast('ማረጋገጫ መጠናቀቅ አልተሳካም። / Failed to complete verification.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />በመጠባበቅ ላይ / Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Video className="w-3 h-3 mr-1" />በሂደት ላይ / In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />የተረጋገጠ / Verified</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />የተሰረዘ / Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          የቪዲዮ ማረጋገጫ / Video Verification
          {verification && (
            <div className="ml-auto">
              {getStatusBadge(verification.status)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status and Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            ለምን ማረጋገጫ ያስፈልጋል? / Why Verification?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• እንስሳ ጤና እና እድሜ ለማረጋገጥ / Verify animal health and age</li>
            <li>• ገዢዎች ለመርዝ እምነት ያላቸው መሆኑን ለማረጋገጥ / Build buyer confidence</li>
            <li>• ከልምዱ አከባበር ምርመራ ተካክቷል / Replaces traditional broker inspection</li>
            <li>• የተረጋገጠ ዝርዝር ተጨማሪ ገዢዎችን ያስተያየዳል / Verified listings attract more buyers</li>
          </ul>
        </div>

        {/* Verification Request/Status */}
        {!verification && mode === 'seller' && (
          <div className="text-center space-y-4">
            <div className="text-gray-600">
              ዝርዝርዎን ለማረጋገጥ እና ተጨማሪ ገዢዎችን ለማስተያየት የቪዲዮ ማረጋገጫ ያድርጉ።
              <br />
              Get your listing verified to attract more buyers.
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-lg font-bold text-green-600">200 ብር</div>
              <div className="text-sm text-green-700">አንድ ጊዜ ክፍያ / One-time fee</div>
            </div>
            <Button
              onClick={requestVerification}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  በመላክ ላይ... / Sending...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  ማረጋገጫ ያድርጉ / Request Verification
                </>
              )}
            </Button>
          </div>
        )}

        {/* Expert View - Schedule Call */}
        {verification && mode === 'expert' && verification.status === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <User className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-900">አዲስ ማረጋገጫ ጥያቄ / New Verification Request</div>
                <div className="text-sm text-yellow-700">ከተጠቃሚ ጋር የቪዲዮ ጥሪ ያድርጉ / Schedule video call with seller</div>
              </div>
            </div>
            <Button
              onClick={scheduleCall}
              disabled={actionLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  በመርሐግብር ላይ... / Scheduling...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  የቪዲዮ ጥሪ ያድርጉ / Schedule Video Call
                </>
              )}
            </Button>
          </div>
        )}

        {/* Expert View - Complete Verification */}
        {verification && mode === 'expert' && verification.status === 'in_progress' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Video className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">ቪዲዮ ጥሪ ተርሐግብሯል / Video Call Scheduled</div>
                <div className="text-sm text-blue-700">
                  ከተጠቃሚ ጋር ተያያዥ እና እንስሳን ያረጋግጡ / Connect with seller and verify the animal
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                የማረጋገጫ ማስታወሻዎች / Verification Notes
              </label>
              <Textarea
                value={expertNotes}
                onChange={(e) => setExpertNotes(e.target.value)}
                placeholder="እንስሳ ጤና፣ እድሜ፣ ሁኔታ ስለ ማረጋገጫ ያስተያዩ... / Describe animal health, age, condition..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setApproved(true)}
                disabled={actionLoading || !expertNotes.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                ያረጋግጡ / Approve
              </Button>
              <Button
                onClick={() => setApproved(false)}
                disabled={actionLoading || !expertNotes.trim()}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                ያስወግዱ / Reject
              </Button>
            </div>

            {approved !== null && (
              <Button
                onClick={completeVerification}
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    በማረጋገጥ ላይ... / Processing...
                  </>
                ) : (
                  <>
                    ማረጋገጫን ያጠናቅቁ / Complete Verification
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Seller View - Verification Status */}
        {verification && mode === 'seller' && (
          <div className="space-y-4">
            {verification.status === 'pending' && (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-900">በመጠባበቅ ላይ / Pending</h4>
                <p className="text-sm text-yellow-700">
                  የማረጋገጫ ጥያቄዎ ተቀበሏል። በ24 ሰዓታት ውስጥ እንገናኛለን።
                  <br />
                  Your verification request has been received. We'll contact you within 24 hours.
                </p>
              </div>
            )}

            {verification.status === 'in_progress' && (
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Video className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">ቪዲዮ ጥሪ ተርሐግብሯል / Video Call Scheduled</h4>
                <p className="text-sm text-blue-700">
                  እንስሳዎን ለማረጋገጥ ከተራኪ ጋር የቪዲዮ ጥሪ እናደርጋለን።
                  <br />
                  We'll schedule a video call with an expert to verify your animal.
                </p>
                {verification.video_call_scheduled && (
                  <p className="text-sm font-medium text-blue-800 mt-2">
                    ቀን: {new Date(verification.video_call_scheduled).toLocaleDateString('am-ET')}
                  </p>
                )}
              </div>
            )}

            {verification.status === 'completed' && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">የተረጋገጠ! / Verified!</h4>
                <p className="text-sm text-green-700">
                  ዝርዝርዎ በተራኪ ተረጋገጠ። አሁን ተጨማሪ ገዢዎችን ያስተያየዳል።
                  <br />
                  Your listing has been verified by an expert. It will now attract more buyers.
                </p>
                <div className="mt-3">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    ✅ በተራኪ የተረጋገጠ / Expert Verified
                  </Badge>
                </div>
              </div>
            )}

            {verification.status === 'rejected' && (
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-900">የተሰረዘ / Rejected</h4>
                <p className="text-sm text-red-700">
                  ማረጋገጫ አልተሳካም። ለተጨማሪ መረጃ ያግኙን።
                  <br />
                  Verification was not approved. Please contact us for more information.
                </p>
                {verification.verification_notes && (
                  <div className="mt-3 p-3 bg-white border border-red-300 rounded text-left">
                    <p className="text-sm font-medium text-red-900 mb-1">የተራኪ ማስታወሻ / Expert Notes:</p>
                    <p className="text-sm text-red-800">{verification.verification_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoVerification;