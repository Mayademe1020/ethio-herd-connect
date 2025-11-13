/**
 * Advertising Banner Component for Ethio Herd Connect
 * Displays targeted ads for vets, medicine sellers, and agricultural businesses
 */

import React, { useState, useEffect } from 'react';
import { monetizationService, Advertisement } from '@/services/monetizationService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, ExternalLink } from 'lucide-react';

interface AdvertisingBannerProps {
  businessType?: 'vet' | 'medicine' | 'product' | 'feed' | 'equipment';
  className?: string;
  maxAds?: number;
}

export const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({
  businessType,
  className = '',
  maxAds = 3
}) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const activeAds = await monetizationService.getActiveAdvertisements(businessType);
        setAds(activeAds.slice(0, maxAds));
      } catch (error) {
        console.error('Error loading ads:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, [businessType, maxAds]);

  const handleAdClick = async (ad: Advertisement) => {
    try {
      await monetizationService.trackAdClick(ad.id);
      // Open phone dialer or WhatsApp
      window.open(`tel:${ad.contact_phone}`, '_blank');
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleAdView = async (ad: Advertisement) => {
    try {
      await monetizationService.trackAdImpression(ad.id);
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          ተባባሪ አገልግሎቶች / Partner Services
        </h3>
        <p className="text-sm text-gray-600">
          ለእንስሳ ጤና እና እርሻ አገልግሎቶች / For animal health and farming services
        </p>
      </div>

      <div className="grid gap-4">
        {ads.map((ad, index) => (
          <Card
            key={ad.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500"
            onClick={() => handleAdClick(ad)}
            ref={(el) => {
              if (el && index === 0) {
                // Track impression when ad becomes visible
                const observer = new IntersectionObserver(
                  (entries) => {
                    entries.forEach((entry) => {
                      if (entry.isIntersecting) {
                        handleAdView(ad);
                        observer.disconnect();
                      }
                    });
                  },
                  { threshold: 0.5 }
                );
                observer.observe(el);
              }
            }}
          >
            <div className="flex items-start gap-4">
              {/* Business Logo/Image */}
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {ad.image_url ? (
                  <img
                    src={ad.image_url}
                    alt={ad.business_name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-2xl">
                    {ad.business_type === 'vet' && '🏥'}
                    {ad.business_type === 'medicine' && '💊'}
                    {ad.business_type === 'product' && '🛒'}
                    {ad.business_type === 'feed' && '🌾'}
                    {ad.business_type === 'equipment' && '🔧'}
                  </div>
                )}
              </div>

              {/* Ad Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {ad.business_name}
                    </h4>
                    <p className="text-sm text-green-600 font-medium mb-1">
                      {ad.business_type === 'vet' && 'እንስሳ ሐኪም / Veterinarian'}
                      {ad.business_type === 'medicine' && 'መድሃኒት / Medicine'}
                      {ad.business_type === 'product' && 'ምርቶች / Products'}
                      {ad.business_type === 'feed' && 'ምግብ / Feed'}
                      {ad.business_type === 'equipment' && 'መሳሪያዎች / Equipment'}
                    </p>
                    <h5 className="font-medium text-gray-800 mb-2">
                      {ad.title}
                    </h5>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ad.description}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {ad.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{ad.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{ad.contact_phone}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdClick(ad);
                    }}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    ደውል / Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Sponsored label */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                📢 የተለጠጠ ማስታወቂያ / Sponsored Advertisement
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action for Businesses */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-center">
          <h4 className="font-semibold text-blue-900 mb-2">
            ንግድዎን እዚህ ያሳዩ / Advertise Your Business Here
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            ከእንስሳ ባለቤቶች ጋር ያገናኙ እና ምርቶችዎን ያሳዩ / Connect with livestock owners and showcase your products
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => {
              // This would navigate to advertising signup
              window.open('tel:+251911123456', '_blank'); // Placeholder
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            ለማስታወቂያ ያግኙ / Contact for Advertising
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdvertisingBanner;