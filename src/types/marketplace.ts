export interface MarketListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  photos: string[] | null;
  user_id: string;
  views_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_negotiable?: boolean;
  is_vet_verified?: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  contact_phone?: string;
  contact_method?: string | null;
  contact_value?: string | null;
  video_url?: string | null;
  video_thumbnail?: string | null;
  video_duration?: number | null;
  animal_id: string;
  animal?: MarketListingAnimal;
  category?: string;
  photo?: string;
  age?: number | null;
  weight?: number | null;
  edit_count?: number | null;
  last_edited_at?: string | null;
}

export interface MarketListingAnimal {
  id: string;
  type: string;
  subtype?: string | null;
  name: string;
  photo_url?: string | null;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  health_status?: string;
}

export interface MarketListingFilters {
  animalType: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  ageRange: [number, number];
  weightRange: [number, number];
  healthStatus: string;
  verifiedOnly: boolean;
  sellerRating: number;
}

export interface MarketplaceSidebarFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  verifiedOnly: boolean;
}

export interface BuyerInterest {
  id: string;
  listing_id: string;
  buyer_id: string;
  message: string | null;
  status: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface MarketListingFormData {
  title: string;
  category: string;
  price: string;
  location: string;
  description: string;
  contactMethod: string;
  contactValue: string;
}
