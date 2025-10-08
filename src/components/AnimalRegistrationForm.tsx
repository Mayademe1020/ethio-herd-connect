import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Loader2 } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { ANIMAL_TYPES, ANIMAL_TYPE_ICONS } from '@/utils/animalTypes';
import { AnimalSchema } from '@/lib/animalValidators';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AnimalRegistrationFormProps {
  language: Language;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof AnimalSchema>) => void;
  animal?: AnimalData | null;
}

export const AnimalRegistrationForm = ({ 
  language, 
  onClose, 
  onSubmit,
  animal
}: AnimalRegistrationFormProps) => {
  const [loading, setLoading] = useState(false);
  const { showSuccess } = useToastNotifications();
  const { t, getAnimalTypeTranslation } = useTranslations();

  const form = useForm<z.infer<typeof AnimalSchema>>({
    resolver: zodResolver(AnimalSchema),
    defaultValues: {
      name: animal?.name || '',
      type: animal?.type || '',
      breed: animal?.breed || '',
      birth_date: animal?.birth_date || '',
      gender: animal?.gender || '',
      color: animal?.color || '',
      weight: animal?.weight || undefined,
      notes: animal?.notes || '',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof AnimalSchema>) => {
    setLoading(true);
    await onSubmit(values);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center space-x-1 sm:space-x-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span>{animal ? 'Edit Animal' : t('animals.registration')}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6 space-y-3 sm:space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animals.name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('animals.name')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animals.type')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('animals.type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ANIMAL_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {ANIMAL_TYPE_ICONS[type]} {getAnimalTypeTranslation(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('animals.breed')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('animals.gender')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('animals.gender')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">{t('animals.male')}</SelectItem>
                          <SelectItem value="female">{t('animals.female')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                 <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('animals.weight')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animals.color')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('animals.notes')}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-8 sm:h-10 text-xs sm:text-sm bg-primary hover:bg-primary/90"
                >
                  {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  {loading ? 'Saving...' : t('animals.submit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};