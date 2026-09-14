/**
 * Converts a File object to a Base64 encoded string.
 * Resizes large images (max 1600px) and compresses to ensure fast, reliable API transfers.
 * @param file The File object to convert.
 * @returns A Promise that resolves with the Base64 data URL.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error("Failed to read file"));
        return;
      }

      // If not an image or SVG, return as-is
      if (!file.type.startsWith('image/') || file.type.includes('svg')) {
        resolve(result);
        return;
      }

      // Resize and optimize image to avoid giant payloads
      const img = new Image();
      img.onload = () => {
        const MAX_DIMENSION = 1600;
        let { width, height } = img;

        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size < 1024 * 1024) {
          // Image is already reasonably sized, use original data URL
          resolve(result);
          return;
        }

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to high-quality JPEG for optimal transfer size & speed
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(optimizedDataUrl);
      };

      img.onerror = () => {
        // Fallback to raw data url if image element fails
        resolve(result);
      };

      img.src = result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Loads an image from a given source URL and returns an HTMLImageElement.
 * @param src The source URL of the image.
 * @returns A Promise that resolves with the loaded HTMLImageElement.
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
};