/**
 * Data Retention Policy for Muzzle Identification System
 * Implements automatic cleanup of biometric data according to security policies
 * Critical for GDPR and biometric data compliance
 */

import { logger } from './logger';
import { clearAllMuzzleData, getMuzzleDBStats } from './muzzleIndexedDB';
import { identificationLogger } from '@/services/identificationLogger';

export interface RetentionPolicy {
  maxAgeDays: number; // Maximum age of data to retain
  maxStorageMB: number; // Maximum storage size
  cleanupFrequencyDays: number; // How often to run cleanup
  warnBeforeDeleteDays: number; // Warn users before deletion
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  maxAgeDays: 365, // 1 year retention for biometric data
  maxStorageMB: 50, // 50MB max storage per user
  cleanupFrequencyDays: 30, // Run cleanup monthly
  warnBeforeDeleteDays: 7, // Warn 7 days before deletion
};

class DataRetentionManager {
  private policy: RetentionPolicy;
  private lastCleanupDate: string | null = null;

  constructor(policy: Partial<RetentionPolicy> = {}) {
    this.policy = { ...DEFAULT_RETENTION_POLICY, ...policy };
    this.loadLastCleanupDate();
  }

  /**
   * Load last cleanup date from storage
   */
  private loadLastCleanupDate(): void {
    try {
      const storedDate = localStorage.getItem('muzzle_data_retention_last_cleanup');
      if (storedDate) {
        this.lastCleanupDate = storedDate;
      }
    } catch (error) {
      logger.error('Failed to load last cleanup date', error);
    }
  }

  /**
   * Save last cleanup date to storage
   */
  private saveLastCleanupDate(): void {
    try {
      this.lastCleanupDate = new Date().toISOString();
      localStorage.setItem('muzzle_data_retention_last_cleanup', this.lastCleanupDate);
    } catch (error) {
      logger.error('Failed to save last cleanup date', error);
    }
  }

  /**
   * Check if cleanup is needed based on policy
   */
  isCleanupNeeded(): boolean {
    if (!this.lastCleanupDate) return true;

    const lastCleanup = new Date(this.lastCleanupDate);
    const now = new Date();
    const daysSinceLastCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastCleanup >= this.policy.cleanupFrequencyDays;
  }

  /**
   * Get data retention statistics
   */
  async getRetentionStats(): Promise<{
    totalEmbeddings: number;
    totalSizeMB: number;
    oldestDataDays: number | null;
    cleanupNeeded: boolean;
  }> {
    try {
      const stats = await getMuzzleDBStats();
      const totalSizeMB = stats.totalSize / (1024 * 1024);

      // Calculate oldest data age
      let oldestDataDays: number | null = null;
      // TODO: Implement actual age calculation when we have access to timestamps

      return {
        totalEmbeddings: stats.embeddingsCount,
        totalSizeMB,
        oldestDataDays,
        cleanupNeeded: this.isCleanupNeeded(),
      };
    } catch (error) {
      logger.error('Failed to get retention stats', error);
      return {
        totalEmbeddings: 0,
        totalSizeMB: 0,
        oldestDataDays: null,
        cleanupNeeded: false,
      };
    }
  }

  /**
   * Check if data exceeds retention limits
   */
  async isDataExceedingLimits(): Promise<{ exceedsAge: boolean; exceedsSize: boolean }> {
    try {
      const stats = await getMuzzleDBStats();
      const totalSizeMB = stats.totalSize / (1024 * 1024);

      // Check size limit
      const exceedsSize = totalSizeMB > this.policy.maxStorageMB;

      // Check age limit (simplified for now)
      // TODO: Implement actual age checking when we have timestamp data
      const exceedsAge = false;

      return { exceedsAge, exceedsSize };
    } catch (error) {
      logger.error('Failed to check data limits', error);
      return { exceedsAge: false, exceedsSize: false };
    }
  }

  /**
   * Run data cleanup according to retention policy
   */
  async runCleanup(): Promise<{ deletedCount: number; freedSizeMB: number }> {
    try {
      logger.info('Starting data retention cleanup', {
        policy: this.policy,
        timestamp: new Date().toISOString(),
      });

      // Log security event for data cleanup
      await identificationLogger.logIdentification({
        result: {
          status: 'error',
          confidence: 0,
          searchedLocal: false,
          searchedCloud: false,
          timestamp: new Date().toISOString(),
          searchDurationMs: 0,
        },
        searchMode: 'local',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
        userId: 'system',
      });

      // For now, implement basic cleanup
      // TODO: Implement selective cleanup based on age when we have timestamp data
      await clearAllMuzzleData();

      // Update cleanup timestamp
      this.saveLastCleanupDate();

      logger.info('Data retention cleanup completed', {
        timestamp: new Date().toISOString(),
      });

      return { deletedCount: 0, freedSizeMB: 0 };
    } catch (error) {
      logger.error('Failed to run data retention cleanup', error);
      return { deletedCount: 0, freedSizeMB: 0 };
    }
  }

  /**
   * Get data retention policy information
   */
  getPolicyInfo(): RetentionPolicy {
    return this.policy;
  }

  /**
   * Set custom retention policy
   */
  setPolicy(policy: Partial<RetentionPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  /**
   * Get user-friendly retention policy description
   */
  getPolicyDescription(): string {
    return `Biometric data is retained for ${this.policy.maxAgeDays} days with a maximum storage of ${this.policy.maxStorageMB}MB. Cleanup runs every ${this.policy.cleanupFrequencyDays} days.`;
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(): Promise<{
    isCompliant: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];
      const { cleanupNeeded } = this;
      const { exceedsAge, exceedsSize } = await this.isDataExceedingLimits();

      if (cleanupNeeded) {
        issues.push('Cleanup overdue');
      }

      if (exceedsAge) {
        issues.push('Data exceeds age retention limit');
      }

      if (exceedsSize) {
        issues.push('Data exceeds size retention limit');
      }

      return {
        isCompliant: issues.length === 0,
        issues,
      };
    } catch (error) {
      logger.error('Failed to get compliance status', error);
      return {
        isCompliant: false,
        issues: ['Failed to check compliance status'],
      };
    }
  }
}

// Singleton instance
export const dataRetentionManager = new DataRetentionManager();

// Periodic compliance check
setInterval(async () => {
  try {
    const { isCompliant, issues } = await dataRetentionManager.getComplianceStatus();
    if (!isCompliant) {
      logger.warn('Data retention compliance issue detected', {
        issues,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Compliance check failed', error);
  }
}, 24 * 60 * 60 * 1000); // Check daily

export default dataRetentionManager;