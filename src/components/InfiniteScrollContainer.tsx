/**
 * Infinite Scroll Container Component
 * 
 * Provides smooth infinite scrolling with:
 * - Intersection Observer for efficient detection
 * - Loading states and skeleton loaders
 * - Offline indicators
 * - Low-bandwidth optimization
 * - Touch-friendly for mobile
 * 
 * Optimized for Ethiopian context:
 * - Works on low-end devices
 * - Minimal re-renders
 * - Clear visual feedback
 * - Smooth on slow networks
 * 
 * @module InfiniteScrollContainer
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isOffline?: boolean;
  threshold?: number;
  className?: string;
  loadingMessage?: string;
  endMessage?: string;
  offlineMessage?: string;
}

/**
 * Infinite scroll container with offline support
 * 
 * @example
 * ```typescript
 * <InfiniteScrollContainer
 *   onLoadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoading={isFetchingNextPage}
 *   isOffline={isOffline}
 * >
 *   {animals.map(animal => (
 *     <AnimalCard key={animal.id} animal={animal} />
 *   ))}
 * </InfiniteScrollContainer>
 * ```
 */
export const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  isOffline = false,
  threshold = 300,
  className,
  loadingMessage = 'Loading more...',
  endMessage = 'No more items',
  offlineMessage = 'Offline - showing cached data',
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // Intersection Observer callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // Load more when:
      // 1. Element is intersecting
      // 2. Has more data to load
      // 3. Not currently loading
      // 4. Not offline (or allow offline loading from cache)
      if (
        entry.isIntersecting &&
        hasMore &&
        !isLoadingRef.current &&
        !isLoading
      ) {
        isLoadingRef.current = true;
        
        logger.debug('InfiniteScroll: Loading more items');
        
        onLoadMore();
        
        // Reset loading flag after a delay
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 500);
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  // Set up Intersection Observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const options = {
      root: null, // viewport
      rootMargin: `${threshold}px`, // Load before reaching bottom
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <div className={cn('relative', className)}>
      {/* Content */}
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>

      {/* Loading indicator */}
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-emerald-600" />
            <p className="text-sm sm:text-base font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center justify-center py-4 sm:py-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <WifiOff className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-orange-800 font-medium">{offlineMessage}</p>
          </div>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && !isLoading && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base font-medium">{endMessage}</p>
          </div>
        </div>
      )}

      {/* Intersection observer target */}
      <div
        ref={observerTarget}
        className="h-4"
        aria-hidden="true"
      />
    </div>
  );
};

/**
 * Skeleton loader for list items
 * Shows while initial data is loading
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-pulse"
        >
          <div className="flex gap-4">
            {/* Image skeleton */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0" />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Empty state component
 * Shows when no items are available
 */
export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon || <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 text-center max-w-md">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
