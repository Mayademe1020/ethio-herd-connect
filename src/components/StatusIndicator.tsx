// src/components/StatusIndicator.tsx - Component to display animal reproductive status with tooltip

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getStatusInfo, AnimalStatus } from '@/utils/animalStatusUtils';

interface StatusIndicatorProps {
  status: AnimalStatus | undefined | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const StatusIndicator = ({ 
  status, 
  size = 'md', 
  showTooltip = true,
  className = ''
}: StatusIndicatorProps) => {
  const statusInfo = status ? getStatusInfo(status) : {
    labelAm: 'የምንታለብ',
    labelEn: 'Unknown',
    color: '#9CA3AF', // gray-400
    tooltip: 'Status not set',
    icon: '⚪'
  };

  const sizeMap: Record<string, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {showTooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`${sizeMap[size]} rounded-full flex items-center justify-center ${statusInfo.color}20 border-${statusInfo.color} ${status === 'male' || status === 'youngFemale' ? 'border-dashed' : 'border-solid'} ${status === 'male' ? 'border-2' : 'border'} hover:${statusInfo.color} hover:bg-${statusInfo.color}10 transition-colors transform hover:scale-105`}
              title={statusInfo.tooltip}
            >
              <span className="text-[${statusInfo.color}] font-bold text-sm">{statusInfo.icon}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent sideAlign="start" className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
              <span className="font-medium">{statusInfo.labelAm}</span>
              <span className="ml-1 text-xs text-gray-500">/{statusInfo.labelEn}</span>
            </div>
            <p className="mt-1 text-sm">{statusInfo.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {!showTooltip && (
        <div 
          className={`${sizeMap[size]} rounded-full flex items-center justify-center ${statusInfo.color}20 border-${statusInfo.color} ${status === 'male' || status === 'youngFemale' ? 'border-dashed' : 'border-solid'} ${status === 'male' ? 'border-2' : 'border'} hover:${statusInfo.color} hover:bg-${statusInfo.color}10 transition-colors transform hover:scale-105`}
          title={statusInfo.tooltip}
        >
          <span className="text-[${statusInfo.color}] font-bold text-sm">{statusInfo.icon}</span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;