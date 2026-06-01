import { Search, Star, StarOff } from 'lucide-react';

interface Animal {
  id: string;
  animal_id?: string;
  name: string;
  type: string;
  subtype: string;
  photo_url?: string;
}

interface CowSelectionStepProps {
  cows: Animal[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectCow: (cow: Animal) => void;
}

export const CowSelectionStep = ({
  cows,
  searchQuery,
  onSearchChange,
  favorites,
  onToggleFavorite,
  onSelectCow,
}: CowSelectionStepProps) => {
  const filteredCows = cows.filter(
    (cow) =>
      cow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cow.animal_id && cow.animal_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cow.subtype && cow.subtype.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedCows = filteredCows.sort((a, b) => {
    const aFav = favorites.has(a.id);
    const bFav = favorites.has(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="በስም ወይም በመለያ ያጣሩ / Search by name or ID"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-1">ሴት እንስሳ ይምረጡ / Select Female Animal</h2>
        <p className="text-sm text-gray-600">Step 1 of 2 • Click on a female animal to continue</p>
      </div>

      <div className="space-y-3">
        {sortedCows.map((cow) => (
          <div
            key={cow.id}
            onClick={() => onSelectCow(cow)}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all active:scale-98 cursor-pointer border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {cow.photo_url ? (
                  <img
                    src={cow.photo_url}
                    alt={cow.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-2xl">🐄</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{cow.name}</h3>
                <p className="text-sm text-gray-600">{cow.subtype || 'Cow'}</p>
                {cow.animal_id && <p className="text-xs text-gray-500 font-mono">ID: {cow.animal_id}</p>}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(cow.id);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Toggle favorite"
              >
                {favorites.has(cow.id) ? (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <div className="text-gray-400 text-xl">→</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
