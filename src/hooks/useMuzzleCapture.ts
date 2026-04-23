import { useState, useCallback, useRef, useEffect } from 'react';
import { muzzleMLService, type QualityCheckResult, type CropInfo } from '@/services/muzzleMLService';

export interface MuzzleCaptureResult {
  imageDataUrl: string;
  embedding: number[];
  quality: QualityCheckResult;
  cropInfo: CropInfo;
}

export interface UseMuzzleCaptureReturn {
  isStreaming: boolean;
  isCapturing: boolean;
  quality: QualityCheckResult | null;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capture: () => Promise<MuzzleCaptureResult | null>;
  retryCapture: () => void;
}

const GUIDE_RECT = {
  x: 0.15,
  y: 0.1,
  width: 0.7,
  height: 0.6,
};

export const useMuzzleCapture = (): UseMuzzleCaptureReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [quality, setQuality] = useState<QualityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<MuzzleCaptureResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize ML service
  useEffect(() => {
    muzzleMLService.initialize().catch(err => {
      console.error('Failed to initialize ML service:', err);
      setError(err.message || 'Failed to initialize camera');
    });

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);

        // Start quality monitoring
        monitorQuality();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or unavailable');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setQuality(null);
  }, []);

  const monitorQuality = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const checkQuality = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = 224;
        canvas.height = 224;

        // Draw centered crop based on guide
        const sx = video.videoWidth * GUIDE_RECT.x;
        const sy = video.videoHeight * GUIDE_RECT.y;
        const sw = video.videoWidth * GUIDE_RECT.width;
        const sh = video.videoHeight * GUIDE_RECT.height;

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 224, 224);
        
        try {
          const imageData = ctx.getImageData(0, 0, 224, 224);
          const result = muzzleMLService.qualityCheck(imageData);
          setQuality(result);
        } catch (err) {
          // Ignore quality check errors during monitoring
        }
      }

      if (streamRef.current) {
        animationRef.current = requestAnimationFrame(checkQuality);
      }
    };

    checkQuality();
  }, []);

  const capture = useCallback(async (): Promise<MuzzleCaptureResult | null> => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready');
      return null;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Capture at guide area
      const sx = video.videoWidth * GUIDE_RECT.x;
      const sy = video.videoHeight * GUIDE_RECT.y;
      const sw = video.videoWidth * GUIDE_RECT.width;
      const sh = video.videoHeight * GUIDE_RECT.height;

      canvas.width = 224;
      canvas.height = 224;
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 224, 224);

      // Get quality
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const qualityResult = muzzleMLService.qualityCheck(imageData);

      // Get embedding
      const embedding = await muzzleMLService.generateEmbedding(canvas);

      // Get data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const result: MuzzleCaptureResult = {
        imageDataUrl,
        embedding: Array.from(embedding),
        quality: qualityResult,
        cropInfo: {
          x: sx,
          y: sy,
          width: sw,
          height: sh,
        },
      };

      setLastResult(result);
      setQuality(qualityResult);
      
      // Stop camera after capture
      stopCamera();

      return result;
    } catch (err) {
      console.error('Capture error:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [stopCamera]);

  const retryCapture = useCallback(() => {
    setLastResult(null);
    setQuality(null);
    startCamera();
  }, [startCamera]);

  return {
    isStreaming,
    isCapturing,
    quality,
    error,
    videoRef: videoRef as any,
    canvasRef: canvasRef as any,
    startCamera,
    stopCamera,
    capture,
    retryCapture,
  };
};

export default useMuzzleCapture;
