// src/components/MarketplaceBrowseSkeleton.tsx
// Loading skeleton for MarketplaceBrowse page

import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export const MarketplaceBrowseSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Search Bar Skeleton */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
            <Skeleton className="w-full h-12 rounded-lg" />
          </div>
          
          {/* Filter Tabs Skeleton */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid Skeleton */}
      <div className="max-w-4xl mx-auto p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              {/* Image Skeleton */}
              <Skeleton className="w-full h-48" />
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
