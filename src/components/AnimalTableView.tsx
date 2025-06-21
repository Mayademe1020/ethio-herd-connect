
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Search, Syringe, TrendingUp, DollarSign, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Animal {
  id: string;
  name: string;
  animal_code: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  health_status: 'healthy' | 'attention' | 'sick';
  last_vaccination?: string;
  is_vet_verified: boolean;
  created_at: string;
}

interface AnimalTableViewProps {
  animals: Animal[];
  language: 'am' | 'en';
  onEdit: (animal: Animal) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: Animal) => void;
  onTrack: (animal: Animal) => void;
  onSell: (animal: Animal) => void;
  onAnimalClick?: (animal: Animal) => void;
}

export const AnimalTableView: React.FC<AnimalTableViewProps> = ({
  animals,
  language,
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell,
  onAnimalClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  const getHealthStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      sick: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      healthy: language === 'am' ? 'ጤናማ' : 'Healthy',
      attention: language === 'am' ? 'ትኩረት' : 'Attention',
      sick: language === 'am' ? 'ታማሚ' : 'Sick'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getVaccineStatus = (lastVaccination?: string, isVerified?: boolean) => {
    if (!lastVaccination) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          {language === 'am' ? 'አልተከተበም' : 'Not Vaccinated'}
        </Badge>
      );
    }
    
    const vaccinationDate = new Date(lastVaccination);
    const daysSince = Math.floor((Date.now() - vaccinationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30) {
      return (
        <Badge className="bg-green-100 text-green-800">
          {language === 'am' ? 'ቅርብ ጊዜ' : 'Recent'}
        </Badge>
      );
    } else if (daysSince < 90) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          {language === 'am' ? 'መካከለኛ' : 'Moderate'}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800">
          {language === 'am' ? 'የተዘለለ' : 'Overdue'}
        </Badge>
      );
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         animal.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || animal.type === typeFilter;
    const matchesHealth = healthFilter === 'all' || animal.health_status === healthFilter;
    
    return matchesSearch && matchesType && matchesHealth;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={language === 'am' ? 'አይነት' : 'Type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'am' ? 'ሁሉም' : 'All'}
              </SelectItem>
              <SelectItem value="cattle">
                {language === 'am' ? 'ከብት' : 'Cattle'}
              </SelectItem>
              <SelectItem value="poultry">
                {language === 'am' ? 'ዶሮ' : 'Poultry'}
              </SelectItem>
              <SelectItem value="goat">
                {language === 'am' ? 'ፍየል' : 'Goat'}
              </SelectItem>
              <SelectItem value="sheep">
                {language === 'am' ? 'በግ' : 'Sheep'}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={language === 'am' ? 'ጤንነት' : 'Health'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === 'am' ? 'ሁሉም' : 'All'}
              </SelectItem>
              <SelectItem value="healthy">
                {language === 'am' ? 'ጤናማ' : 'Healthy'}
              </SelectItem>
              <SelectItem value="attention">
                {language === 'am' ? 'ትኩረት' : 'Attention'}
              </SelectItem>
              <SelectItem value="sick">
                {language === 'am' ? 'ታማሚ' : 'Sick'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50">
              <TableHead className="font-semibold">
                {language === 'am' ? 'ስም' : 'Name'}
              </TableHead>
              <TableHead className="font-semibold">
                {language === 'am' ? 'አይነት' : 'Type'}
              </TableHead>
              <TableHead className="font-semibold">
                {language === 'am' ? 'እድሜ' : 'Age'}
              </TableHead>
              <TableHead className="font-semibold">
                {language === 'am' ? 'ክብደት' : 'Weight'}
              </TableHead>
              <TableHead className="font-semibold">
                {language === 'am' ? 'ክትባት' : 'Vaccine'}
              </TableHead>
              <TableHead className="font-semibold">
                {language === 'am' ? 'ጤንነት' : 'Health'}
              </TableHead>
              <TableHead className="font-semibold">
                {language === 'am' ? 'እርምጃዎች' : 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnimals.map((animal) => (
              <TableRow 
                key={animal.id} 
                className="hover:bg-green-50 transition-colors cursor-pointer"
                onClick={() => onAnimalClick?.(animal)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{animal.name}</div>
                    <div className="text-sm text-gray-500">{animal.animal_code}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">
                    {animal.type}
                    {animal.breed && (
                      <div className="text-sm text-gray-500">{animal.breed}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {animal.age ? `${animal.age} ${language === 'am' ? 'ዓመት' : 'years'}` : '-'}
                </TableCell>
                <TableCell>
                  {animal.weight ? `${animal.weight} kg` : '-'}
                </TableCell>
                <TableCell>
                  {getVaccineStatus(animal.last_vaccination, animal.is_vet_verified)}
                </TableCell>
                <TableCell>
                  {getHealthStatusBadge(animal.health_status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVaccinate(animal);
                      }}
                    >
                      <Syringe className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrack(animal);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-orange-50 hover:border-orange-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSell(animal);
                      }}
                    >
                      <DollarSign className="w-4 h-4 text-orange-600" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEdit(animal);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          {language === 'am' ? 'አርትዕ' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(animal.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {language === 'am' ? 'ሰርዝ' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
