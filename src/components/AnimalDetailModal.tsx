import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { X, Calendar, Weight, ShieldCheck, Phone } from 'lucide-react';
import { AnimalData } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';

interface AnimalDetailModalProps {
  listing: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    photos: string[] | null;
    price: number | null;
    animals: AnimalData;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const AnimalDetailModal = ({ listing, isOpen, onClose }: AnimalDetailModalProps) => {
  const { t } = useTranslations();
  const { animals: animal } = listing;

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return t('common.excellentHealth');
      case 'attention': return 'Needs Attention';
      case 'sick': return 'Sick';
      default: return status;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'sick': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{listing.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {listing.photos && listing.photos.length > 0 ? (
              <Carousel>
                <CarouselContent>
                  {listing.photos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <img src={photo} alt={`${listing.title} ${index + 1}`} className="w-full h-auto object-cover rounded-lg" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No photos</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{animal.name}</h3>
              <p className="text-sm text-muted-foreground">{animal.breed}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Age</dt>
                <dd className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {animal.age} years</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                <dd className="flex items-center gap-2"><Weight className="w-4 h-4" /> {animal.weight} kg</dd>
              </div>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Health Status</dt>
              <dd><Badge className={getHealthStatusColor(animal.health_status)}>{getHealthStatusText(animal.health_status)}</Badge></dd>
            </div>
            {animal.is_vet_verified && (
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-semibold">Vet Verified</span>
              </div>
            )}
            {listing.description && (
              <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-muted-foreground">{listing.description}</p>
              </div>
            )}
            <div className="pt-4">
              <Button className="w-full" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};