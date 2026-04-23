/**
 * MuzzleCaptureCamera Component
 * Camera component for capturing cattle muzzle images with guide overlay
 * Requirements: 1.1, 1.2, 1.8, 1.12
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, RotateCcw, Zap, ZapOff, FlipHorizontal } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { CapturedImage, ImageMetadata } from '@/types/muzzle';
import { MuzzleQualityValidator, QualityAssessment } from './MuzzleQualityValidator';
import { MuzzleCaptureGuide } from './MuzzleCaptureGuide';
import { v4 as uuidv4 } from 'uuid';

interface MuzzleCaptureCameraProps {
  onCapture: (images: CapturedImage[]) => void;
  onCancel: () => void;
  mode: 'registration' | 'identification';
  burstCount?: number;
  showGuide?: boolean;
}

type CameraFacing = 'user' | 'environment';

export const MuzzleCaptureCamera: React.FC<MuzzleCaptureCameraProps> = ({
  onCapture,
  onCancel,
  mode,
  burstCount = 3,
  showGuide = true,
}) => {
  const { t } = useTranslations();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // State
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacing>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [currentQuality, setCurrentQuality] = useState<QualityAssessment | null>(null);
  const [showGuideOverlay, setShowGuideOverlay] = useState(showGuide);
  const [burstProgress, setBurstProgress] = useState(0);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 16 / 9 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check torch support
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities?.() as any;
      setTorchSupported(capabilities?.torch === true);

      setIsInitializing(false);
    } catch (error) {
      console.error('Camera initialization error:', error);
      
      let errorMessage = t('muzzle.cameraError');
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = t('muzzle.cameraAccessDenied');
        } else if (error.name === 'NotFoundError') {
          errorMessage = t('muzzle.cameraNotFound');
        } else if (error.name === 'NotReadableError') {
          errorMessage = t('muzzle.cameraInUse');
        }
      }
      
      setCameraError(errorMessage);
      setIsInitializing(false);
    }
  }, [facingMode, t]);

  // Toggle torch/flash
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !torchSupported) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      await videoTrack.applyConstraints({
        advanced: [{ torch: !torchEnabled } as any],
      });
      setTorchEnabled(!torchEnabled);
    } catch (error) {
      console.error('Torch toggle error:', error);
    }
  }, [torchEnabled, torchSupported]);

  // Switch camera facing
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Capture single frame
  const captureFrame = useCallback((): CapturedImage | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image data for quality analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Calculate quality metrics
    const metadata = analyzeImageQuality(imageData, canvas.width, canvas.height);

    // Convert to blob
    return new Promise<CapturedImage>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null as any);
          return;
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        resolve({
          id: uuidv4(),
          blob,
          dataUrl,
          timestamp: Date.now(),
          metadata,
        });
      }, 'image/jpeg', 0.9);
    }) as any;
  }, []);

  // Analyze image quality
  const analyzeImageQuality = (
    imageData: ImageData,
    width: number,
    height: number
  ): ImageMetadata => {
    const data = imageData.data;
    let totalBrightness = 0;
    let edgeSum = 0;
    
    // Calculate brightness
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    const brightness = Math.min(100, (avgBrightness / 255) * 100);

    // Simple blur detection using edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;
        
        const gx = Math.abs(data[idx] - data[left]) + Math.abs(data[idx] - data[right]);
        edgeSum += gx;
      }
    }
    const avgEdge = edgeSum / ((width - 2) * (height - 2));
    const blur = Math.max(0, 100 - avgEdge * 2); // Higher blur = less sharp

    // Estimate distance based on expected muzzle size in frame
    // This is a simplified heuristic
    const distance: 'too_close' | 'optimal' | 'too_far' = 
      width > 1500 ? 'optimal' : width > 1000 ? 'too_far' : 'too_close';

    // Determine lighting quality
    const lighting: 'poor' | 'acceptable' | 'good' = 
      brightness < 30 ? 'poor' : brightness < 50 ? 'acceptable' : 'good';

    return {
      width,
      height,
      brightness,
      blur,
      distance,
      lighting,
      motion: false, // Will be updated by motion detection
    };
  };

  // Burst capture mode
  const handleBurstCapture = useCallback(async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setBurstProgress(0);
    const images: CapturedImage[] = [];

    for (let i = 0; i < burstCount; i++) {
      setBurstProgress(i + 1);
      
      const image = await captureFrame();
      if (image) {
        images.push(image);
      }

      // Small delay between captures
      if (i < burstCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setCapturedImages(images);
    setIsCapturing(false);
    setBurstProgress(0);

    if (images.length > 0) {
      onCapture(images);
    }
  }, [burstCount, captureFrame, isCapturing, onCapture]);

  // Single capture
  const handleSingleCapture = useCallback(async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    const image = await captureFrame();
    setIsCapturing(false);

    if (image) {
      setCapturedImages([image]);
      onCapture([image]);
    }
  }, [captureFrame, isCapturing, onCapture]);

  // Real-time quality assessment
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || isInitializing) return;

    const assessQuality = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Use smaller canvas for performance
      const scale = 0.25;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const metadata = analyzeImageQuality(imageData, canvas.width, canvas.height);

      setCurrentQuality({
        brightness: metadata.brightness,
        sharpness: 100 - metadata.blur,
        distance: metadata.distance,
        lighting: metadata.lighting,
        motion: metadata.motion,
        overall: calculateOverallScore(metadata),
      });

      animationFrameRef.current = requestAnimationFrame(assessQuality);
    };

    animationFrameRef.current = requestAnimationFrame(assessQuality);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitializing]);

  // Calculate overall quality score
  const calculateOverallScore = (metadata: ImageMetadata): number => {
    const brightnessScore = metadata.brightness;
    const sharpnessScore = 100 - metadata.blur;
    const distanceScore = metadata.distance === 'optimal' ? 100 : 
                          metadata.distance === 'too_far' ? 60 : 40;
    const lightingScore = metadata.lighting === 'good' ? 100 :
                          metadata.lighting === 'acceptable' ? 70 : 30;

    return Math.round(
      (brightnessScore * 0.25) +
      (sharpnessScore * 0.35) +
      (distanceScore * 0.25) +
      (lightingScore * 0.15)
    );
  };

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeCamera]);

  // Render error state
  if (cameraError) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {t('muzzle.cameraErrorTitle')}
            </h3>
            <p className="text-gray-600 mt-1">{cameraError}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={initializeCamera}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('common.tryAgain')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-black rounded-lg overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p>{t('muzzle.initializingCamera')}</p>
          </div>
        </div>
      )}

      {/* Circular guide overlay */}
      {!isInitializing && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Semi-transparent overlay with circular cutout */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <mask id="muzzle-guide-mask">
                <rect width="100" height="100" fill="white" />
                <circle cx="50" cy="45" r="28" fill="black" />
              </mask>
            </defs>
            <rect 
              width="100" 
              height="100" 
              fill="rgba(0,0,0,0.5)" 
              mask="url(#muzzle-guide-mask)" 
            />
            {/* Guide circle border */}
            <circle 
              cx="50" 
              cy="45" 
              r="28" 
              fill="none" 
              stroke={currentQuality && currentQuality.overall >= 70 ? '#22c55e' : '#fbbf24'}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          </svg>

          {/* Positioning text */}
          <div className="absolute top-4 left-0 right-0 text-center">
            <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
              {t('muzzle.positionMuzzleInCircle')}
            </p>
          </div>
        </div>
      )}

      {/* Quality indicator */}
      {currentQuality && !isInitializing && (
        <MuzzleQualityValidator quality={currentQuality} />
      )}

      {/* Guide overlay */}
      {showGuideOverlay && !isInitializing && (
        <MuzzleCaptureGuide 
          onDismiss={() => setShowGuideOverlay(false)}
          quality={currentQuality}
        />
      )}

      {/* Burst progress indicator */}
      {isCapturing && burstProgress > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white/90 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold text-green-600">
              {burstProgress}/{burstCount}
            </span>
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          {/* Cancel button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Capture button */}
          <Button
            onClick={mode === 'registration' ? handleBurstCapture : handleSingleCapture}
            disabled={isCapturing || isInitializing}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            <div className={`w-12 h-12 rounded-full border-4 border-gray-800 ${
              isCapturing ? 'bg-red-500' : 'bg-white'
            }`} />
          </Button>

          {/* Right side controls */}
          <div className="flex gap-2">
            {/* Torch toggle */}
            {torchSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTorch}
                className="text-white hover:bg-white/20"
              >
                {torchEnabled ? (
                  <Zap className="w-6 h-6 text-yellow-400" />
                ) : (
                  <ZapOff className="w-6 h-6" />
                )}
              </Button>
            )}

            {/* Camera switch */}
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              className="text-white hover:bg-white/20"
            >
              <FlipHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Capture mode indicator */}
        <div className="text-center mt-2">
          <span className="text-white/80 text-xs">
            {mode === 'registration' 
              ? t('muzzle.burstCaptureMode').replace('{{count}}', String(burstCount))
              : t('muzzle.singleCaptureMode')
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default MuzzleCaptureCamera;
