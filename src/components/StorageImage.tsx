import React from 'react';
import { SafeImage } from '@/utils/imageErrorHandling';
import { useStorageImage } from '@/hooks/useStorageImage';
import placeholderImage from '@/assets/placeholder.jpg';

interface StorageImageProps {
  path: string;
  alt: string;
  isPublic?: boolean;
  className?: string;
  containerClassName?: string;
  imgClassName?: string;
  showLoader?: boolean;
  fallbackSrc?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Component for displaying Supabase storage images with stable URLs
 */
export const StorageImage: React.FC<StorageImageProps> = ({
  path,
  alt,
  isPublic = true,
  className = '',
  containerClassName = '',
  imgClassName = '',
  showLoader = true,
  fallbackSrc = placeholderImage,
  onLoad,
  onError,
}) => {
  const { data: imageUrl, isLoading, error } = useStorageImage({ 
    path, 
    isPublic, 
    enabled: !!path 
  });

  if (isLoading) {
    return (
      <div className={`${containerClassName || className} relative`}>
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <SafeImage
        src={fallbackSrc}
        alt={alt}
        className={className}
        containerClassName={containerClassName}
        imgClassName={imgClassName}
        showLoader={false}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  return (
    <SafeImage
      src={imageUrl}
      alt={alt}
      className={className}
      containerClassName={containerClassName}
      imgClassName={imgClassName}
      showLoader={showLoader}
      fallbackSrc={fallbackSrc}
      onLoad={onLoad}
      onError={onError}
    />
  );
};