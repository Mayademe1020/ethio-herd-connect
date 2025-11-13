/**
 * Monetization Service for Ethio Herd Connect
 * Handles posting fees, advertising, and NGO sponsorships
 * Uses existing database structure with localStorage fallbacks
 */

export interface PostingFee {
  id: string;
  amount: number;
  currency: 'ETB';
  description: string;
  animal_type?: string;
  duration_days: number;
  features: string[];
  is_premium: boolean;
}

export interface Advertisement {
  id: string;
  business_name: string;
  business_type: 'vet' | 'medicine' | 'product' | 'feed' | 'equipment';
  title: string;
  description: string;
  image_url?: string;
  contact_phone: string;
  location?: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  daily_budget: number;
  impressions: number;
  clicks: number;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  type: 'posting_fee' | 'advertisement' | 'verification';
  amount: number;
  currency: 'ETB';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'telebirr' | 'cbe_bank' | 'dashen_bank' | 'awash_international' | 'mpesa';
  reference_id: string;
  description: string;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  listing_id: string;
  expert_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  video_call_scheduled?: string;
  verification_notes?: string;
  verified_at?: string;
  fee_amount: number;
}

class MonetizationService {
  private static instance: MonetizationService;

  // Ethiopian payment methods
  private readonly PAYMENT_METHODS = {
    telebirr: { name: 'TeleBirr', code: 'telebirr' },
    cbe_bank: { name: 'CBE Bank', code: 'cbe_bank' },
    dashen_bank: { name: 'Dashen Bank', code: 'dashen_bank' },
    awash_international: { name: 'Awash International', code: 'awash_international' },
    mpesa: { name: 'M-Pesa', code: 'mpesa' }
  };

  // Posting fees by animal type (in ETB) - Ethiopian market pricing
  private readonly POSTING_FEES: PostingFee[] = [
    {
      id: 'cattle_basic',
      amount: 50,
      currency: 'ETB',
      description: 'Basic cattle listing (7 days)',
      animal_type: 'cattle',
      duration_days: 7,
      is_premium: false,
      features: ['Basic listing', 'Photo upload', 'Buyer interest tracking']
    },
    {
      id: 'cattle_premium',
      amount: 150,
      currency: 'ETB',
      description: 'Premium cattle listing (30 days) + Video verification',
      animal_type: 'cattle',
      duration_days: 30,
      is_premium: true,
      features: ['Premium listing', 'Video upload', 'Video verification call', 'Priority placement', 'Analytics']
    },
    {
      id: 'goat_basic',
      amount: 30,
      currency: 'ETB',
      description: 'Basic goat/sheep listing (7 days)',
      animal_type: 'goat',
      duration_days: 7,
      is_premium: false,
      features: ['Basic listing', 'Photo upload', 'Buyer interest tracking']
    },
    {
      id: 'goat_premium',
      amount: 100,
      currency: 'ETB',
      description: 'Premium goat/sheep listing (30 days) + Video verification',
      animal_type: 'goat',
      duration_days: 30,
      is_premium: true,
      features: ['Premium listing', 'Video upload', 'Video verification call', 'Priority placement', 'Analytics']
    }
  ];

  private constructor() {}

  static getInstance(): MonetizationService {
    if (!MonetizationService.instance) {
      MonetizationService.instance = new MonetizationService();
    }
    return MonetizationService.instance;
  }

  // Posting Fee Management
  getPostingFees(animalType?: string): PostingFee[] {
    if (animalType) {
      return this.POSTING_FEES.filter(fee => fee.animal_type === animalType);
    }
    return this.POSTING_FEES;
  }

  getPostingFeeById(id: string): PostingFee | undefined {
    return this.POSTING_FEES.find(fee => fee.id === id);
  }

  // Simulate payment processing (integrate with Ethiopian payment gateways later)
  async createPostingFeePayment(
    userId: string,
    feeId: string,
    paymentMethod: keyof typeof MonetizationService.prototype.PAYMENT_METHODS
  ): Promise<PaymentTransaction> {
    const fee = this.getPostingFeeById(feeId);
    if (!fee) {
      throw new Error('Invalid posting fee ID');
    }

    const transaction: PaymentTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: 'posting_fee',
      amount: fee.amount,
      currency: 'ETB',
      status: 'pending',
      payment_method: paymentMethod,
      reference_id: `PF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `${fee.description} - ${fee.amount} ETB`,
      created_at: new Date().toISOString()
    };

    // Store in localStorage for now (replace with database later)
    this.saveTransactionLocally(transaction);

    return transaction;
  }

  // Advertisement Management (localStorage based for MVP)
  async createAdvertisement(adData: Omit<Advertisement, 'id' | 'impressions' | 'clicks'>): Promise<Advertisement> {
    const advertisement: Advertisement = {
      ...adData,
      id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      impressions: 0,
      clicks: 0
    };

    this.saveAdvertisementLocally(advertisement);
    return advertisement;
  }

  async getActiveAdvertisements(businessType?: string): Promise<Advertisement[]> {
    const ads = this.getAdvertisementsLocally();
    const activeAds = ads.filter(ad =>
      ad.is_active &&
      new Date(ad.end_date || '2099-12-31') > new Date()
    );

    if (businessType) {
      return activeAds.filter(ad => ad.business_type === businessType);
    }

    return activeAds;
  }

  async trackAdImpression(adId: string): Promise<void> {
    const ads = this.getAdvertisementsLocally();
    const adIndex = ads.findIndex(ad => ad.id === adId);
    if (adIndex !== -1) {
      ads[adIndex].impressions += 1;
      this.saveAdvertisementsLocally(ads);
    }
  }

  async trackAdClick(adId: string): Promise<void> {
    const ads = this.getAdvertisementsLocally();
    const adIndex = ads.findIndex(ad => ad.id === adId);
    if (adIndex !== -1) {
      ads[adIndex].clicks += 1;
      this.saveAdvertisementsLocally(ads);
    }
  }

  // NGO Sponsorship System (localStorage based)
  async createSponsorship(
    ngoId: string,
    amount: number,
    duration_months: number,
    benefits: string[]
  ): Promise<any> {
    const sponsorship = {
      id: `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ngo_id: ngoId,
      amount,
      duration_months,
      benefits,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + duration_months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };

    this.saveSponsorshipLocally(sponsorship);
    return sponsorship;
  }

  // Video Verification System (localStorage based)
  async requestVerification(
    listingId: string,
    expertId: string,
    feeAmount: number = 200
  ): Promise<VerificationRequest> {
    const verification: VerificationRequest = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      listing_id: listingId,
      expert_id: expertId,
      status: 'pending',
      fee_amount: feeAmount
    };

    this.saveVerificationLocally(verification);
    return verification;
  }

  async scheduleVerificationCall(
    verificationId: string,
    scheduledTime: string
  ): Promise<void> {
    const verifications = this.getVerificationsLocally();
    const verificationIndex = verifications.findIndex(v => v.id === verificationId);
    if (verificationIndex !== -1) {
      verifications[verificationIndex].status = 'in_progress';
      verifications[verificationIndex].video_call_scheduled = scheduledTime;
      this.saveVerificationsLocally(verifications);
    }
  }

  async completeVerification(
    verificationId: string,
    notes: string,
    approved: boolean
  ): Promise<void> {
    const verifications = this.getVerificationsLocally();
    const verificationIndex = verifications.findIndex(v => v.id === verificationId);
    if (verificationIndex !== -1) {
      verifications[verificationIndex].status = approved ? 'completed' : 'rejected';
      verifications[verificationIndex].verification_notes = notes;
      verifications[verificationIndex].verified_at = new Date().toISOString();
      this.saveVerificationsLocally(verifications);
    }
  }

  // Payment Processing (simulated for Ethiopian payment methods)
  async processPayment(
    transactionId: string,
    paymentDetails: any
  ): Promise<PaymentTransaction> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const transaction = this.getTransactionLocally(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Simulate Ethiopian payment gateway integration
    const updatedTransaction: PaymentTransaction = {
      ...transaction,
      status: 'completed'
    };

    this.updateTransactionLocally(updatedTransaction);
    return updatedTransaction;
  }

  // Revenue Analytics
  getRevenueAnalytics(timeframe: 'week' | 'month' | 'year' = 'month'): any {
    const transactions = this.getTransactionsLocally();
    const now = new Date();
    const timeframeStart = new Date();

    switch (timeframe) {
      case 'week':
        timeframeStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeframeStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        timeframeStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const relevantTransactions = transactions.filter(t =>
      new Date(t.created_at) >= timeframeStart && t.status === 'completed'
    );

    const totalRevenue = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const postingFees = relevantTransactions.filter(t => t.type === 'posting_fee').length;
    const verificationFees = relevantTransactions.filter(t => t.type === 'verification').length;

    return {
      total_revenue: totalRevenue,
      transaction_count: relevantTransactions.length,
      posting_fees_count: postingFees,
      verification_fees_count: verificationFees,
      average_transaction: relevantTransactions.length > 0 ? totalRevenue / relevantTransactions.length : 0
    };
  }

  // Local Storage Helpers
  private saveTransactionLocally(transaction: PaymentTransaction): void {
    const transactions = this.getTransactionsLocally();
    transactions.push(transaction);
    localStorage.setItem('ethio_herd_transactions', JSON.stringify(transactions));
  }

  private getTransactionLocally(id: string): PaymentTransaction | null {
    const transactions = this.getTransactionsLocally();
    return transactions.find(t => t.id === id) || null;
  }

  private updateTransactionLocally(transaction: PaymentTransaction): void {
    const transactions = this.getTransactionsLocally();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      transactions[index] = transaction;
      localStorage.setItem('ethio_herd_transactions', JSON.stringify(transactions));
    }
  }

  private getTransactionsLocally(): PaymentTransaction[] {
    try {
      const stored = localStorage.getItem('ethio_herd_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveAdvertisementLocally(ad: Advertisement): void {
    const ads = this.getAdvertisementsLocally();
    ads.push(ad);
    localStorage.setItem('ethio_herd_ads', JSON.stringify(ads));
  }

  private getAdvertisementsLocally(): Advertisement[] {
    try {
      const stored = localStorage.getItem('ethio_herd_ads');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveAdvertisementsLocally(ads: Advertisement[]): void {
    localStorage.setItem('ethio_herd_ads', JSON.stringify(ads));
  }

  private saveSponsorshipLocally(sponsorship: any): void {
    const sponsors = this.getSponsorshipsLocally();
    sponsors.push(sponsorship);
    localStorage.setItem('ethio_herd_sponsors', JSON.stringify(sponsors));
  }

  private getSponsorshipsLocally(): any[] {
    try {
      const stored = localStorage.getItem('ethio_herd_sponsors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveVerificationLocally(verification: VerificationRequest): void {
    const verifications = this.getVerificationsLocally();
    verifications.push(verification);
    localStorage.setItem('ethio_herd_verifications', JSON.stringify(verifications));
  }

  getVerificationsLocally(): VerificationRequest[] {
    try {
      const stored = localStorage.getItem('ethio_herd_verifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveVerificationsLocally(verifications: VerificationRequest[]): void {
    localStorage.setItem('ethio_herd_verifications', JSON.stringify(verifications));
  }

  // Utility methods
  getPaymentMethods() {
    return this.PAYMENT_METHODS;
  }

  calculateAdCost(impressions: number, clicks: number, dailyBudget: number): number {
    // Simple CPC (Cost Per Click) model - 2 ETB per click
    const cpc = 2;
    const dailyCost = Math.min(clicks * cpc, dailyBudget);
    return dailyCost;
  }

  // Ethiopian market-specific pricing recommendations
  getEthiopianPricingStrategy(): any {
    return {
      posting_fees: {
        basic: { cattle: 50, goat: 30 },
        premium: { cattle: 150, goat: 100 },
        rationale: 'Based on traditional broker fees (5-10% of animal value)'
      },
      verification: {
        fee: 200,
        rationale: 'Covers expert time + platform fee'
      },
      advertising: {
        cpc: 2, // Cost per click
        daily_budget_min: 100,
        rationale: 'Affordable for small veterinary businesses'
      },
      ngo_sponsorship: {
        monthly_fee: 5000,
        benefits: ['Branded marketplace access', 'Priority support', 'Impact reporting']
      }
    };
  }
}

// Export singleton instance
export const monetizationService = MonetizationService.getInstance();