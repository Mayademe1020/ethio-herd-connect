/**
 * @fileoverview Vaccine Configuration
 * Ethiopian livestock vaccination schedules
 */

export interface VaccineSchedule {
  id: string;
  name: string;
  intervalMonths: number;
  description?: string;
}

export type AnimalType = 'cattle' | 'goat' | 'sheep';

/**
 * Vaccination schedules by animal type
 * Based on Ethiopian Ministry of Agriculture guidelines
 */
export const VACCINE_SCHEDULES: Record<AnimalType, VaccineSchedule[]> = {
  cattle: [
    { 
      id: 'anthrax', 
      name: 'Anthrax', 
      intervalMonths: 6,
      description: 'Bacillus anthracis vaccine'
    },
    { 
      id: 'blackleg', 
      name: 'Blackleg', 
      intervalMonths: 6,
      description: 'Clostridium chauvoei vaccine'
    },
    { 
      id: 'fmd', 
      name: 'Foot-and-Mouth Disease', 
      intervalMonths: 6,
      description: 'FMD vaccine (serotypes O, A, SAT2)'
    },
    { 
      id: 'lsd', 
      name: 'Lumpy Skin Disease', 
      intervalMonths: 12,
      description: 'Lumpy skin disease vaccine'
    },
    { 
      id: 'brucellosis', 
      name: 'Brucellosis', 
      intervalMonths: 12,
      description: 'Brucella abortus vaccine'
    },
    { 
      id: 'cbpp', 
      name: 'CBPP', 
      intervalMonths: 12,
      description: 'Contagious Bovine Pleuropneumonia vaccine'
    },
    { 
      id: 'trypanosomiasis', 
      name: 'Trypanosomiasis', 
      intervalMonths: 6,
      description: 'Trypanosomiasis prophylaxis'
    }
  ],
  goat: [
    { 
      id: 'ppr', 
      name: 'PPR', 
      intervalMonths: 6,
      description: 'Peste des Petits Ruminants vaccine'
    },
    { 
      id: 'sheep-pox', 
      name: 'Sheep/Goat Pox', 
      intervalMonths: 12,
      description: 'Sheep and goat pox vaccine'
    },
    { 
      id: 'anthrax', 
      name: 'Anthrax', 
      intervalMonths: 6,
      description: 'Bacillus anthracis vaccine'
    },
    { 
      id: 'blackleg', 
      name: 'Blackleg', 
      intervalMonths: 6,
      description: 'Clostridium chauvoei vaccine'
    }
  ],
  sheep: [
    { 
      id: 'ppr', 
      name: 'PPR', 
      intervalMonths: 6,
      description: 'Peste des Petits Ruminants vaccine'
    },
    { 
      id: 'sheep-pox', 
      name: 'Sheep Pox', 
      intervalMonths: 12,
      description: 'Sheep pox vaccine'
    },
    { 
      id: 'anthrax', 
      name: 'Anthrax', 
      intervalMonths: 6,
      description: 'Bacillus anthracis vaccine'
    },
    { 
      id: 'blackleg', 
      name: 'Blackleg', 
      intervalMonths: 6,
      description: 'Clostridium chauvoei vaccine'
    },
    { 
      id: 'foot-rot', 
      name: 'Foot Rot', 
      intervalMonths: 6,
      description: 'Foot rot vaccine'
    }
  ]
};

/**
 * Gets vaccine schedules for an animal type
 * @param animalType - Type of animal
 * @returns {VaccineSchedule[]} Array of vaccine schedules
 */
export const getVaccineSchedules = (animalType: AnimalType): VaccineSchedule[] =>
  VACCINE_SCHEDULES[animalType] || [];

/**
 * Gets a specific vaccine schedule
 * @param vaccineName - Name of the vaccine
 * @returns {VaccineSchedule | undefined} The vaccine schedule or undefined
 */
export const findVaccineSchedule = (vaccineName: string): VaccineSchedule | undefined => {
  const allVaccines = Object.values(VACCINE_SCHEDULES).flat();
  return allVaccines.find(v => 
    v.name.toLowerCase() === vaccineName.toLowerCase()
  );
};

/**
 * Gets interval months for a vaccine
 * @param vaccineName - Name of the vaccine
 * @returns {number} Interval in months (default: 6)
 */
export const getVaccineInterval = (vaccineName: string): number => {
  const schedule = findVaccineSchedule(vaccineName);
  return schedule?.intervalMonths ?? 6;
};

/**
 * Formats vaccine label with interval
 * @param vaccine - Vaccine schedule
 * @returns {string} Formatted label
 * @example
 * formatVaccineLabel({ name: 'Anthrax', intervalMonths: 6 })
 * // Returns: "Anthrax (every 6 months)"
 */
export const formatVaccineLabel = (vaccine: VaccineSchedule): string => 
  `${vaccine.name} (every ${vaccine.intervalMonths} months)`;