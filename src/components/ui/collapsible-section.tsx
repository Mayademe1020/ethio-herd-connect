import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

type CollapsibleSectionProps = {
  id: string;
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
};

// CollapsibleSection: Radix-based single-item accordion for clean KPIs/alerts grouping
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  defaultOpen = false,
  className,
  children,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className={cn('w-full mb-6 bg-white rounded-lg border border-gray-200 shadow-sm', className)}
    >
      <AccordionItem value={id}>
        <AccordionTrigger className="px-4 py-3 text-base font-semibold text-gray-900">
          {title}
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};