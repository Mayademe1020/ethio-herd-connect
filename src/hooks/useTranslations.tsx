import { useTranslation } from './useTranslation';

export const useTranslations = () => {
  const { t } = useTranslation();

  const getAnimalTypeTranslation = (type: string): string => {
    return t(`animalTypes.${type}`);
  };

  return { t, getAnimalTypeTranslation };
};
