// src/pages/SimpleScan.tsx - Simplified Quick Scan for Farmers
// Mobile-first, low-literacy friendly, works offline

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { Camera, CheckCircle, XCircle, AlertTriangle, ArrowLeft, RefreshCw, Phone, MapPin, WifiOff, Sun, Focus, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { muzzleLocalMLService } from '@/services/muzzleLocalMLService';
import { muzzleMLService } from '@/services/muzzleMLService';
import { searchOffline } from '@/services/muzzleSearchService';
import { storeMuzzleEmbedding } from '@/utils/muzzleIndexedDB';
import { compressImage } from '@/utils/imageOptimization';
import { toast } from 'sonner';

interface SimpleScanProps {
  mode?: 'verify' | 'found';
}

type ScanStep = 'intro' | 'camera' | 'processing' | 'result';

const SimpleScan = ({ mode = 'verify' }: SimpleScanProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<ScanStep>('intro');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [blurScore, setBlurScore] = useState<number>(100);
  const [overallQuality, setOverallQuality] = useState<number>(100);

  const isFoundMode = mode === 'found';

  // Monitor online/offline status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Start camera on camera step
  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        analyzeLiveQuality();
      }
    } catch (err) {
      toast.error('ካሜራ ማስጀዝ አልተሳካም / Camera failed');
      setError('Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const analyzeLiveQuality = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const checkQuality = () => {
      if (!isStreaming) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate brightness (0-100)
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);
      const brightnessScore = Math.min(100, (avgBrightness / 255) * 100);
      setBrightness(Math.round(brightnessScore));

      // Estimate blur using Laplacian variance
      let laplacianSum = 0;
      let count = 0;
      for (let y = 2; y < canvas.height - 2; y += 2) {
        for (let x = 2; x < canvas.width - 2; x += 2) {
          const idx = (y * canvas.width + x) * 4;
          const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const top = (data[idx - canvas.width * 4] + data[idx - canvas.width * 4 + 1] + data[idx - canvas.width * 4 + 2]) / 3;
          const bottom = (data[idx + canvas.width * 4] + data[idx + canvas.width * 4 + 1] + data[idx + canvas.width * 4 + 2]) / 3;
          const left = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
          const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
          const laplacian = top + bottom + left + right - 4 * center;
          laplacianSum += laplacian * laplacian;
          count++;
        }
      }
      const variance = laplacianSum / count;
      const blur = Math.min(100, Math.max(0, 100 - variance / 20));
      setBlurScore(Math.round(blur));

      // Calculate overall quality (weighted: brightness 30%, sharpness 70%)
      const overall = Math.round(brightnessScore * 0.3 + blur * 0.7);
      setOverallQuality(overall);

      requestAnimationFrame(checkQuality);
    };

    checkQuality();
  }, [isStreaming]);

  const captureAndIdentify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas error');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
      setStep('processing');

      // Compress image
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => b && resolve(b), 'image/jpeg', 0.8);
      });

      // Try local ML first
      let embedding: Float32Array | null = null;
      let isLocal = false;

      if (muzzleLocalMLService.isAvailable()) {
        try {
          const img = await createImageBitmap(blob);
          const localResult = await muzzleLocalMLService.extractFeatures(img);
          embedding = localResult.embedding;
          isLocal = true;
        } catch (localErr) {
          console.warn('Local ML failed:', localErr);
        }
      }

      // Fallback to cloud ML
      if (!embedding && isOnline) {
        try {
          const cloudResult = await muzzleMLService.extractFeatures(blob);
          embedding = cloudResult.embedding?.vector || cloudResult.embedding;
        } catch (cloudErr) {
          console.warn('Cloud ML failed:', cloudErr);
        }
      }

      if (!embedding) {
        throw new Error('Could not extract features');
      }

      // Search for match
      let searchResult: any = null;

      if (isFoundMode) {
        // Search ALL animals (cloud only)
        if (isOnline) {
          const { data, error: rpcError } = await supabase.rpc('search_similar_muzzles', {
            query_embedding: `[${Array.from(embedding as Float32Array)}]`,
            similarity_threshold: 0.85,
            max_results: 1,
          });

          if (!rpcError && data && data.length > 0) {
            const match = data[0];
            const { data: profile } = await supabase
              .from('farm_profiles')
              .select('owner_name, phone, farm_name, location')
              .eq('user_id', match.user_id)
              .single();

            const { data: animal } = await supabase
              .from('animals')
              .select('name, type')
              .eq('id', match.animal_id)
              .single();

            searchResult = {
              found: true,
              confidence: parseFloat(match.similarity),
              animal: animal,
              owner: profile,
              isLocal: false,
            };
          }
        }
      } else {
        // Verify own animals (offline first)
        const offlineResult = await searchOffline(embedding as Float32Array, user.id);
        searchResult = offlineResult;

        if (!offlineResult.found && isOnline) {
          // Try cloud search for own animals
          const { data, error: rpcError } = await supabase.rpc('search_similar_muzzles', {
            query_embedding: `[${Array.from(embedding as Float32Array)}]`,
            similarity_threshold: 0.85,
            max_results: 5,
          });

          if (!rpcError && data && data.length > 0) {
            const ownMatch = data.find((m: any) => m.user_id === user.id);
            if (ownMatch) {
              const { data: animal } = await supabase
                .from('animals')
                .select('name, type, subtype')
                .eq('id', ownMatch.animal_id)
                .single();

              searchResult = {
                found: true,
                confidence: parseFloat(ownMatch.similarity),
                animal: animal,
                isLocal: false,
              };
            }
          }
        }
      }

      setResult(searchResult);
      setStep('result');

    } catch (err: any) {
      console.error('Identification error:', err);
      setError(err.message || 'Identification failed');
      setStep('result');
    } finally {
      setIsCapturing(false);
    }
  }, [user, isOnline, isFoundMode, stopCamera]);

  const handleBack = () => {
    stopCamera();
    if (step === 'result' && result?.found) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const getQualityColor = (value: number) => {
    if (value >= 70) return 'text-green-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (value: number) => {
    if (value >= 70) return <CheckCircle className="w-4 h-4" />;
    if (value >= 40) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  // Render Intro Step
  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col p-4">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isFoundMode ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <span className="text-5xl">{isFoundMode ? '📢' : '📸'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isFoundMode ? 'Found an Animal?' : 'Scan My Animal'}
          </h1>
          <p className="text-gray-600">
            {isFoundMode
              ? 'Scan a muzzle to find the animal\'s owner and help return it home'
              : 'Verify your registered animal by scanning its muzzle'
            }
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>📋</span> How to scan
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <p className="text-gray-700 text-sm">Position the camera 30-50cm from the animal's nose</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <p className="text-gray-700 text-sm">Make sure there's good lighting on the muzzle</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <p className="text-gray-700 text-sm">Hold camera steady and tap the capture button</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="mb-6 bg-amber-50 border-amber-300">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Offline mode:</strong> Can only verify your own registered animals. Go online to search all animals.
            </AlertDescription>
          </Alert>
        )}

        {/* Start Button */}
        <Button
          onClick={() => setStep('camera')}
          className={`w-full h-14 text-lg font-bold ${
            isFoundMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          <Camera className="w-5 h-5 mr-2" />
          Start Scanning
        </Button>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mt-4 text-gray-500 text-sm flex items-center justify-center gap-1 w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );

  // Render Camera Step
  const renderCamera = () => (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur px-4 py-3 flex items-center justify-between z-10">
        <button onClick={handleBack} className="p-2 text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold">
          {isFoundMode ? '📢 Found Animal' : '📸 Scan My Animal'}
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Nose Guide Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-48 border-4 border-white/50 rounded-3xl flex items-center justify-center">
            <div className="text-white/70 text-center">
              <div className="text-4xl mb-2">👃</div>
              <p className="text-sm font-medium">Position nose here</p>
            </div>
          </div>
        </div>

        {/* Live Quality Feedback - Enhanced with MuzzleQualityValidator style */}
        <div className="absolute bottom-24 left-4 right-4">
          <div className="bg-black/70 backdrop-blur rounded-lg p-3">
            {/* Overall Quality Score */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Quality</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${
                  overallQuality >= 70 ? 'text-green-400' :
                  overallQuality >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {overallQuality}%
                </span>
              </div>
            </div>

            {/* Quality Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  overallQuality >= 70 ? 'bg-green-500' :
                  overallQuality >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${overallQuality}%` }}
              />
            </div>

            {/* Guidance Message */}
            <div className={`text-center py-1 px-2 rounded mb-2 ${
              overallQuality >= 70 ? 'bg-green-500/20' :
              overallQuality >= 40 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              <p className={`text-xs ${
                overallQuality >= 70 ? 'text-green-300' :
                overallQuality >= 40 ? 'text-yellow-300' : 'text-red-300'
              }`}>
                {overallQuality >= 70 ? '✓ Ready to capture' :
                 overallQuality >= 40 ? '⚠️ Adjust position' : '❌ Need better conditions'}
              </p>
            </div>

            {/* Quick Status Indicators */}
            <div className="flex justify-center gap-4">
              <div className="flex flex-col items-center">
                <Sun className={`w-4 h-4 ${brightness >= 60 ? 'text-green-400' : brightness >= 40 ? 'text-yellow-400' : 'text-red-400'}`} />
                <span className="text-white/60 text-xs mt-1">{brightness >= 60 ? '✓' : brightness >= 40 ? '⚠' : '✗'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Focus className={`w-4 h-4 ${blurScore >= 70 ? 'text-green-400' : blurScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`} />
                <span className="text-white/60 text-xs mt-1">{blurScore >= 70 ? '✓' : blurScore >= 50 ? '⚠' : '✗'}</span>
              </div>
              {!isOnline && (
                <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Capture Button */}
      <div className="bg-black p-6 flex justify-center">
        <button
          onClick={captureAndIdentify}
          disabled={!isStreaming || isCapturing}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isCapturing
              ? 'bg-gray-500'
              : isFoundMode
              ? 'bg-red-600 hover:bg-red-700 active:scale-95'
              : 'bg-green-600 hover:bg-green-700 active:scale-95'
          } text-white`}
        >
          {isCapturing ? (
            <RefreshCw className="w-8 h-8 animate-spin" />
          ) : (
            <Camera className="w-10 h-10" />
          )}
        </button>
      </div>
    </div>
  );

  // Render Processing Step
  const renderProcessing = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-600/20 flex items-center justify-center">
          <RefreshCw className="w-10 h-10 text-green-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {isFoundMode ? 'Searching for owner...' : 'Identifying animal...'}
        </h2>
        <p className="text-gray-400">
          Analyzing muzzle pattern
        </p>
      </div>
    </div>
  );

  // Render Result Step
  const renderResult = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-4">
        <button onClick={() => { setStep('intro'); setResult(null); setError(null); }} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">
          {isFoundMode ? 'Search Result' : 'Verification Result'}
        </h1>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-300">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {!result && !error && (
          <Card className="mb-4">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Match Found</h3>
              <p className="text-gray-600 text-sm">
                {isFoundMode
                  ? 'This animal is not registered in the system.'
                  : 'This muzzle does not match any of your registered animals.'
                }
                {!isOnline && ' Try again when online for better results.'}
              </p>
            </CardContent>
          </Card>
        )}

        {result?.found && (
          <div className="space-y-4">
            {/* Success Card */}
            <Card className={`border-2 ${isFoundMode ? 'border-green-500 bg-green-50' : 'border-green-500 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800">
                      {isFoundMode ? 'Owner Found!' : 'Animal Verified!'}
                    </h3>
                    <p className="text-sm text-green-700">
                      {Math.round(result.confidence * 100)}% match
                    </p>
                  </div>
                </div>

                {/* Animal Info */}
                {result.animal && (
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Animal</p>
                    <p className="font-semibold text-gray-800">
                      {result.animal.name || 'Unknown'} ({result.animal.type})
                    </p>
                  </div>
                )}

                {/* Owner Info (Found Mode) */}
                {isFoundMode && result.owner && (
                  <div className="space-y-3 bg-white rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <p className="font-semibold text-gray-800">{result.owner.owner_name || 'Registered Farmer'}</p>
                    </div>
                    {result.owner.phone && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <a
                          href={`tel:${result.owner.phone}`}
                          className="flex items-center gap-2 text-green-700 font-semibold"
                        >
                          <Phone className="w-4 h-4" />
                          {result.owner.phone}
                        </a>
                      </div>
                    )}
                    {result.owner.farm_name && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Farm</p>
                        <p className="text-gray-700">{result.owner.farm_name}</p>
                      </div>
                    )}
                    {result.owner.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{result.owner.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <Card className="mb-4">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 mb-2">Captured Image</p>
              <img src={capturedImage} alt="Captured muzzle" className="w-full h-32 object-cover rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Try Again Button */}
        <Button
          onClick={() => { setStep('intro'); setResult(null); setError(null); setCapturedImage(null); }}
          variant="outline"
          className="w-full h-12"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Scan Again
        </Button>
      </div>
    </div>
  );

  // Main Render
  return (
    <>
      {step === 'intro' && renderIntro()}
      {step === 'camera' && renderCamera()}
      {step === 'processing' && renderProcessing()}
      {step === 'result' && renderResult()}
    </>
  );
};

export { SimpleScan };
export default SimpleScan;