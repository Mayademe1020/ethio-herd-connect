import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Beef, ShoppingCart, Milk, User } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/animals', icon: Beef, label: 'Animals' },
    { path: '/marketplace', icon: ShoppingCart, label: 'Market', badge: 3 },
    { path: '/milk/record', icon: Milk, label: 'Record' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50"
         style={{
           height: '72px',
           paddingTop: '8px',
           paddingBottom: 'env(safe-area-inset-bottom, 8px)',
           paddingLeft: '8px',
           paddingRight: '8px'
         }}>
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <EnhancedButton
              key={tab.path}
              onClick={() => navigate(tab.path)}
              variant="ghost"
              size="sm"
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              title={tab.label}
              className={`flex flex-col items-center gap-1 py-2 px-3 touch-target-large ${active ? 'text-emerald-600 bg-emerald-50 rounded-xl' : 'text-gray-600'}`}
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors duration-200 ${active ? 'text-emerald-600' : 'text-gray-400'}`}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600"></div>
                )}
                
                {/* Notification badge */}
                {tab.badge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {tab.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors duration-200 ${
                active ? 'text-emerald-600' : 'text-gray-600'
              }`}>
                {tab.label}
              </span>
            </EnhancedButton>
          );
        })}
      </div>
    </div>
  );
};

export { BottomNavigation };
export default BottomNavigation;
