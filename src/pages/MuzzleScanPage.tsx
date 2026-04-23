import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { muzzleMLService } from '@/services/muzzleMLService';
import { useMuzzleCapture } from '@/hooks/useMuzzleCapture';
import { searchOffline, SimpleSearchResult } from '@/services/muzzleSearchService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Search,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface MatchResult {
  id: string;
  animal_id: string;
  animal_name: string;
  animal_type: string;
  similarity: number;
  image_url: string | null;
  capture_date: string | null;
  confirmed_match: boolean | null;
}

const MuzzleScanPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const [step, setStep] = useState<'instructions' | 'capture' | 'processing' | 'results'>('instructions');
  const [captureResult, setCaptureResult] = useState<any>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [mlReady, setMlReady] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSearchResult, setOfflineSearchResult] = useState<SimpleSearchResult | null>(null);
  const [hasLocalData, setHasLocalData] = useState(false);

  const {
    isStreaming,
    isCapturing,
    quality,
    error: cameraError,
    videoRef,
    startCamera,
    stopCamera,
    capture,
    retryCapture,
  } = useMuzzleCapture();

  // Initialize ML service
  useEffect(() => {
    const initML = async () => {
      try {
        await muzzleMLService.initialize();
        setMlReady(true);
      } catch (err: any) {
        console.error('ML init failed:', err);
        setMlError(err.message || 'ML model unavailable');
      }
    };
    initML();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if we have local data available
  useEffect(() => {
    const checkLocalData = async () => {
      try {
        const { getAllMuzzleEmbeddings } = await import('@/utils/muzzleIndexedDB');
        const embeddings = await getAllMuzzleEmbeddings(user?.id || '');
        setHasLocalData(embeddings && embeddings.length > 0);
      } catch {
        setHasLocalData(false);
      }
    };
    if (user?.id) checkLocalData();
  }, [user?.id]);

  // Translations
  const t = {
    en: {
      title: 'Muzzle Scan',
      instructions: 'How to capture a good muzzle image',
      step1: 'Position the animal\'s nose in the center',
      step2: 'Ensure good lighting (natural daylight best)',
      step3: 'Keep the camera steady',
      step4: 'Full muzzle visible (nose to mouth)',
      startScan: 'Start Scanning',
      capturing: 'Position muzzle in frame',
      qualityGood: 'Quality good - ready to capture',
      qualityBad: 'Adjust position: ',
      capture: 'Capture',
      processing: 'Analyzing muzzle pattern...',
      searchingHerd: 'Searching herd...',
      results: 'Search Results',
      noMatches: 'No close match found',
      noMatchesDesc: 'This muzzle pattern is not similar to any registered animals.',
      registerNew: 'Register as new?',
      veryLikely: 'Very likely same cow',
      possibleMatch: 'Possible match',
      noMatch: 'No close match',
      isThisSame: 'Is this the same animal?',
      yes: 'Yes, this is the same',
      no: 'No, different animal',
      confirmSuccess: 'Match confirmed!',
      confirmNotMatch: 'Noted - different animal',
      backToAnimals: 'Back to Animals',
      mlError: 'ML model unavailable',
      mlErrorDesc: 'Please check your internet connection and refresh.',
      refresh: 'Refresh',
      offlineMode: 'Offline Mode',
      offlineDesc: 'Searching locally stored data',
      onlineMode: 'Online Mode',
      onlineDesc: 'Full database search available',
      searchOffline: 'Search Offline',
      searchOnline: 'Search Online',
      noLocalData: 'No animals registered locally',
      registerFirst: 'Register your animals first',
      offlineFound: 'Found your animal!',
      offlinePossible: 'Possible match - go online to verify',
    },
    am: {
      title: 'አፍንጫ ስካን',
      instructions: 'ጥሩ አፍንጫ ምስል እንዴት መያዝ',
      step1: 'አፍንጫውን በመሃሉ ያስቀምጡ',
      step2: 'ጥሩ ብርሃን ያስበትህ',
      step3: 'ካሜራውን ይረጋጉ',
      step4: 'ሙሉው አፍንጫ ይታይ',
      startScan: 'ስካን ጀምር',
      capturing: 'አፍንጫውን በስንት ያስቀምጡ',
      qualityGood: 'ጥሩ ጥራት - ለመያዝ ዝግጁ',
      qualityBad: 'አቀማመጥን ይቀይሩ: ',
      capture: 'ተይዝ',
      processing: 'አፍንጫ ምስል በይነተገናኝ...',
      searchingHerd: 'ስፍራውን...',
      results: 'ውጤቶች',
      noMatches: 'ተመሳሳይ አልተገኘም',
      noMatchesDesc: 'ይህ አፍንጫ ለምንም የተመዘገቡ እንስሳት የሚመሳስል አለም።',
      registerNew: 'አዲስ ይመዝገብ?',
      veryLikely: 'በጣም የሚመሳስል',
      possibleMatch: 'ሊሆን ይችላል',
      noMatch: 'ተመሳሳይ አለላህ',
      isThisSame: 'ይህ ተመሳሳይ እንስሳው ነው?',
      yes: 'አዎ፣ ተመሳሳይ ነው',
      no: 'አላት፣ የተለየ እንስሳው ነው',
      confirmSuccess: 'ተመሳሳይነት ተረጋግጧል!',
      confirmNotMatch: 'ታውቋል - የተለየ እንስሳው',
      backToAnimals: 'ወደ እንስሳት',
      mlError: 'ሞዴል አልተገኘም',
      mlErrorDesc: 'ኢንተርኔትዎን ይፈትሹ እና ያድሱ።',
      refresh: 'ያድሱ',
      offlineMode: 'የማይገኝ ሁኔታ',
      offlineDesc: 'በስማር ውሂብ ፍለጋ',
      onlineMode: 'በበይነመረብ',
      onlineDesc: 'ሙሉ ዳታቤዝ ፍለጋ ይጀምራል',
      searchOffline: 'ስማር ፍለጋ',
      searchOnline: 'በበይነመረብ ፍለጋ',
      noLocalData: 'በስማር የተመዘገቡ እንስሳት � n/a',
      registerFirst: 'እንስሳትን ይመዝግቡ',
      offlineFound: 'እንስሳው ተገኘ!',
      offlinePossible: 'ሊሆን ይችላል - ይሂዱ ይረጋግጡ',
    },
    or: {
      title: 'Mukii Scan',
      instructions: 'Mukiiwwan marii kamiyyuu qabachuu',
      step1: 'Abbuniwwan navii kkf keessaa saamii',
      step2: 'Bishaan tokko sirraa qabachuu (bishaan dabalataa)',
      step3: 'Kameraa hawwii',
      step4: 'Mukiiwwan hunda ibsa',
      startScan: 'Scan Bilisa',
      capturing: 'Mukiiwwan galmee keessaa qabachuu',
      qualityGood: 'Qualtii gaarii - qabachufi oolchi',
      qualityBad: 'Agarsiisa: ',
      capture: 'Qabii',
      processing: 'Mukiiwwan进行分析...',
      searchingHerd: 'Herd...',
      results: 'Bu\'ootni',
      noMatches: 'Walii galtaa argamuu jun',
      noMatchesDesc: 'Mukii kun животных ማመሳሰያ አለው',
      registerNew: 'Mee waa\'ee?',
      veryLikely: 'Yeroo baay\'ee wajjin wal isa',
      possibleMatch: 'Waliin jiraachu danda\'a',
      noMatch: 'Waliin hinjirre',
      isThisSame: 'Kun isa animalicha?',
      yes: 'Eeyyee, kun isa',
      no: 'Lakki, kun kan biroo',
      confirmSuccess: 'Walii gochuu ni mari!',
      confirmNotMatch: 'Kan birootaa jedhameera',
      backToAnimals: 'Maatii deebi\'ii',
      mlError: 'Mudellich funaanuu',
      mlErrorDesc: 'Internet keenya jijjiiruu naaf laali.',
      refresh: 'Jijjiiri',
    },
    sw: {
      title: 'Mfuo wa Mdomo',
      instructions: 'Jinsi ya kuchukua picha bora ya mfuo',
      step1: 'Weka mdomo wa ng\'ombe katikati',
      step2: 'Hakikisha mwanga mzuri (mwanga wa asili bora)',
      step3: 'Kamera weka imara',
      step4: 'Mfuo wote uonekane',
      startScan: 'Anza Kuchimba',
      capturing: 'Weka mfuo kwenye fremu',
      qualityGood: 'Ubora nzuri - tayari kuchukua',
      qualityBad: 'Badilisha nafasi: ',
      capture: 'Chukua',
      processing: 'Kuchambua muundo wa mfuo...',
      searchingHerd: 'Inatafuta kundi...',
      results: 'Matokeo',
      noMatches: 'Hakuna alama ya karibu',
      noMatchesDesc: 'Mfuo huu hafanani na wanyama waliosajiliwa.',
      registerNew: 'Sajili mpya?',
      veryLikely: 'Inaonekana sana ng\'ombe sawa',
      possibleMatch: 'Inaweza kuwa mechi',
      noMatch: 'Hakuna mechi',
      isThisSame: 'Hii ni ng\'ombe sawa?',
      yes: 'Ndiyo, hiyo ndiyo',
      no: 'Hapana, ng\'ombe tofauti',
      confirmSuccess: 'Mechi imethibitishwa!',
      confirmNotMatch: 'Imebainika - ng\'ombe tofauti',
      backToAnimals: 'Rudi kwa Wanyama',
      mlError: 'Mfano wa ML haupatikani',
      mlErrorDesc: 'Tafadhali angalia muunganisho wako wa intaneti.',
      refresh: 'Onyesha tena',
    },
  };

  const tr = language === 'am' ? t.am : language === 'or' ? t.or : language === 'sw' ? t.sw : t.en;

  const handleStartScan = useCallback(async () => {
    await startCamera();
    setStep('capture');
  }, [startCamera]);

  const handleCapture = useCallback(async () => {
    const result = await capture();
    if (result) {
      setCaptureResult(result);
      
      // Check if coming from registration - return directly
      const fromRegistration = (location.state as { fromRegistration?: boolean })?.fromRegistration;
      
      if (fromRegistration) {
        // Return to registration with muzzle data
        navigate('/register-animal', {
          state: {
            muzzleImage: result.imageDataUrl,
            muzzleEmbedding: result.embedding,
          },
          replace: true,
        });
        return;
      }
      
      // Normal flow - continue with search
      setStep('processing');
      await searchMuzzle(result.embedding);
    }
  }, [capture, navigate, location.state]);

  const searchMuzzle = async (embedding: number[]) => {
    if (!user) return;
    
    setIsSearching(true);
    setSearchError(null);
    setOfflineSearchResult(null);

    // OFFLINE SEARCH - Use locally stored embeddings when offline
    if (!isOnline && hasLocalData) {
      try {
        const result = await searchOffline(new Float32Array(embedding), user.id);
        setOfflineSearchResult(result);
      } catch (err) {
        console.error('Offline search failed:', err);
        setSearchError('Offline search failed');
      } finally {
        setIsSearching(false);
        setStep('results');
      }
      return;
    }

    // NO NETWORK AND NO LOCAL DATA
    if (!isOnline && !hasLocalData) {
      setOfflineSearchResult({
        found: false,
        confidence: 0,
        searchTimeMs: 0,
        searchedOnline: false,
        message: tr.noLocalData + '. ' + tr.registerFirst,
      });
      setIsSearching(false);
      setStep('results');
      return;
    }

    // ONLINE SEARCH - Use Supabase pgvector

    try {
       // Call RPC function to search embeddings
       const { data, error } = await supabase.rpc('match_muzzle_embeddings', {
         query_embedding: Array.from(embedding),
         match_threshold: 0.5,
         match_count: 5,
       });

      if (error) {
        console.error('Search error:', error);
        // Try alternative: fetch all and calculate locally
        const { data: embeddings } = await (supabase as any)
          .from('muzzle_embeddings')
          .select('id, animal_id, embedding, animal:animals(name, type, photo_url)')
          .eq('user_id', user.id)
          .eq('is_primary', true);

        if (embeddings && embeddings.length > 0) {
           const results = embeddings.map((e: any) => ({
             id: e.id || '',
             animal_id: e.animal_id,
             animal_name: e.animal?.name || 'Unknown',
             animal_type: e.animal?.type || 'unknown',
             similarity: calculateCosineSimilarity(embedding, e.embedding),
             image_url: e.animal?.photo_url || null,
             capture_date: e.capture_date || null,
             confirmed_match: null,
           }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

          setMatches(results);
        } else {
          setMatches([]);
        }
      } else if (data) {
        setMatches(data);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('Search failed. Please try again.');
      setMatches([]);
    } finally {
      setIsSearching(false);
      setStep('results');
    }
  };

  const calculateCosineSimilarity = (a: number[], b: number[]): number => {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const handleConfirmMatch = async (match: MatchResult, isSame: boolean) => {
    if (!user) return;
    
    setIsConfirming(true);
    try {
      await (supabase as any)
        .from('muzzle_embeddings')
        .update({
          confirmed_match: isSame,
          confirmed_by: user.id,
          confirmed_at: new Date().toISOString(),
        })
        .eq('animal_id', match.animal_id)
        .eq('user_id', user.id);

      if (isSame) {
        alert(tr.confirmSuccess);
      } else {
        alert(tr.confirmNotMatch);
      }
      
      if (captureResult) {
        await searchMuzzle(captureResult.embedding);
      }
    } catch (err) {
      console.error('Confirm failed:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRegisterNew = () => {
    navigate('/register-animal', { state: { muzzleImage: captureResult?.imageDataUrl } });
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity > 0.82) return 'bg-green-100 text-green-800 border-green-300';
    if (similarity > 0.65) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity > 0.82) return tr.veryLikely;
    if (similarity > 0.65) return tr.possibleMatch;
    return tr.noMatch;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{tr.title}</h1>
        </div>
      </div>

      {/* Network Status Banner */}
      {!isOnline && !mlError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm text-amber-800 font-medium">{tr.offlineMode}</span>
            </div>
            <span className="text-xs text-amber-600">{tr.offlineDesc}</span>
          </div>
        </div>
      )}

      {/* Online indicator */}
      {isOnline && !mlError && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700 font-medium">{tr.onlineMode}</span>
          </div>
        </div>
      )}

      {/* ML Error */}
      {mlError && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">{tr.mlError}</p>
            <p className="text-sm">{mlError}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              {tr.refresh}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      {step === 'instructions' && !mlError && (
        <div className="p-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">{tr.instructions}</h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium">1</span>
                  <span>{tr.step1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium">2</span>
                  <span>{tr.step2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium">3</span>
                  <span>{tr.step3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium">4</span>
                  <span>{tr.step4}</span>
                </li>
              </ul>
              
              {/* ML Model Loading Status */}
              {!mlReady && !mlError && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Loading ML model...</span>
                </div>
              )}
              
              <Button 
                onClick={handleStartScan} 
                className="w-full" 
                size="lg"
                disabled={!mlReady || !!mlError}
              >
                <Camera className="w-5 h-5 mr-2" />
                {mlError ? tr.mlError : tr.startScan}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Capture */}
      {step === 'capture' && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-[60vh] object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute border-2 border-white/70 rounded-2xl mx-8 mt-8"
              style={{
                left: '15%',
                top: '10%',
                width: '70%',
                height: '60%',
              }}
            >
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50" />
                </div>
              </div>
            </div>
          </div>

           {/* Quality indicator */}
           <div className="absolute bottom-4 left-4 right-4">
             {quality && (
               <div className={`px-4 py-2 rounded-lg text-center text-sm font-medium ${
                 quality.isAcceptable 
                   ? 'bg-green-500 text-white' 
                   : 'bg-red-500 text-white'
               }`}>
                 {quality.isAcceptable ? tr.qualityGood : tr.qualityBad}
               </div>
             )}
           </div>

          {/* Capture button */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
            <Button
              onClick={handleCapture}
              disabled={!quality?.isGood || isCapturing}
              size="lg"
              className="rounded-full w-16 h-16"
            >
              {isCapturing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Back button */}
          <button
            onClick={() => { stopCamera(); setStep('instructions'); }}
            className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
          <p className="text-lg font-medium">{tr.processing}</p>
          <p className="text-sm text-gray-500">{tr.searchingHerd}</p>
        </div>
      )}

      {/* Results */}
      {step === 'results' && (
        <div className="p-4">
          <h2 className="font-semibold mb-4">{tr.results}</h2>
          
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>{tr.searchingHerd}</span>
            </div>
          ) : offlineSearchResult ? (
            /* OFFLINE SEARCH RESULTS */
            <Card className={offlineSearchResult.found ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}>
              <CardContent className="py-6">
                <div className="text-center">
                  {offlineSearchResult.found ? (
                    <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 mx-auto text-amber-600 mb-3" />
                  )}
                  <h3 className="font-semibold text-lg mb-1">
                    {offlineSearchResult.found ? tr.offlineFound : tr.offlinePossible}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{offlineSearchResult.message}</p>
                  
                  {offlineSearchResult.found && offlineSearchResult.animalName && (
                    <div className="bg-white rounded-lg p-3 mb-4">
                      <p className="font-medium">{offlineSearchResult.animalName}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round(offlineSearchResult.confidence * 100)}% match
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mb-4">
                    Search time: {offlineSearchResult.searchTimeMs.toFixed(0)}ms (Offline)
                  </div>

                  {isOnline && (
                    <Button 
                      onClick={() => {
                        setOfflineSearchResult(null);
                        setStep('capture');
                      }}
                      className="w-full"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {tr.searchOnline}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match, idx) => (
                <Card key={idx} className={`${getSimilarityColor(match.similarity)}`}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {match.image_url ? (
                          <img src={match.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{match.animal_name}</p>
                        <p className="text-sm capitalize">{match.animal_type}</p>
                        <p className="text-sm">
                          {Math.round(match.similarity * 100)}% {getSimilarityLabel(match.similarity)}
                        </p>
                      </div>
                    </div>

                    {/* Confirmation buttons */}
                    {idx === 0 && match.similarity > 0.65 && !match.confirmed_match && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">{tr.isThisSame}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleConfirmMatch(match, true)}
                            disabled={isConfirming}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {tr.yes}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmMatch(match, false)}
                            disabled={isConfirming}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {tr.no}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="font-medium mb-2">{tr.noMatches}</p>
                <p className="text-sm text-gray-500 mb-4">{tr.noMatchesDesc}</p>
                <Button onClick={handleRegisterNew}>
                  {tr.registerNew}
                </Button>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => { setStep('instructions'); setMatches([]); }}
          >
            {tr.backToAnimals}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MuzzleScanPage;
