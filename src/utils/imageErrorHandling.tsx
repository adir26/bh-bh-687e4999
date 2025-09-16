import React, { useState, useRef, useCallback, useMemo } from 'react';
import placeholderImage from '@/assets/placeholder.jpg';

/**
 * Enhanced image component with error handling and loading states
 */
interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showLoader?: boolean;
  containerClassName?: string;
  imgClassName?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc = placeholderImage,
  showLoader = false,
  containerClassName = '',
  imgClassName = '',
  onError,
  onLoad,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(showLoader);
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Memoize current src to prevent unnecessary re-renders
  const currentSrc = useMemo(() => {
    if (hasError && fallbackSrc) return fallbackSrc;
    return src;
  }, [src, hasError, fallbackSrc]);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    
    // Prevent infinite error loop
    if (!hasError && fallbackSrc && loadAttempts < 2) {
      setHasError(true);
      setLoadAttempts(prev => prev + 1);
    }
    
    onError?.(event);
  }, [hasError, fallbackSrc, loadAttempts, onError]);

  // Reset error state when src changes
  React.useEffect(() => {
    if (src && src !== currentSrc && !src.includes('blob:')) {
      setHasError(false);
      setLoadAttempts(0);
      setIsLoading(showLoader);
    }
  }, [src, showLoader]);

  return (
    <div className={`relative ${containerClassName || className}`}>
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${imgClassName || className} ${isLoading && showLoader ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

/**
 * Hook for handling image loading errors
 */
export const useImageErrorHandler = (initialSrc: string, fallbackSrc: string = placeholderImage) => {
  const [src, setSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setSrc(fallbackSrc);
    }
  };

  const resetSrc = (newSrc: string) => {
    setSrc(newSrc);
    setHasError(false);
  };

  return { src, handleError, resetSrc, hasError };
};

/**
 * Utility function to create image error handler
 */
export const createImageErrorHandler = (fallbackSrc: string = placeholderImage) => {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    if (target.src !== fallbackSrc) {
      target.src = fallbackSrc;
    }
  };
};

/**
 * Preload images to avoid loading delays
 */
export const preloadImages = (urls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(
    urls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
};

/**
 * Check if an image URL is valid
 */
export const isValidImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};