/**
 * Ownership Transfer Service
 * Handles animal ownership transfers between farmers
 * 
 * Flow:
 * 1. Seller initiates transfer → Creates pending request
 * 2. Buyer accepts transfer
 * 3. Seller verifies with muzzle (ownership proof)
 * 4. Buyer confirms payment
 * 5. Ownership transferred
 */

import { supabase } from '@/integrations/supabase/client';
import { verificationService, VerificationType } from './verificationService';

// ============================================================================
// TYPES
// ============================================================================

export type TransferStatus = 
  | 'pending_buyer'     // Waiting for buyer to accept
  | 'pending_verification'  // Waiting for seller muzzle verification
  | 'pending_payment'    // Waiting for buyer payment confirmation
  | 'completed'          // Transfer complete
  | 'cancelled'          // Transfer cancelled
  | 'expired';           // Transfer expired

export interface TransferRequest {
  id: string;
  animalId: string;
  animalName: string;
  animalCode: string;
  animalType: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  agreedPrice: number;
  currency: 'ETB';
  status: TransferStatus;
  verificationRequestId?: string;
  paymentReference?: string;
  initiatedAt: string;
  expiresAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface InitiateTransferResult {
  transfer: TransferRequest;
  shareCode: string; // Short code to share with buyer
}

export interface TransferSteps {
  currentStep: number;
  totalSteps: number;
  steps: {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    active: boolean;
  }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSFER_VALIDITY_HOURS = 48;  // Transfer request expires after 48 hours
const TRANSFER_FEE_PERCENTAGE = 2;   // 2% platform fee (minimum 50 ETB)

// ============================================================================
// SERVICE CLASS
// ============================================================================

class OwnershipTransferService {
  private static instance: OwnershipTransferService;

  private constructor() {}

  static getInstance(): OwnershipTransferService {
    if (!OwnershipTransferService.instance) {
      OwnershipTransferService.instance = new OwnershipTransferService();
    }
    return OwnershipTransferService.instance;
  }

  // ==========================================================================
  // STEP 1: Initiate Transfer (Seller)
  // ==========================================================================

  /**
   * Initiate a transfer request
   * Called by: SELLER
   */
  async initiateTransfer(
    animalId: string,
    buyerId: string,
    agreedPrice: number,
    sellerId: string
  ): Promise<InitiateTransferResult> {
    // Get animal details
    const animal = await this.getAnimalDetails(animalId);
    if (!animal) {
      throw new Error('Animal not found');
    }

    // Verify seller owns this animal
    if (animal.ownerId !== sellerId) {
      throw new Error('You do not own this animal');
    }

    // Get seller and buyer details
    const [seller, buyer] = await Promise.all([
      this.getUserDetails(sellerId),
      this.getUserDetails(buyerId),
    ]);

if (!seller || !buyer) {
      throw new Error('User details not found');
    }

    // Calculate platform fee
    const platformFee = Math.max(50, Math.round(agreedPrice * TRANSFER_FEE_PERCENTAGE / 100));

    // Create transfer request
    const transfer: TransferRequest = {
      id: `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      animalId,
      animalName: animal.name,
      animalCode: animal.code,
      animalType: animal.type,
      sellerId,
      sellerName: seller.name,
      sellerPhone: seller.phone,
      buyerId,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      agreedPrice,
      currency: 'ETB',
      status: 'pending_buyer',
      initiatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + TRANSFER_VALIDITY_HOURS * 60 * 60 * 1000).toISOString(),
    };

    // Save to database
    await this.saveTransfer(transfer);

    // Generate share code (last 6 characters of ID for simplicity)
    const shareCode = transfer.id.slice(-6).toUpperCase();

    return {
      transfer,
      shareCode,
    };
  }

  // ==========================================================================
  // STEP 2: Accept Transfer (Buyer)
  // ==========================================================================

  /**
   * Accept a transfer request
   * Called by: BUYER
   */
  async acceptTransfer(
    transferId: string,
    buyerId: string
  ): Promise<TransferRequest> {
    const transfer = await this.getTransfer(transferId);
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.buyerId !== buyerId) {
      throw new Error('You are not the buyer of this transfer');
    }

    if (transfer.status !== 'pending_buyer') {
      throw new Error('Transfer is not awaiting acceptance');
    }

    if (new Date(transfer.expiresAt) < new Date()) {
      await this.cancelTransfer(transferId, buyerId, 'Transfer expired');
      throw new Error('Transfer has expired');
    }

    // Update status
    const updatedTransfer: TransferRequest = {
      ...transfer,
      status: 'pending_verification',
    };

    await this.saveTransfer(updatedTransfer);

    return updatedTransfer;
  }

  // ==========================================================================
  // STEP 3: Seller Verifies Ownership (Muzzle Scan)
  // ==========================================================================

  /**
   * Start verification process for seller
   * Called by: SELLER
   */
  async startOwnershipVerification(
    transferId: string,
    sellerId: string
  ): Promise<{ verificationRequestId: string }> {
    const transfer = await this.getTransfer(transferId);
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.sellerId !== sellerId) {
      throw new Error('You are not the seller of this transfer');
    }

    if (transfer.status !== 'pending_verification') {
      throw new Error('Transfer is not awaiting verification');
    }

    // Create verification request (ownership_sale type)
    const verification = await verificationService.initiateVerification(
      'ownership_sale',
      transfer.animalId,
      sellerId,
      {
        transferId: transfer.id,
        buyerId: transfer.buyerId,
        buyerName: transfer.buyerName,
        agreedPrice: transfer.agreedPrice,
      }
    );

    // Link verification to transfer
    const updatedTransfer: TransferRequest = {
      ...transfer,
      verificationRequestId: verification.request.id,
    };

    await this.saveTransfer(updatedTransfer);

    return { verificationRequestId: verification.request.id };
  }

  /**
   * Complete verification with muzzle embedding
   * Called after seller scans their animal's muzzle
   */
  async completeOwnershipVerification(
    verificationRequestId: string,
    muzzleEmbedding: Float32Array
  ): Promise<{ success: boolean; message: string }> {
    const result = await verificationService.verifyWithMuzzle(
      verificationRequestId,
      muzzleEmbedding
    );

    if (result.success) {
      // Update transfer status
      const transfer = await this.findTransferByVerification(verificationRequestId);
      if (transfer) {
        const updatedTransfer: TransferRequest = {
          ...transfer,
          status: 'pending_payment',
        };
        await this.saveTransfer(updatedTransfer);
      }
    }

    return {
      success: result.success,
      message: result.message,
    };
  }

  // ==========================================================================
  // STEP 4: Payment Confirmation
  // ==========================================================================

  /**
   * Confirm payment has been made
   * Called by: BUYER (after making payment via mobile money/bank)
   */
  async confirmPayment(
    transferId: string,
    buyerId: string,
    paymentReference: string
  ): Promise<TransferRequest> {
    const transfer = await this.getTransfer(transferId);
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.buyerId !== buyerId) {
      throw new Error('You are not the buyer of this transfer');
    }

    if (transfer.status !== 'pending_payment') {
      throw new Error('Transfer is not awaiting payment');
    }

    // Verify payment with verification service
    if (transfer.verificationRequestId) {
      const verification = await verificationService.getVerificationRequest(
        transfer.verificationRequestId
      );
      
      if (!verification || verification.status !== 'verified') {
        throw new Error('Ownership verification not complete');
      }
    }

    // Update transfer with payment reference
    const updatedTransfer: TransferRequest = {
      ...transfer,
      paymentReference,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    await this.saveTransfer(updatedTransfer);

    // Transfer ownership in animals table
    await this.updateAnimalOwnership(transfer.animalId, transfer.buyerId);

    return updatedTransfer;
  }

  // ==========================================================================
  // CANCELLATION
  // ==========================================================================

  /**
   * Cancel a transfer
   */
  async cancelTransfer(
    transferId: string,
    userId: string,
    reason?: string
  ): Promise<TransferRequest> {
    const transfer = await this.getTransfer(transferId);
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.sellerId !== userId && transfer.buyerId !== userId) {
      throw new Error('You are not part of this transfer');
    }

    if (['completed', 'cancelled', 'expired'].includes(transfer.status)) {
      throw new Error('Cannot cancel this transfer');
    }

    const updatedTransfer: TransferRequest = {
      ...transfer,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId,
      cancellationReason: reason,
    };

    await this.saveTransfer(updatedTransfer);

    return updatedTransfer;
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  /**
   * Get transfer by ID
   */
  async getTransfer(transferId: string): Promise<TransferRequest | null> {
    try {
      const { data, error } = await supabase
        .from('ownership_transfers')
        .select('*')
        .eq('id', transferId)
        .single();

      if (error || !data) {
        return this.getTransferLocal(transferId);
      }

      return this.mapDbToTransfer(data);
    } catch {
      return this.getTransferLocal(transferId);
    }
  }

  /**
   * Get transfer by share code
   */
  async getTransferByCode(code: string): Promise<TransferRequest | null> {
    // Search all transfers for matching code suffix
    const allTransfers = await this.getAllTransfersLocal();
    const transfer = allTransfers.find(t => 
      t.id.slice(-6).toUpperCase() === code.toUpperCase()
    );
    return transfer || null;
  }

  /**
   * Get transfers for a user (as seller or buyer)
   */
  async getUserTransfers(userId: string): Promise<TransferRequest[]> {
    try {
      const { data, error } = await supabase
        .from('ownership_transfers')
        .select('*')
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .order('initiated_at', { ascending: false });

      if (error) {
        return this.getUserTransfersLocal(userId);
      }

      return (data || []).map(this.mapDbToTransfer);
    } catch {
      return this.getUserTransfersLocal(userId);
    }
  }

  /**
   * Get pending transfers as buyer (awaiting acceptance)
   */
  async getPendingBuyerTransfers(buyerId: string): Promise<TransferRequest[]> {
    const transfers = await this.getUserTransfers(buyerId);
    return transfers.filter(t => 
      t.buyerId === buyerId && t.status === 'pending_buyer'
    );
  }

  /**
   * Get pending transfers as seller (awaiting verification)
   */
  async getPendingSellerTransfers(sellerId: string): Promise<TransferRequest[]> {
    const transfers = await this.getUserTransfers(sellerId);
    return transfers.filter(t => 
      t.sellerId === sellerId && 
      ['pending_verification', 'pending_payment'].includes(t.status)
    );
  }

  /**
   * Get transfer progress steps
   */
  getTransferSteps(transfer: TransferRequest): TransferSteps {
    const steps = [
      {
        id: 'initiated',
        label: 'Transfer Initiated',
        description: 'Seller started the transfer',
      },
      {
        id: 'accepted',
        label: 'Buyer Accepted',
        description: 'Buyer agreed to the transfer',
      },
      {
        id: 'verified',
        label: 'Ownership Verified',
        description: 'Seller verified with muzzle scan',
      },
      {
        id: 'payment',
        label: 'Payment Confirmed',
        description: 'Buyer confirmed payment',
      },
      {
        id: 'completed',
        label: 'Transfer Complete',
        description: 'Ownership transferred',
      },
    ];

    const statusToStep: Record<TransferStatus, number> = {
      'pending_buyer': 1,
      'pending_verification': 2,
      'pending_payment': 3,
      'completed': 5,
      'cancelled': -1,
      'expired': -1,
    };

    const currentStep = statusToStep[transfer.status];
    
    return {
      currentStep,
      totalSteps: 5,
      steps: steps.map((step, index) => ({
        ...step,
        completed: index < currentStep,
        active: index === currentStep - 1,
      })),
    };
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private async getAnimalDetails(animalId: string): Promise<{
    id: string;
    name: string;
    code: string;
    type: string;
    ownerId: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, animal_id, type, owner_id')
        .eq('id', animalId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name || 'Unknown',
        code: data.animal_id || data.id,
        type: data.type || 'cattle',
        ownerId: data.owner_id,
      };
    } catch {
      return null;
    }
  }

  private async getUserDetails(userId: string): Promise<{
    id: string;
    name: string;
    phone: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, owner_name, phone')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.owner_name || 'Unknown',
        phone: data.phone || '',
      };
    } catch {
      return null;
    }
  }

  private async updateAnimalOwnership(animalId: string, newOwnerId: string): Promise<void> {
    try {
      await supabase
        .from('animals')
        .update({ owner_id: newOwnerId })
        .eq('id', animalId);
    } catch (error) {
      console.error('Failed to update animal ownership:', error);
    }
  }

  private async findTransferByVerification(verificationRequestId: string): Promise<TransferRequest | null> {
    const allTransfers = await this.getAllTransfersLocal();
    return allTransfers.find(t => t.verificationRequestId === verificationRequestId) || null;
  }

  private async saveTransfer(transfer: TransferRequest): Promise<void> {
    try {
      const exists = await this.getTransfer(transfer.id);
      
      if (exists) {
        await supabase
          .from('ownership_transfers')
          .update(this.mapToDbFormat(transfer))
          .eq('id', transfer.id);
      } else {
        await supabase
          .from('ownership_transfers')
          .insert(this.mapToDbFormat(transfer));
      }
    } catch {
      this.saveTransferLocal(transfer);
    }
  }

  private mapDbToTransfer(data: any): TransferRequest {
    return {
      id: data.id,
      animalId: data.animal_id,
      animalName: data.animal_name,
      animalCode: data.animal_code,
      animalType: data.animal_type,
      sellerId: data.seller_id,
      sellerName: data.seller_name,
      sellerPhone: data.seller_phone,
      buyerId: data.buyer_id,
      buyerName: data.buyer_name,
      buyerPhone: data.buyer_phone,
      agreedPrice: data.agreed_price,
      currency: data.currency || 'ETB',
      status: data.status,
      verificationRequestId: data.verification_request_id,
      paymentReference: data.payment_reference,
      initiatedAt: data.initiated_at,
      expiresAt: data.expires_at,
      completedAt: data.completed_at,
      cancelledAt: data.cancelled_at,
      cancelledBy: data.cancelled_by,
      cancellationReason: data.cancellation_reason,
    };
  }

  private mapToDbFormat(transfer: TransferRequest): any {
    return {
      id: transfer.id,
      animal_id: transfer.animalId,
      animal_name: transfer.animalName,
      animal_code: transfer.animalCode,
      animal_type: transfer.animalType,
      seller_id: transfer.sellerId,
      seller_name: transfer.sellerName,
      seller_phone: transfer.sellerPhone,
      buyer_id: transfer.buyerId,
      buyer_name: transfer.buyerName,
      buyer_phone: transfer.buyerPhone,
      agreed_price: transfer.agreedPrice,
      currency: transfer.currency,
      status: transfer.status,
      verification_request_id: transfer.verificationRequestId,
      payment_reference: transfer.paymentReference,
      initiated_at: transfer.initiatedAt,
      expires_at: transfer.expiresAt,
      completed_at: transfer.completedAt,
      cancelled_at: transfer.cancelledAt,
      cancelled_by: transfer.cancelledBy,
      cancellation_reason: transfer.cancellationReason,
    };
  }

  // Local storage fallback
  private getTransferLocal(transferId: string): TransferRequest | null {
    try {
      const stored = localStorage.getItem('ownership_transfers');
      if (!stored) return null;
      const transfers: TransferRequest[] = JSON.parse(stored);
      return transfers.find(t => t.id === transferId) || null;
    } catch {
      return null;
    }
  }

  private getAllTransfersLocal(): TransferRequest[] {
    try {
      const stored = localStorage.getItem('ownership_transfers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getUserTransfersLocal(userId: string): TransferRequest[] {
    return this.getAllTransfersLocal().filter(
      t => t.sellerId === userId || t.buyerId === userId
    );
  }

  private saveTransferLocal(transfer: TransferRequest): void {
    try {
      const transfers = this.getAllTransfersLocal();
      const index = transfers.findIndex(t => t.id === transfer.id);
      
      if (index >= 0) {
        transfers[index] = transfer;
      } else {
        transfers.push(transfer);
      }
      
      localStorage.setItem('ownership_transfers', JSON.stringify(transfers));
    } catch {
      console.error('Failed to save transfer locally');
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ownershipTransferService = OwnershipTransferService.getInstance();
export default ownershipTransferService;
