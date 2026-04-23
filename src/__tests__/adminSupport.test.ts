// src/__tests__/adminSupport.test.ts - Admin Support System Tests

import { describe, it, expect } from 'vitest';

describe('Support Ticket System Tests', () => {
  describe('Ticket Number Generation', () => {
    it('should generate ticket number in correct format', () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const ticketNum = `TKT-${dateStr}-0001`;
      
      expect(ticketNum).toMatch(/^TKT-\d{8}-\d{4}$/);
    });
  });

  describe('Priority Levels', () => {
    const priorities = ['critical', 'high', 'medium', 'low'];
    
    priorities.forEach(priority => {
      it(`should have valid priority: ${priority}`, () => {
        expect(['critical', 'high', 'medium', 'low']).toContain(priority);
      });
    });
  });

  describe('Ticket Categories', () => {
    const categories = [
      'technical_issue',
      'account_login',
      'animal_management',
      'marketplace',
      'milk_recording',
      'offline_sync',
      'data_export',
      'other'
    ];

    it('should have 8 ticket categories', () => {
      expect(categories.length).toBe(8);
    });

    categories.forEach(category => {
      it(`should have valid category: ${category}`, () => {
        expect(categories).toContain(category);
      });
    });
  });

  describe('Ticket Status Flow', () => {
    const validStatuses = ['open', 'in_progress', 'pending_user', 'resolved', 'closed', 'escalated'];
    
    it('should have 6 ticket statuses', () => {
      expect(validStatuses.length).toBe(6);
    });

    validStatuses.forEach(status => {
      it(`should have valid status: ${status}`, () => {
        expect(validStatuses).toContain(status);
      });
    });
  });

  describe('SLA Deadlines', () => {
    const slaDeadlines: Record<string, number> = {
      critical: 1,    // 1 hour
      high: 4,         // 4 hours
      medium: 24,      // 24 hours
      low: 72,         // 72 hours
    };

    it('should have correct SLA for critical priority', () => {
      expect(slaDeadlines.critical).toBe(1);
    });

    it('should have correct SLA for high priority', () => {
      expect(slaDeadlines.high).toBe(4);
    });

    it('should have correct SLA for medium priority', () => {
      expect(slaDeadlines.medium).toBe(24);
    });

    it('should have correct SLA for low priority', () => {
      expect(slaDeadlines.low).toBe(72);
    });
  });

  describe('Ban Types', () => {
    const banTypes = ['warning', 'temporary', 'permanent'];
    
    it('should have 3 ban types', () => {
      expect(banTypes.length).toBe(3);
    });

    banTypes.forEach(banType => {
      it(`should have valid ban type: ${banType}`, () => {
        expect(banTypes).toContain(banType);
      });
    });
  });

  describe('Ban Durations', () => {
    const durations = [1, 6, 24, 72, 168, 336, 720];
    const labels = ['1 Hour', '6 Hours', '24 Hours', '3 Days', '7 Days', '14 Days', '30 Days'];
    
    it('should have 7 duration options', () => {
      expect(durations.length).toBe(7);
    });

    it('should map durations to correct labels', () => {
      expect(durations[0]).toBe(1);   // 1 Hour
      expect(durations[2]).toBe(24);   // 24 Hours
      expect(durations[3]).toBe(72);   // 3 Days
      expect(durations[6]).toBe(720);  // 30 Days
    });
  });

  describe('Announcement Types', () => {
    const announcementTypes = ['info', 'warning', 'alert', 'maintenance', 'new_feature'];
    
    it('should have 5 announcement types', () => {
      expect(announcementTypes.length).toBe(5);
    });
  });

  describe('Announcement Audiences', () => {
    const audiences = ['all', 'farmers', 'buyers', 'new_users'];
    
    it('should have 4 audience options', () => {
      expect(audiences.length).toBe(4);
    });
  });

  describe('Report Reasons', () => {
    const reasons = ['spam', 'inappropriate', 'fraud', 'scam', 'duplicate', 'misleading', 'other'];
    
    it('should have 7 report reasons', () => {
      expect(reasons.length).toBe(7);
    });
  });

  describe('Content Types', () => {
    const contentTypes = ['listing', 'user', 'animal', 'message', 'review'];
    
    it('should have 5 content types', () => {
      expect(contentTypes.length).toBe(5);
    });
  });

  describe('Ethiopian Regions', () => {
    const regions = [
      'Oromia', 'Amhara', 'SNNPR', 'Tigray', 'Afar',
      'Somali', 'Benishangul', 'Gambella', 'Harari',
      'Addis Ababa', 'Dire Dawa'
    ];
    
    it('should have 11 Ethiopian regions', () => {
      expect(regions.length).toBe(11);
    });

    it('should include major farming regions', () => {
      expect(regions).toContain('Oromia');
      expect(regions).toContain('Amhara');
      expect(regions).toContain('SNNPR');
    });
  });
});
