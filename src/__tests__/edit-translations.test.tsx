import { describe, it, expect } from 'vitest';
import en from '../i18n/en.json';
import am from '../i18n/am.json';

describe('Edit Functionality Translations', () => {
  describe('English Translations', () => {
    it('should have all animal edit translations', () => {
      expect(en.animals.editAnimal).toBe('Edit Animal');
      expect(en.animals.editAnimalDetails).toBe('Edit Animal Details');
      expect(en.animals.animalUpdated).toBe('Animal updated successfully');
      expect(en.animals.animalUpdateFailed).toBe('Failed to update animal');
      expect(en.animals.updating).toBe('Updating...');
      expect(en.animals.replacePhoto).toBe('Replace Photo');
      expect(en.animals.keepCurrentPhoto).toBe('Keep current photo');
      expect(en.animals.changePhoto).toBe('Change Photo');
    });

    it('should have all listing edit translations', () => {
      expect(en.marketplace.editListing).toBe('Edit Listing');
      expect(en.marketplace.editListingDetails).toBe('Edit Listing Details');
      expect(en.marketplace.listingUpdated).toBe('Listing updated successfully');
      expect(en.marketplace.listingUpdateFailed).toBe('Failed to update listing');
      expect(en.marketplace.buyerInterestsWarning).toBe('Note: {{count}} buyer(s) have expressed interest in this listing');
      expect(en.marketplace.buyerInterestsWarningDesc).toBe('Editing may affect their expectations. Consider contacting them about changes.');
      expect(en.marketplace.updatePrice).toBe('Update Price');
      expect(en.marketplace.updateDescription).toBe('Update Description');
      expect(en.marketplace.updateMedia).toBe('Update Photos & Videos');
      expect(en.marketplace.originalCreationDate).toBe('Originally listed on {{date}}');
    });

    it('should have common edit translations', () => {
      expect(en.common.edit).toBe('Edit');
      expect(en.common.saveChanges).toBe('Save Changes');
      expect(en.common.discardChanges).toBe('Discard Changes');
      expect(en.common.unsavedChanges).toBe('You have unsaved changes');
      expect(en.common.unsavedChangesWarning).toBe('Are you sure you want to discard your changes?');
    });
  });

  describe('Amharic Translations', () => {
    it('should have all animal edit translations', () => {
      expect(am.animals.editAnimal).toBe('እንስሳ አስተካክል');
      expect(am.animals.editAnimalDetails).toBe('የእንስሳ ዝርዝሮችን አስተካክል');
      expect(am.animals.animalUpdated).toBe('እንስሳ በተሳካ ሁኔታ ተዘምኗል');
      expect(am.animals.animalUpdateFailed).toBe('እንስሳ ማዘመን አልተሳካም');
      expect(am.animals.updating).toBe('በማዘመን ላይ...');
      expect(am.animals.replacePhoto).toBe('ፎቶ ተካ');
      expect(am.animals.keepCurrentPhoto).toBe('የአሁኑን ፎቶ ጠብቅ');
      expect(am.animals.changePhoto).toBe('ፎቶ ቀይር');
    });

    it('should have all listing edit translations', () => {
      expect(am.marketplace.editListing).toBe('ዝርዝር አስተካክል');
      expect(am.marketplace.editListingDetails).toBe('የዝርዝር ዝርዝሮችን አስተካክል');
      expect(am.marketplace.listingUpdated).toBe('ዝርዝር በተሳካ ሁኔታ ተዘምኗል');
      expect(am.marketplace.listingUpdateFailed).toBe('ዝርዝር ማዘመን አልተሳካም');
      expect(am.marketplace.buyerInterestsWarning).toBe('ማስታወሻ: {{count}} ገዢ(ዎች) በዚህ ዝርዝር ላይ ፍላጎት አሳይተዋል');
      expect(am.marketplace.buyerInterestsWarningDesc).toBe('ማስተካከል የእነርሱን ተስፋ ሊጎዳ ይችላል። ስለ ለውጦች ማነጋገር ያስቡበት።');
      expect(am.marketplace.updatePrice).toBe('ዋጋ አዘምን');
      expect(am.marketplace.updateDescription).toBe('መግለጫ አዘምን');
      expect(am.marketplace.updateMedia).toBe('ፎቶዎችና ቪዲዮዎች አዘምን');
      expect(am.marketplace.originalCreationDate).toBe('በመጀመሪያ የተዘረዘረው በ{{date}}');
    });

    it('should have common edit translations', () => {
      expect(am.common.edit).toBe('አርም');
      expect(am.common.saveChanges).toBe('ለውጦችን አስቀምጥ');
      expect(am.common.discardChanges).toBe('ለውጦችን አስወግድ');
      expect(am.common.unsavedChanges).toBe('ያልተቀመጡ ለውጦች አሉዎት');
      expect(am.common.unsavedChangesWarning).toBe('ለውጦችዎን ማስወገድ ይፈልጋሉ?');
    });
  });

  describe('Translation Completeness', () => {
    it('should have matching keys in both languages for animals', () => {
      const enKeys = Object.keys(en.animals);
      const amKeys = Object.keys(am.animals);
      
      // Check all English keys exist in Amharic
      enKeys.forEach(key => {
        expect(amKeys).toContain(key);
      });
      
      // Check all Amharic keys exist in English
      amKeys.forEach(key => {
        expect(enKeys).toContain(key);
      });
    });

    it('should have matching keys in both languages for marketplace', () => {
      const enKeys = Object.keys(en.marketplace);
      const amKeys = Object.keys(am.marketplace);
      
      // Check all English keys exist in Amharic
      enKeys.forEach(key => {
        expect(amKeys).toContain(key);
      });
      
      // Check all Amharic keys exist in English
      amKeys.forEach(key => {
        expect(enKeys).toContain(key);
      });
    });

    it('should have matching keys in both languages for common', () => {
      const enKeys = Object.keys(en.common);
      const amKeys = Object.keys(am.common);
      
      // Check all English keys exist in Amharic
      enKeys.forEach(key => {
        expect(amKeys).toContain(key);
      });
      
      // Check all Amharic keys exist in English
      amKeys.forEach(key => {
        expect(enKeys).toContain(key);
      });
    });
  });

  describe('Translation Interpolation', () => {
    it('should have correct interpolation placeholders', () => {
      // Check buyer interests warning has count placeholder
      expect(en.marketplace.buyerInterestsWarning).toContain('{{count}}');
      expect(am.marketplace.buyerInterestsWarning).toContain('{{count}}');
      
      // Check original creation date has date placeholder
      expect(en.marketplace.originalCreationDate).toContain('{{date}}');
      expect(am.marketplace.originalCreationDate).toContain('{{date}}');
    });
  });
});
