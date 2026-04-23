/**
 * @fileoverview Localization Configuration
 * Amharic and local language support for livestock health
 * 
 * CRITICAL: This system is designed to work with IRLI, Ministry of Agriculture,
 * and AGA (Animal Genetic Authority) data. Hardcoded values are placeholders only.
 * 
 * TODO: Replace with official veterinary terminology from Ethiopian authorities
 */

export type LanguageCode = 'am' | 'en' | 'om' | 'ti' | 'so'; // Amharic, English, Oromo, Tigrinya, Somali

export interface LocalizedTerm {
  language: LanguageCode;
  term: string;
  region?: string; // Specific region where this term is used (e.g., "Oromia", "Tigray")
  confidence: 'official' | 'verified' | 'community'; // Source reliability
  source?: string; // IRLI, MoA, AGA, Community, etc.
}

export interface SymptomMapping {
  medicalTerm: string; // Official veterinary term (English for internal use)
  translations: LocalizedTerm[];
  category: 'behavioral' | 'physical' | 'production' | 'emergency';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  visualIndicators?: string[]; // For photo-based identification
  relatedSymptoms?: string[]; // Other symptoms that commonly appear together
}

export interface MedicineLocalization {
  genericName: string; // International generic name
  brandNames: LocalizedTerm[]; // Local brand names
  localAvailability: 'widely_available' | 'pharmacy_only' | 'vet_only' | 'unavailable';
  typicalPrice?: { // ETB (will be populated by regional data)
    min: number;
    max: number;
    region: string;
    lastUpdated: string;
  }[];
}

// ============================================
// AMHARIC SYMPTOM MAPPINGS (PLACEHOLDER)
// TODO: Replace with official IRLI/MoA terminology
// ============================================

export const SYMPTOM_DATABASE: Record<string, SymptomMapping> = {
  // EXAMPLE: This shows the structure, but real data should come from authorities
  'fever': {
    medicalTerm: 'fever',
    translations: [
      { 
        language: 'am', 
        term: 'ትኩሳት', // Tikisat
        region: 'All Ethiopia',
        confidence: 'verified',
        source: 'Community verified'
      },
      { 
        language: 'am', 
        term: 'የሙቀት መጨመር', // Ye-muket mechemer
        region: 'All Ethiopia',
        confidence: 'official',
        source: 'MoA Dictionary'
      }
    ],
    category: 'physical',
    severity: 'moderate',
    relatedSymptoms: ['lethargy', 'decreased_appetite', 'rapid_breathing']
  },

  // PLACEHOLDER: Real data should come from IRLI/MoA
  // Example of what farmers might say vs. medical term
  'skin_nodules': {
    medicalTerm: 'skin_nodules',
    translations: [
      {
        language: 'am',
        term: 'ቆዳ ላይ እብድ', // Koda lay ibid (lumps on skin)
        region: 'Amhara, Oromia',
        confidence: 'community',
        source: 'Farmer interviews'
      },
      {
        language: 'am',
        term: 'የቆዳ ብልጭላ', // Ye-koda bilchila
        region: 'All Ethiopia',
        confidence: 'verified',
        source: 'Vet extension workers'
      },
      {
        language: 'om',
        term: 'Gogaa irratti bocaa', // Oromo
        region: 'Oromia',
        confidence: 'community',
        source: 'Regional survey'
      }
    ],
    category: 'physical',
    severity: 'severe',
    visualIndicators: ['round_lumps', 'firm_texture', '2-5cm_diameter'],
    relatedSymptoms: ['fever', 'decreased_milk', 'lethargy']
  },

  // TODO: Add 100+ more symptoms with official translations
  // This should be a collaborative effort with:
  // - IRLI (International Livestock Research Institute)
  // - Ethiopian Ministry of Agriculture
  // - AGA (Animal Genetic Authority)
  // - Regional veterinary colleges
  // - Local extension workers
};

// ============================================
// MEDICINE LOCALIZATIONS (PLACEHOLDER)
// TODO: Replace with official MoA approved medicine list
// ============================================

export const MEDICINE_LOCALIZATIONS: Record<string, MedicineLocalization> = {
  'oxytetracycline': {
    genericName: 'Oxytetracycline',
    brandNames: [
      {
        language: 'am',
        term: 'ኦክሲቴትራሳይክሊን', // Phonetic
        confidence: 'official',
        source: 'Pharmacy association'
      },
      {
        language: 'am',
        term: 'ልክሲን', // Common local name
        confidence: 'community',
        source: 'Farmer usage'
      }
    ],
    localAvailability: 'pharmacy_only',
    typicalPrice: [
      {
        min: 120,
        max: 180,
        region: 'Addis Ababa',
        lastUpdated: '2025-01-15'
      },
      {
        min: 100,
        max: 150,
        region: 'Oromia',
        lastUpdated: '2025-01-15'
      }
    ]
  }
  // TODO: Add all MoA-approved medicines with local names and pricing
};

// ============================================
// DISEASE LOCALIZATIONS (PLACEHOLDER)
// TODO: Replace with official veterinary terminology
// ============================================

export const DISEASE_LOCALIZATIONS: Record<string, {
  medicalName: string;
  translations: LocalizedTerm[];
  localPrevalence: Record<string, 'high' | 'medium' | 'low'>; // By region
}> = {
  'lumpy_skin_disease': {
    medicalName: 'Lumpy Skin Disease',
    translations: [
      {
        language: 'am',
        term: 'ጌንዲ', // Gendi - widely used local name
        region: 'All Ethiopia',
        confidence: 'verified',
        source: 'Vet extension manual'
      },
      {
        language: 'am',
        term: 'ቆዳ ላይ እብድ ያለው በሽታ', // Descriptive
        region: 'All Ethiopia',
        confidence: 'community',
        source: 'Farmer description'
      },
      {
        language: 'om',
        term: 'Lumpy Skin Disease', // Often used as-is in Oromia
        region: 'Oromia',
        confidence: 'verified',
        source: 'Official'
      }
    ],
    localPrevalence: {
      'Oromia': 'high',
      'Amhara': 'high',
      'SNNPR': 'medium',
      'Tigray': 'medium'
    }
  }
  // TODO: Add all diseases with official Amharic/Oromo/etc. names
};

// ============================================
// LOCALIZATION HELPERS
// ============================================

/**
 * Translates a medical term to local language
 * @param medicalTerm - The medical term (English)
 * @param language - Target language code
 * @returns {string | undefined} Localized term or undefined
 */
export const translateSymptom = (
  medicalTerm: string,
  language: LanguageCode = 'am'
): string | undefined => {
  const mapping = SYMPTOM_DATABASE[medicalTerm];
  if (!mapping) return undefined;
  
  const translation = mapping.translations.find(t => t.language === language);
  return translation?.term;
};

/**
 * Reverse lookup: Local term → Medical term
 * @param localTerm - Term in local language (e.g., "ጌንዲ")
 * @returns {string | undefined} Medical term or undefined
 */
export const normalizeSymptom = (localTerm: string): string | undefined => {
  // Search all translations for match
  for (const [medicalTerm, mapping] of Object.entries(SYMPTOM_DATABASE)) {
    const match = mapping.translations.find(t => 
      t.term.toLowerCase() === localTerm.toLowerCase()
    );
    if (match) return medicalTerm;
  }
  return undefined;
};

/**
 * Fuzzy matching for symptom recognition
 * Handles typos and variations in local language input
 * @param input - User input (local language)
 * @param language - Language code
 * @returns {Array<{term: string; confidence: number}>} Matches with confidence
 */
export const fuzzyMatchSymptom = (
  input: string,
  language: LanguageCode = 'am'
): Array<{term: string; confidence: number}> => {
  const matches: Array<{term: string; confidence: number}> = [];
  const inputLower = input.toLowerCase();
  
  for (const [medicalTerm, mapping] of Object.entries(SYMPTOM_DATABASE)) {
    for (const translation of mapping.translations) {
      if (translation.language !== language) continue;
      
      const termLower = translation.term.toLowerCase();
      
      // Exact match
      if (termLower === inputLower) {
        matches.push({ term: medicalTerm, confidence: 1.0 });
        break;
      }
      
      // Contains match
      if (termLower.includes(inputLower) || inputLower.includes(termLower)) {
        matches.push({ term: medicalTerm, confidence: 0.8 });
      }
      
      // TODO: Add Levenshtein distance for typo tolerance
      // TODO: Add phonetic matching for similar-sounding words
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
};

// ============================================
// AUTHORITY INTEGRATION PATTERN
// ============================================

/**
 * Interface for authority data providers
 * Implement this for IRLI, MoA, AGA integrations
 */
export interface AuthorityDataProvider {
  id: string;
  name: string;
  type: 'government' | 'ngo' | 'research' | 'international';
  
  // Fetch official disease database
  fetchDiseaseDatabase(): Promise<Record<string, unknown>>;
  
  // Fetch localized terminology
  fetchLocalizations(language: LanguageCode): Promise<Record<string, LocalizedTerm[]>>;
  
  // Fetch treatment protocols
  fetchTreatmentProtocols(diseaseId: string): Promise<unknown>;
  
  // Report local outbreak (two-way communication)
  reportOutbreak(data: {
    disease: string;
    location: string;
    cases: number;
    date: string;
  }): Promise<boolean>;
}

/**
 * Example: Ministry of Agriculture Integration
 */
export const MinistryOfAgricultureProvider: AuthorityDataProvider = {
  id: 'moae-ethiopia',
  name: 'Ministry of Agriculture - Ethiopia',
  type: 'government',
  
  async fetchDiseaseDatabase() {
    // TODO: Implement actual API call to MoA system
    // Endpoint: https://api.moa.gov.et/v1/livestock-diseases
    // Requires: API key, authentication
    throw new Error('Not implemented - awaiting MoA API access');
  },
  
  async fetchLocalizations(language) {
    // TODO: Fetch official veterinary terminology
    // This ensures we're using government-approved terms
    throw new Error('Not implemented - awaiting MoA terminology database');
  },
  
  async fetchTreatmentProtocols(diseaseId) {
    // TODO: Fetch official treatment protocols
    // These are the legally approved treatments in Ethiopia
    throw new Error('Not implemented - awaiting MoA protocol database');
  },
  
  async reportOutbreak(data) {
    // TODO: Implement notifiable disease reporting
    // Automatic reporting to authorities
    console.log('Reporting to MoA:', data);
    return true;
  }
};

/**
 * Example: IRLI Integration
 */
export const IRLIProvider: AuthorityDataProvider = {
  id: 'irli',
  name: 'International Livestock Research Institute',
  type: 'international',
  
  async fetchDiseaseDatabase() {
    // TODO: Integrate with IRLI knowledge base
    // https://www.ilri.org/research/animal-health
    throw new Error('Not implemented - awaiting IRLI API');
  },
  
  async fetchLocalizations() {
    // IRLI has extensive research on local disease names
    throw new Error('Not implemented');
  },
  
  async fetchTreatmentProtocols() {
    // Evidence-based treatments from research
    throw new Error('Not implemented');
  },
  
  async reportOutbreak(data) {
    // IRLI uses data for research and early warning systems
    console.log('Reporting to IRLI:', data);
    return true;
  }
};

// ============================================
// DATA SYNCHRONIZATION
// ============================================

/**
 * Synchronizes local database with authority sources
 * Should be run periodically (daily/weekly)
 */
export const syncWithAuthorities = async (
  providers: AuthorityDataProvider[]
): Promise<{
  success: boolean;
  updatedTerms: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let updatedTerms = 0;
  
  for (const provider of providers) {
    try {
      // Fetch updates
      const diseases = await provider.fetchDiseaseDatabase();
      const localizations = await provider.fetchLocalizations('am');
      
      // TODO: Merge with local database
      // TODO: Handle conflicts (authority wins)
      // TODO: Update offline cache
      
      console.log(`Synced with ${provider.name}`);
      updatedTerms += Object.keys(localizations).length;
      
    } catch (error) {
      errors.push(`${provider.name}: ${error}`);
    }
  }
  
  return {
    success: errors.length === 0,
    updatedTerms,
    errors
  };
};

// ============================================
// EXPORT
// ============================================

export default {
  SYMPTOM_DATABASE,
  MEDICINE_LOCALIZATIONS,
  DISEASE_LOCALIZATIONS,
  translateSymptom,
  normalizeSymptom,
  fuzzyMatchSymptom,
  MinistryOfAgricultureProvider,
  IRLIProvider,
  syncWithAuthorities
};

// TODO LIST FOR AUTHORITY COLLABORATION:
// 1. Contact IRLI - Get access to disease database API
// 2. Contact MoA - Get official veterinary terminology (Amharic)
// 3. Contact AGA - Get genetic disease susceptibility data
// 4. Regional vet colleges - Get localized symptom descriptions
// 5. Extension workers - Validate community terminology
// 6. Create feedback loop - Farmers report local terms we missed