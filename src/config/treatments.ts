/**
 * @fileoverview Treatment Database Configuration
 * Comprehensive treatment protocols for Ethiopian livestock diseases
 * Based on Ministry of Agriculture guidelines and veterinary best practices
 */

export type AnimalType = 'cattle' | 'goat' | 'sheep' | 'camel' | 'poultry';
export type Severity = 'mild' | 'moderate' | 'severe' | 'emergency';
export type TreatmentType = 'medication' | 'vaccination' | 'management' | 'surgical' | 'preventive';

export interface Medicine {
  name: string;
  genericName?: string;
  dosagePerKg: number; // ml or mg per kg body weight
  dosageUnit: 'ml' | 'mg' | 'g';
  frequency: string; // e.g., "once daily", "twice daily", "single dose"
  duration: string; // e.g., "5 days", "single dose"
  route: 'oral' | 'injectable_im' | 'injectable_iv' | 'injectable_sc' | 'topical';
  withdrawalPeriod?: number; // days before meat/milk can be consumed
  approximateCost?: number; // ETB
  availability: 'common' | 'moderate' | 'rare';
  notes?: string;
}

export interface TreatmentStep {
  step: number;
  action: string;
  details?: string;
  priority: 'critical' | 'important' | 'optional';
}

export interface Disease {
  id: string;
  name: string;
  scientificName?: string;
  localNames?: string[]; // Local language names
  animalTypes: AnimalType[];
  severity: Severity;
  transmission: string;
  incubationPeriod?: string;
  symptoms: string[];
  differentialDiagnosis?: string[]; // Other diseases with similar symptoms
  diagnosis?: string;
  treatments: {
    type: TreatmentType;
    description: string;
    medicines: Medicine[];
    steps: TreatmentStep[];
    expectedOutcome: string;
    followUp?: string;
  }[];
  prevention: string[];
  prognosis: {
    withTreatment: string;
    withoutTreatment: string;
  };
  zoonotic: boolean; // Can infect humans
  notifiable: boolean; // Must report to government
  notes?: string;
}

// Comprehensive disease database
export const DISEASE_DATABASE: Record<string, Disease> = {
  'lumpy-skin-disease': {
    id: 'lumpy-skin-disease',
    name: 'Lumpy Skin Disease (LSD)',
    scientificName: 'Lumpy Skin Disease Virus',
    localNames: ['Gendi', 'Lumpy Skin'],
    animalTypes: ['cattle'],
    severity: 'moderate',
    transmission: 'Spread by biting insects (flies, mosquitoes), direct contact, contaminated equipment',
    incubationPeriod: '2-4 weeks',
    symptoms: [
      'Firm, round skin nodules (2-5 cm diameter)',
      'Fever (40-41°C)',
      'Loss of appetite',
      'Decreased milk production',
      'Lameness if joints affected',
      'Eye and nose discharge',
      'Difficulty breathing if respiratory tract involved'
    ],
    differentialDiagnosis: ['Pseudo-lumpy skin disease', 'Bovine herpes mammillitis', 'Insect bites'],
    diagnosis: 'Clinical signs (characteristic nodules), confirmed by laboratory testing',
    treatments: [
      {
        type: 'medication',
        description: 'Supportive care and antibiotics to prevent secondary infections',
        medicines: [
          {
            name: 'Oxytetracycline',
            genericName: 'Oxytetracycline LA',
            dosagePerKg: 20,
            dosageUnit: 'mg',
            frequency: 'once daily',
            duration: '5-7 days',
            route: 'injectable_im',
            withdrawalPeriod: 21,
            approximateCost: 150,
            availability: 'common',
            notes: 'Long-acting formulation preferred'
          },
          {
            name: 'Anti-inflammatory',
            genericName: 'Flunixin Meglumine',
            dosagePerKg: 2.2,
            dosageUnit: 'mg',
            frequency: 'once daily',
            duration: '3 days',
            route: 'injectable_iv',
            withdrawalPeriod: 4,
            approximateCost: 200,
            availability: 'common',
            notes: 'For fever and pain relief'
          }
        ],
        steps: [
          { step: 1, action: 'Isolate infected animal', priority: 'critical', details: 'Keep away from healthy animals to prevent spread' },
          { step: 2, action: 'Administer antibiotics', priority: 'critical', details: 'Oxytetracycline 20mg/kg IM daily for 5-7 days' },
          { step: 3, action: 'Provide supportive care', priority: 'important', details: 'Ensure access to clean water and palatable feed' },
          { step: 4, action: 'Treat skin lesions', priority: 'important', details: 'Apply antiseptic to open lesions to prevent fly strike' },
          { step: 5, action: 'Control vectors', priority: 'important', details: 'Use insecticides to reduce fly and mosquito populations' }
        ],
        expectedOutcome: 'Most animals recover in 2-4 weeks with supportive care. Mortality is usually low (1-5%).',
        followUp: 'Monitor for secondary infections. Retreatment may be needed if condition worsens.'
      }
    ],
    prevention: [
      'Vaccination: Annual LSD vaccine (Neethling strain)',
      'Insect control: Regular spraying with insecticides',
      'Quarantine: Isolate new animals for 30 days',
      'Equipment sanitation: Disinfect shared tools',
      'Buy vaccinated animals only'
    ],
    prognosis: {
      withTreatment: 'Good. Most animals recover fully within 2-4 weeks.',
      withoutTreatment: 'Fair. May develop secondary infections. Permanent skin damage possible.'
    },
    zoonotic: false,
    notifiable: true,
    notes: 'Report to veterinary authorities. Vaccination is the most effective prevention.'
  },

  'foot-and-mouth-disease': {
    id: 'foot-and-mouth-disease',
    name: 'Foot and Mouth Disease (FMD)',
    scientificName: 'Foot-and-Mouth Disease Virus',
    localNames: ['FMD', 'Hoof and Mouth'],
    animalTypes: ['cattle', 'goat', 'sheep'],
    severity: 'severe',
    transmission: 'Highly contagious via direct contact, contaminated feed/water, airborne (short distances), fomites',
    incubationPeriod: '2-14 days',
    symptoms: [
      'High fever (40-41°C)',
      'Blisters/vesicles on mouth, tongue, teats, and feet',
      'Excessive drooling/foaming at mouth',
      'Lameness, reluctance to move',
      'Decreased appetite and milk production',
      'Weight loss',
      'Abortions in pregnant animals'
    ],
    differentialDiagnosis: ['Vesicular stomatitis', 'Bovine viral diarrhea', 'Bluetongue'],
    diagnosis: 'Clinical signs + laboratory confirmation required (reportable disease)',
    treatments: [
      {
        type: 'management',
        description: 'No specific treatment - supportive care only. Disease must run its course.',
        medicines: [
          {
            name: 'Anti-inflammatory',
            genericName: 'Flunixin Meglumine',
            dosagePerKg: 2.2,
            dosageUnit: 'mg',
            frequency: 'once daily',
            duration: '3 days',
            route: 'injectable_iv',
            withdrawalPeriod: 4,
            approximateCost: 200,
            availability: 'common',
            notes: 'For fever and pain relief only'
          },
          {
            name: 'Wound spray',
            genericName: 'Antiseptic spray',
            dosagePerKg: 0,
            dosageUnit: 'ml',
            frequency: 'twice daily',
            duration: 'Until healed',
            route: 'topical',
            approximateCost: 100,
            availability: 'common',
            notes: 'Apply to foot lesions'
          }
        ],
        steps: [
          { step: 1, action: 'IMMEDIATELY ISOLATE and REPORT', priority: 'critical', details: 'This is a notifiable disease. Contact vet immediately.' },
          { step: 2, action: 'Provide soft, palatable feed', priority: 'critical', details: 'Animals cannot eat hard feed due to mouth pain. Offer mash, grass, green fodder.' },
          { step: 3, action: 'Ensure water access', priority: 'critical', details: 'Use wide, shallow troughs. Add electrolytes if available.' },
          { step: 4, action: 'Treat foot lesions', priority: 'important', details: 'Apply antiseptic spray. Keep feet dry and clean.' },
          { step: 5, action: 'Pain management', priority: 'important', details: 'Anti-inflammatory for fever and pain' },
          { step: 6, action: 'RESTRICT MOVEMENT', priority: 'critical', details: 'Do not move animal or its products. Quarantine entire farm.' }
        ],
        expectedOutcome: 'Recovery in 2-3 weeks for adult animals. High mortality in young animals.',
        followUp: 'Complete recovery may take 6 months. Check for secondary infections.'
      }
    ],
    prevention: [
      'Vaccination: Every 4-6 months with trivalent vaccine (O, A, SAT2)',
      'Quarantine: 30-day isolation for new animals',
      'Movement control: Restrict animal and vehicle movement',
      'Disinfection: Foot baths, equipment cleaning',
      'Buy from disease-free areas only'
    ],
    prognosis: {
      withTreatment: 'Adults: Good. Young: Guarded.',
      withoutTreatment: 'Poor for young animals. Adults may have permanent production loss.'
    },
    zoonotic: false,
    notifiable: true,
    notes: 'EMERGENCY: Report immediately to veterinary authorities. This is a major trade barrier disease.'
  },

  'mastitis': {
    id: 'mastitis',
    name: 'Mastitis',
    scientificName: 'Mammary Gland Inflammation',
    localNames: ['Mastitis', 'Teat infection'],
    animalTypes: ['cattle', 'goat', 'sheep', 'camel'],
    severity: 'moderate',
    transmission: 'Bacterial infection via teat canal, poor milking hygiene, contaminated equipment',
    symptoms: [
      'Swollen, hot, painful udder',
      'Abnormal milk (clots, flakes, watery, blood)',
      'Decreased milk production',
      'Fever in severe cases',
      'Animal reluctant to be milked',
      'Hard lumps in udder (chronic cases)'
    ],
    differentialDiagnosis: ['Udder edema', 'Trauma', 'Teat obstruction'],
    diagnosis: 'Clinical signs + California Mastitis Test (CMT) + milk culture',
    treatments: [
      {
        type: 'medication',
        description: 'Antibiotic therapy based on severity and bacterial culture',
        medicines: [
          {
            name: 'Intramammary antibiotic',
            genericName: 'Cloxacillin',
            dosagePerKg: 0,
            dosageUnit: 'ml',
            frequency: 'twice daily',
            duration: '3-5 days',
            route: 'topical',
            withdrawalPeriod: 4,
            approximateCost: 180,
            availability: 'common',
            notes: 'Infuse into teat canal after milking'
          },
          {
            name: 'Systemic antibiotic',
            genericName: 'Amoxicillin + Clavulanic acid',
            dosagePerKg: 10,
            dosageUnit: 'mg',
            frequency: 'once daily',
            duration: '3-5 days',
            route: 'injectable_im',
            withdrawalPeriod: 30,
            approximateCost: 250,
            availability: 'common',
            notes: 'For severe/systemic cases'
          }
        ],
        steps: [
          { step: 1, action: 'Strip out milk', priority: 'critical', details: 'Completely empty affected quarter 3-4 times daily' },
          { step: 2, action: 'Apply intramammary antibiotic', priority: 'critical', details: 'After milking, infuse antibiotic into teat. Massage udder.' },
          { step: 3, action: 'Improve milking hygiene', priority: 'critical', details: 'Clean teats thoroughly, use single-use towels, post-milking teat dip' },
          { step: 4, action: 'Systemic antibiotics if severe', priority: 'important', details: 'For fever or systemic illness' },
          { step: 5, action: 'Withhold milk', priority: 'critical', details: 'Do not consume milk during treatment + withdrawal period' },
          { step: 6, action: 'Supportive care', priority: 'important', details: 'Apply warm compresses 3-4 times daily to reduce swelling' }
        ],
        expectedOutcome: 'Clinical cure in 3-5 days. Milk returns to normal in 1-2 weeks.',
        followUp: 'Recheck CMT after 7 days. Chronic cases may need culling.'
      }
    ],
    prevention: [
      'Milking hygiene: Clean, dry teats before milking',
      'Teat dipping: Apply disinfectant after every milking',
      'Dry cow therapy: Antibiotics at dry-off period',
      'Proper milking machine maintenance: Check vacuum levels',
      'Culling: Remove chronically infected animals',
      'Clean housing: Dry, clean bedding'
    ],
    prognosis: {
      withTreatment: 'Good for clinical cases. 80-90% cure rate.',
      withoutTreatment: 'Poor. Becomes chronic, permanent damage, may need culling.'
    },
    zoonotic: false,
    notifiable: false,
    notes: 'Most common and costly disease in dairy herds. Prevention through hygiene is key.'
  }
};

// Disease categories for browsing
export const DISEASE_CATEGORIES = [
  {
    id: 'infectious',
    name: 'Infectious Diseases',
    description: 'Viral and bacterial infections',
    diseases: ['lumpy-skin-disease', 'foot-and-mouth-disease', 'ppr', 'blackleg', 'anthrax']
  },
  {
    id: 'metabolic',
    name: 'Metabolic Diseases',
    description: 'Nutritional and metabolic disorders',
    diseases: ['milk-fever', 'ketosis', 'bloat', 'grass-tetany']
  },
  {
    id: 'reproductive',
    name: 'Reproductive Disorders',
    description: 'Breeding and reproductive issues',
    diseases: ['retained-placenta', 'metritis', 'mastitis']
  },
  {
    id: 'parasitic',
    name: 'Parasitic Diseases',
    description: 'Internal and external parasites',
    diseases: ['trypanosomiasis', 'ticks', 'worms', 'mange']
  }
];

// Quick symptom matcher
export interface SymptomMatch {
  symptom: string;
  diseases: string[]; // disease IDs
}

export const SYMPTOM_DISEASE_MAP: SymptomMatch[] = [
  { symptom: 'skin nodules', diseases: ['lumpy-skin-disease'] },
  { symptom: 'fever', diseases: ['lumpy-skin-disease', 'foot-and-mouth-disease', 'trypanosomiasis', 'blackleg', 'anthrax'] },
  { symptom: 'lameness', diseases: ['foot-and-mouth-disease', 'lumpy-skin-disease', 'foot-rot'] },
  { symptom: 'decreased milk', diseases: ['mastitis', 'foot-and-mouth-disease', 'lumpy-skin-disease', 'ketosis'] },
  { symptom: 'swollen udder', diseases: ['mastitis', 'udder-edema'] },
  { symptom: 'abnormal milk', diseases: ['mastitis'] },
  { symptom: 'mouth ulcers', diseases: ['foot-and-mouth-disease'] },
  { symptom: 'sudden death', diseases: ['anthrax', 'blackleg', 'lightning-strike'] },
  { symptom: 'difficulty breathing', diseases: ['pneumonia', 'cbpp', 'lumpy-skin-disease'] },
  { symptom: 'diarrhea', diseases: ['coccidiosis', 'enteritis', 'rinderpest'] }
];

// Helper functions
export const findDiseaseById = (id: string): Disease | undefined => 
  DISEASE_DATABASE[id];

export const findDiseasesByAnimal = (animalType: AnimalType): Disease[] =>
  Object.values(DISEASE_DATABASE).filter(d => d.animalTypes.includes(animalType));

export const findDiseasesBySymptom = (symptom: string): Disease[] => {
  const matches = SYMPTOM_DISEASE_MAP.find(s => 
    s.symptom.toLowerCase().includes(symptom.toLowerCase()) ||
    symptom.toLowerCase().includes(s.symptom.toLowerCase())
  );
  
  if (!matches) return [];
  
  return matches.diseases
    .map(id => DISEASE_DATABASE[id])
    .filter(Boolean) as Disease[];
};

export const getAllSymptoms = (): string[] =>
  [...new Set(SYMPTOM_DISEASE_MAP.map(s => s.symptom))];

export default {
  DISEASE_DATABASE,
  DISEASE_CATEGORIES,
  SYMPTOM_DISEASE_MAP,
  findDiseaseById,
  findDiseasesByAnimal,
  findDiseasesBySymptom,
  getAllSymptoms
};