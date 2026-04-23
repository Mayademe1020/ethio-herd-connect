/**
 * Verification Service for Ethio Herd Connect
 * Handles muzzle-based ownership verification for:
 * - Animal transfers (SELLER verification)
 * - Bank loan verification
 * - Insurance verification
 * 
 * This is a PREMIUM service - charged when money changes hands
 */

import { supabase } from '@/integrations/supabase/client';
import { muzzleSearchService } from './muzzleSearchService';
import { monetizationService } from './monetizationService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type VerificationType = 
  | 'ownership_sale'      // Verify seller owns the animal before sale
  | 'ownership_transfer'  // Verify ownership transfer completion
  | 'bank_loan'           // Bank requires ownership proof
  | 'insurance_claim'     // Insurance verification
  | 'police_report';      // Theft/loss verification

export type VerificationStatus = 
  | 'pending'             // Created, awaiting payment
  | 'payment_completed'   // Payment received
  | 'in_progress'         // Verification in progress
  | 'verified'            // Successfully verified
  | 'rejected'            // Verification failed
  | 'expired';            // Verification expired

export interface VerificationFee {
  type: VerificationType;
  amount: number;         // in ETB
  currency: 'ETB';
  description: string;
  processingTime: string; // e.g., "24 hours"
}

export interface VerificationRequest {
  id: string;
  type: VerificationType;
  animalId: string;
  animalName: string;
  animalCode: string;
  requesterId: string;     // Who is requesting verification
  ownerId: string;        // Current owner of animal
  ownerName: string;
  status: VerificationStatus;
  feeAmount: number;
  feePaid: boolean;
  paymentMethod?: string;
  paymentReference?: string;
  requestedAt: string;
  expiresAt: string;
  verifiedAt?: string;
  verifierId?: string;
  verificationResult?: {
    isOwner: boolean;
    confidence: number;
    matchedEmbeddings: number;
    notes?: string;
  };
  metadata?: Record<string, any>; // For bank/insurance specific data
}

export interface VerificationInitResult {
  request: VerificationRequest;
  paymentInstructions: {
    methods: PaymentMethod[];
    total: number;
    currency: string;
  };
}

export interface VerificationResult {
  success: boolean;
  requestId: string;
  status: VerificationStatus;
  isOwner: boolean;
  confidence: number;
  animalDetails?: {
    id: string;
    name: string;
    code: string;
    type: string;
    ownerName: string;
  };
  message: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  instructions?: string;
  accountNumber?: string;
}

// ============================================================================
// VERIFICATION FEES (ETHIOPIAN MARKET PRICING)
// ============================================================================

const VERIFICATION_FEES: VerificationFee[] = [
  {
    type: 'ownership_sale',
    amount: 50,
    currency: 'ETB',
    description: 'Verify seller owns the animal before purchase',
    processingTime: '1 hour',
  },
  {
    type: 'ownership_transfer',
    amount: 30,
    currency: 'ETB',
    description: 'Complete ownership transfer verification',
    processingTime: '30 minutes',
  },
  {
    type: 'bank_loan',
    amount: 100,
    currency: 'ETB',
    description: 'Bank loan collateral verification',
    processingTime: '24 hours',
  },
  {
    type: 'insurance_claim',
    amount: 150,
    currency: 'ETB',
    description: 'Insurance claim verification',
    processingTime: '24 hours',
  },
  {
    type: 'police_report',
    amount: 0,  // FREE - public good for theft prevention
    currency: 'ETB',
    description: 'Theft/loss verification for police',
    processingTime: 'Immediate',
  },
];

// ============================================================================
// VERIFICATION SERVICE CLASS
// ============================================================================

class VerificationService {
  private static instance: VerificationService;
  
  // Verification validity period (in days)
  private readonly VERIFICATION_VALIDITY_DAYS = 7;

  private constructor() {}

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Get all verification fees
   */
  getVerificationFees(): VerificationFee[] {
    return VERIFICATION_FEES;
  }

  /**
   * Get fee for specific verification type
   */
  getFee(type: VerificationType): VerificationFee | undefined {
    return VERIFICATION_FEES.find(f => f.type === type);
  }

  /**
   * Get all supported payment methods
   */
  getPaymentMethods(): PaymentMethod[] {
    const methods = monetizationService.getPaymentMethods();
    return Object.values(methods).map(m => ({
      id: m.code,
      name: m.name,
      code: m.code,
      instructions: `Pay to ${m.name}`,
    }));
  }

  /**
   * STEP 1: Initiate a verification request
   * Creates pending request and returns payment instructions
   */
  async initiateVerification(
    type: VerificationType,
    animalId: string,
    requesterId: string,
    metadata?: Record<string, any>
  ): Promise<VerificationInitResult> {
    // Get fee for this verification type
    const fee = this.getFee(type);
    if (!fee) {
      throw new Error(`Unknown verification type: ${type}`);
    }

    // Get animal details
    const animal = await this.getAnimalDetails(animalId);
    if (!animal) {
      throw new Error('Animal not found');
    }

    // Create verification request
    const request: VerificationRequest = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      animalId: animal.id,
      animalName: animal.name,
      animalCode: animal.code || animal.id,
      requesterId,
      ownerId: animal.ownerId,
      ownerName: animal.ownerName,
      status: fee.amount === 0 ? 'payment_completed' : 'pending', // FREE verifications skip payment
      feeAmount: fee.amount,
      feePaid: fee.amount === 0,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + this.VERIFICATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000
      ).toISOString(),
      metadata,
    };

    // Save to database
    await this.saveVerificationRequest(request);

    // If FREE verification (police), start verification immediately
    if (fee.amount === 0) {
      this.startVerification(request.id).catch(console.error);
    }

    return {
      request,
      paymentInstructions: {
        methods: this.getPaymentMethods(),
        total: fee.amount,
        currency: 'ETB',
      },
    };
  }

  /**
   * STEP 2: Confirm payment for verification
   */
  async confirmPayment(
    requestId: string,
    paymentMethod: string,
    paymentReference: string
  ): Promise<VerificationRequest> {
    const request = await this.getVerificationRequest(requestId);
    if (!request) {
      throw new Error('Verification request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Verification is not in pending status');
    }

    // Update request with payment info
    const updatedRequest: VerificationRequest = {
      ...request,
      status: 'payment_completed',
      feePaid: true,
      paymentMethod,
      paymentReference,
    };

    await this.updateVerificationRequest(updatedRequest);

    // Start verification process
    this.startVerification(requestId).catch(console.error);

    return updatedRequest;
  }

  /**
   * STEP 3: Perform the actual verification using muzzle
   * This compares the presented muzzle against registered embeddings
   */
  async verifyWithMuzzle(
    requestId: string,
    muzzleEmbedding: Float32Array,
    verifierId?: string
  ): Promise<VerificationResult> {
    const request = await this.getVerificationRequest(requestId);
    if (!request) {
      throw new Error('Verification request not found');
    }

    // Update status to in_progress
    await this.updateStatus(requestId, 'in_progress', verifierId);

    try {
      // Search for animal using muzzle embeddings
      const searchResult = await muzzleSearchService.searchCloud(
        { vector: muzzleEmbedding, animalId: request.animalId },
        {
          mode: 'cloud',
          confidenceThreshold: 0.75, // Lower threshold for verification
          maxResults: 5,
          includeAlternatives: true,
          timeoutMs: 30000,
        }
      );

      // Check if the verified animal matches
      const matchedAnimal = searchResult.animal;
      const isOwner = matchedAnimal && 
                      matchedAnimal.animalId === request.animalId &&
                      searchResult.confidence >= 0.75;

      const verificationResult = {
        isOwner: isOwner || false,
        confidence: searchResult.confidence || 0,
        matchedEmbeddings: searchResult.status === 'match' ? 1 : 0,
        notes: isOwner 
? `Verified: ${matchedAnimal.name} (${Math.round(searchResult.confidence * 100)}% confidence)`
          : `No match found for ${request.animalName}`,
      };

      // Update request with result
      const finalStatus: VerificationStatus = isOwner ? 'verified' : 'rejected';
      await this.updateVerificationRequest(request, {
        status: finalStatus,
        verifiedAt: new Date().toISOString(),
        verifierId,
        verificationResult,
      });

      return {
        success: isOwner || false,
        requestId,
        status: finalStatus,
        isOwner: isOwner || false,
        confidence: searchResult.confidence || 0,
        animalDetails: isOwner ? {
          id: request.animalId,
          name: request.animalName,
          code: request.animalCode,
          type: request.metadata?.animalType || 'cattle',
          ownerName: request.ownerName,
        } : undefined,
        message: isOwner 
          ? 'Ownership verified successfully'
          : 'Could not verify ownership - muzzle did not match',
        verifiedAt: new Date().toISOString(),
        expiresAt: request.expiresAt,
      };

    } catch (error) {
      console.error('Verification failed:', error);
      await this.updateStatus(requestId, 'rejected', verifierId);
      
      return {
        success: false,
        requestId,
        status: 'rejected',
        isOwner: false,
        confidence: 0,
        message: 'Verification failed due to technical error',
      };
    }
  }

  /**
   * Get verification request by ID
   */
  async getVerificationRequest(requestId: string): Promise<VerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !data) {
        // Try local storage for offline scenarios
        return this.getVerificationRequestLocal(requestId);
      }

      return this.mapDbToVerificationRequest(data);
    } catch {
      return this.getVerificationRequestLocal(requestId);
    }
  }

  /**
   * Get verification history for a user
   */
  async getVerificationHistory(userId: string): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .order('requested_at', { ascending: false });

      if (error) {
        return this.getVerificationHistoryLocal(userId);
      }

      return (data || []).map(this.mapDbToVerificationRequest);
    } catch {
      return this.getVerificationHistoryLocal(userId);
    }
  }

  /**
   * Get active (non-expired) verifications for an animal
   */
  async getActiveVerifications(animalId: string): Promise<VerificationRequest[]> {
    const history = await this.getVerificationHistoryLocal('');
    const now = new Date();

    return history.filter(v => 
      v.animalId === animalId &&
      v.status === 'verified' &&
      new Date(v.expiresAt) > now
    );
  }

  /**
   * Generate verification certificate
   */
  async generateCertificate(requestId: string): Promise<string | null> {
    const request = await this.getVerificationRequest(requestId);
    if (!request || request.status !== 'verified') {
      return null;
    }

    // Generate simple text certificate
    const certificate = `
VERIFICATION CERTIFICATE
========================
Certificate ID: ${request.id}
Verified Animal: ${request.animalName}
Animal Code: ${request.animalCode}
Verified Owner: ${request.ownerName}
Verification Type: ${request.type}
Confidence: ${Math.round((request.verificationResult?.confidence || 0) * 100)}%
Verified At: ${request.verifiedAt}
Expires At: ${request.expiresAt}
Valid Until: ${request.expiresAt}
========================
This certificate confirms ownership verification through muzzle identification.
Ethio Herd Connect - www.ethioherdconnect.com
`.trim();

    return certificate;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private async getAnimalDetails(animalId: string): Promise<{
    id: string;
    name: string;
    code: string;
    ownerId: string;
    ownerName: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, animal_id, owner_id, owners:profiles(owner_name)')
        .eq('id', animalId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name || 'Unknown',
        code: data.animal_id || data.id,
        ownerId: data.owner_id,
        ownerName: (data.owners as any)?.owner_name || 'Unknown',
      };
    } catch {
      return null;
    }
  }

  private async saveVerificationRequest(request: VerificationRequest): Promise<void> {
    try {
      await supabase
        .from('verification_requests')
        .insert(this.mapToDbFormat(request));
    } catch {
      // Fallback to local storage
      this.saveVerificationRequestLocal(request);
    }
  }

  private async updateVerificationRequest(
    request: VerificationRequest,
    updates?: Partial<VerificationRequest>
  ): Promise<void> {
    const updated = { ...request, ...updates };
    
    try {
      await supabase
        .from('verification_requests')
        .update(this.mapToDbFormat(updated))
        .eq('id', request.id);
    } catch {
      this.saveVerificationRequestLocal(updated);
    }
  }

  private async updateStatus(
    requestId: string,
    status: VerificationStatus,
    verifierId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('verification_requests')
        .update({ 
          status,
          verifier_id: verifierId,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
        })
        .eq('id', requestId);
    } catch {
      // Update local storage
      const request = await this.getVerificationRequestLocal(requestId);
      if (request) {
        request.status = status;
        request.verifierId = verifierId;
        if (status === 'verified') {
          request.verifiedAt = new Date().toISOString();
        }
        this.saveVerificationRequestLocal(request);
      }
    }
  }

  private async startVerification(requestId: string): Promise<void> {
    // This would be triggered by payment confirmation or FREE verification
    // In production, this could queue a job or trigger a workflow
    console.log(`Starting verification for request: ${requestId}`);
  }

  // Database mapping
  private mapDbToVerificationRequest(data: any): VerificationRequest {
    return {
      id: data.id,
      type: data.type,
      animalId: data.animal_id,
      animalName: data.animal_name,
      animalCode: data.animal_code,
      requesterId: data.requester_id,
      ownerId: data.owner_id,
      ownerName: data.owner_name,
      status: data.status,
      feeAmount: data.fee_amount,
      feePaid: data.fee_paid,
      paymentMethod: data.payment_method,
      paymentReference: data.payment_reference,
      requestedAt: data.requested_at,
      expiresAt: data.expires_at,
      verifiedAt: data.verified_at,
      verifierId: data.verifier_id,
      verificationResult: data.verification_result ? JSON.parse(data.verification_result) : undefined,
      metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
    };
  }

  private mapToDbFormat(request: VerificationRequest): any {
    return {
      id: request.id,
      type: request.type,
      animal_id: request.animalId,
      animal_name: request.animalName,
      animal_code: request.animalCode,
      requester_id: request.requesterId,
      owner_id: request.ownerId,
      owner_name: request.ownerName,
      status: request.status,
      fee_amount: request.feeAmount,
      fee_paid: request.feePaid,
      payment_method: request.paymentMethod,
      payment_reference: request.paymentReference,
      requested_at: request.requestedAt,
      expires_at: request.expiresAt,
      verified_at: request.verifiedAt,
      verifier_id: request.verifierId,
      verification_result: request.verificationResult 
        ? JSON.stringify(request.verificationResult) 
        : null,
      metadata: request.metadata ? JSON.stringify(request.metadata) : null,
    };
  }

  // Local storage fallback
  private getVerificationRequestLocal(requestId: string): VerificationRequest | null {
    try {
      const stored = localStorage.getItem('verification_requests');
      if (!stored) return null;
      const requests: VerificationRequest[] = JSON.parse(stored);
      return requests.find(r => r.id === requestId) || null;
    } catch {
      return null;
    }
  }

  private saveVerificationRequestLocal(request: VerificationRequest): void {
    try {
      const stored = localStorage.getItem('verification_requests');
      const requests: VerificationRequest[] = stored ? JSON.parse(stored) : [];
      const index = requests.findIndex(r => r.id === request.id);
      
      if (index >= 0) {
        requests[index] = request;
      } else {
        requests.push(request);
      }
      
      localStorage.setItem('verification_requests', JSON.stringify(requests));
    } catch {
      console.error('Failed to save verification request locally');
    }
  }

  private getVerificationHistoryLocal(userId: string): VerificationRequest[] {
    try {
      const stored = localStorage.getItem('verification_requests');
      if (!stored) return [];
      
      const requests: VerificationRequest[] = JSON.parse(stored);
      
      if (!userId) return requests;
      
      return requests.filter(
        r => r.requesterId === userId || r.ownerId === userId
      );
    } catch {
return [];
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const verificationService = VerificationService.getInstance();
export default verificationService;
