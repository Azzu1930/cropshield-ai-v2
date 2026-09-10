// Client-side image compression & optimization to save Supabase free storage and network bandwidth

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImage(file: File, maxDimension: number = 1280, quality: number = 0.82): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // If not an image file
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not create canvas context'));
        }

        // Draw image (this naturally strips EXIF metadata)
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression failed'));
            }

            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL('image/jpeg', quality);

            resolve({
              file: optimizedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: optimizedFile.size,
              width,
              height,
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
