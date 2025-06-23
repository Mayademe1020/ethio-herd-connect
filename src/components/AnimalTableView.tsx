
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Syringe, TrendingUp, DollarSign } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimalData, Language } from '@/types';

interface AnimalTableViewProps {
  animals: AnimalData[];
  language: Language;
  onEdit: (animal: AnimalData) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: AnimalData) => void;
  onTrack: (animal: AnimalData) => void;
  onSell: (animal: AnimalData) => void;
}

export const AnimalTableView = ({
  animals,
  language,
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell
}: AnimalTableViewProps) => {
  const translations = {
    am: {
      name: 'ስም',
      type: 'ዓይነት',
      breed: 'ዝርያ',
      age: 'እድሜ',
      weight: 'ክብደት',
      health: 'ጤንነት',
      actions: 'ተግባራት',
      edit: 'አርም',
      delete: 'ሰርዝ',
      vaccinate: 'ክትባት',
      track: 'ክትትል',
      sell: 'ሽያጭ',
      healthy: 'ጤናማ',
      attention: 'ትኩረት',
      sick: 'ህመም',
      critical: 'አደገኛ'
    },
    en: {
      name: 'Name',
      type: 'Type',
      breed: 'Breed',
      age: 'Age',
      weight: 'Weight',
      health: 'Health',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      vaccinate: 'Vaccinate',
      track: 'Track',
      sell: 'Sell',
      healthy: 'Healthy',
      attention: 'Attention',
      sick: 'Sick',
      critical: 'Critical'
    },
    or: {
      name: 'Maqaa',
      type: 'Gosa',
      breed: 'Sanyii',
      age: 'Umurii',
      weight: 'Ulfaatina',
      health: 'Fayyaa',
      actions: 'Hojiiwwan',
      edit: 'Gulaaluu',
      delete: 'Haquu',
      vaccinate: 'Tallaa',
      track: 'Hordofuu',
      sell: 'Gurgurtaa',
      healthy: 'Fayyaa',
      attention: 'Xiyyeeffannaa',
      sick: 'Dhukkubsaa',
      critical: 'Hamaa'
    },
    sw: {
      name: 'Jina',
      type: 'Aina',
      breed: 'Aina',
      age: 'Umri',
      weight: 'Uzito',
      health: 'Afya',
      actions: 'Vitendo',
      edit: 'Hariri',
      delete: 'Futa',
      vaccinate: 'Chanjo',
      track: 'Fuatilia',
      sell: 'Uza',
      healthy: 'Mzuri',
      attention: 'Uangalifu',
      sick: 'Mgonjwa',
      critical: 'Hatari'
    }
  };

  const t = translations[language];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.name}</TableHead>
            <TableHead>{t.type}</TableHead>
            <TableHead>{t.breed}</TableHead>
            <TableHead>{t.age}</TableHead>
            <TableHead>{t.weight}</TableHead>
            <TableHead>{t.health}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">{animal.name}</TableCell>
              <TableCell>{animal.type}</TableCell>
              <TableCell>{animal.breed || 'N/A'}</TableCell>
              <TableCell>{animal.age ? `${animal.age} years` : 'N/A'}</TableCell>
              <TableCell>{animal.weight ? `${animal.weight}kg` : 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(animal.health_status)}>
                  {t[animal.health_status as keyof typeof t] || animal.health_status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(animal)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onVaccinate(animal)}>
                      <Syringe className="mr-2 h-4 w-4" />
                      {t.vaccinate}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTrack(animal)}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {t.track}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSell(animal)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      {t.sell}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(animal.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
