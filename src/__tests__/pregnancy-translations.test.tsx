import { describe, it, expect } from 'vitest';
import enTranslations from '../i18n/en.json';
import amTranslations from '../i18n/am.json';

describe('Pregnancy Tracking Translations', () => {
  describe('English translations', () => {
    it('should have all required pregnancy translation keys', () => {
      expect(enTranslations.pregnancy).toBeDefined();
      expect(enTranslations.pregnancy.record).toBe('Record Pregnancy');
      expect(enTranslations.pregnancy.recordPregnancy).toBe('Record Pregnancy');
      expect(enTranslations.pregnancy.pregnancyStatus).toBe('Pregnancy Status');
      expect(enTranslations.pregnancy.notPregnant).toBe('Not Pregnant');
      expect(enTranslations.pregnancy.pregnant).toBe('Pregnant');
      expect(enTranslations.pregnancy.delivered).toBe('Delivered');
    });

    it('should have breeding date translations', () => {
      expect(enTranslations.pregnancy.breedingDate).toBe('Breeding Date');
      expect(enTranslations.pregnancy.selectBreedingDate).toBe('Select breeding date');
      expect(enTranslations.pregnancy.breedingDateCannotBeFuture).toBe('Breeding date cannot be in the future');
      expect(enTranslations.pregnancy.invalidBreedingDate).toBe('Invalid breeding date');
    });

    it('should have delivery date translations', () => {
      expect(enTranslations.pregnancy.expectedDelivery).toBe('Expected Delivery');
      expect(enTranslations.pregnancy.expectedDeliveryDate).toBe('Expected Delivery Date');
      expect(enTranslations.pregnancy.daysRemaining).toBe('{{days}} days remaining');
      expect(enTranslations.pregnancy.dayRemaining).toBe('{{days}} day remaining');
      expect(enTranslations.pregnancy.deliverySoon).toBe('Delivery Soon!');
      expect(enTranslations.pregnancy.deliveryAlert).toBe('Delivery expected in {{days}} days');
      expect(enTranslations.pregnancy.deliveryToday).toBe('Delivery expected today!');
      expect(enTranslations.pregnancy.overdue).toBe('Overdue by {{days}} days');
    });

    it('should have birth recording translations', () => {
      expect(enTranslations.pregnancy.recordBirth).toBe('Record Birth');
      expect(enTranslations.pregnancy.birthRecorded).toBe('Birth recorded successfully');
      expect(enTranslations.pregnancy.birthDate).toBe('Birth Date');
      expect(enTranslations.pregnancy.birthOutcome).toBe('Birth Outcome');
      expect(enTranslations.pregnancy.successful).toBe('Successful');
      expect(enTranslations.pregnancy.complications).toBe('Complications');
      expect(enTranslations.pregnancy.stillborn).toBe('Stillborn');
    });

    it('should have pregnancy history translations', () => {
      expect(enTranslations.pregnancy.pregnancyHistory).toBe('Pregnancy History');
      expect(enTranslations.pregnancy.currentPregnancy).toBe('Current Pregnancy');
      expect(enTranslations.pregnancy.pastPregnancies).toBe('Past Pregnancies');
      expect(enTranslations.pregnancy.noPregnancyRecords).toBe('No pregnancy records yet');
      expect(enTranslations.pregnancy.viewHistory).toBe('View History');
      expect(enTranslations.pregnancy.noHistory).toBe('No pregnancy history available');
    });

    it('should have gestation period translations', () => {
      expect(enTranslations.pregnancy.gestationPeriod).toBe('Gestation Period');
      expect(enTranslations.pregnancy.cattleGestation).toBe('283 days (9 months)');
      expect(enTranslations.pregnancy.goatGestation).toBe('150 days (5 months)');
      expect(enTranslations.pregnancy.sheepGestation).toBe('147 days (5 months)');
    });

    it('should have offspring translations', () => {
      expect(enTranslations.pregnancy.offspring).toBe('Offspring');
      expect(enTranslations.pregnancy.registerOffspring).toBe('Register Offspring');
    });

    it('should have delivery preparation translations', () => {
      expect(enTranslations.pregnancy.preparingForDelivery).toBe('Preparing for delivery');
      expect(enTranslations.pregnancy.deliveryPreparation).toBe('Delivery Preparation');
      expect(enTranslations.pregnancy.checkRegularly).toBe('Check animal regularly');
      expect(enTranslations.pregnancy.contactVet).toBe('Have vet contact ready');
      expect(enTranslations.pregnancy.prepareSpace).toBe('Prepare clean delivery space');
      expect(enTranslations.pregnancy.monitorHealth).toBe('Monitor health closely');
    });
  });

  describe('Amharic translations', () => {
    it('should have all required pregnancy translation keys', () => {
      expect(amTranslations.pregnancy).toBeDefined();
      expect(amTranslations.pregnancy.record).toBe('እርግዝና ይመዝግቡ');
      expect(amTranslations.pregnancy.recordPregnancy).toBe('እርግዝና ይመዝግቡ');
      expect(amTranslations.pregnancy.pregnancyStatus).toBe('የእርግዝና ሁኔታ');
      expect(amTranslations.pregnancy.notPregnant).toBe('ያልረገዘች');
      expect(amTranslations.pregnancy.pregnant).toBe('ርግዝ');
      expect(amTranslations.pregnancy.delivered).toBe('ወለደች');
    });

    it('should have breeding date translations', () => {
      expect(amTranslations.pregnancy.breedingDate).toBe('የመራባት ቀን');
      expect(amTranslations.pregnancy.selectBreedingDate).toBe('የመራባት ቀን ይምረጡ');
      expect(amTranslations.pregnancy.breedingDateCannotBeFuture).toBe('የመራባት ቀን ወደፊት መሆን አይችልም');
      expect(amTranslations.pregnancy.invalidBreedingDate).toBe('ልክ ያልሆነ የመራባት ቀን');
    });

    it('should have delivery date translations', () => {
      expect(amTranslations.pregnancy.expectedDelivery).toBe('የሚጠበቀው የወሊድ ቀን');
      expect(amTranslations.pregnancy.expectedDeliveryDate).toBe('የሚጠበቀው የወሊድ ቀን');
      expect(amTranslations.pregnancy.daysRemaining).toBe('{{days}} ቀናት ቀርተዋል');
      expect(amTranslations.pregnancy.dayRemaining).toBe('{{days}} ቀን ቀርቷል');
      expect(amTranslations.pregnancy.deliverySoon).toBe('ወሊድ በቅርቡ!');
      expect(amTranslations.pregnancy.deliveryAlert).toBe('ወሊድ በ{{days}} ቀናት ውስጥ ይጠበቃል');
      expect(amTranslations.pregnancy.deliveryToday).toBe('ወሊድ ዛሬ ይጠበቃል!');
      expect(amTranslations.pregnancy.overdue).toBe('በ{{days}} ቀናት ዘግይቷል');
    });

    it('should have birth recording translations', () => {
      expect(amTranslations.pregnancy.recordBirth).toBe('ወሊድ ይመዝግቡ');
      expect(amTranslations.pregnancy.birthRecorded).toBe('ወሊድ በተሳካ ሁኔታ ተመዝግቧል');
      expect(amTranslations.pregnancy.birthDate).toBe('የወሊድ ቀን');
      expect(amTranslations.pregnancy.birthOutcome).toBe('የወሊድ ውጤት');
      expect(amTranslations.pregnancy.successful).toBe('ተሳክቷል');
      expect(amTranslations.pregnancy.complications).toBe('ችግሮች');
      expect(amTranslations.pregnancy.stillborn).toBe('ሞቶ የተወለደ');
    });

    it('should have pregnancy history translations', () => {
      expect(amTranslations.pregnancy.pregnancyHistory).toBe('የእርግዝና ታሪክ');
      expect(amTranslations.pregnancy.currentPregnancy).toBe('የአሁኑ እርግዝና');
      expect(amTranslations.pregnancy.pastPregnancies).toBe('ያለፉ እርግዝናዎች');
      expect(amTranslations.pregnancy.noPregnancyRecords).toBe('ገና ምንም የእርግዝና መዝገብ የለም');
      expect(amTranslations.pregnancy.viewHistory).toBe('ታሪክ ይመልከቱ');
      expect(amTranslations.pregnancy.noHistory).toBe('ምንም የእርግዝና ታሪክ የለም');
    });

    it('should have gestation period translations', () => {
      expect(amTranslations.pregnancy.gestationPeriod).toBe('የእርግዝና ጊዜ');
      expect(amTranslations.pregnancy.cattleGestation).toBe('283 ቀናት (9 ወራት)');
      expect(amTranslations.pregnancy.goatGestation).toBe('150 ቀናት (5 ወራት)');
      expect(amTranslations.pregnancy.sheepGestation).toBe('147 ቀናት (5 ወራት)');
    });

    it('should have offspring translations', () => {
      expect(amTranslations.pregnancy.offspring).toBe('ዘር');
      expect(amTranslations.pregnancy.registerOffspring).toBe('ዘር ይመዝግቡ');
    });

    it('should have delivery preparation translations', () => {
      expect(amTranslations.pregnancy.preparingForDelivery).toBe('ለወሊድ በመዘጋጀት ላይ');
      expect(amTranslations.pregnancy.deliveryPreparation).toBe('የወሊድ ዝግጅት');
      expect(amTranslations.pregnancy.checkRegularly).toBe('እንስሳውን በየጊዜው ይመርምሩ');
      expect(amTranslations.pregnancy.contactVet).toBe('የእንስሳት ሐኪም ግንኙነት ዝግጁ ያድርጉ');
      expect(amTranslations.pregnancy.prepareSpace).toBe('ንጹህ የወሊድ ቦታ ያዘጋጁ');
      expect(amTranslations.pregnancy.monitorHealth).toBe('ጤናን በቅርበት ይከታተሉ');
    });
  });

  describe('Translation completeness', () => {
    it('should have matching keys in both languages', () => {
      const enKeys = Object.keys(enTranslations.pregnancy);
      const amKeys = Object.keys(amTranslations.pregnancy);
      
      expect(enKeys.sort()).toEqual(amKeys.sort());
    });

    it('should have no empty translations in English', () => {
      Object.entries(enTranslations.pregnancy).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have no empty translations in Amharic', () => {
      Object.entries(amTranslations.pregnancy).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Placeholder consistency', () => {
    it('should have consistent placeholders in both languages', () => {
      const keysWithPlaceholders = [
        'daysRemaining',
        'dayRemaining',
        'deliveryAlert',
        'overdue'
      ];

      keysWithPlaceholders.forEach(key => {
        const enValue = enTranslations.pregnancy[key as keyof typeof enTranslations.pregnancy];
        const amValue = amTranslations.pregnancy[key as keyof typeof amTranslations.pregnancy];
        
        // Check that both have the {{days}} placeholder
        expect(enValue).toContain('{{days}}');
        expect(amValue).toContain('{{days}}');
      });
    });
  });
});
