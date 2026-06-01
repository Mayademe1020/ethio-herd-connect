import type { QueryKey } from '@tanstack/react-query';
import { usePaginatedQuery } from './usePaginatedQuery';

interface UseSimpleInfiniteListOptions<T> {
  queryKey: QueryKey;
  queryFn: (page: number, size: number) => Promise<{ data: T[]; count: number }>;
  pageSize?: number;
  enabled?: boolean;
  cacheKey?: string;
}

export const useSimpleInfiniteList = <T,>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
  cacheKey,
}: UseSimpleInfiniteListOptions<T>) => {
  const result = usePaginatedQuery<T>({
    queryKey,
    queryFn,
    pageSize,
    prefetchPages: 0,
    enableOfflineCache: true,
    cacheKey,
    enabled,
  });

  const items = result.data;
  const showMore = () => result.fetchNextPage?.();
  const hasMore = !!result.hasNextPage;

  return {
    items,
    showMore,
    hasMore,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error,
  };
};