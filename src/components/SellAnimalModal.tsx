import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DollarSign, MapPin, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { AnimalData, Language } from '@/types';
import { toast } from 'sonner';
import { sanitizeInput } from '@/utils/securityUtils';

interface SellAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: AnimalData | null;
  language: Language;
}

export const SellAnimalModal: React.FC<SellAnimalModalProps> = ({
  isOpen,
  onClose,
  animal,
  language
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [listingExists, setListingExists] = useState(false);

  const [formData, setFormData] = useState({
    price: '',
    description: '',
    location: '',
    contactMethod: 'phone',
    isNegotiable: true
  });

  // Check for existing listing when animal changes
  useEffect(() => {
    const checkExistingListing = async () => {
      if (!animal || !user) return;
      
      const { data: existing } = await supabase
        .from('market_listings')
        .select('id, status')
        .eq('animal_id', animal.id)
        .eq('user_id', user.id)
        .in('status', ['active', 'pending'])
        .maybeSingle();
      
      setListingExists(!!existing);
    };
    
    checkExistingListing();
  }, [animal, user]);

  // Reset form when modal opens with new animal
  useEffect(() => {
    if (animal && isOpen) {
      setFormData({
        price: '',
        description: '',
        location: '',
        contactMethod: 'phone',
        isNegotiable: true
      });
      setIsSuccess(false);
      setIsDirty(false);
      setPriceError(null);
    }
  }, [animal, isOpen]);

  // Track form changes for dirty state
  const handleFormChange = useCallback((updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Handle closing with unsaved changes warning
  const handleClose = useCallback(() => {
    if (isDirty && !isSuccess) {
      if (window.confirm(language === 'am' ? 'ለውጥ አልተ�_saveምም? ይረጋጉ?' : 
                        language === 'or' ? 'Jijjiiramaa hin savedne?' :
                        language === 'sw' ? 'Tabia imehifadhiwa?' : 
                        'You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, isSuccess, onClose, language]);

  // Validate price with proper bounds
  const validatePrice = useCallback((priceStr: string): { valid: boolean; error?: string } => {
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      return { valid: false, error: 'Price must be greater than 0' };
    }
    if (price < 100) {
      return { valid: false, error: 'Minimum price is 100 Birr' };
    }
    if (price > 10000000) {
      return { valid: false, error: 'Maximum price is 10,000,000 Birr' };
    }
    return { valid: true };
  }, []);

  const translations = {
    am: {
      title: 'Sell Animal',
      description: 'Please set a price',
      price: 'Price',
      pricePlaceholder: '50000',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Additional info...',
      location: 'Location',
      locationPlaceholder: 'Addis Ababa',
      contactMethod: 'Contact',
      negotiable: 'Negotiable',
      cancel: 'Cancel',
      listForSale: 'List for Sale',
      success: 'Listed!',
      successMessage: 'Animal listed on marketplace.',
      viewListing: 'View',
      required: 'Required'
    },
    en: {
      title: 'Sell Animal',
      description: 'Please set a price for your animal',
      price: 'Price (Birr)',
      pricePlaceholder: 'e.g. 50000',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Additional information about the animal...',
      location: 'Location',
      locationPlaceholder: 'e.g. Addis Ababa',
      contactMethod: 'Contact Method',
      negotiable: 'Negotiable',
      cancel: 'Cancel',
      listForSale: 'List for Sale',
      success: 'Listed Successfully!',
      successMessage: 'Your animal has been listed on the marketplace.',
      viewListing: 'View Listing',
      required: 'Required'
    },
    or: {
      title: 'Horama Gurguraa',
      description: 'Maqaa barnyisaa deemi',
      price: 'Saqa Qarshii',
      pricePlaceholder: '50000',
      descriptionLabel: 'Ibsa',
      descriptionPlaceholder: 'Odeeffannoo dabalataa...',
      location: 'Iddoo',
      locationPlaceholder: 'fkn Finfinnee',
      contactMethod: 'Hunda fiisee',
      negotiable: 'Qindaa ina kan dandada',
      cancel: 'Dhiisi',
      listForSale: 'Gurguraa',
      success: 'Milkaa ina!',
      successMessage: 'Horii kee marketshiirii irratti argameera.',
      viewListing: 'Bilisa Ilma',
      required: 'Kan waligala'
    },
    sw: {
      title: 'Uza Mnyama',
      description: 'Tafadhali weka bei',
      price: 'Bei (Birr)',
      pricePlaceholder: 'mfano 50000',
      descriptionLabel: 'Maelezo',
      descriptionPlaceholder: 'Maelezo ya ziada kuhusu mnyama...',
      location: 'Eneo',
      locationPlaceholder: 'mfano Addis Ababa',
      contactMethod: 'Namba ya Simu',
      negotiable: 'Inaweza kuzungumza',
      cancel: 'Ghairi',
      listForSale: 'Weka Sokoni',
      success: 'Imefanikiwa!',
      successMessage: 'Mnyama wako umewekwa sokoni.',
      viewListing: 'Tazama Tangazo',
      required: 'Inahitajika'
    }
  };

  const t = translations[language] || translations.en;

  const handleSubmit = async () => {
    // Validate required fields
    if (!user || !animal) {
      toast.error('Authentication required');
      return;
    }

    // Validate price
    const priceValidation = validatePrice(formData.price);
    if (!priceValidation.valid) {
      setPriceError(priceValidation.error || 'Invalid price');
      toast.error(priceValidation.error || 'Invalid price');
      return;
    }

    // Check for existing listing
    if (listingExists) {
      toast.error('This animal is already listed for sale');
      return;
    }

    setIsSubmitting(true);
    setPriceError(null);

    try {
      // Sanitize all user inputs to prevent XSS
      const sanitizedDescription = formData.description 
        ? sanitizeInput(formData.description).substring(0, 1000) 
        : '';
      const sanitizedLocation = formData.location 
        ? sanitizeInput(formData.location).substring(0, 200) 
        : '';
      const sanitizedTitle = sanitizeInput(animal.name).substring(0, 200);

      const listingData = {
        animal_id: animal.id,
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription || `${animal.type} - ${animal.breed || animal.subtype || 'Unknown breed'}`,
        price: parseFloat(formData.price),
        location: sanitizedLocation || null,
        contact_method: formData.contactMethod,
        contact_value: user.phone || `+251${user.email?.split('@')[0] || 'unknown'}`,
        status: 'active',
        age: animal.age || null,
        weight: animal.weight || null,
        photos: animal.photo_url ? [animal.photo_url] : null,
        is_vet_verified: false
      };

      const { error } = await supabase
        .from('market_listings')
        .insert([listingData]);

      if (error) {
        // Handle specific Supabase errors
        if (error.code === '23505') {
          throw new Error('This animal is already listed for sale');
        }
        if (error.code === '42501') {
          throw new Error('Database permission denied. Please refresh and try again.');
        }
        throw error;
      }

      setIsSuccess(true);
      setIsDirty(false);
      toast.success(t.success, {
        description: t.successMessage
      });

      // Auto close after success (with longer delay for UX)
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error: any) {
      console.error('Error creating listing:', error);
      
      // Provide user-friendly error messages
      const errorMessage = error?.message?.includes('already listed')
        ? 'This animal is already listed for sale'
        : error?.message?.includes('permission')
        ? 'Unable to create listing. Please try again.'
        : 'Failed to list animal. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!animal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" aria-describedby="sell-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="w-6 h-6 text-primary" aria-hidden="true" />
            ) : (
              <>
                <DollarSign className="w-5 h-5" aria-hidden="true" />
                {t.title}
              </>
            )}
          </DialogTitle>
          <DialogDescription id="sell-modal-description">
            {isSuccess 
              ? t.successMessage 
              : listingExists 
                ? 'This animal is already listed for sale'
                : `${animal?.name || ''} - ${animal?.type || ''}`
            }
          </DialogDescription>
        </DialogHeader>

        {!isSuccess && listingExists && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg" role="alert">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              This animal is already listed on the marketplace. You can manage it from My Listings.
            </p>
          </div>
        )}

        {!isSuccess && !listingExists ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-4 py-4">
              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" aria-hidden="true" />
                  {t.price} *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="100"
                  max="10000000"
                  step="100"
                  placeholder={t.pricePlaceholder}
                  value={formData.price}
                  onChange={(e) => {
                    handleFormChange({ price: e.target.value });
                    setPriceError(null);
                  }}
                  className={`text-lg font-semibold ${priceError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!priceError}
                  aria-describedby={priceError ? 'price-error' : undefined}
                  required
                />
                {priceError && (
                  <p id="price-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    {priceError}
                  </p>
                )}
                <p className="text-xs text-gray-500" id="price-hint">
                  Price range: 100 - 10,000,000 Birr
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {t.descriptionLabel}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) => handleFormChange({ description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  aria-describedby="description-hint"
                />
                <p id="description-hint" className="text-xs text-gray-500">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  {t.location}
                </Label>
                <Input
                  id="location"
                  placeholder={t.locationPlaceholder}
                  value={formData.location}
                  onChange={(e) => handleFormChange({ location: e.target.value })}
                  maxLength={200}
                />
              </div>

              {/* Contact Method */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t.contactMethod}</legend>
                <Select
                  value={formData.contactMethod}
                  onValueChange={(value) => handleFormChange({ contactMethod: value })}
                >
                  <SelectTrigger aria-label={t.contactMethod}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <span className="flex items-center gap-2">
                        📱 <span>{language === 'am' ? 'ስልክ' : language === 'or' ? 'Bilbila' : language === 'sw' ? 'Simu' : 'Phone'}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <span className="flex items-center gap-2">
                        💬 <span>WhatsApp</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </fieldset>

              {/* Negotiable Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="negotiable" className="cursor-pointer" id="negotiable-label">
                  {t.negotiable}
                </Label>
                <Switch
                  id="negotiable"
                  checked={formData.isNegotiable}
                  onCheckedChange={(checked) => handleFormChange({ isNegotiable: checked })}
                  aria-labelledby="negotiable-label"
                />
              </div>

              {/* Animal Photo Preview */}
              {animal?.photo_url && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg" role="img" aria-label={`Photo of ${animal.name}`}>
                  <img
                    src={animal.photo_url}
                    alt={`${animal.name} - ${animal.type}`}
                    className="w-16 h-16 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium">{animal.name}</p>
                    <p className="text-sm text-gray-500">{animal.type} - {animal.breed || animal.subtype}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t.cancel}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !formData.price || listingExists}
                className="bg-primary hover:bg-primary-700"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Listing...</span>
                  </>
                ) : (
                  t.listForSale
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-primary mb-2">{t.success}</h3>
            <p className="text-muted-foreground">{t.successMessage}</p>
            
            <Button 
              onClick={handleClose}
              className="mt-4 w-full bg-primary hover:bg-primary-700"
            >
              {language === 'am' ? 'ተስማምቷል' : 
               language === 'or' ? 'Nan bade' : 
               language === 'sw' ? 'Sawa' : 'Done'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellAnimalModal;
