/**
 * IdentifyAnimalPage Component
 * Main page for animal identification using muzzle patterns
 * Launches capture flow, displays results, logs attempts, and supports offline identification
 * Requirements: 1.1, 3.1, 3.2, 3.3, 4.1, 6.1, 6.2
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Camera,
  Search,
  History,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Heart,
  Phone,
  ShieldCheck
} from 'lucide-react';

import { CameraCapture } from '@/components/CameraCapture';
import { IdentificationResults } from '@/components/IdentificationResults';
import { useMuzzleIdentification } from '@/hooks/useMuzzleIdentification';
import { identificationLogger } from '@/services/identificationLogger';
import { muzzleSearchService } from '@/services/muzzleSearchService';
import { muzzleMLService } from '@/services/muzzleMLService';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';
import { useToast } from '@/hooks/use-toast';

import {
  CapturedImage,
  IdentificationResult,
  SearchMode,
  MuzzleError,
  MuzzleIdentificationLog
} from '@/types/muzzle';

const IdentifyAnimalPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [identificationHistory, setIdentificationHistory] = useState<MuzzleIdentificationLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('capture');

  // Found Animal state
  const [foundAnimalResult, setFoundAnimalResult] = useState<any>(null);
  const [isSearchingFound, setIsSearchingFound] = useState(false);
  const [foundError, setFoundError] = useState<string | null>(null);

  // Hooks
  const {
    state: identificationState,
    result: identificationResult,
    isIdentifying,
    error: identificationError,
    progress,
    identifyMuzzle,
    retryIdentification,
    clearResult,
  } = useMuzzleIdentification();

  const { isOnline } = useOfflineQueue();
  const { capability, canRunLocally } = useDeviceCapability();

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    const initializeServices = async () => {
      try {
        await identificationLogger.initialize();
        loadIdentificationHistory();
      } catch (error) {
        console.error('Failed to initialize services:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize identification services',
          variant: 'destructive',
        });
      }
    };

    initializeServices();
  }, [toast]);

  // ============================================================================
  // Image Capture Handlers
  // ============================================================================

  const handleImageCaptured = useCallback(async (image: CapturedImage) => {
    setCapturedImage(image);
    setActiveTab('results');

    // Automatically start identification
    try {
      await performIdentification(image);
    } catch (error) {
      console.error('Auto-identification failed:', error);
    }
  }, []);

  const handleCaptureError = useCallback((error: MuzzleError) => {
    toast({
      title: 'Capture Error',
      description: error.message,
      variant: 'destructive',
    });
  }, [toast]);

  // ============================================================================
  // Identification Logic
  // ============================================================================

  const performIdentification = useCallback(async (image: CapturedImage) => {
    try {
      const result = await identifyMuzzle(image.blob, {
        searchMode,
        onProgress: (progress) => {
          // Progress is handled by the hook
        },
      });

      // Log the identification attempt
      await logIdentificationAttempt(result, searchMode);

      // Show success toast
      if (result.status === 'match') {
        toast({
          title: 'Animal Identified!',
          description: `Found match for ${result.animal?.name || result.animal?.animalCode}`,
        });
      } else if (result.status === 'possible_match') {
        toast({
          title: 'Possible Match Found',
          description: 'Please verify the animal details',
          variant: 'default',
        });
      } else {
        toast({
          title: 'No Match Found',
          description: 'Animal not found in database',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Identification failed:', error);
      const muzzleError = error as MuzzleError;
      toast({
        title: 'Identification Failed',
        description: muzzleError.message,
        variant: 'destructive',
      });
    }
  }, [identifyMuzzle, searchMode, toast]);

  const handleRetryIdentification = useCallback(async () => {
    if (!capturedImage) return;

    clearResult();
    await performIdentification(capturedImage);
  }, [capturedImage, clearResult, performIdentification]);

  // ============================================================================
  // Logging
  // ============================================================================

  const logIdentificationAttempt = useCallback(async (
    result: IdentificationResult,
    mode: SearchMode
  ) => {
    try {
      await identificationLogger.logIdentification({
        result,
        searchMode: mode,
        deviceInfo: {
          hasWebGL: canRunLocally || false,
          gpuTier: capability?.gpuTier,
        },
      });

      // Reload history to include the new entry
      loadIdentificationHistory();
    } catch (error) {
      console.error('Failed to log identification:', error);
    }
  }, [capability]);

  // ============================================================================
  // Found Animal Flow
  // ============================================================================

  const handleFoundAnimalCapture = useCallback(async (image: CapturedImage) => {
    setIsSearchingFound(true);
    setFoundError(null);
    setFoundAnimalResult(null);

    try {
      // Extract features from the captured image
      const extractionResult = await muzzleMLService.extractFeatures(image.blob);

      // Search ALL registered animals (cloud mode — not just user's own)
      const result = await muzzleSearchService.identifyMuzzle(extractionResult.embedding, {
        mode: 'cloud',
        confidenceThreshold: 0.85,
        maxResults: 3,
        includeAlternatives: false,
        timeoutMs: 15000,
      });

      if (result.status === 'match' && result.animal) {
        setFoundAnimalResult(result.animal);
        toast({
          title: 'Owner Found!',
          description: `This animal belongs to ${result.animal.ownerName || 'a registered farmer'}`,
        });
      } else {
        setFoundError('No registered owner found for this animal. It may not be registered in the system.');
      }
    } catch (error) {
      console.error('Found animal search failed:', error);
      setFoundError('Search failed. Please check your internet connection and try again.');
    } finally {
      setIsSearchingFound(false);
    }
  }, [toast]);

  const handleFoundCaptureError = useCallback((error: MuzzleError) => {
    setFoundError(error.message);
  }, []);

  // ============================================================================
  // History Management
  // ============================================================================

  const loadIdentificationHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await identificationLogger.getIdentificationHistory(20);
      setIdentificationHistory(history);
    } catch (error) {
      console.error('Failed to load identification history:', error);
      toast({
        title: 'History Load Error',
        description: 'Failed to load identification history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  // ============================================================================
  // Navigation
  // ============================================================================

  const handleViewAnimal = useCallback((animalId: string) => {
    navigate(`/animals/${animalId}`);
  }, [navigate]);

  const handleNewCapture = useCallback(() => {
    setCapturedImage(null);
    clearResult();
    setActiveTab('capture');
  }, [clearResult]);

  // ============================================================================
  // Search Mode Selection
  // ============================================================================

  const getRecommendedSearchMode = useCallback((): SearchMode => {
    if (!isOnline) return 'local';
    if (canRunLocally) return 'hybrid';
    return 'cloud';
  }, [isOnline, canRunLocally]);

  useEffect(() => {
    setSearchMode(getRecommendedSearchMode());
  }, [getRecommendedSearchMode]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderConnectionStatus = () => (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      ) : (
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
      {canRunLocally && (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Local ML Ready
        </Badge>
      )}
    </div>
  );

  const renderHistoryItem = (log: MuzzleIdentificationLog) => (
    <Card key={log.id} className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {log.result_status === 'match' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {log.result_status === 'possible_match' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            {log.result_status === 'no_match' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            <div>
              <div className="font-medium">
                {log.result_status.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            {log.confidence_score && (
              <div className="text-sm font-medium">
                {Math.round(log.confidence_score * 100)}% confidence
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {log.search_mode} search
            </div>
          </div>
        </div>
        {log.matched_animal_id && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewAnimal(log.matched_animal_id!)}
            >
              View Animal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Animal Identification</h1>
            <p className="text-muted-foreground">
              Capture and identify animals using muzzle patterns
            </p>
          </div>
          {renderConnectionStatus()}
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Identification will use local data only.
              Results may be limited to previously cached animals.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Capture
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="found" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Found
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Capture Tab */}
        <TabsContent value="capture" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Capture */}
            <div>
              <CameraCapture
                onImageCaptured={handleImageCaptured}
                onError={handleCaptureError}
              />
            </div>

            {/* Settings and Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Identification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Search Mode</label>
                    <Select value={searchMode} onValueChange={(value: SearchMode) => setSearchMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local" disabled={!canRunLocally}>
                          Local Only {canRunLocally ? '' : '(Not Available)'}
                        </SelectItem>
                        <SelectItem value="cloud" disabled={!isOnline}>
                          Cloud Only {isOnline ? '' : '(Offline)'}
                        </SelectItem>
                        <SelectItem value="hybrid" disabled={!isOnline || !canRunLocally}>
                          Hybrid Search {(!isOnline || !canRunLocally) ? '(Not Available)' : ''}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchMode === 'local' && 'Searches only locally cached data'}
                      {searchMode === 'cloud' && 'Searches cloud database (requires internet)'}
                      {searchMode === 'hybrid' && 'Searches both local and cloud for best results'}
                    </p>
                  </div>

                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{progress.message}</span>
                        <span>{progress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>1. Position the camera 30-50cm from the animal's muzzle</p>
                  <p>2. Ensure the muzzle is clearly visible and well-lit</p>
                  <p>3. Hold the camera steady to avoid blur</p>
                  <p>4. Capture the image - identification will start automatically</p>
                  <p>5. Review results and verify animal details</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            {identificationResult ? (
              <IdentificationResults
                result={identificationResult}
                isLoading={isIdentifying}
                onRetry={handleRetryIdentification}
                onViewAnimal={handleViewAnimal}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">No identification results yet</p>
                    <Button onClick={handleNewCapture} className="mt-4">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture New Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {identificationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {identificationError.message}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryIdentification}
                    className="mt-2 ml-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Found Animal Tab */}
        <TabsContent value="found" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera for found animal scan */}
            <div>
              <CameraCapture
                onImageCaptured={handleFoundAnimalCapture}
                onError={handleFoundCaptureError}
              />
            </div>

            {/* Result panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Found an Animal?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>Scan the animal's muzzle to find its registered owner. This works for any animal registered in the system.</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Encrypted and never shared with third parties</span>
                  </div>
                </CardContent>
              </Card>

              {/* Loading state */}
              {isSearchingFound && (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Searching for registered owner...</span>
                  </CardContent>
                </Card>
              )}

              {/* Error state */}
              {foundError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{foundError}</AlertDescription>
                </Alert>
              )}

              {/* Match found — show owner info */}
              {foundAnimalResult && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Owner Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-semibold">{foundAnimalResult.ownerName || 'Registered Farmer'}</p>
                    </div>
                    {foundAnimalResult.ownerPhone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${foundAnimalResult.ownerPhone}`}
                          className="flex items-center gap-2 text-primary font-semibold hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {foundAnimalResult.ownerPhone}
                        </a>
                      </div>
                    )}
                    {foundAnimalResult.farmName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Farm</p>
                        <p>{foundAnimalResult.farmName}</p>
                      </div>
                    )}
                    {foundAnimalResult.location && (
                      <div>
                        <p className="text-xs text-muted-foreground">Region</p>
                        <p>{foundAnimalResult.location}</p>
                      </div>
                    )}
                    {foundAnimalResult.muzzleRegisteredAt && (
                      <div>
                        <p className="text-xs text-muted-foreground">Registered since</p>
                        <p>{new Date(foundAnimalResult.muzzleRegisteredAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3 w-3" />
                      This scan is encrypted and never shared with third parties
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Identification History</span>
                <Button variant="outline" size="sm" onClick={loadIdentificationHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading history...</span>
                </div>
              ) : identificationHistory.length > 0 ? (
                <div className="space-y-2">
                  {identificationHistory.map(renderHistoryItem)}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No identification history yet</p>
                  <p className="text-sm">Your identification attempts will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdentifyAnimalPage;