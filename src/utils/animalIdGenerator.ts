
export const generateAnimalId = (type: string, sequenceNumber: number): string => {
  const typeCode = getTypeCode(type);
  const formattedSequence = sequenceNumber.toString().padStart(3, '0');
  const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  
  return `${typeCode}-${formattedSequence}-${dateCode}`;
};

export const getTypeCode = (type: string): string => {
  const typeCodes: Record<string, string> = {
    'cattle': 'COW',
    'poultry': 'POU', 
    'goat': 'GOT',
    'sheep': 'SHP',
    'pig': 'PIG',
    'horse': 'HOR'
  };
  
  return typeCodes[type.toLowerCase()] || 'ANM';
};

export const parseAnimalId = (animalId: string): { type: string; sequence: number; date: string } | null => {
  const parts = animalId.split('-');
  if (parts.length !== 3) return null;
  
  const [typeCode, sequence, date] = parts;
  const type = Object.entries({
    'COW': 'cattle',
    'POU': 'poultry', 
    'GOT': 'goat',
    'SHP': 'sheep',
    'PIG': 'pig',
    'HOR': 'horse'
  }).find(([code]) => code === typeCode)?.[1] || 'unknown';
  
  return {
    type,
    sequence: parseInt(sequence, 10),
    date: `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4, 6)}`
  };
};

export const validateAnimalId = (animalId: string): boolean => {
  const regex = /^[A-Z]{3}-\d{3}-\d{6}$/;
  return regex.test(animalId);
};
