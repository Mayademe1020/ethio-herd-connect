import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type NeutralCardProps = React.ComponentProps<typeof Card> & {
  asButton?: boolean;
  active?: boolean;
};

// NeutralCard: white background, gray border, subtle shadow; tappable when asButton=true
export const NeutralCard: React.FC<NeutralCardProps> = ({
  className,
  asButton,
  active,
  ...props
}) => {
  return (
    <Card
      {...props}
      role={asButton ? 'button' : props.role}
      tabIndex={asButton ? 0 : props.tabIndex}
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm transition-all',
        'hover:shadow-md',
        asButton && 'cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500',
        active && 'ring-2 ring-emerald-500',
        className
      )}
      style={{ minHeight: asButton ? 56 : undefined }}
    />
  );
};

export const NeutralCardHeader = CardHeader;
export const NeutralCardTitle = CardTitle;
export const NeutralCardDescription = CardDescription;
export const NeutralCardContent = CardContent;
export const NeutralCardFooter = CardFooter;