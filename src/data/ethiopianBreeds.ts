/**
 * Ethiopian Livestock Breed Database
 * 
 * Comprehensive database of Ethiopian livestock breeds organized by animal type.
 * Includes breed names in English and Amharic, descriptions, and characteristics.
 */

import { Language } from '@/types';

export type AnimalType = 'cattle' | 'sheep' | 'goat' | 'poultry' | 'camel' | 'donkey' | 'horse';

export interface BreedInfo {
  id: string;
  name: {
    en: string;
    am: string;
  };
  animalType: AnimalType;
  description?: {
    en: string;
    am: string;
  };
  characteristics?: {
    size?: string;
    color?: string[];
    distinguishingFeatures?: string;
  };
}

export interface BreedRegistry {
  [animalType: string]: BreedInfo[];
}

/**
 * Comprehensive Ethiopian breed database
 * Organized by animal type with bilingual support
 */
export const ETHIOPIAN_BREEDS: BreedRegistry = {
  cattle: [
    {
      id: 'cattle-boran',
      name: { en: 'Boran', am: 'ቦራን' },
      animalType: 'cattle',
      description: {
        en: 'Hardy breed from southern Ethiopia, well-adapted to harsh conditions',
        am: 'ከደቡብ ኢትዮጵያ የመጣ ጠንካራ ዝርያ፣ ለከባድ ሁኔታዎች በደንብ የተላመደ'
      },
      characteristics: {
        size: 'Large',
        color: ['White', 'Grey', 'Light Brown'],
        distinguishingFeatures: 'Large cervico-thoracic hump, long horns'
      }
    },
    {
      id: 'cattle-horro',
      name: { en: 'Horro', am: 'ሆሮ' },
      animalType: 'cattle',
      description: {
        en: 'Dual-purpose breed from western Ethiopia, good for milk and meat',
        am: 'ከምዕራብ ኢትዮጵያ የመጣ ሁለት ዓላማ ያለው ዝርያ፣ ለወተት እና ለስጋ ጥሩ'
      },
      characteristics: {
        size: 'Medium to Large',
        color: ['Red', 'Brown', 'Black'],
        distinguishingFeatures: 'Short horns, compact body'
      }
    },
    {
      id: 'cattle-fogera',
      name: { en: 'Fogera', am: 'ፎገራ' },
      animalType: 'cattle',
      description: {
        en: 'Breed from Lake Tana region, adapted to wetland conditions',
        am: 'ከጣና ሐይቅ አካባቢ የመጣ ዝርያ፣ ለረግረጋማ አካባቢ የተላመደ'
      },
      characteristics: {
        size: 'Large',
        color: ['Grey', 'White'],
        distinguishingFeatures: 'Large body, well-developed hump'
      }
    },
    {
      id: 'cattle-arsi',
      name: { en: 'Arsi', am: 'አርሲ' },
      animalType: 'cattle',
      description: {
        en: 'Highland breed from Arsi zone, good draught animal',
        am: 'ከአርሲ ዞን የመጣ የከፍታ ዝርያ፣ ጥሩ የጉልበት እንስሳ'
      },
      characteristics: {
        size: 'Medium',
        color: ['Red', 'Brown', 'Black'],
        distinguishingFeatures: 'Medium-sized horns, muscular build'
      }
    },
    {
      id: 'cattle-danakil',
      name: { en: 'Danakil', am: 'ዳናኪል' },
      animalType: 'cattle',
      description: {
        en: 'Desert-adapted breed from Afar region',
        am: 'ከአፋር ክልል የመጣ ለበረሃ የተላመደ ዝርያ'
      },
      characteristics: {
        size: 'Small to Medium',
        color: ['White', 'Grey', 'Brown'],
        distinguishingFeatures: 'Heat tolerant, small hump'
      }
    },
    {
      id: 'cattle-begait',
      name: { en: 'Begait', am: 'በጋይት' },
      animalType: 'cattle',
      description: {
        en: 'Breed from northern Ethiopia, good for draught',
        am: 'ከሰሜን ኢትዮጵያ የመጣ ዝርያ፣ ለጉልበት ጥሩ'
      },
      characteristics: {
        size: 'Medium',
        color: ['Red', 'Brown'],
        distinguishingFeatures: 'Lyre-shaped horns'
      }
    },
    {
      id: 'cattle-sheko',
      name: { en: 'Sheko', am: 'ሸኮ' },
      animalType: 'cattle',
      description: {
        en: 'Trypanotolerant breed from southwestern Ethiopia',
        am: 'ከደቡብ ምዕራብ ኢትዮጵያ የመጣ ለትሪፓኖሶማ የሚቋቋም ዝርያ'
      },
      characteristics: {
        size: 'Medium',
        color: ['Black', 'Brown', 'Red'],
        distinguishingFeatures: 'Disease resistant, adapted to tsetse areas'
      }
    },
    {
      id: 'cattle-gurage',
      name: { en: 'Gurage', am: 'ጉራጌ' },
      animalType: 'cattle',
      description: {
        en: 'Small breed from Gurage zone',
        am: 'ከጉራጌ ዞን የመጣ ትንሽ ዝርያ'
      },
      characteristics: {
        size: 'Small',
        color: ['Black', 'Brown'],
        distinguishingFeatures: 'Compact size, hardy'
      }
    }
  ],
  sheep: [
    {
      id: 'sheep-menz',
      name: { en: 'Menz', am: 'መንዝ' },
      animalType: 'sheep',
      description: {
        en: 'Highland sheep from Menz area, known for quality wool',
        am: 'ከመንዝ አካባቢ የመጣ የከፍታ በግ፣ በጥራት ሱፍ የሚታወቅ'
      },
      characteristics: {
        size: 'Medium',
        color: ['White', 'Brown', 'Black'],
        distinguishingFeatures: 'Long wool, fat tail'
      }
    },
    {
      id: 'sheep-horro',
      name: { en: 'Horro', am: 'ሆሮ' },
      animalType: 'sheep',
      description: {
        en: 'Meat-type sheep from western Ethiopia',
        am: 'ከምዕራብ ኢትዮጵያ የመጣ የስጋ አይነት በግ'
      },
      characteristics: {
        size: 'Large',
        color: ['White', 'Brown'],
        distinguishingFeatures: 'Fat-rumped, polled'
      }
    },
    {
      id: 'sheep-bonga',
      name: { en: 'Bonga', am: 'ቦንጋ' },
      animalType: 'sheep',
      description: {
        en: 'Sheep from southwestern highlands',
        am: 'ከደቡብ ምዕራብ ከፍታ ያለው አካባቢ የመጣ በግ'
      },
      characteristics: {
        size: 'Medium',
        color: ['Brown', 'Black', 'White'],
        distinguishingFeatures: 'Adapted to humid conditions'
      }
    },
    {
      id: 'sheep-arsi-bale',
      name: { en: 'Arsi-Bale', am: 'አርሲ-ባሌ' },
      animalType: 'sheep',
      description: {
        en: 'Highland sheep from Arsi and Bale zones',
        am: 'ከአርሲ እና ባሌ ዞኖች የመጣ የከፍታ በግ'
      },
      characteristics: {
        size: 'Medium to Large',
        color: ['White', 'Brown', 'Black'],
        distinguishingFeatures: 'Fat-tailed, good meat quality'
      }
    },
    {
      id: 'sheep-blackhead-somali',
      name: { en: 'Blackhead Somali', am: 'ጥቁር ራስ ሶማሊ' },
      animalType: 'sheep',
      description: {
        en: 'Desert-adapted sheep from eastern Ethiopia',
        am: 'ከምስራቅ ኢትዮጵያ የመጣ ለበረሃ የተላመደ በግ'
      },
      characteristics: {
        size: 'Medium',
        color: ['White body with black head'],
        distinguishingFeatures: 'Black head, fat-tailed, heat tolerant'
      }
    },
    {
      id: 'sheep-afar',
      name: { en: 'Afar', am: 'አፋር' },
      animalType: 'sheep',
      description: {
        en: 'Lowland sheep from Afar region',
        am: 'ከአፋር ክልል የመጣ የቆላ በግ'
      },
      characteristics: {
        size: 'Small to Medium',
        color: ['White', 'Brown', 'Black'],
        distinguishingFeatures: 'Heat tolerant, fat-tailed'
      }
    },
    {
      id: 'sheep-washera',
      name: { en: 'Washera', am: 'ዋሸራ' },
      animalType: 'sheep',
      description: {
        en: 'Sheep from Amhara region, good for meat',
        am: 'ከአማራ ክልል የመጣ በግ፣ ለስጋ ጥሩ'
      },
      characteristics: {
        size: 'Large',
        color: ['Brown', 'White'],
        distinguishingFeatures: 'Fat-rumped, large body'
      }
    }
  ],
  goat: [
    {
      id: 'goat-woyto-guji',
      name: { en: 'Woyto-Guji', am: 'ወይቶ-ጉጂ' },
      animalType: 'goat',
      description: {
        en: 'Meat-type goat from southern Ethiopia',
        am: 'ከደቡብ ኢትዮጵያ የመጣ የስጋ አይነት ፍየል'
      },
      characteristics: {
        size: 'Large',
        color: ['White', 'Brown', 'Black'],
        distinguishingFeatures: 'Large body, good meat production'
      }
    },
    {
      id: 'goat-afar',
      name: { en: 'Afar', am: 'አፋር' },
      animalType: 'goat',
      description: {
        en: 'Desert-adapted goat from Afar region',
        am: 'ከአፋር ክልል የመጣ ለበረሃ የተላመደ ፍየል'
      },
      characteristics: {
        size: 'Medium',
        color: ['Brown', 'Black', 'White'],
        distinguishingFeatures: 'Heat tolerant, long ears'
      }
    },
    {
      id: 'goat-abergelle',
      name: { en: 'Abergelle', am: 'አበርገሌ' },
      animalType: 'goat',
      description: {
        en: 'Goat from northern Ethiopia, good for meat',
        am: 'ከሰሜን ኢትዮጵያ የመጣ ፍየል፣ ለስጋ ጥሩ'
      },
      characteristics: {
        size: 'Medium to Large',
        color: ['Brown', 'Black', 'White'],
        distinguishingFeatures: 'Long ears, good growth rate'
      }
    },
    {
      id: 'goat-keffa',
      name: { en: 'Keffa', am: 'ከፋ' },
      animalType: 'goat',
      description: {
        en: 'Goat from southwestern Ethiopia',
        am: 'ከደቡብ ምዕራብ ኢትዮጵያ የመጣ ፍየል'
      },
      characteristics: {
        size: 'Medium',
        color: ['Black', 'Brown'],
        distinguishingFeatures: 'Adapted to humid conditions'
      }
    },
    {
      id: 'goat-long-eared-somali',
      name: { en: 'Long-eared Somali', am: 'ረጅም ጆሮ ሶማሊ' },
      animalType: 'goat',
      description: {
        en: 'Distinctive goat from eastern Ethiopia with long ears',
        am: 'ከምስራቅ ኢትዮጵያ የመጣ ረጅም ጆሮ ያለው ልዩ ፍየል'
      },
      characteristics: {
        size: 'Medium',
        color: ['White', 'Brown', 'Black'],
        distinguishingFeatures: 'Very long pendulous ears'
      }
    },
    {
      id: 'goat-central-highland',
      name: { en: 'Central Highland', am: 'ማዕከላዊ ከፍታ' },
      animalType: 'goat',
      description: {
        en: 'Goat from central Ethiopian highlands',
        am: 'ከማዕከላዊ ኢትዮጵያ ከፍታ ያለው አካባቢ የመጣ ፍየል'
      },
      characteristics: {
        size: 'Small to Medium',
        color: ['Brown', 'Black', 'White'],
        distinguishingFeatures: 'Hardy, adapted to highlands'
      }
    },
    {
      id: 'goat-hararghe-highland',
      name: { en: 'Hararghe Highland', am: 'ሐረርጌ ከፍታ' },
      animalType: 'goat',
      description: {
        en: 'Goat from Hararghe highlands',
        am: 'ከሐረርጌ ከፍታ ያለው አካባቢ የመጣ ፍየል'
      },
      characteristics: {
        size: 'Medium',
        color: ['Brown', 'Black'],
        distinguishingFeatures: 'Good milk production'
      }
    }
  ],
  poultry: [
    {
      id: 'poultry-local-indigenous',
      name: { en: 'Local/Indigenous', am: 'የአገር ውስጥ' },
      animalType: 'poultry',
      description: {
        en: 'Traditional Ethiopian chicken varieties',
        am: 'ባህላዊ የኢትዮጵያ ዶሮ ዝርያዎች'
      },
      characteristics: {
        size: 'Small to Medium',
        color: ['Various colors'],
        distinguishingFeatures: 'Hardy, disease resistant, adapted to local conditions'
      }
    },
    {
      id: 'poultry-horro',
      name: { en: 'Horro', am: 'ሆሮ' },
      animalType: 'poultry',
      description: {
        en: 'Indigenous chicken from western Ethiopia',
        am: 'ከምዕራብ ኢትዮጵያ የመጣ የአገር ውስጥ ዶሮ'
      },
      characteristics: {
        size: 'Medium',
        color: ['Red', 'Brown', 'Black'],
        distinguishingFeatures: 'Good egg production'
      }
    },
    {
      id: 'poultry-rhode-island-red',
      name: { en: 'Rhode Island Red', am: 'ሮድ አይላንድ ቀይ' },
      animalType: 'poultry',
      description: {
        en: 'Popular dual-purpose breed, well-adapted to Ethiopia',
        am: 'ታዋቂ ሁለት ዓላማ ያለው ዝርያ፣ ለኢትዮጵያ በደንብ የተላመደ'
      },
      characteristics: {
        size: 'Large',
        color: ['Red-brown'],
        distinguishingFeatures: 'Good for both eggs and meat'
      }
    },
    {
      id: 'poultry-leghorn',
      name: { en: 'Leghorn', am: 'ሌግሆርን' },
      animalType: 'poultry',
      description: {
        en: 'Excellent egg-laying breed',
        am: 'በጣም ጥሩ እንቁላል የሚጥል ዝርያ'
      },
      characteristics: {
        size: 'Medium',
        color: ['White', 'Brown'],
        distinguishingFeatures: 'High egg production'
      }
    },
    {
      id: 'poultry-fayoumi',
      name: { en: 'Fayoumi', am: 'ፋዩሚ' },
      animalType: 'poultry',
      description: {
        en: 'Heat-tolerant breed suitable for Ethiopian climate',
        am: 'ለሙቀት የሚቋቋም ለኢትዮጵያ የአየር ንብረት ተስማሚ ዝርያ'
      },
      characteristics: {
        size: 'Small to Medium',
        color: ['Silver-white with black barring'],
        distinguishingFeatures: 'Disease resistant, heat tolerant'
      }
    },
    {
      id: 'poultry-sasso',
      name: { en: 'Sasso', am: 'ሳሶ' },
      animalType: 'poultry',
      description: {
        en: 'Dual-purpose breed popular in Ethiopia',
        am: 'በኢትዮጵያ ታዋቂ ሁለት ዓላማ ያለው ዝርያ'
      },
      characteristics: {
        size: 'Large',
        color: ['Various colors'],
        distinguishingFeatures: 'Fast growth, good meat quality'
      }
    }
  ],
  camel: [
    {
      id: 'camel-somali',
      name: { en: 'Somali', am: 'ሶማሊ' },
      animalType: 'camel',
      description: {
        en: 'One-humped camel from eastern Ethiopia',
        am: 'ከምስራቅ ኢትዮጵያ የመጣ አንድ ጉብ ያለው ግመል'
      },
      characteristics: {
        size: 'Large',
        color: ['Brown', 'Tan'],
        distinguishingFeatures: 'Single hump, good milk production'
      }
    },
    {
      id: 'camel-afar',
      name: { en: 'Afar', am: 'አፋር' },
      animalType: 'camel',
      description: {
        en: 'Camel from Afar region, adapted to harsh desert conditions',
        am: 'ከአፋር ክልል የመጣ ግመል፣ ለከባድ የበረሃ ሁኔታዎች የተላመደ'
      },
      characteristics: {
        size: 'Large',
        color: ['Brown', 'Grey'],
        distinguishingFeatures: 'Heat and drought tolerant'
      }
    }
  ],
  donkey: [
    {
      id: 'donkey-abyssinian',
      name: { en: 'Abyssinian', am: 'አቢሲኒያን' },
      animalType: 'donkey',
      description: {
        en: 'Common Ethiopian donkey breed',
        am: 'የተለመደ የኢትዮጵያ አህያ ዝርያ'
      },
      characteristics: {
        size: 'Small to Medium',
        color: ['Grey', 'Brown'],
        distinguishingFeatures: 'Hardy, good pack animal'
      }
    },
    {
      id: 'donkey-sinnar',
      name: { en: 'Sinnar', am: 'ሲናር' },
      animalType: 'donkey',
      description: {
        en: 'Larger donkey breed from western regions',
        am: 'ከምዕራብ ክልሎች የመጣ ትልቅ አህያ ዝርያ'
      },
      characteristics: {
        size: 'Medium to Large',
        color: ['Grey', 'Brown'],
        distinguishingFeatures: 'Strong, good for heavy loads'
      }
    }
  ],
  horse: [
    {
      id: 'horse-abyssinian',
      name: { en: 'Abyssinian', am: 'አቢሲኒያን' },
      animalType: 'horse',
      description: {
        en: 'Traditional Ethiopian horse breed',
        am: 'ባህላዊ የኢትዮጵያ ፈረስ ዝርያ'
      },
      characteristics: {
        size: 'Medium',
        color: ['Bay', 'Brown', 'Grey'],
        distinguishingFeatures: 'Hardy, adapted to highlands'
      }
    }
  ]
};

/**
 * Get the "Other/Unknown" breed option for any animal type
 */
export const OTHER_BREED_OPTION: BreedInfo = {
  id: 'other-unknown',
  name: { en: 'Other/Unknown', am: 'ሌላ/ያልታወቀ' },
  animalType: 'cattle', // Will be overridden based on context
  description: {
    en: 'Select this if you don\'t know the exact breed or if your breed is not listed',
    am: 'ትክክለኛውን ዝርያ ካላወቁ ወይም ዝርያዎ ካልተዘረዘረ ይህንን ይምረጡ'
  }
};

/**
 * Map animal types from the registration form to breed database types
 */
export const ANIMAL_TYPE_MAPPING: Record<string, AnimalType> = {
  'cow': 'cattle',
  'bull': 'cattle',
  'ox': 'cattle',
  'calf': 'cattle',
  'sheep': 'sheep',
  'goat': 'goat',
  'poultry': 'poultry',
  'camel': 'camel',
  'donkey': 'donkey',
  'horse': 'horse'
};

/**
 * Get the breed type from a form animal type
 */
export function getBreedType(formAnimalType: string): AnimalType | null {
  return ANIMAL_TYPE_MAPPING[formAnimalType.toLowerCase()] || null;
}

/**
 * Get all breeds for a specific animal type
 */
export function getBreedsByType(animalType: AnimalType): BreedInfo[] {
  return ETHIOPIAN_BREEDS[animalType] || [];
}

/**
 * Get breed information by ID
 */
export function getBreedById(breedId: string): BreedInfo | null {
  for (const breeds of Object.values(ETHIOPIAN_BREEDS)) {
    const breed = breeds.find(b => b.id === breedId);
    if (breed) return breed;
  }
  return null;
}

/**
 * Get breed name in specified language
 */
export function getBreedName(breedId: string, language: Language = 'en'): string {
  const breed = getBreedById(breedId);
  if (!breed) return breedId;
  
  // Return name in requested language, fallback to English
  return breed.name[language] || breed.name.en;
}
