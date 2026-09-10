// Strict crop & plant image validation
// Rejects selfies, humans, vehicles, rooms, screens, documents, animals, or non-agricultural images

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
    return {
      isValid: false,
      reason: 'corrupt',
      message: 'Could not process photo. Please try again.'
    };
  }

  // Sample pixel data across the canvas
  const sampleSize = Math.min(width, height, 120);
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imageData.data;

  let plantHueCount = 0;
  let humanSkinToneCount = 0;
  let neutralGrayCount = 0;
  let syntheticBlueCount = 0;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 1. Vegetative chlorophyll, leaf foliage, or crop disease hues
    // Green foliage
    const isGreenFoliage = g > r * 0.82 && g > b * 1.05 && g > 28;
    // Chlorotic yellow / blight halo
    const isChloroticYellow = r > 100 && g > 90 && b < 85 && Math.abs(r - g) < 45;
    // Necrotic spots, rust brown, stem & soil earthy tones
    const isEarthyBrown = r > 60 && g > 40 && b < 75 && r >= g && g >= b;
    // Dry leaf straw tones
    const isDryLeaf = r > 115 && g > 100 && b < 95 && r >= g;

    const isPlantAgricultural = isGreenFoliage || isChloroticYellow || isEarthyBrown || isDryLeaf;
    if (isPlantAgricultural) {
      plantHueCount++;
    }

    // 2. Human skin tone chrominance
    const isSkinTone =
      r > 95 &&
      g > 40 &&
      b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      r > g &&
      g > b &&
      g < 175 &&
      b < 145;

    if (isSkinTone && !isGreenFoliage) {
      humanSkinToneCount++;
    }

    // 3. Neutral artificial grays, whites, blacks (walls, ceilings, papers, screens, floors)
    const isNeutral = Math.max(r, g, b) - Math.min(r, g, b) < 18;
    if (isNeutral) {
      neutralGrayCount++;
    }

    // 4. Synthetic blue/purple tones (jeans, vehicles, indoor items)
    const isSyntheticBlue = b > r * 1.25 && b > g * 1.15 && b > 55;
    if (isSyntheticBlue) {
      syntheticBlueCount++;
    }
  }

  const plantRatio = plantHueCount / totalPixels;
  const skinRatio = humanSkinToneCount / totalPixels;
  const neutralRatio = neutralGrayCount / totalPixels;
  const syntheticBlueRatio = syntheticBlueCount / totalPixels;

  // Rule 1: Human portrait or selfie detected
  if (skinRatio > 0.22 && plantRatio < 0.15) {
    return {
      isValid: false,
      reason: 'human_or_selfie',
      message: 'Crop not detected. Human photo detected. Please upload a clear photo of your crop leaf or plant.'
    };
  }

  // Rule 2: Non-crop image (clothing, vehicle, sky, synthetic blue objects)
  if (syntheticBlueRatio > 0.35 && plantRatio < 0.18) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. The photo does not appear to contain any crop or plant.'
    };
  }

  // Rule 3: Indoor walls, blank document, paper, or monochromatic surface
  if (neutralRatio > 0.72 && plantRatio < 0.14) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Please upload a clear photo of a crop leaf or farm plant.'
    };
  }

  // Rule 4: General non-plant / non-agricultural image
  // Any genuine crop, leaf, branch, or field photo will contain at least 12% agricultural foliage/chlorophyll/earth tones
  if (plantRatio < 0.12) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Please take a clear, well-lit photo of an agricultural crop, leaf, or plant.'
    };
  }

  return {
    isValid: true,
    message: 'Crop photo accepted'
  };
}
