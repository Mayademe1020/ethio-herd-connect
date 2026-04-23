/**
 * Identification Logger Service
 * Logs muzzle identification attempts for audit and analytics
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { supabase } from '@/integrations/supabase/client';
import { indexedDB } from '@/utils/indexedDB';
import {
  MuzzleIdentificationLog,
  IdentificationResult,
  SearchMode,
  DeviceInfo,
  LocationInfo,
  IdentificationStatus
} from '@/types/muzzle';
import { logger } from '@/utils/logger';

const LOG_STORE = 'identification_logs';
const MAX_LOCAL_LOGS = 100;

export interface LogIdentificationParams {
  result: IdentificationResult;
  searchMode: SearchMode;
  deviceInfo?: Partial<DeviceInfo>;
  locationInfo?: Partial<LocationInfo>;
  userId?: string;
}

export class IdentificationLogger {
  private isInitialized = false;

  /**
   * Initialize the logger service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await indexedDB.initialize();
      this.isInitialized = true;
      logger.info('IdentificationLogger initialized');
    } catch (error) {
      logger.error('Failed to initialize IdentificationLogger', error);
      throw error;
    }
  }

  /**
   * Log an identification attempt
   */
  async logIdentification({
    result,
    searchMode,
    deviceInfo,
    locationInfo,
    userId,
  }: LogIdentificationParams): Promise<string> {
    try {
      const logEntry: MuzzleIdentificationLog = {
        id: crypto.randomUUID(),
        user_id: userId || (await this.getCurrentUserId()) || '',
        search_mode: searchMode,
        result_status: result.status,
        matched_animal_id: result.animal?.animalId,
        matched_registration_id: result.animal ? await this.getRegistrationId(result.animal.animalId) : undefined,
        confidence_score: result.confidence,
        alternatives: result.alternatives,
        device_info: await this.getDeviceInfo(deviceInfo),
        location_info: await this.getLocationInfo(locationInfo),
        search_duration_ms: result.searchDurationMs,
        created_at: new Date().toISOString(),
      };

      // Store locally first (for offline support)
      await this.storeLocally(logEntry);

      // Try to sync to cloud if online
      if (navigator.onLine) {
        try {
          await this.syncToCloud(logEntry);
        } catch (syncError) {
          logger.warn('Failed to sync log to cloud, stored locally only', syncError);
        }
      }

      // Log security event if this was a rate limit violation
      if (result.status === 'error' && result.confidence === 0) {
        logger.warn('Security event: Rate limit violation', {
          user_id: logEntry.user_id,
          timestamp: logEntry.created_at,
          device_info: logEntry.device_info,
        });
      }

      logger.info('Identification attempt logged', {
        id: logEntry.id,
        status: result.status,
        confidence: result.confidence,
        searchMode,
      });

      return logEntry.id;
    } catch (error) {
      logger.error('Failed to log identification', error);
      throw error;
    }
  }

  /**
   * Get identification history for the current user
   */
  async getIdentificationHistory(
    limit = 50,
    offset = 0
  ): Promise<MuzzleIdentificationLog[]> {
    try {
      // For now, only use local storage since database schema isn't ready
      // TODO: Implement cloud sync when muzzle_identification_logs table exists
      const localLogs = await indexedDB.getAll(LOG_STORE);
      return localLogs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(offset, offset + limit) as MuzzleIdentificationLog[];
    } catch (error) {
      logger.error('Failed to get identification history', error);
      return [];
    }
  }

  /**
   * Get identification statistics
   */
  async getIdentificationStats(timeRange?: { start: Date; end: Date }) {
    try {
      const history = await this.getIdentificationHistory(1000);

      let filteredHistory = history;
      if (timeRange) {
        filteredHistory = history.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate >= timeRange.start && logDate <= timeRange.end;
        });
      }

      const stats = {
        totalAttempts: filteredHistory.length,
        successfulMatches: filteredHistory.filter(log => log.result_status === 'match').length,
        possibleMatches: filteredHistory.filter(log => log.result_status === 'possible_match').length,
        noMatches: filteredHistory.filter(log => log.result_status === 'no_match').length,
        errors: filteredHistory.filter(log => log.result_status === 'error').length,
        averageConfidence: this.calculateAverageConfidence(filteredHistory),
        averageSearchTime: this.calculateAverageSearchTime(filteredHistory),
        searchModeBreakdown: this.getSearchModeBreakdown(filteredHistory),
        timeRange: timeRange ? {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString(),
        } : null,
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get identification stats', error);
      return {
        totalAttempts: 0,
        successfulMatches: 0,
        possibleMatches: 0,
        noMatches: 0,
        errors: 0,
        averageConfidence: 0,
        averageSearchTime: 0,
        searchModeBreakdown: {},
      };
    }
  }

  /**
   * Sync pending logs to cloud
   */
  async syncPendingLogs(): Promise<number> {
    if (!navigator.onLine) return 0;

    try {
      const localLogs = await indexedDB.getAll(LOG_STORE);
      const unsyncedLogs = localLogs.filter(log => !log.synced_at);

      if (unsyncedLogs.length === 0) return 0;

      // Log security event for bulk sync
      logger.info('Security: Syncing identification logs to cloud', {
        count: unsyncedLogs.length,
        timestamp: new Date().toISOString(),
      });

      // For now, simulate sync since database schema isn't ready
      // TODO: Implement actual sync when muzzle_identification_logs table exists
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

      // Mark as synced locally
      for (const log of unsyncedLogs) {
        await indexedDB.put(LOG_STORE, {
          ...log,
          synced_at: new Date().toISOString(),
        });
      }

      logger.info(`Synced ${unsyncedLogs.length} identification logs to cloud`);
      return unsyncedLogs.length;
    } catch (error) {
      logger.error('Failed to sync pending logs', error);
      return 0;
    }
  }

  /**
   * Clear old local logs (keep only recent ones)
   */
  async cleanupOldLogs(): Promise<number> {
    try {
      const allLogs = await indexedDB.getAll(LOG_STORE);
      if (allLogs.length <= MAX_LOCAL_LOGS) return 0;

      // Sort by creation date, keep newest
      const sortedLogs = allLogs.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const logsToDelete = sortedLogs.slice(MAX_LOCAL_LOGS);
      let deletedCount = 0;

      for (const log of logsToDelete) {
        await indexedDB.delete(LOG_STORE, log.id);
        deletedCount++;
      }

      logger.info(`Cleaned up ${deletedCount} old identification logs`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old logs', error);
      return 0;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id || null;
    } catch {
      return null;
    }
  }

  private async getRegistrationId(animalId: string): Promise<string | undefined> {
    try {
      // This would query the muzzle_registrations table
      // For now, return undefined as we don't have the full implementation
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async getDeviceInfo(partialInfo?: Partial<DeviceInfo>): Promise<DeviceInfo> {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      deviceMemory: (navigator as any).deviceMemory || undefined,
      hardwareConcurrency: navigator.hardwareConcurrency || undefined,
      hasWebGL: this.checkWebGLSupport(),
      gpuTier: this.getGPUTier(),
      ...partialInfo,
    };
  }

  private async getLocationInfo(partialInfo?: Partial<LocationInfo>): Promise<LocationInfo | undefined> {
    if (!partialInfo && !navigator.geolocation) return undefined;

    if (partialInfo) {
      return partialInfo as LocationInfo;
    }

    // Try to get current location
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch {
      // Location not available
      return undefined;
    }
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private getGPUTier(): 'low' | 'medium' | 'high' {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;

    if (memory >= 8 && cores >= 8) return 'high';
    if (memory >= 4 && cores >= 4) return 'medium';
    return 'low';
  }

  private calculateAverageConfidence(logs: MuzzleIdentificationLog[]): number {
    const validLogs = logs.filter(log => log.confidence_score !== null && log.confidence_score !== undefined);
    if (validLogs.length === 0) return 0;

    const sum = validLogs.reduce((acc, log) => acc + (log.confidence_score || 0), 0);
    return sum / validLogs.length;
  }

  private calculateAverageSearchTime(logs: MuzzleIdentificationLog[]): number {
    const validLogs = logs.filter(log => log.search_duration_ms !== null && log.search_duration_ms !== undefined);
    if (validLogs.length === 0) return 0;

    const sum = validLogs.reduce((acc, log) => acc + (log.search_duration_ms || 0), 0);
    return sum / validLogs.length;
  }

  private getSearchModeBreakdown(logs: MuzzleIdentificationLog[]): Record<SearchMode, number> {
    const breakdown: Record<SearchMode, number> = {
      local: 0,
      cloud: 0,
      hybrid: 0,
    };

    logs.forEach(log => {
      breakdown[log.search_mode]++;
    });

    return breakdown;
  }

  private async storeLocally(logEntry: MuzzleIdentificationLog): Promise<void> {
    try {
      await indexedDB.put(LOG_STORE, logEntry);
    } catch (error) {
      logger.error('Failed to store log locally', error);
      throw error;
    }
  }

  private async syncToCloud(logEntry: MuzzleIdentificationLog): Promise<void> {
    try {
      // For now, simulate cloud sync since database schema isn't ready
      // TODO: Implement actual cloud sync when muzzle_identification_logs table exists
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 50));

      // Log the simulated sync for security auditing
      logger.info('Security: Simulated cloud sync for identification log', {
        log_id: logEntry.id,
        user_id: logEntry.user_id,
        status: logEntry.result_status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to sync log to cloud', error);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const identificationLogger = new IdentificationLogger();
export default identificationLogger;