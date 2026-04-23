// src/pages/Referrals.tsx - Referral Program Page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { BackButton } from '@/components/BackButton';

const Referrals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate referral code from user ID
  const referralCode = user?.id 
    ? `EHC-${user.id.slice(0, 8).toUpperCase()}`
    : '';

  // Fetch referral stats
  const { data: referralStats, isLoading } = useQuery<any>({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get referrals made by this user
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      // Get referrals received (where this user was referred)
      const { data: received } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_id', user.id);

      return {
        totalReferrals: referrals?.length || 0,
        successfulReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
        bonusesEarned: referrals?.filter(r => r.status === 'completed').length * 50 || 0, // 50 ETB per referral
        referredBy: received?.[0]?.referrer_id || null,
      };
    },
    enabled: !!user,
  });

  const copyReferralLink = () => {
    const referralLink = `https://ethioherd.com/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <BackButton />
        
        <h1 className="text-2xl font-bold mt-4 mb-2">🎁 Referral Program</h1>
        <p className="text-gray-600 mb-6">
          Invite friends to join EthioHerd Connect and earn bonuses!
        </p>

        {/* Your Referral Code */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-6">
          <p className="text-sm opacity-90 mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-xl tracking-wider">
              {referralCode}
            </div>
            <button
              onClick={copyReferralLink}
              className="bg-white text-green-600 px-4 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p className="text-sm opacity-80 mt-3">
            Share this code with friends. They get 10% off their first listing, and you earn {formatPrice(50)} bonus!
          </p>
        </div>

        {/* Stats */}
        {!isLoading && referralStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{referralStats.totalReferrals}</p>
              <p className="text-sm text-gray-500">Invited</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{referralStats.successfulReferrals}</p>
              <p className="text-sm text-gray-500">Successful</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{formatPrice(referralStats.bonusesEarned)}</p>
              <p className="text-sm text-gray-500">Bonuses</p>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">How it works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Share your referral code</p>
                <p className="text-sm text-gray-500">Send your code to friends via WhatsApp, SMS, or any method.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Friend registers</p>
                <p className="text-sm text-gray-500">Your friend creates an account and verifies their phone number.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Both earn rewards</p>
                <p className="text-sm text-gray-500">Your friend gets 10% off their first listing fee, and you earn {formatPrice(50)}!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">Terms & Conditions</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Referral must complete registration and list their first animal</li>
            <li>• Bonus is credited after friend's listing is published</li>
            <li>• Maximum 20 referrals per month qualify for bonuses</li>
            <li>• EthioHerd Connect reserves the right to modify terms</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
