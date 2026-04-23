// src/components/SimpleHomeSkeleton.tsx
// Loading skeleton for SimpleHome dashboard

import { Skeleton } from '@/components/ui/skeleton';
import { NeutralCard, NeutralCardContent } from '@/components/ui/neutral-card';

export const SimpleHomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Quick Actions Header */}
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>

        {/* Quick Actions Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <NeutralCard key={i}>
              <NeutralCardContent className="p-6 sm:p-8 flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded-full mb-2" />
                <Skeleton className="h-5 w-24" />
              </NeutralCardContent>
            </NeutralCard>
          ))}
        </div>

        {/* Today's Tasks Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Skeleton */}
        <NeutralCard className="p-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <NeutralCard>
              <div className="p-5 text-center space-y-3">
                <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                <Skeleton className="h-16 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </NeutralCard>
            <NeutralCard>
              <div className="p-5 text-center space-y-3">
                <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                <Skeleton className="h-16 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </NeutralCard>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <NeutralCard>
              <div className="p-5 text-center space-y-3">
                <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                <Skeleton className="h-16 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </NeutralCard>
          </div>
        </NeutralCard>
      </div>
    </div>
  );
};
