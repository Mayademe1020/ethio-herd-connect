
import React from 'react';
import { EnhancedCard } from './enhanced-card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "success" | "warning" | "error" | "info";
  loading?: boolean;
  onClick?: () => void;
}

const colorVariants = {
  primary: "text-primary",
  success: "text-green-600",
  warning: "text-yellow-600", 
  error: "text-red-600",
  info: "text-blue-600"
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendValue,
  color = "primary",
  loading = false,
  onClick
}: StatCardProps) => {
  return (
    <EnhancedCard
      title={title}
      subtitle={subtitle}
      icon={Icon}
      iconColor={colorVariants[color]}
      value={value}
      trend={trend}
      trendValue={trendValue}
      loading={loading}
      onClick={onClick}
      className="h-full"
    />
  );
};
