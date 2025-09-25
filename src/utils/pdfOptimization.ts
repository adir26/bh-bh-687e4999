// PDF Optimization utilities for keeping file sizes ≤2MB

export interface ImageCompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp';
}

/**
 * Compress image file to reduce PDF size
 */
export const compressImage = async (
  file: File, 
  options: ImageCompressionOptions = {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    format: 'jpeg'
  }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
      
      if (ratio < 1) {
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const compressedDataUrl = canvas.toDataURL(mimeType, options.quality);
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Estimate PDF content size and recommend optimizations
 */
export const analyzePDFSize = (proposalData: any): {
  estimatedSize: number;
  recommendations: string[];
  shouldCompress: boolean;
} => {
  let estimatedSize = 50000; // Base PDF size in bytes
  const recommendations: string[] = [];
  
  // Add size for text content
  const textContent = JSON.stringify(proposalData).length;
  estimatedSize += textContent * 2; // Rough text size multiplier
  
  // Add size for items (tables)
  estimatedSize += proposalData.items?.length * 1000 || 0;
  
  // Check for long descriptions
  const hasLongDescriptions = proposalData.items?.some((item: any) => 
    item.description && item.description.length > 200
  );
  
  if (hasLongDescriptions) {
    estimatedSize += 20000;
    recommendations.push('קיימים תיאורים ארוכים - שקול לקצר אותם לחיסכון בנפח');
  }
  
  // Check for excessive notes/terms
  const notesLength = (proposalData.notes || '').length + (proposalData.terms || '').length;
  if (notesLength > 1000) {
    estimatedSize += notesLength * 3;
    recommendations.push('הערות ותנאים ארוכים - שקול לקצר או לפצל לנספח');
  }
  
  const shouldCompress = estimatedSize > 1500000; // 1.5MB threshold
  
  if (shouldCompress) {
    recommendations.push('הקובץ עלול להיות גדול מ-2MB - מומלץ לקצר תוכן או לדחוס תמונות');
  }
  
  return {
    estimatedSize,
    recommendations,
    shouldCompress
  };
};

/**
 * Optimize text content for smaller PDF size
 */
export const optimizeTextContent = (text: string): string => {
  if (!text) return text;
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit line length for better PDF compression
    .replace(/(.{100}[^\s]*)\s+/g, '$1\n')
    // Remove empty lines
    .replace(/\n\s*\n/g, '\n');
};

/**
 * Format numbers efficiently for Hebrew locale
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return `₪${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₪${(amount / 1000).toFixed(1)}K`;
  }
  return `₪${amount.toLocaleString('he-IL', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Generate optimized PDF settings based on content
 */
export const getPDFOptimizationSettings = (proposalData: any) => {
  const analysis = analyzePDFSize(proposalData);
  
  return {
    // Font size adjustments for size optimization
    fontSize: analysis.shouldCompress ? 10 : 11,
    
    // Padding adjustments
    padding: analysis.shouldCompress ? 25 : 35,
    
    // Line height for better text density
    lineHeight: analysis.shouldCompress ? 1.2 : 1.4,
    
    // Image quality settings
    imageQuality: analysis.shouldCompress ? 0.7 : 0.85,
    
    // Table density
    tablePadding: analysis.shouldCompress ? 6 : 10,
    
    // Content optimization
    useCompactCurrency: analysis.shouldCompress,
    optimizeText: analysis.shouldCompress,
    
    analysis
  };
};
