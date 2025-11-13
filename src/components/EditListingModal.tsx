// src/components/EditListingModal.tsx - Modal for editing marketplace listing details

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Camera, AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { PriceInput } from '@/components/PriceInput';
import { VideoUploadField } from '@/components/VideoUploadField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarketListing {
  id: string;
  price: number;
  is_negotiable: boolean;
  description?: string;
  photo_url?: string;
  video_url?: string;
  video_thumbnail?: string;
}

interface EditListingModalProps {
  listing: MarketListing;
  buyerInterestsCount: number;
  onSave: (updates: {
    price: number;
    is_negotiable: boolean;
    description?: string;
    photo_url?: string;
    video_url?: string;
    video_thumbnail?: string;
  }) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

export const EditListingModal = ({
  listing,
  buyerInterestsCount,
  onSave,
  onClose,
  isSaving
}: EditListingModalProps) => {
  const { t } = useTranslations();
  const [price, setPrice] = useState(listing.price);
  const [isNegotiable, setIsNegotiable] = useState(listing.is_negotiable);
  const [description, setDescription] = useState(listing.description || '');
  const [photoUrl, setPhotoUrl] = useState(listing.photo_url);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(listing.photo_url || null);
  const [videoUrl, setVideoUrl] = useState(listing.video_url);
  const [videoThumbnail, setVideoThumbnail] = useState(listing.video_thumbnail);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Validation
  const isValid = price > 0;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | undefined> => {
    if (!photoFile) return photoUrl;

    setIsUploadingMedia(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${listing.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('animal-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return photoUrl;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleVideoUpload = (url: string, thumbnail: string) => {
    setVideoUrl(url);
    setVideoThumbnail(thumbnail);
  };

  const handleSave = async () => {
    if (!isValid) return;

    try {
      // Upload photo if changed
      const finalPhotoUrl = await uploadPhoto();

      await onSave({
        price,
        is_negotiable: isNegotiable,
        description: description.trim() || undefined,
        photo_url: finalPhotoUrl,
        video_url: videoUrl,
        video_thumbnail: videoThumbnail
      });
    } catch (error) {
      console.error('Error saving listing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {t('edit')} Listing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning if buyer interests exist */}
          {buyerInterestsCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {buyerInterestsCount} buyer{buyerInterestsCount > 1 ? 's have' : ' has'} expressed interest
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {buyerInterestsCount} ገዢዎች ፍላጎት አሳይተዋል
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Consider contacting them before making major changes
                </p>
              </div>
            </div>
          )}

          {/* Price Input */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Price / ዋጋ <span className="text-red-500">*</span>
            </Label>
            <PriceInput
              value={price}
              onChange={setPrice}
              disabled={isSaving}
            />
          </div>

          {/* Negotiable Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="negotiable"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              disabled={isSaving}
            />
            <Label htmlFor="negotiable" className="text-base cursor-pointer">
              Price is negotiable / ዋጋው ተደራደሪ ነው
            </Label>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
              Description / መግለጫ
              <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details about the animal..."
              rows={4}
              className="text-base"
              disabled={isSaving}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Photo / ፎቶ
              <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>
            </Label>

            <div className="space-y-3">
              {/* Photo Preview */}
              {photoPreview && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setPhotoUrl(undefined);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Take Photo
                    </span>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Upload
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Video / ቪዲዮ
              <span className="text-sm text-gray-500 font-normal ml-2">(Optional, max 10 seconds)</span>
            </Label>
            <VideoUploadField
              onVideoUploaded={handleVideoUpload}
              currentVideoUrl={videoUrl}
              currentThumbnailUrl={videoThumbnail}
              disabled={isSaving}
            />
          </div>

          {/* Bilingual Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Original creation date will be preserved
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>ማስታወሻ:</strong> የመጀመሪያው የመፍጠሪያ ቀን ይጠበቃል
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={!isValid || isSaving || isUploadingMedia}
          >
            {isSaving || isUploadingMedia ? 'Saving...' : t('save')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
