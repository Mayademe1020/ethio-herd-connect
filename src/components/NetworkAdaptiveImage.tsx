// NetworkAdaptiveImage.tsx - Network-aware image with automatic quality selection

import { useMemo } from 'react';
import { NetworkAwareImage } from './NetworkAwareImage';
import { getLowQualityImageUrl, getHighQualityImageUrl } from '@/utils/performance';

interface NetworkAdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  onLoad?: () => void;
}

export const NetworkAdaptiveImage = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  onLoad
}: NetworkAdaptiveImageProps) => {
  // Generate low quality version for slow networks
  const lowQualitySrc = useMemo(() => {
    if (!src) return undefined;
    return getLowQualityImageUrl(src);
  }, [src]);

  // The high quality src for fast networks
  const highQualitySrc = useMemo(() => {
    if (!src) return undefined;
    return getHighQualityImageUrl(src);
  }, [src]);

  // For fast networks, use high quality; for slow networks use low quality
  return (
    <NetworkAwareImage
      src={highQualitySrc || src}
      lowQualitySrc={lowQualitySrc}
      alt={alt}
      className={className}
      fallbackIcon={fallbackIcon}
      onLoad={onLoad}
    />
  );
};