// src/components/TopBar.tsx - Top bar with language toggle

import { LanguageToggle } from './LanguageToggle';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

export const TopBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center z-40 shadow-sm">
      {/* Compact offline/online status for intermittent connectivity */}
      <OfflineStatusIndicator variant="compact" />
      <LanguageToggle />
    </div>
  );
};
