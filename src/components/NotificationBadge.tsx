import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  priority?: 'high' | 'medium' | 'low';
  showIcon?: boolean;
  animate?: boolean;
}

export function NotificationBadge({ 
  count, 
  priority = 'medium', 
  showIcon = true,
  animate = true 
}: NotificationBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate && count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [count, animate]);

  const getBadgeColor = () => {
    if (count === 0) return 'bg-gray-400';
    
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className="relative inline-flex items-center">
      {showIcon && (
        <Bell 
          className={`w-6 h-6 text-gray-600 ${isAnimating ? 'animate-bounce' : ''}`}
        />
      )}
      
      {count > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full ${getBadgeColor()} ${
            isAnimating ? 'animate-pulse' : ''
          }`}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
}
