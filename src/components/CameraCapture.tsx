/**
 * CameraCapture Component
 * Handles camera access and muzzle image capture for animal identification
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, RotateCcw, Zap, ZapOff } from 'lucide-react';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';
import { useToast } from '@/hooks/use-toast';
import { CapturedImage, ImageMetadata, MuzzleError, MuzzleErrorCode } from '@/types/muzzle';
import { logger } from '@/utils/logger';

interface CameraCaptureProps {
  onImageCaptured: (image: CapturedImage) => void;
  onError: (error: MuzzleError) => void;
  disabled?: boolean;
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onImageCaptured,
  onError,
  disabled = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [error, setError] = useState<MuzzleError | null>(null);

  const { deviceCapability } = useDeviceCapability();
  const { toast } = useToast();

  // ============================================================================
  // Camera Management
  // ============================================================================

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);

        // Check for torch support
        checkTorchSupport(stream);
      }

      logger.info('Camera started successfully', { facingMode });
    } catch (err) {
      const muzzleError: MuzzleError = {
        code: MuzzleErrorCode.CAMERA_ACCESS_DENIED,
        message: 'Failed to access camera',
        messageAm: 'ካሜራ መስጠት አልተሳካም',
        retryable: true,
      };

      setError(muzzleError);
      onError(muzzleError);
      logger.error('Camera access failed', err);
    }
  }, [facingMode, onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setTorchSupported(false);
    setTorchEnabled(false);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // ============================================================================
  // Torch/Flashlight Control
  // ============================================================================

  const checkTorchSupport = useCallback(async (stream: MediaStream) => {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      const capabilities = videoTrack.getCapabilities();
      const hasTorch = capabilities.torch === true;

      setTorchSupported(hasTorch);
      logger.debug('Torch support checked', { hasTorch });
    } catch (err) {
      logger.warn('Failed to check torch support', err);
    }
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !torchSupported) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;

      await videoTrack.applyConstraints({
        advanced: [{ torch: !torchEnabled } as any],
      });

      setTorchEnabled(!torchEnabled);
      toast({
        title: torchEnabled ? 'Torch Off' : 'Torch On',
        description: torchEnabled ? 'Flashlight turned off' : 'Flashlight turned on',
      });
    } catch (err) {
      logger.error('Failed to toggle torch', err);
      toast({
        title: 'Torch Error',
        description: 'Failed to control flashlight',
        variant: 'destructive',
      });
    }
  }, [torchEnabled, torchSupported, toast]);

  // ============================================================================
  // Image Capture
  // ============================================================================

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert canvas to blob'));
          },
          'image/jpeg',
          0.9
        );
      });

      // Analyze image quality
      const metadata = await analyzeImageQuality(canvas);

      // Create captured image object
      const capturedImage: CapturedImage = {
        id: crypto.randomUUID(),
        blob,
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        timestamp: Date.now(),
        metadata,
      };

      // Validate image quality
      if (metadata.brightness < 30) {
        toast({
          title: 'Low Light Warning',
          description: 'Image may be too dark. Consider using torch or better lighting.',
          variant: 'destructive',
        });
      }

      if (metadata.blur > 70) {
        toast({
          title: 'Blurry Image',
          description: 'Image appears blurry. Please hold camera steady.',
          variant: 'destructive',
        });
      }

      onImageCaptured(capturedImage);
      logger.info('Image captured successfully', { metadata });

    } catch (err) {
      const muzzleError: MuzzleError = {
        code: MuzzleErrorCode.IMAGE_QUALITY_TOO_LOW,
        message: 'Failed to capture image',
        messageAm: 'ምስል መያዣት አልተሳካም',
        retryable: true,
      };

      setError(muzzleError);
      onError(muzzleError);
      logger.error('Image capture failed', err);
    } finally {
      setIsCapturing(false);
    }
  }, [isStreaming, onImageCaptured, onError, toast]);

  // ============================================================================
  // Image Quality Analysis
  // ============================================================================

  const analyzeImageQuality = useCallback(async (canvas: HTMLCanvasElement): Promise<ImageMetadata> => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    const avgBrightness = totalBrightness / (data.length / 4);

    // Simple blur detection using edge detection
    let edgeStrength = 0;
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        const gx = -data[idx - 4] + data[idx + 4] - 2 * data[idx];
        const gy = -data[idx - canvas.width * 4] + data[idx + canvas.width * 4] - 2 * data[idx];
        edgeStrength += Math.sqrt(gx * gx + gy * gy);
      }
    }
    const avgEdgeStrength = edgeStrength / ((canvas.width - 2) * (canvas.height - 2));
    const blurScore = Math.max(0, 100 - avgEdgeStrength / 10);

    // Determine distance based on content analysis (simplified)
    const distance = avgBrightness > 80 ? 'too_close' : avgBrightness < 40 ? 'too_far' : 'optimal';
    const lighting = avgBrightness > 70 ? 'good' : avgBrightness > 40 ? 'acceptable' : 'poor';

    return {
      width: canvas.width,
      height: canvas.height,
      brightness: Math.round(avgBrightness),
      blur: Math.round(blurScore),
      distance,
      lighting,
      motion: false, // Would need frame comparison for motion detection
    };
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    if (facingMode && !disabled) {
      startCamera();
    }
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera, disabled]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Capture Muzzle Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />

          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Initializing camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={captureImage}
            disabled={!isStreaming || isCapturing || disabled}
            className="flex-1"
          >
            {isCapturing ? 'Capturing...' : 'Capture Image'}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={switchCamera}
            disabled={!isStreaming || disabled}
            title="Switch Camera"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {torchSupported && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTorch}
              disabled={!isStreaming || disabled}
              title={torchEnabled ? 'Turn Off Torch' : 'Turn On Torch'}
            >
              {torchEnabled ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Position the camera 30-50cm from the animal's muzzle</p>
          <p>• Ensure good lighting for clear image capture</p>
          <p>• Hold camera steady to avoid blur</p>
          {deviceCapability?.isLowPowerMode && (
            <p className="text-amber-600">• Low power mode detected - image quality may be reduced</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCapture;