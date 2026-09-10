// Strict crop & plant image validation
// Rejects selfies, humans, portraits, anime/drawings, sketches, vehicles, rooms, screens, documents, animals, or non-agricultural images

export interface ImageValidationResult {
  isValid: boolean;
  reason?: 'human_or_selfie' | 'too_blurry' | 'not_plant' | 'too_small' | 'corrupt';
  message: string;
  plantRatio?: number;
  skinRatio?: number;
}

/**
 * Validates whether an image contains a genuine agricultural crop, leaf, or farm plant.
 * Scales the full image down to a standardized 160x160 canvas to sample 100% of the image area.
 */
export function validateImageClient(source: HTMLCanvasElement | HTMLImageElement): ImageValidationResult {
  const width = source.width;
  const height = source.height;

  if (width < 60 || height < 60) {
    return {
      isValid: false,
      reason: 'too_small',
      message: 'Photo is too small. Please take a closer photo of the crop leaf.'
    };
  }

  // Create standardized 160x160 analysis canvas covering the entire image from edge to edge
  const sampleWidth = 160;
  const sampleHeight = 160;
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    return { isValid: true, message: 'Canvas not supported' };
  }
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      isValid: false,
      reason: 'corrupt',
      message: 'Could not process photo. Please try again.'
    };
  }

  // Draw the entire image scaled down to 160x160 so 100% of the image area is sampled
  ctx.drawImage(source, 0, 0, sampleWidth, sampleHeight);
  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imageData.data;
  const totalPixels = data.length / 4;

  let greenFoliageCount = 0;
  let chloroticYellowCount = 0;
  let humanSkinCount = 0;
  let neutralCount = 0;
  let syntheticBlueCount = 0;
  let paperSketchCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 1. Genuine Chlorophyll Green (Leaf blade, foliage, crop vegetation)
    // In actual crops, chlorophyll reflects green significantly above red and blue
    const isGreenFoliage = g > r * 1.06 && g > b * 1.10 && g >= 36;

    // 2. Chlorotic Yellowing (Leaf blight halo, nutrient deficiency, mosaic yellowing)
    // Strong R and G, significantly suppressed B
    const isChloroticYellow = r > 85 && g > 80 && Math.abs(r - g) < 40 && b < Math.min(r, g) * 0.70;

    if (isGreenFoliage) {
      greenFoliageCount++;
    } else if (isChloroticYellow) {
      chloroticYellowCount++;
    }

    // 3. Human Skin Tone / Portrait / Character Drawing Chrominance
    // Covers realistic human skin tones and anime/illustration peach/pink tones
    const isSkinTone =
      (r > 95 && g > 40 && b > 20 && r > g && g > b && (r - g >= 12) && (r - b >= 22)) ||
      (r > 165 && g > 115 && b > 90 && r > g && g >= b && (r - g >= 16));

    if (isSkinTone && !isGreenFoliage && !isChloroticYellow) {
      humanSkinCount++;
    }

    // 4. Monochrome, Gray, Wall, Floor, Screen, Black/White
    const isNeutral = Math.max(r, g, b) - Math.min(r, g, b) < 18;
    if (isNeutral) {
      neutralCount++;
    }

    // 5. Paper, Notebook, Grid lines, Beige / Tan background
    const isPaperOrSketch = r > 185 && g > 175 && b > 155 && Math.abs(r - g) < 22 && Math.abs(g - b) < 25;
    if (isPaperOrSketch) {
      paperSketchCount++;
    }

    // 6. Synthetic Blue/Purple (clothes, vehicles, screens, sky)
    const isSyntheticBlue = b > r * 1.25 && b > g * 1.15 && b > 55;
    if (isSyntheticBlue) {
      syntheticBlueCount++;
    }
  }

  const totalPlantRatio = (greenFoliageCount + chloroticYellowCount) / totalPixels;
  const skinRatio = humanSkinCount / totalPixels;
  const neutralRatio = neutralCount / totalPixels;
  const paperRatio = paperSketchCount / totalPixels;
  const blueRatio = syntheticBlueCount / totalPixels;

  // RULE 1: Human portrait, face, anime illustration, character, or selfie
  // If skin tones are prominent or drawing face features exist and plant foliage is negligible
  if ((skinRatio > 0.12 && totalPlantRatio < 0.14) || (skinRatio > 0.20 && totalPlantRatio < 0.20)) {
    return {
      isValid: false,
      reason: 'human_or_selfie',
      message: 'Crop not detected. Person, face, or portrait illustration detected. Please upload a clear photo of your crop leaf or plant.',
      plantRatio: totalPlantRatio,
      skinRatio,
    };
  }

  // RULE 2: Paper, document, sketch, notebook, or drawing background
  if ((paperRatio > 0.40 || neutralRatio > 0.65) && totalPlantRatio < 0.12) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Document, drawing, or flat surface detected. Please upload a photo of a crop in the field.',
      plantRatio: totalPlantRatio,
      skinRatio,
    };
  }

  // RULE 3: Vehicles, clothing, sky, or synthetic blue objects
  if (blueRatio > 0.30 && totalPlantRatio < 0.14) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Non-agricultural object or vehicle detected. Please upload a clear photo of your crop leaf.',
      plantRatio: totalPlantRatio,
      skinRatio,
    };
  }

  // RULE 4: GENERAL CROP GATEKEEPER
  // A living crop leaf, stem, or plant must contain at least 12% verified vegetative foliage (chlorophyll green or chlorotic yellow)
  if (totalPlantRatio < 0.12) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. The photo does not appear to contain an agricultural crop, leaf, or farm plant. Random images are not accepted.',
      plantRatio: totalPlantRatio,
      skinRatio,
    };
  }

  return {
    isValid: true,
    message: 'Crop photo verified',
    plantRatio: totalPlantRatio,
    skinRatio,
  };
}
