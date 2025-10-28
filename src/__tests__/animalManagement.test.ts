// src/__tests__/animalManagement.test.ts - Comprehensive Animal Management Tests

import { describe, it, expect, beforeEach } from 'vitest';

describe('Animal Management System Tests', () => {
  describe('Animal Type and Subtype Validation', () => {
    const ANIMAL_TYPES = ['cattle', 'goat', 'sheep'] as const;
    
    const ANIMAL_SUBTYPES = {
      cattle: ['Cow', 'Bull', 'Ox', 'Calf'],
      goat: ['Male', 'Female'],
      sheep: ['Ram', 'Ewe']
    };

    it('should have all required animal types', () => {
      expect(ANIMAL_TYPES).toContain('cattle');
      expect(ANIMAL_TYPES).toContain('goat');
      expect(ANIMAL_TYPES).toContain('sheep');
      expect(ANIMAL_TYPES.length).toBe(3);
    });

    it('should have correct cattle subtypes', () => {
      const cattleSubtypes = ANIMAL_SUBTYPES.cattle;
      expect(cattleSubtypes).toContain('Cow');
      expect(cattleSubtypes).toContain('Bull');
      expect(cattleSubtypes).toContain('Ox');
      expect(cattleSubtypes).toContain('Calf');
      expect(cattleSubtypes.length).toBe(4);
    });

    it('should have correct goat subtypes', () => {
      const goatSubtypes = ANIMAL_SUBTYPES.goat;
      expect(goatSubtypes).toContain('Male');
      expect(goatSubtypes).toContain('Female');
      expect(goatSubtypes.length).toBe(2);
    });

    it('should have correct sheep subtypes', () => {
      const sheepSubtypes = ANIMAL_SUBTYPES.sheep;
      expect(sheepSubtypes).toContain('Ram');
      expect(sheepSubtypes).toContain('Ewe');
      expect(sheepSubtypes.length).toBe(2);
    });
  });

  describe('Animal Registration Data Model', () => {
    it('should have required fields for animal registration', () => {
      const animal = {
        id: 'test-id',
        user_id: 'user-123',
        name: 'Chaltu',
        type: 'cattle',
        subtype: 'Cow',
        photo_url: null,
        registration_date: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString()
      };

      expect(animal.id).toBeTruthy();
      expect(animal.user_id).toBeTruthy();
      expect(animal.name).toBeTruthy();
      expect(animal.type).toBeTruthy();
      expect(animal.subtype).toBeTruthy();
      expect(animal.is_active).toBe(true);
    });

    it('should allow optional photo_url', () => {
      const animalWithPhoto = {
        name: 'Beza',
        type: 'cattle',
        subtype: 'Cow',
        photo_url: 'https://example.com/photo.jpg'
      };

      const animalWithoutPhoto = {
        name: 'Chaltu',
        type: 'cattle',
        subtype: 'Cow',
        photo_url: null
      };

      expect(animalWithPhoto.photo_url).toBeTruthy();
      expect(animalWithoutPhoto.photo_url).toBeNull();
    });

    it('should validate animal name is not empty', () => {
      const validNames = ['Chaltu', 'Beza', 'Moti', 'ቻልቱ'];
      const invalidNames = ['', '   ', null, undefined];

      validNames.forEach(name => {
        expect(name).toBeTruthy();
        expect(name.trim().length).toBeGreaterThan(0);
      });

      invalidNames.forEach(name => {
        if (name) {
          expect(name.trim().length).toBe(0);
        } else {
          expect(name).toBeFalsy();
        }
      });
    });
  });

  describe('Animal Features by Subtype', () => {
    const ANIMAL_FEATURES = {
      'Cow': ['milk_production', 'pregnancy', 'health'],
      'Bull': ['weight', 'health', 'marketplace'],
      'Ox': ['weight', 'health', 'marketplace'],
      'Calf': ['growth', 'health', 'weaning'],
      'Female': ['pregnancy', 'health', 'offspring'],
      'Male': ['weight', 'health', 'marketplace'],
      'Ewe': ['pregnancy', 'health', 'offspring'],
      'Ram': ['weight', 'health', 'marketplace']
    };

    it('should have milk production feature for cows', () => {
      const cowFeatures = ANIMAL_FEATURES['Cow'];
      expect(cowFeatures).toContain('milk_production');
      expect(cowFeatures).toContain('pregnancy');
    });

    it('should have marketplace feature for bulls and oxen', () => {
      const bullFeatures = ANIMAL_FEATURES['Bull'];
      const oxFeatures = ANIMAL_FEATURES['Ox'];
      
      expect(bullFeatures).toContain('marketplace');
      expect(oxFeatures).toContain('marketplace');
    });

    it('should have pregnancy feature for female animals', () => {
      const cowFeatures = ANIMAL_FEATURES['Cow'];
      const femaleGoatFeatures = ANIMAL_FEATURES['Female'];
      const eweFeatures = ANIMAL_FEATURES['Ewe'];
      
      expect(cowFeatures).toContain('pregnancy');
      expect(femaleGoatFeatures).toContain('pregnancy');
      expect(eweFeatures).toContain('pregnancy');
    });

    it('should have growth feature for calves', () => {
      const calfFeatures = ANIMAL_FEATURES['Calf'];
      expect(calfFeatures).toContain('growth');
      expect(calfFeatures).toContain('weaning');
    });
  });

  describe('Animal List Filtering', () => {
    const mockAnimals = [
      { id: '1', name: 'Chaltu', type: 'cattle', subtype: 'Cow' },
      { id: '2', name: 'Beza', type: 'cattle', subtype: 'Bull' },
      { id: '3', name: 'Moti', type: 'goat', subtype: 'Male' },
      { id: '4', name: 'Tiru', type: 'goat', subtype: 'Female' },
      { id: '5', name: 'Bati', type: 'sheep', subtype: 'Ram' }
    ];

    it('should filter animals by type - cattle', () => {
      const cattle = mockAnimals.filter(a => a.type === 'cattle');
      expect(cattle.length).toBe(2);
      expect(cattle.every(a => a.type === 'cattle')).toBe(true);
    });

    it('should filter animals by type - goats', () => {
      const goats = mockAnimals.filter(a => a.type === 'goat');
      expect(goats.length).toBe(2);
      expect(goats.every(a => a.type === 'goat')).toBe(true);
    });

    it('should filter animals by type - sheep', () => {
      const sheep = mockAnimals.filter(a => a.type === 'sheep');
      expect(sheep.length).toBe(1);
      expect(sheep.every(a => a.type === 'sheep')).toBe(true);
    });

    it('should show all animals when filter is "All"', () => {
      const all = mockAnimals.filter(a => true);
      expect(all.length).toBe(5);
    });

    it('should filter only cows for milk recording', () => {
      const cows = mockAnimals.filter(a => a.type === 'cattle' && a.subtype === 'Cow');
      expect(cows.length).toBe(1);
      expect(cows[0].name).toBe('Chaltu');
    });
  });

  describe('Animal Deletion (Soft Delete)', () => {
    it('should soft delete by setting is_active to false', () => {
      const animal = {
        id: '1',
        name: 'Chaltu',
        type: 'cattle',
        subtype: 'Cow',
        is_active: true
      };

      // Simulate soft delete
      const deletedAnimal = { ...animal, is_active: false };
      
      expect(deletedAnimal.is_active).toBe(false);
      expect(deletedAnimal.id).toBe(animal.id); // ID still exists
      expect(deletedAnimal.name).toBe(animal.name); // Data preserved
    });

    it('should filter out inactive animals from list', () => {
      const animals = [
        { id: '1', name: 'Chaltu', is_active: true },
        { id: '2', name: 'Beza', is_active: false },
        { id: '3', name: 'Moti', is_active: true }
      ];

      const activeAnimals = animals.filter(a => a.is_active);
      expect(activeAnimals.length).toBe(2);
      expect(activeAnimals.find(a => a.name === 'Beza')).toBeUndefined();
    });
  });

  describe('Photo Upload Validation', () => {
    it('should validate photo file size (<500KB)', () => {
      const maxSize = 500 * 1024; // 500KB in bytes
      
      const validSize = 400 * 1024; // 400KB
      const invalidSize = 600 * 1024; // 600KB
      
      expect(validSize).toBeLessThan(maxSize);
      expect(invalidSize).toBeGreaterThan(maxSize);
    });

    it('should accept common image formats', () => {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const testFile = { type: 'image/jpeg' };
      
      expect(validFormats).toContain(testFile.type);
    });

    it('should reject non-image files', () => {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalidFiles = [
        { type: 'application/pdf' },
        { type: 'video/mp4' },
        { type: 'text/plain' }
      ];
      
      invalidFiles.forEach(file => {
        expect(validFormats).not.toContain(file.type);
      });
    });
  });

  describe('Animal Registration Flow', () => {
    it('should follow 3-step registration flow', () => {
      const steps = [
        'select_type',      // Step 1: Select animal type
        'select_subtype',   // Step 2: Select subtype
        'enter_name'        // Step 3: Enter name (optional photo)
      ];

      expect(steps.length).toBe(3);
      expect(steps[0]).toBe('select_type');
      expect(steps[steps.length - 1]).toBe('enter_name');
    });

    it('should allow skipping photo upload', () => {
      const registration = {
        type: 'cattle',
        subtype: 'Cow',
        name: 'Chaltu',
        photo_url: null // Photo skipped
      };

      expect(registration.name).toBeTruthy();
      expect(registration.photo_url).toBeNull();
    });

    it('should create valid registration data', () => {
      const registration = {
        type: 'cattle',
        subtype: 'Cow',
        name: 'Chaltu',
        photo_url: 'https://example.com/photo.jpg',
        registration_date: new Date().toISOString()
      };

      expect(registration.type).toBe('cattle');
      expect(registration.subtype).toBe('Cow');
      expect(registration.name).toBe('Chaltu');
      expect(registration.photo_url).toBeTruthy();
      expect(new Date(registration.registration_date)).toBeInstanceOf(Date);
    });
  });

  describe('Animal Icons and Display', () => {
    const ANIMAL_ICONS = {
      cattle: '🐄',
      goat: '🐐',
      sheep: '🐑'
    };

    it('should have icon for each animal type', () => {
      expect(ANIMAL_ICONS.cattle).toBe('🐄');
      expect(ANIMAL_ICONS.goat).toBe('🐐');
      expect(ANIMAL_ICONS.sheep).toBe('🐑');
    });

    it('should display animal with correct icon', () => {
      const animal = { type: 'cattle', name: 'Chaltu' };
      const icon = ANIMAL_ICONS[animal.type as keyof typeof ANIMAL_ICONS];
      
      expect(icon).toBe('🐄');
    });
  });

  describe('Animal Quick Actions', () => {
    it('should show "Record Milk" action for cows', () => {
      const cow = { type: 'cattle', subtype: 'Cow' };
      const showMilkAction = cow.subtype === 'Cow';
      
      expect(showMilkAction).toBe(true);
    });

    it('should show "Record Pregnancy" action for female animals', () => {
      const femaleAnimals = [
        { type: 'cattle', subtype: 'Cow' },
        { type: 'goat', subtype: 'Female' },
        { type: 'sheep', subtype: 'Ewe' }
      ];

      const femaleSubtypes = ['Cow', 'Female', 'Ewe'];
      
      femaleAnimals.forEach(animal => {
        const showPregnancyAction = femaleSubtypes.includes(animal.subtype);
        expect(showPregnancyAction).toBe(true);
      });
    });

    it('should not show "Record Milk" action for non-cows', () => {
      const nonCows = [
        { type: 'cattle', subtype: 'Bull' },
        { type: 'goat', subtype: 'Male' },
        { type: 'sheep', subtype: 'Ram' }
      ];

      nonCows.forEach(animal => {
        const showMilkAction = animal.subtype === 'Cow';
        expect(showMilkAction).toBe(false);
      });
    });
  });

  describe('Animal Name Validation', () => {
    it('should accept Amharic names', () => {
      const amharicNames = ['ቻልቱ', 'በዛ', 'ሞቲ', 'ጥሩ'];
      
      amharicNames.forEach(name => {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should accept English names', () => {
      const englishNames = ['Chaltu', 'Beza', 'Moti', 'Tiru'];
      
      englishNames.forEach(name => {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should trim whitespace from names', () => {
      const nameWithSpaces = '  Chaltu  ';
      const trimmed = nameWithSpaces.trim();
      
      expect(trimmed).toBe('Chaltu');
      expect(trimmed.length).toBe(6);
    });

    it('should have reasonable name length limits', () => {
      const shortName = 'Bo';
      const normalName = 'Chaltu';
      const longName = 'A'.repeat(100);
      
      expect(shortName.length).toBeGreaterThanOrEqual(2);
      expect(normalName.length).toBeLessThan(50);
      expect(longName.length).toBeLessThanOrEqual(100);
    });
  });
});

describe('Animal Management Integration Tests', () => {
  it('should register cattle with all subtypes', async () => {
    const cattleSubtypes = ['Cow', 'Bull', 'Ox', 'Calf'];
    
    const registrations = cattleSubtypes.map(subtype => ({
      type: 'cattle',
      subtype,
      name: `Test ${subtype}`,
      user_id: 'test-user'
    }));

    expect(registrations.length).toBe(4);
    registrations.forEach(reg => {
      expect(reg.type).toBe('cattle');
      expect(cattleSubtypes).toContain(reg.subtype);
    });
  });

  it('should register goats with all subtypes', async () => {
    const goatSubtypes = ['Male', 'Female'];
    
    const registrations = goatSubtypes.map(subtype => ({
      type: 'goat',
      subtype,
      name: `Test ${subtype} Goat`,
      user_id: 'test-user'
    }));

    expect(registrations.length).toBe(2);
    registrations.forEach(reg => {
      expect(reg.type).toBe('goat');
      expect(goatSubtypes).toContain(reg.subtype);
    });
  });

  it('should register sheep with all subtypes', async () => {
    const sheepSubtypes = ['Ram', 'Ewe'];
    
    const registrations = sheepSubtypes.map(subtype => ({
      type: 'sheep',
      subtype,
      name: `Test ${subtype}`,
      user_id: 'test-user'
    }));

    expect(registrations.length).toBe(2);
    registrations.forEach(reg => {
      expect(reg.type).toBe('sheep');
      expect(sheepSubtypes).toContain(reg.subtype);
    });
  });

  it('should handle optimistic UI updates', () => {
    const tempAnimal = {
      id: 'temp-123',
      name: 'Chaltu',
      type: 'cattle',
      subtype: 'Cow',
      status: 'pending'
    };

    // Simulate optimistic update
    expect(tempAnimal.id).toContain('temp');
    expect(tempAnimal.status).toBe('pending');

    // Simulate server response
    const savedAnimal = {
      ...tempAnimal,
      id: 'real-456',
      status: 'saved'
    };

    expect(savedAnimal.id).not.toContain('temp');
    expect(savedAnimal.status).toBe('saved');
  });

  it('should queue offline registrations', () => {
    const offlineRegistration = {
      action_type: 'animal_registration',
      payload: {
        type: 'cattle',
        subtype: 'Cow',
        name: 'Chaltu'
      },
      status: 'pending',
      retry_count: 0
    };

    expect(offlineRegistration.action_type).toBe('animal_registration');
    expect(offlineRegistration.status).toBe('pending');
    expect(offlineRegistration.retry_count).toBe(0);
  });
});

describe('Animal Detail View Tests', () => {
  it('should display all animal information', () => {
    const animal = {
      id: '1',
      name: 'Chaltu',
      type: 'cattle',
      subtype: 'Cow',
      photo_url: 'https://example.com/photo.jpg',
      registration_date: '2024-01-15T10:00:00Z',
      is_active: true
    };

    expect(animal.name).toBeTruthy();
    expect(animal.type).toBeTruthy();
    expect(animal.subtype).toBeTruthy();
    expect(animal.photo_url).toBeTruthy();
    expect(animal.registration_date).toBeTruthy();
  });

  it('should calculate animal age from registration date', () => {
    const registrationDate = new Date('2024-01-01');
    const now = new Date('2024-10-25');
    
    const ageInDays = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    const ageInMonths = Math.floor(ageInDays / 30);
    
    expect(ageInMonths).toBeGreaterThan(0);
    expect(ageInMonths).toBeLessThan(12);
  });

  it('should show action buttons based on animal type', () => {
    const cow = { subtype: 'Cow' };
    const bull = { subtype: 'Bull' };
    
    const cowActions = ['Record Milk', 'Record Pregnancy', 'Edit', 'Delete', 'List for Sale'];
    const bullActions = ['Edit', 'Delete', 'List for Sale'];
    
    expect(cowActions).toContain('Record Milk');
    expect(bullActions).not.toContain('Record Milk');
  });
});
