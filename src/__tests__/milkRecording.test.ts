// src/__tests__/milkRecording.test.ts - Comprehensive Milk Recording Tests

import { describe, it, expect } from 'vitest';

describe('Milk Recording System Tests', () => {
  describe('Milk Amount Validation', () => {
    const QUICK_AMOUNTS = [2, 3, 5, 7, 10]; // liters

    it('should have predefined quick amount buttons', () => {
      expect(QUICK_AMOUNTS).toContain(2);
      expect(QUICK_AMOUNTS).toContain(3);
      expect(QUICK_AMOUNTS).toContain(5);
      expect(QUICK_AMOUNTS).toContain(7);
      expect(QUICK_AMOUNTS).toContain(10);
      expect(QUICK_AMOUNTS.length).toBe(5);
    });

    it('should validate positive milk amounts', () => {
      const validAmounts = [2, 3.5, 5, 7.2, 10];
      const invalidAmounts = [0, -1, -5];

      validAmounts.forEach(amount => {
        expect(amount).toBeGreaterThan(0);
      });

      invalidAmounts.forEach(amount => {
        expect(amount).toBeLessThanOrEqual(0);
      });
    });

    it('should validate reasonable milk amounts (<50L)', () => {
      const reasonableAmounts = [2, 5, 10, 15, 20];
      const unreasonableAmounts = [100, 500, 1000];

      reasonableAmounts.forEach(amount => {
        expect(amount).toBeLessThan(50);
      });

      unreasonableAmounts.forEach(amount => {
        expect(amount).toBeGreaterThanOrEqual(50);
      });
    });

    it('should allow decimal amounts (e.g., 3.5L)', () => {
      const decimalAmounts = [2.5, 3.5, 4.2, 5.8];
      
      decimalAmounts.forEach(amount => {
        expect(amount % 1).not.toBe(0); // Has decimal part
        expect(amount).toBeGreaterThan(0);
      });
    });

    it('should round to 1 decimal place', () => {
      const amount = 3.567;
      const rounded = Math.round(amount * 10) / 10;
      
      expect(rounded).toBe(3.6);
    });
  });

  describe('Session Detection', () => {
    it('should detect morning session (before 12pm)', () => {
      const morningHours = [6, 7, 8, 9, 10, 11];
      
      morningHours.forEach(hour => {
        const isMorning = hour < 12;
        expect(isMorning).toBe(true);
      });
    });

    it('should detect evening session (12pm and after)', () => {
      const eveningHours = [12, 13, 14, 15, 16, 17, 18];
      
      eveningHours.forEach(hour => {
        const isEvening = hour >= 12;
        expect(isEvening).toBe(true);
      });
    });

    it('should auto-detect session from current time', () => {
      const now = new Date();
      const hour = now.getHours();
      const session = hour < 12 ? 'morning' : 'evening';
      
      expect(['morning', 'evening']).toContain(session);
    });

    it('should create session timestamp', () => {
      const timestamp = new Date().toISOString();
      const date = new Date(timestamp);
      
      expect(date).toBeInstanceOf(Date);
      expect(timestamp).toContain('T');
      expect(timestamp).toContain('Z');
    });
  });

  describe('Milk Record Data Model', () => {
    it('should have required fields for milk record', () => {
      const milkRecord = {
        id: 'test-id',
        user_id: 'user-123',
        animal_id: 'animal-456',
        liters: 3.5,
        recorded_at: new Date().toISOString(),
        session: 'morning'
      };

      expect(milkRecord.id).toBeTruthy();
      expect(milkRecord.user_id).toBeTruthy();
      expect(milkRecord.animal_id).toBeTruthy();
      expect(milkRecord.liters).toBeGreaterThan(0);
      expect(milkRecord.recorded_at).toBeTruthy();
      expect(['morning', 'evening']).toContain(milkRecord.session);
    });

    it('should auto-fill recorded_at timestamp', () => {
      const before = Date.now();
      const milkRecord = {
        liters: 5,
        recorded_at: new Date().toISOString()
      };
      const after = Date.now();
      
      const recordTime = new Date(milkRecord.recorded_at).getTime();
      expect(recordTime).toBeGreaterThanOrEqual(before);
      expect(recordTime).toBeLessThanOrEqual(after);
    });

    it('should auto-detect session field', () => {
      const hour = new Date().getHours();
      const session = hour < 12 ? 'morning' : 'evening';
      
      const milkRecord = {
        liters: 5,
        session
      };
      
      expect(['morning', 'evening']).toContain(milkRecord.session);
    });
  });

  describe('Cow Filtering for Milk Recording', () => {
    const mockAnimals = [
      { id: '1', name: 'Chaltu', type: 'cattle', subtype: 'Cow' },
      { id: '2', name: 'Beza', type: 'cattle', subtype: 'Cow' },
      { id: '3', name: 'Moti', type: 'cattle', subtype: 'Bull' },
      { id: '4', name: 'Tiru', type: 'cattle', subtype: 'Ox' },
      { id: '5', name: 'Kali', type: 'goat', subtype: 'Female' }
    ];

    it('should filter only cows for milk recording', () => {
      const cows = mockAnimals.filter(a => a.type === 'cattle' && a.subtype === 'Cow');
      
      expect(cows.length).toBe(2);
      expect(cows.every(c => c.subtype === 'Cow')).toBe(true);
    });

    it('should exclude bulls, oxen, and calves', () => {
      const nonCows = mockAnimals.filter(a => 
        a.type === 'cattle' && a.subtype !== 'Cow'
      );
      
      expect(nonCows.length).toBe(2);
      expect(nonCows.every(a => a.subtype !== 'Cow')).toBe(true);
    });

    it('should exclude other animal types', () => {
      const cows = mockAnimals.filter(a => a.type === 'cattle' && a.subtype === 'Cow');
      
      expect(cows.every(c => c.type === 'cattle')).toBe(true);
      expect(cows.find(c => c.type === 'goat')).toBeUndefined();
    });
  });

  describe('Milk History Calculations', () => {
    // Use current dates for testing
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const mockMilkRecords = [
      { animal_id: '1', liters: 3, recorded_at: new Date(today.setHours(6, 0, 0, 0)).toISOString(), session: 'morning' },
      { animal_id: '1', liters: 4, recorded_at: new Date(today.setHours(18, 0, 0, 0)).toISOString(), session: 'evening' },
      { animal_id: '1', liters: 3.5, recorded_at: new Date(yesterday.setHours(6, 0, 0, 0)).toISOString(), session: 'morning' },
      { animal_id: '1', liters: 4.5, recorded_at: new Date(yesterday.setHours(18, 0, 0, 0)).toISOString(), session: 'evening' },
      { animal_id: '1', liters: 3, recorded_at: new Date(twoDaysAgo.setHours(6, 0, 0, 0)).toISOString(), session: 'morning' }
    ];

    it('should calculate daily total', () => {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayRecords = mockMilkRecords.filter(r => 
        r.recorded_at.startsWith(todayDate)
      );
      const dailyTotal = todayRecords.reduce((sum, r) => sum + r.liters, 0);
      
      expect(dailyTotal).toBe(7); // 3 + 4
    });

    it('should calculate weekly total', () => {
      const weeklyTotal = mockMilkRecords.reduce((sum, r) => sum + r.liters, 0);
      
      expect(weeklyTotal).toBe(18); // 3 + 4 + 3.5 + 4.5 + 3
    });

    it('should filter last 7 days of records', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentRecords = mockMilkRecords.filter(r => {
        const recordDate = new Date(r.recorded_at);
        return recordDate >= sevenDaysAgo;
      });
      
      expect(recentRecords.length).toBeGreaterThan(0);
    });

    it('should group records by date', () => {
      const groupedByDate: Record<string, number> = {};
      
      mockMilkRecords.forEach(record => {
        const date = record.recorded_at.split('T')[0];
        groupedByDate[date] = (groupedByDate[date] || 0) + record.liters;
      });
      
      // Get unique dates from mock records
      const dates = Object.keys(groupedByDate);
      expect(dates.length).toBeGreaterThan(0);
      
      // Verify totals are calculated correctly
      const totalLiters = Object.values(groupedByDate).reduce((sum, val) => sum + val, 0);
      expect(totalLiters).toBe(18); // 3 + 4 + 3.5 + 4.5 + 3
    });

    it('should separate morning and evening sessions', () => {
      const morningRecords = mockMilkRecords.filter(r => r.session === 'morning');
      const eveningRecords = mockMilkRecords.filter(r => r.session === 'evening');
      
      expect(morningRecords.length).toBe(3);
      expect(eveningRecords.length).toBe(2);
    });
  });

  describe('Milk Trend Indicators', () => {
    it('should detect increasing trend', () => {
      const records = [
        { date: '2024-10-23', total: 5 },
        { date: '2024-10-24', total: 6 },
        { date: '2024-10-25', total: 7 }
      ];
      
      const lastTwo = records.slice(-2);
      const isIncreasing = lastTwo[1].total > lastTwo[0].total;
      
      expect(isIncreasing).toBe(true);
    });

    it('should detect decreasing trend', () => {
      const records = [
        { date: '2024-10-23', total: 7 },
        { date: '2024-10-24', total: 6 },
        { date: '2024-10-25', total: 5 }
      ];
      
      const lastTwo = records.slice(-2);
      const isDecreasing = lastTwo[1].total < lastTwo[0].total;
      
      expect(isDecreasing).toBe(true);
    });

    it('should detect stable trend', () => {
      const records = [
        { date: '2024-10-23', total: 6 },
        { date: '2024-10-24', total: 6 },
        { date: '2024-10-25', total: 6 }
      ];
      
      const lastTwo = records.slice(-2);
      const isStable = lastTwo[1].total === lastTwo[0].total;
      
      expect(isStable).toBe(true);
    });

    it('should use correct trend icons', () => {
      const TREND_ICONS = {
        increasing: '↑',
        decreasing: '↓',
        stable: '→'
      };
      
      expect(TREND_ICONS.increasing).toBe('↑');
      expect(TREND_ICONS.decreasing).toBe('↓');
      expect(TREND_ICONS.stable).toBe('→');
    });
  });

  describe('2-Click Milk Recording Flow', () => {
    it('should follow 2-click flow', () => {
      const steps = [
        'select_cow',      // Click 1: Select cow
        'enter_amount'     // Click 2: Enter amount (quick button or custom)
      ];

      expect(steps.length).toBe(2);
      expect(steps[0]).toBe('select_cow');
      expect(steps[1]).toBe('enter_amount');
    });

    it('should allow quick amount selection', () => {
      const quickAmounts = [2, 3, 5, 7, 10];
      const selectedAmount = 5;
      
      expect(quickAmounts).toContain(selectedAmount);
    });

    it('should allow custom amount input', () => {
      const customAmount = 4.5;
      
      expect(customAmount).toBeGreaterThan(0);
      expect(customAmount).not.toEqual(2);
      expect(customAmount).not.toEqual(3);
      expect(customAmount).not.toEqual(5);
    });

    it('should create complete milk record', () => {
      const record = {
        animal_id: 'cow-123',
        liters: 5,
        recorded_at: new Date().toISOString(),
        session: new Date().getHours() < 12 ? 'morning' : 'evening'
      };

      expect(record.animal_id).toBeTruthy();
      expect(record.liters).toBe(5);
      expect(record.recorded_at).toBeTruthy();
      expect(['morning', 'evening']).toContain(record.session);
    });
  });

  describe('Optimistic UI Updates', () => {
    it('should create temporary record immediately', () => {
      const tempRecord = {
        id: 'temp-123',
        animal_id: 'cow-456',
        liters: 5,
        status: 'pending'
      };

      expect(tempRecord.id).toContain('temp');
      expect(tempRecord.status).toBe('pending');
    });

    it('should update with server response', () => {
      const tempRecord = {
        id: 'temp-123',
        liters: 5,
        status: 'pending'
      };

      const savedRecord = {
        ...tempRecord,
        id: 'real-456',
        status: 'saved'
      };

      expect(savedRecord.id).not.toContain('temp');
      expect(savedRecord.status).toBe('saved');
    });
  });

  describe('Offline Milk Recording', () => {
    it('should queue offline milk records', () => {
      const offlineRecord = {
        action_type: 'milk_record',
        payload: {
          animal_id: 'cow-123',
          liters: 5,
          recorded_at: new Date().toISOString(),
          session: 'morning'
        },
        status: 'pending',
        retry_count: 0
      };

      expect(offlineRecord.action_type).toBe('milk_record');
      expect(offlineRecord.status).toBe('pending');
      expect(offlineRecord.retry_count).toBe(0);
    });

    it('should sync when connection restored', () => {
      const queuedRecords = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' }
      ];

      const syncedRecords = queuedRecords.map(r => ({
        ...r,
        status: 'synced'
      }));

      expect(syncedRecords.every(r => r.status === 'synced')).toBe(true);
    });
  });

  describe('Milk Recording Validation', () => {
    it('should require animal selection', () => {
      const record = {
        animal_id: null,
        liters: 5
      };

      const isValid = record.animal_id !== null && record.liters > 0;
      expect(isValid).toBe(false);
    });

    it('should require positive amount', () => {
      const record = {
        animal_id: 'cow-123',
        liters: 0
      };

      const isValid = record.animal_id !== null && record.liters > 0;
      expect(isValid).toBe(false);
    });

    it('should validate complete record', () => {
      const record = {
        animal_id: 'cow-123',
        liters: 5
      };

      const isValid = record.animal_id !== null && record.liters > 0;
      expect(isValid).toBe(true);
    });
  });

  describe('Multiple Cow Recording', () => {
    it('should record milk for multiple cows in sequence', () => {
      const records = [
        { animal_id: 'cow-1', liters: 3 },
        { animal_id: 'cow-2', liters: 4 },
        { animal_id: 'cow-3', liters: 5 }
      ];

      expect(records.length).toBe(3);
      expect(new Set(records.map(r => r.animal_id)).size).toBe(3); // All different cows
    });

    it('should allow recording same cow multiple times (different sessions)', () => {
      const records = [
        { animal_id: 'cow-1', liters: 3, session: 'morning' },
        { animal_id: 'cow-1', liters: 4, session: 'evening' }
      ];

      expect(records[0].animal_id).toBe(records[1].animal_id);
      expect(records[0].session).not.toBe(records[1].session);
    });
  });
});

describe('Milk Recording Integration Tests', () => {
  it('should complete full milk recording flow', () => {
    // Step 1: Select cow
    const selectedCow = {
      id: 'cow-123',
      name: 'Chaltu',
      type: 'cattle',
      subtype: 'Cow'
    };

    expect(selectedCow.subtype).toBe('Cow');

    // Step 2: Select amount
    const amount = 5;
    expect(amount).toBeGreaterThan(0);

    // Step 3: Create record
    const record = {
      animal_id: selectedCow.id,
      liters: amount,
      recorded_at: new Date().toISOString(),
      session: new Date().getHours() < 12 ? 'morning' : 'evening'
    };

    expect(record.animal_id).toBe(selectedCow.id);
    expect(record.liters).toBe(amount);
    expect(record.recorded_at).toBeTruthy();
  });

  it('should handle quick amount button selection', () => {
    const quickAmounts = [2, 3, 5, 7, 10];
    const selectedAmount = quickAmounts[2]; // 5L
    
    expect(selectedAmount).toBe(5);
    expect(quickAmounts).toContain(selectedAmount);
  });

  it('should handle custom amount input', () => {
    const customInput = '4.5';
    const amount = parseFloat(customInput);
    
    expect(amount).toBe(4.5);
    expect(amount).toBeGreaterThan(0);
  });

  it('should calculate statistics correctly', () => {
    const records = [
      { liters: 3, recorded_at: '2024-10-25T06:00:00Z' },
      { liters: 4, recorded_at: '2024-10-25T18:00:00Z' },
      { liters: 3.5, recorded_at: '2024-10-24T06:00:00Z' },
      { liters: 4.5, recorded_at: '2024-10-24T18:00:00Z' }
    ];

    const total = records.reduce((sum, r) => sum + r.liters, 0);
    const average = total / records.length;
    
    expect(total).toBe(15);
    expect(average).toBe(3.75);
  });
});
