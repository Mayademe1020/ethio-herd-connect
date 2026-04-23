// src/services/vaccinePresetService.ts
// Ethiopian livestock vaccination presets and vet directory

export interface VaccinePreset {
  id: string;
  name: string;
  intervalMonths: number;
}

export interface VetContact {
  name: string;
  phone: string;
  location: string;
}

// Ethiopian vaccine presets by animal type
export const VACCINE_PRESETS: Record<string, VaccinePreset[]> = {
  cattle: [
    { id: 'anthrax', name: 'Anthrax', intervalMonths: 6 },
    { id: 'blackleg', name: 'Blackleg', intervalMonths: 6 },
    { id: 'fmd', name: 'Foot-and-Mouth Disease', intervalMonths: 6 },
    { id: 'lsd', name: 'Lumpy Skin Disease', intervalMonths: 12 },
    { id: 'brucellosis', name: 'Brucellosis', intervalMonths: 12 },
    { id: 'cbpp', name: 'CBPP', intervalMonths: 12 },
    { id: 'trypanosomiasis', name: 'Trypanosomiasis', intervalMonths: 6 },
  ],
  goat: [
    { id: 'ppr', name: 'PPR', intervalMonths: 6 },
    { id: 'sheep_pox', name: 'Sheep/Goat Pox', intervalMonths: 12 },
    { id: 'anthrax', name: 'Anthrax', intervalMonths: 6 },
    { id: 'blackleg', name: 'Blackleg', intervalMonths: 6 },
  ],
  sheep: [
    { id: 'ppr', name: 'PPR', intervalMonths: 6 },
    { id: 'sheep_pox', name: 'Sheep Pox', intervalMonths: 12 },
    { id: 'anthrax', name: 'Anthrax', intervalMonths: 6 },
    { id: 'blackleg', name: 'Blackleg', intervalMonths: 6 },
    { id: 'foot_rot', name: 'Foot Rot', intervalMonths: 6 },
  ]
};

// Ethiopian vets directory (static for MVP)
export const VET_LIST: VetContact[] = [
  { name: 'Dr. Abebe Kebede', phone: '0912345678', location: 'Addis Ababa' },
  { name: 'Dr. Sarah Mohammed', phone: '0923456789', location: 'Adama' },
  { name: 'Dr. Yonas Tadesse', phone: '0934567890', location: 'Hawassa' },
  { name: 'Dr. Fatuma Ali', phone: '0945678901', location: 'Bahir Dar' },
  { name: 'Dr. Desta Bekele', phone: '0956789012', location: 'Dire Dawa' },
];

/**
 * Get vaccine presets for an animal type
 */
export function getVaccinePresets(animalType: string): VaccinePreset[] {
  const type = animalType.toLowerCase();
  return VACCINE_PRESETS[type] || [];
}

/**
 * Calculate next due date based on vaccine name
 */
export function calculateNextDueDate(vaccineName: string, administeredDate: string): string {
  const date = new Date(administeredDate);
  
  // Search all animal types for matching vaccine
  for (const type of Object.keys(VACCINE_PRESETS)) {
    const preset = VACCINE_PRESETS[type].find(v => 
      v.name.toLowerCase() === vaccineName.toLowerCase()
    );
    if (preset) {
      date.setMonth(date.getMonth() + preset.intervalMonths);
      return date.toISOString().split('T')[0];
    }
  }
  
  // Default: 6 months if not found
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().split('T')[0];
}

/**
 * Get a random vet from the list
 * In future, this could be location-based
 */
export function getRandomVet(): VetContact {
  return VET_LIST[Math.floor(Math.random() * VET_LIST.length)];
}

/**
 * Format vaccine name with interval
 */
export function formatVaccineLabel(preset: VaccinePreset): string {
  return `${preset.name} (every ${preset.intervalMonths} months)`;
}

export default {
  getVaccinePresets,
  calculateNextDueDate,
  getRandomVet,
  formatVaccineLabel,
  VET_LIST
};
