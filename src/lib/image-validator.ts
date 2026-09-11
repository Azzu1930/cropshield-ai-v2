// Accurate multi-crop image validator & gatekeeper engine
// Accurately validates genuine agricultural crops (leaves, foliage, pods, seeds, grains, fruits, vegetables, stems, roots, tubers, and disease lesions)
// Strictly rejects anime characters, cartoons, drawings, digital illustrations, human selfies/faces, pets, vehicles, screens, documents, and random non-agricultural images

export interface ImageValidationResult {
  isValid: boolean;
  reason?: 'human_or_selfie' | 'drawing_or_cartoon' | 'too_blurry' | 'not_plant' | 'too_small' | 'corrupt';
  message: string;
  plantRatio?: number;
  skinRatio?: number;
}

/**
 * Validates whether an image contains a genuine agricultural crop, leaf, pod, grain, fruit, or farm plant.
 * Rejects drawings, anime, cartoons, selfies, persons, documents, and non-plant objects.
 */
export function validateImageClient(
  source: HTMLCanvasElement | HTMLImageElement,
  cropHint?: string
): ImageValidationResult {
  const width = source.width;
  const height = source.height;

  if (width < 60 || height < 60) {
    return {
      isValid: false,
      reason: 'too_small',
      message: 'Photo is too small. Please take a closer photo of your crop.'
    };
  }

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

  // Draw scaled down to sample 100% of the image area
  ctx.drawImage(source, 0, 0, sampleWidth, sampleHeight);
  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imageData.data;
  const totalPixels = data.length / 4;

  const hint = (cropHint || '').toLowerCase();
  const isPodOrTuberCrop =
    hint.includes('groundnut') ||
    hint.includes('peanut') ||
    hint.includes('potato') ||
    hint.includes('వేరుశనగ') ||
    hint.includes('మూంగఫలీ') ||
    hint.includes('मूंगफली');

  let greenFoliageCount = 0;
  let chloroticYellowCount = 0;
  let podHuskSoilCount = 0;
  let cropNecrosisRotCount = 0;
  let fruitRedPurpleCount = 0;
  let humanFaceSkinCount = 0;
  let syntheticColorCount = 0;
  let paperDocumentCount = 0;
  let darkInkLineCount = 0;

  // 15-bit color space quantization to detect digital drawings / anime / cell-shading vs real camera sensor noise
  const uniqueColorBins = new Set<number>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Quantize 5 bits per channel (32 levels each -> 32,768 possible bins)
    const colorKey = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    uniqueColorBins.add(colorKey);

    // 1. Chlorophyll Green Foliage (Leaves, stems, vegetative canopy)
    const isGreenFoliage = g > r * 1.06 && g > b * 1.08 && g >= 32;

    // 2. Chlorotic Leaf Yellowing (Yellowing leaf lesions, senescence, golden cereal grain)
    // Real leaf chlorosis has R and G very close, and B significantly lower
    const isChloroticYellow =
      r > 85 &&
      g > 80 &&
      Math.abs(r - g) <= 35 &&
      b < Math.min(r, g) * 0.70;

    // 3. Pods, Seeds, Tubers, and Field Soil (Earthy tan, ochre, khaki)
    // ONLY counted if the crop is Groundnut, Peanut, or Tuber
    const isPodOrHusk =
      isPodOrTuberCrop &&
      r >= 95 && r <= 185 &&
      g >= 75 && g <= 145 &&
      b >= 45 && b <= 110 &&
      r > g && g > b &&
      (r - g >= 12 && r - g <= 50) &&
      (g - b >= 15 && g - b <= 50) &&
      (r - b <= 80);

    // 4. Crop Lesions, Necrosis, and Fungal Rot (Dark leaf spots, anthracnose, pod rot)
    const isNecrosisOrRot =
      r < 85 && g < 80 && b < 72 &&
      Math.abs(r - g) < 22 && Math.abs(g - b) < 22 &&
      (r + g + b > 35) &&
      (r + g + b < 190);

    // 5. Vegetable & Fruit Pigments (Ripe tomatoes, red chillies)
    const isFruitOrFlower =
      (r > 125 && r > g * 1.35 && r > b * 1.35) ||
      (r > 75 && b > 75 && g < Math.min(r, b) * 0.85);

    if (isGreenFoliage) {
      greenFoliageCount++;
    } else if (isChloroticYellow) {
      chloroticYellowCount++;
    } else if (isPodOrHusk) {
      podHuskSoilCount++;
    } else if (isNecrosisOrRot) {
      cropNecrosisRotCount++;
    } else if (isFruitOrFlower) {
      fruitRedPurpleCount++;
    }

    // 6. Computer Vision Standard YCbCr Skin Tone Detection (Selfies, portraits, human faces, anime/cartoon skin)
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    const isSkinYCbCr = cr >= 135 && cr <= 180 && cb >= 80 && cb <= 135 && y >= 50;
    const isSkinRGB = r > 110 && g > 70 && b > 50 && r > g + 15 && g > b + 10 && (r - b >= 35);

    if ((isSkinYCbCr || isSkinRGB) && !isGreenFoliage && !isNecrosisOrRot) {
      humanFaceSkinCount++;
    }

    // 7. Synthetic Non-Plant Colors (Vehicles, plastics, headphones, neon, synthetic blues)
    const isSyntheticBlue = b > r * 1.35 && b > g * 1.25 && b > 65;
    const isSyntheticPlasticRed = r > 170 && g < 50 && b < 50;
    if (isSyntheticBlue || isSyntheticPlasticRed) {
      syntheticColorCount++;
    }

    // 8. Plain White Document / Paper / Graph Paper Grid
    const isPaperOrScreen =
      r > 215 && g > 215 && b > 210 &&
      Math.abs(r - g) < 12 && Math.abs(g - b) < 12;
    if (isPaperOrScreen) {
      paperDocumentCount++;
    }

    // 9. Sharp Dark Ink Outlines (Anime, manga, cartoons, line drawings)
    if (r < 50 && g < 50 && b < 50) {
      darkInkLineCount++;
    }
  }

  const greenRatio = greenFoliageCount / totalPixels;
  const chloroticRatio = chloroticYellowCount / totalPixels;
  const podRatio = podHuskSoilCount / totalPixels;
  const necrosisRatio = cropNecrosisRotCount / totalPixels;
  const fruitRatio = fruitRedPurpleCount / totalPixels;
  const skinRatio = humanFaceSkinCount / totalPixels;
  const syntheticRatio = syntheticColorCount / totalPixels;
  const paperRatio = paperDocumentCount / totalPixels;
  const inkLineRatio = darkInkLineCount / totalPixels;
  const uniqueColors = uniqueColorBins.size;

  const totalAgriculturalRatio =
    greenRatio + chloroticRatio + (isPodOrTuberCrop ? podRatio : 0) + fruitRatio + necrosisRatio;

  // =========================================================================
  // GATEKEEPER 1: HUMAN SELFIE, PORTRAIT, FACE, OR CHARACTER
  // =========================================================================
  if (skinRatio > 0.09 && greenRatio < 0.05 && fruitRatio < 0.05) {
    return {
      isValid: false,
      reason: 'human_or_selfie',
      message: 'Crop not detected. Person, face, or portrait illustration detected. Please upload a clear photo of your crop leaf or plant.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // =========================================================================
  // GATEKEEPER 2: DIGITAL DRAWING, ANIME, CARTOON, MANGA, OR LINE ART
  // Real camera photos of crops in sunlight have continuous micro-gradients (>900 unique color shades).
  // Flat-shaded anime, drawings, and cartoons have low color variety or heavy ink outlines.
  // =========================================================================
  if (
    (uniqueColors < 450 && greenRatio < 0.08 && fruitRatio < 0.06) ||
    (inkLineRatio > 0.08 && greenRatio < 0.05 && fruitRatio < 0.05)
  ) {
    return {
      isValid: false,
      reason: 'drawing_or_cartoon',
      message: 'Crop not detected. Drawing, anime, cartoon, or illustration detected. Please upload a real camera photo of your crop in the field.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // =========================================================================
  // GATEKEEPER 3: DOCUMENT, PAPER SKETCH, GRAPH PAPER, OR BLANK SURFACE
  // =========================================================================
  if (paperRatio > 0.45 && greenRatio < 0.05 && fruitRatio < 0.05) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Document, graph paper, or flat surface detected. Please upload a photo of your field crop.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // =========================================================================
  // GATEKEEPER 4: SYNTHETIC OBJECT, VEHICLE, PLASTIC, OR ELECTRONIC SCREEN
  // =========================================================================
  if (syntheticRatio > 0.22 && greenRatio < 0.05 && fruitRatio < 0.05) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Non-agricultural object, vehicle, or screen detected. Please upload a clear photo of your crop.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // =========================================================================
  // GATEKEEPER 5: FOLIAGE & PLANT CROP CONSISTENCY CHECK
  // Maize, Rice, Tomato, Chilli, Cotton are foliage/plant crops.
  // A genuine photo of these crops MUST contain leaves, foliage, or fruit!
  // =========================================================================
  const isFoliageCrop = !isPodOrTuberCrop;
  if (
    isFoliageCrop &&
    greenRatio < 0.04 &&
    chloroticRatio < 0.06 &&
    fruitRatio < 0.05 &&
    necrosisRatio < 0.04
  ) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. No agricultural leaves, foliage, or plant features were found. Random photos are not accepted.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // =========================================================================
  // GATEKEEPER 6: GENERAL AGRICULTURAL EVIDENCE THRESHOLD
  // =========================================================================
  if (totalAgriculturalRatio < 0.10) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. The photo does not appear to contain an agricultural crop, leaf, pod, or plant. Random images are not accepted.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  return {
    isValid: true,
    message: 'Crop photo verified',
    plantRatio: totalAgriculturalRatio,
    skinRatio,
  };
}

