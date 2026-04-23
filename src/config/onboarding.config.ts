// src/config/onboarding.config.ts
// Centralized configuration for all onboarding content
// Edit this file to change tour steps, wizard flow, or translations

export type Language = 'am' | 'en' | 'or' | 'sw';

// Tour step configuration
export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: Record<Language, string>;
  description: Record<Language, string>;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'navigate' | 'highlight';
  path?: string; // For navigation steps
}

// Wizard step configuration
export interface WizardStep {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  component: 'type-selection' | 'basic-info' | 'photo-upload' | 'review' | 'success';
  fields?: string[];
}

// Help tooltip configuration
export interface HelpContent {
  key: string;
  title: Record<Language, string>;
  content: Record<Language, string>;
}

// Tour steps - 3 step tour
export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-stats"]',
    title: {
      am: 'እንኳን ወደ ቤት ደህና መጡ!',
      en: 'Welcome to Your Farm!',
      or: 'Baga Nagaan Dhuftan!',
      sw: 'Karibu kwenye Shamba Lako!'
    },
    description: {
      am: 'ይህ የእርስዎ የቤት ዳሽቦርድ ነው። ሁሉንም እንስሳት እና ዕለታዊ የወተት ምርት በአንድ ጭምር ይመልከቱ።',
      en: 'This is your farm dashboard. See all your animals and daily milk production at a glance.',
      or: 'Kun daashboordii qotaa keessanii dha. Hundi horii keessanii fi oomishii aannanii guyyaa tokkoo ilaala.',
      sw: 'Hii dashibodi yako ya shamba. Tazama wanyama wako na uzalishaji wa maziwa kila siku kwa mtazamo mmoja.'
    },
    position: 'bottom',
    action: 'highlight'
  },
  {
    id: 'register-animal',
    target: '[data-tour="add-animal-btn"]',
    title: {
      am: 'እንስሳ ይጨምሩ',
      en: 'Add Your Animals',
      or: 'Horii Dabali',
      sw: 'Ongeza Wanyama Wako'
    },
    description: {
      am: 'እዚህ የመጀመሪያ እንስሳዎን ያኑሩ። ልዩ መታወቂያ እናገኝሎታለን እና ጤና እና ምርትዎን ለመከታተል እንረዳዎታለን።',
      en: 'Add your first animal here. We\'ll generate a unique ID and help you track its health and production.',
      or: 'Hoo xiqqoo tokko asitti dabali. ID adda ta\'e uumna fi fayyina isaa fi oomishii isaa hordofannu si gargaarna.',
      sw: 'Ongeza mnyama wako wa kwanza hapa. Tutatengeneza kitambulisho cha kipekee na kukusaidia kufuatilia afya na uzalishaji wake.'
    },
    position: 'left',
    action: 'navigate',
    path: '/register-animal'
  },
  {
    id: 'record-milk',
    target: '[data-tour="record-milk-btn"]',
    title: {
      am: 'ወተት ይመዝግቡ',
      en: 'Record Milk',
      or: 'Aannan Galmeessi',
      sw: 'Rekodi Maziwa'
    },
    description: {
      am: 'ከእያንዳንዱ የወተት ማሰራጫ በኋላ ወተት ይመዝግቡ። ለጠዋት እና ለማታ 2 ጊዜ ብቻ!',
      en: 'Record milk after each milking. Just 2 clicks for morning and evening!',
      or: 'Aannan erga sa\'a\'iwwan booda galmeessi. Kilikii 2 qofaaf garaa bahuu fi galgalaaf!',
      sw: 'Rekodi maziwa baada ya kukama kila wakati. Bofya mara 2 tu kwa asubuhi na jioni!'
    },
    position: 'top',
    action: 'navigate',
    path: '/record-milk'
  }
];

// Wizard steps - 5 step first animal wizard
export const wizardSteps: WizardStep[] = [
  {
    id: 'intro',
    title: {
      am: 'እንኳን ወደ እንስሳ መመዝገቢያ ጣቢያ በደህና መጡ!',
      en: 'Welcome to Ethio Herd Connect!',
      or: 'Baga Nagaan Dhuftan!',
      sw: 'Karibu kwenye Ethio Herd Connect!'
    },
    description: {
      am: 'የመጀመሪያ እንስሳዎን ለማከል ይህ ሁሉንም ሂደት ይወስዳል። ይህ 2 ደቂቃ ብቻ ይወስዳል።',
      en: 'Let\'s add your first animal to get started. This will only take 2 minutes.',
      or: 'Hoo xiqqoo tokko jedhuu jalqabnu. Kun daqiiqaa 2 qofa fudhata.',
      sw: 'Hebu tuongeze mnyama wako wa kwanza kuanzia. Hii itachukua dakika 2 tu.'
    },
    component: 'type-selection'
  },
  {
    id: 'type-selection',
    title: {
      am: 'የእንስሳውን አይነት ይምረጡ',
      en: 'Choose Animal Type',
      or: 'Gosa Hoo Filadhu',
      sw: 'Chagua Aina ya Mnyama'
    },
    description: {
      am: 'እባክዎ የሚጨምሩት እንስሳ ምን ዓይነት እንደሆነ ይምረጡ',
      en: 'What type of animal are you adding?',
      or: 'Hoo gosa kamtuu itti dabaltaa jirta?',
      sw: 'Unaongeza mnyama wa aina gani?'
    },
    component: 'type-selection'
  },
  {
    id: 'basic-info',
    title: {
      am: 'መሰረታዊ መረጃ',
      en: 'Basic Information',
      or: 'Odeeffannoo Bu\'uura',
      sw: 'Taarifa za Msingi'
    },
    description: {
      am: 'ስም እና ዘር ያክሉ (አማራጭ)',
      en: 'Add name and breed (optional)',
      or: 'Maqaa fi gosa dabali (filannoo)',
      sw: 'Ongeza jina na mbari (hiari)'
    },
    component: 'basic-info',
    fields: ['name', 'breed', 'birthDate']
  },
  {
    id: 'photo',
    title: {
      am: 'ፎቶ ያክሉ',
      en: 'Add a Photo',
      or: 'Suuraa Dabali',
      sw: 'Ongeza Picha'
    },
    description: {
      am: 'ለማንኳኳት ፎቶ ያክሉ (አማራጭ ግን በጣም ይመከራል)',
      en: 'Upload a photo for identification (optional but recommended)',
      or: 'Suuraa beekamtii vuuftuuf olkaa\'i (filannoo yoo ta\'uulusi yaamamuu)',
      sw: 'Pakia picha kwa utambuzi (hiari lakini inapendekezwa)'
    },
    component: 'photo-upload'
  },
  {
    id: 'review',
    title: {
      am: 'እናረጋግጥ',
      en: 'Review',
      or: 'Ilaali',
      sw: 'Hakiki'
    },
    description: {
      am: 'ሁሉም ነገር ትክክል መሆኑን ያረጋግጡ',
      en: 'Make sure everything looks correct',
      or: 'Hundi sirrii ta\'ee akka ilaaltu mirkaneessi',
      sw: 'Hakikisha kila kitu kinaonekana sawa'
    },
    component: 'review'
  },
  {
    id: 'success',
    title: {
      am: 'እንኳን ደስ አላችሁ!',
      en: 'Congratulations!',
      or: 'Baga Gammaddan!',
      sw: 'Hongera!'
    },
    description: {
      am: 'የመጀመሪያ እንስሳዎ ተመዝግቧል',
      en: 'Your first animal is registered',
      or: 'Hoo kee jalqaba galmeessameera',
      sw: 'Mnyama wako wa kwanza amesajiliwa'
    },
    component: 'success'
  }
];

// Help content for tooltips
export const helpContent: HelpContent[] = [
  {
    key: 'animal-name',
    title: {
      am: 'ስም (አማራጭ)',
      en: 'Name (Optional)',
      or: 'Maqaa (Filannoo)',
      sw: 'Jina (Hiari)'
    },
    content: {
      am: 'ለእንስሳዎ ልዩ ስም ይስጡ። ይህ ለማንኳኳት ይረዳል።',
      en: 'Give your animal a friendly name. This helps with identification.',
      or: 'Hoo keessaf maqaa mi\'aawaa kenni. Kun beekamtii gargaara.',
      sw: 'Mpa mnyama wako jina la kirafiki. Hii husaidia kutambua.'
    }
  },
  {
    key: 'animal-type',
    title: {
      am: 'የእንስሳው አይነት',
      en: 'Animal Type',
      or: 'Gosa Hoo',
      sw: 'Aina ya Mnyama'
    },
    content: {
      am: 'እንስሳው ላም፣ ፍየል ወይም በግ ነው?',
      en: 'Is your animal cattle, goat, or sheep?',
      or: 'Hoo kee sa\'a, re\'ee ykn hooxi dha?',
      sw: 'Mnyama wako ni ng\'ombe, mbuzi, au kondoo?'
    }
  },
  {
    key: 'milk-morning',
    title: {
      am: 'የጠዋት ወተት',
      en: 'Morning Milk',
      or: 'Aannan Ganamaa',
      sw: 'Maziwa ya Asubuhi'
    },
    content: {
      am: 'ከጠዋት 12:00 በፊት የተጠበቀ ወተት ይመዝግቡ',
      en: 'Record milk collected before 12:00 PM',
      or: 'Aannan sa\'aatii 12:00 dura funaaname galmeessi',
      sw: 'Rekodi maziwa yaliyokusanywa kabla ya saa 12:00 mchana'
    }
  },
  {
    key: 'milk-evening',
    title: {
      am: 'የማታ ወተት',
      en: 'Evening Milk',
      or: 'Aannan Galgalaa',
      sw: 'Maziwa ya Jioni'
    },
    content: {
      am: 'ከ12:00 በኋላ የተጠበቀ ወተት ይመዝግቡ',
      en: 'Record milk collected after 12:00 PM',
      or: 'Aannan sa\'aatii 12:00 booda funaaname galmeessi',
      sw: 'Rekodi maziwa yaliyokusanywa baada ya saa 12:00 mchana'
    }
  },
  {
    key: 'marketplace-price',
    title: {
      am: 'ዋጋ መወሰን',
      en: 'Setting Price',
      or: 'Gatii Murteessuu',
      sw: 'Kuweka Bei'
    },
    content: {
      am: 'ዕድሜ፣ ክብደት እና ጤና ላይ በመመስረት ትክክለኛ ዋጋ ያዘጋጁ',
      en: 'Set a fair price based on age, weight, and health',
      or: 'Gatii qindaa\'inaa garaa, ciminaa, fi fayyina irratti hundaa\'e kenni',
      sw: 'Weka bei ya haki kulingana na umri, uzito, na afya'
    }
  }
];

// Animal type options for wizard
export const animalTypes = [
  {
    type: 'cattle' as const,
    emoji: '🐄',
    label: {
      am: 'ላም',
      en: 'Cattle',
      or: 'Saa\'a',
      sw: 'Ng\'ombe'
    }
  },
  {
    type: 'goat' as const,
    emoji: '🐐',
    label: {
      am: 'ፍየል',
      en: 'Goat',
      or: 'Re\'ee',
      sw: 'Mbuzi'
    }
  },
  {
    type: 'sheep' as const,
    emoji: '🐑',
    label: {
      am: 'በግ',
      en: 'Sheep',
      or: 'Hooxi',
      sw: 'Kondoo'
    }
  }
];

// Storage keys
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'ethio_herd_onboarding_completed',
  ONBOARDING_SKIPPED: 'ethio_herd_onboarding_skipped',
  ONBOARDING_STEP: 'ethio_herd_onboarding_step',
  WIZARD_COMPLETED: 'ethio_herd_wizard_completed',
  HELP_DISMISSED: 'ethio_herd_help_dismissed'
};
