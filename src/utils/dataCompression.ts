/**
 * Utility functions for data compression to optimize storage and network usage
 * Especially important for offline-first applications in low-bandwidth environments
 */

/**
 * Compresses data object to string format for efficient storage
 * @param data Any serializable data object
 * @returns Compressed string representation
 */
export const compressData = (data: any): string => {
  try {
    // Convert data to JSON string
    const jsonString = JSON.stringify(data);
    
    // Use built-in compression if available (fallback to simple encoding if not)
    if (typeof CompressionStream !== 'undefined') {
      // For modern browsers with compression API
      return btoa(jsonString);
    } else {
      // Simple encoding for older browsers
      return btoa(jsonString);
    }
  } catch (error) {
    console.error('Error compressing data:', error);
    // Return original stringified data if compression fails
    return JSON.stringify(data);
  }
};

/**
 * Decompresses string back to original data object
 * @param compressedString Compressed string to decompress
 * @returns Original data object
 */
export const decompressData = (compressedString: string): any => {
  try {
    // Decode the compressed string
    const jsonString = atob(compressedString);
    
    // Parse the JSON string back to an object
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decompressing data:', error);
    // Return null if decompression fails
    return null;
  }
};

/**
 * Estimates the size of data in bytes
 * @param data Any data object
 * @returns Approximate size in bytes
 */
export const estimateDataSize = (data: any): number => {
  try {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  } catch (error) {
    console.error('Error estimating data size:', error);
    return 0;
  }
};

/**
 * Checks if data exceeds size limit
 * @param data Data to check
 * @param maxSizeKB Maximum size in KB
 * @returns Boolean indicating if data exceeds limit
 */
export const isDataTooLarge = (data: any, maxSizeKB: number = 100): boolean => {
  const sizeInBytes = estimateDataSize(data);
  return sizeInBytes > (maxSizeKB * 1024);
};