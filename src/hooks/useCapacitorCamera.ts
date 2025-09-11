import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';
import { toast } from 'sonner';

interface UseCapacitorCameraReturn {
  takePhoto: () => Promise<File | null>;
  selectFromGallery: () => Promise<File | null>;
  isNative: boolean;
  isLoading: boolean;
}

export function useCapacitorCamera(): UseCapacitorCameraReturn {
  const [isLoading, setIsLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const convertImageToFile = async (imageData: string, fileName: string): Promise<File> => {
    const response = await fetch(imageData);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/jpeg' });
  };

  const takePhoto = async (): Promise<File | null> => {
    if (!isNative) {
      toast.error('Camera is only available in the mobile app');
      return null;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        const fileName = `photo_${Date.now()}.jpg`;
        const file = await convertImageToFile(image.dataUrl, fileName);
        return file;
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error('Failed to take photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<File | null> => {
    if (!isNative) {
      toast.error('Photo library access is only available in the mobile app');
      return null;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        const fileName = `gallery_${Date.now()}.jpg`;
        const file = await convertImageToFile(image.dataUrl, fileName);
        return file;
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      toast.error('Failed to select photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    takePhoto,
    selectFromGallery,
    isNative,
    isLoading
  };
}