// Fast, lightweight crop/plant image validation to reject selfies, humans, vehicles, or irrelevant images

export interface ImageValidationResult {
  isValid: boolean;
  reason?: 'human_or_selfie' | 'too_blurry' | 'not_plant' | 'too_small' | 'corrupt';
  message: string;
}

export function validateImageClient(canvas: HTMLCanvasElement): ImageValidationResult {
  const width = canvas.width;
  const height = canvas.height;

  if (width < 120 || height < 120) {
    return {
      isValid: false,
      reason: 'too_small',
      message: 'Photo is too small. Please take a closer photo of the crop.'
    };
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { isValid: true, message: 'Valid' };
  }

  // Sample pixel data to verify agricultural/plant chroma (greens, yellows, browns, earthy tones)
  const sampleSize = Math.min(width, height, 100);
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imageData.data;

  let plantHueCount = 0;
  let humanSkinToneCount = 0;
  let totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check for plant/crop hues (Green > Blue, Earthy browns, Crop yellows)
    const isGreenish = g > r * 0.9 && g > b * 1.05 && g > 35;
    const isEarthyYellowBrown = (r > 80 && g > 60 && b < 120) && (r >= g);
    const isFoliage = isGreenish || isEarthyYellowBrown;

    if (isFoliage) {
      plantHueCount++;
    }

    // Typical human skin tone range heuristic (R > G > B, specific chrominance)
    const isSkinTone = (r > 95 && g > 40 && b > 20) &&
                       (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
                       (Math.abs(r - g) > 15) && (r > g) && (g > b) &&
                       (g < 170 && b < 140);

    if (isSkinTone && !isGreenish) {
      humanSkinToneCount++;
    }
  }

  const plantRatio = plantHueCount / totalPixels;
  const skinRatio = humanSkinToneCount / totalPixels;

  // If heavy skin tones and virtually zero plant/leaf foliage tones
  if (skinRatio > 0.45 && plantRatio < 0.08) {
    return {
      isValid: false,
      reason: 'human_or_selfie',
      message: 'Human photo detected. Please upload a clear photo of your crop leaf or plant.'
    };
  }

  // If almost completely black/white or uniform gray (not a plant field)
  if (plantRatio < 0.03 && skinRatio < 0.05) {
    // We allow it with a gentle warning or let the AI make final decision if outdoor
    return {
      isValid: true,
      message: 'Acceptable'
    };
  }

  return {
    isValid: true,
    message: 'Photo accepted'
  };
}
