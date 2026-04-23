/**
 * IdentificationResults Component
 * Displays muzzle identification results with animal details and alternatives
 * Requirements: 3.4, 3.5, 3.6, 3.7
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  Search,
  Wifi,
  WifiOff
} from 'lucide-react';
import { IdentificationResult, AnimalMatch, IdentificationStatus } from '@/types/muzzle';
import { useDateDisplay } from '@/hooks/useDateDisplay';

interface IdentificationResultsProps {
  result: IdentificationResult | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onViewAnimal?: (animalId: string) => void;
  className?: string;
}

export const IdentificationResults: React.FC<IdentificationResultsProps> = ({
  result,
  isLoading = false,
  onRetry,
  onViewAnimal,
  className = '',
}) => {
  const { formatDate } = useDateDisplay();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Search className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Identifying animal...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Search className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No identification results yet</p>
            <p className="text-xs text-muted-foreground">Capture a muzzle image to begin identification</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: IdentificationStatus) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'possible_match':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'no_match':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: IdentificationStatus) => {
    switch (status) {
      case 'match':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'possible_match':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no_match':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Medium';
    if (confidence >= 0.6) return 'Low';
    return 'Very Low';
  };

  const renderAnimalMatch = (animal: AnimalMatch, isPrimary = true) => (
    <Card key={animal.animalId} className={`${isPrimary ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {animal.name || `Animal ${animal.animalCode}`}
            {isPrimary && (
              <Badge variant="outline" className={getStatusColor(result.status)}>
                {result.status.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <div className="text-right">
            <div className="text-sm font-medium">
              {Math.round(animal.similarity * 100)}% Match
            </div>
            <div className="text-xs text-muted-foreground">
              {getConfidenceLabel(animal.similarity)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Animal Code:</span>
            <div>{animal.animalCode}</div>
          </div>
          <div>
            <span className="font-medium">Type:</span>
            <div>{animal.type}</div>
          </div>
          {animal.breed && (
            <div>
              <span className="font-medium">Breed:</span>
              <div>{animal.breed}</div>
            </div>
          )}
          <div>
            <span className="font-medium">Registered:</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(animal.muzzleRegisteredAt)}
            </div>
          </div>
        </div>

        {(animal.ownerName || animal.farmName) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner Information
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {animal.ownerName && (
                  <div>
                    <span className="font-medium">Name:</span> {animal.ownerName}
                  </div>
                )}
                {animal.ownerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{animal.ownerPhone}</span>
                  </div>
                )}
                {animal.farmName && (
                  <div>
                    <span className="font-medium">Farm:</span> {animal.farmName}
                  </div>
                )}
                {animal.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{animal.location}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant={isPrimary ? "default" : "outline"}
            size="sm"
            onClick={() => onViewAnimal?.(animal.animalId)}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(result.status)}
              Identification Result
            </CardTitle>
            <div className="flex items-center gap-2">
              {result.searchedLocal && result.searchedCloud && (
                <Badge variant="outline" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  Hybrid Search
                </Badge>
              )}
              {result.searchedLocal && !result.searchedCloud && (
                <Badge variant="outline" className="text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline Search
                </Badge>
              )}
              {result.searchDurationMs && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(result.searchDurationMs)}ms
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Searched on {formatDate(result.timestamp)}
          </div>
        </CardContent>
      </Card>

      {/* Primary Result */}
      {result.animal && renderAnimalMatch(result.animal, true)}

      {/* Alternative Matches */}
      {result.alternatives && result.alternatives.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-muted-foreground">Alternative Matches</h3>
          {result.alternatives.map((alternative) => renderAnimalMatch(alternative, false))}
        </div>
      )}

      {/* No Match Message */}
      {result.status === 'no_match' && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            No matching animal found in the database. This could be because:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The animal is not registered with muzzle identification</li>
              <li>The image quality was insufficient for identification</li>
              <li>The animal's muzzle pattern has changed significantly</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {result.status === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Identification failed. Please try again with a clearer image.
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                Retry Identification
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Possible Match Warning */}
      {result.status === 'possible_match' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This appears to be a possible match, but confidence is low.
            Please verify the animal details carefully before proceeding.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default IdentificationResults;