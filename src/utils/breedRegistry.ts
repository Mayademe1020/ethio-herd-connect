/**
 * Breed Registry Service
 * 
 * Provides utility functions for managing and querying Ethiopian livestock breeds.
 * Handles breed filtering, searching, validation, and language support.
 */

import { Language } from '@/types';
import {
  AnimalType,
  BreedInfo,
  ETHIOPIAN_BREEDS,
  OTHER_BREED_OPTION,
  getBreedType,
  getBreedsByType,
  getBreedById,
  getBreedName
} from '@/data/ethiopianBreeds';

export interface BreedOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Breed Registry Service
 * Centralized service for breed data operations
 */
export class BreedRegistryService {
  /**
   * Get all breeds for a specific animal type formatted for UI display
   * 
   * @param animalType - The type of animal (cattle, sheep, goat, etc.)
   * @param language - Language for breed names (default: 'en')
   * @returns Array of breed options with value and label
   */
  static getBreedsByAnimalType(
    animalType: AnimalType,
    language: Language = 'en'
  ): BreedOption[] {
    const breeds = getBreedsByType(animalType);
    
    const breedOptions: BreedOption[] = breeds.map(breed => ({
      value: breed.id,
      label: breed.name[language] || breed.name.en,
      description: breed.description?.[language] || breed.description?.en
    }));

    // Add "Other/Unknown" option at the end
    breedOptions.push({
      value: OTHER_BREED_OPTION.id,
      label: OTHER_BREED_OPTION.name[language] || OTHER_BREED_OPTION.name.en,
      description: OTHER_BREED_OPTION.description?.[language] || OTHER_BREED_OPTION.description?.en
    });

    return breedOptions;
  }

  /**
   * Get breeds for form animal type (handles cow, bull, ox, calf -> cattle mapping)
   * 
   * @param formAnimalType - Animal type from registration form
   * @param language - Language for breed names (default: 'en')
   * @returns Array of breed options or empty array if type not found
   */
  static getBreedsByFormAnimalType(
    formAnimalType: string,
    language: Language = 'en'
  ): BreedOption[] {
    const breedType = getBreedType(formAnimalType);
    if (!breedType) return [];
    
    return this.getBreedsByAnimalType(breedType, language);
  }

  /**
   * Search breeds by query string
   * Searches across both English and Amharic names
   * 
   * @param animalType - The type of animal to search within
   * @param query - Search query string
   * @param language - Language for breed names (default: 'en')
   * @returns Filtered array of breed options matching the query
   */
  static searchBreeds(
    animalType: AnimalType,
    query: string,
    language: Language = 'en'
  ): BreedOption[] {
    if (!query || query.trim() === '') {
      return this.getBreedsByAnimalType(animalType, language);
    }

    const breeds = getBreedsByType(animalType);
    const normalizedQuery = query.toLowerCase().trim();

    const matchedBreeds = breeds.filter(breed => {
      // Search in English name
      const englishMatch = breed.name.en.toLowerCase().includes(normalizedQuery);
      
      // Search in Amharic name
      const amharicMatch = breed.name.am.toLowerCase().includes(normalizedQuery);
      
      // Search in description if available
      const descriptionMatch = 
        breed.description?.en?.toLowerCase().includes(normalizedQuery) ||
        breed.description?.am?.toLowerCase().includes(normalizedQuery);

      return englishMatch || amharicMatch || descriptionMatch;
    });

    const breedOptions: BreedOption[] = matchedBreeds.map(breed => ({
      value: breed.id,
      label: breed.name[language] || breed.name.en,
      description: breed.description?.[language] || breed.description?.en
    }));

    // Always include "Other/Unknown" option in search results
    breedOptions.push({
      value: OTHER_BREED_OPTION.id,
      label: OTHER_BREED_OPTION.name[language] || OTHER_BREED_OPTION.name.en,
      description: OTHER_BREED_OPTION.description?.[language] || OTHER_BREED_OPTION.description?.en
    });

    return breedOptions;
  }

  /**
   * Get detailed breed information by ID
   * 
   * @param breedId - The unique identifier of the breed
   * @param language - Language for breed information (default: 'en')
   * @returns Breed information object or null if not found
   */
  static getBreedInfo(
    breedId: string,
    language: Language = 'en'
  ): BreedInfo | null {
    // Handle "Other/Unknown" special case
    if (breedId === OTHER_BREED_OPTION.id) {
      return OTHER_BREED_OPTION;
    }

    return getBreedById(breedId);
  }

  /**
   * Get breed display name in specified language
   * 
   * @param breedId - The unique identifier of the breed
   * @param language - Language for breed name (default: 'en')
   * @returns Breed name in specified language with fallback to English
   */
  static getBreedDisplayName(
    breedId: string,
    language: Language = 'en'
  ): string {
    // Handle "Other/Unknown" special case
    if (breedId === OTHER_BREED_OPTION.id) {
      return OTHER_BREED_OPTION.name[language] || OTHER_BREED_OPTION.name.en;
    }

    return getBreedName(breedId, language);
  }

  /**
   * Validate if a breed exists for a specific animal type
   * 
   * @param animalType - The type of animal
   * @param breedId - The breed identifier to validate
   * @returns True if breed is valid for the animal type
   */
  static isValidBreed(
    animalType: AnimalType,
    breedId: string
  ): boolean {
    // "Other/Unknown" is always valid
    if (breedId === OTHER_BREED_OPTION.id) {
      return true;
    }

    const breeds = getBreedsByType(animalType);
    return breeds.some(breed => breed.id === breedId);
  }

  /**
   * Validate breed for form animal type
   * 
   * @param formAnimalType - Animal type from registration form
   * @param breedId - The breed identifier to validate
   * @returns True if breed is valid for the form animal type
   */
  static isValidBreedForFormType(
    formAnimalType: string,
    breedId: string
  ): boolean {
    const breedType = getBreedType(formAnimalType);
    if (!breedType) return false;
    
    return this.isValidBreed(breedType, breedId);
  }

  /**
   * Check if a breed ID represents a custom/unknown breed
   * 
   * @param breedId - The breed identifier to check
   * @returns True if this is the "Other/Unknown" option
   */
  static isCustomBreed(breedId: string): boolean {
    return breedId === OTHER_BREED_OPTION.id;
  }

  /**
   * Get breed characteristics for display
   * 
   * @param breedId - The breed identifier
   * @param language - Language for characteristics (default: 'en')
   * @returns Formatted characteristics string or null
   */
  static getBreedCharacteristics(
    breedId: string,
    language: Language = 'en'
  ): string | null {
    const breed = this.getBreedInfo(breedId, language);
    if (!breed || !breed.characteristics) return null;

    const { size, color, distinguishingFeatures } = breed.characteristics;
    const parts: string[] = [];

    if (size) parts.push(`Size: ${size}`);
    if (color && color.length > 0) parts.push(`Color: ${color.join(', ')}`);
    if (distinguishingFeatures) parts.push(`Features: ${distinguishingFeatures}`);

    return parts.length > 0 ? parts.join(' • ') : null;
  }

  /**
   * Get all available animal types that have breeds defined
   * 
   * @returns Array of animal types
   */
  static getAvailableAnimalTypes(): AnimalType[] {
    return Object.keys(ETHIOPIAN_BREEDS) as AnimalType[];
  }

  /**
   * Get count of breeds for a specific animal type
   * 
   * @param animalType - The type of animal
   * @returns Number of breeds available (excluding "Other/Unknown")
   */
  static getBreedCount(animalType: AnimalType): number {
    const breeds = getBreedsByType(animalType);
    return breeds.length;
  }
}

// Export for convenience
export type { AnimalType, BreedInfo };
export { OTHER_BREED_OPTION };
