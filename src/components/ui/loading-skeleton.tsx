
import React from 'react'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'stat'
  count?: number
  className?: string
}

export const LoadingSkeleton = ({ 
  variant = 'card', 
  count = 1, 
  className 
}: LoadingSkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => {
    switch (variant) {
      case 'card':
        return (
          <div key={i} className={cn("space-y-3 p-4 border rounded-lg", className)}>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div key={i} className={cn("flex items-center space-x-4 p-3", className)}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        )
      
      case 'stat':
        return (
          <div key={i} className={cn("space-y-3 p-4 border rounded-lg", className)}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        )
      
      case 'table':
        return (
          <tr key={i} className={className}>
            <td className="p-3"><Skeleton className="h-4 w-full" /></td>
            <td className="p-3"><Skeleton className="h-4 w-full" /></td>
            <td className="p-3"><Skeleton className="h-4 w-full" /></td>
            <td className="p-3"><Skeleton className="h-8 w-16" /></td>
          </tr>
        )
      
      default:
        return <Skeleton key={i} className={cn("h-4 w-full", className)} />
    }
  })

  return variant === 'table' ? (
    <tbody>{skeletons}</tbody>
  ) : (
    <div className={cn(
      variant === 'card' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
      variant === 'list' && "space-y-2",
      variant === 'stat' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    )}>
      {skeletons}
    </div>
  )
}
